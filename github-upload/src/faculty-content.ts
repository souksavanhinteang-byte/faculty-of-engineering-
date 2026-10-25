import type { Copy } from './content'

export type SourceRecord = {
  urls: Copy
  accessedOn: string
  verificationNote: string
}

const origin = 'https://fe-nuol.edu.la'
const source = (en: string, lo: string, verificationNote: string): SourceRecord => ({
  urls: { en: `${origin}${en}`, lo: `${origin}${lo}` },
  accessedOn: '2026-10-17',
  verificationNote,
})

// Editorial evidence only; verification notes are never rendered to visitors.
export const facultySources = {
  home: source(
    '/en/home-en/',
    '/',
    'Read the fallback home page directly after /en/ failed in the web reader. Omit undated statistics.',
  ),
  history: source(
    '/en/history/',
    '/history-lo/',
    'Both bodies confirm 1995 and June 2004. Ignore the English history page’s nine-department count; the dedicated Department pages list ten.',
  ),
  vision: source(
    '/en/vision/',
    '/vision-2/',
    'The body describes the UNIVERSITY vision. Do not relabel it as a separate faculty vision or a completed accreditation.',
  ),
  departments: source(
    '/en/department/',
    '/department-lo/',
    'Both actual page bodies list ten departments with individual links. English page read successfully with Chrome HTTP client after web-reader timeouts.',
  ),
  civil: source(
    '/en/civil-engineering/',
    '/civil-lo/',
    'Body describes infrastructure, buildings, practical learning and a final project. No current credit or admission requirements reproduced.',
  ),
  computing: source(
    '/en/computer-engineering-and-it/',
    '/ceit-lo/',
    'English body supports computing and physical systems. Lao Curriculum explicitly lists bachelor majors in Computer Engineering and Information Technology. Exclude inconsistent degree-title and credit details.',
  ),
  chemical: source(
    '/en/chemical-engineering/',
    '/chemical-lo/',
    'Name and destination verified; substantive sections say Updating. Description is explicitly a general field explainer, not a claim about faculty curriculum.',
  ),
  electrical: source(
    '/en/electrical-engineering/',
    '/electrical-lo/',
    'Body supports electrical systems, automation research and practical projects. Omit undated leaders and requirements.',
  ),
  electronics: source(
    '/en/electronics-and-telecomunication-engineering/',
    '/electronic-lo/',
    'Keep the official misspelled URL. Use the dedicated Department list for the English name. Body discusses electronics, communication, projects and internships; omit ambiguous ENE degree naming.',
  ),
  environmental: source(
    '/en/environmental-engineering/',
    '/environment-lo/',
    'Body supports wastewater, waste, air pollution and natural-resource concerns, plus an individual project.',
  ),
  mechanical: source(
    '/en/mechanical-engineering/',
    '/mechanical-lo/',
    'English body explicitly names Mechanical Engineering and Mechanical and Industrial Engineering bachelor majors. Lao summary has translation errors; translate the verified English names carefully.',
  ),
  mining: source(
    '/en/mining-engineering/',
    '/mining-lo/',
    'Body supports earth sciences, mineral extraction, mining design and environmental considerations. Omit the implausible four years of internships.',
  ),
  roads: source(
    '/en/road-and-bridge-engineering/',
    '/brigde-lo/',
    'Names and actual URLs verified; substantive sections are Updating. General field explanation only, no programme claim. Preserve brigde-lo spelling.',
  ),
  transport: source(
    '/en/transportation-and-logistics-engineering/',
    '/transportation-lo/',
    'Names and actual URLs verified; substantive sections are Updating. Lao name uses ພາລະທິການ. General field explanation only.',
  ),
  facilities: source(
    '/en/facilities/',
    '/facility-lo/',
    'Both bodies explicitly list hydraulic, road-material and control-system laboratories. No equipment, availability, total lab count or photo identification asserted.',
  ),
  research: source(
    '/en/research/',
    '/reseach-lo/',
    'Both bodies describe a location-aware fire alarm over 4G and analysis of road-accident severity. Undated examples, not claims of active projects or outcomes.',
  ),
  cooperation: source(
    '/en/partner-university/',
    '/partnet-uni-lo/',
    'Actual bodies describe joint research, academic meetings and teacher/researcher exchanges. No named current partner or active student place inferred.',
  ),
  services: source(
    '/en/students-services/',
    '/services-lo/',
    'English dormitory account is undated; Lao page is Updating. Link only; do not assert housing availability, welfare provision or capacity.',
  ),
  scholarships: source(
    '/en/scholarship/',
    '/scholarship-lo/',
    'Actual listing links to an old Honda notice. No open application or new deadline claimed.',
  ),
  scholarshipArchive: source(
    '/en/2023/06/17/fund-honda-y-e-s-award-in-lao-pdr/',
    '/2023/06/15/honda-y-e-s-award-in-lao-pdr-lo/',
    'English article was read and refers to the 2021 application period, despite its 2023 publication. Lao listing independently contains the 2021 dates; Lao article itself not used.',
  ),
  calendar: source(
    '/en/academic-calendar/',
    '/calendar-lo/',
    'English page is an image without a readable date. Lao page explicitly lists previous calendars for 2023–24 and 2021–22. Link only, no current timetable asserted.',
  ),
  news: source(
    '/en/news/',
    '/news-announdment-lo/',
    'Both actual archives were read. Only the individually read and dated calibration seminar is displayed; no current admissions inferred from old posts.',
  ),
  seminar: source(
    '/en/2023/09/20/seminar-on-interpretation-of-calibration-certificate/',
    '/2023/09/20/seminar-lo-interpretation-of-calibration-certificate/',
    'Read actual English and Lao articles and archive publication dates. Published 20 September 2023; seminar occurred 15 September 2023. Lao source headline retains an English technical phrase; display expands that phrase into Lao.',
  ),
  contact: source(
    '/en/contact-us/',
    '/contact-fen-lo/',
    'Both bodies confirm address and +856 21 321 072. Rendered English page visibly resolves Cloudflare email to admin_fe@fe-nuol.edu.la; it is not a mailto link in the original page. Map destination inspected separately.',
  ),
} satisfies Record<string, SourceRecord>

export type SourceId = keyof typeof facultySources
export type SourcedCopy = { body: Copy; sources: readonly SourceId[] }
export type Department = {
  id: string
  name: Copy
  description: Copy
  source: SourceId
  fieldOverviewOnly?: boolean
  bachelorMajors?: readonly Copy[]
}

export const facultyAbout: SourcedCopy = {
  body: {
    lo: 'ຄະນະວິສະວະກຳສາດ ເປັນສ່ວນໜຶ່ງຂອງມະຫາວິທະຍາໄລແຫ່ງຊາດລາວ ທີ່ສຶກສາອົບຮົມວິສະວະກອນໃຫ້ມີພື້ນຖານວິທະຍາສາດ ແລະ ທັກສະວິຊາການ. ການຮຽນເຊື່ອມໂຍງທິດສະດີກັບພາກປະຕິບັດ ພ້ອມສ້າງຄວາມເຂົ້າໃຈບັນຫາສັງຄົມ ແລະ ສິ່ງແວດລ້ອມທີ່ກ່ຽວຂ້ອງກັບວິຊາຊີບ.',
    en: 'Part of the National University of Laos, the Faculty of Engineering prepares engineers with scientific foundations and technical skills. Its educational role connects engineering theory with practical knowledge and an understanding of the social and environmental questions engineers encounter in their work.',
  },
  sources: ['history', 'home'],
}

export const universityVision: SourcedCopy = {
  body: {
    lo: 'ວິໄສທັດຂອງມະຫາວິທະຍາໄລເນັ້ນການສຶກສາຊັ້ນສູງ, ການຄົ້ນຄວ້າວິທະຍາສາດ ແລະ ເຕັກໂນໂລຊີ, ພ້ອມພັດທະນາບຸກຄະລາກອນທີ່ມີຄວາມຮູ້ ແລະ ຈະລິຍະທຳ ເພື່ອການພັດທະນາເສດຖະກິດ-ສັງຄົມ.',
    en: 'The university’s published vision emphasizes higher education, science and technology research, and knowledgeable, ethical graduates who contribute to social and economic development.',
  },
  sources: ['vision'],
}

export const facultyTimeline = [
  {
    date: '1995',
    label: { lo: '1995', en: '1995' },
    title: { lo: 'ຈຸດເລີ່ມຕົ້ນຂອງຄະນະ', en: 'A shared foundation' },
    body: {
      lo: 'ສ້າງຕັ້ງເປັນຄະນະວິສະວະກຳ ແລະ ສະຖາປັດຕະຍະກຳສາດ (FEA), ພາຍໃນມະຫາວິທະຍາໄລແຫ່ງຊາດລາວ.',
      en: 'Established within NUOL as the Faculty of Engineering and Architecture (FEA).',
    },
    sources: ['history'],
  },
  {
    date: '2004-06',
    label: { lo: 'ມິຖຸນາ 2004', en: 'June 2004' },
    title: { lo: 'ຄະນະວິສະວະກຳສາດ', en: 'A new chapter in engineering' },
    body: {
      lo: 'ພາກວິຊາສະຖາປັດຕະຍະກຳແຍກອອກເປັນຄະນະຂອງຕົນ. ຄະນະທີ່ເຫຼືອຈຶ່ງປ່ຽນຊື່ເປັນຄະນະວິສະວະກຳສາດ.',
      en: 'Architecture separated to form its own faculty. The remaining faculty was renamed the Faculty of Engineering.',
    },
    sources: ['history'],
  },
] satisfies { date: string; label: Copy; title: Copy; body: Copy; sources: SourceId[] }[]

export const departments: readonly Department[] = [
  {
    id: 'civil',
    name: { lo: 'ພາກວິຊາວິສະວະກຳໂຍທາ', en: 'Civil Engineering' },
    description: {
      lo: 'ສຶກສາການອອກແບບ ແລະ ກໍ່ສ້າງອາຄານ ພ້ອມໂຄງສ້າງພື້ນຖານເຊັ່ນ ຖະໜົນ ແລະ ຂົວ. ໜ້າພາກວິຊາເນັ້ນການຮຽນພາກປະຕິບັດ ແລະ ໂຄງການໃນປີສຸດທ້າຍ.',
      en: 'Explore how buildings and infrastructure such as roads and bridges are designed and constructed. The department describes practical education and a final-year engineering project.',
    },
    source: 'civil',
  },
  {
    id: 'computing',
    name: {
      lo: 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ',
      en: 'Computer Engineering and Information Technology',
    },
    description: {
      lo: 'ສຶກສາການນຳໃຊ້ຄອມພິວເຕີໃນລະບົບວິສະວະກຳ, ການເຮັດວຽກຮ່ວມກັບລະບົບທາງກາຍະພາບ ແລະ ການຈັດການຂໍ້ມູນ. ໜ້າພາກວິຊາອະທິບາຍການຮຽນໃນຫ້ອງທົດລອງ ແລະ ການຝຶກງານ.',
      en: 'Understand computers in engineering systems, how they interact with physical systems, and how information is organized and used. The department describes laboratory learning and industrial training.',
    },
    source: 'computing',
    bachelorMajors: [
      { lo: 'ວິສະວະກຳຄອມພິວເຕີ', en: 'Computer Engineering' },
      { lo: 'ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', en: 'Information Technology' },
    ],
  },
  {
    id: 'chemical',
    name: { lo: 'ພາກວິຊາວິສະວະກຳເຄມີ', en: 'Chemical Engineering' },
    description: {
      lo: 'ຂົງເຂດນີ້ກ່ຽວກັບຂະບວນການເຄມີ ແລະ ການປ່ຽນແປງວັດຖຸດິບ. ສຳລັບຂໍ້ມູນການຮຽນ ກະລຸນາເບິ່ງໜ້າພາກວິຊາໂດຍກົງ.',
      en: 'This field concerns chemical processes and the transformation of materials. For the faculty’s programme information, visit the official department page.',
    },
    source: 'chemical',
    fieldOverviewOnly: true,
  },
  {
    id: 'electrical',
    name: { lo: 'ພາກວິຊາວິສະວະກຳໄຟຟ້າ', en: 'Electrical Engineering' },
    description: {
      lo: 'ສຶກສາລະບົບໄຟຟ້າ ແລະ ການແກ້ໄຂບັນຫາທາງວິສະວະກຳ. ໜ້າພາກວິຊາກ່າວເຖິງການຄົ້ນຄວ້າດ້ານລະບົບອັດຕະໂນມັດ ແລະ ການນຳຄວາມຮູ້ໄປໃຊ້ໃນໂຄງການພາກປະຕິບັດ.',
      en: 'Study electrical systems and ways to solve engineering problems. The department describes research in automation and electrical systems alongside practical project experience.',
    },
    source: 'electrical',
  },
  {
    id: 'electronics',
    name: {
      lo: 'ພາກວິຊາວິສະວະກຳເອເລັກໂຕນິກ ແລະ ຄົມມະນາຄົມ',
      en: 'Electronics and Telecommunication Engineering',
    },
    description: {
      lo: 'ສຶກສາວິສະວະກຳເອເລັກໂຕນິກ ແລະ ການສື່ສານ. ໜ້າພາກວິຊາອະທິບາຍການຮຽນຈາກພື້ນຖານໄປສູ່ວິຊາສະເພາະ, ພ້ອມໂຄງການປີສຸດທ້າຍ ແລະ ການຝຶກງານ.',
      en: 'Explore electronics and communication engineering. The department describes progression from scientific foundations to specialized study, with a final-year project and practical internship.',
    },
    source: 'electronics',
  },
  {
    id: 'environmental',
    name: { lo: 'ພາກວິຊາວິສະວະກຳສິ່ງແວດລ້ອມ', en: 'Environmental Engineering' },
    description: {
      lo: 'ສຶກສາການຈັດການນ້ຳເສຍ, ຂີ້ເຫຍື້ອ ແລະ ມົນລະພິດທາງອາກາດ. ໜ້າພາກວິຊາເຊື່ອມໂຍງຫົວຂໍ້ເຫຼົ່ານີ້ກັບການອະນຸລັກຊັບພະຍາກອນ ແລະ ໂຄງການຄົ້ນຄວ້າສ່ວນບຸກຄົນ.',
      en: 'Explore wastewater treatment, waste management and air-pollution control. The department connects these topics with natural-resource conservation and an individual environmental engineering project.',
    },
    source: 'environmental',
  },
  {
    id: 'mechanical',
    name: { lo: 'ພາກວິຊາວິສະວະກຳກົນຈັກ', en: 'Mechanical Engineering' },
    description: {
      lo: 'ສຶກສາລະບົບກົນຈັກ ແລະ ການຜະລິດໃນອຸດສາຫະກຳ. ໜ້າພາກວິຊາອະທິບາຍການຮຽນວິທະຍາສາດພື້ນຖານ, ວິຊາສະເພາະ, ການຄົ້ນຄວ້າ ແລະ ການຝຶກພາກປະຕິບັດ.',
      en: 'Explore mechanical systems and industrial production. The department describes scientific foundations, specialist subjects, a research project and practical training.',
    },
    source: 'mechanical',
    bachelorMajors: [
      { lo: 'ວິສະວະກຳກົນຈັກ', en: 'Mechanical Engineering' },
      { lo: 'ວິສະວະກຳກົນຈັກ ແລະ ອຸດສາຫະກຳ', en: 'Mechanical and Industrial Engineering' },
    ],
  },
  {
    id: 'mining',
    name: { lo: 'ພາກວິຊາວິສະວະກຳບໍ່ແຮ່', en: 'Mining Engineering' },
    description: {
      lo: 'ສຶກສາວິທະຍາສາດໂລກ, ແຮ່ທາດ, ເຕັກໂນໂລຊີການຂຸດຄົ້ນ ແລະ ການອອກແບບບໍ່ແຮ່. ໜ້າພາກວິຊາຍັງກ່າວເຖິງເສດຖະສາດບໍ່ແຮ່ ແລະ ປະເດັນສິ່ງແວດລ້ອມ.',
      en: 'Study earth sciences, minerals, extraction technology and mine design. The department also identifies mining economics and environmental considerations as areas of study.',
    },
    source: 'mining',
  },
  {
    id: 'roads',
    name: { lo: 'ພາກວິຊາວິສະວະກຳຂົວ-ທາງ', en: 'Road and Bridge Engineering' },
    description: {
      lo: 'ຂົງເຂດນີ້ກ່ຽວກັບວິສະວະກຳຂອງຖະໜົນ ແລະ ຂົວ. ສຳລັບຂໍ້ມູນການຮຽນ ກະລຸນາເບິ່ງໜ້າພາກວິຊາໂດຍກົງ.',
      en: 'This field concerns the engineering of roads and bridges. For the faculty’s programme information, visit the official department page.',
    },
    source: 'roads',
    fieldOverviewOnly: true,
  },
  {
    id: 'transport',
    name: {
      lo: 'ພາກວິຊາວິສະວະກຳຂົນສົ່ງ ແລະ ພາລະທິການ',
      en: 'Transportation and Logistics Engineering',
    },
    description: {
      lo: 'ຂົງເຂດນີ້ກ່ຽວກັບລະບົບຂົນສົ່ງ ແລະ ການຈັດການເຄື່ອນຍ້າຍສິນຄ້າ. ສຳລັບຂໍ້ມູນການຮຽນ ກະລຸນາເບິ່ງໜ້າພາກວິຊາໂດຍກົງ.',
      en: 'This field concerns transport systems and the organization of goods movement. For the faculty’s programme information, visit the official department page.',
    },
    source: 'transport',
    fieldOverviewOnly: true,
  },
]

export const learningTopics = [
  {
    id: 'facilities',
    title: { lo: 'ພື້ນທີ່ສຳລັບການທົດລອງ', en: 'Spaces for practical learning' },
    body: {
      lo: 'ໜ້າສິ່ງອຳນວຍຄວາມສະດວກລະບຸຫ້ອງທົດລອງໄຮໂດຼລິກ, ວັດສະດຸຖະໜົນ ແລະ ລະບົບຄວບຄຸມ ເປັນຕົວຢ່າງພື້ນທີ່ການຮຽນພາກປະຕິບັດຂອງຄະນະ.',
      en: 'The faculty’s facilities page lists hydraulic, road-material and control-system laboratories among its spaces for practical learning.',
    },
    linkLabel: { lo: 'ເບິ່ງສິ່ງອຳນວຍຄວາມສະດວກ', en: 'Explore the facilities' },
    source: 'facilities',
  },
  {
    id: 'research',
    title: { lo: 'ຄົ້ນຄວ້າຈາກບັນຫາຈິງ', en: 'Research with a practical question' },
    body: {
      lo: 'ຕົວຢ່າງທີ່ຄະນະໄດ້ເຜີຍແຜ່ປະກອບມີ ລະບົບແຈ້ງເຕືອນອັກຄີໄພທີ່ລະບຸສະຖານທີ່ຜ່ານ 4G ແລະ ການວິເຄາະຄວາມຮຸນແຮງຂອງອຸປະຕິເຫດທາງຖະໜົນໃນລາວ.',
      en: 'Examples documented by the faculty include a location-aware fire alarm using 4G and analysis of road-accident severity in Laos.',
    },
    linkLabel: { lo: 'ອ່ານຕົວຢ່າງການຄົ້ນຄວ້າ', en: 'Read the research examples' },
    source: 'research',
  },
  {
    id: 'cooperation',
    title: { lo: 'ແລກປ່ຽນຄວາມຮູ້', en: 'Knowledge across institutions' },
    body: {
      lo: 'ຄະນະອະທິບາຍການຮ່ວມມືຜ່ານການເຮັດວິໄຈຮ່ວມ, ກອງປະຊຸມ ແລະ ສຳມະນາວິຊາການ, ພ້ອມການແລກປ່ຽນຄູ-ອາຈານ ແລະ ນັກຄົ້ນຄວ້າ.',
      en: 'The faculty describes cooperation through joint research, academic meetings and seminars, and exchanges for teaching and research staff.',
    },
    linkLabel: { lo: 'ອ່ານກ່ຽວກັບການຮ່ວມມື', en: 'Read about university cooperation' },
    source: 'cooperation',
  },
] satisfies { id: string; title: Copy; body: Copy; linkLabel: Copy; source: SourceId }[]

export const studentResources = [
  {
    id: 'services',
    title: { lo: 'ການບໍລິການນັກສຶກສາ', en: 'Student services' },
    body: {
      lo: 'ເບິ່ງໜ້າບໍລິການ ແລະ ຕິດຕໍ່ຄະນະເພື່ອສອບຖາມລາຍລະອຽດ.',
      en: 'Visit the official services page and contact the faculty for arrangements and availability.',
    },
    source: 'services',
  },
  {
    id: 'scholarships',
    title: { lo: 'ຂ່າວແຈ້ງການທຶນການສຶກສາ', en: 'Scholarship notices' },
    body: {
      lo: 'ອ່ານປະກາດທາງການ ແລະ ກວດສອບວັນທີກັບຄະນະກ່ອນສະໝັກ.',
      en: 'Browse the official notices and confirm their dates with the faculty before applying.',
    },
    source: 'scholarships',
  },
  {
    id: 'calendar',
    title: { lo: 'ປະຕິທິນນັກສຶກສາ', en: 'Academic calendar' },
    body: {
      lo: 'ເບິ່ງໜ້າປະຕິທິນທາງການ; ສອບຖາມຄະນະສຳລັບຕາຕະລາງປັດຈຸບັນ.',
      en: 'Open the official calendar page; consult the faculty for the current timetable.',
    },
    source: 'calendar',
  },
] satisfies { id: string; title: Copy; body: Copy; source: SourceId }[]

export const facultyNews = [
  {
    id: 'calibration-seminar',
    title: {
      lo: 'ສຳມະນາການອ່ານ ແລະ ຕີຄວາມໃບຢັ້ງຢືນການສອບທຽບ',
      en: 'Seminar on Interpretation of Calibration Certificate',
    },
    publishedOn: '2023-09-20',
    displayDate: { lo: '20 ກັນຍາ 2023', en: '20 September 2023' },
    summary: {
      lo: 'ສຳມະນາທີ່ວຽງຈັນໃນວັນທີ 15 ກັນຍາ 2023 ໄດ້ຫາລືການອ່ານໃບຢັ້ງຢືນການສອບທຽບ ແລະ ການນຳຄວາມຮູ້ດ້ານການວັດແທກໄປໃຊ້.',
      en: 'A Vientiane seminar on 15 September 2023 explored calibration certificates and their use in practical measurement.',
    },
    source: 'seminar',
  },
] satisfies {
  id: string
  title: Copy
  publishedOn: string
  displayDate: Copy
  summary: Copy
  source: SourceId
}[]

export const facultyContact = {
  address: {
    lo: 'ຖະໜົນມິດຕະພາບລາວ-ໄທ, ບ້ານໂສກປ່າຫຼວງ, ເມືອງສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ',
    en: 'Lao-Thai Friendship Road, Sokpaluang Village, Sisattanak District, Vientiane, Lao PDR',
  },
  telephone: '+856 21 321 072',
  telephoneHref: 'tel:+85621321072',
  email: 'admin_fe@fe-nuol.edu.la',
  mapUrl: 'https://goo.gl/maps/qKb84hSzoYXeKdsC6',
  mapVerification: {
    accessedOn: '2026-10-17',
    destination:
      'https://www.google.com/maps/place/Faculty+of+Engineering+(NUOL)/@17.9396742,102.6214698,17z/data=!3m1!4b1!4m6!3m5!1s0x3124661fa3be608d:0x1033c20d059359d0!8m2!3d17.9396742!4d102.6240447!16s%2Fg%2F1hc1tl6bn?entry=tts&shorturl=1',
    note: 'Followed the English contact page’s actual map link; HTTP 200 Google Maps place named Faculty of Engineering (NUOL).',
  },
  source: 'contact' as SourceId,
}

// The project owner supplied this link; it is deliberately preserved, not substituted.
export const ownerFacebook = 'https://www.facebook.com/share/1DfYeSa4xa/'

export const facultyLabels = {
  source: { lo: 'ແຫຼ່ງຂໍ້ມູນ: ເວັບໄຊທ໌ຄະນະທາງການ', en: 'Source: Official faculty website' },
  universityVision: { lo: 'ວິໄສທັດຂອງມະຫາວິທະຍາໄລ', en: 'The university’s vision' },
  readVision: { lo: 'ອ່ານວິໄສທັດ', en: 'Read the vision' },
  timeline: { lo: 'ຮາກຖານຂອງພວກເຮົາ', en: 'OUR FOUNDATIONS' },
  fieldOverview: { lo: 'ຂົງເຂດນີ້ໂດຍຫຍໍ້', en: 'THE FIELD, IN BRIEF' },
  departmentOverview: { lo: 'ຮູ້ຈັກພາກວິຊາ', en: 'DEPARTMENT OVERVIEW' },
  bachelorMajors: {
    lo: 'ສາຂາປະລິນຍາຕີທີ່ໜ້າພາກວິຊາລະບຸ',
    en: 'Bachelor’s majors listed by the department',
  },
  majorsNote: {
    lo: 'ເບິ່ງໜ້າພາກວິຊາສຳລັບລາຍລະອຽດຫຼັກສູດ.',
    en: 'See the department page for programme details.',
  },
  learningKicker: { lo: 'ການຮຽນຮູ້ ແລະ ການຄົ້ນຄວ້າ', en: 'LEARNING, RESEARCH & COOPERATION' },
  learningFirst: { lo: 'ເຊື່ອມໂຍງຄວາມຮູ້', en: 'Put knowledge' },
  learningSecond: { lo: 'ກັບພາກປະຕິບັດ.', en: 'into practice.' },
  learningIntro: {
    lo: 'ສຳຫຼວດພື້ນທີ່ການຮຽນ, ຕົວຢ່າງການຄົ້ນຄວ້າ ແລະ ການແລກປ່ຽນວິຊາການທີ່ຄະນະໄດ້ເຜີຍແຜ່.',
    en: 'Explore learning spaces, research examples and academic exchange documented on the faculty website.',
  },
  resources: { lo: 'ຂໍ້ມູນສຳລັບນັກສຶກສາ', en: 'USEFUL STUDENT INFORMATION' },
  officialPage: { lo: 'ເປີດໜ້າທາງການ', en: 'Open the official page' },
  news: { lo: 'ຈາກຄະນະ', en: 'From the Faculty' },
  archive: { lo: 'ບົດຄວາມຈາກຄັງຂ່າວ', en: 'FROM THE ARCHIVE' },
  published: { lo: 'ເຜີຍແຜ່', en: 'Published' },
  readArticle: { lo: 'ອ່ານບົດຄວາມ', en: 'Read the article' },
  address: { lo: 'ສະຖານທີ່', en: 'VISIT THE FACULTY' },
  telephone: { lo: 'ໂທລະສັບ', en: 'TELEPHONE' },
  email: { lo: 'ອີເມວ', en: 'EMAIL' },
  map: { lo: 'ເບິ່ງໃນ Google Maps', en: 'View on Google Maps' },
  campusAlt: {
    lo: 'ປ້າຍທາງເຂົ້າຄະນະວິສະວະກຳສາດ ໃນຮູບທີ່ເຈົ້າຂອງໂຄງການສະໜອງ',
    en: 'Faculty of Engineering entrance sign in the project owner’s supplied photograph',
  },
} satisfies Record<string, Copy>
