import type { AdminArticleRaw } from "../types/article";

// The real, live blog posts from the public site — migrated from the
// project's early static content file's blogPosts (Milestone 3.1). Not demo
// content. Every copy field is bilingual ({ar, en}) — en starts empty (admin
// fills it in later), same convention as the SiteContent/Books/Categories
// migration. readTime/author/slug/id stay plain — see AdminArticleRaw.
export const INITIAL_ARTICLES: AdminArticleRaw[] = [
  {
    id: "athar-la-yunsa",
    title: {
      ar: "الأثر الذي لا يُنسى: كيف تصنع الأم أجيالًا لا كتبًا فقط",
      en: "A Legacy That Lasts: How a Mother Shapes Generations, Not Just Achievements",
    },
    slug: "athar-la-yunsa",
    excerpt: {
      ar: "تأمل في معنى الأثر الحقيقي الذي تتركه الأم في أبنائها، وكيف يختلف عن مجرد الإنجاز الظاهر.",
      en: "A reflection on the real legacy a mother leaves in her children — and how it differs from what simply gets done.",
    },
    content: {
      ar: "كثيرًا ما نقيس نجاح الأم بما تُنجزه في يومها: وجبة أُعدّت، بيت رُتّب، مهمة أُنجزت. لكن الأثر الحقيقي الذي تتركه الأم لا يُقاس بهذا الميزان.\n\nالأثر يكمن في اللحظات الصغيرة التي لا تُرى: نظرة اطمئنان، كلمة صبر، قرار هادئ في وسط الفوضى. هذه اللحظات هي التي تبني الأجيال، لا الإنجازات الظاهرة.\n\nحين نفهم هذا الفرق، يتغيّر شعورنا تجاه التعب اليومي. لا نعود نراه عبئًا بلا معنى، بل استثمارًا صامتًا في إنسان سيحمل قيمنا بعدنا.",
      en: "We often measure a mother's success by what she gets done in a day: a meal prepared, a home tidied, a task checked off. But the real legacy a mother leaves behind can't be measured on that scale.\n\nThat legacy lives in the small, unseen moments: a reassuring glance, a patient word, a calm decision made in the middle of chaos. These are the moments that shape generations — not the visible achievements.\n\nOnce we understand this difference, the way we feel about daily exhaustion changes. It no longer feels like a meaningless burden, but a quiet investment in a person who will carry our values forward.",
    },
    coverImage: null,
    author: "مها نصر",
    category: { ar: "الأمومة", en: "Motherhood" },
    readTime: "٦ دقائق",
    status: "published",
    scheduledFor: null,
    publishedAt: "2026-06-12",
    updatedAt: "2026-06-12",
    seoTitle: { ar: "الأثر الذي لا يُنسى — مدونة رقيم", en: "A Legacy That Lasts — Raqim Blog" },
    seoDescription: {
      ar: "تأمل في معنى الأثر الحقيقي الذي تتركه الأم في أبنائها.",
      en: "A reflection on the real legacy a mother leaves in her children.",
    },
  },
  {
    id: "sabr-hajar",
    title: {
      ar: "ما الذي تعلمناه من صبر هاجر عليها السلام",
      en: "What We Learned From the Patience of Hajar, Peace Be Upon Her",
    },
    slug: "sabr-hajar",
    excerpt: {
      ar: "قراءة في محطات سيرة هاجر، وما تحمله من دروس عملية للمرأة في زمننا هذا.",
      en: "A look at the story of Hajar, and the practical lessons it holds for women today.",
    },
    content: {
      ar: "حين تُركت هاجر عليها السلام وحدها مع ابنها في وادٍ لا زرع فيه، لم تستسلم، بل سعت بين الصفا والمروة سبع مرات باحثة عن الفرج.\n\nهذا المشهد يحمل درسًا عميقًا: الصبر ليس سكونًا، بل حركة دائبة نحو الأمل حتى حين لا تظهر بوادره.\n\nكل أم تمر بلحظات تشعر فيها أنها وحيدة في مواجهة التحديات. سيرة هاجر تذكّرنا أن السعي نفسه عبادة، وأن الفرج يأتي حين لا نتوقعه.",
      en: "When Hajar, peace be upon her, was left alone with her son in a barren valley, she didn't give up — she walked between Safa and Marwah seven times, searching for relief.\n\nThat moment carries a deep lesson: patience isn't stillness — it's a persistent movement toward hope, even when no sign of it appears.\n\nEvery mother has moments when she feels alone in the face of her challenges. Hajar's story reminds us that the effort itself is an act of worship, and that relief often comes when we least expect it.",
    },
    coverImage: null,
    author: "مها نصر",
    category: { ar: "إلهام إسلامي", en: "Islamic Inspiration" },
    readTime: "٥ دقائق",
    status: "published",
    scheduledFor: null,
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    seoTitle: {
      ar: "ما الذي تعلمناه من صبر هاجر عليها السلام — مدونة رقيم",
      en: "What We Learned From the Patience of Hajar — Raqim Blog",
    },
    seoDescription: {
      ar: "قراءة في محطات سيرة هاجر، وما تحمله من دروس عملية للمرأة اليوم.",
      en: "A look at the story of Hajar, and the practical lessons it holds for women today.",
    },
  },
  {
    id: "kitab-hadiya",
    title: {
      ar: "لماذا يبقى الكتاب أجمل هدية لأمٍ تحبينها",
      en: "Why a Book Remains the Most Beautiful Gift for a Mother You Love",
    },
    slug: "kitab-hadiya",
    excerpt: {
      ar: "أفكار حول تقديم الكتاب كهدية ذات معنى، بعيدًا عن الهدايا العابرة.",
      en: "Thoughts on giving a book as a meaningful gift, far from anything fleeting.",
    },
    content: {
      ar: "الهدايا العابرة تُنسى بسرعة، لكن الكتاب الذي يلامس القلب يبقى على الرف لسنوات، يُعاد فتحه كلما احتجنا إلى كلمة صادقة.\n\nحين تُهدين كتابًا لأمٍ تحبينها، فأنتِ تُهدينها وقتًا مخصصًا لها وحدها، ورسالة مفادها: أراكِ، وأقدّر تعبك.\n\nاختيار كتاب مصمم بعناية، مثل كوني هاجر، يجعل من الهدية تجربة كاملة: من التصميم إلى الكلمة، وهذا ما يجعلها لا تُنسى.",
      en: "Fleeting gifts are forgotten quickly, but a book that touches the heart stays on the shelf for years, opened again whenever we need an honest word.\n\nWhen you give a book to a mother you love, you're giving her time set aside just for her, and a message that says: I see you, and I value everything you carry.\n\nChoosing a carefully crafted book, like Be Hajar, turns the gift into a complete experience — from the design to the words — and that's what makes it unforgettable.",
    },
    coverImage: null,
    author: "مها نصر",
    category: { ar: "الكتاب كهدية", en: "The Book as a Gift" },
    readTime: "٤ دقائق",
    status: "published",
    scheduledFor: null,
    publishedAt: "2026-05-10",
    updatedAt: "2026-05-10",
    seoTitle: { ar: "لماذا يبقى الكتاب أجمل هدية — مدونة رقيم", en: "Why a Book Remains the Most Beautiful Gift — Raqim Blog" },
    seoDescription: {
      ar: "أفكار حول تقديم الكتاب كهدية ذات معنى لأمٍ تحبينها.",
      en: "Thoughts on giving a book as a meaningful gift to a mother you love.",
    },
  },
];
