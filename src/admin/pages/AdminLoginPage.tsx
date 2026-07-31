import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TextField } from "../components/forms/TextField";

export default function AdminLoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (isReady && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? "/admin/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = login(email, password, rememberMe);
    if (!success) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      return;
    }
    const from = (location.state as { from?: string } | null)?.from ?? "/admin/dashboard";
    navigate(from, { replace: true });
  };

  return (
    <div dir="rtl" className="flex min-h-dvh items-center justify-center bg-cream/40 px-4">
      <div className="w-full max-w-sm rounded-[10px] border border-beige bg-white/70 p-8 shadow-[0_20px_50px_-24px_rgba(44,36,32,0.3)] backdrop-blur">
        <div className="text-center">
          <span className="font-logotype text-3xl text-gold">رقيم</span>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-faint">Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <TextField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} dir="ltr" required />
          <TextField label="كلمة المرور" type="password" value={password} onChange={setPassword} dir="ltr" required />

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-beige accent-gold-deep"
            />
            تذكرني
          </label>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-1 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
