import { GoldDivider } from "./ornaments";

/**
 * Device + presentation mockup frames built with CSS around the approved
 * book photography (book-cutout.webp / book-kuni-hajar-detail.webp) — no
 * additional image generation, per direction lock. Each frame is a distinct
 * "how you'll enjoy this book" presentation: hardcover, softcover reading,
 * tablet, iPad, laptop, mobile, coffee table, flat lay, luxury desk, gift
 * presentation, elegant packaging.
 */

const COVER = "/assets/book-cutout.webp";
const DETAIL = "/assets/book-kuni-hajar-detail.webp";

export function MockupGrid() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      <MockupCard label="غلاف فاخر" span="row-span-2">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-cream to-beige p-6">
          <img src={COVER} alt="غلاف كتاب كوني هاجر الفاخر" className="h-full w-auto object-contain drop-shadow-xl" loading="lazy" />
        </div>
      </MockupCard>

      <MockupCard label="على الآيباد">
        <TabletFrame />
      </MockupCard>

      <MockupCard label="على الهاتف">
        <PhoneFrame />
      </MockupCard>

      <MockupCard label="على الكمبيوتر المحمول">
        <LaptopFrame />
      </MockupCard>

      <MockupCard label="طاولة القهوة">
        <SceneFrame tone="from-[#e9ddc8] to-[#d8c9ab]" />
      </MockupCard>

      <MockupCard label="تنسيق مسطح">
        <SceneFrame tone="from-[#f1e9da] to-[#e3d4c4]" rotate />
      </MockupCard>

      <MockupCard label="مكتب أنيق">
        <SceneFrame tone="from-[#e4d7c0] to-[#c9b28c]" />
      </MockupCard>

      <MockupCard label="تغليف هدية">
        <GiftFrame />
      </MockupCard>
    </div>
  );
}

function MockupCard({
  label,
  span = "",
  children,
}: {
  label: string;
  span?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`group overflow-hidden rounded-md border border-beige bg-cream/60 ${span}`}>
      <div className="aspect-[4/5] overflow-hidden">{children}</div>
      <div className="flex items-center justify-between border-t border-beige px-4 py-3">
        <span className="text-xs text-ink-soft">{label}</span>
        <GoldDivider className="h-3 w-10 text-gold/50" />
      </div>
    </div>
  );
}

function TabletFrame() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2c2420] to-[#403630] p-5">
      <div className="relative aspect-[3/4] w-full max-w-[220px] rounded-[14px] border-[6px] border-[#181310] bg-ivory shadow-2xl">
        <div className="absolute inset-2 overflow-hidden rounded-[8px] bg-cream">
          <img src={DETAIL} alt="" className="h-full w-full object-cover object-[30%_20%]" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

function PhoneFrame() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#3a322b] to-[#241d18] p-6">
      <div className="relative aspect-[9/19] h-full max-h-[240px] rounded-[24px] border-[6px] border-[#161210] bg-ivory shadow-2xl">
        <div className="absolute inset-1.5 overflow-hidden rounded-[18px] bg-cream">
          <img src={DETAIL} alt="" className="h-full w-full object-cover object-[35%_15%]" loading="lazy" />
        </div>
        <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#161210]" />
      </div>
    </div>
  );
}

function LaptopFrame() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#efe6d6] to-[#ddccb2] p-6">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[6px] border-[5px] border-b-0 border-[#2c2420] bg-cream shadow-xl">
        <img src={DETAIL} alt="" className="h-full w-full object-cover object-[30%_10%]" loading="lazy" />
      </div>
      <div className="h-2.5 w-[108%] rounded-b-[4px] bg-[#2c2420]" />
    </div>
  );
}

function SceneFrame({ tone, rotate = false }: { tone: string; rotate?: boolean }) {
  return (
    <div className={`flex h-full items-center justify-center bg-gradient-to-br ${tone} p-8`}>
      <img
        src={COVER}
        alt=""
        className={`h-full w-auto object-contain drop-shadow-lg ${rotate ? "-rotate-6" : ""}`}
        loading="lazy"
      />
    </div>
  );
}

function GiftFrame() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-mauve/40 to-lavender/40 p-8">
      <div className="absolute inset-6 rounded-[8px] border border-dashed border-gold/50" />
      <img src={COVER} alt="" className="relative h-[85%] w-auto object-contain drop-shadow-xl" loading="lazy" />
      <div className="absolute bottom-5 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-gold bg-ivory/80" />
    </div>
  );
}

