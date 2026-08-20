/**
 * Vercel serverless function — ADMIN PURCHASE NOTIFICATION. Notifies
 * opted-in admin users by email as soon as a customer successfully submits
 * their payment information at checkout — triggered from
 * OrdersContext.createOrder(), immediately after the order is durably
 * persisted (INSERT into public.orders succeeds). Deliberately NOT tied to
 * payment confirmation: this fires whether or not an admin has reviewed
 * anything yet, and the email content must never claim the payment was
 * confirmed (see buildEmailDocument's wording below).
 *
 * Entirely separate from send-download-email.ts (the customer's own
 * download-link email, sent later, only after an admin confirms payment)
 * and from send-admin-notification.ts (the unrelated "an invitation needs
 * your review" owner email) — distinct audience, distinct trigger,
 * distinct content, never merged.
 *
 * DUPLICATE-SEND PROTECTION (two layers, only the first is authoritative):
 * 1. order_notification_claims (order_id, notification_key) primary key —
 *    the real guard. This function's first write is an INSERT into that
 *    table; Postgres enforces the composite primary key atomically, so if
 *    two requests for the same order race each other (browser retry,
 *    network retry, duplicate fetch), exactly one INSERT can ever succeed
 *    and the other fails deterministically with SQLSTATE 23505
 *    (unique_violation), observed here as error.code === "23505". That
 *    failing request returns immediately without ever calling Resend.
 * 2. OrdersContext.createOrder()'s own timeline record
 *    (ADMIN_NOTIFICATION_SENT_TIMELINE_LABEL) is a human-readable record
 *    of a real send, written only after this endpoint confirms one — it is
 *    not itself a duplicate-send guard, the claim row above is.
 * If the Resend send itself fails after a successful claim, the claim row
 * is deleted before returning an error, so a genuine subsequent attempt
 * (not a race, an actual retry after a real failure) is not permanently
 * blocked by a claim for a notification that was never actually sent.
 *
 * notification_key here ("purchase_submitted") is intentionally distinct
 * from the admin_profiles.notification_preferences JSONB key
 * ("payment_confirmed", read below) — order_notification_claims and
 * notification_preferences are two independent namespaces. The preference
 * key's literal string value is kept as "payment_confirmed" on purpose
 * (not renamed to match) so an admin who already opted in keeps working
 * immediately after this change ships, with no need to re-toggle anything.
 *
 * Recipient resolution: admin_profiles rows with
 * notification_preferences->>'payment_confirmed' = 'true' — this now
 * includes the owner (the frontend's owner-hiding guard was removed; this
 * query itself never excluded the owner). admin_profiles has no email
 * column (see list_admin_profiles()) — email is resolved per-recipient via
 * supabase.auth.admin.getUserById(), a service-role-only capability
 * distinct from list_admin_profiles()'s own RLS-gated RPC (which requires
 * a real auth.uid() this service-role session doesn't have). No admin
 * email is ever exposed to customer-facing code — this function only ever
 * emails opted-in admins, never returns their addresses in its response.
 *
 * The entire email (envelope + order-facts table) is built server-side in
 * buildEmailDocument() below — unlike the earlier payment-confirmation
 * version of this endpoint, there is no client-rendered Communication
 * Template envelope. That's a deliberate simplification: the caller
 * (OrdersContext.createOrder()) runs on the public checkout page, which
 * has no access to the admin-only CommunicationTemplatesContext, and the
 * content here is a small, fixed, prescribed field list rather than
 * admin-customizable copy.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke a deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED) — see send-download-email.ts's own comment.
 * SUPABASE_SERVICE_ROLE_KEY is used only here, server-side, never sent to
 * the browser, no VITE_ prefix.
 */
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://r-aqim.com";
const NOTIFICATION_KEY = "purchase_submitted";

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

function formatSubmittedAt(iso: string | null): string {
  if (!iso) return "غير متوفر";
  try {
    return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "غير متوفر";
  }
}

function buildEmailDocument(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  purchaseType: string;
  amount: string;
  paymentMethod: string;
  transactionReference: string;
  submittedAt: string;
  paymentStatusLabel: string;
  hasReceiptFile: boolean;
  customerNotes: string;
  orderUrl: string;
}): string {
  const {
    orderId,
    customerName,
    customerEmail,
    productName,
    purchaseType,
    amount,
    paymentMethod,
    transactionReference,
    submittedAt,
    paymentStatusLabel,
    hasReceiptFile,
    customerNotes,
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
<title>عملية شراء جديدة — رقيم</title>
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

          <tr>
            <td style="padding:28px 40px 8px;font-family:Tahoma,Arial,sans-serif;">
              <p style="margin:0;color:#2c2420;font-size:16px;font-weight:700;">تم استلام بيانات عملية شراء جديدة من أحد العملاء.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 40px 20px;font-family:Tahoma,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1e9da;border-radius:10px;">
                ${row("اسم العميل", customerName)}
                ${row("البريد الإلكتروني", customerEmail)}
                ${row("رقم الطلب", orderId)}
                ${row("اسم الكتاب / المنتج", productName)}
                ${row("نوع الشراء", purchaseType)}
                ${row("مبلغ الطلب", amount)}
                ${row("طريقة الدفع", paymentMethod)}
                ${row("رقم العملية / المرجع", transactionReference)}
                ${row("تاريخ ووقت إرسال بيانات الدفع", submittedAt)}
                ${row("حالة الدفع الحالية", paymentStatusLabel)}
                ${row("هل يوجد إيصال مرفوع", hasReceiptFile ? "نعم" : "لا")}
                ${row("ملاحظات العميل", customerNotes)}
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 40px 36px;font-family:Tahoma,Arial,sans-serif;">
              <a href="${orderUrl}" style="display:inline-block;background-color:#b99451;color:#ffffff;text-decoration:none;font-size:13.5px;font-weight:700;padding:12px 28px;border-radius:999px;">
                عرض الطلب في لوحة التحكم
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

  const { orderId, hasReceiptFile } = (req.body ?? {}) as {
    orderId?: string;
    hasReceiptFile?: boolean;
  };

  if (!orderId) {
    res.status(400).json({ error: "Missing required field: orderId" });
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
    .select(
      "id, created_at, customer_name, customer_email, payment_status, payment_method, transaction_id, customer_notes, items, discount"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) {
    console.error("Failed to load order for admin purchase notification:", orderError);
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
    console.error("Failed to claim admin purchase notification:", claimError);
    res.status(500).json({ error: "Could not claim the notification." });
    return;
  }

  const releaseClaim = async () => {
    const { error } = await supabase
      .from("order_notification_claims")
      .delete()
      .eq("order_id", orderId)
      .eq("notification_key", NOTIFICATION_KEY);
    if (error) console.error("Failed to release admin purchase notification claim after send failure:", error);
  };

  try {
    // Deliberately still keyed "payment_confirmed" — see file header.
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
      orderId: order.id,
      customerName: order.customer_name ?? "غير متوفر",
      customerEmail: order.customer_email ?? "غير متوفر",
      productName,
      purchaseType: "كتاب رقمي",
      amount: `$${amount.toFixed(2)}`,
      paymentMethod: order.payment_method ?? "غير متوفر",
      transactionReference: order.transaction_id ?? "غير متوفر",
      submittedAt: formatSubmittedAt(order.created_at),
      paymentStatusLabel: (order.payment_status && PAYMENT_STATUS_LABELS[order.payment_status]) ?? "غير متوفر",
      hasReceiptFile: Boolean(hasReceiptFile),
      customerNotes: order.customer_notes ?? "لا توجد ملاحظات",
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
        subject: "🔔 عملية شراء جديدة — رقيم",
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
    console.error("Failed to send admin purchase notification:", err);
    await releaseClaim();
    res.status(502).json({ error: "Could not reach the email provider." });
  }
}
