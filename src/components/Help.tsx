import { HelpCircle, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "../lib/utils";
import React from "react";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-gray-100", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-6 font-medium transition-all hover:text-gray-900 [&[data-state=open]>svg]:rotate-180 text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-6 pt-0 text-gray-500 leading-relaxed", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export function Help() {
  const faqs = [
    {
      q: "Finora nedir?",
      a: "Finora, tüm dijital aboneliklerinizi tek bir yerden takip etmenizi, harcamalarınızı analiz etmenizi ve yaklaşan ödemelerden haberdar olmanızı sağlayan akıllı bir yönetim panelidir.",
    },
    {
      q: "Aboneliklerimi nasıl eklerim?",
      a: "Dashboard sayfasındaki 'Yeni Abonelik' butonuna tıklayarak platform adı, fiyat, döngü ve kategori bilgilerini girerek kolayca ekleme yapabilirsiniz.",
    },
    {
      q: "Harcama limitleri nasıl çalışır?",
      a: "Limitler sayfasından kendinize aylık bir bütçe belirleyebilirsiniz. Harcamalarınız bu limite yaklaştığında sistem sizi uyarır.",
    },
    {
      q: "Verilerim güvende mi?",
      a: "Evet, verileriniz modern şifreleme yöntemleri ile korunmaktadır. Finora, finansal güvenliğinizi en üst düzeyde tutar.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Yardım Merkezi</h1>
          <p className="text-gray-500 mt-1">Sıkça sorulan sorular ve kullanım ipuçları.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.div>
  );
}
