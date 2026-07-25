/**
 * Raqim — content data layer.
 * Centralizes book/author/blog/faq copy so pages stay lean. Real copy per
 * design-brief.md (no filler verbs, no em-dashes, no fake stats).
 */

export type Book = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  authorSlug: string;
  category: string;
  cover: string;
  /** Shown on the book page's flip-through preview, in reading order. */
  previewPages?: string[];
  /** Shown once every preview page is turned. */
  backCoverImage?: string;
  excerpt: string;
  price: string;
  originalPrice?: string;
  format: string;
  pages: string;
  language: string;
  featured?: boolean;
  comingSoon?: boolean;
  whoFor?: string[];
  benefits?: { title: string; body: string }[];
  chapters?: { number: string; title: string }[];
  testimonials?: { quote: string; name: string; role: string }[];
};

export const books: Book[] = [
  {
    slug: "kuni-hajar",
    title: "كوني هاجر",
    subtitle: "دروس من سيرة هاجر لأمٍ تصنع الأجيال وتواجه التحديات بقلب مطمئن",
    author: "مها نصر",
    authorSlug: "maha-nasr",
    category: "الأمومة والإلهام الإسلامي",
    cover: "/books/kuni-hajar/cover.webp",
    previewPages: [
      "/books/kuni-hajar/page-01.webp",
      "/books/kuni-hajar/page-02.webp",
      "/books/kuni-hajar/page-03.webp",
      "/books/kuni-hajar/page-04.webp",
      "/books/kuni-hajar/page-05.webp",
    ],
    backCoverImage: "/books/kuni-hajar/back.webp",
    excerpt:
      "رحلة في سيرة هاجر عليها السلام، تستخلص منها الأم المعاصرة دروسًا في الصبر والثبات وصناعة الأثر الذي يبقى بعد الإنجاز.",
    price: " $10",
    originalPrice: " $15.99",
    format: "كتاب رقمي PDF فاخر",
    pages: "١٨٦ صفحة",
    language: "العربية",
    featured: true,
    whoFor: [
      "الأم التي تشعر أحيانًا أن الطريق طويل ومتعب، وتبحث عن معنى أعمق لتعبها.",
      "المرأة التي تستعد لتكون أمًا، وتريد أن تبني قناعاتها قبل أن تبدأ الرحلة.",
      "كل من أحبت سيرة هاجر عليها السلام، وتريد أن تستلهم منها في حياتها اليومية.",
      "من تبحث عن كتاب يجمع بين العمق الروحي والتطبيق العملي، بلا تكلّف.",
    ],
    benefits: [
      { title: "ثبات في وجه التحديات", body: "دروس عملية من صبر هاجر تساعدك على مواجهة أصعب أيامك بقلب مطمئن." },
      { title: "وعي بدورك الحقيقي", body: "فهم أعمق لأثر الأم الذي يتجاوز الإنجاز الظاهر إلى بناء الأجيال." },
      { title: "سكينة روحية يومية", body: "تأملات قصيرة تعيدك إلى مركز هدوئك في وسط ضغوط الأمومة." },
      { title: "لغة قريبة من قلبك", body: "أسلوب دافئ وصادق، بعيد عن الوعظ المباشر أو التكلف." },
      { title: "كتاب يُقرأ ويُهدى", body: "تصميم فاخر يجعله رفيقًا يوميًا وهدية ذات معنى في آنٍ واحد." },
    ],
    chapters: [
      { number: "١", title: "من أنتِ حين يضيق بكِ الطريق" },
      { number: "٢", title: "بئر زمزم: حين يأتي الفرج من حيث لا تحتسبين" },
      { number: "٣", title: "الأثر الذي تصنعه الأم في صمت" },
      { number: "٤", title: "أن تكوني هاجر في زمانك" },
    ],
    testimonials: [
      {
        quote: "كتاب غيّر نظرتي لتعبي اليومي كأم. شعرت أن أحدًا أخيرًا فهم ما أمرّ به وكتب عنه بصدق.",
        name: "هيجر البلتاجي",
        role: "قارئة من غزة",
      },
      {
        quote: "لغة راقية وصادقة، وتصميم يجعل من القراءة تجربة بحد ذاتها. أهديته لأختي وبكت من تأثره فيها.",
        name: "ايمان خليل",
        role: "قارئة",
      },
      {
        quote: "من أجمل ما قرأت عن سيرة هاجر عليها السلام بلغة معاصرة تلامس واقع الأم اليوم.",
        name: "نورة المصري",
        role: "مدربة تنمية أسرية",
      },
    ],
  },
  {
  slug: "coming-soon-1",
  title: "إصدار جديد",
  subtitle: "ترقبوا قريبًا",
  author: "رقيم",
  authorSlug: "raqim",
  category: "قريبًا",
  cover: "/assets/lumora-coming-soon-01.webp",
  excerpt: "رحلة جديدة تبدأ قريبًا.",
  price: "",
  format: "",
  pages: "",
  language: "العربية",
  comingSoon: true,
},
{
  slug: "coming-soon-2",
  title: "ترقبوا القادم",
  subtitle: "كتاب جديد قيد الإعداد",
  author: "رقيم",
  authorSlug: "raqim",
  category: "قريبًا",
  cover: "/assets/lumora-coming-soon-02.webp",
  excerpt: "نعمل على إصدار جديد يليق بكم.",
  price: "",
  format: "",
  pages: "",
  language: "العربية",
  comingSoon: true,
},
{
  slug: "coming-soon-3",
  title: "قريبًا",
  subtitle: "إصدار جديد",
  author: "رقيم",
  authorSlug: "raqim",
  category: "قريبًا",
  cover: "/assets/lumora-coming-soon-03.webp",
  excerpt: "ترقبوا المزيد من إصدارات رقيم.",
  price: "",
  format: "",
  pages: "",
  language: "العربية",
  comingSoon: true,
},
];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export type Author = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  books: string[];
};

export const authors: Author[] = [
  {
  slug: "maha-nasr",
  name: "مها نصر",
  title: "كاتبة فلسطينية • مدربة في تنمية المرأة والأسرة",
  bio: "مها نصر كاتبة فلسطينية من مواليد غزة، ومدربة في تنمية المرأة والأسرة. تهتم ببناء الوعي التربوي والنفسي، وتستلهم في كتاباتها القيم الإيمانية والتجارب الإنسانية الواقعية، لتقدم محتوى يجمع بين الدفء والعمق، ويخاطب المرأة والأم بلغة قريبة من القلب. ويأتي كتابها الأول «كوني هاجر» ليكون بداية رحلة أدبية تهدف إلى إلهام المرأة وبناء أثر يبقى.",
  books: ["kuni-hajar"],
},
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "athar-la-yunsa",
    title: "الأثر الذي لا يُنسى: كيف تصنع الأم أجيالًا لا كتبًا فقط",
    excerpt: "تأمل في معنى الأثر الحقيقي الذي تتركه الأم في أبنائها، وكيف يختلف عن مجرد الإنجاز الظاهر.",
    category: "الأمومة",
    readTime: "٦ دقائق",
    date: "٢٠٢٦/٠٦/١٢",
    body: [
      "كثيرًا ما نقيس نجاح الأم بما تُنجزه في يومها: وجبة أُعدّت، بيت رُتّب، مهمة أُنجزت. لكن الأثر الحقيقي الذي تتركه الأم لا يُقاس بهذا الميزان.",
      "الأثر يكمن في اللحظات الصغيرة التي لا تُرى: نظرة اطمئنان، كلمة صبر، قرار هادئ في وسط الفوضى. هذه اللحظات هي التي تبني الأجيال، لا الإنجازات الظاهرة.",
      "حين نفهم هذا الفرق، يتغيّر شعورنا تجاه التعب اليومي. لا نعود نراه عبئًا بلا معنى، بل استثمارًا صامتًا في إنسان سيحمل قيمنا بعدنا.",
    ],
  },
  {
    slug: "sabr-hajar",
    title: "ما الذي تعلمناه من صبر هاجر عليها السلام",
    excerpt: "قراءة في محطات سيرة هاجر، وما تحمله من دروس عملية للمرأة في زمننا هذا.",
    category: "إلهام إسلامي",
    readTime: "٥ دقائق",
    date: "٢٠٢٦/٠٥/٢٨",
    body: [
      "حين تُركت هاجر عليها السلام وحدها مع ابنها في وادٍ لا زرع فيه، لم تستسلم، بل سعت بين الصفا والمروة سبع مرات باحثة عن الفرج.",
      "هذا المشهد يحمل درسًا عميقًا: الصبر ليس سكونًا، بل حركة دائبة نحو الأمل حتى حين لا تظهر بوادره.",
      "كل أم تمر بلحظات تشعر فيها أنها وحيدة في مواجهة التحديات. سيرة هاجر تذكّرنا أن السعي نفسه عبادة، وأن الفرج يأتي حين لا نتوقعه.",
    ],
  },
  {
    slug: "kitab-hadiya",
    title: "لماذا يبقى الكتاب أجمل هدية لأمٍ تحبينها",
    excerpt: "أفكار حول تقديم الكتاب كهدية ذات معنى، بعيدًا عن الهدايا العابرة.",
    category: "الكتاب كهدية",
    readTime: "٤ دقائق",
    date: "٢٠٢٦/٠٥/١٠",
    body: [
      "الهدايا العابرة تُنسى بسرعة، لكن الكتاب الذي يلامس القلب يبقى على الرف لسنوات، يُعاد فتحه كلما احتجنا إلى كلمة صادقة.",
      "حين تُهدين كتابًا لأمٍ تحبينها، فأنتِ تُهدينها وقتًا مخصصًا لها وحدها، ورسالة مفادها: أراكِ، وأقدّر تعبك.",
      "اختيار كتاب مصمم بعناية، مثل كوني هاجر، يجعل من الهدية تجربة كاملة: من التصميم إلى الكلمة، وهذا ما يجعلها لا تُنسى.",
    ],
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: "كيف أستلم الكتاب بعد الشراء؟",
    answer:
      "فور إتمام عملية الشراء، تصلك رسالة على بريدك الإلكتروني تحتوي على رابط تحميل نسختك الرقمية الفاخرة بصيغة PDF، متاح للتحميل في أي وقت.",
  },
  {
    question: "هل يمكنني قراءة الكتاب على الهاتف والآيباد والكمبيوتر؟",
    answer:
      "نعم، الكتاب مصمم ليُقرأ بجودة عالية على جميع الأجهزة: الهاتف، الآيباد، وشاشة الكمبيوتر، مع الحفاظ على جمال التصميم وسهولة القراءة.",
  },
  {
    question: "هل يمكن استرجاع المنتج بعد الشراء؟",
    answer:
      "نظرًا لأن منتجات رقيم رقمية ويتم تحميلها مباشرة بعد إتمام الشراء، فلا يمكن استرجاعها أو استبدالها بعد إتمام عملية الدفع، إلا في حال وجود مشكلة تقنية تمنع الوصول إلى المنتج. إذا واجهتِ أي مشكلة، يسعدنا مساعدتك عبر البريد الإلكتروني.",
  },
  {
    question: "هل الكتاب مناسب لجميع الأعمار؟",
    answer:
      "كُتب هذا الكتاب خصيصًا للمرأة البالغة، الأم أو التي تستعد لتكون أمًا، والباحثة عن إلهام روحي وعملي في آنٍ واحد.",
  },
  {
    question: "هل ستصدر رقيم كتبًا جديدة؟",
    answer:
      "نعم، رقيم دار نشر مستمرة، وتصدر كتبًا ودفاتر ومنتجات تعليمية جديدة بانتظام. يمكنك الانضمام إلى نشرتنا البريدية لتصلك أول إشعار بكل إصدار جديد.",
  },
];



