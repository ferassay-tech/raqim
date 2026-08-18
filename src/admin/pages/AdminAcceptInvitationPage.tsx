import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { TextField } from "../components/forms/TextField";
import { getSupabaseClient } from "../../lib/supabaseClient";

type Phase = "init" | "no-token" | "need-signup" | "check-email" | "accepting" | "success" | "error";

// invite_token (not "token") so it never collides with a query param
// Supabase's own redirect handling recognizes. Persisted to localStorage as
// a same-device fallback the moment it's seen in the URL, since the
// email-confirmation link is the real, primary carrier — it's embedded in
// emailRedirectTo below and comes back on the URL regardless of device.
const TOKEN_KEY = "raqim_admin:pending_invite_token";
// Set once a signup call has actually been made for this token, so a reload
// of this page while waiting for the confirmation email shows "check your
// inbox" again instead of asking the invitee to sign up a second time.
const EMAIL_KEY = "raqim_admin:pending_invite_email";

interface AcceptedInvitationRow {
  id: string;
  email: string;
  role: string;
}

export default function AdminAcceptInvitationPage() {
  const [phase, setPhase] = useState<Phase>("init");
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against a duplicate accept_admin_invitation() call — the RPC
  // only matches a still-'pending' row, so a second call for an
  // already-accepted token would surface a misleading "invalid or expired"
  // error (e.g. from a React effect re-run in development).
  const acceptAttempted = useRef(false);

  const doAccept = useCallback(async (invitationToken: string) => {
    if (acceptAttempted.current) return;
    acceptAttempted.current = true;
    setPhase("accepting");
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: rpcError } = await supabase.rpc("accept_admin_invitation", {
        p_token: invitationToken,
      });
      if (rpcError) throw rpcError;

      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
      } catch {
        /* ignore storage errors */
      }

      setPhase("success");

      const row = data as AcceptedInvitationRow | null;
      if (row) {
        // Client-triggered, best-effort — never blocks the success screen.
        // The real authorization boundary is approve_admin_invitation()
        // (owner-only), which this notification has no bearing on.
        fetch("/api/send-admin-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: row.email, role: row.role, invitationId: row.id }),
        }).catch((err) => {
          console.error("Failed to send admin notification email:", err);
        });
      }
    } catch (err) {
      acceptAttempted.current = false;
      setPhase("error");
      setError(err instanceof Error ? err.message : "تعذر قبول الدعوة.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("invite_token");
      if (urlToken) {
        try {
          localStorage.setItem(TOKEN_KEY, urlToken);
        } catch {
          /* ignore storage errors */
        }
      }

      let resolvedToken = urlToken;
      if (!resolvedToken) {
        try {
          resolvedToken = localStorage.getItem(TOKEN_KEY);
        } catch {
          resolvedToken = null;
        }
      }

      if (!resolvedToken) {
        if (!cancelled) setPhase("no-token");
        return;
      }
      if (!cancelled) setToken(resolvedToken);

      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        void doAccept(resolvedToken);
        return;
      }

      let pendingEmail: string | null = null;
      try {
        pendingEmail = localStorage.getItem(EMAIL_KEY);
      } catch {
        pendingEmail = null;
      }
      if (pendingEmail) {
        setEmail(pendingEmail);
        setPhase("check-email");
      } else {
        setPhase("need-signup");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doAccept]);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);

    if (password.length < 8) {
      setError("يجب ألا تقل كلمة المرور عن ٨ أحرف.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const redirectTo = `${window.location.origin}/admin/accept-invitation?invite_token=${encodeURIComponent(token)}`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (signUpError) throw signUpError;

      try {
        localStorage.setItem(EMAIL_KEY, email);
      } catch {
        /* ignore storage errors */
      }

      if (data.session) {
        void doAccept(token);
      } else {
        setPhase("check-email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="flex min-h-dvh items-center justify-center bg-cream/40 px-4">
      <div className="w-full max-w-sm rounded-[10px] border border-beige bg-white/70 p-8 shadow-[0_20px_50px_-24px_rgba(44,36,32,0.3)] backdrop-blur">
        <div className="text-center">
          <span className="font-logotype text-3xl text-gold">رقيم</span>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-faint">Admin</p>
        </div>

        {phase === "init" && <p className="mt-7 text-center text-sm text-ink-soft">جارٍ التحقق من الدعوة…</p>}

        {phase === "no-token" && (
          <div className="mt-7 text-center">
            <p className="text-sm text-danger">رابط الدعوة غير صالح أو غير مكتمل.</p>
            <p className="mt-2 text-xs text-ink-faint">تأكدي من فتح الرابط كاملاً كما ورد في رسالة البريد الإلكتروني.</p>
          </div>
        )}

        {phase === "need-signup" && (
          <form onSubmit={handleSignup} className="mt-7 flex flex-col gap-4">
            <p className="text-sm text-ink-soft">
              أنشئي كلمة مرور لحسابك الإداري الجديد باستخدام البريد الإلكتروني الذي وُجّهت إليه الدعوة.
            </p>
            <TextField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} dir="ltr" required />
            <TextField label="كلمة المرور" type="password" value={password} onChange={setPassword} dir="ltr" required />
            <TextField
              label="تأكيد كلمة المرور"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              dir="ltr"
              required
            />

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              إنشاء الحساب
            </button>
          </form>
        )}

        {phase === "check-email" && (
          <div className="mt-7 text-center">
            <p className="text-sm text-ink">تم إرسال رسالة تأكيد إلى</p>
            <p className="mt-1 text-sm font-medium text-ink" dir="ltr">
              {email}
            </p>
            <p className="mt-3 text-xs text-ink-faint">
              افتحي الرسالة واضغطي على رابط التأكيد لإتمام قبول الدعوة. سيعيدك الرابط إلى هذه الصفحة تلقائياً.
            </p>
          </div>
        )}

        {phase === "accepting" && <p className="mt-7 text-center text-sm text-ink-soft">جارٍ قبول الدعوة…</p>}

        {phase === "success" && (
          <div className="mt-7 text-center">
            <p className="text-sm text-ink">تم تأكيد بريدك وقبول الدعوة بنجاح.</p>
            <p className="mt-2 text-xs text-ink-faint">
              سيراجع مالك المنصة طلبك قريباً لتفعيل صلاحياتك. بعد التفعيل، يمكنك تسجيل الدخول من الصفحة الرئيسية للوحة
              التحكم.
            </p>
            <Link
              to="/admin/login"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
            >
              الذهاب إلى تسجيل الدخول
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-7 text-center">
            <p className="text-sm text-danger">{error ?? "تعذر قبول الدعوة."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
