import { TextField } from "../form/TextField";
import { Select } from "../form/Select";
import { useSettings } from "../../context/SettingsContext";
import { CURRENCY_LABELS } from "../../types/book";
import type { BookCurrency } from "../../types/book";

interface StoreSectionProps {
  onSaved: (message: string) => void;
}

const ALL_CURRENCIES = Object.keys(CURRENCY_LABELS) as BookCurrency[];

export function StoreSection({ onSaved }: StoreSectionProps) {
  const { settings, updateStore } = useSettings();
  const { supportedCurrencies, defaultCurrency, tax, orderPrefix } = settings.store;

  const toggleCurrency = (currency: BookCurrency) => {
    const isSupported = supportedCurrencies.includes(currency);
    // At least one currency must always stay supported, and the default
    // currency can never be removed out from under itself.
    if (isSupported && supportedCurrencies.length === 1) return;
    if (isSupported && currency === defaultCurrency) return;

    const next = isSupported
      ? supportedCurrencies.filter((c) => c !== currency)
      : [...supportedCurrencies, currency];
    updateStore({ supportedCurrencies: next });
  };

  return (
    <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
      <h2 className="font-display text-lg text-ink">المتجر</h2>

      <div className="mt-5">
        <span className="mb-2 block text-sm text-ink">العملات المدعومة</span>
        <div className="flex flex-wrap gap-2">
          {ALL_CURRENCIES.map((currency) => {
            const active = supportedCurrencies.includes(currency);
            return (
              <button
                key={currency}
                type="button"
                onClick={() => toggleCurrency(currency)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  active ? "border-ink bg-ink text-ivory" : "border-beige text-ink-soft hover:border-gold hover:text-ink"
                }`}
              >
                {CURRENCY_LABELS[currency]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          كل عملة مدعومة تُدخل سعرها يدويًا لكل كتاب — لا يوجد تحويل تلقائي بين العملات.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Select
          label="العملة الافتراضية"
          value={defaultCurrency}
          onChange={(v) => updateStore({ defaultCurrency: v as BookCurrency })}
          options={supportedCurrencies.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
        />
        <TextField
          label="الضريبة الافتراضية (%)"
          type="number"
          value={String(tax)}
          onChange={(v) => updateStore({ tax: Number(v) || 0 })}
        />
        <TextField
          label="بادئة رقم الطلب"
          value={orderPrefix}
          onChange={(v) => updateStore({ orderPrefix: v })}
          dir="ltr"
          hint="مثال: A-1042"
        />
      </div>
      <button
        type="button"
        onClick={() => onSaved("تم حفظ إعدادات المتجر")}
        className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}
