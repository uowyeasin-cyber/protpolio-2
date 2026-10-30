// ============================================================
// Site content. Everything a visitor reads in the lists, cards,
// galleries, credentials and chatbot comes from this file.
// Edit it to update the site, or to rebrand it for someone else.
// Images live in /img (name-t.webp is the thumbnail of name.webp).
// ============================================================

// Your details, used by the WhatsApp buttons, quote buttons and brief form.
const SITE = {
  name: "Yeasin Arafat",
  email: "yeasinarafat272003@gmail.com",
  whatsapp: "60178151865",          // country code + number, digits only
  phone: "+60 17 815 1865",
  location: "Shah Alam, Selangor, Malaysia",
  linkedin: "https://www.linkedin.com/in/yeasin-arafat-07269432b",
  github: "https://github.com/uowyeasin-cyber",
  resume: "https://drive.google.com/file/d/1pEi4xJrkY9GgL6H_Nm5rOhIOL7Ktamwk/view?usp=drivesdk",
};

// Image sizes [width, height] for every gallery piece (used for layout before images load).
const META = {"edu-english-course-cover": [1600, 901], "com-eid-poster-1": [1080, 1350], "com-eid-poster-2": [1280, 1600], "pe-logo": [500, 500], "com-merit-certificate": [1600, 1131], "pe-fb-cover": [1600, 901], "me-portrait-studio": [896, 1152], "hgs-social-platters": [1080, 1080], "hid-foundation-logo": [500, 500], "hgs-wordmark": [500, 500], "hgs-social-order-now": [1080, 1080], "pe-reel-ramadan": [900, 1600], "pe-reel-shop-now": [900, 1600], "pe-reel-product": [900, 1600], "hid-blood-bank-form": [1131, 1600], "shd-menu-platters": [1131, 1600], "shd-menu-wraps": [1131, 1600], "shd-menu-sandwich": [1131, 1600], "shd-menu-cover": [1131, 1600], "shd-menu-rice": [1131, 1600], "shd-led-menu": [1600, 900], "hgs-menu-cover": [1131, 1600], "hgs-menu-platters": [1131, 1600], "hgs-menu-wraps": [1131, 1600], "hgs-menu-sandwich": [1131, 1600], "hgs-menu-chicken": [1131, 1600], "hgs-menu-salads": [1131, 1600], "edu-podcast-thumb": [1280, 720], "hgs-brochure-outside": [1600, 1236], "hgs-brochure-inside": [1600, 1236], "hgs-social-pizza": [1080, 1080], "hid-tshirt": [1131, 1600], "me-portrait-city": [1254, 1254], "edu-podcast-banner": [1546, 423], "me-portrait-formal": [496, 654], "hid-canada-ad": [1080, 1080], "hid-blood-bank-logo": [960, 960], "hgs-social-fried-chicken": [1080, 1080], "hgs-grand-opening": [985, 494], "hgs-web-banner": [1600, 901], "com-tme-logo": [500, 500], "hid-shop-app": [540, 1200], "com-ramadan-calendar": [899, 1599], "com-batch-2k21-logo": [1024, 1024], "me-averroes-logo": [500, 500], "hgs-led-menu": [1600, 1035], "hid-shop-logo-dark": [500, 500], "hgs-badge-logo": [500, 500], "edu-wisdom-logo": [500, 500], "edu-ahmads-logo": [500, 500], "com-somaj-kollan-logo": [500, 500], "hgs-app-splash": [720, 1600], "me-ya-logo": [1595, 1600], "hid-clothing-promo": [1080, 1080], "edu-youtube-thumb": [1280, 720], "hid-shop-logo": [500, 500], "edu-book-cover": [1003, 1600], "com-alor-ahoban-logo": [1594, 1600], "me-fb-cover": [1600, 901], "com-madrasa-notice": [720, 720]};

// Gallery pieces: id: [title, category, spec]. Category is one of the CATS keys below.
const P = {
  "hgs-badge-logo":["Halal Gyro Spot badge logo","branding","Logo · 500×500"],
  "hgs-wordmark":["Halal Gyro Spot wordmark","branding","Wordmark"],
  "hgs-menu-cover":["Menu cover","print","Menu · A4 portrait"],
  "hgs-menu-platters":["Gyro platters page","print","Menu · A4 portrait"],
  "hgs-menu-wraps":["Gyro wraps page","print","Menu · A4 portrait"],
  "hgs-menu-sandwich":["Sandwich page","print","Menu · A4 portrait"],
  "hgs-menu-chicken":["Chicken, wings & tenders","print","Menu · A4 portrait"],
  "hgs-menu-salads":["Salads, sides & seafood","print","Menu · A4 portrait"],
  "hgs-brochure-outside":["Z-fold brochure, outside","print","Z-fold · 3 panels"],
  "hgs-brochure-inside":["Z-fold brochure, inside","print","Z-fold · 3 panels"],
  "hgs-led-menu":["LED menu board","print","LED screen · landscape"],
  "hgs-social-platters":["Gyro platters post","social","Post · 1080×1080"],
  "hgs-social-order-now":["Order now post","social","Post · 1080×1080"],
  "hgs-social-pizza":["Pizza post","social","Post · 1080×1080"],
  "hgs-social-fried-chicken":["Fried chicken combo post","social","Post · 1080×1080"],
  "hgs-grand-opening":["Grand opening banner","social","Banner"],
  "hgs-web-banner":["Delivery web banner","social","Cover · 1640×924"],
  "hgs-app-splash":["Ordering app, start screen","web","App UI · 720×1600"],
  "shd-menu-cover":["Spring Hill Deli menu cover","print","Menu · A4 portrait"],
  "shd-menu-platters":["Gyro platters page","print","Menu · A4 portrait"],
  "shd-menu-wraps":["Gyro wraps page","print","Menu · A4 portrait"],
  "shd-menu-sandwich":["Sandwich page","print","Menu · A4 portrait"],
  "shd-menu-rice":["Rice bowls & gizzard page","print","Menu · A4 portrait"],
  "shd-led-menu":["Spring Hill Deli LED menu","print","LED screen · 1920×1080"],
  "pe-logo":["Panjabi Emporium logo","branding","Logo · 500×500"],
  "pe-fb-cover":["Ramadan collection cover","social","Cover · 1640×924"],
  "pe-reel-ramadan":["Ramadan collection reel","social","Reel · 1080×1920"],
  "pe-reel-shop-now":["Shop now reel","social","Reel · 1080×1920"],
  "pe-reel-product":["Product card reel","social","Reel · 1080×1920"],
  "hid-foundation-logo":["Hidayah Foundation logo","branding","Logo"],
  "hid-blood-bank-logo":["Hidayah Blood Bank logo","branding","Logo · 960×960"],
  "hid-shop-logo":["Hidayah Shop BD logo","branding","Logo · 500×500"],
  "hid-shop-logo-dark":["Hidayah Shop BD logo, dark","branding","Logo · 500×500"],
  "hid-blood-bank-form":["Blood donor form","print","Form · A4"],
  "hid-clothing-promo":["Men's clothing promo","social","Post · 1080×1080"],
  "hid-tshirt":["Bangladesh T-shirt product","social","Product · A4"],
  "hid-canada-ad":["Canada application ad","social","Post · 1080×1080"],
  "hid-shop-app":["Shop app, new arrivals","web","App UI · 540×1200"],
  "edu-wisdom-logo":["Wisdom English Institute logo","branding","Logo · 500×500"],
  "edu-english-course-cover":["English course cover","social","Cover · 1640×924"],
  "edu-book-cover":["Full Spoken Book cover","print","Book cover · 1410×2250"],
  "edu-ahmads-logo":["Ahmad's Education logo","branding","Logo · 500×500"],
  "edu-youtube-thumb":["YouTube thumbnail","social","Thumbnail · 1280×720"],
  "edu-podcast-thumb":["The Daily Podcast thumbnail","social","Thumbnail · 1280×720"],
  "edu-podcast-banner":["Yeasin Podcast banner","social","Banner · 1546×423"],
  "com-somaj-kollan-logo":["Islami Somaj Kollan Parishad logo","branding","Logo · 500×500"],
  "com-alor-ahoban-logo":["Alor Ahoban Foundation logo","branding","Logo"],
  "com-batch-2k21-logo":["Batch 2k21 logo","branding","Logo · 1024×1024"],
  "com-tme-logo":["T-ME logo","branding","Logo · 500×500"],
  "com-merit-certificate":["Merit exam certificate","print","Certificate · landscape"],
  "com-eid-poster-1":["Eid Mubarak poster","social","Poster · 1080×1350"],
  "com-eid-poster-2":["Eid greeting poster","print","Poster · print"],
  "com-ramadan-calendar":["Ramadan calendar","print","Calendar · portrait"],
  "com-madrasa-notice":["Madrasa admission notice 2025","social","Post · 1080×1080"],
  "me-averroes-logo":["Averroes logo","branding","Logo · 500×500"],
  "me-ya-logo":["YA personal monogram","branding","Monogram"],
  "me-fb-cover":["Grow Your Skill cover","social","Cover · 1640×924"],
};

// Videos in /vid with a poster in /img/<id>-poster.jpg.
const VIDEOS = {
  "hgs-display":{t:"Halal Gyro Spot display video",spec:"Video · 1080p · 2:55",cat:"video"},
  "gyro-pita":{t:"Chicken Gyro on Pita promo",spec:"Video · 1080p · 0:30",cat:"video"},
  "hgs-app-demo":{t:"Ordering app walkthrough",spec:"Screen recording · 0:27",cat:"web"},
};

// Archive filter categories.
const CATS = [["all","All"],["branding","Logos & Branding"],["print","Menus & Print"],["social","Social Media"],["video","Video & Motion"],["web","App & Web"],["architecture","Architecture"]];

// Design case studies (each gets its own page at #p-<slug>).
const PROJECTS = [
  {slug:"halal-gyro-spot", name:"The Halal Gyro Spot", client:"The Halal Gyro Spot, Pensacola, Florida", year:"2024–2025", cover:"hgs-brochure-inside",
   scope:"Full brand system", tags:["Branding","Menu","LED","Video","App UI"],
   summary:"A complete visual system for a halal restaurant in Florida. I designed the logo, a six-page menu, a Z-fold takeaway brochure, an LED menu board, launch and delivery posts, an ordering app concept and promo videos.",
   deliver:"Logo, 6-page menu, Z-fold brochure, LED board, 7 social posts, app UI, 2 videos",
   groups:[
     {h:"Identity",p:"A bold red-and-black badge built for food photos, takeaway bags and delivery apps. The round seal reads well even as a tiny delivery-app icon.",cols:2,fit:true,items:["hgs-badge-logo","hgs-wordmark"]},
     {h:"Six-page menu",p:"Dark wood texture, round food photos and big red numbers, so customers can order by number at the counter.",cols:3,items:["hgs-menu-cover","hgs-menu-platters","hgs-menu-wraps","hgs-menu-sandwich","hgs-menu-chicken","hgs-menu-salads"]},
     {h:"Z-fold brochure",p:"The full menu folded into three panels for takeaway bags and local drops.",cols:2,items:["hgs-brochure-outside","hgs-brochure-inside"]},
     {h:"LED menu board",p:"The full menu on one landscape screen over the counter, with prices large enough to read from the queue.",cols:1,items:["hgs-led-menu"]},
     {h:"Launch & social media",p:"Grand opening and delivery-partner posts that all share one layout, so the feed looks like one brand.",cols:3,items:["hgs-social-platters","hgs-social-order-now","hgs-social-pizza","hgs-social-fried-chicken","hgs-web-banner","hgs-grand-opening"]},
     {h:"Video",p:"A long in-store display loop and a short product promo for social media.",video:["hgs-display","gyro-pita"]},
     {h:"Ordering app concept",p:"A mobile ordering flow with a start screen, category tabs and an add-to-cart grid, in the same brand colours.",app:true},
   ]},
  {slug:"spring-hill-deli", name:"Spring Hill Deli", client:"Spring Hill Deli, Panama City, Florida", year:"2025", cover:"shd-led-menu",
   scope:"Menu & LED board", tags:["Menu","LED","Print"],
   summary:"A premium black-and-gold menu for a Florida deli, plus a matching LED menu board. Gold serif headings and round food photos make a fast-food menu feel upmarket.",
   deliver:"Multi-page menu, LED menu board",
   groups:[
     {h:"LED menu board",p:"Every section of the menu on one 1920×1080 screen, laid out in three columns.",cols:1,items:["shd-led-menu"]},
     {h:"Printed menu",p:"Each page has one category, a gold header and price pills that are easy to scan.",cols:3,items:["shd-menu-cover","shd-menu-platters","shd-menu-wraps","shd-menu-sandwich","shd-menu-rice"]},
   ]},
  {slug:"panjabi-emporium", name:"Panjabi Emporium", client:"Panjabi Emporium, menswear", year:"2025", cover:"pe-fb-cover",
   scope:"Brand & campaign", tags:["Logo","Reels","Campaign"],
   summary:"The logo and a Ramadan collection campaign for a panjabi clothing shop. The work covers a Facebook cover and vertical reels for Instagram.",
   deliver:"Logo, cover, 3 reels",
   groups:[
     {h:"Logo",p:"A heavy italic wordmark with a gold accent, made to work on black packaging and on clothing tags.",cols:2,fit:true,items:["pe-logo","pe-fb-cover"]},
     {h:"Instagram reels",p:"Vertical 1080×1920 frames: a collection opener, a product card with sizes and price, and a shop-now end card.",cols:3,items:["pe-reel-ramadan","pe-reel-product","pe-reel-shop-now"]},
   ]},
  {slug:"hidayah", name:"Hidayah Foundation & Shop", client:"Founder · Hidayah United Foundation, Hidayah Blood Bank, Hidayah Shop BD", year:"2017–2025", cover:"hid-blood-bank-logo",
   scope:"Family of brands", tags:["Logos","Forms","E-commerce"],
   summary:"Identities for organisations I founded: a community foundation, a blood bank that connects donors with patients, and an online shop. Each one shares the same bold HiDAYAH lettering.",
   deliver:"3 logos, donor form, product posts, shop app screen",
   groups:[
     {h:"Logos",p:"One wordmark across the family: the foundation and the online shop, in light and dark versions.",cols:3,fit:true,items:["hid-foundation-logo","hid-shop-logo","hid-shop-logo-dark"]},
     {h:"Blood bank",p:"A blood-drop emblem with caring hands, and a printable A4 donor sign-up form in the same colours.",cols:2,fit:true,items:["hid-blood-bank-logo","hid-blood-bank-form"]},
     {h:"Shop BD",p:"Product posts and a new-arrivals screen for the online store.",cols:4,items:["hid-clothing-promo","hid-tshirt","hid-canada-ad","hid-shop-app"]},
   ]},
  {slug:"sakina-nest", name:"Sakina Nest", client:"Family home design concept", year:"Concept", cover:"sak-1",
   scope:"Architecture presentation", tags:["Floor plans","3D","Layout"],
   summary:"A presentation for a white two-storey family home. It includes floor plans for each level, 3D views, a roof-top plan and cut-away views, laid out like an architect's client book.",
   deliver:"9-page A4 presentation",
   groups:[
     {h:"Concept",p:"The cover and the design notes: what changed and how the house looks.",cols:2,items:["sak-1","sak-2"]},
     {h:"Plans",p:"Ground floor, first floor and roof plans, with a short guide to who lives where.",cols:2,items:["sak-3","sak-4","sak-5","sak-6"]},
     {h:"Views",p:"Cut-away 3D views of each floor.",cols:3,items:["sak-7","sak-8","sak-9"]},
   ]},
  {slug:"education", name:"Education & Creators", client:"Wisdom English Institute · Ahmad's Education · Yeasin Podcast", year:"2024–2025", cover:"edu-english-course-cover",
   scope:"Logos, covers & thumbnails", tags:["Logo","Book cover","YouTube"],
   summary:"Design for English schools and creators: school logos, a course banner, a children's spoken-English book cover, and podcast and YouTube thumbnails.",
   deliver:"2 logos, book cover, course cover, 3 thumbnails",
   groups:[
     {h:"School identities",p:"Round seals for two English schools that work on certificates and as profile pictures.",cols:2,fit:true,items:["edu-wisdom-logo","edu-ahmads-logo"]},
     {h:"Course & book",p:"A Facebook cover for the English speaking course and the cover of its companion book.",cols:2,items:["edu-english-course-cover","edu-book-cover"]},
     {h:"Podcast & YouTube",p:"Thumbnails and a channel banner made to stand out in a crowded feed.",cols:3,items:["edu-youtube-thumb","edu-podcast-thumb","edu-podcast-banner"]},
   ]},
  {slug:"community", name:"Community & Events", client:"Foundations, schools and local leaders in Bangladesh", year:"2024–2025", cover:"com-eid-poster-1",
   scope:"Logos, posters & print", tags:["Bangla type","Posters","Certificates"],
   summary:"Bangla and English work for community groups: organisation seals, Eid greetings, a Ramadan calendar, an admission notice and award certificates.",
   deliver:"4 logos, posters, calendar, certificate",
   groups:[
     {h:"Organisation seals",p:"Round emblems with Bangla lettering set along the circle.",cols:4,fit:true,items:["com-somaj-kollan-logo","com-alor-ahoban-logo","com-batch-2k21-logo","com-tme-logo"]},
     {h:"Posters & notices",p:"Festive greetings and notices for print and Facebook.",cols:4,items:["com-eid-poster-1","com-eid-poster-2","com-ramadan-calendar","com-madrasa-notice"]},
     {h:"Certificates",p:"A merit award certificate with a classic border.",cols:1,items:["com-merit-certificate"]},
   ]},
];

// Services page cards.
const SERVICES = [
  {t:"Mobile & web apps",p:"Apps that work offline, in several languages, with logins, data and payments when you need them.",l:["Android, iOS & web (PWA)","Accounts, dashboards & payments","Firebase, Node.js & PostgreSQL"],i:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'},
  {t:"Websites & online stores",p:"Fast business sites and stores in Next.js, built to rank on Google and load quickly on phones.",l:["Business & landing pages","E-commerce with Stripe, PayPal, bKash","Hosting, domain & SEO setup"],i:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>'},
  {t:"Web design & UI/UX",p:"Wireframes, app screens and design systems in Figma, tested so people find what they need.",l:["Wireframes & prototypes","App & website screens","Design systems & components"],i:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>'},
  {t:"Portfolio websites",p:"A personal portfolio like this one, with your work, résumé and a private editor to update it yourself.",l:["Light & dark themes","Case studies & résumé page","Owner-only editor, no code needed"],i:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'},
  {t:"Brand identity",p:"Logos and visual systems that work as a tiny app icon and on a shop sign.",l:["Logo & monogram design","Colour and type system","Seals and badges"],i:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'},
  {t:"Menus & print",p:"Restaurant menus, brochures and forms that are easy to read and ready for print.",l:["Multi-page menus","Z-fold & tri-fold brochures","Certificates & forms"],i:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'},
  {t:"LED & screen menus",p:"Digital menu boards for counters, laid out so prices read from the queue.",l:["1080p menu boards","Display loops","Promo screens"],i:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'},
  {t:"Social media design",p:"Posts, covers and reels that keep a feed looking like one brand.",l:["1:1 posts & 9:16 reels","Facebook & YouTube covers","Launch campaigns"],i:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".8" fill="currentColor"/>'},
  {t:"Video editing",p:"Short promos and longer display videos with motion graphics and sound.",l:["Food & product promos","Thumbnails","Motion text"],i:'<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/>'},
];

// Software toolkit tiles: [badge, name, use, text colour, badge colour].
const TOOLS = [["Ps","Photoshop","Photo editing","#31A8FF","#001E36"],["Lr","Lightroom","Colour grading","#31A8FF","#001E36"],["Ae","After Effects","Motion graphics","#D291FF","#00005B"],["Pr","Premiere Pro","Video editing","#9999FF","#00005B"],["Cv","Canva","Layout & social","#fff","#7D2AE8"],["Fm","Filmora","Video editing","#fff","#0b7e8a"],["Cc","CapCut","Reels & shorts","#000","#fff"],["Au","Audacity","Audio cleanup","#fff","#1d3c8f"],["Cb","Cubase","Music & sound","#fff","#2b4b77"],["H5","HTML & CSS","Web pages","#fff","#E44D26"],["JS","JavaScript","Interaction","#000","#F7DF1E"],["C++","C++","Programming","#fff","#00599C"],["Py","Python","Programming","#FFD43B","#306998"],["SQL","MySQL","Databases","#fff","#00758F"],["Fg","Figma","UI/UX design","#fff","#A259FF"],["Ai","Illustrator","Logos & vectors","#FF9A00","#330000"],["Wp","WordPress","Websites","#fff","#21759B"],["Jv","Java","OOP & Spring Boot","#fff","#E76F00"],["Nd","Node.js","Servers & APIs","#fff","#3C873A"],["Dk","Docker","Containers","#fff","#1D63ED"]];

// Education rows: [dates, title, detail, score, optional [link label, url]].
const EDU = [
  ["Jan 2026 – Dec 2028","Bachelor of Engineering, Computer Science","University of Wollongong Malaysia · UOW High Achievers Scholarship · Computer Science Club, competitions and hackathons.","UOW",["See awards & credentials","#awards"]],
  ["May 2024 – Dec 2025","Honours, English Language and Literature","Tongi Govt College.",""],
  ["May 2024 – Dec 2025","Fazil","Tamirul Millat Kamil Madrasah.",""],
  ["Mar 2022 – Sep 2023","Intermediate (HSC), Science","Tamirul Millat Kamil Madrasah. Where I learned leadership.","5.00"],
  ["Until Mar 2023","Dakhil (SSC), Science","Al Manar Dakhil Madrasah. School-level activities.","5.00"],
  ["English","IELTS","Above Band 6 overall.","6+"],
]

// Work history rows: same shape as EDU.
const EXP = [
  ["Oct 2026 – now","Application Developer & Founder · Averroes AI","Self-employed, remote. Building AI-powered tools, automation for businesses and customer service, and software for real-world problems. Flagship project: Amalnama.","",["Install Amalnama","https://uowyeasin-cyber.github.io/AmalnamaForever"]],
  ["May – Jul 2026","Barista · swich caffe","Part-time at Sunway Pyramid, Selangor. Prepared espresso, cappuccino, latte, specialty coffees, mocktails, tea and juices; served cakes and gelato; handled orders, stock checks and customer requests; kept high standards of hygiene and presentation during busy hours.",""],
  ["Mar 2023 – Mar 2025","Small Business Owner · Hidayah Shop BD","Dhaka, on-site. Started during COVID-19 and restarted after HSC. Ran the online store, its marketing and business strategy.",""],
  ["Feb 2023 – Nov 2025","Founder · Hidayah United Foundation","A non-profit organisation in Bangladesh for social services and charity work.","",["Visit website","https://sites.google.com/view/hidayah-united-foundation/home"]],
  ["Jan 2017 – Sep 2025","Founder · Hidayah Blood Bank","A donor network that connected patients with nearby blood donors across Bangladesh, run remotely.",""],
  ["Internships","Programming Hero · Code Biruni","Internship work in programming and web development.",""],
  ["Freelance","Graphic designer & video editor","Brands, menus, LED boards and campaigns for The Halal Gyro Spot, Spring Hill Deli, Panjabi Emporium and others.",""],
  ["Teaching","English & IELTS trainer","Trained students in spoken English and IELTS preparation.",""],
]

// Skill cards on the About page.
const SKILLS = [
  ["Graphic design","Logos, menus, print layouts, social campaigns and Bangla and English typography."],
  ["Software development","C++, Java, Python, JavaScript and MySQL. Focus on software development, cybersecurity, data science and AI."],
  ["UI/UX & web","Figma, WordPress, HTML and CSS. App screens, landing pages and full-stack prototypes."],
  ["Communication","Clear briefs and fast revisions with clients in different countries. IELTS 6+."],
  ["Leadership","Founding and running Averroes AI, Hidayah Blood Bank, Hidayah United Foundation and Hidayah Shop BD."],
];

// Software projects (Code page and the Apps / Websites / Games / Systems sections of Work).
const DEV = [
  {n:"Amalnama",k:"Flagship app · Averroes AI",img:"dev-amalnama",full:"dev-amalnama",tags:["Mobile web app","AI","Offline-first","6 languages"],
   p:"Your daily record of good deeds. A free, ad-free Islamic companion app with prayer times, Quran, hadith, an AI mufti, Qibla, a hifz tracker and family budgets in one place.",
   l:["Prayer times with azan, all 114 surahs of the Quran and the six authentic hadith collections","An AI mufti (Gemini through Firebase AI Logic) that answers with Quran and hadith references","WhatsApp-style chats, groups and group calls that ring through Web Push even when the app is closed","Halal finance planner, zakat calculator, hifz tracker and daily routine","Installable PWA in vanilla JavaScript with no build step; GitHub Actions run checks and refresh the video feed every 6 hours"],
   link:["Install Amalnama","https://uowyeasin-cyber.github.io/AmalnamaForever/"],gh:"AmalnamaForever"},
  {n:"Averroes Code",k:"Desktop & mobile app · Averroes AI",img:"dev-averroes-code",full:"dev-averroes-code",tags:["C · C++ · Python · Java","JS · TS · HTML · CSS","Offline","Pyodide · WebAssembly"],
   p:"A free code editor and compiler that works fully offline on Windows, Mac and Linux, with a phone app too. It comes with 23 video courses in English, Bangla, Hindi and Arabic.",
   l:["Write and run C, C++, Python, Java, JavaScript, TypeScript, HTML and CSS without internet","Python runs in the browser through Pyodide (WebAssembly); C++ and JavaScript run in web workers","Courses from HTML to AI, cloud and DSA, plus unlimited practice problems","Live contests, medals and shareable certificates that anyone can verify"],
   link:["Download Averroes Code","https://uowyeasin-cyber.github.io/averroes-code/"],gh:"uowyeasin-cyber.github.io"},
  {n:"Sunnah Store",k:"Full-stack e-commerce · live",img:"dev-sunnah",link:["Visit Sunnah Store","https://sunnahstore.vercel.app/"],gh:"sunnah-store",tags:["Next.js 16","Prisma 6","PostgreSQL","Stripe · PayPal · SSLCommerz"],
   p:"A complete online shop with a storefront and an admin panel. Customers can pay by card, PayPal, bKash or Nagad, or cash on delivery, and orders are booked with a courier automatically.",
   l:["Storefront and admin panel built on the Next.js App Router with cached catalogue reads","Payments through Stripe (cards and FPX), PayPal and SSLCommerz, marked paid only after server-side confirmation","Steadfast courier booking and tracking for Bangladesh, Ship24 tracking everywhere else, with a cron job that emails customers","English, Bangla, Hindi and right-to-left Arabic","Reviews, offers, ads, social campaigns, store credit, expense reports and product view analytics"],
   code:`<span class="c">// prisma/schema.prisma (excerpt)</span>\n<span class="k">model</span> Product   { ... }\n<span class="k">model</span> Order     { ... }\n<span class="k">model</span> OrderLine { ... }\n<span class="k">model</span> Customer  { ... }\n<span class="k">model</span> Review    { ... }\n<span class="k">model</span> Offer     { ... }\n<span class="k">model</span> Campaign  { ... }\n<span class="k">model</span> Expense   { ... }\n\n<span class="c"># 9 migrations · 4 languages · 3 payment gateways</span>`,gh:"sunnah-store"},
  {n:"Neon Battle City",k:"Game · playable demo",demo:"neon-battle-city",tags:["JavaScript","Game AI","CSS animation","localStorage"],
   p:"A neon fighting game where you really can win or lose. Attack, use heavy hits, dodge and heal against an enemy AI that reacts with random timing, misses and hesitation.",
   l:["J, K, L and I keys, or tap the buttons on a phone","XP, unlimited levels, ranks, coins and badges, saved between visits","Combos, critical hits, screen shake and floating damage numbers","New city sectors as you level up, over an animated skyline and ocean","Heal has a 3-second cooldown so it can't be spammed"],
   extra:'<a class="mono" href="demo/city-brawler.html" target="_blank" rel="noopener">Also play v1: City Brawler ↗</a>'},
  {n:"Campus Islamic Society website",k:"Next.js starter site",img:"dev-cis",tags:["Next.js 16","React 19","TypeScript","Tailwind 4"],
   p:"A starter website for a university Islamic society, with a live prayer clock as its centrepiece. The night-sky and brass theme is built for reading after Maghrib as much as at noon.",
   l:["Live prayer times from JAKIM e-Solat, fetched on the server and refreshed every hour","A countdown to the next prayer and a 24-hour sky-colour timeline","Falls back to sample times if the prayer API is down","Values, upcoming events, committee and a WhatsApp join band, all edited from one site.ts file","Planned next: Supabase for events and a page for each event"]},
  {n:"Tic Tac Toe: Unbeatable AI",k:"Game · playable demo",demo:"tictactoe",tags:["JavaScript","Minimax","CSS animation"],
   p:"A Tic Tac Toe game against an AI that never loses. You can't win, so a draw earns points. Levels go on forever, with ranks from Rookie up to Conqueror.",
   l:["Minimax search, so the AI always plays the best move","Points, draws and unlimited levels with rank titles","Five animated themes that change as you level up: city, ocean, desert, snow and space","One HTML file with no libraries"]},
  {n:"Animated login & sign-up",k:"UI component · live demo",demo:"login",tags:["HTML","CSS","JavaScript"],
   p:"A login and registration screen where a curved purple panel slides across to swap between the two forms.",
   l:["Pure CSS transitions with timed delays for the slide","One class toggle in JavaScript drives the whole animation","Social sign-in buttons and form validation"]},
  {n:"CampusEarn",k:"Full-stack prototype",tags:["Node.js","SQLite","Firestore","REST API"],
   p:"A student job marketplace that connects university students with flexible part-time work on and around campus. It has separate student, job-giver and admin workspaces.",
   l:["Dependency-free Node.js server with a small REST API","Related SQLite tables for profiles, jobs, applications, payments and verification","Optional Cloud Firestore as the main store, with SQLite as a local cache","Works offline from a local copy when the server is down"],
   code:`<span class="c"># run locally</span>\n<span class="k">$</span> node --env-file-if-exists=.env server.js\n<span class="c">→ listening on 127.0.0.1:3000</span>\n\n<span class="k">GET</span>    /api/health  <span class="s">200</span>\n<span class="k">GET</span>    /api/state   <span class="s">200</span>\n<span class="k">PUT</span>    /api/state   <span class="s">200</span>\n<span class="k">DELETE</span> /api/state   <span class="s">204</span>`},
  {n:"CloudEats: from monolith to microservices",k:"Cloud & DevOps · refactor in progress",diagram:true,tags:["Docker","MySQL","Redis","MongoDB","Express","Jest","Husky"],
   p:"A food ordering platform that I'm splitting from one Express server into separate services. A demo storefront, Nasi Lemak Paradise, sits in front of it.",
   l:["Started as a monolith: Express, MySQL, bcrypt-hashed passwords and a register page","Now separate user, menu and order services behind an Express API gateway with JWT checks","MySQL for users and menus, Redis for sessions and caching, MongoDB for orders","Docker Compose runs everything, with healthchecks, named volumes and a private network","The menu service has a 13-case Jest suite for rating validation, covering boundaries, decimals, null and strings","A Husky pre-commit hook runs the tests before every commit","In progress: moving the menu routes out of the monolith"]},
  {n:"Online Food Ordering System",k:"University group project · OOSAD",gh:"OnlineFoodOrderingSystem",tags:["Java","UML","OOSAD","Web frontend"],
   p:"A food ordering system analysed and designed the object-oriented way, with full UML documentation, a Java console app and a companion web frontend.",
   l:["Use case, class and sequence diagrams","Java console app built from the class model","Web frontend for browsing the menu and placing orders"],
   code:`<span class="k">public class</span> Order {\n  <span class="k">private final</span> List&lt;OrderItem&gt; items;\n  <span class="k">private</span> OrderStatus status = OrderStatus.<span class="s">PLACED</span>;\n\n  <span class="k">public double</span> total() {\n    <span class="k">return</span> items.stream()\n      .mapToDouble(OrderItem::subtotal).sum();\n  }\n}`},
  {n:"This portfolio",k:"Personal site · live",img:"dev-portfolio",full:"dev-portfolio",link:["Open the live site","https://yeasinarafatbd.vercel.app/"],gh:"protpolio-2",tags:["HTML","CSS","JavaScript","Vercel"],
   p:"My own site, built more than once on purpose: first as a Vite, React and Tailwind app, then as a single dependency-free HTML file. This version adds case studies and a filterable work archive.",
   l:["Hash-based pages without a framework","Optimised images and video","Works on phones and large screens"],
   code:`<span class="c">// tiny router, no framework</span>\naddEventListener(<span class="s">"hashchange"</span>, route);\n\n<span class="k">function</span> route() {\n  <span class="k">const</span> page = location.hash.slice(1) || <span class="s">"home"</span>;\n  show(page);\n}`},
];

// Licences and certifications.
const CREDS=[
  {t:"Top Coder Malaysia 2026",iss:"Thulija Technologies (T-Academy) · Data Science Association · supported by MDEC",d:"Issued 29 Jul 2026",id:"CODE/DSA/G11/UOW/003",note:"Placed 5th at university level (UOW Malaysia, Glenmarie) and qualified for the national round.",img:"cert-topcoder"},
  {t:"Tableau Fundamentals",iss:"University of Wollongong Malaysia",d:"Issued 31 Jul 2026",id:"UOWM/04236",note:"Tableau Fundamentals Workshop, UOW Malaysia Glenmarie Campus.",img:"cert-tableau",url:"https://drive.google.com/drive/folders/1nRFZDywj4FXpEXFwWso1p4ujg_jTW9yS"},
  {t:"Python Coder",iss:"Data Science Association",d:"Issued Jul 2026",note:"Python programming certification.",url:"https://www.linkedin.com/company/datascienceassociation/"},
  {t:"UOW High Achievers Scholarship",iss:"University of Wollongong Malaysia",d:"Awarded 2026",note:"Awarded for outstanding academic performance, including GPA 5.00/5.00 in both SSC and HSC."},
];

// Client quotes, e.g. {q:"…", n:"Name", r:"Owner, Business"}. The section stays hidden while this is empty.
const TESTIMONIALS=[];

// Service packages. price: "" shows "Custom quote"; put e.g. "From USD 49" to show a price.
const PACKAGES={
  design:[
    {t:"Starter",f:"A single piece that needs to look right.",price:"",d:"Fast turnaround",l:["Logo, poster, flyer or 3 social posts","2 concepts to choose from","Print and web files","2 rounds of revisions"]},
    {t:"Brand kit",f:"A new shop, restaurant or page getting started.",price:"",d:"Most popular",pop:1,l:["Logo with colour and type system","Menu or brochure, print-ready","5 social posts and a cover","Source files included","3 rounds of revisions"]},
    {t:"Full launch",f:"Everything a launch needs, in one style.",price:"",d:"Complete system",l:["Everything in Brand kit","LED or TV menu board","Promo video or reel","Launch campaign posts","Priority support"]},
  ],
  dev:[
    {t:"Portfolio or landing page",f:"One polished site that shows who you are or what you sell.",price:"",d:"Fast turnaround",l:["Responsive, mobile-first design","Contact form or WhatsApp button","Basic SEO and analytics","Deployed live for you"]},
    {t:"Business website",f:"A multi-page site you can grow.",price:"",d:"Most popular",pop:1,l:["Up to 6 pages in Next.js","Your brand, copy and images","Fast load and good Lighthouse score","Hosting and domain setup"]},
    {t:"Web app or store",f:"Accounts, data, payments or a dashboard.",price:"",d:"Custom build",l:["Login and user accounts","Database (PostgreSQL or MySQL)","Payments, orders or bookings","Admin dashboard","Tests and documentation"]},
  ],
};

// Questions on the Services page.
const FAQ=[
  ["How do we start?","Send a short brief on WhatsApp, by email or with the form on the Contact page. I reply within 24 hours with questions and a fixed quote."],
  ["How does payment work?","You approve the quote before I start. For bigger projects we split it into a deposit and a final payment on delivery. I can work through online marketplaces too if you prefer."],
  ["Do you work with clients outside Malaysia?","Yes. I've delivered full brand systems for The Halal Gyro Spot in Florida, USA, and several businesses in Bangladesh. I work in English and Bangla."],
  ["What files will I get?","Print-ready PDFs, PNG and JPG files for web and social media, and source files when the package includes them. For websites you get the live site and the code."],
  ["Are you available for jobs and internships?","Yes. I'm open to internships, part-time and graduate roles in software development, on-site in the Klang Valley, hybrid or remote. See my one-page résumé."],
];

// Chatbot answers: k = keywords, a = answer (HTML allowed).
const BOT=[
  {k:["skill","language","tech","stack","know"],a:'I work with C++, Java, Python, JavaScript, HTML, CSS and MySQL. For design I use Photoshop, Illustrator, Figma and Canva, and for video Premiere Pro and After Effects. See <a href="#about">About</a>.'},
  {k:["averroes code","editor","compiler"],a:'Averroes Code is my free offline code editor and compiler for C, C++, Python, Java, JavaScript and more, with 23 courses in 4 languages. <a href="https://uowyeasin-cyber.github.io/averroes-code/" target="_blank" rel="noopener">Download it here</a>.'},
  {k:["store","shop","miswak","e-commerce","ecommerce"],a:'Sunnah Store (sunnahstore.vercel.app) is a live online shop for miswak pens, miswak sticks and attar I built with Next.js, Prisma and PostgreSQL, with card, PayPal, bKash and cash-on-delivery payments, courier tracking and 4 languages. See the <a href="#code">Code</a> page.'},
  {k:["amalnama","islamic app","quran","prayer app","averroes"],a:'Amalnama is my free, ad-free Islamic companion app: prayer times, Quran, hadith, an AI mufti, Qibla, hifz tracker and family budgets. It works offline in 6 languages. <a href="https://uowyeasin-cyber.github.io/AmalnamaForever" target="_blank" rel="noopener">Install it here</a>.'},
  {k:["project","build","built","code","app","github","campus","game","tic","neon","fight","next","prayer","islamic","docker","cloud","microservice","devops"],a:'My code projects include Amalnama (an Islamic companion app), Averroes Code (an offline code editor with courses), Sunnah Store (a live e-commerce site), Neon Battle City (a fighting game), a Campus Islamic Society website in Next.js with live prayer times, CloudEats (a food ordering app I\'m moving to Docker microservices), an unbeatable Tic Tac Toe AI and CampusEarn (a student jobs platform). Try the demos on the <a href="#code">Code</a> page.'},
  {k:["design","logo","menu","brand","graphic","video","work","portfolio"],a:'I\'ve designed full brands, menus, LED boards, social posts and videos for clients like The Halal Gyro Spot and Spring Hill Deli. Browse them on the <a href="#work">Work</a> page.'},
  {k:["resume","résumé","cv"],a:'You can open my résumé here: <a href="https://drive.google.com/file/d/1pEi4xJrkY9GgL6H_Nm5rOhIOL7Ktamwk/view?usp=drivesdk" target="_blank" rel="noopener">Résumé on Google Drive</a>.'},
  {k:["award","achiev","top coder","certif","tableau","scholar","presenter"],a:'I\'m Top Coder Malaysia 2026 (T-Academy) and hold the UOW High Achievers Scholarship. I\'m also certified in Tableau Fundamentals and as a Python Coder. See <a href="#awards">Awards</a>.'},
  {k:["educat","study","uni","gpa","school","degree","ssc","hsc","ielts"],a:'I\'m studying a Bachelor of Engineering in Computer Science at UOW Malaysia (2026 to 2028) on the High Achievers Scholarship. I scored GPA 5.00 in both SSC and HSC, and I\'m also doing Honours in English at Tongi Govt College.'},
  {k:["experience","job","intern","barista","teach"],a:'I\'m the founder and application developer at Averroes AI. Before that I was a barista at swich caffe, ran Hidayah Shop BD, founded Hidayah Blood Bank and Hidayah United Foundation, interned at Programming Hero and Code Biruni, and trained students in IELTS.'},
  {k:["hidayah","blood","foundation","volunteer"],a:'I founded Hidayah Blood Bank in 2017 to connect blood donors with patients in Bangladesh, and later the Hidayah United Foundation for community work.'},
  {k:["hire","freelance","service","price","cost","package","available","work with","quote","fiverr","upwork"],a:'Yes, I\'m available for freelance projects, internships and part-time roles. See fixed-price <a href="#services">packages</a>, my <a href="#cv">one-page résumé</a>, or message me on <a href="https://wa.me/60178151865" target="_blank" rel="noopener">WhatsApp</a>.'},
  {k:["contact","email","phone","reach","whatsapp","linkedin"],a:'Email me at yeasinarafat272003@gmail.com or call +60 17 815 1865. All my links are on the <a href="#contact">Contact</a> page.'},
  {k:["where","location","live","based","malaysia"],a:'I\'m based in Shah Alam, Selangor, Malaysia, and I work with clients worldwide.'},
  {k:["hi","hello","salam","hey"],a:'Hi! Ask me about my skills, projects, awards or how to contact me.'},
];

// Suggested chatbot questions.
const CHIPS=["What are your skills?","Show me your projects","Any awards?","How can I contact you?"];
