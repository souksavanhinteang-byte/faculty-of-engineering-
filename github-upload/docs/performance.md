# ການກວດ ແລະປັບຄວາມໄວການໂຫຼດ

ວັນທີວັດ: 17 ຕຸລາ 2026. ຂໍ້ມູນ 12 samples ທີ່ໃຊ້ທຽບຢູ່ໃນ [performance-samples.json](performance-samples.json).

## ຂອບເຂດ ແລະຂໍ້ຈຳກັດ

URL ທີ່ຮ້ອງຂໍແມ່ນ https://faculty-of-engineering-nuol-hufb.vercel.app/. Chrome ເປີດບໍ່ໄດ້ (`net::ERR_NAME_NOT_RESOLVED`); curl ນອກ sandbox ລາຍງານ `Could not resolve host`, ແລະ web tool ກໍເປີດບໍ່ໄດ້. ນີ້ແມ່ນຂໍ້ຈຳກັດຈາກສະພາບແວດລ້ອມທີ່ທົດສອບ; ບໍ່ແມ່ນຂໍ້ສະຫຼຸບວ່າເວັບລົ້ມສຳລັບທຸກຄົນ.

ຈຶ່ງ **ຍັງບໍ່ສາມາດວັດ production TTFB, CDN/cache headers ຫຼືຢືນຢັນວ່າ deployed bundle ກົງກັບ source ໃນ workspace**. ບໍ່ໄດ້ສົມມຸດວ່າ Vercel/server ເປັນສາເຫດຊ້າ ຫຼືວ່າ frontend ເປັນສາເຫດດຽວ.

ຜົນຂ້າງລຸ່ມແມ່ນ local production build ກ່ອນ/ຫຼັງການແກ້, ໃຫ້ບໍລິການຈາກ `vite preview` ທີ່ `127.0.0.1:4173`. ໃຊ້ Google Chrome 155.0.8059.82 (headless, Windows), Playwright ທີ່ມີແລ້ວ ແລະ CDP; ບໍ່ໄດ້ຕິດຕັ້ງ Lighthouse ຫຼືສ້າງຄະແນນຈຳລອງ.

- Mobile viewport 390 × 844, DPR 1, touch/coarse pointer.
- Network: download 200,000 bytes/s (1.6 Mbps), upload 93,750 bytes/s, latency 150 ms; CPU slowdown 4×.
- Browser context ໃໝ່ທຸກຮອບ, HTTP cache ປິດ, service workers ປິດ; ບໍ່ scroll ຫຼືກົດປຸ່ມໃນຂະນະວັດ.
- ສັງເກດ 10 ວິນາທີຫຼັງ `window.load`; 3 ຮອບຕໍ່ພາສາ/ລຸ້ນ. ຕາຕະລາງໃຊ້ຄ່າກາງ (median).
- ເປັນ browser-cache-cold lab, ບໍ່ແມ່ນ cold CDN, ເຄືອຂ່າຍລາວຈິງ ຫຼືໂທລະສັບຈິງ. GPU/driver, OS caches ແລະພາລະວຽກຂອງເຄື່ອງມີຜົນຕໍ່ຕົວເລກ.

## ຜົນທຽບ

| ລາຍການ | ລາວ ກ່ອນ | ລາວ ຫຼັງ | English ກ່ອນ | English ຫຼັງ |
| --- | ---: | ---: | ---: | ---: |
| FCP | 1.944 s | 1.784 s | 1.768 s | 1.700 s |
| LCP (H1) | 2.296 s | 1.784 s | 2.364 s | 1.700 s |
| Header ພ້ອມສະແດງ¹ | 1.911 s | 1.745 s | 1.742 s | 1.594 s |
| Hero H1 ພ້ອມສະແດງ¹ | 2.364 s | 1.745 s | 2.247 s | 1.594 s |
| JS script execution (CDP) | 963 ms | 581 ms | 851 ms | 585 ms |
| Layout CPU (CDP) | 761 ms | 559 ms | 721 ms | 436 ms |
| Style recalculation CPU (CDP) | 106 ms | 29 ms | 106 ms | 33 ms |
| Long tasks | 6 | 2 | 7 | 4 |
| Observed blocking² | 998 ms | 574 ms | 846 ms | 466 ms |
| Resize events ໃນຊ່ວງວັດ | 5 | 2 | 8 | 3 |
| Layout-shift sum³ | 0.000029 | 0.001466 | 0.007923 | 0.003125 |

¹ ເວລາ RAF ທຳອິດທີ່ element ແລະ ancestors ມີ opacity ≥ 0.95, ບໍ່ `display:none`/`visibility:hidden` ແລະມີຂະໜາດ. ບໍ່ແມ່ນ Web Vital ຫຼືການວັດຈາກ pixels.

² ຜົນບວກ `max(longTask.duration − 50, 0)` ໃນຊ່ວງສັງເກດ. **ບໍ່ແມ່ນ Lighthouse TBT** ເພາະບໍ່ໄດ້ຄຳນວນຂອບເຂດ FCP–TTI ຂອງ Lighthouse.

³ ຜົນບວກ layout shifts ທີ່ບໍ່ໄດ້ເກີດຈາກ user input ໃນຊ່ວງວັດ, ບໍ່ແມ່ນ field CLS ຕະຫຼອດ session. ລາວມີຄ່າເພີ່ມນ້ອຍໆ ຫຼັງໃຊ້ font swap ກັບ hero ທີ່ບໍ່ຊ່ອນ; ບໍ່ໄດ້ປິດບັງຂໍ້ນີ້ໃນຜົນທຽບ.

### ແຍກ HTML, JavaScript, ຟອນ ແລະ WebGL

- **HTML/network:** loopback TTFB ລາວ 5.7 → 3.8 ms, English 4.2 → 5.7 ms; HTML body download 162.5 → 177.8 ms ແລະ 165.7 → 174.4 ms ຕາມລຳດັບ. ບໍ່ມີການອ້າງວ່າ server ໄວຂຶ້ນ. ຄ່າເຫຼົ່ານີ້ບໍ່ສາມາດແທນ Vercel/network ຈິງໄດ້.
- **JS download:** eager JS ເດີມປະມານ 426.8 KB decoded / 134.1 KB encoded; ຫຼັງປັບ 386.8 KB / 122.9 KB. Eager JS ໄຟລ໌ສຸດທ້າຍໂຫຼດສຳເລັດລາວ 1.134 → 1.058 s, English 1.130 → 1.073 s. React ຍັງຈຳເປັນສຳລັບ first render; ບໍ່ໄດ້ເພີ່ມ SSR/prerender.
- **JS ລວມໃນ no-input mobile load:** 992,323 → 386,798 decoded bytes (−61.0%); 276,110 → 122,875 encoded bytes (−55.5%). ຕົວເລກເດີມລວມ 3D chunks ທີ່ໂຫຼດຕໍ່ທັນທີ, ບໍ່ໄດ້ໝາຍຄວາມວ່າ 992 KB ທັງໝົດເປັນ render-blocking. ຕົວເລກ encoded ບໍ່ລວມ HTTP headers.
- **ຟອນ:** ຈາກ 4 ໄຟລ໌ທີ່ browser ໂຫຼດລວມ 109,076 bytes ເຫຼືອ 2 ໄຟລ໌ 46,356 bytes (−57.5%). Font response ສຸດທ້າຍລາວ 2.487 → 1.670 s; English 2.479 → 1.682 s. `font-display: swap` ມີໃນຟອນເດີມແລ້ວ; ການປັບຄັ້ງນີ້ຫຼຸດ families/subsets ແລະບໍ່ເພີ່ມ preload.
- **WebGL:** ເດີມ Three.js core + renderer + scene ຖືກ request ທັນທີຫຼັງ React render. Canvas ປາກົດໃນ DOM ປະມານ 3.32 s (ລາວ) / 3.28 s (English). `getContext` ຄ່າກາງ 15.0 / 12.1 ms; ນີ້ວັດສະເພາະ context creation, **ບໍ່ລວມ geometry construction, shader compilation ຫຼື GPU rendering ທັງໝົດ**. ຫຼັງປັບ mobile ບໍ່ request 3D chunks ຫຼືສ້າງ context ໂດຍບໍ່ກົດ Enable 3D; SVG ພ້ອມກັບ first React render.

## ສິ່ງທີ່ປ່ຽນ

- Hero/header/navigation/actions ບໍ່ຖືກຊ່ອນດ້ວຍ reveal animation. ຕັ້ງພາສາ HTML ໃນ layout effect ກ່ອນ paint ເພື່ອບໍ່ໃຫ້ English ໃຊ້ Lao heading layout ຊົ່ວຄາວ. ບໍ່ມີ full-page loader ຫຼື page-wide Suspense.
- ແຍກ SVG ອອກຈາກ Three.js module ໃຫ້ເຫັນໄດ້ໂດຍບໍ່ດາວໂຫຼດ WebGL. Desktop ≥1024px/fine pointer ຄ່ອຍໂຫຼດຫຼັງ load/paint + idle delay ເມື່ອ scene ຢູ່ໃນ viewport. Mobile/tablet, reduced-motion ແລະ Save-Data ໃຊ້ SVG ກ່ອນ ແລະເລືອກເປີດ 3D ໄດ້.
- SVG ຍັງເຫັນຈົນກວ່າ first 3D frame ພ້ອມ. Download/render boundary ແຍກຈາກ page; ຖ້າ download ລົ້ມເຫຼວ ຍັງເຫັນຮູບ ແລະກົດ navigation ໄດ້. ປຸ່ມ 2D ຄືນ focus ແລະ dispose renderer. ຂໍ້ຄວາມ/accessible labels ໃໝ່ຢູ່ `src/content.ts` ທັງສອງພາສາ.
- ໃຊ້ `LazyMotion` + `domAnimation` + `motion/react-m`; ບໍ່ໂຫຼດ Motion drag/layout features ທີ່ບໍ່ໃຊ້. Motion bundle 146,527 → 99,949 bytes. ບໍ່ເພີ່ມ performance/animation library ຫຼືປ່ຽນ package manifest.
- ຟອນເຫຼືອ Manrope Latin ແລະ Noto Sans Lao Lao subset, ເກັບ glyphs ລາວ/English ທີ່ໃຊ້. ມີ system fallback ແລະ `font-display: swap`.
- ຮູບ campus: PNG 837,046 → WebP lossless 521,918 bytes (−37.6%), 810×494 ເທົ່າເດີມ, ກວດ RGBA pixels ເທົ່າກັນທຸກ pixel. ເກັບ PNG fallback ແລະ JPG ຕົ້ນສະບັບ. Header logo ເປັນ eager/high priority; below-fold images ໃຊ້ lazy loading, dimensions ຊັດເຈນ ແລະ async decoding. ບໍ່ໄດ້ lazy-load ພາບຫຼັກໃນ hero (ເປັນ inline SVG).
- Resize refresh ເປັນ RAF-batched ແລະສົ່ງສັນຍານເມື່ອຂະໜາດປ່ຽນຈິງ; ຍັງ refresh ຫຼັງພາສາ/ຟອນ/ເນື້ອຫາປ່ຽນ. ບໍ່ພົບ resize loop ທີ່ບໍ່ຈົບໃນ baseline; ບໍ່ໄດ້ອ້າງວ່າມີ loop ເພາະພຽງແຕ່ມີ observer.
- ໃນ mobile ສ່ວນ learning/life/contact ໃຊ້ native `content-visibility:auto` ກັບ intrinsic-size estimates ເພື່ອເລື່ອນ offscreen layout. ບໍ່ໃຊ້ກັບ desktop, header ຫຼື hero; ກວດ anchors ທັງສອງພາສາເມື່ອສ່ວນເຫຼົ່ານີ້ຂະຫຍາຍ.
- WebGL ຍັງ render on demand, ຢຸດນອກ viewport/hidden tab. Mobile ທີ່ເລືອກ 3D ໃຊ້ DPR cap 1, ບໍ່ເຮັດ shadow maps/antialiasing; desktop cap 1.5 ແລະ update shadows ເມື່ອ structure ເຄື່ອນ. ເລື່ອນຈໍດ້ວຍນິ້ວດຽວໄດ້; ໝຸນດ້ວຍສອງນິ້ວ.

## Deployment/cache

ເພີ່ມ `vercel.json` ສຳລັບ Vite, build `npm run build`, output `dist`. ກຳນົດ `Cache-Control: public, max-age=31536000, immutable` **ສະເພາະ `/assets/:path*`**, ທີ່ build ນີ້ປ່ອຍ JS/CSS/fonts ມີ content hashes. ບໍ່ກຳນົດ long-lived caching ໃຫ້ `/`, `index.html`, ຫຼື unversioned `/picture/`. ບໍ່ປ່ຽນເປັນ `immutable` ແບບຄອບທັງເວັບ.

ຍັງຕ້ອງກວດ response headers ຫຼັງ manual deployment ໃນ URL ທີ່ເປີດໄດ້. `vite preview` ບໍ່ໄດ້ຈຳລອງ Vercel CDN ຫຼືນຳ `vercel.json` headers ມາໃຊ້.

## ການກວດທີ່ສຳເລັດ

- `npm run check` ແລະ `npm run build` ຜ່ານ (TypeScript + Vite production).
- Production preview + Chrome Playwright: **20/20 tests ຜ່ານ**. ລວມສອງພາສາ/ການຈື່ພາສາ, 10 departments, navigation, mobile menu, anchors ໃຕ້ header, gallery/keyboard/focus, desktop scroll progress ຫຼັງປ່ຽນພາສາ, ແລະ overflow 320–1920px.
- ກວດເບິ່ງ screenshots desktop/mobile ໃນລາວ ແລະ English. Desktop visual test ບໍ່ພົບ runtime/console errors.
- ກວດ mobile ບໍ່ request Three.js ກ່ອນ opt-in; Enable/2D, explode/reset, keyboard/drag ແລະ single-finger scrolling ຜ່ານ. ກວດ idle draw calls ຢຸດ ແລະ offscreen draw calls ບໍ່ເພີ່ມ.
- ກວດ font download failure ແລະ scene download failure ວ່າ hero/navigation ຍັງໃຊ້ໄດ້; ກວດ WebGL-unavailable fallback ແລະ reduced-motion opt-in.
- axe WCAG A/AA audit ຂອງ desktop, mobile ແລະ gallery ຜ່ານ; ນີ້ບໍ່ແທນ manual screen-reader audit.
- ກວດ WebP browser selection, dimensions 810×494 ແລະ pixel-identical encode. ໄຟລ໌ຮູບຕົ້ນສະບັບ, `package.json`/lockfile ແລະ verified faculty content ບໍ່ປ່ຽນ.

ບໍ່ໄດ້ກວດ Safari/Firefox, ອຸປະກອນມືຖືຈິງ, field performance, ຫຼື live Vercel response headers. ບໍ່ໄດ້ push ຫຼື deploy.

## ທົດສອບຊ້ຳ

Terminal ທຳອິດ, ພາຍໃນ project root (`code/` ຫຼືສຳເນົາທີ່ອັບເດດແລ້ວ):

```powershell
npm run check
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Terminal ທີສອງ:

```powershell
node scripts/measure-loading.mjs --label=repeat-lo --runs=3
node scripts/measure-loading.mjs --label=repeat-en --lang=en --runs=3
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4173'
npm run test:e2e
```

Browser helper ໃຊ້ Chrome ທີ່ຕິດຕັ້ງແລ້ວ; ບັນທຶກ raw resources, headers, CPU metrics, errors ແລະ screenshot ໄວ້ໃນ `test-results/` ທີ່ gitignore ຍົກເວັ້ນ. ຢ່າລັນ benchmark ພ້ອມ browser tests ເພາະອາດແຍ່ງ CPU. ການທຽບ baseline ຄືນຕ້ອງໃຊ້ source ລຸ້ນກ່ອນແກ້; samples ເກົ່າບໍ່ໄດ້ຖືກຄຳນວນຄືນຈາກໂຄດໃໝ່.

## ເອກະສານທີ່ອ້າງອີງ

ອ່ານ 17 ຕຸລາ 2026:

- [Motion: reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size) — minimal components/LazyMotion.
- [MDN: content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) — auto layout skipping ແລະຂໍ້ຄວນລະວັງ accessibility.
- [Vercel: Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers) — immutable ສຳລັບ content-hashed assets, ບໍ່ແມ່ນ HTML ທັງໝົດ.
- [Vite: production build](https://vite.dev/guide/build.html) — static build ແລະການ revalidate HTML ເມື່ອ chunks ປ່ຽນ.
