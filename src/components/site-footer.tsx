import { useState } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "./site-nav";
import { GoldDivider } from "./ornaments";

const EXPLORE_LINKS = [
  { to: "/books", label: "الكتب" },
  { to: "/about", label: "عن مرافئ" },
  { to: "/authors/maha-nasr", label: "المؤلفات" },
  { to: "/future-releases", label: "إصدارات قادمة" },
];

const SUPPORT_LINKS = [
  { to: "/faq", label: "الأسئلة الشائعة" },
  { to: "/contact", label: "تواصل معنا" },
  { to: "/privacy", label: "سياسة الخصوصية" },
  { to: "/terms", label: "الشروط والأحكام" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <img
          src="/assets/arabesque-pattern.webp"
          alt=""
          className="absolute -left-24 -top-24 h-[560px] w-[560px] object-cover"
          loading="lazy"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 lg:px-10">
        <NewsletterBand />

        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8 text-gold" />
              <span className="font-logotype text-xl tracking-wide text-ivory">مرافئ</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-loose text-cream/70">
              دار نشر رقمية فاخرة، تصدر كتبًا للمرأة تجمع بين الجمال والعمق والإلهام.
            </p>
          </div>

          <FooterColumn title="استكشفي" links={EXPLORE_LINKS} />
          <FooterColumn title="الدعم" links={SUPPORT_LINKS} />

          <div>
            <h3 className="text-sm text-gold">تابعينا</h3>
            <div className="mt-4 flex gap-3">
              {["إنستغرام", "بينتريست", "تيك توك"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 text-gold/60">
          <GoldDivider className="h-4 w-full" />
        </div>

        <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 text-xs text-cream/50 sm:flex-row">
          <p>© ٢٠٢٦ مرافئ. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold">
              الخصوصية
            </Link>
            <Link to="/terms" className="hover:text-gold">
              الشروط
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm text-gold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-cream/70 transition-colors hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-2 lg:p-12">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gold">النشرة البريدية</p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-ivory">
          انضمي إلى مرافئ
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-loose text-cream/70">
          كوني أول من يعلم بكل إصدار جديد، ومقالات ملهمة تصل بريدك بلا إزعاج.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3.5 text-sm text-ivory placeholder:text-cream/40 focus:border-gold focus:outline-none"
        />
        <TicketSubmitButton submitted={submitted} />
      </form>
    </div>
  );
}

/** Newsletter submit CTA — ticket-perforation edge that "tears" on hover to reveal a checkmark. */
function TicketSubmitButton({ submitted }: { submitted: boolean }) {
  return (
    <button
      type="submit"
      className="group relative shrink-0 overflow-hidden rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-gold-deep"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-px bg-[repeating-linear-gradient(to_bottom,transparent,transparent_3px,rgba(44,36,32,0.35)_3px,rgba(44,36,32,0.35)_5px)]"
      />
      <span className="relative inline-flex items-center gap-2">
        <span className="transition-transform duration-300 group-hover:-translate-y-6 group-hover:opacity-0">
          {submitted ? "تم الاشتراك" : "اشتراك"}
        </span>
        <span className="absolute inset-0 flex translate-y-6 items-center justify-center opacity-0 transition-transform duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          ✓
        </span>
      </span>
    </button>
  );
}

