import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/PageHeader";
import { TextField } from "../components/form/TextField";
import { Select } from "../components/form/Select";
import { SegmentedControl } from "../components/form/SegmentedControl";
import { FileDropzone } from "../components/form/FileDropzone";
import { MediaPickerModal } from "../components/media/MediaPickerModal";
import { CustomerAvatar } from "../components/customers/CustomerAvatar";
import { IconCheck } from "../icons";

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [language, setLanguage] = useState("ar");
  const [appearance, setAppearance] = useState("light");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [flash, setFlash] = useState<string | null>(null);
  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 3000);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    showFlash("تم حفظ بيانات الملف الشخصي");
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordError("يرجى تعبئة جميع الحقول.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("يجب ألا تقل كلمة المرور الجديدة عن ٨ أحرف.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("كلمة المرور الجديدة غير متطابقة مع التأكيد.");
      return;
    }
    const success = changePassword(currentPassword, newPassword);
    if (!success) {
      setPasswordError("كلمة المرور الحالية غير صحيحة.");
      return;
    }
    setPasswordError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showFlash("تم تحديث كلمة المرور");
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="الملف الشخصي" description="إدارة بياناتك الشخصية وتفضيلاتك في لوحة التحكم." />

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            <IconCheck className="h-4 w-4 shrink-0" />
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur"
          >
            <h2 className="font-display text-lg text-ink">البيانات الشخصية</h2>

            <div className="mt-5 flex items-center gap-5">
              <CustomerAvatar name={name} imageUrl={avatarUrl} size="lg" />
              <div className="max-w-xs flex-1">
                <FileDropzone
                  label="الصورة الشخصية"
                  previewUrl={avatarUrl}
                  onFileSelected={(file) => setAvatarUrl(URL.createObjectURL(file))}
                  onClear={() => setAvatarUrl(null)}
                  onBrowseLibrary={() => setPickerOpen(true)}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField label="الاسم" value={name} onChange={setName} required />
              <TextField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} dir="ltr" required />
              <div>
                <span className="mb-2 block text-sm text-ink">الدور</span>
                <p className="rounded-[10px] border border-beige bg-cream/40 px-4 py-3 text-sm text-ink-soft">
                  {currentUser?.role === "owner" ? "مالك الحساب" : "محررة"}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
            >
              حفظ التغييرات
            </button>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur"
          >
            <h2 className="font-display text-lg text-ink">تغيير كلمة المرور</h2>
            <p className="mt-1 text-xs text-ink-faint">
              نظام الدخول محلي حاليًا (لا يتصل بأي خادم)، لكنه فعّال بالكامل داخل هذا المتصفح.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="كلمة المرور الحالية"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  dir="ltr"
                />
              </div>
              <TextField label="كلمة المرور الجديدة" type="password" value={newPassword} onChange={setNewPassword} dir="ltr" />
              <TextField
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                dir="ltr"
              />
            </div>

            {passwordError && <p className="mt-3 text-xs text-danger">{passwordError}</p>}

            <button
              type="submit"
              className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
            >
              تحديث كلمة المرور
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
            <h2 className="font-display text-lg text-ink">التفضيلات</h2>
            <div className="mt-4 flex flex-col gap-5">
              <Select
                label="اللغة"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "ar", label: "العربية" },
                  { value: "en", label: "الإنجليزية" },
                ]}
              />
              <SegmentedControl
                label="المظهر"
                value={appearance}
                onChange={setAppearance}
                options={[
                  { value: "light", label: "فاتح" },
                  { value: "dark", label: "داكن (قريبًا)", disabled: true },
                ]}
              />
            </div>
          </div>

          <div className="rounded-[10px] border border-beige bg-white/70 p-6 shadow-(--shadow-soft) backdrop-blur">
            <h2 className="font-display text-lg text-ink">جلسات الدخول</h2>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-beige bg-cream/40 px-4 py-3">
              <div>
                <p className="text-sm text-ink">الجلسة الحالية</p>
                <p className="mt-0.5 text-xs text-ink-faint">نشطة الآن</p>
              </div>
              <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                هذا الجهاز
              </span>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              سجل الجلسات التفصيلي سيكون متاحًا عند تفعيل نظام الدخول.
            </p>
          </div>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setAvatarUrl(asset.url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
