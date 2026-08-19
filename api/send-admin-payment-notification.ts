/**
 * Vercel serverless function — Phase 7: notifies opted-in admin users by
 * email when an order's payment has just been confirmed. Triggered only
 * from OrderDetailPage's handleConfirmPayment() after
 * OrdersContext.confirmPayment() has actually succeeded — never merely
 * from order.status === "paid".
 *
 * Entirely separate from send-download-email.ts (the customer's own
 * download-link email) and from send-admin-notification.ts (the
 * unrelated "an invitation needs your review" owner email) — distinct
 * audience, distinct trigger, distinct template, never merged.
 *
 * DUPLICATE-SEND PROTECTION (two layers, only the first is authoritative):
 * 1. order_notification_claims (order_id, notification_key) primary key —
 *    the real guard. This function's first write is an INSERT into that
 *    table; Postgres enforces the composite primary key atomically, so if
 *    two requests for the same order race each other, exactly one INSERT
 *    can ever succeed and the other fails deterministically with SQLSTATE
 *    23505 (unique_violation), observed here as
 *    error.code === "23505". That failing request returns immediately
 *    without ever calling Resend — no read-then-write window exists for
 *    it to slip through, unlike a "check timeline, then later record
 *    timeline" approach, which two concurrent requests can both pass the
 *    check on before either has recorded anything.
 * 2. OrderDetailPage's own timeline check (ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL,
 *    see OrdersContext.tsx) is a fast, human-readable UI-level guard for
 *    the common refresh/reopen case — it is not what closes the real race,
 *    the claim row above is.
 * If the Resend send itself fails after a successful claim, the claim row
 * is deleted before returning an error, so a genuine retry (not a race,
 * an actual subsequent attempt after a real failure) is not permanently
 * blocked by a claim for a notification that was never actually sent.
 *
 * Recipient resolution: admin_profiles rows with
 * notification_preferences->>'payment_confirmed' = 'true'. admin_profiles
 * has no email column (see list_admin_profiles()) — email is resolved
 * per-recipient via supabase.auth.admin.getUserById(), a service-role-only
 * capability distinct from list_admin_profiles()'s own RLS-gated RPC
 * (which requires a real auth.uid() this service-role session doesn't
 * have). No admin email is ever exposed to customer-facing code — this
 * function only ever emails opted-in admins, never returns their
 * addresses in its response.
 *
 * `contentHtml` is the admin-editable envelope (header/body/button/footer)
 * rendered client-side from the tpl-admin-payment-confirmed Communication
 * Template via renderTemplateToHtml() — this function has no browser
 * access to render templates itself. The order-facts table below is
 * built here from order data re-fetched server-side (never trusted from
 * the client), mirroring send-download-email.ts's own separation between
 * admin-editable content and server-built order info.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke a deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED) — see send-download-email.ts's own comment.
 * SUPABASE_SERVICE_ROLE_KEY is used only here, server-side, never sent to
 * the browser, no VITE_ prefix.
 */
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://r-aqim.com";
const NOTIFICATION_KEY = "payment_confirmed";

const ORDER_STATUS_LABELS: Record<string, string> = {
  paid: "مدفوع",
  pending: "قيد الانتظار",
  refunded: "مسترجع",
  cancelled: "ملغي",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  confirmed: "مؤكد",
  pending_review: "بانتظار المراجعة",
  rejected: "مرفوض",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailDocument(params: {
  contentRows: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: string;
  paymentMethod: string;
  paymentStatusLabel: string;
  orderStatusLabel: string;
  downloadEmailSent: boolean;
  orderUrl: string;
}): string {
  const {
    contentRows,
    orderId,
    customerName,
    customerEmail,
    productName,
    amount,
    paymentMethod,
    paymentStatusLabel,
    orderStatusLabel,
    downloadEmailSent,
    orderUrl,
  } = params;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 18px;border-bottom:1px solid #f1e9da;">
        <table role="presentation" width="100%"><tr>
          <td style="color:#8a7d70;font-size:12.5px;">${escapeHtml(label)}</td>
          <td align="left" style="color:#2c2420;font-size:12.5px;font-weight:700;">${escapeHtml(value)}</td>
        </tr></table>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>تم تأكيد دفع طلب — رقيم</title>
</head>
<body style="margin:0;padding:0;background-color:#fbf6ed;" dir="rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf6ed;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;border:1px solid #f1e9da;overflow:hidden;">

          <tr>
            <td align="center" style="background-color:#2c2420;padding:28px 24px;">
              <div style="font-family:Georgia,'Times New Roman',serif;color:#f6efe2;font-size:20px;letter-spacing:3px;">رقيم</div>
            </td>
          </tr>

          ${contentRows}

          <tr>
            <td style="padding:8px 40px 20px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1e9da;border-radius:10px;">
                ${row("رقم الطلب", orderId)}
                ${row("العميلة", customerName)}
                ${row("البريد الإلكتروني", customerEmail)}
                ${row("المنتج", productName)}
                ${row("المبلغ", amount)}
                ${row("طريقة الدفع", paymentMethod)}
                ${row("حالة الدفع", paymentStatusLabel)}
                ${row("حالة الطلب", orderStatusLabel)}
                ${row("بريد رابط التحميل للعميلة", downloadEmailSent ? "تم الإرسال بنجاح" : "لم يُرسل")}
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 40px 36px;font-family:Tahoma,Arial,sans-serif;">
              <a href="${orderUrl}" style="display:inline-block;background-color:#b99451;color:#ffffff;text-decoration:none;font-size:13.5px;font-weight:700;padding:12px 28px;border-radius:999px;">
                فتح الطلب في لوحة التحكم
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="background-color:#2c2420;padding:22px 24px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0;color:#8a7d70;font-size:11px;">رقيم — إشعار إداري تلقائي</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { orderId, contentHtml, downloadEmailSent } = (req.body ?? {}) as {
    orderId?: string;
    contentHtml?: string;
    downloadEmailSent?: boolean;
  };

  if (!orderId || !contentHtml) {
    res.status(400).json({ error: "Missing required fields: orderId, contentHtml" });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!url || !serviceRoleKey) {
    res.status(500).json({ error: "Server is not configured (SUPABASE_SERVICE_ROLE_KEY)." });
    return;
  }
  if (!apiKey || !fromEmail) {
    res.status(500).json({ error: "Email is not configured on the server (RESEND_API_KEY / RESEND_FROM_EMAIL)." });
    return;
  }

  const supabase = createClient(url, serviceRoleKey);

  // Authoritative order facts — never trusted from the client.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, status, payment_status, payment_method, items, discount")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) {
    console.error("Failed to load order for admin payment notification:", orderError);
    res.status(500).json({ error: "Could not load the order." });
    return;
  }
  if (!order) {
    res.status(400).json({ error: "Order not found." });
    return;
  }

  // The one authoritative claim — see file header. A 23505 here means
  // another request already claimed (and is sending, or has sent) this
  // exact order/notification pair; this request must not send anything.
  const { error: claimError } = await supabase
    .from("order_notification_claims")
    .insert({ order_id: orderId, notification_key: NOTIFICATION_KEY });
  if (claimError) {
    if (claimError.code === "23505") {
      res.status(200).json({ ok: true, alreadySent: true });
      return;
    }
    console.error("Failed to claim admin payment notification:", claimError);
    res.status(500).json({ error: "Could not claim the notification." });
    return;
  }

  const releaseClaim = async () => {
    const { error } = await supabase
      .from("order_notification_claims")
      .delete()
      .eq("order_id", orderId)
      .eq("notification_key", NOTIFICATION_KEY);
    if (error) console.error("Failed to release admin payment notification claim after send failure:", error);
  };

  try {
    const { data: recipients, error: recipientsError } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("notification_preferences->>payment_confirmed", "true");
    if (recipientsError) {
      console.error("Failed to resolve admin notification recipients:", recipientsError);
      await releaseClaim();
      res.status(500).json({ error: "Could not resolve notification recipients." });
      return;
    }

    if (!recipients || recipients.length === 0) {
      // Genuinely nothing to send — the claim stays in place (this
      // notification/order pair has been handled, not skipped-and-retryable).
      res.status(200).json({ ok: true, skippedNoRecipients: true });
      return;
    }

    const emails: string[] = [];
    for (const recipient of recipients) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(recipient.id);
      if (userError || !userData?.user?.email) continue;
      emails.push(userData.user.email);
    }

    if (emails.length === 0) {
      res.status(200).json({ ok: true, skippedNoRecipients: true });
      return;
    }

    type OrderItemRow = { title?: string; quantity?: number; unitPrice?: number };
    const items: OrderItemRow[] = Array.isArray(order.items) ? order.items : [];
    const productName = items.map((item) => item.title).filter(Boolean).join("، ") || "غير متوفر";
    const amount = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 0), 0) - (order.discount ?? 0);

    const orderUrl = `${SITE_URL}/admin/orders/${order.id}`;
    const html = buildEmailDocument({
      contentRows: contentHtml,
      orderId: order.id,
      customerName: order.customer_name ?? "غير متوفر",
      customerEmail: order.customer_email ?? "غير متوفر",
      productName,
      amount: `$${amount.toFixed(2)}`,
      paymentMethod: order.payment_method ?? "غير متوفر",
      paymentStatusLabel: (order.payment_status && PAYMENT_STATUS_LABELS[order.payment_status]) ?? "غير متوفر",
      orderStatusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
      downloadEmailSent: Boolean(downloadEmailSent),
      orderUrl,
    });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: emails,
        subject: `تم تأكيد دفع الطلب #${order.id} — رقيم`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errorBody);
      await releaseClaim();
      res.status(502).json({ error: "Email provider rejected the request." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send admin payment notification:", err);
    await releaseClaim();
    res.status(502).json({ error: "Could not reach the email provider." });
  }
}
