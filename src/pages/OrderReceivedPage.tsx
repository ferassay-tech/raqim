import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "../components/Helmet";
import { IconSuccess } from "../components/checkout/icons";

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string } | null)?.orderId;

  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-4 py-16 text-center"
    >
      <Helmet title="تم استلام طلبك — رقيم" url="https://r-aqim.com/order-received" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <IconSuccess className="h-24 w-24" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="max-w-md"
      >
        <h1 className="text-2xl font-semibold text-ink">
          شكرًا لك على شراءك
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          تم استلام طلب الدفع الخاص بك بنجاح. سنقوم بمراجعة الدفع وإرسال رابط
          التحميل إلى بريدك الإلكتروني في أقرب وقت ممكن.
        </p>
        {orderId && (
          <p className="mt-3 text-xs text-ink-faint" dir="ltr">
            رقم الطلب: {orderId}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link
          to="/"
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-beige transition hover:bg-gold-deep"
        >
          العودة للصفحة الرئيسية
        </Link>
        <Link
          to="/checkout"
          className="rounded-full border border-gold px-6 py-2.5 text-sm font-medium text-gold-deep transition hover:bg-beige"
        >
          متابعة التسوق
        </Link>
      </motion.div>
    </main>
  );
};

export default OrderSuccessPage;