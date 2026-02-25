import express from "express";
import { createServer as createViteServer } from "vite";
import { prisma } from "./src/lib/prisma.ts";
import { z } from "zod";
import { addDays, addMonths, addYears } from "date-fns";

// Helper to calculate next payment date
const calculateNextPaymentDate = (startDate: Date, cycle: "MONTHLY" | "YEARLY") => {
  const now = new Date();
  let nextDate = new Date(startDate);
  
  while (nextDate < now) {
    if (cycle === "MONTHLY") {
      nextDate = addMonths(nextDate, 1);
    } else {
      nextDate = addYears(nextDate, 1);
    }
  }
  return nextDate;
};

// Validation Schema
const SubscriptionSchema = z.object({
  name: z.string().min(1, "Platform adı zorunludur"),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  currency: z.string().length(1, "Para birimi simgesi (₺, $, €)"),
  cycle: z.enum(["MONTHLY", "YEARLY"]),
  startDate: z.string().pipe(z.coerce.date()),
  category: z.string().min(1, "Kategori zorunludur"),
  userId: z.string().uuid().optional(), // Opsiyonel, şimdilik default user kullanacağız
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper: Get or Create Default User (Simulating Auth)
  const getDefaultUser = async () => {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "demo@example.com",
          name: "Demo User",
        },
      });
    }
    return user;
  };

  // --- API ROUTES ---

  // GET: All Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const { sortBy = "createdAt", order = "desc" } = req.query;
      const user = await getDefaultUser();

      const subscriptions = await prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: {
          [sortBy as string]: order as "asc" | "desc",
        },
      });

      res.json({ success: true, data: subscriptions });
    } catch (error) {
      console.error("GET Error:", error);
      res.status(500).json({ success: false, error: "Abonelikler getirilemedi" });
    }
  });

  // POST: Create Subscription
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = SubscriptionSchema.parse(req.body);
      const user = await getDefaultUser();

      const nextPaymentDate = calculateNextPaymentDate(validatedData.startDate, validatedData.cycle);

      const subscription = await prisma.subscription.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          currency: validatedData.currency,
          cycle: validatedData.cycle,
          category: validatedData.category,
          startDate: validatedData.startDate,
          nextPaymentDate,
          user: { connect: { id: user.id } },
        },
      });

      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues });
      }
      console.error("POST Error:", error);
      res.status(500).json({ success: false, error: "Abonelik oluşturulamadı" });
    }
  });

  // PUT: Update Subscription
  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = SubscriptionSchema.partial().parse(req.body);

      const subscription = await prisma.subscription.update({
        where: { id },
        data: validatedData,
      });

      res.json({ success: true, data: subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues });
      }
      console.error("PUT Error:", error);
      res.status(500).json({ success: false, error: "Abonelik güncellenemedi" });
    }
  });

  // DELETE: Delete Subscription
  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.subscription.delete({
        where: { id },
      });

      res.json({ success: true, message: "Abonelik başarıyla silindi" });
    } catch (error) {
      console.error("DELETE Error:", error);
      res.status(500).json({ success: false, error: "Abonelik silinemedi" });
    }
  });

  // --- CRON JOB ROUTE ---
  app.get("/api/cron/check-payments", async (req, res) => {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    // Security Check
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret) {
        return res.status(500).json({ success: false, error: "CRON_SECRET is not configured on the server." });
      }
      if (authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
    }

    try {
      const today = new Date();
      const twoDaysLater = addDays(today, 2);

      const upcomingPayments = await prisma.subscription.findMany({
        where: {
          nextPaymentDate: {
            gte: today,
            lte: twoDaysLater,
          },
        },
        include: {
          user: true,
        },
      });

      console.log("--- YAKLAŞAN ÖDEMELER RAPORU ---");
      upcomingPayments.forEach((sub) => {
        console.log(`[BİLDİRİM] ${sub.user.name} (${sub.user.email}): ${sub.name} ödemesi yaklaşıyor!`);
        console.log(`Tarih: ${sub.nextPaymentDate?.toLocaleDateString("tr-TR")}, Tutar: ${sub.price} ${sub.currency}`);
        
        // TODO: Buraya Resend veya SendGrid e-posta entegrasyonu eklenecek.
        // await sendEmail(sub.user.email, "Ödeme Hatırlatıcı", ...);
      });
      console.log("--------------------------------");

      res.json({ 
        success: true, 
        message: `${upcomingPayments.length} adet yaklaşan ödeme tespit edildi.`,
        data: upcomingPayments 
      });
    } catch (error) {
      console.error("CRON Error:", error);
      res.status(500).json({ success: false, error: "Cron işlemi başarısız oldu" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    // Note: This block is for completeness; in this environment we mainly run dev
    const path = await import("path");
    app.use(express.static(path.resolve(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
