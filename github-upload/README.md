# ເວັບແນະນຳຄະນະວິສະວະກຳສາດ ມຊ

ໂຄງການ React + TypeScript + Vite ນີ້ເປັນໜ້າເວັບແນະນຳສອງພາສາ (ລາວ/English) ສຳລັບຄະນະວິສະວະກຳສາດ, ມະຫາວິທະຍາໄລແຫ່ງຊາດລາວ. ເປັນໂຄງການທົດລອງ ບໍ່ແມ່ນເວັບທາງການ.

## ໂຄງສ້າງໄຟລ໌

- `src/App.tsx` — ໂຄງສ້າງໜ້າເວັບ, ເມນູ, ພາກວິຊາ, ແລະ lightbox.
- `src/content.ts` — ຂໍ້ຄວາມສອງພາສາ ແລະລາຍການ 10 ພາກວິຊາ; ແກ້ຂໍ້ຄວາມຢູ່ນີ້.
- `src/components/EngineeringScene.tsx` — ພາບ 3D Three.js, ປຸ່ມ Explode/Assemble ແລະ Reset.
- `src/styles.css` — ສີ, ຟອນ, ການຈັດວາງ responsive.
- `index.html` — ໜ້າໂຫຼດ HTML/CSS/SVG ທີ່ສະແດງກ່ອນ React; ອ່ານ [ພຶດຕິກຳ ແລະ ການທົດສອບ](docs/entrance.md).
- `public/picture/` — ສຳເນົາ logo ແລະຮູບພາບທີ່ໃຊ້ໃນເວັບ. ໄຟລ໌ໃນ `../picture/` ຕົ້ນສະບັບບໍ່ໄດ້ຖືກແກ້.

## ການຕິດຕັ້ງ

ຕ້ອງມີ Node.js ຮຸ່ນປັດຈຸບັນ (ແນະນຳ 20+). ເປີດ Terminal ຢູ່ໃນໂຟນເດີ `code` ແລ້ວລັນ:

```powershell
npm install
npm run dev
```

Vite ຈະສະແດງ local URL (ປົກກະຕິແມ່ນ `http://localhost:5173`) ໃຫ້ເປີດໃນ browser.

ສ້າງ production build ແລະເບິ່ງຜົນ:

```powershell
npm run build
npm run preview
```

ກວດ TypeScript ເທົ່ານັ້ນ:

```powershell
npm run check
```

## ແກ້ໄຂເນື້ອຫາ ແລະຮູບ

ເພື່ອປ່ຽນຮູບ, ວາງໄຟລ໌ໃໝ່ໃນ `public/picture/` ແລ້ວແກ້ path ໃນ `src/App.tsx` ຫຼື `src/content.ts`. ຄວນຮັກສາສັດສ່ວນ logo; CSS ກຳນົດ `object-fit: contain` ໄວ້ແລ້ວ.

ແກ້ຄຳແປຂອງໜ້າເວັບໄດ້ທີ່ `src/content.ts`: ແຕ່ລະລາຍການມີ `lo` ແລະ `en`. ເນື້ອຫາຄະນະທີ່ກວດຢືນຢັນແລ້ວ, ລາຍການ `departments`, ລິ້ງທາງການ ແລະ ບັນທຶກແຫຼ່ງຂໍ້ມູນ ຢູ່ໃນ `src/faculty-content.ts`. ກ່ອນເພີ່ມລາຍລະອຽດຫຼັກສູດ ໃຫ້ອ່ານໜ້າທາງການ ແລະ ອັບເດດບັນທຶກໃນ `docs/content-sources.md`.

ສີຫຼັກຢູ່ຕົ້ນ `src/styles.css` ໃນ `:root` (`--paper`, `--blue`, `--gold`, `--gold-ink`, `--muted`, `--line`, `--ink`).

## ພາບ 3D

`EngineeringScene.tsx` builds a conceptual structural pavilion from Three.js geometry: floor slabs, steel columns, cross bracing, stairs, glass balustrades, and a gabled roof truss. It is an illustration, not a model of an actual campus building.

Drag to rotate on desktop, use arrow keys when the model has keyboard focus, or rotate with two fingers on touch screens. Single-finger swipes scroll the page. Explode/Assemble separates the floors and roof, with automatic camera fitting; Reset returns to the original view. Reduced-motion users get immediate state changes.

The lightweight SVG study is visible immediately. Phones, tablets, reduced-motion and data-saving visitors opt in with the bilingual **Enable 3D** button. On a fine-pointer desktop of at least 1024px, the separate Three.js module is requested after the first paint/load and an idle delay, only while the study is onscreen. The illustration stays until the first rendered frame; download failures do not hide the page. The 2D control releases the WebGL renderer and returns focus to the enable button.

The scene caps device pixel ratio (1 on mobile, 1.5 on desktop) and renders on demand. Mobile 3D omits antialiasing and shadow maps. Desktop shadow maps update only when the structure moves. The renderer suspends outside the viewport and in hidden tabs, observes its own size, ignores unchanged dimensions, and disposes graphics resources on unmount. Browsers without WebGL receive the SVG illustration with working explode/reset controls.

## Design and interaction

The design uses warm ivory, deep blue, and muted gold; self-hosted Manrope (Latin) and Noto Sans Lao (Lao), both with `font-display: swap`; authentic supplied campus photography; and individual blueprint illustrations for the department explorer. No third-party font request or font preload is needed. Original photos in `../picture/` are preserved. The below-fold campus photograph has a pixel-identical lossless WebP variant and an original PNG fallback; the already-small JPGs are unchanged.

Motion for React uses `LazyMotion`/`domAnimation` and the small `motion/react-m` components, without drag/layout features. It provides below-fold staggered entrances, scroll reveals, department transitions, gallery fades, and subtle campus-photo parallax. Header, hero text, actions and SVG are never opacity-gated. The site respects `prefers-reduced-motion`. Lao is the initial language; the language switch persists the visitor's choice when local storage is available. Three far-offscreen sections defer text layout on mobile using native `content-visibility: auto`; desktop geometry is unchanged.

The department explorer supports Arrow Up/Down and Home/End on desktop, and a native select on mobile. The native gallery dialog traps focus, supports Arrow Left/Right, closes with Escape or a backdrop click, locks background scrolling, and restores focus to the photo trigger. Section links and the back-to-top control use native anchors.

## Browser verification

The Playwright suite uses installed Google Chrome (`channel: 'chrome'`). Use the production preview described below for the full suite: entrance failure tests target the built JS/CSS chunks. With the preview running on port 4173, run:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4173'
npm run test:e2e
```

Tests cover both languages, persistence, all ten departments, navigation, the mobile menu and selector, gallery controls and focus restoration, 3D mouse and keyboard controls, the WebGL fallback, reduced motion, and overflow from 320px to 1920px. An axe audit checks WCAG A/AA rules on desktop, mobile, and the open gallery. Review screenshots are saved under the ignored `test-results/` directory.

For a production preview, run `npm run build` and `npm run preview -- --host 127.0.0.1` in separate terminals, then set `PLAYWRIGHT_BASE_URL` to the preview URL before running the tests. React, Motion, the Three.js core, and the renderer have separate cacheable build chunks.

Run `npm run format` to format the source. The project is a presentation website; official programme information and faculty announcements are linked through the existing official channels.

## Loading performance and Vercel

See [docs/performance.md](docs/performance.md) for measured cold-load results, methodology, limitations and reproduction commands. `scripts/measure-loading.mjs` uses the existing Playwright/Chrome installation and CDP throttling; it does not produce a Lighthouse score.

`vercel.json` selects the existing Vite build and `dist` output. Only content-hashed files emitted into `/assets/` receive immutable caching; HTML and unversioned `/picture/` files do not get a long-lived cache rule. Validate actual response headers on the deployed URL after a manual deployment. No push or deployment is part of the performance work.

The checked-in lossless WebP can optionally be regenerated with `python scripts/optimize-campus.py` (Pillow required only for this maintenance command, not for npm install/build). It verifies identical dimensions and RGBA pixels before reporting sizes.

## Verified faculty content

The faculty introduction, university vision, two-milestone timeline, ten departments, selected bachelor majors, facilities/research/cooperation examples, student information links, archived seminar article, and contact details are centralized in `src/faculty-content.ts`. Source URLs, access dates, editorial decisions and unresolved conflicts are documented in [docs/content-sources.md](docs/content-sources.md). The site links to the corresponding official Lao or English page.

Some department pages contain placeholders. Their descriptions are explicitly labeled general field explanations, and no unsupported curriculum is supplied. News has a real publication date and archive label; student links do not promise current scholarships, timetables or service availability. Existing photographs are not identified as specific facilities or events. Body and campus ResizeObservers refresh Motion’s scroll measurements after language, font and content-size changes.

Read-only verification helpers:

```powershell
node scripts/read-official.mjs https://fe-nuol.edu.la/en/department/
node scripts/inspect-contact.mjs
node scripts/check-official-links.mjs
```

The helpers require network access and installed Chrome. The live link checker additionally uses Node 24+ to import the typed source registry directly. They report evidence for editorial review; they do not automatically change content, verify open opportunities, or send email.
