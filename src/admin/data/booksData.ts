import type { AdminBookRaw } from "../types/book";

// The real, live content of the Raqim public site — migrated from the
// project's early static content file / src/data/products.ts /
// src/config/paymentMethods.ts (Milestone 3.1). "كوني هاجر" is the one real published title; the other
// three are the real "coming soon" placeholders already shown on
// FutureReleasesPage today. This is not demo data — it's what the public
// site is currently, actually showing. Every copy field is bilingual
// ({ar, en}); English is a natural, marketing-quality translation, not a
// literal one.
export const INITIAL_BOOKS: AdminBookRaw[] = [
  {
    id: "kuni-hajar",
    title: { ar: "كوني هاجر", en: "Be Hajar" },
    subtitle: {
      ar: "دروس من سيرة هاجر لأمٍ تصنع الأجيال وتواجه التحديات بقلب مطمئن",
      en: "Lessons from the story of Hajar, for a mother who shapes generations and faces challenges with a tranquil heart",
    },
    author: "مها نصر",
    authorSlug: "maha-nasr",
    authorBio: {
      ar: "مها نصر كاتبة فلسطينية من غزة، ومدربة في تنمية المرأة والأسرة. تهتم ببناء الوعي التربوي والنفسي، وتستلهم في كتاباتها القيم الإيمانية والتجارب الإنسانية الواقعية، لتقدم محتوى يجمع بين الدفء والعمق. ويأتي كتابها الأول «كوني هاجر» ليكون بداية رحلة أدبية تهدف إلى إلهام المرأة وبناء أثر يبقى.",
      en: "Maha Nasar is a Palestinian writer from Gaza and a coach in women's and family development. She focuses on building educational and psychological awareness, drawing on faith-rooted values and real human experiences in her writing to offer content that blends warmth with depth. Her debut book, Be Hajar, marks the beginning of a literary journey aimed at inspiring women and building a lasting impact.",
    },
    category: "الأمومة والإلهام الإسلامي",

    cover: "/books/kuni-hajar/cover.webp",
    backCoverImage: "/books/kuni-hajar/back.webp",
    previewPages: [
      "/books/kuni-hajar/page-01.webp",
      "/books/kuni-hajar/page-02.webp",
      "/books/kuni-hajar/page-03.webp",
      "/books/kuni-hajar/page-04.webp",
      "/books/kuni-hajar/page-05.webp",
    ],
    gallery: ["/assets/kuni-hajar-collection.webp", "/assets/book-cutout.webp", "/assets/book-kuni-hajar-detail.webp"],

    placement: "hero",
    displayOrder: 0,

    prices: {
      USD: { price: 10, compareAtPrice: 15.99 },
      EGP: { price: 500, compareAtPrice: null },
      ILS: { price: 30, compareAtPrice: null },
    },
    stock: 999,
    sku: "RQM-001",
    status: "published",

    language: { ar: "العربية", en: "Arabic" },
    format: { ar: "كتاب رقمي PDF فاخر", en: "Luxury Digital PDF Book" },
    pages: 186,

    description: {
      ar: "رحلة في سيرة هاجر عليها السلام، تستخلص منها الأم المعاصرة دروسًا في الصبر والثبات وصناعة الأثر الذي يبقى بعد الإنجاز.",
      en: "A journey through the story of Hajar (peace be upon her), from which today's mother draws lessons in patience, steadfastness, and creating an impact that outlasts any achievement.",
    },
    longDescription: {
      ar: "كل أم تمر بلحظات تشعر فيها أن العطاء بلا حدود يستنزفها. في هذا الكتاب، نأخذك في رحلة مع سيرة هاجر عليها السلام، لتكتشفي أن الصبر ليس استسلامًا، بل قوة هادئة تصنع الأثر. ستنتقلين من الشعور بالوحدة في التعب، إلى اليقين بأن كل خطوة تخطينها لها معنى يتجاوز اللحظة.",
      en: "Every mother goes through moments when boundless giving feels draining. In this book, we take you on a journey through the story of Hajar (peace be upon her), to discover that patience is not surrender — it's a quiet strength that creates impact. You'll move from feeling alone in your exhaustion to the certainty that every step you take carries meaning beyond the moment.",
    },
    whoFor: [
      {
        ar: "الأم التي تشعر أحيانًا أن الطريق طويل ومتعب، وتبحث عن معنى أعمق لتعبها.",
        en: "The mother who sometimes feels the road is long and tiring, and is searching for a deeper meaning behind her exhaustion.",
      },
      {
        ar: "المرأة التي تستعد لتكون أمًا، وتريد أن تبني قناعاتها قبل أن تبدأ الرحلة.",
        en: "The woman preparing to become a mother, who wants to build her convictions before the journey begins.",
      },
      {
        ar: "كل من أحبت سيرة هاجر عليها السلام، وتريد أن تستلهم منها في حياتها اليومية.",
        en: "Anyone who has loved the story of Hajar (peace be upon her) and wants to draw inspiration from it in daily life.",
      },
      {
        ar: "من تبحث عن كتاب يجمع بين العمق الروحي والتطبيق العملي، بلا تكلّف.",
        en: "Anyone looking for a book that combines spiritual depth with practical application, without pretense.",
      },
    ],
    features: [
      {
        icon: "openHands",
        title: { ar: "ثبات في وجه التحديات", en: "Steadfastness in the Face of Challenges" },
        body: {
          ar: "دروس عملية من صبر هاجر تساعدك على مواجهة أصعب أيامك بقلب مطمئن.",
          en: "Practical lessons from Hajar's patience to help you face your hardest days with a tranquil heart.",
        },
      },
      {
        icon: "star",
        title: { ar: "وعي بدورك الحقيقي", en: "Awareness of Your True Role" },
        body: {
          ar: "فهم أعمق لأثر الأم الذي يتجاوز الإنجاز الظاهر إلى بناء الأجيال.",
          en: "A deeper understanding of a mother's impact — one that goes beyond visible achievement to shaping generations.",
        },
      },
      {
        icon: "heart",
        title: { ar: "سكينة روحية يومية", en: "Daily Spiritual Peace" },
        body: {
          ar: "تأملات قصيرة تعيدك إلى مركز هدوئك في وسط ضغوط الأمومة.",
          en: "Short reflections that bring you back to your center of calm amid the pressures of motherhood.",
        },
      },
      {
        icon: "quill",
        title: { ar: "لغة قريبة من قلبك", en: "A Language Close to Your Heart" },
        body: {
          ar: "أسلوب دافئ وصادق، بعيد عن الوعظ المباشر أو التكلف.",
          en: "A warm, honest style, free of direct preaching or pretense.",
        },
      },
      {
        icon: "book",
        title: { ar: "كتاب يُقرأ ويُهدى", en: "A Book to Read and Gift" },
        body: {
          ar: "تصميم فاخر يجعله رفيقًا يوميًا وهدية ذات معنى في آنٍ واحد.",
          en: "A luxury design that makes it both a daily companion and a meaningful gift.",
        },
      },
    ],
    chapters: [
      { number: "١", title: { ar: "من أنتِ حين يضيق بكِ الطريق", en: "Who You Are When the Road Feels Narrow" } },
      {
        number: "٢",
        title: { ar: "بئر زمزم: حين يأتي الفرج من حيث لا تحتسبين", en: "The Well of Zamzam: When Relief Comes From Where You Least Expect" },
      },
      { number: "٣", title: { ar: "الأثر الذي تصنعه الأم في صمت", en: "The Impact a Mother Creates in Silence" } },
      { number: "٤", title: { ar: "أن تكوني هاجر في زمانك", en: "Being Hajar in Your Own Time" } },
    ],
    reviews: [
      {
        quote: {
          ar: "كتاب غيّر نظرتي لتعبي اليومي كأم. شعرت أن أحدًا أخيرًا فهم ما أمرّ به وكتب عنه بصدق.",
          en: "A book that changed how I see my daily exhaustion as a mother. I felt like someone finally understood what I go through and wrote about it honestly.",
        },
        name: { ar: "هيجر البلتاجي", en: "Hajar Al-Baltagy" },
        role: { ar: "قارئة من غزة", en: "Reader from Gaza" },
        rating: 5,
      },
      {
        quote: {
          ar: "لغة راقية وصادقة، وتصميم يجعل من القراءة تجربة بحد ذاتها. أهديته لأختي وبكت من تأثره فيها.",
          en: "Elegant, honest language, and a design that makes reading an experience in itself. I gifted it to my sister and she cried from how deeply it moved her.",
        },
        name: { ar: "ايمان خليل", en: "Iman Khalil" },
        role: { ar: "قارئة", en: "Reader" },
        rating: 5,
      },
      {
        quote: {
          ar: "من أجمل ما قرأت عن سيرة هاجر عليها السلام بلغة معاصرة تلامس واقع الأم اليوم.",
          en: "One of the most beautiful things I've read about the story of Hajar (peace be upon her), in contemporary language that touches today's mother's reality.",
        },
        name: { ar: "نورة المصري", en: "Noura Al-Masry" },
        role: { ar: "مدربة تنمية أسرية", en: "Family development coach" },
        rating: 5,
      },
    ],
    // Deliberately empty: the original site's book page always showed the
    // site-wide FAQ list (never a per-book one) — BookPage.tsx falls back to
    // the global FAQ list (SiteContentContext) whenever this is empty, which
    // reproduces that exact original behavior instead of duplicating it here.
    faq: [],
    ctaLabel: { ar: "اطلبي نسختك الآن", en: "Order Your Copy Now" },
    badges: [{ ar: "إصدار رقيم الأول", en: "Raqim's First Release" }],
    accentColor: null,

    // AR title/description already lead with "كوني هاجر" — the book's one
    // real name in Arabic, matching how every Arabic reader searches for
    // it — left as-is. EN pairs the book's established English rendering
    // ("Be Hajar", already used in its author bio and cover copy) with the
    // Arabic title's transliteration ("Kuni Hajar") — not inventing a new
    // translation, just naming the same real book both ways so an English
    // searcher typing either one recognizes it.
    seoTitle: { ar: "كوني هاجر — رقيم", en: "Be Hajar (Kuni Hajar) by Maha Nasar — Raqim" },
    seoDescription: {
      ar: "كتاب كوني هاجر لمها نصر، دليل الأم المسلمة للثبات والسكينة، إصدار رقيم الأول.",
      en: "Be Hajar — known in Arabic as Kuni Hajar — is Maha Nasar's debut book: a Muslim mother's guide to steadfastness and inner peace. Raqim's first release.",
    },

    sales: 0,
    deletedAt: null,
    updatedAt: "2026-07-27",
  },
  {
    id: "coming-soon-1",
    title: { ar: "إصدار جديد", en: "New Release" },
    subtitle: { ar: "ترقبوا قريبًا", en: "Coming Soon" },
    author: "رقيم",
    authorSlug: "raqim",
    authorBio: { ar: "", en: "" },
    category: "قريبًا",
    cover: "/assets/lumora-coming-soon-01.webp",
    backCoverImage: null,
    previewPages: [],
    gallery: [],
    placement: "comingSoon",
    displayOrder: 1,
    prices: {},
    stock: 0,
    sku: "",
    status: "published",
    language: { ar: "العربية", en: "Arabic" },
    format: { ar: "", en: "" },
    pages: 0,
    description: { ar: "رحلة جديدة تبدأ قريبًا.", en: "A new journey begins soon." },
    longDescription: { ar: "", en: "" },
    whoFor: [],
    features: [],
    chapters: [],
    reviews: [],
    faq: [],
    ctaLabel: { ar: "", en: "" },
    badges: [],
    accentColor: null,
    seoTitle: { ar: "", en: "" },
    seoDescription: { ar: "", en: "" },
    sales: 0,
    deletedAt: null,
    updatedAt: "2026-07-27",
  },
  {
    id: "coming-soon-2",
    title: { ar: "ترقبوا القادم", en: "Stay Tuned" },
    subtitle: { ar: "كتاب جديد قيد الإعداد", en: "A new book in the works" },
    author: "رقيم",
    authorSlug: "raqim",
    authorBio: { ar: "", en: "" },
    category: "قريبًا",
    cover: "/assets/lumora-coming-soon-02.webp",
    backCoverImage: null,
    previewPages: [],
    gallery: [],
    placement: "comingSoon",
    displayOrder: 2,
    prices: {},
    stock: 0,
    sku: "",
    status: "published",
    language: { ar: "العربية", en: "Arabic" },
    format: { ar: "", en: "" },
    pages: 0,
    description: { ar: "نعمل على إصدار جديد يليق بكم.", en: "We're working on a new release worthy of you." },
    longDescription: { ar: "", en: "" },
    whoFor: [],
    features: [],
    chapters: [],
    reviews: [],
    faq: [],
    ctaLabel: { ar: "", en: "" },
    badges: [],
    accentColor: null,
    seoTitle: { ar: "", en: "" },
    seoDescription: { ar: "", en: "" },
    sales: 0,
    deletedAt: null,
    updatedAt: "2026-07-27",
  },
  {
    id: "coming-soon-3",
    title: { ar: "قريبًا", en: "Coming Soon" },
    subtitle: { ar: "إصدار جديد", en: "New Release" },
    author: "رقيم",
    authorSlug: "raqim",
    authorBio: { ar: "", en: "" },
    category: "قريبًا",
    cover: "/assets/lumora-coming-soon-03.webp",
    backCoverImage: null,
    previewPages: [],
    gallery: [],
    placement: "comingSoon",
    displayOrder: 3,
    prices: {},
    stock: 0,
    sku: "",
    status: "published",
    language: { ar: "العربية", en: "Arabic" },
    format: { ar: "", en: "" },
    pages: 0,
    description: { ar: "ترقبوا المزيد من إصدارات رقيم.", en: "Stay tuned for more releases from Raqim." },
    longDescription: { ar: "", en: "" },
    whoFor: [],
    features: [],
    chapters: [],
    reviews: [],
    faq: [],
    ctaLabel: { ar: "", en: "" },
    badges: [],
    accentColor: null,
    seoTitle: { ar: "", en: "" },
    seoDescription: { ar: "", en: "" },
    sales: 0,
    deletedAt: null,
    updatedAt: "2026-07-27",
  },
];
