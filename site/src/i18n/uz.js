// Uzbek strings of the page. Keys are the same in ru.js, en.js and uz.js; selftest.js checks that.
import { CANONICAL_URL, CHANGELOG_URL } from '../config.js?v=3.3.0';

export default {
  // The words of the family chrome (the bar's menus, the skip link), as s.morgunov.tech says them.
  chrome: { skip: 'Asosiy kontentga oʻtish', changeLanguage: 'tilni oʻzgartirish', changeTheme: 'Mavzuni oʻzgartirish' },
  theme: { modes: { light: 'Yorugʻ', dark: 'Qorongʻi', auto: 'Avto', 'high-contrast': 'Yuqori kontrast' } },
  meta: {
    title: 'Fingerprint — saytni ochguningizcha kim va nimani bilib oladi',
    description: 'Noutbukni ochishdan saytning yuklanishigacha olti qadam: har birida kim va nimani bilib oladi, sizning haqiqiy maʼlumotlaringizda, va nima qilish kerak.'
  },
  introTitle: 'Saytni ochguningizcha kim va nimani bilib oladi',
  introRichHtml: /* html */`
      <section class="fp-section" lang="uz" aria-labelledby="fp-title">
        <p>
          Noutbukni ochishdan sahifa yuklanishigacha bir nechta kompaniya siz haqingizda nimadir bilib oladi.
          Bu sahifa buni qadam-baqadam, sizning haqiqiy maʼlumotlaringizda koʻrsatadi: quyidagilarning hammasi
          brauzeringiz hozirgina shu saytga bergan maʼlumotlar. 3-qadamda oʻzingiz bosadigan bitta soʻrovdan
          tashqari hech narsa hech qayerga yuborilmaydi.
        </p>
        <details>
          <summary class="intro-more">Bu sahifa maʼlumotlar bilan qanday ishlaydi</summary>
          <p>
            Hammasi brauzeringizda hisoblanadi va hech qayerga yuklanmaydi; hech qanday uchinchi tomon ularni koʻrmaydi.
            Xizmat bepul, reklamasiz va roʻyxatdan oʻtishsiz. Tarmoqqa chiqadigan narsalar:
          </p>
          <ul class="fp-list">
            <li>Sahifa ochilganda: Cloudflare dagi serverimizga umumiy statistika soʻrovi va Cloudflare Web Analytics
              cookie siz tashrifni sanaydi. Har qanday server kabi ular IP manzilingiz va brauzeringizni koʻradi.</li>
            <li>3-qadamdagi tugma bosilganda: serverimizga soʻrovlar. U IP, provayder va sarlavhalarni koʻrsatadi, IP ni
              ipquery.io (zaxira: ipinfo.io) va Google DNS orqali tekshiradi. Hisobot IP ostida bir soat saqlanadi;
              anonim statistikaga (brauzer, OT, mamlakat) IP kirmaydi. Serverimiz ishlamasa, brauzer ochiq IP xizmatlaridan
              toʻgʻridan-toʻgʻri soʻraydi (ipapi.co, freeipapi.com, ipify.org, myip.com).</li>
            <li>morgunov.tech dizayn tizimining shriftlari va uslublar jadvallari muallifning oʻz sayti s.morgunov.tech dan
              keladi: har qanday server kabi u IP manzilingiz va brauzeringizni koʻradi, lekin cookie qoʻymaydi va
              analitika yuritmaydi. Bu soʻrovlar barmoq izingiz haqida hech narsa olib ketmaydi.</li>
          </ul>
        </details>
      </section>
    `,

  stepLabel: n => `${n}-qadam, 6 tadan`,
  labels: {
    who: 'Kim bilib oladi',
    measured: 'Hozir oʻlchandi',
    afterCheck: '3-qadamdagi tekshiruvdan keyin koʻrinadi',
    notVisible: 'Sahifadan bu koʻrinmaydi: tizim shunday ishlaydi',
    how: 'Bu qanday ishlaydi',
    danger: 'Nega bu muhim',
    action: 'Nima qilish kerak',
    nothingToDo: 'Bu yerda qiladigan ish yoʻq'
  },

  parties: {
    nobody: 'Hozircha hech kim',
    nobodyNote: 'lekin bu qurilma pasportini brauzer 6-qadamda har bir saytga koʻrsatadi',
    osVendor: 'tizim ishlab chiqaruvchisi',
    distro: 'distributiv hamjamiyati',
    distroNote: 'odatda telemetriya yoʻq',
    isp: 'provayderingiz',
    ispUnknown: 'internet-provayderingiz',
    carrier: 'mobil operatoringiz',
    wifiOwner: 'Wi-Fi routerining egasi',
    wifiOwnerNote: 'uy, ofis, kafe',
    everySite: 'har bir sayt',
    everySiteNote: 'IP manzilingizni koʻradi',
    browserVendor: 'brauzer ishlab chiqaruvchisi',
    extensions: 'kengaytmalaringiz',
    extensionsNote: 'sahifalar mazmunini koʻradi',
    dns: 'DNS-server',
    dnsDefault: 'odatda provayderning serveri',
    cloudflare: 'Cloudflare',
    cloudflareNote: 'bu sayt ishlaydigan tarmoq',
    siteOwner: 'sayt egasi',
    siteOwnerNote: 'bu yerda morgunov.tech',
    adNetworks: 'reklama tarmoqlari va hisoblagichlar',
    adNetworksNote: 'bu sahifada ular yoʻq; oddiy saytda 10 tadan 30 tagacha'
  },
  vendors: { apple: 'Apple', microsoft: 'Microsoft', google: 'Google', mozilla: 'Mozilla', brave: 'Brave Software', yandex: 'Yandex', opera: 'Opera', samsung: 'Samsung', vivaldi: 'Vivaldi', arc: 'The Browser Company' },

  rows: {
    device: 'Qurilma', screen: 'Ekran', gpu: 'Videokarta', memory: 'Xotira', cores: 'Protsessor', battery: 'Batareya', charging: ', quvvat olmoqda',
    timezone: 'Vaqt mintaqasi', languages: 'Tizim tillari', localTime: 'Qurilmadagi vaqt',
    os: 'Tizim', vendor: 'Ishlab chiqaruvchi', arch: 'Arxitektura',
    ip: 'IP manzilingiz', isp: 'Provayder', location: 'IP boʻyicha joylashuv', connection: 'Ulanish turi', vpn: 'VPN yoki proksi', ipTimezone: 'IP boʻyicha vaqt mintaqasi',
    browser: 'Brauzer', blocker: 'Reklama bloklovchisi', dnt: 'Do Not Track', gpc: 'Global Privacy Control', permissions: 'Berilgan ruxsatlar', cookies: 'Cookies', storage: 'Sayt xotirasi',
    host: 'Bu sayt ishlaydigan tarmoq', tls: 'Shifrlash versiyasi (TLS)', http: 'HTTP protokoli', colo: 'Eng yaqin tarmoq tuguni',
    userAgent: 'User-Agent', acceptLanguage: 'Brauzer soʻragan tillar', clientHints: 'Client Hints', headerOrder: 'Soʻrovdagi sarlavhalar soni',
    canvas: 'Grafik iz (Canvas)', audio: 'Ovoz izi', webgl: 'Videokarta izi (WebGL)', fonts: 'Shriftlar', webrtc: 'WebRTC orqali manzil oqishi', thirdParty: 'Bu sahifadagi begona resurslar',
    detected: 'aniqlandi', notDetected: 'aniqlanmadi', yes: 'ha', no: 'yoʻq', on: 'yoqilgan', off: 'oʻchirilgan', none: 'yoʻq', unknown: 'maʼlumot yoʻq',
    leak: 'manzil koʻrinadi', safe: 'topilmadi', notChecked: 'tekshirilmagan', found: n => `${n} ta topildi`, mismatch: (ip, local) => `IP boʻyicha ${ip}, qurilmada ${local}`, same: 'qurilma bilan mos',
    coresValue: n => `${n} yadro`, memoryValue: n => `≈${n} GB`,
    fontsFound: n => `${n} ta shrift`
  },
  connection: { residential: 'uy yoki ofis', mobile: 'mobil tarmoq', datacenter: 'maʼlumotlar markazi', vpn: 'VPN yoki proksi' },
  perms: { camera: 'kamera', microphone: 'mikrofon', geolocation: 'geolokatsiya' },
  deviceNames: {
    androidFlagship: 'Android-flagman smartfon', androidPhone: 'Android-smartfon', androidTablet: 'Android-planshet', androidDevice: 'Android-qurilma',
    windowsWorkstation: 'kuchli Windows ish stantsiyasi', windowsPowerful: 'kuchli Windows-kompyuter', windowsPc: 'Windows-kompyuter', windowsLaptop: 'Windows-noutbuk', windowsBudget: 'byudjetli Windows-kompyuter', linux: 'Linux-tizim'
  },

  steps: {
    s1: {
      title: { laptop: 'Siz noutbukni ochdingiz', phone: 'Siz telefonni qulfdan chiqardingiz', tablet: 'Siz planshetni qoʻlga oldingiz', desktop: 'Siz kompyuterni yoqdingiz' },
      subtitle: 'Internetdan oldin ham qurilma allaqachon tasvirlangan: model, ekran, xotira, vaqt mintaqasi, tillar',
      how: 'Saytga ekran oʻlchami, yadrolar soni, xotira hajmi yoki vaqt mintaqasini oʻqish uchun ruxsat kerak emas: brauzer buni har qanday skriptga beradi. Alohida olganda bular mayda narsalar, birgalikda esa taniladigan qurilma pasporti.',
      danger: 'Qurilma pasporti texnikangizning sinfi va narxini fosh qiladi. Doʻkonlar va bron qilish xizmatlari qimmat qurilma egalariga yuqoriroq narx koʻrsata oladi. Vaqt mintaqasi va tillar IP manzilsiz ham qayerda yashashingizni aytib beradi.',
      action: 'Bu oddiy maʼlumotlar, ularni saytlarni buzmasdan yashirib boʻlmaydi. Esda tutish kerak boʻlgan bitta narsa: ular soʻrovsiz har bir saytga ketadi. Himoya 4-qadamdan boshlanadi.'
    },
    s2: {
      title: 'Operatsion tizim ishga tushdi',
      lead: (os, vendor) => (vendor ? `Sizda ${os}. Uni ${vendor} ishlab chiqaradi va tizim yuklangan paytdan boshlab oʻzi internetga chiqadi.` : `Sizda ${os}. Tizim yuklangan paytdan boshlab oʻzi internetga chiqadi.`),
      how: 'Tizim yangilanishlarni tekshiradi, vaqtni sinxronlaydi, Apple da ishga tushirilgan dasturlarning imzosini tekshiradi, Microsoft va Google da diagnostika yuboradi. Ishlab chiqaruvchi qurilma yoqilganini, taxminan qayerdaligini (koʻrinadigan Wi-Fi tarmoqlari boʻyicha) va seriya raqamini bilib oladi.',
      danger: 'Bu kundalik maʼnoda kuzatuv emas, lekin ishlab chiqaruvchida aniq jurnal bor: qurilma qachon va qayerda tarmoqqa chiqqan. U rasmiy soʻrov boʻyicha beriladi va buzib kirishlarda oqib chiqadi.',
      action: {
        mac: 'Tizim sozlamalari → Maxfiylik va xavfsizlik → Analitika va yaxshilashlar: «Apple ga yuborish» belgisini oling.',
        ios: 'Sozlamalar → Maxfiylik va xavfsizlik → Analitika va yaxshilashlar: hammasini oʻchiring.',
        windows: 'Parametrlar → Maxfiylik → Diagnostika va fikr-mulohaza: faqat majburiy maʼlumotlarni qoldiring.',
        android: 'Sozlamalar → Google → Barcha xizmatlar → Foydalanish va diagnostika: oʻchiring.',
        chromeos: 'Sozlamalar → Maxfiylik va xavfsizlik: foydalanish maʼlumotlarini yuborishni oʻchiring.',
        linux: 'Odatda oʻchiradigan narsa yoʻq: aksariyat distributivlar telemetriya yubormaydi.',
        other: 'Tizim sozlamalarida «Diagnostika» yoki «Analitika» boʻlimini toping va maʼlumot yuborishni oʻchiring.'
      }
    },
    s3: {
      title: { wifi: 'Siz Wi-Fi ga ulandingiz', cellular: 'Siz mobil operator orqali tarmoqqa chiqdingiz', other: 'Siz internetga ulandingiz' },
      subtitle: 'Provayder siz tarmoqda ekaningizni bilib oladi va siz kirgan har bir saytning manzilini koʻradi',
      check: {
        button: 'Provayder nimani koʻrishini bilish',
        note: 'Cloudflare dagi serverimizga bitta soʻrov. U har qanday sayt kabi IP manzilingiz va brauzer sarlavhalarini koʻradi, manzil kimga tegishli ekanini ipquery.io va Google DNS dan soʻraydi va javobni sizga qaytaradi. Hisobot IP ostida bir soat saqlanadi; anonim statistikaga IP kirmaydi.',
        loading: 'Soʻralmoqda…',
        recheck: 'Yana tekshirish',
        failed: 'Server javob bermadi. Keyinroq urinib koʻring.'
      },
      how: 'Provayder sizga IP manzil beradi va butun trafikni oʻzi orqali oʻtkazadi. Shifrlangan sahifalar mazmunini oʻqimaydi, lekin sayt nomlarini koʻradi: DNS soʻrovlarida va har bir ulanishning boshida (SNI maydoni). Wi-Fi routerining egasi ham xuddi shuni koʻradi.',
      danger: 'Manzillar jurnali oylab va yillab saqlanadi: koʻp mamlakatlarda provayderni qonun majburlaydi. IP boʻyicha saytlar mamlakat va shaharni aniqlaydi, narx va kontent mavjudligini oʻzgartiradi, antifrod tizimlari esa turli saytlardagi harakatlaringizni bogʻlaydi.',
      action: 'Tekshirilgan jurnalsiz siyosatli VPN (Mullvad, ProtonVPN) sayt nomlarini provayderdan yashiradi, lekin xuddi shu ishonchni VPN xizmatiga oʻtkazadi. VPN allaqachon yoqilgan boʻlsa, vaqt mintaqangiz mamlakatidagi serverni tanlang: nomuvofiqlik VPN ni saytlarga fosh qiladi.'
    },
    s4: {
      title: name => `Siz ${name} ni ochdingiz`,
      subtitle: 'Brauzer qurilma pasportiga oʻz belgilari va sozlamalarini qoʻshadi',
      how: 'Brauzer ishlab chiqaruvchisi har qanday saytdan koʻproq koʻradi: sinxronlash yoqilgan boʻlsa tarixni va Safe Browsing da tekshiriladigan har bir manzilni. Kengaytmalar kirish huquqi bor sahifalar mazmunini koʻradi. Saytlar versiya, sozlamalar va berilgan ruxsatlarni koʻradi.',
      danger: 'Kamera, mikrofon yoki geolokatsiyaga berilgan ruxsatni sayt qayta soʻramasdan ishlatadi. Kam uchraydigan brauzer, noodatiy kengaytmalar toʻplami yoki yoqilgan Do Not Track oʻzi sizni ajratib koʻrsatadi: shunday sozlaganlar kam.',
      action: {
        chrome: 'chrome://settings/content: kerak boʻlmagan saytlardan kamera, mikrofon va geolokatsiya ruxsatini qaytarib oling. Chrome Web Store dan uBlock Origin Lite oʻrnating.',
        firefox: 'Sozlamalar → Maxfiylik va xavfsizlik → Kuchaytirilgan himoya: Qatʼiy. uBlock Origin oʻrnating. Global Privacy Control ni yoqing: about:config → privacy.globalprivacycontrol.enabled → true.',
        brave: 'Shields allaqachon ishlayapti. Sozlamalar → Shields → Barmoq izini bloklash: Qatʼiy ekanini tekshiring. Ortiqcha ruxsatlarni brave://settings/content da qaytarib oling.',
        safari: 'Sozlamalar → Maxfiylik → «Saytlararo kuzatuvning oldini olish». App Store dan AdGuard for Safari oʻrnating. Sayt ruxsatlari: Sozlamalar → Veb-saytlar.'
      }
    },
    s5: {
      title: 'Siz sayt manzilini kiritdingiz',
      subtitle: 'Sahifa ochilishidan oldin sayt nomi DNS ga ketadi, brauzer esa serverga oʻzini tanishtiradi',
      how: 'Avval brauzer DNS-serverdan saytning IP sini soʻraydi. Odatda bu provayderning serveri va u har bir nomni yozib qoʻyadi. Keyin brauzer shifrlangan ulanish ochadi: mazmun shifrlangan, lekin birinchi paketdagi sayt nomi ochiq (SNI), ulanish parametrlari — shifrlash versiyasi, shifrlar toʻplami — esa brauzerning yana bir belgisi.',
      danger: 'DNS jurnali qiziqishlar xaritasi. youtube.com, webmd.com, ish qidirish sayti, kvartira ijarasi sayti bir kechada birorta sahifa oʻqilmasdan ham hikoya aytib beradi. Baʼzi mamlakatlarda DNS jurnallari bloklash uchun ishlatiladi.',
      action: 'DNS over HTTPS ni yoqing: Chrome → Sozlamalar → Maxfiylik → Xavfsiz DNS; Firefox → Sozlamalar → Maxfiylik → DNS over HTTPS; Android → Sozlamalar → Tarmoq → Shaxsiy DNS; iOS da DoH profili orqali. Provayder DNS soʻrovlarini koʻrmay qoʻyadi. SNI dagi sayt nomini u hali ham koʻradi: buni faqat VPN yopadi.'
    },
    s6: {
      title: 'Sayt ochildi',
      subtitle: 'Server soʻrovni oldi, sahifa skriptlarni ishga tushirdi: 1–5-qadamlardagi hamma narsa endi saytda',
      serverTitle: 'Server skriptlardan oldin nimani oldi',
      scriptsTitle: 'Bu sahifa skriptlari nimani yigʻdi',
      baitTitle: 'Bloklovchini tekshirish',
      baitNote: 'Sahifadagi uchta xoʻrak: bloklovchilar yashiradigan klasslar bilan, hamda brauzerning ikkita signali. Hech narsa hech qayerdan yuklanmaydi.',
      how: 'Skriptlardan oldin server User-Agent, tillar va sarlavhalar tartibini oladi. Keyin skriptlar koʻrinmas rasm chizadi va tovushsiz ovoz ijro etadi: natija videokarta va drayverlarga bogʻliq, sizda har safar bir xil, boshqalarda boshqacha. Sayt sizni cookie siz va tarix tozalangandan keyin ham shunday taniydi.',
      danger: 'Bitta reklama tarmogʻi bor minglab saytlardagi bir xil iz profilga aylanadi: qiziqishlar, xaridlar, yoʻnalishlar, salomatlik. Profillar maʼlumot brokerlariga sotiladi, oqib chiqadi va oʻchirilmaydi.',
      action: {
        chrome: 'uBlock Origin Lite hisoblagichlarni bloklaydi. Chrome barmoq izidan himoya qilmaydi: muhim ishlar uchun ikkinchi brauzer — Brave yoki Firefox — tuting.',
        firefox: 'uBlock Origin va about:config → privacy.resistFingerprinting → true: Firefox har bir saytga bir xil rasm bera boshlaydi.',
        brave: 'Shields → Barmoq izini bloklash: Qatʼiy. Brave Canvas va ovozga shovqin qoʻshadi, iz saytdan saytga oʻzgaradi.',
        safari: 'Safari barmoq izidan qisman oʻzi himoya qiladi. Hisoblagichlarga qarshi AdGuard for Safari qoʻshing.'
      }
    }
  },

  trackers: {
    pixel: { name: 'Reklama pikseli uchun xoʻrak', blocked: 'Bloklandi', open: 'Bloklanmadi' },
    analytics: { name: 'Analitika skripti uchun xoʻrak', blocked: 'Bloklandi', open: 'Bloklanmadi' },
    iframe: { name: 'Reklama bloki uchun xoʻrak', blocked: 'Bloklandi', open: 'Bloklanmadi' },
    dnt: { name: 'Do Not Track signali', blocked: 'Yoqilgan', open: 'Oʻchirilgan' },
    gpc: { name: 'Global Privacy Control signali', blocked: 'Yoqilgan', open: 'Oʻchirilgan' },
    verdict: (blocked, total) => {
      if (blocked >= 3) return `Bloklovchi oʻz joyida: ${total} tekshiruvdan ${blocked} tasi oʻtdi.`;
      if (blocked >= 1) return `Qisman himoya: ${total} tadan ${blocked} tasi. Joyida qolgan xoʻraklar oddiy saytda jonli hisoblagichlar boʻlardi.`;
      return `Hech narsa bloklanmadi (${total} tadan 0). Oddiy saytda barcha hisoblagich va piksellar ishlab ketardi.`;
    }
  },

  summary: {
    title: 'Xulosa: kim nimani bilib oldi',
    lead: 'Siz hali na ism, na parol kiritdingiz. Mana kim siz haqingizda allaqachon nimanidir biladi:',
    parties: {
      os: vendor => `${vendor}: qurilma yoqilgan, model va tizim versiyasi, taxminiy joylashuv`,
      isp: name => `${name}: IP manzilingiz, tarmoqqa chiqqan vaqtingiz, har bir saytning nomi`,
      ispPending: 'Provayderingiz: IP manzil, tarmoqqa chiqqan vaqt, har bir saytning nomi. 3-qadamdagi tugmani bosing, bu yerda uning nomi paydo boʻladi',
      browser: vendor => `${vendor}: brauzer versiyasi va sozlamalari; sinxronlash yoqilgan boʻlsa, tarix`,
      dns: name => `DNS-server (${name}): siz ochgan har bir saytning nomi`,
      cloudflare: 'Cloudflare: IP manzilingiz, brauzeringiz va shu saytga soʻrov yuborilgani',
      site: items => `Bu sayt: yuqoridagilarning hammasi va brauzer izi (${items})`
    },
    checklistTitle: 'Nima qilish kerak, har qadamga bittadan',
    shareButton: 'Ulashish',
    saveButton: 'Chop etish / Saqlash',
    share: {
      text: ({ device, parties, url }) => `Men ${device} dan bitta saytni ochguncha men haqimda bilib olganlar: ${parties}. Oʻzingizni bir daqiqada tekshiring: ${url}`,
      title: 'Saytni ochguningizcha kim siz haqingizda bilib oladi',
      copied: 'Matn nusxalandi',
      shared: 'Yuborildi',
      error: 'Ulashib boʻlmadi. Manzilni qoʻlda nusxalang.',
      unavailable: 'Kuting, sahifa hali maʼlumot yigʻmoqda'
    }
  },

  details: {
    title: 'Brauzer bergan barcha maʼlumotlar',
    groups: { device: 'Qurilma', browser: 'Brauzer', network: 'Tarmoq', server: 'Server nimani koʻrdi', fingerprint: 'Izlar' },
    pending: '3-qadamdagi tekshiruvdan keyin paydo boʻladi',
    copy: 'Nusxalash uchun bosing',
    copied: 'Nusxalandi'
  },

  units: { gb: 'GB', yes: 'ha', no: 'yoʻq' },
  // The family footer, the same on every morgunov.tech page: name · year · the build mark (the
  // version, a link to the changelog on GitHub) on the left, the privacy line on the right.
  footer: version => `<span>morgunov.tech / fingerprint · 2026 · <a class="v4-build" href="${CHANGELOG_URL}" target="_blank" rel="noopener noreferrer">v${version}</a></span><span class="v4-foot-privacy">Hammasi brauzeringizda hisoblanadi</span>`,
  // What the page says about its own hosting: under the walk, not in the footer.
  pageNote: 'Cloudflare da joylashtirilgan. Cloudflare Web Analytics anonim tashrif statistikasini yigʻadi (cookie va shaxsiy maʼlumotlarsiz).',
  footerVisits: n => `${n} marta tekshirildi`,
  statVisitors: pct => `${pct}% tashrif buyuruvchilarda`,
  errorMessage: msg => `Xato: ${msg}`,
  shareUrl: CANONICAL_URL
};
