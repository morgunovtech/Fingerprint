// What changed for the people who use the page, shown in the changelog modal (the version badge in
// the footer). CHANGELOG.md carries the same entries in English; the top entry's version is APP_VERSION.
export const CHANGELOG = [
  {
    version:'3.1.2',
    date:'2026-11-25',
    changes:{
      ru:[
        'Исправлено: английская страница /en/ приходила с русским заголовком — тем, что виден во вкладке и в результатах поиска. Английский выставлял скрипт уже после загрузки, поэтому поисковики и читатели без JavaScript видели русский. Теперь заголовок на /en/ английский в самом HTML, как и остальные теги для превью ссылок'
      ],
      en:[
        'Fixed: the English page /en/ arrived with the Russian title, the one shown in the tab and in search results. The script set the English one only after load, so search engines and readers without JavaScript saw Russian. The title on /en/ is now English in the HTML itself, like the other link-preview tags'
      ],
      uz:[
        'Tuzatildi: inglizcha /en/ sahifasi ruscha sarlavha bilan kelardi — varaqda va qidiruv natijalarida koʻrinadigani. Inglizchasini skript faqat yuklangandan keyin qoʻyardi, shuning uchun qidiruv tizimlari va JavaScriptsiz oʻquvchilar ruschasini koʻrardi. Endi /en/ dagi sarlavha HTML ning oʻzida inglizcha, havola koʻrinishi uchun boshqa teglar kabi'
      ]
    }
  },
  {
    version:'3.1.1',
    date:'2026-11-24',
    changes:{
      ru:[
        'Исправлено: после обновления страницы браузер, уже заходивший сюда, мог получить новую разметку со старым кодом и стилями из своего кэша — старый вид, старые тексты и пустые полосы вместо шагов на срок до 24 дней. Теперь скрипты и стили перепроверяются при каждом открытии, а их адреса несут номер версии, так что новая страница загружает только новый код'
      ],
      en:[
        'Fixed: after an update a browser that had been here before could get the new markup with the old code and styles from its cache — the old look, the old texts and empty bars instead of the steps, for up to 24 days. The scripts and styles are now revalidated on every visit and their addresses carry the release number, so a new page can only load new code'
      ],
      uz:[
        'Tuzatildi: yangilanishdan keyin ilgari kirgan brauzer yangi belgilashni oʻz keshidagi eski kod va uslublar bilan olishi mumkin edi — eski koʻrinish, eski matnlar va qadamlar oʻrniga boʻsh chiziqlar, 24 kungacha. Endi skriptlar va uslublar har ochilishda qayta tekshiriladi, manzillarida esa versiya raqami bor, shuning uchun yangi sahifa faqat yangi kodni yuklaydi'
      ]
    }
  },
  {
    version:'3.1.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'Страница в дизайн-системе morgunov.tech: шрифты IBM Plex, бумажные поверхности, прямые углы, без теней и без эмодзи в оформлении — как s.morgunov.tech, Good Pass и Found You. Что страница проверяет и отправляет, не изменилось',
        'Тема переключается так же, как на остальных страницах morgunov.tech: светлая, тёмная или контрастная, выбранная здесь, действует и там, и наоборот. Прежний выбор перенесён',
        'Стили и шрифты загружаются с s.morgunov.tech — сайта автора, без cookie и аналитики; об отпечатке эти запросы ничего не несут. Это записано во вступлении, в README и в llms.txt',
        'Меню языка называет языки словами, меню темы — тоже; номер шага стал подписью вместо цифры-водяного знака'
      ],
      en:[
        'The page wears the morgunov.tech design system: IBM Plex, paper surfaces, square corners, no shadows and no emoji in the chrome, like s.morgunov.tech, Good Pass and Found You. What the page checks and sends is unchanged',
        'The theme switches the way it does on every morgunov.tech page: a light, dark or high-contrast theme picked here applies there too, and back. The earlier choice is carried over',
        'Stylesheets and fonts load from s.morgunov.tech, the author\'s own site, with no cookies and no analytics; those requests carry nothing about your fingerprint. The intro, the README and llms.txt say so',
        'The language menu names the languages in words, so does the theme menu; the step number is a label instead of a watermark digit'
      ],
      uz:[
        'Sahifa morgunov.tech dizayn tizimida: IBM Plex shriftlari, qogʻoz yuzalar, toʻgʻri burchaklar, soyasiz va bezakda emojisiz — s.morgunov.tech, Good Pass va Found You kabi. Sahifa nimani tekshirishi va yuborishi oʻzgarmadi',
        'Mavzu morgunov.tech ning boshqa sahifalaridagidek almashadi: bu yerda tanlangan yorugʻ, qorongʻi yoki kontrast mavzu u yerda ham amal qiladi, va aksincha. Avvalgi tanlov koʻchirildi',
        'Uslublar va shriftlar muallifning oʻz sayti s.morgunov.tech dan yuklanadi: cookie va analitikasiz; bu soʻrovlar barmoq izingiz haqida hech narsa olib ketmaydi. Bu kirish qismida, README da va llms.txt da yozilgan',
        'Til menyusi tillarni soʻz bilan ataydi, mavzu menyusi ham; qadam raqami suv belgisi oʻrniga yozuvga aylandi'
      ]
    }
  },
  {
    version:'3.0.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'Страница стала одним маршрутом из шести шагов: открыли ноутбук, запустилась система, подключились к сети, открыли браузер, ввели адрес, сайт открылся. На каждом шаге — что измерено прямо сейчас, кто это узнаёт (с именами: производитель системы и браузера, ваш провайдер, Cloudflare), как это устроено, чем опасно и одно действие',
        'Проверка сети стала действием внутри шага 3 с честным описанием единственного запроса, который уходит с страницы; после неё заполняются шаги 3, 5 и 6 и итог',
        'Итог называет, кто что узнал, даёт чек-лист по шагам и текст для «Поделиться» на ваших данных',
        'Убраны процент уникальности (он сравнивал с синтетическим распределением, а не с людьми), методика, 22 карточки с хешами, тест скорости и переключатель режимов. Сырые данные остались в разделе «Все данные, которые отдал браузер» внизу',
        'Проверка блокировщика честно названа проверкой приманок: никакие пиксели и скрипты не загружаются',
        'Шаг про операционную систему новый: что производитель узнаёт при загрузке и где это выключить на macOS, iOS, Windows, Android и ChromeOS'
      ],
      en:[
        'The page is now one walk of six steps: you opened the laptop, the system started, you went online, you opened the browser, you typed an address, the site loaded. Each step shows what was measured right now, who learns it (by name: the makers of the system and the browser, your provider, Cloudflare), how it works, why it matters and one thing to do',
        'The network check is an action inside step 3 with a plain description of the one request that leaves the page; after it, steps 3, 5 and 6 and the sum fill in',
        'The sum names who learned what, gives a checklist by step and a share text built from your data',
        'Gone: the uniqueness percentage (it compared you with a synthetic distribution, not with people), the methodology, the 22 hash cards, the speed test and the mode switch. The raw data stays in "Everything the browser handed over" at the bottom',
        'The blocker check is honestly called a bait check: no pixels or scripts are loaded',
        'A new step for the operating system: what its maker learns at boot and where to switch it off on macOS, iOS, Windows, Android and ChromeOS'
      ],
      uz:[
        "Sahifa olti qadamdan iborat bitta yoʻlga aylandi: noutbukni ochdingiz, tizim ishga tushdi, tarmoqqa ulandingiz, brauzerni ochdingiz, manzil kiritdingiz, sayt ochildi. Har qadamda — hozir nima oʻlchandi, kim buni bilib oladi (nomlari bilan: tizim va brauzer ishlab chiqaruvchilari, provayderingiz, Cloudflare), bu qanday ishlaydi, nega muhim va bitta amal",
        "Tarmoqni tekshirish 3-qadam ichidagi amalga aylandi, sahifadan ketadigan yagona soʻrovning ochiq tavsifi bilan; undan keyin 3, 5 va 6-qadamlar hamda xulosa toʻladi",
        "Xulosa kim nimani bilib olganini aytadi, qadamlar boʻyicha roʻyxat va sizning maʼlumotlaringizdan tuzilgan «Ulashish» matnini beradi",
        "Olib tashlandi: noyoblik foizi (u sizni odamlar bilan emas, sunʼiy taqsimot bilan solishtirardi), metodika, 22 ta xesh kartochkasi, tezlik testi va rejim almashtirgich. Xom maʼlumotlar pastdagi «Brauzer bergan barcha maʼlumotlar» boʻlimida qoldi",
        "Bloklovchini tekshirish halol ravishda xoʻraklar tekshiruvi deb ataladi: hech qanday piksel va skript yuklanmaydi",
        "Operatsion tizim haqida yangi qadam: ishlab chiqaruvchi yuklanishda nimani bilib oladi va buni macOS, iOS, Windows, Android va ChromeOS da qayerda oʻchirish mumkin"
      ]
    }
  },
  {
    version:'2.5.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'Режим «История» показывает реальные данные: устройство, экран, GPU, хеши Canvas/Audio/WebGL, число заблокированных трекеров, а после «Проверить сеть» — IP, провайдера и версию TLS. Раньше на их месте стояли знаки вопроса',
        'Раздел «Серверный отпечаток» показывает версию и шифр TLS, HTTP-протокол, порядок заголовков и Client Hints — они приходили с сервера, но не выводились',
        'Проверка утечки WebRTC работает: строка «WebRTC» и совет про утечку основаны на реальной пробе, а не всегда на «Безопасно»',
        'Блок «Что сайт знает о вас» занимает всю ширину страницы, а не треть',
        'Страница больше не скачивает share-card.svg три раза и не пишет тестовые cookie при каждой отрисовке: модуль профайлинга, результаты которого нигде не показывались, удалён',
        '«Распечатать / Сохранить» на телефоне сохраняет статический снимок страницы со стилями и без скриптов — раньше сохранённый файл заново запускал всю проверку',
        'Код страницы разбит на модули (стили, переводы, сбор сигналов, модель уникальности, сеть, отрисовка) и очищен от неиспользуемых функций и строк. Процент уникальности может сдвинуться на пару пунктов: исправлена группировка аудио-отпечатка в модели'
      ],
      en:[
        'Story Mode shows real data: device, screen, GPU, the Canvas/Audio/WebGL hashes, the number of blocked trackers and, after "Check network", the IP, ISP and TLS version. Question marks used to stand in their place',
        'The "Server fingerprint" section shows the TLS version and cipher, the HTTP protocol, the header order and the Client Hints: the server sent them, the page never displayed them',
        'The WebRTC leak check works: the "WebRTC" row and the advice about the leak come from an actual probe instead of always reading "Safe"',
        'The "What the site knows about you" block takes the full page width instead of a third',
        'The page no longer downloads share-card.svg three times or writes test cookies on every render: the profiling module whose findings were never shown is gone',
        '"Print / Save" on a phone saves a static snapshot of the page with its styles and without scripts; the saved file used to run the whole check again',
        'The page code is split into modules (styles, translations, signal collection, uniqueness model, network, rendering) and cleared of unused functions and strings. The uniqueness percentage may shift by a point or two: the audio fingerprint bucket in the model was fixed'
      ],
      uz:[
        '«Hikoya» rejimi haqiqiy maʼlumotlarni koʻrsatadi: qurilma, ekran, GPU, Canvas/Audio/WebGL xeshlari, bloklangan trekerlar soni, «Tarmoqni tekshirish»dan keyin esa IP, provayder va TLS versiyasi. Ilgari ularning oʻrnida soʻroq belgilari turardi',
        '«Server barmoq izi» boʻlimi TLS versiyasi va shifrini, HTTP protokolini, sarlavhalar tartibini va Client Hints ni koʻrsatadi: server ularni yuborardi, sahifa esa koʻrsatmasdi',
        'WebRTC oqishini tekshirish ishlaydi: «WebRTC» qatori va oqish haqidagi maslahat haqiqiy tekshiruvga asoslanadi, doim «Xavfsiz» emas',
        '«Sayt siz haqingizda nimalarni biladi» bloki sahifaning uchdan bir qismini emas, toʻliq kengligini egallaydi',
        'Sahifa endi share-card.svg ni uch marta yuklamaydi va har chizishda sinov cookie larini yozmaydi: natijalari hech qayerda koʻrsatilmagan profillash moduli olib tashlandi',
        'Telefonda «Chop etish / Saqlash» sahifaning statik nusxasini uslublar bilan va skriptlarsiz saqlaydi; ilgari saqlangan fayl butun tekshiruvni qaytadan ishga tushirardi',
        'Sahifa kodi modullarga boʻlindi (uslublar, tarjimalar, signallarni yigʻish, noyoblik modeli, tarmoq, chizish) va ishlatilmaydigan funksiya va satrlardan tozalandi. Noyoblik foizi bir-ikki punktga siljishi mumkin: modeldagi audio barmoq izi guruhlanishi tuzatildi'
      ]
    }
  },
  {
    version:'2.4.1',
    date:'2026-11-24',
    changes:{
      ru:[
        'robots.txt разрешает и обучение ИИ: Content Signals теперь «поиск, ответы ИИ и обучение ИИ — да» (ai-train=yes). Пока владелец не решил, про обучение не говорилось ничего'
      ],
      en:[
        'robots.txt allows AI training too: the Content Signals now say “search, AI answers and AI training: yes” (ai-train=yes). Until the owner decided, they said nothing about training'
      ],
      uz:[
        "robots.txt endi sunʼiy intellektni oʻqitishga ham ruxsat beradi: Content Signals — «qidiruv, sunʼiy intellekt javoblari va sunʼiy intellektni oʻqitish — ha» (ai-train=yes). Ilgari, egasi qaror qilmaguncha, oʻqitish haqida hech narsa aytilmagan edi"
      ]
    }
  },
  {
    version:'2.4.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'Английская версия по адресу https://fprint.morgunov.tech/en/: ссылка на неё в LinkedIn, Telegram и других сетях показывает карточку на английском',
        'Карточка ссылки теперь картинка PNG: прежний SVG LinkedIn и большинство мессенджеров не показывали',
        'Выбор языка меняет адрес: английский — /en/, русский и узбекский — /, так что скопированная ссылка откроется на том же языке'
      ],
      en:[
        'An English address, https://fprint.morgunov.tech/en/: a link to it on LinkedIn, Telegram and other networks shows an English preview',
        'The link preview is a PNG image now: LinkedIn and most messengers did not show the SVG it used to be',
        'Picking a language changes the address: English is /en/, Russian and Uzbek are /, so a copied link opens in the same language'
      ],
      uz:[
        "Inglizcha manzil, https://fprint.morgunov.tech/en/: LinkedIn, Telegram va boshqa tarmoqlarda unga havola inglizcha kartochka bilan koʻrinadi",
        "Havola kartochkasi endi PNG rasm: avvalgi SVG ni LinkedIn va koʻpchilik messenjerlar koʻrsatmasdi",
        "Til tanlansa, manzil ham oʻzgaradi: inglizcha — /en/, ruscha va oʻzbekcha — /, shuning uchun nusxalangan havola oʻsha tilda ochiladi"
      ]
    }
  },
  {
    version:'2.3.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'API теперь на адресе сайта: https://fprint.morgunov.tech/api/ (например, curl https://fprint.morgunov.tech/api/check). Старый адрес на workers.dev продолжает работать',
        'Страница обращается к серверу на своём же адресе: запросы те же, меняется только имя хоста'
      ],
      en:[
        'The API lives at the site’s own address: https://fprint.morgunov.tech/api/ (try curl https://fprint.morgunov.tech/api/check). The old workers.dev address keeps working',
        'The page talks to the server on its own address: the same requests, only the hostname changes'
      ],
      uz:[
        "API endi sayt manzilida: https://fprint.morgunov.tech/api/ (masalan, curl https://fprint.morgunov.tech/api/check). workers.dev dagi eski manzil ham ishlashda davom etadi",
        "Sahifa serverga oʻz manzili orqali murojaat qiladi: soʻrovlar oʻsha-oʻsha, faqat xost nomi oʻzgaradi"
      ]
    }
  },
  {
    version:'2.2.2',
    date:'2026-11-24',
    changes:{
      ru:[
        'Страницу проще найти поисковикам и ИИ-ассистентам: структурированные данные JSON-LD, файл llms.txt с описанием сервиса и Content Signals в robots.txt (поиск и ответы ИИ — да)',
        'Код подтверждения сайта для Яндекс Вебмастера',
        'Технические адреса Pages (*.pages.dev) закрыты от поисковиков'
      ],
      en:[
        'Easier for search engines and AI assistants to find: JSON-LD structured data, an llms.txt that describes the service and Content Signals in robots.txt (search and AI answers: yes)',
        'Site verification code for Yandex Webmaster',
        'The technical Pages addresses (*.pages.dev) are hidden from search engines'
      ],
      uz:[
        "Sahifani qidiruv tizimlari va sunʼiy intellekt yordamchilari osonroq topadi: JSON-LD tuzilgan maʼlumotlari, xizmatni tavsiflovchi llms.txt fayli va robots.txt dagi Content Signals (qidiruv va sunʼiy intellekt javoblari — ha)",
        "Yandex Webmaster uchun saytni tasdiqlash kodi",
        "Pages ning texnik manzillari (*.pages.dev) qidiruv tizimlaridan yashirildi"
      ]
    }
  },
  {
    version:'2.2.1',
    date:'2026-11-24',
    changes:{
      ru:[
        'Запрос WHOIS убран: whoisjson.com требует API-ключ, которого у Worker-а нет, и ничего не возвращал, хотя ваш IP уходил туда при каждой проверке сети. Поле whois в ответе /api/scan осталось и всегда равно null',
        'Карточка для соцсетей и запасная ссылка «Поделиться» показывают fprint.morgunov.tech вместо адреса, который не открывается',
        'Ошибка /api/scan для неверной цели просит «домен или IP-адрес»: IPv6 тоже принимается',
        'Убран неиспользуемый код и комментарии со ссылками на внутренний план'
      ],
      en:[
        'WHOIS lookup removed: whoisjson.com needs an API key the Worker does not have, so it returned nothing, yet your IP was sent there on every “Check network”. The whois field stays in /api/scan, always null',
        'The social preview card and the fallback share link show fprint.morgunov.tech instead of an address that does not open',
        'The /api/scan error for an invalid target asks for “a domain or an IP address”: IPv6 is accepted too',
        'Unused code and comments that referred to an internal plan removed'
      ],
      uz:[
        "WHOIS soʻrovi olib tashlandi: whoisjson.com API kalitini talab qiladi, Worker-da u yoʻq, shuning uchun hech narsa qaytarmasdi, IP-ingiz esa har bir «Tarmoqni tekshirish»da u yerga yuborilardi. /api/scan javobidagi whois maydoni qoldi va doim null",
        "Ijtimoiy tarmoqlar kartasi va zaxira «Ulashish» havolasi ochilmaydigan manzil oʻrniga fprint.morgunov.tech ni koʻrsatadi",
        "Notoʻgʻri maqsad uchun /api/scan xatosi «domen yoki IP-manzil» soʻraydi: IPv6 ham qabul qilinadi",
        "Ishlatilmaydigan kod va ichki rejaga ishora qiluvchi izohlar olib tashlandi"
      ]
    }
  },
  {
    version:'2.2.0',
    date:'2026-11-24',
    changes:{
      ru:[
        'Cloudflare Worker fingerprint-api: /api/scan для IP и доменов (геолокация, DNS с обратной записью, DNS-блоклисты, прозрачность сертификатов, заголовки безопасности), /api/whoami и /api/check, тест скорости, кэш в KV, анонимная агрегированная статистика',
        'Сторонние IP-сервисы заменены Worker-ом; к ним страница обращается, только если он недоступен',
        'Раздел серверного отпечатка: что видит сервер до запуска JavaScript и где это расходится с браузером',
        'Story Mode (?mode=story): те же данные как рассказ об одном дне',
        'Единые карточки и исправления интерфейса',
        'robots.txt, sitemap.xml, настоящая страница 404 и вступление без JavaScript',
        'Уборка: убраны дубликаты, wrangler 4, починен selftest, CI с Dependabot, _headers для Pages, Pages раздаёт только site/, README и лицензия MIT',
        'Тексты о приватности на RU/EN/UZ совпадают с тем, что делает код; FingerprintJS Pro убран',
        'Геолокация IP через ipquery.io по HTTPS, запасной вариант — ipinfo.io',
        'DNS-блоклисты сокращены до четырёх, отвечающих публичным резолверам — исправлен ложный вердикт «в чёрном списке»',
        'Одна версия везде: страница, Worker (/api/health) и CHANGELOG.md; с этого выпуска — SemVer'
      ],
      en:[
        'Cloudflare Worker fingerprint-api: /api/scan for an IP or a domain (geolocation, DNS with reverse lookup, DNS blocklists, certificate transparency, security headers), /api/whoami and /api/check, speed test, KV cache, anonymous aggregate stats',
        'Third-party IP services replaced by the Worker; the page asks them only when it is down',
        'Server-side fingerprint section: what the server sees before JavaScript runs, and where it contradicts the browser',
        'Story Mode (?mode=story): the same data told as one day',
        'Unified cards and UI fixes',
        'robots.txt, sitemap.xml, a real 404 page and an intro that works without JavaScript',
        'Cleanup: duplicates removed, wrangler 4, selftest repaired, CI with Dependabot, Pages _headers, Pages serves only site/, README and MIT license',
        'Privacy texts in RU/EN/UZ now match what the code does; FingerprintJS Pro removed',
        'IP geolocation via ipquery.io over HTTPS, ipinfo.io as fallback',
        'DNS blocklists reduced to the four that answer public resolvers, fixing the false "blacklisted" verdict',
        'One version everywhere: the page, the Worker (/api/health) and CHANGELOG.md; SemVer from this release on'
      ],
      uz:[
        "Cloudflare Worker fingerprint-api: IP va domenlar uchun /api/scan (geolokatsiya, teskari yozuv bilan DNS, DNS qora roʻyxatlari, sertifikat shaffofligi, xavfsizlik sarlavhalari), /api/whoami va /api/check, tezlik testi, KV kesh, anonim umumiy statistika",
        "Uchinchi tomon IP xizmatlari Worker bilan almashtirildi; sahifa ularga faqat Worker ishlamaganda murojaat qiladi",
        "Server tomonidagi fingerprint boʻlimi: JavaScript ishga tushgunga qadar server nimani koʻradi va bu brauzer bilan qayerda mos kelmaydi",
        "Story Mode (?mode=story): oʻsha maʼlumotlar bir kun haqidagi hikoya shaklida",
        "Yagona kartalar va interfeys tuzatishlari",
        "robots.txt, sitemap.xml, haqiqiy 404 sahifasi va JavaScriptsiz kirish matni",
        "Tozalash: dublikatlar olib tashlandi, wrangler 4, selftest tuzatildi, Dependabot bilan CI, Pages uchun _headers, Pages faqat site/ ni tarqatadi, README va MIT litsenziyasi",
        "RU/EN/UZ maxfiylik matnlari kod bajaradigan ishga mos keltirildi; FingerprintJS Pro olib tashlandi",
        "IP geolokatsiyasi HTTPS orqali ipquery.io dan, zaxira — ipinfo.io",
        "DNS qora roʻyxatlari ommaviy rezolverlarga javob beradigan toʻrttasiga qisqartirildi — notoʻgʻri «qora roʻyxatda» xulosasi tuzatildi",
        "Hamma joyda bitta versiya: sahifa, Worker (/api/health) va CHANGELOG.md; shu chiqarilishdan boshlab SemVer"
      ]
    }
  },
  {
    version:'2.1',
    date:'2026-03-25',
    changes:{
      ru:['Новые сигналы: WebGL, AudioContext, Font fingerprinting','Симуляция трекеров (5 тестов)','Детекция подмены данных браузера','Персонализация рекомендаций по браузеру','Карточка рисков VPN','Модальное окно методологии'],
      en:['New signals: WebGL, AudioContext, Font fingerprinting','Tracker simulation (5 tests)','Browser data spoofing detection','Browser-specific recommendations','VPN risk card','Methodology modal'],
      uz:["Yangi signallar: WebGL, AudioContext, Font fingerprinting","Treker simulyatsiyasi (5 ta test)","Brauzer maʼlumotlarini soxtalashtirishni aniqlash","Brauzerga moslashtirilgan tavsiyalar","VPN xavf kartasi","Metodologiya modali"]
    }
  },
  {
    version: '2.0',
    date: '2026-03-25',
    changes: {
      ru: [
        'Полный редизайн: verdict-first архитектура',
        'Группировка данных: идентификация, устройство, сеть',
        'Блок рисков и персональные рекомендации',
        'Нормализация частотных таблиц энтропии',
        'Collapsible блок подробностей',
      ],
      en: [
        'Full redesign: verdict-first architecture',
        'Data grouping: identity, device, network',
        'Risk cards and personal recommendations',
        'Entropy frequency table normalization',
        'Collapsible details block',
      ],
      uz: [
        "Toʻliq qayta dizayn: verdict-first arxitektura",
        "Maʼlumotlar guruhlash: identifikatsiya, qurilma, tarmoq",
        "Xavf kartalari va shaxsiy tavsiyalar",
        "Entropiya chastota jadvallarini normalizatsiya",
        "Collapsible tafsilotlar bloki",
      ]
    }
  },
  {
    version: '1.5',
    date: '2025-12-15',
    changes: {
      ru: [
        'Новые сигналы: голоса синтеза речи, CSS медиа-функции, математический отпечаток JS',
        'Расширен список шрифтов с 10 до 48 для детекции',
        'Добавлена тема высокой контрастности (◑)',
        'Global Privacy Control (GPC) вместо устаревшего DNT',
        'Улучшен детектор VPN — убраны ложные срабатывания для Google/Amazon/Azure',
        'Исправлены подсказки: Canvas защита, WebRTC отключение, Battery API',
        'Переименована кнопка «Сохранить PDF» → «Распечатать / Сохранить»',
      ],
      en: [
        'New signals: speech synthesis voices, CSS media features, JS math fingerprint',
        'Font detection list expanded from 10 to 48 fonts',
        'High contrast theme added (◑)',
        'Global Privacy Control (GPC) replacing legacy DNT',
        'VPN detector improved — removed false positives for Google/Amazon/Azure users',
        'Fixed advice text: Canvas protection, WebRTC blocking, Battery API deprecation notice',
        'Renamed "Save PDF" button to "Print / Save"',
      ],
      uz: [
        "Yangi signallar: nutq sintezi ovozlari, CSS media xususiyatlari, JS matematik fingerprint",
        "Shrift aniqlash roʻyxati 10 dan 48 tagacha kengaytirildi",
        "Yuqori kontrast mavzusi qoʻshildi (◑)",
        "Eski DNT oʻrniga Global Privacy Control (GPC)",
        "VPN detektori yaxshilandi — Google/Amazon/Azure uchun notoʻgʻri natijalar olib tashlandi",
        "Matnlar tuzatildi: Canvas himoyasi, WebRTC bloklash, Battery API",
        "\"PDF saqlash\" tugmasi \"Chop etish / Saqlash\" ga oʻzgartirildi",
      ]
    }
  },
  {
    version: '1.1',
    date: '2025-10-11',
    // date preserved from original release
    changes: {
      ru: [
        'Добавлен детектор батареи (Battery API)',
        'Улучшена точность определения устройства',
        'Исправлены мелкие ошибки интерфейса',
      ],
      en: [
        'Added battery detector (Battery API)',
        'Improved device detection accuracy',
        'Minor UI bug fixes',
      ],
      uz: [
        "Batareya detektori qoʻshildi (Battery API)",
        "Qurilma aniqlash aniqligi yaxshilandi",
        "Kichik interfeys xatolari tuzatildi",
      ]
    }
  },
  {
    version: '1.0',
    date: '2025-10-07',
    // date preserved from original release
    changes: {
      ru: [
        'Первый публичный выпуск',
        'Canvas, Audio, WebGL отпечатки',
        'IP-детекция с 5 источниками fallback',
        'VPN, AdBlock, WebRTC детекция',
        'PDF-экспорт и функция «Поделиться»',
        'Поддержка RU / EN / UZ',
      ],
      en: [
        'Initial public release',
        'Canvas, Audio, WebGL fingerprinting',
        'IP detection with 5-source fallback',
        'VPN, AdBlock, WebRTC detection',
        'PDF export and Share function',
        'RU / EN / UZ language support',
      ],
      uz: [
        'Birinchi ommaviy chiqarilish',
        'Canvas, Audio, WebGL fingerprint',
        "IP aniqlash, 5 ta zaxira manba",
        'VPN, AdBlock, WebRTC aniqlash',
        "PDF eksport va 'Ulashish' funksiyasi",
        "RU / EN / UZ til qoʻllab-quvvatlashi",
      ]
    }
  }
];
