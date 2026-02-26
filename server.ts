import express from "express";
import { createServer as createViteServer } from "vite";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { prisma } from "./src/lib/prisma.ts";
import { z } from "zod";
import { addDays, addMonths, addYears } from "date-fns";

// Helper to calculate next payment date
const calculateNextPaymentDate = (startDate: Date, cycle: "MONTHLY" | "YEARLY") => {
  const now = new Date();
  let nextDate = new Date(startDate);
  
  // If start date is in the future, that's our first payment date
  if (nextDate > now) return nextDate;

  while (nextDate <= now) {
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
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Debug: Check environment variables (do not log secret values)
  console.log("Checking Environment Variables:");
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "Present" : "Missing");
  console.log("- CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "Present" : "Missing");
  console.log("- CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Present" : "Missing");

  app.use(express.json());
  
  if (process.env.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware());
  } else {
    console.warn("WARNING: CLERK_SECRET_KEY is missing. Auth middleware might not function correctly.");
  }

  // Middleware to ensure DATABASE_URL is present for API routes
  app.use("/api", (req, res, next) => {
    if (!process.env.DATABASE_URL && req.path !== "/health") {
      return res.status(500).json({
        success: false,
        error: "Veritabanı bağlantısı yapılandırılmamış (DATABASE_URL eksik).",
        code: "MISSING_DATABASE_URL"
      });
    }
    
    if (!process.env.CLERK_SECRET_KEY && req.path !== "/health") {
      return res.status(500).json({
        success: false,
        error: "Kimlik doğrulama yapılandırılmamış (CLERK_SECRET_KEY eksik).",
        code: "MISSING_CLERK_SECRET"
      });
    }
    next();
  });

  // Helper: Get or Create User in our DB from Clerk Auth
  const syncUser = async (clerkUserId: string) => {
    // For now, we'll just return the ID to use in subscriptions
    // In a real app, you might want to fetch user details from Clerk and save to your DB
    return clerkUserId;
  };

  // --- API ROUTES ---

  // GET: All Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: "Yetkisiz erişim" });
      }

      const { sortBy = "createdAt", order = "desc" } = req.query;

      const subscriptions = await prisma.subscription.findMany({
        where: { userId: userId },
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
      const auth = getAuth(req);
      const { userId: authUserId } = auth;
      const userId = authUserId || req.body.userId;

      if (!userId) {
        console.error("[AUTH ERROR] No userId found in request. Auth state:", {
          hasAuthUserId: !!authUserId,
          hasBodyUserId: !!req.body.userId,
          sessionId: auth.sessionId
        });
        return res.status(401).json({ 
          success: false, 
          error: "Yetkisiz erişim: Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın." 
        });
      }

      console.log(`[SUBSCRIPTION] Creating for user: ${userId}`, req.body);
      const validatedData = SubscriptionSchema.parse(req.body);
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
          userId: userId,
        },
      });

      console.log(`[SUBSCRIPTION] Successfully created: ${subscription.id}`);
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[VALIDATION ERROR]", error.issues);
        return res.status(400).json({ success: false, error: "Geçersiz form verisi", details: error.issues });
      }
      console.error("[POST Error] Full details:", error);
      res.status(500).json({ 
        success: false, 
        error: "Abonelik oluşturulamadı. Veritabanı bağlantısını kontrol edin." 
      });
    }
  });

  // PUT: Update Subscription
  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: "Yetkisiz erişim" });
      }

      const { id } = req.params;
      const validatedData = SubscriptionSchema.partial().parse(req.body);

      const subscription = await prisma.subscription.update({
        where: { id, userId: userId },
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
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ success: false, error: "Yetkisiz erişim" });
      }

      const { id } = req.params;
      await prisma.subscription.delete({
        where: { id, userId: userId },
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
      });

      console.log("--- YAKLAŞAN ÖDEMELER RAPORU ---");
      upcomingPayments.forEach((sub) => {
        console.log(`[BİLDİRİM] Kullanıcı ID: ${sub.userId}: ${sub.name} ödemesi yaklaşıyor!`);
        console.log(`Tarih: ${sub.nextPaymentDate?.toLocaleDateString("tr-TR")}, Tutar: ${sub.price} ${sub.currency}`);
        
        // TODO: Buraya Resend veya SendGrid e-posta entegrasyonu eklenecek.
        // Clerk API kullanılarak kullanıcının e-postası çekilebilir.
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
    res.json({ status: "ok", database: !!process.env.DATABASE_URL });
  });

  // 404 Handler for API routes
  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, error: `API rotası bulunamadı: ${req.method} ${req.path}` });
  });

  // Global Error Handler for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Sunucu tarafında bir hata oluştu.",
      code: err.code
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const path = await import("path");
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    
    // SPA Fallback: Serve index.html for all non-API routes
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
