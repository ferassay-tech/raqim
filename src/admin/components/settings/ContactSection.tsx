import { TextField } from "../form/TextField";
import { TextArea } from "../form/TextArea";
import { useSettings } from "../../context/SettingsContext";

interface ContactSectionProps {
  onSaved: (message: string) => void;
}

export function ContactSection({ onSaved }: ContactSectionProps) {
  const { settings, updateContact } = useSettings();
  const { email, phone, address, hours, instagram, pinterest, tiktok } = settings.contact;

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
      <h2 className="font-display text-lg text-ink">التواصل</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextField
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(v) => updateContact({ email: v })}
          dir="ltr"
        />
        <TextField
          label="رقم الهاتف"
          value={phone}
          onChange={(v) => updateContact({ phone: v })}
          placeholder="+966 5X XXX XXXX"
          dir="ltr"
        />
        <TextField label="ساعات الرد" value={hours} onChange={(v) => updateContact({ hours: v })} />
        <div className="lg:col-span-2">
          <TextArea
            label="العنوان"
            rows={2}
            value={address}
            onChange={(v) => updateContact({ address: v })}
            placeholder="اختياري"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-beige pt-6">
        <p className="mb-4 text-sm text-ink">روابط التواصل الاجتماعي</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="إنستغرام"
            value={instagram}
            onChange={(v) => updateContact({ instagram: v })}
            placeholder="https://instagram.com/…"
            dir="ltr"
          />
          <TextField
            label="بينتريست"
            value={pinterest}
            onChange={(v) => updateContact({ pinterest: v })}
            placeholder="https://pinterest.com/…"
            dir="ltr"
          />
          <TextField
            label="تيك توك"
            value={tiktok}
            onChange={(v) => updateContact({ tiktok: v })}
            placeholder="https://tiktok.com/@…"
            dir="ltr"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSaved("تم حفظ إعدادات التواصل")}
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}
