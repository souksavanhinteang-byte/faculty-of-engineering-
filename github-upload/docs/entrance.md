# ໜ້າໂຫຼດກ່ອນເຂົ້າເວັບ

ໜ້າໂຫຼດຢູ່ໃນ `index.html`: CSS, SVG ແລະ bootstrap ແບບ inline ຈຶ່ງສະແດງໄດ້ກ່ອນ React bundle ພ້ອມ. ໃຊ້ logo ເດີມ `/picture/logo.jpg` ໃນສັດສ່ວນເດີມ, ພື້ນຂາວ `#FFFFFF`, ສີ navy `#102C54`, ຕາຕະລາງ `#EEF4FA` ແລະ ຂໍ້ຄວາມລາວ/English. ບໍ່ເພີ່ມ dependency ຫຼື WebGL.

## ເວລາ ແລະ ຄວາມພ້ອມ

- JavaScript ຂອງແອັບເລີ່ມໂຫຼດພ້ອມກັບ animation; ບໍ່ລໍຖ້າຕົວເລກຈົບ.
- ຕົວເລກ 1–100% ເປັນຕົວຊີ້ຂອງ entrance animation, **ບໍ່ແມ່ນປະລິມານ bytes ທີ່ດາວໂຫຼດ**. ຊ່ວງວາດເສັ້ນ/ນັບເລກ 600ms ແລະ ເລື່ອນ overlay ຂຶ້ນ 480ms, ລວມປະມານ 1.08 ວິນາທີເມື່ອແອັບພ້ອມໄວ.
- `App.tsx` ແຈ້ງ `window.__nuolEntrance?.ready()` ໃນ layout effect ເມື່ອ header, hero ແລະ SVG ຖືກ mount. ບໍ່ລໍຖ້າ `window.load`, ຟອນ, ຮູບດ້ານລຸ່ມ ຫຼື Three.js.
- ຖ້າແອັບພ້ອມຫຼັງ 600ms, ເລີ່ມ exit ທັນທີ; ບໍ່ມີຊ່ວງຢຸດລໍຖ້າທີ່ 100%.
- ຖ້າຍັງບໍ່ພ້ອມຫຼັງ 2 ວິນາທີ, ຊ່ອນເປີເຊັນ ແລະ ປ່ຽນເປັນ “ກຳລັງໂຫຼດໜ້າເວັບ… / Still loading the website…” ພ້ອມເສັ້ນເຄື່ອນໄຫວເບົາໆ.
- ຖ້າຍັງລໍຖ້າຫຼັງ 12 ວິນາທີ, ເພີ່ມປຸ່ມ Retry ໂດຍບໍ່ອ້າງວ່າ request ລົ້ມເຫຼວ. ຖ້າ JS/CSS ທີ່ຈຳເປັນໂຫຼດບໍ່ໄດ້ ຫຼື React ເກີດ uncaught error ໃນຊ່ວງ startup, ສະແດງຂໍ້ຄວາມຜິດພາດ ແລະ Retry ທັນທີ. Retry ໂຫຼດໜ້າໃໝ່.

## ການເປີດຊ້ຳ ແລະ accessibility

ບັນທຶກ `nuol-entrance-seen=1` ໃນ `sessionStorage` ເມື່ອແອັບພ້ອມ. ການ reload ໃນແທັບເດີມຈະສະແດງເວັບທັນທີທີ່ mount; ຍັງມີຂໍ້ຄວາມຖ້າໂຫຼດຊ້າ ຫຼື ຜິດພາດ. ຖ້າ storage ຖືກປິດ, ຂ້າມ animation ເຕັມເພື່ອບໍ່ໃຫ້ຫຼິ້ນຊ້ຳທຸກຄັ້ງ. ການປ່ຽນພາສາ ແລະ navigation ບໍ່ສ້າງ loader ຄືນ.

`prefers-reduced-motion` ປິດການນັບ, ວາດ ແລະ ເລື່ອນ; ເປີດເນື້ອຫາທັນທີທີ່ພ້ອມ. ມີ `role=status` ອັນດຽວ, ບໍ່ປະກາດທຸກເປີເຊັນ. ບໍ່ຍ້າຍ focus; ປຸ່ມ Retry ໃຊ້ keyboard ໄດ້. ເນື້ອຫາຢູ່ໃຕ້ overlay ເປັນ `inert` ຊົ່ວຄາວ, ແລະ ຄືນຄ່າເມື່ອເລີ່ມ exit. ມີຂໍ້ຄວາມ `noscript` ສອງພາສາ ພ້ອມລິ້ງເວັບຄະນະທາງການ.

Overlay ໃຊ້ `position: fixed` ແລະ ບໍ່ປ່ຽນ scrolling styles ຂອງໜ້າເວັບ ເພື່ອຮັກສາຕຳແໜ່ງ hero ແລະ ປຸ່ມຕ່າງໆ. ລຶບ overlay, styles, listeners, timers ແລະ bootstrap API ເມື່ອຈົບ; ມີ fallback cleanup ຖ້າ browser ບໍ່ສົ່ງ `transitionend`.

## ການກວດ

```powershell
npm run check
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

ໃນ terminal ອື່ນ:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4173'
npm run test:e2e
```

`e2e/entrance.spec.ts` ໃຊ້ production preview ເພື່ອກວດ first visit/reload, ສອງພາສາ, desktop/mobile, ໂຫຼດຊ້າ/ຄ້າງ, JS/CSS failure ແລະ Retry, render error, reduced motion, storage ຖືກປິດ, fonts/photos/3D ທີ່ຍັງໂຫຼດບໍ່ຈົບ, noscript, axe accessibility, focus, hero geometry ແລະ cleanup. ຮູບທົດສອບຢູ່ `test-results/entrance-*.png`. ການຈຳລອງເຄືອຂ່າຍໃຊ້ Chrome CDP: latency 180ms, download 40,000 bytes/s, upload 20,000 bytes/s, cache ປິດ.

ຜົນກວດວັນທີ 22 ຕຸລາ 2026:

- `npm run check`, `npm run build` ແລະ `git diff --check` ຜ່ານ.
- Entrance 20 tests ແລະ content 4 tests: **24/24 ຜ່ານໃນຮອບສຸດທ້າຍ**. ອີກ 16 tests ເດີມ (accessibility, scene/loading, site interactions) ຜ່ານໃນຮອບ regression ກ່ອນໜ້ານັ້ນ.
- ຕົວຢ່າງ local Chrome ຮອບສຸດທ້າຍ: first visit ລຶບ overlay ທີ່ 1.111s; same-tab reload ລຶບທັນທີທີ່ shell ພ້ອມທີ່ 0.100s.
- ໃນ CDP slow-network sample, shell ພ້ອມທີ່ 5.722s ແລະ exit ເລີ່ມໃນຮອບດຽວກັນ; overlay ຖືກລຶບທີ່ 6.223s. ບໍ່ມີການຢຸດລໍຖ້າເພີ່ມກ່ອນ exit.
- ກວດ screenshots desktop/mobile, hero geometry ແລະ keyboard focus. ບໍ່ປ່ຽນເນື້ອຫາຄະນະ ຫຼື dependencies. Local visual test ຈຳລອງ Vercel Speed Insights script ເພາະ Vite preview ບໍ່ມີ endpoint ນັ້ນ; telemetry ໃນເວັບຈິງຍັງຄົງເດີມ.

ຕົວເລກເຫຼົ່ານີ້ເປັນ local samples, ບໍ່ແມ່ນ field benchmark ຫຼື ການຮັບປະກັນເວລາໃນທຸກອຸປະກອນ. ຍັງບໍ່ໄດ້ກວດ Safari/Firefox ຫຼື ໂທລະສັບຈິງ.

ໜ້າໂຫຼດນີ້ເຮັດວຽກຫຼັງ HTML ມາຮອດ browser ເທົ່ານັ້ນ. **ບໍ່ແກ້ DNS errors ຫຼື connection timeouts ກ່ອນ HTML ມາຮອດ ແລະ ບໍ່ເພີ່ມຄວາມໄວເຄືອຂ່າຍ.**

