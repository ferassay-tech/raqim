import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";
import { useSiteContent } from "../../admin/context/SiteContentContext";
import { A } from "./assets";
import { createJourney } from "./engine";
import type { JourneyHandle } from "./engine";
import { JOURNEY_RESTART_EVENT, markJourneySeen } from "./useJourneySeen";
import "./journey.css";

// Switching language changes the path (/ ↔ /en), and ScrollToTop then resets
// the scroll. The journey's scroll position is noted as the old language
// leaves and put back as the new one arrives, so the journey does not restart.
let pendingRestore: { y: number; language: Language; at: number } | null = null;

const VIDEO_PROPS = {
  muted: true,
  playsInline: true,
  preload: "none",
  disablePictureInPicture: true,
  disableRemotePlayback: true,
} as const;

/** One full-screen scene: sharp still (rest) → video (motion) → sharp end still (rest). */
function Scene({
  id,
  still,
  at,
  video,
  ar,
  end,
  children,
}: {
  id: string;
  still: string;
  at: number;
  video: string;
  ar: string;
  end?: { id: string; still: string; at: number };
  children?: React.ReactNode;
}) {
  return (
    <div className="j-scene" data-j={id}>
      <div className="j-pan">
        <img className="j-full" data-k={still} data-at={at} data-ar={ar} data-arb={still === "09" ? "0.5714" : "0.5625"} alt="" />
        <video className="j-full" data-j={video} data-ar={ar} {...VIDEO_PROPS} />
        {end && (
          <img className="j-full j-end" data-j={end.id} data-k={end.still} data-at={end.at} data-ar={ar} data-arb="0.5625" alt="" />
        )}
      </div>
      {children}
    </div>
  );
}

export default function Journey({
  featuredBook,
  onTone,
  onSkip,
}: {
  /** the homepage's hero book — gets its own spine in chapter 4 */
  featuredBook: { id: string; title: string } | null;
  /** true while the dark stage sits under the site nav */
  onTone?: (dark: boolean) => void;
  onSkip?: () => void;
}) {
  const { t, language, localizePath } = useLanguage();
  const { getValue } = useSiteContent();
  const rootRef = useRef<HTMLElement>(null);
  const handleRef = useRef<JourneyHandle | null>(null);
  const onToneRef = useRef(onTone);
  onToneRef.current = onTone;

  useEffect(() => {
    const handle = createJourney(rootRef.current!, {
      onTone: (dark) => onToneRef.current?.(dark),
      onEnd: markJourneySeen,
    });
    handleRef.current = handle;
    // the nav logo / replay link: rewind to the first scene
    const onRestart = () => handle.restart();
    window.addEventListener(JOURNEY_RESTART_EVENT, onRestart);
    return () => {
      window.removeEventListener(JOURNEY_RESTART_EVENT, onRestart);
      handleRef.current = null;
      handle.destroy();
    };
  }, []);

  useEffect(() => {
    const saved = pendingRestore;
    pendingRestore = null;
    if (saved && saved.language !== language && performance.now() - saved.at < 1000) {
      window.scrollTo({ top: saved.y, left: 0, behavior: "instant" });
    }
    return () => {
      pendingRestore = { y: window.scrollY, language, at: performance.now() };
    };
  }, [language]);

  const skip = () => {
    markJourneySeen();
    handleRef.current?.skip();
    onSkip?.();
  };

  // Chapter 4: the house's rooms — every spine leads to a real page.
  const spines = [
    { to: "/books", label: getValue("nav.books"), note: t("journey.spine.books") },
    ...(featuredBook
      ? [{ to: `/books/${featuredBook.id}`, label: featuredBook.title, note: t("journey.spine.featured") }]
      : []),
    { to: "/future-releases", label: getValue("nav.futureReleases"), note: t("journey.spine.future") },
    { to: "/blog", label: getValue("nav.blog"), note: t("journey.spine.blog") },
    { to: "/about", label: getValue("nav.about"), note: t("journey.spine.about") },
    { to: "/contact", label: getValue("nav.contact"), note: t("journey.spine.contact") },
  ];

  const chapterCount = 7;

  return (
    <section ref={rootRef} className="journey" aria-label={t("journey.sectionLabel")}>
      <div className="j-stage" data-j="stage">
        <div className="j-media" aria-hidden="true">
          {/* 1. sky + summit + book (V1, V2) + dive (V3) */}
          <div className="j-scene" data-j="sSky">
            <div className="j-cam" data-j="cam">
              <img className="j-L j-bgsky" data-j="bgSky" alt="" />
              <img className="j-L j-rock" data-r="1" alt="" />
              <img className="j-L j-rock" data-r="3" alt="" />
              <div className="j-L j-bookglow" data-j="bookGlow" />
              <img className="j-L j-peak" data-j="peak" alt="" />
              <img className="j-L j-sil" data-j="sil05" alt="" />
              <img className="j-L j-book" data-k="book-05" alt="" />
              <img className="j-L j-book" data-k="book-06" alt="" />
              <img className="j-L j-book" data-k="book-06b" alt="" />
              <img className="j-L j-book" data-k="book-07" alt="" />
              <video className="j-L j-blend" data-j="v1" {...VIDEO_PROPS} />
              <video className="j-L j-blend" data-j="v2" {...VIDEO_PROPS} />
              <div className="j-L j-v3back" data-j="v3back" />
              <video className="j-L j-blend" data-j="v3" {...VIDEO_PROPS} />
              <div data-j="skyPages" />
              <img className="j-L j-rock" data-r="0" alt="" />
              <img className="j-L j-rock" data-r="2" alt="" />
            </div>
          </div>
          {/* 2. tunnel: 09 → V4 */}
          <Scene id="sTun" still="09" at={0.338} video="v4" ar="1.75" />
          {/* 3. library on the lake: 10 → V5 */}
          <Scene id="sLake" still="10" at={0.448} video="v5" ar="1.791" />
          {/* 4. entry: 11 → V6 → 12 */}
          <Scene id="sEntry" still="11" at={0.598} video="v6" ar="1.791" end={{ id: "e12", still: "12", at: 0.682 }} />
          {/* 5. hall: 12 → V7 → 13, plus the close flying books */}
          <Scene id="sHall" still="12" at={0.69} video="v7" ar="1.791" end={{ id: "e13", still: "13", at: 0.818 }}>
            <div className="j-flyers" data-j="flyers" />
          </Scene>
          {/* 6. arrival and finale: 13 → V8 → 15 */}
          <Scene id="sFin" still="13" at={0.895} video="v8" ar="1.791" end={{ id: "fin15", still: "15", at: 0.955 }}>
            <div className="j-findim" data-j="finDim" />
          </Scene>
          {/* film grain over the video scenes only (hidden during the book scene) */}
          <div className="j-vgrain" data-j="vGrain" />
        </div>
        <canvas className="j-dust" data-j="dust" aria-hidden="true" />

        <div className="j-vignette" />
        <div className="j-scrim" />
        <div className="j-grain" data-j="grain" />
        <div className="j-flash" data-j="flash" />

        <div className="j-text">
          <div className="j-ch j-hero" data-in="0" data-out="0.055">
            <div>
              <p className="j-kicker">{t("home.hero.eyebrow")}</p>
              {/* a styled paragraph, not a heading: the homepage hero keeps the page's only h1 */}
              <p className="j-word">{t("home.hero.titleFallback")}</p>
              <p className="j-sub">{t("journey.hero.sub")}</p>
            </div>
            <div className="j-hint">
              <div className="j-mouse" />
              <span>{t("journey.hint")}</span>
            </div>
          </div>
          {(["c1", "c2"] as const).map((c, i) => (
            <div key={c} className="j-ch" data-in={i === 0 ? "0.06" : "0.14"} data-out={i === 0 ? "0.125" : "0.21"}>
              <div className="j-inner">
                <p className="j-label">{t(`journey.${c}.label`)}</p>
                <h2>{t(`journey.${c}.title`)}</h2>
                <p className="j-body">{t(`journey.${c}.body`)}</p>
              </div>
            </div>
          ))}
          <div className="j-ch" data-in="0.465" data-out="0.53">
            <div className="j-inner">
              <p className="j-label">{t("journey.c3.label")}</p>
              <h2>{t("journey.c3.title")}</h2>
              <p className="j-body">{t("journey.c3.body")}</p>
            </div>
          </div>
          <div className="j-ch j-wide" data-in="0.695" data-out="0.76">
            <div className="j-inner">
              <p className="j-label">{t("journey.c4.label")}</p>
              <h2>{t("journey.c4.title")}</h2>
              <p className="j-body">{t("journey.c4.body")}</p>
              <div className="j-spines">
                {spines.map((s, i) => (
                  <Link
                    key={s.to}
                    to={localizePath(s.to)}
                    className="j-spine"
                    style={{ backgroundImage: `url(${A[`spine${i + 1}`]})` }}
                  >
                    <b>{s.label}</b>
                    <small>{s.note}</small>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="j-ch j-wide" data-in="0.84" data-out="0.895">
            <div className="j-inner">
              <p className="j-label">{t("journey.c5.label")}</p>
              <h2>{t("journey.c5.title")}</h2>
              <div className="j-feats">
                {(["f1", "f2", "f3"] as const).map((f) => (
                  <div key={f} className="j-feat">
                    <h3>{t(`journey.c5.${f}.title`)}</h3>
                    <p>{t(`journey.c5.${f}.body`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="j-ch j-center" data-in="0.96" data-out="1.5">
            <div className="j-inner">
              <p className="j-label">{t("journey.c6.label")}</p>
              <h2>{t("journey.c6.title")}</h2>
              <p className="j-body">{t("journey.c6.body")}</p>
              <div className="j-ctas">
                <Link to={localizePath("/books")} className="j-btn j-btn-gold">
                  {t("journey.c6.ctaBooks")}
                </Link>
                <Link to={localizePath("/about")} className="j-btn j-btn-line">
                  {t("home.hero.aboutLink")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="j-rail" data-j="rail">
          <div className="j-bar" />
          <div className="j-fill" data-j="railFill" />
          {Array.from({ length: chapterCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${t("journey.railChapter")} ${i + 1}`}
              onClick={() => handleRef.current?.goTo(i)}
            />
          ))}
        </div>

        <button type="button" className="j-skip" data-j="skip" onClick={skip}>
          <span>{t("journey.skip")}</span>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="j-veil" data-j="veil" />

        <div className="j-loader" data-j="loader" aria-hidden="true">
          <div className="j-loader-word">{t("home.hero.titleFallback")}</div>
          <div className="j-loader-line"><i /></div>
          <small>{t("journey.loading")}</small>
        </div>

        <div className="j-cursor" data-j="cursor" />
      </div>
    </section>
  );
}
