import { useState } from "react";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { useSettings } from "../admin/context/SettingsContext";
import { useSiteContent } from "../admin/context/SiteContentContext";

export default function ContactPage() {
  const { settings } = useSettings();
  const { getValue } = useSiteContent();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <PageShell>
      <Helmet
        title="تواصل معنا — رقيم"
        description="تواصلي مع فريق رقيم لأي استفسار."
        url="https://r-aqim.com/contact"
      />
      <PageHeader
        eyebrow="تواصل معنا"
        title="يسعدنا سماع صوتك"
        description="لأي استفسار عن كتبنا أو طلبك أو اقتراح تعاون، فريقنا هنا للاستماع."
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="space-y-8">
            <ContactInfo label="البريد الإلكتروني" value={settings.contact.email} />
            <ContactInfo label="ساعات الرد" value={settings.contact.hours} />
            <ContactInfo label="طريقة التواصل" value={getValue("contact.methodNote")} />
          </Reveal>

          <Reveal delay={0.1}>
            {sent ? (
              <div className="rounded-[10px] border border-gold/30 bg-cream/50 p-10 text-center">
                <p className="font-display text-2xl text-ink">تم استلام رسالتك</p>
                <p className="mt-3 text-ink-soft">سنعود إليك في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await fetch("https://formspree.io/f/mlgqjkyr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      setSent(true);
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } else {
      setError("حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.");
    }
  } catch {
    setError("تعذر الاتصال بالخادم.");
  }

  setLoading(false);
}}
                className="space-y-5 rounded-[10px] border border-beige bg-cream/40 p-8"
              >
                <Field
                  label="الاسم"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  required
                />
                <Field
                  label="البريد الإلكتروني"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  required
                />
                <div>
                  <label className="mb-2 block text-sm text-ink">رسالتك</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                    placeholder="اكتبي رسالتك هنا"
                  />
                </div>
                {error && (
                <p className="rounded-[10px] bg-red-50 px-4 py-3 text-sm text-red-700">
                 {error}
                </p>
                 )}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex items-center gap-3 rounded-[10px] bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_10px_30px_-12px_rgba(185,148,81,0.55)] transition-all duration-200 ease-out hover:bg-gold-deep active:translate-y-[2px] active:scale-[0.98]"
                >
                  <span>{loading ? "جاري الإرسال..." : "إرسال الرسالة"}</span>
                  <span
                   aria-hidden
                   className={`transition-transform duration-300 ${
                    loading ? "opacity-50" : "group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[4px]"
                  }`}
                >
                  ←
               </span>
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}

function ContactInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{label}</p>
      <p className="mt-2 text-lg text-ink">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-ink">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[10px] border border-beige bg-ivory px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
    </div>
  );
}

