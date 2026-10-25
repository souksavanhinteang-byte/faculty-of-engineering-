import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import * as motion from 'motion/react-m'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import SceneStudy from './components/SceneStudy'
import { t, type Lang, ui, editorial } from './content'
import {
  departments,
  facultySources,
  facultyAbout,
  universityVision,
  facultyTimeline,
  learningTopics,
  studentResources,
  facultyNews,
  facultyContact,
  facultyLabels,
  ownerFacebook,
  type SourceId,
} from './faculty-content'

const facebook = ownerFacebook

function OfficialSource({
  id,
  lang,
  light = false,
}: {
  id: SourceId
  lang: Lang
  light?: boolean
}) {
  return (
    <a
      className={`source-link ${light ? 'source-link-light' : ''}`}
      href={facultySources[id].urls[lang]}
      target="_blank"
      rel="noopener noreferrer"
    >
      {t(facultyLabels.source, lang)}
      <span aria-hidden="true">↗</span>
    </a>
  )
}

function Icon({
  name = 'arrow',
  className = '',
}: {
  name?: 'arrow' | 'diagonal' | 'close' | 'plus' | 'globe' | 'left' | 'right'
  className?: string
}) {
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'arrow' && <path d="M4 12h15m-6-6 6 6-6 6" />}
      {name === 'diagonal' && <path d="M6 18 18 6M6 6h12v12" />}
      {name === 'close' && <path d="m6 6 12 12M6 18 18 6" />}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
      {name === 'left' && <path d="m14 5-7 7 7 7" />}
      {name === 'right' && <path d="m10 5 7 7-7 7" />}
      {name === 'globe' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4c5 5 5 11 0 16-5-5-5-11 0-16Z" />
        </>
      )}
    </svg>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function DepartmentDrawing({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 400 240" className="department-drawing" fill="none" aria-hidden="true">
      <defs>
        <pattern id="blueprint-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0v24" stroke="currentColor" strokeOpacity=".09" strokeWidth="1" />
        </pattern>
      </defs>
      <path fill="url(#blueprint-grid)" d="M0 0h400v240H0z" />
      <ellipse
        cx="200"
        cy="201"
        rx="143"
        ry="23"
        stroke="currentColor"
        strokeOpacity=".2"
        strokeDasharray="3 5"
      />
      {index === 0 || index === 8 ? (
        <g stroke="currentColor" strokeWidth="1.4">
          <path d="m43 157 154 40 158-80-154-37-158 77ZM84 166v-64l113 30 115-58v65M197 132v65M84 102l113 95M197 132l115 7M110 109v64m29-56v63m29-55v63m58-70v63m29-78v63m29-78v63" />
          <path d="m62 117 135 37 137-69M62 140l135 37 137-69" stroke="#b79a59" strokeWidth="2.5" />
          <path d="M55 183v-16m-8 8h16M340 151v-16m-8 8h16" opacity=".4" />
        </g>
      ) : index === 1 || index === 3 || index === 4 ? (
        <g stroke="currentColor" strokeWidth="1.5">
          <path d="m118 92 83-46 83 46v74l-83 47-83-47V92Zm0 0 83 47 83-47m-83 47v74" />
          <path
            d="m151 94 50-28 50 28-50 29-50-29Zm0 0v44l50 29 50-29V94"
            stroke="#b79a59"
            strokeWidth="2.5"
          />
          <path d="m118 112-33-18V71m33 62-52-29V81m52 75-34-19v36m200-61 33-18V71m-33 62 52-29V81m-52 75 34-19v36" />
          <g fill="#b79a59" stroke="none">
            {[
              [85, 67],
              [66, 77],
              [84, 177],
              [317, 67],
              [336, 77],
              [318, 177],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="4" />
            ))}
          </g>
        </g>
      ) : index === 2 || index === 5 || index === 7 ? (
        <g stroke="currentColor" strokeWidth="1.5">
          <path d="m200 44 71 41v82l-71 41-71-41V85l71-41Zm0 0v82m71-41-71 41-71-41m71 41v82m-71-41 71-41 71 41" />
          <circle cx="200" cy="126" r="30" stroke="#b79a59" strokeWidth="2" />
          <circle
            cx="200"
            cy="126"
            r="65"
            stroke="#b79a59"
            strokeDasharray="3 6"
            transform="rotate(-30 200 126)"
          />
          <path d="M74 126h28m196 0h28M200 9v21m0 192v16" opacity=".4" />
        </g>
      ) : (
        <g stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="200" cy="126" rx="102" ry="65" transform="rotate(-30 200 126)" />
          <ellipse cx="200" cy="126" rx="72" ry="44" transform="rotate(-30 200 126)" />
          <ellipse
            cx="200"
            cy="126"
            rx="35"
            ry="20"
            transform="rotate(-30 200 126)"
            stroke="#b79a59"
            strokeWidth="3"
          />
          <path d="m126 164-29 17m177-94 29-17M172 76l-12-20m68 120 12 20M200 126v-43m0 43 38 21m-38-21-38 21" />
          <path d="m97 181 63 15 143-90V70M97 181v-40m206-71-65-17" stroke="#b79a59" />
        </g>
      )}
      <g fill="currentColor" opacity=".45" fontFamily="monospace" fontSize="8">
        <text x="18" y="22">
          FIG. {String(index + 1).padStart(2, '0')}
        </text>
        <text x="299" y="222">
          CONCEPT STUDY
        </text>
      </g>
    </svg>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem('nuol-lang') === 'en' ? 'en' : 'lo'
    } catch {
      return 'lo'
    }
  })
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState('home')
  const [dept, setDept] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const imageTrigger = useRef<HTMLButtonElement>(null)
  const campus = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const { scrollYProgress: campusProgress } = useScroll({
    target: campus,
    offset: ['start end', 'end start'],
  })
  const photoY = useTransform(campusProgress, [0, 1], [reduced ? 0 : -25, reduced ? 0 : 25])
  const d = departments[dept]
  const official = facultySources.home.urls[lang]
  const c = (key: keyof typeof editorial) => t(editorial[key], lang)
  const f = (key: keyof typeof facultyLabels) => t(facultyLabels[key], lang)

  useLayoutEffect(() => {
    let frame = 0
    let disposed = false
    let previousSize = ''
    const refresh = () => {
      if (disposed) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const size = `${document.documentElement.scrollHeight}:${window.innerWidth}:${window.innerHeight}:${campus.current?.offsetHeight}`
        if (size === previousSize) return
        previousSize = size
        window.dispatchEvent(new Event('resize'))
      })
    }
    // Motion remeasures scroll offsets after translations, font loads, or changing panel heights.
    const observer = new ResizeObserver(refresh)
    observer.observe(document.body)
    if (campus.current) observer.observe(campus.current)
    void document.fonts.ready.then(refresh)
    document.fonts.addEventListener('loadingdone', refresh)
    refresh()
    return () => {
      disposed = true
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', refresh)
      cancelAnimationFrame(frame)
    }
  }, [lang])

  useLayoutEffect(() => {
    document.documentElement.lang = lang
    document.title = `${t(ui.name, lang)} · NUOL`
    try {
      localStorage.setItem('nuol-lang', lang)
    } catch {
      /* Storage is optional. */
    }
  }, [lang])
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
    )
    ui.nav.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!menu) return
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menu])
  useEffect(() => {
    const element = dialog.current
    if (lightbox !== null && element && !element.open) element.showModal()
    if (lightbox === null && element?.open) {
      element.close()
      imageTrigger.current?.focus()
    }
    if (lightbox === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lightbox])

  useLayoutEffect(() => {
    // Signal after the shell's other layout effects, so startup errors can still show Retry.
    // Fonts, photos and Three.js are independent of this essential commit.
    window.__nuolEntrance?.ready()
  }, [])

  const changePhoto = (direction: number) =>
    setLightbox((current) =>
      current === null ? null : (current + direction + ui.photos.length) % ui.photos.length,
    )
  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      event.key === 'ArrowDown'
        ? (index + 1) % departments.length
        : event.key === 'ArrowUp'
          ? (index + departments.length - 1) % departments.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? departments.length - 1
              : null
    if (next !== null) {
      event.preventDefault()
      setDept(next)
      document.getElementById(`department-tab-${next}`)?.focus()
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <a className="skip-link" href="#main">
          {t(ui.skip, lang)}
        </a>
        <motion.div className="reading-progress" style={{ scaleX: progress }} />
        <header className="site-header">
          <div className="header-inner">
            <a
              className="brand"
              href="#home"
              onClick={() => setMenu(false)}
              aria-label={`${t(ui.name, lang)} — ${t(ui.nav[0], lang)}`}
            >
              <img
                src="/picture/logo.jpg"
                alt=""
                width="48"
                height="48"
                decoding="async"
                fetchPriority="high"
              />
              <span>
                <strong>{t(ui.name, lang)}</strong>
                <small>{t(ui.university, lang)}</small>
              </span>
            </a>
            <nav
              id="main-navigation"
              className={`main-navigation ${menu ? 'is-open' : ''}`}
              aria-label={c('mainNavigation')}
            >
              {ui.nav
                .filter((item) => item.id !== 'home')
                .map((item) => (
                  <a
                    key={item.id}
                    className={active === item.id ? 'is-active' : ''}
                    href={`#${item.id}`}
                    onClick={() => setMenu(false)}
                  >
                    {item[lang]}
                    <span />
                  </a>
                ))}
            </nav>
            <div className="header-actions">
              <div className="language-switch" aria-label={c('language')}>
                <Icon name="globe" />
                <button aria-pressed={lang === 'lo'} onClick={() => setLang('lo')} lang="lo">
                  ລາວ
                </button>
                <span>/</span>
                <button aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">
                  EN
                </button>
              </div>
              <a className="header-cta" href="#departments">
                {c('findPath')}
                <Icon name="diagonal" />
              </a>
              <button
                ref={menuButton}
                className={`menu-button ${menu ? 'is-open' : ''}`}
                aria-label={t(menu ? ui.close : ui.menu, lang)}
                aria-expanded={menu}
                aria-controls="main-navigation"
                onClick={() => setMenu(!menu)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </header>
        {menu && (
          <button
            className="menu-backdrop"
            aria-label={t(ui.close, lang)}
            onClick={() => setMenu(false)}
          />
        )}
        <main id="main">
          <section id="home" className="hero section-shell">
            <div className="hero-main">
              <div className="hero-copy">
                <div>
                  <p className="eyebrow">
                    <span className="status-dot" />
                    {t(ui.heroKicker, lang)}
                  </p>
                </div>
                <div>
                  <h1>
                    {c('heroFirst')}
                    <br />
                    <span>{c('heroSecond')}</span>
                    <span className="hero-period">.</span>
                  </h1>
                </div>
                <div>
                  <p className="hero-description">{c('heroDescription')}</p>
                </div>
                <div className="hero-actions">
                  <a className="button button-dark" href="#departments">
                    {t(ui.explore, lang)}
                    <Icon name="diagonal" />
                  </a>
                  <a className="link-button" href="#about">
                    {t(ui.discover, lang)}
                    <span className="circle-arrow">
                      <Icon />
                    </span>
                  </a>
                </div>
                <div>
                  <div className="hero-note">
                    <span className="tiny-cross">+</span>
                    {c('heroNote')}
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-topline">
                  <span>NUOL / ENGINEERING</span>
                  <span>V.01 — 3D</span>
                </div>
                <div className="model-orbit" aria-hidden="true" />
                <span className="model-coordinate coordinate-top" aria-hidden="true">
                  + CONCEPT STUDY
                </span>
                <span className="model-coordinate coordinate-side" aria-hidden="true">
                  FORM FOLLOWS CURIOSITY
                </span>
                <SceneStudy lang={lang} />
                <div className="visual-bottomline">
                  <span>
                    <i />
                    {c('interactiveStudy')}
                  </span>
                  <span>01 / 01</span>
                </div>
              </div>
            </div>
            <div className="hero-bottom">
              <a className="scroll-cue" href="#about">
                <span>↓</span>
                {c('scrollExplore')}
              </a>
              <div className="hero-fact">
                <strong>{departments.length}</strong>
                <span>{c('fieldsStudy')}</span>
              </div>
              <div className="hero-fact">
                <strong>∞</strong>
                <span>{c('possibilities')}</span>
              </div>
              <div className="hero-location">
                <span className="location-dot" />
                {c('location')}
              </div>
            </div>
          </section>

          <section id="about" className="about-section" ref={campus}>
            <div className="section-shell about-inner">
              <Reveal className="about-heading">
                <p className="eyebrow light">
                  <span>01</span>
                  {c('ourFaculty')}
                </p>
                <h2>
                  {c('aboutFirst')}
                  <br />
                  <span>{c('aboutSecond')}</span>
                </h2>
              </Reveal>
              <Reveal className="about-description" delay={0.1}>
                <p>{t(facultyAbout.body, lang)}</p>
                <div className="faculty-vision">
                  <h3>{f('universityVision')}</h3>
                  <p>{t(universityVision.body, lang)}</p>
                  <a
                    className="vision-link"
                    href={facultySources.vision.urls[lang]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {f('readVision')}
                    <Icon name="diagonal" />
                  </a>
                </div>
                <a
                  className="text-link light-link"
                  href={official}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(ui.official, lang)}
                  <Icon name="diagonal" />
                </a>
                <OfficialSource id="history" lang={lang} light />
              </Reveal>
              <div
                id="faculty-history"
                className="faculty-timeline"
                aria-labelledby="timeline-heading"
              >
                <Reveal>
                  <h3 id="timeline-heading" className="timeline-kicker">
                    {f('timeline')}
                  </h3>
                </Reveal>
                <motion.div
                  className="timeline-rule"
                  aria-hidden="true"
                  initial={{ scaleX: reduced ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <ol>
                  {facultyTimeline.map((milestone, index) => (
                    <li key={milestone.date}>
                      <Reveal delay={index * 0.12}>
                        <span className="timeline-marker" aria-hidden="true" />
                        <time dateTime={milestone.date}>{t(milestone.label, lang)}</time>
                        <h4>{t(milestone.title, lang)}</h4>
                        <p>{t(milestone.body, lang)}</p>
                      </Reveal>
                    </li>
                  ))}
                </ol>
                <OfficialSource id="history" lang={lang} light />
              </div>
              <Reveal className="campus-feature">
                <div className="campus-photo">
                  <picture>
                    <source srcSet="/picture/pic-1.webp" type="image/webp" />
                    <motion.img
                      style={{ y: photoY }}
                      src="/picture/pic-1.png"
                      alt={f('campusAlt')}
                      width="810"
                      height="494"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div className="campus-photo-shade" />
                  <div className="campus-image-copy">
                    <span>{c('campusLabel')}</span>
                    <h3>{c('campusTitle')}</h3>
                  </div>
                  <span className="photo-corner">+</span>
                </div>
                <div className="campus-caption">
                  <span>{c('campusCaption')}</span>
                  <span>NUOL · LAO PDR</span>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="departments" className="departments-section section-shell">
            <Reveal className="section-heading">
              <div>
                <p className="eyebrow">
                  <span>02</span>
                  {t(ui.deptsKicker, lang).replace(/^02 · /, '')}
                </p>
                <h2>
                  {c('departmentsFirst')}
                  <br />
                  <span>{c('departmentsSecond')}</span>
                </h2>
              </div>
              <p className="section-intro">{c('departmentsDescription')}</p>
            </Reveal>
            <Reveal className="department-explorer">
              <div className="mobile-department-picker">
                <label htmlFor="department-select">{t(ui.deptsText, lang)}</label>
                <div>
                  <select
                    id="department-select"
                    value={dept}
                    onChange={(event) => setDept(Number(event.target.value))}
                  >
                    {departments.map((item, index) => (
                      <option value={index} key={item.id}>
                        {String(index + 1).padStart(2, '0')} — {t(item.name, lang)}
                      </option>
                    ))}
                  </select>
                  <Icon name="plus" />
                </div>
              </div>
              <div
                className="department-list"
                role="tablist"
                aria-label={t(ui.deptsTitle, lang)}
                aria-orientation="vertical"
              >
                {departments.map((item, index) => (
                  <button
                    key={item.id}
                    role="tab"
                    id={`department-tab-${index}`}
                    aria-selected={dept === index}
                    aria-controls="department-panel"
                    tabIndex={dept === index ? 0 : -1}
                    onKeyDown={(event) => tabKey(event, index)}
                    onClick={() => setDept(index)}
                    className={`department-tab ${dept === index ? 'is-selected' : ''}`}
                  >
                    <span className="department-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="department-name">{t(item.name, lang)}</span>
                    <Icon name={dept === index ? 'diagonal' : 'plus'} />
                  </button>
                ))}
              </div>
              <div
                id="department-panel"
                className="department-panel"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby={`department-tab-${dept}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${d.id}-${lang}`}
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  >
                    <div className="department-panel-top">
                      <span>{c('areaOfStudy')}</span>
                      <span>
                        {String(dept + 1).padStart(2, '0')} / {departments.length}
                      </span>
                    </div>
                    <DepartmentDrawing index={dept} />
                    <div className="department-panel-copy">
                      <span className="department-category">
                        {f(d.fieldOverviewOnly ? 'fieldOverview' : 'departmentOverview')}
                      </span>
                      <h3>{t(d.name, lang)}</h3>
                      <p>{t(d.description, lang)}</p>
                      {d.bachelorMajors && (
                        <div className="department-majors">
                          <h4>{f('bachelorMajors')}</h4>
                          <ul>
                            {d.bachelorMajors.map((major) => (
                              <li key={major.en}>{t(major, lang)}</li>
                            ))}
                          </ul>
                          <p>{f('majorsNote')}</p>
                        </div>
                      )}
                      <a
                        className="text-link"
                        href={facultySources[d.source].urls[lang]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(ui.moreOfficial, lang)}
                        <Icon name="diagonal" />
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="department-panel-footnote">
                  <OfficialSource id={d.source} lang={lang} />
                </div>
              </div>
            </Reveal>
            <OfficialSource id="departments" lang={lang} />
          </section>

          <section id="learning" className="learning-section" aria-labelledby="learning-heading">
            <div className="section-shell">
              <Reveal className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span>03</span>
                    {f('learningKicker')}
                  </p>
                  <h2 id="learning-heading">
                    {f('learningFirst')}
                    <br />
                    <span>{f('learningSecond')}</span>
                  </h2>
                </div>
                <p className="section-intro">{f('learningIntro')}</p>
              </Reveal>
              <div className="learning-topics">
                {learningTopics.map((topic, index) => (
                  <Reveal className="learning-topic" key={topic.id} delay={index * 0.08}>
                    <span className="topic-index" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <div>
                      <h3>{t(topic.title, lang)}</h3>
                      <p>{t(topic.body, lang)}</p>
                    </div>
                    <div className="learning-topic-links">
                      <a
                        className="text-link"
                        href={facultySources[topic.source].urls[lang]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(topic.linkLabel, lang)}
                        <Icon name="diagonal" />
                      </a>
                      <OfficialSource id={topic.source} lang={lang} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="life" className="life-section">
            <div className="section-shell">
              <Reveal className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span>04</span>
                    {c('lifeKicker')}
                  </p>
                  <h2>
                    {c('lifeFirst')}
                    <br />
                    <span>{c('lifeSecond')}</span>
                  </h2>
                </div>
                <p className="section-intro">{t(ui.lifeText, lang)}</p>
              </Reveal>
              <div className="photo-grid">
                {ui.photos.map((photo, index) => (
                  <Reveal key={photo.src} className="student-photo" delay={index * 0.1}>
                    <figure>
                      <button
                        onClick={(event) => {
                          imageTrigger.current = event.currentTarget
                          setLightbox(index)
                        }}
                        aria-label={`${t(ui.openImage, lang)}: ${photo[lang]}`}
                      >
                        <div className="photo-frame">
                          <img
                            src={photo.src}
                            alt={photo[lang]}
                            width="206"
                            height="206"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="photo-open">
                            <Icon name="diagonal" />
                          </span>
                          <span className="photo-tag">
                            {index === 0
                              ? c('photoTagOne')
                              : index === 1
                                ? c('photoTagTwo')
                                : c('photoTagThree')}
                          </span>
                        </div>
                      </button>
                      <figcaption>
                        <span className="photo-index">0{index + 1}</span>
                        <span>{photo[lang]}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
              <Reveal className="life-bottom">
                <span className="tiny-cross">+</span>
                <p>{c('lifeNote')}</p>
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-link">
                  {t(ui.facebook, lang)}
                  <Icon name="diagonal" />
                </a>
              </Reveal>
              <div
                id="student-information"
                className="student-resources"
                aria-labelledby="student-resources-heading"
              >
                <Reveal>
                  <h3 id="student-resources-heading" className="resources-heading">
                    {f('resources')}
                  </h3>
                </Reveal>
                <div>
                  {studentResources.map((resource, index) => (
                    <Reveal className="student-resource" key={resource.id} delay={index * 0.07}>
                      <a
                        href={facultySources[resource.source].urls[lang]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t(resource.title, lang)} — ${f('officialPage')}`}
                      >
                        <span>
                          <h4>{t(resource.title, lang)}</h4>
                          <p>{t(resource.body, lang)}</p>
                        </span>
                        <Icon name="diagonal" />
                      </a>
                      <OfficialSource id={resource.source} lang={lang} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {facultyNews.length > 0 && (
            <section
              id="faculty-news"
              className="faculty-news section-shell"
              aria-labelledby="faculty-news-heading"
            >
              <Reveal className="news-heading">
                <p className="eyebrow">
                  <span>05</span>
                  {f('archive')}
                </p>
                <h2 id="faculty-news-heading">{f('news')}</h2>
              </Reveal>
              <div>
                {facultyNews.slice(0, 3).map((article) => (
                  <Reveal className="faculty-news-item" key={article.id}>
                    <div className="news-date">
                      <span>{f('published')}</span>
                      <time dateTime={article.publishedOn}>{t(article.displayDate, lang)}</time>
                    </div>
                    <div className="news-copy">
                      <h3>
                        <a
                          href={facultySources[article.source].urls[lang]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t(article.title, lang)}
                          <Icon name="diagonal" />
                        </a>
                      </h3>
                      <p>{t(article.summary, lang)}</p>
                      <OfficialSource id={article.source} lang={lang} />
                    </div>
                    <a
                      className="news-read"
                      href={facultySources[article.source].urls[lang]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${f('readArticle')} — ${t(article.title, lang)}`}
                    >
                      <Icon name="diagonal" />
                      <span>{f('readArticle')}</span>
                    </a>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          <section id="contact" className="contact-section">
            <div className="section-shell contact-inner">
              <Reveal>
                <p className="eyebrow light">
                  <span>06</span>
                  {c('nextChapter')}
                </p>
                <h2>
                  {c('contactFirst')}
                  <br />
                  <span>{c('contactSecond')}</span>
                  <span className="gold-period">.</span>
                </h2>
                <p className="contact-description">{t(ui.contactText, lang)}</p>
              </Reveal>
              <Reveal className="contact-action" delay={0.1}>
                <a
                  className="contact-orbit"
                  href={official}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(ui.official, lang)}
                >
                  <Icon name="diagonal" />
                </a>
                <a
                  className="text-link light-link"
                  href={official}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(ui.official, lang)}
                  <Icon name="diagonal" />
                </a>
                <a
                  className="contact-social"
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(ui.facebook, lang)}
                  <Icon name="diagonal" />
                </a>
              </Reveal>
              <Reveal className="faculty-contact-details">
                <div className="contact-address">
                  <h3>{f('address')}</h3>
                  <address>{t(facultyContact.address, lang)}</address>
                  <a
                    className="contact-map"
                    href={facultyContact.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {f('map')}
                    <Icon name="diagonal" />
                  </a>
                </div>
                <div>
                  <h3>{f('telephone')}</h3>
                  <a className="contact-telephone" href={facultyContact.telephoneHref}>
                    {facultyContact.telephone}
                  </a>
                  <h3 className="contact-email-label">{f('email')}</h3>
                  <a className="contact-email" href={`mailto:${facultyContact.email}`}>
                    {facultyContact.email}
                  </a>
                </div>
                <OfficialSource id="contact" lang={lang} light />
              </Reveal>
              <div className="contact-watermark" aria-hidden="true">
                ENGINEER
                <br />
                WHAT'S NEXT.
              </div>
            </div>
          </section>
        </main>
        <footer className="site-footer section-shell">
          <div className="footer-top">
            <a className="brand" href="#home">
              <img
                src="/picture/logo.jpg"
                alt=""
                width="44"
                height="44"
                loading="lazy"
                decoding="async"
              />
              <span>
                <strong>{t(ui.name, lang)}</strong>
                <small>{t(ui.university, lang)}</small>
              </span>
            </a>
            <a className="back-to-top" href="#home">
              {c('backTop')}
              <span>↑</span>
            </a>
          </div>
          <div className="footer-bottom">
            <p>{t(ui.experimental, lang)}</p>
            <span>© {new Date().getFullYear()} · NUOL ENGINEERING</span>
            <span>
              {c('madeWithCuriosity')}
              <span className="footer-spark">✳</span>
            </span>
          </div>
        </footer>
        <dialog
          ref={dialog}
          className="gallery-dialog"
          aria-label={lightbox === null ? t(ui.openImage, lang) : ui.photos[lightbox][lang]}
          onClose={() => setLightbox(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightbox(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') changePhoto(1)
            if (event.key === 'ArrowLeft') changePhoto(-1)
          }}
        >
          {lightbox !== null && (
            <div className="gallery-dialog-content">
              <div className="gallery-dialog-top">
                <span>
                  {c('lifeKicker')}
                  <span className="gallery-count">0{lightbox + 1} / 03</span>
                </span>
                <button
                  className="gallery-close"
                  onClick={() => setLightbox(null)}
                  aria-label={t(ui.closeImage, lang)}
                  autoFocus
                >
                  <Icon name="close" />
                </button>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={lightbox}
                  src={ui.photos[lightbox].src}
                  alt={ui.photos[lightbox][lang]}
                  width="206"
                  height="206"
                  decoding="async"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.15 }}
                />
              </AnimatePresence>
              <div className="gallery-dialog-bottom">
                <p>{ui.photos[lightbox][lang]}</p>
                <div>
                  <button onClick={() => changePhoto(-1)} aria-label={c('previousPhoto')}>
                    <Icon name="left" />
                  </button>
                  <button onClick={() => changePhoto(1)} aria-label={c('nextPhoto')}>
                    <Icon name="right" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </dialog>
      </LazyMotion>
    </MotionConfig>
  )
}
