import { z } from "zod";
import { addMonths, addYears } from "date-fns";
import { prisma } from "../src/lib/prisma";

const calculateNextPaymentDate = (startDate: Date, cycle: "MONTHLY" | "YEARLY") => {
  const now = new Date();
  let nextDate = new Date(startDate);
  if (nextDate > now) return nextDate;
  while (nextDate <= now) {
    if (cycle === "MONTHLY") nextDate = addMonths(nextDate, 1);
    else nextDate = addYears(nextDate, 1);
  }
  return nextDate;
};

const SubscriptionSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  currency: z.string(),
  cycle: z.enum(["MONTHLY", "YEARLY"]),
  startDate: z.string().pipe(z.coerce.date()),
  category: z.string(),
  userId: z.string(),
});

const parseBody = (body: unknown) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, error: "UserId query parametresi gerekli." });
      }

      const subs = await prisma.subscription.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, data: subs });
    } catch (error: any) {
      console.error("GET API Error:", error);
      return res.status(500).json({ success: false, error: "Abonelikler getirilemedi.", details: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const body = parseBody(req.body);
      const validatedData = SubscriptionSchema.parse(body);
      const nextPaymentDate = calculateNextPaymentDate(validatedData.startDate, validatedData.cycle);

      const sub = await prisma.subscription.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          currency: validatedData.currency,
          cycle: validatedData.cycle,
          category: validatedData.category,
          startDate: validatedData.startDate,
          userId: validatedData.userId,
          nextPaymentDate,
        },
      });

      return res.status(201).json({ success: true, data: sub });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: "Geçersiz veri formatı.", details: error.issues });
      }
      console.error("POST API Error:", error);
      return res.status(500).json({ success: false, error: "Abonelik oluşturulamadı.", details: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
