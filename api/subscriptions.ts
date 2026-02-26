import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { addMonths, addYears } from "date-fns";

const prisma = new PrismaClient();

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

export default async function handler(req: any, res: any) {
  // Vercel Serverless Function Handler
  const { method } = req;

  try {
    if (method === "GET") {
      const { userId } = req.query; // Frontend'den query olarak alacağız
      if (!userId) return res.status(401).json({ success: false, error: "UserId gerekli" });
      
      const subs = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ success: true, data: subs });
    }

    if (method === "POST") {
      const validatedData = SubscriptionSchema.parse(req.body);
      const nextPaymentDate = calculateNextPaymentDate(validatedData.startDate, validatedData.cycle);

      const sub = await prisma.subscription.create({
        data: {
          ...validatedData,
          nextPaymentDate,
        },
      });
      return res.status(201).json({ success: true, data: sub });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
