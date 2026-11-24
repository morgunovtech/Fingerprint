// The report view: the hero verdict, the data rows of "What the site knows about you" and
// "Network analysis", the risk cards with recommendations, and the detail cards.

import { LOCALES } from './config.js';
import { getEl, esc, mkRow } from './dom.js';
import { state } from './state.js';
import { uniquenessLevel } from './entropy.js';
import { guessDevice, deviceDisplayName, deviceIcon, browserDisplayName, browserIcon, guessOSVersion, COUNTRY_NAMES, CITY_NAMES, langToFlag, countryCodeToFlag, detectBrowserGroup } from './device.js';
import { resolveCountryCode, getStatPercent } from './network.js';
import { checkSpoofing } from './trackers.js';
import { LOCAL_TZ } from './signals.js';

/* ---- Detail cards: what each signal gives away, with an example and advice ---- */

export const CARD_CONTENT = {
  tz:{
    label:{ru:'Часовой пояс',en:'Time zone',uz:'Vaqt mintaqasi'},
    use:{ru:'Часовой пояс выдаёт примерный регион проживания',en:'Your time zone hints at the region you live in',uz:'Vaqt mintaqasi qaysi hududda ekaningizni ko‘rsatadi'},
    ex:{ru:'Например, Москва и Лондон живут по разным часам',en:'For example, Moscow and London run on different clocks',uz:'Masalan, Moskva va London vaqtlari farq qiladi'},
    adv:{ru:'Синхронизируйте системное время и настройки VPN',en:'Keep your system clock and VPN settings in sync',uz:'Tizim vaqti va VPN sozlamalarini mos tuting'}
  },
  ua:{
    label:{ru:'Браузер',en:'Browser',uz:'Brauzer'},
    use:{ru:'Название и версия браузера помогают отличить вас от большинства пользователей',en:'Browser name and version make it easy to separate you from the crowd',uz:'Brauzer nomi va versiyasi sizni boshqalardan ajratib turadi'},
    ex:{ru:'Например, Arc встречается реже, чем Chrome или Safari',en:'For example, Arc appears far less often than Chrome or Safari',uz:'Masalan, Arc Chrome yoki Safari ga qaraganda kam uchraydi'},
    adv:{ru:'Используйте обновлённые и массовые версии, когда важна анонимность',en:'Stick to up-to-date mainstream builds when anonymity matters',uz:'Maxfiylik zarur bo‘lsa, yangilanib turadigan ommabop versiyalardan foydalaning'}
  },
  plat:{
    label:{ru:'Операционная система',en:'Operating system',uz:'Operatsion tizim'},
    use:{ru:'Тип и версия ОС помогают сопоставить устройство',en:'OS type and version help link the device',uz:'OT turi va versiyasi qurilmani aniqlashga yordam beradi'},
    ex:{ru:'Например, macOS 14 или Windows 11 выделяются',en:'For example, macOS 14 or Windows 11 stand out',uz:'Masalan, macOS 14 yoki Windows 11 darhol ajralib turadi'},
    adv:{ru:'Используйте отдельные устройства или виртуальные машины для чувствительных задач',en:'Use separate devices or virtual machines for sensitive tasks',uz:'Muhim ishlar uchun alohida qurilma yoki virtual mashina qo‘llang'}
  },
  screen:{
    label:{ru:'Экран',en:'Screen',uz:'Ekran'},
    use:{ru:'Разрешение и плотность экрана подсказывают модель устройства',en:'Resolution and pixel density hint at the device model',uz:'Ekran o‘lchami va piksellar zichligi qurilma modelini ko‘rsatadi'},
    ex:{ru:'Например, 13" ноутбук и 4K монитор дают разные сочетания',en:'A 13" laptop and a 4K monitor produce very different combos',uz:'Masalan, 13" noutbuk va 4K monitor butunlay boshqa kombinatsiya beradi'},
    adv:{ru:'Отключайте лишние мониторы, когда хотите скрыть рабочую конфигурацию',en:'Disconnect extra monitors when you want to hide your work setup',uz:'Ishdagi sozlamani yashirmoqchi bo‘lsangiz, ortiqcha monitorlarni uzib qo‘ying'}
  },
  langs:{
    label:{ru:'Языки',en:'Languages',uz:'Tillar'},
    use:{ru:'Языки интерфейса показывают, где и как вы обычно общаетесь',en:'Interface languages show where and how you normally browse',uz:'Interfeys tillari qayerda va qanday til ishlatishingizni ko‘rsatadi'},
    ex:{ru:'Например, ru + uz указывает на Центральную Азию',en:'For example, ru + uz points to Central Asia',uz:'Masalan, ru + uz kombinatsiyasi Markaziy Osiyaga ishora qiladi'},
    adv:{ru:'Храните только те языки, которыми действительно пользуетесь',en:'Keep only the languages you actively need',uz:'Faqat kerakli tillarni qoldiring'}
  },
  hw:{
    label:{ru:'CPU / RAM',en:'CPU / RAM',uz:'CPU / RAM'},
    use:{ru:'Количество ядер и объём памяти выдают класс устройства',en:'Core count and memory size expose the device class',uz:'Yadrolar soni va xotira hajmi qurilma turini ochib beradi'},
    ex:{ru:'Смартфон с 6 ГБ отличается от ПК с 32 ГБ',en:'A phone with 6 GB looks different from a PC with 32 GB',uz:'6 GB telefon 32 GB kompyuterdan oson farqlanadi'},
    adv:{ru:'Для критичных задач используйте отдельное или изолированное устройство',en:'Use a dedicated or isolated device for critical tasks',uz:'Muhim vazifalar uchun alohida yoki izolyatsiyalangan qurilmadan foydalaning'}
  },
  store:{
    label:{ru:'Хранилища',en:'Storage',uz:'Saqlash'},
    use:{ru:'Cookie и хранилища позволяют сайтам узнавать вас без входа',en:'Cookies and storage let sites recognise you without logging in',uz:'Cookie va saqlash saytga sizni akkauntsiz ham tanish imkonini beradi'},
    ex:{ru:'Если localStorage доступен, сайт может сохранить уникальный ID',en:'If localStorage is available, a site can store a unique ID',uz:'Agar localStorage mavjud bo‘lsa, sayt noyob ID saqlashi mumkin'},
    adv:{ru:'Регулярно очищайте хранилища или используйте приватные окна',en:'Regularly clear storage or rely on private windows',uz:'Saqlashni muntazam tozalang yoki maxfiy oynalardan foydalaning'}
  },
  dnt:{
    label:{ru:'Настройка «Не отслеживать»',en:'“Do Not Track” setting',uz:'“Kuzatmang” sozlamasi'},
    use:{ru:'Сообщает сайтам, просите ли вы не отслеживать вас',en:'Tells sites you prefer not to be tracked',uz:'Saytlarga sizni kuzatmaslikni so‘rashingizni bildiradi'},
    ex:{ru:'Часть сервисов игнорирует этот сигнал',en:'Many services still ignore the signal',uz:'Ko‘plab servislar bu so‘rovni baribir eʼtiborsiz qoldiradi'},
    adv:{ru:'Firefox убрал DNT в версии 135 (2025). Сигнал игнорируется большинством сайтов — используйте блокировщики и VPN',en:'Firefox removed DNT in v135 (2025). The signal is ignored by most sites — use blockers and a VPN instead',uz:'Firefox 135 (2025) versiyasida DNT olib tashlandi. Signal ko’pchilik saytlar tomonidan e’tiborga olinmaydi — bloklovchi va VPN ishlating'}
  },
  gpc:{
    label:{ru:'Global Privacy Control',en:'Global Privacy Control',uz:'Global Privacy Control'},
    use:{ru:'GPC — современный стандарт приватности, поддерживаемый Firefox 120+, Brave и рядом расширений',en:'GPC is a modern privacy standard supported by Firefox 120+, Brave, and several extensions',uz:"GPC — Firefox 120+, Brave va ba'zi kengaytmalar qo'llab-quvvatlaydigan zamonaviy maxfiylik standarti"},
    ex:{ru:'В отличие от DNT, некоторые юрисдикции (Калифорния, GDPR) обязывают сайты соблюдать GPC',en:'Unlike DNT, some jurisdictions (California CCPA, GDPR) legally require sites to honour GPC',uz:"DNT'dan farqli o'laroq, ba'zi huquqiy tizimlar (Kaliforniya, GDPR) saytlarni GPC'ni qabul qilishni majbur qiladi"},
    adv:{ru:'Установите Brave, Firefox 120+ или расширение Privacy Badger, чтобы активировать GPC автоматически',en:'Use Brave, Firefox 120+, or install Privacy Badger to automatically send GPC signals',uz:"GPC signalini avtomatik yuborish uchun Brave, Firefox 120+ yoki Privacy Badger kengaytmasini o'rnating"}
  },
  touch:{
    label:{ru:'Касания/указатель',en:'Touch / pointer',uz:'Sensor / ko‘rsatkich'},
    use:{ru:'Количество касаний и тип указателя выдают устройство (ПК, планшет, смартфон)',en:'Touch points and pointer type reveal whether this is a PC, tablet, or phone',uz:'Sensor nuqtalari va ko‘rsatkich turi qurilma (PK, planshet, telefon) ekanini ko‘rsatadi'},
    ex:{ru:'0 касаний + «fine» = настольный ПК, 5 касаний = планшет',en:'0 touches + “fine” points to a desktop, 5 touches points to a tablet',uz:'0 sensor + “fine” bu stolüstü PK, 5 sensor esa planshetni anglatadi'},
    adv:{ru:'Разделяйте рабочие и личные устройства, чтобы сигналы не накладывались',en:'Keep work and personal devices separate so the signals do not mix',uz:'Ish va shaxsiy qurilmalarni alohida saqlang, shunda signallar aralashmaydi'}
  },
  net:{
    label:{ru:'Сеть',en:'Network',uz:'Tarmoq'},
    use:{ru:'Тип подключения и задержка помогают системам антифрода узнать вас',en:'Connection type and latency feed anti-fraud systems',uz:'Ulanish turi va kechikish antifrod tizimlariga sizni aniqlashga yordam beradi'},
    ex:{ru:'Например, 4G и задержка 120 мс похожи на мобильную сеть',en:'For example, 4G with 120 ms latency looks like mobile data',uz:'Masalan, 4G va 120 ms kechikish mobil tarmoqni eslatadi'},
    adv:{ru:'Контролируйте VPN и прокси, чтобы характеристики не выбивались из привычных',en:'Keep VPN and proxy settings consistent so values do not look suspicious',uz:'VPN va proksi sozlamalarini mos tuting, shunda qiymatlar g‘alati ko‘rinmaydi'}
  },
  gl:{
    label:{ru:'WebGL (GPU)',en:'WebGL (GPU)',uz:'WebGL (GPU)'},
    use:{ru:'WebGL раскрывает модель видеочипа, она редко совпадает у двух людей',en:'WebGL reveals your GPU model, which is rarely identical between users',uz:'WebGL GPU modelini ko‘rsatadi va bu ko‘pchilikda takrorlanmaydi'},
    ex:{ru:'Например, Apple M2 GPU виден на любом сайте с WebGL',en:'For example, an Apple M2 GPU is visible to any site using WebGL',uz:'Masalan, Apple M2 GPU WebGL ishlatadigan har qanday saytga ko‘rinadi'},
    adv:{ru:'Используйте приватные режимы или отдельный браузер, чтобы скрыть точный чип',en:'Use private modes or a separate browser to mask the exact chip',uz:'Aniq chipni yashirish uchun maxfiy rejim yoki alohida brauzerdan foydalaning'}
  },
  canvas:{
    label:{ru:'Графический отпечаток (Canvas)',en:'Graphic fingerprint (Canvas)',uz:'Grafik iz (Canvas)'},
    use:{ru:'Браузер рисует невидимую картинку и получает уникальный хеш',en:'The browser draws an invisible image and gets a unique hash',uz:'Brauzer ko‘rinmas rasm chizib, noyob xesh oladi'},
    ex:{ru:'Совпадающий Canvas-хеш связывает действия на разных сайтах',en:'The same Canvas hash links activity across different sites',uz:'Bir xil Canvas xeshi turli saytlardagi harakatlarni bog‘laydi'},
    adv:{ru:'Включите защиту Canvas в настройках или расширениях',en:'Enable Canvas protection in settings or via extensions',uz:'Canvas himoyasini brauzer sozlamalarida yoki kengaytmada yoqing'}
  },
  audio:{
    label:{ru:'Аудио-отпечаток',en:'Audio fingerprint',uz:'Audio izi'},
    use:{ru:'Звук генерируется и превращается в хеш, по нему вас узнают',en:'The browser generates a tone and turns it into a hash to recognise you',uz:'Brauzer tovush yaratib, xeshga aylantiradi va shu orqali sizi taniydi'},
    ex:{ru:'Совпадающий аудио-хеш означает ту же систему и настройки',en:'A matching audio hash points to the same system and settings',uz:'Bir xil audio xesh bir xil tizim va sozlamalarni ko‘rsatadi'},
    adv:{ru:'Включите аудиозащиту или используйте расширения с рандомизацией',en:'Enable audio protections or use extensions that randomise it',uz:'Audio himoyasini yoqing yoki tasodiflashtiruvchi kengaytmadan foydalaning'}
  },
  webglFp:{
    label:{ru:'WebGL-отпечаток',en:'WebGL fingerprint',uz:'WebGL barmoq izi'},
    use:{ru:'WebGL раскрывает рендерер GPU и создаёт уникальный хеш рендеринга',en:'WebGL exposes the GPU renderer and creates a unique rendering hash',uz:'WebGL GPU rendererini ochib beradi va noyob rendering xeshini yaratadi'},
    ex:{ru:'Например, конкретная модель GPU вместе с хешем рендеринга выделяют устройство',en:'For example, a specific GPU model combined with the rendering hash singles out the device',uz:'Masalan, aniq GPU modeli rendering xeshi bilan birgalikda qurilmani ajratib koʻrsatadi'},
    adv:{ru:'Установите расширение для защиты WebGL или отключите его',en:'Install a WebGL protection extension or disable it',uz:'WebGL himoya kengaytmasini oʻrnating yoki uni oʻchirib qoʻying'}
  },
  audioCtx:{
    label:{ru:'Аудио-контекст',en:'AudioContext fingerprint',uz:'AudioContext barmoq izi'},
    use:{ru:'OfflineAudioContext обрабатывает звук и создаёт хеш, уникальный для вашей системы',en:'OfflineAudioContext processes sound and creates a hash unique to your system',uz:'OfflineAudioContext tovushni qayta ishlab, tizimingizga xos noyob xesh yaratadi'},
    ex:{ru:'Одинаковый аудио-хеш означает ту же звуковую подсистему',en:'An identical audio hash means the same audio subsystem',uz:'Bir xil audio xesh bir xil audio quyi tizimni anglatadi'},
    adv:{ru:'Используйте Firefox с resistFingerprinting или Brave для рандомизации',en:'Use Firefox with resistFingerprinting or Brave for randomisation',uz:'Tasodiflashtirish uchun Firefox resistFingerprinting yoki Brave dan foydalaning'}
  },
  fontsDetected:{
    label:{ru:'Обнаруженные шрифты',en:'Detected fonts',uz:'Aniqlangan shriftlar'},
    use:{ru:'Набор установленных шрифтов помогает сайтам создать уникальный профиль устройства',en:'The set of installed fonts helps sites build a unique device profile',uz:'Oʻrnatilgan shriftlar toʻplami saytlarga noyob qurilma profilini yaratishga yordam beradi'},
    ex:{ru:'Например, 25 нестандартных шрифтов резко сужают круг',en:'For example, 25 non-standard fonts drastically narrow the pool',uz:'Masalan, 25 ta nostandart shrift doirani keskin toraytiradi'},
    adv:{ru:'Удалите ненужные шрифты или используйте браузер с ограниченным доступом к шрифтам',en:'Remove unneeded fonts or use a browser that limits font access',uz:'Keraksiz shriftlarni oʻchiring yoki shriftlarga kirishni cheklaydigan brauzerdan foydalaning'}
  },
  perm:{
    label:{ru:'Разрешения',en:'Permissions',uz:'Ruxsatlar'},
    use:{ru:'Сайты видят, какие функции разрешены без дополнительных вопросов',en:'Sites see which features are already allowed without asking again',uz:'Saytlar qaysi funksiyalar qo‘shimcha so‘rovsiz ruxsat berilganini biladi'},
    ex:{ru:'Если камера разрешена, сайт сможет включить её сразу',en:'If the camera is allowed, a site can start it instantly',uz:'Kamera ruxsat etilgan bo‘lsa, sayt uni darhol yoqishi mumkin'},
    adv:{ru:'Периодически пересматривайте разрешения в настройках браузера',en:'Review permissions in your browser settings from time to time',uz:'Brauzer sozlamalarida ruxsatlarni vaqti-vaqti bilan ko‘rib chiqing'}
  },
  plugins:{
    label:{ru:'Плагины',en:'Plugins',uz:'Plaginlar'},
    use:{ru:'Нестандартные плагины и расширения отличают ваш браузер от чужого',en:'Unusual plugins and extensions make your browser stand out',uz:'Noodatiy plaginlar va kengaytmalar brauzeringizni boshqalardan ajratib turadi'},
    ex:{ru:'Например, криптокошелёк или узкий корпоративный плагин сразу заметны',en:'For example, a crypto wallet or corporate plugin is easy to spot',uz:'Masalan, kripto hamyon yoki korporativ plagin darhol seziladi'},
    adv:{ru:'Удаляйте или отключайте то, чем не пользуетесь каждый день',en:'Remove or disable anything you do not use daily',uz:'Har kuni ishlatmaydigan plaginlarni olib tashlang yoki o‘chirib qo‘ying'}
  },
  media:{
    label:{ru:'Медиа-устройства',en:'Media devices',uz:'Media qurilmalari'},
    use:{ru:'Перечень камер и микрофонов показывает, домашний это ПК или рабочее место студии',en:'Listing cameras and microphones shows whether this is a home PC or a studio rig',uz:'Kamera va mikrofon ro‘yxati bu uy PK si yoki studiya uskunasi ekanini ko‘rsatadi'},
    ex:{ru:'Несколько камер и микрофонов выдают стриминговое оборудование',en:'Multiple cameras and mics hint at streaming gear',uz:'Bir nechta kamera va mikrofon striming uskunasini anglatadi'},
    adv:{ru:'Отключайте лишние устройства или используйте заглушки',en:'Disconnect unused devices or use hardware blockers',uz:'Keraksiz qurilmalarni uzib qo‘ying yoki himoya qopqoq ishlating'}
  },
  bat:{
    label:{ru:'Батарея',en:'Battery',uz:'Batareya'},
    use:{ru:'Уровень заряда намекает на переносное устройство или работу от сети',en:'Charge level hints whether this is portable or plugged in',uz:'Zaryad darajasi bu qurilma portativmi yoki tarmoqqa ulanganini ko‘rsatadi'},
    ex:{ru:'Например, 15% без зарядки — вероятно смартфон в дороге',en:'For example, 15% with no charger likely means a phone on the go',uz:'Masalan, 15% va zaryadlanmayotgan bo‘lsa, bu yo‘lda ketayotgan telefon bo‘lishi mumkin'},
    adv:{ru:'Старайтесь держать заряд в безопасном диапазоне и не передавайте его чужим сайтам без необходимости',en:'Keep the battery in a safe range and avoid sharing it with unknown sites unnecessarily',uz:'Zaryadni xavfsiz darajada saqlang va keraksiz saytlar bilan bo‘lishmang'}
  },
  fontsExposure:{
    label:{ru:'Сторонние шрифты',en:'Third-party fonts',uz:'Tashqi shriftlar'},
    use:{ru:'Редкие шрифты выдают корпоративные настройки или конкретные приложения',en:'Unusual fonts reveal corporate setups or niche apps',uz:'Noodatiy shriftlar maxsus sozlamalar yoki dasturlarni fosh qiladi'},
    ex:{ru:'Например, фирменные гарнитуры компании сразу выделяют ваш браузер',en:'For example, corporate brand fonts instantly single out your browser',uz:'Masalan, korporativ brend shriftlari brauzeringizni darhol ajratib ko‘rsatadi'},
    adv:{ru:'Храните редкие шрифты в отдельном профиле или отключайте их перед чувствительными задачами',en:'Keep rare fonts in a separate profile or disable them before sensitive work',uz:'Kam uchraydigan shriftlarni alohida profilga o‘tkazing yoki muhim ishlar oldidan o‘chirib qo‘ying'}
  },
  trackerExposure:{
    label:{ru:'Трекеры и пиксели',en:'Trackers & pixels',uz:'Trekerlar va piksel kodlar'},
    use:{ru:'Сторонние счётчики и пиксели помогают сопоставлять ваши визиты',en:'External analytics and pixels link your visits across pages',uz:'Tashqi hisoblagichlar va piksellar tashriflaringizni bog‘laydi'},
    ex:{ru:'Например, один и тот же analytics-код увидит вас и на других сайтах',en:'For example, the same analytics tag recognises you on other sites',uz:'Masalan, bir xil analytics kodi sizni boshqa saytlarda ham taniydi'},
    adv:{ru:'Установите блокировщик трекеров и ограничьте сторонние скрипты на чувствительных сайтах',en:'Install a tracker blocker and limit third-party scripts on sensitive sites',uz:'Trekerlarni bloklovchi kengaytma o‘rnating va tashqi skriptlarni cheklang'}
  },
  resourceExposure:{
    label:{ru:'Другие сторонние загрузки',en:'Other third-party loads',uz:'Boshqa tashqi yuklamalar'},
    use:{ru:'Список сторонних доменов показывает, кому ещё уходит ваш трафик',en:'Extra domains show where else your traffic flows',uz:'Qo‘shimcha domenlar trafigingiz yana qayerga ketayotganini ko‘rsatadi'},
    ex:{ru:'Например, CDN из другой страны может подсказать ваш регион или интересы',en:'For example, a foreign CDN may hint at your region or interests',uz:'Masalan, boshqa mamlakatdagi CDN sizning hududingiz yoki qiziqishlaringizni bildirishi mumkin'},
    adv:{ru:'Отключайте лишние расширения и используйте режимы с изоляцией, чтобы ограничить внешний обмен данными',en:'Disable unused extensions and use isolated modes to limit external data exchange',uz:'Keraksiz kengaytmalarni o‘chirib qo‘ying va maʼlumot almashinuvini cheklash uchun izolyatsiyalangan rejimlardan foydalaning'}
  },
  fullness:{
    label:{ru:'Полнота профиля',en:'Profile completeness',uz:'Profil to‘liqligi'},
    use:{ru:'Показывает, сколько сигналов ваш браузер раскрыл сайтам',en:'Shows how many signals your browser has revealed',uz:'Brauzer saytga nechta signalni ochib berganini ko‘rsatadi'},
    ex:{ru:'Чем больше заполнено, тем легче построить точный портрет',en:'The fuller the profile, the easier it is to build an accurate portrait',uz:'Maʼlumot qancha ko‘p bo‘lsa, aniq profil tuzish shunchalik oson'},
    adv:{ru:'Ограничивайте доступ к лишним функциям и очищайте данные',en:'Limit access to unnecessary features and clear data regularly',uz:'Keraksiz funksiyalarni cheklang va maʼlumotlarni muntazam tozalang'}
  },
  fp:{
    label:{ru:'Итоговый Fingerprint',en:'Final fingerprint',uz:'Yakuniy fingerprint'},
    use:{ru:'Хеш объединяет все сигналы в одну строку — по ней вас находят снова',en:'The hash combines every signal so a site can find you again',uz:'Hash barcha signallarni bitta satrga birlashtiradi va sayt sizni yana topadi'},
    ex:{ru:'Совпадающий отпечаток на другом сайте значит, что это та же система',en:'A matching fingerprint on another site means it is the same system',uz:'Boshqa saytda ham xuddi shu fingerprint chiqsa, bu aynan o‘sha tizim degani'},
    adv:{ru:'Не делитесь хешем и обновляйте настройки, если хотите «обнулить» профиль',en:'Avoid sharing the hash and refresh your setup when you want to “reset” the profile',uz:'Hashni ulashmang va profilni “nolga tushirish” uchun sozlamalarni yangilang'}
  }
};

function resolveLocaleText(map, lang, fallback = '') {
  if (!map) return fallback;
  for (const code of [lang, 'en', 'ru', 'uz']) {
    const candidate = map[code];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return fallback;
}

function createCard(key, value, t, lang) {
  const info = CARD_CONTENT[key];
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = resolveLocaleText(info?.label, lang);
  card.appendChild(title);
  const valueEl = document.createElement('div');
  valueEl.className = 'val';
  valueEl.textContent = value ?? '—';
  card.appendChild(valueEl);
  const lines = [
    ['line hint small', resolveLocaleText(info?.use, lang), ''],
    ['line small', resolveLocaleText(info?.ex, lang), `${t.examplePrefix} `],
    ['line adv small', resolveLocaleText(info?.adv, lang), `${t.advicePrefix} `]
  ];
  for (const [className, text, prefix] of lines) {
    if (!text.trim()) continue;
    const el = document.createElement('div');
    el.className = className;
    el.textContent = prefix + text;
    card.appendChild(el);
  }
  return { card, valueEl };
}

function addCard(frag, key, value, t) {
  frag.appendChild(createCard(key, value, t, state.lang).card);
}

// A card whose value is a hash: monospace and copied to the clipboard on click.
function addHashCard(frag, key, value, t) {
  const { card, valueEl } = createCard(key, value || '—', t, state.lang);
  if (value) {
    valueEl.classList.add('mono', 'copyable');
    valueEl.title = t.copy.hint;
    valueEl.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value);
        valueEl.title = t.copy.done;
        setTimeout(() => { valueEl.title = t.copy.hint; }, 1200);
      } catch (_) { /* ignore */ }
    });
  }
  frag.appendChild(card);
}

/* ---- Formatting helpers ---- */

export function localeOf(lang) {
  return LOCALES[lang] || LOCALES.ru;
}

// Expects the negated getTimezoneOffset(): the caller passes -basic.tzOffsetMinutes.
function utcOffsetStr(mins) {
  const sign = mins <= 0 ? '+' : '-';
  const abs = Math.abs(mins);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

function timeInTZ(tz, locale) {
  const d = new Date();
  return `${d.toLocaleTimeString(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })} ${d.toLocaleDateString(locale, { timeZone: tz })}`;
}

function formatPermissionEntries(entries, t) {
  return entries.map(([key, value]) => `${t.permNames?.[key] || key}: ${t.permStates?.[value] || t.permStates?.unknown || value}`);
}

function formatPointerLabel(pointer, t) {
  if (!pointer) return t.pointerLabels?.none || '—';
  return t.pointerLabels?.[String(pointer).toLowerCase()] || pointer;
}

function formatDntStatus(value, t) {
  if (value == null) return t.dntStatus?.unknown || '—';
  const norm = String(value).trim().toLowerCase();
  if (['1', 'yes', 'true', 'on', 'enabled'].includes(norm)) return t.dntStatus?.on || value;
  if (['0', 'no', 'false', 'off', 'disabled'].includes(norm)) return t.dntStatus?.off || value;
  return t.dntStatus?.unknown || value;
}

function humanConnectionType(type) {
  if (!type) return '—';
  const lower = String(type).toLowerCase();
  const map = { wifi: 'Wi‑Fi', ethernet: 'Ethernet', cellular: 'Cellular', bluetooth: 'Bluetooth' };
  if (map[lower]) return map[lower];
  if (lower === 'slow-2g') return '2G (slow)';
  if (/^[2-5]g$/.test(lower)) return lower.toUpperCase();
  return type;
}

export function formatNetworkSummary(net) {
  if (!net || (!net.effectiveType && net.downlink == null && net.rtt == null)) return null;
  const downlink = typeof net.downlink === 'number' && net.downlink > 0 ? parseFloat(net.downlink.toFixed(1)) : null;
  const rtt = typeof net.rtt === 'number' && net.rtt > 0 ? Math.round(net.rtt) : null;
  return { type: humanConnectionType(net.effectiveType), downlink, rtt };
}

function formatBatteryStatus(battery) {
  if (!battery || battery.unavailable || typeof battery.level !== 'number') return '';
  const pct = Math.max(0, Math.min(100, Math.round(battery.level * 100)));
  return `${pct}%${battery.charging ? ' ⚡' : ''}`;
}

function formatStorage(storage, cookiesEnabled, t) {
  if (!storage) return '';
  const yes = t.units?.yes || 'yes', no = t.units?.no || 'no', unknown = t.permStates?.unknown || '—';
  const labels = t.labels?.storage || {};
  return [
    [labels.local || 'localStorage', storage.local],
    [labels.session || 'sessionStorage', storage.session],
    [labels.idb || 'IndexedDB', storage.indexedDB],
    [labels.cookies || 'Cookies', cookiesEnabled]
  ].map(([label, val]) => `${label}: ${val === true ? yes : val === false ? no : val == null ? unknown : val}`).join(' • ');
}

function summariseList(items, limit = 3) {
  if (!Array.isArray(items) || !items.length) return '—';
  return `${items.slice(0, limit).join(', ')}${items.length > limit ? ` +${items.length - limit}` : ''}`;
}

function formatMonitorText(info, t) {
  if (!info || !info.mode || info.mode === 'unknown') return t.monitorText?.unknown || '';
  const label = t.monitorText?.[info.mode];
  if (typeof label === 'function') return label(info.count || (info.mode === 'multi' ? '2+' : 1));
  return label || '';
}

/* ---- Hero verdict ---- */

export function updateHeroVerdict(pct, t, animate) {
  state.uniquenessPct = pct;
  const level = uniquenessLevel(pct);
  const headline = t.uniqHeadline?.[level] || '';
  const conclusionEl = getEl('heroConclusion');
  if (conclusionEl) conclusionEl.textContent = t.heroConclusion?.[level] || '';
  const heroEl = getEl('heroVerdict');
  const heroNumEl = getEl('heroNumber');
  if (heroEl && heroNumEl) {
    heroEl.style.display = 'block';
    const skeleton = getEl('heroSkeleton');
    if (skeleton) skeleton.style.display = 'none';
    heroNumEl.dataset.level = level;
    heroNumEl.textContent = pct + '%';
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !reduceMotion && typeof requestAnimationFrame === 'function') {
      const duration = 1200;
      const start = performance.now();
      const step = now => {
        const progress = Math.min((now - start) / duration, 1);
        heroNumEl.textContent = Math.round((1 - Math.pow(1 - progress, 3)) * pct) + '%';
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    const heroSubEl = getEl('heroSubtitle');
    if (heroSubEl) heroSubEl.textContent = headline;
  }
  return { level, headline };
}

/* ---- Data rows ---- */

const clockIntervals = new Set();
function clearClocks() {
  clockIntervals.forEach(id => clearInterval(id));
  clockIntervals.clear();
}

// Fills #groupIdentity ("What the site knows about you") and #groupNetwork ("Network analysis").
export function renderDataRows(basic, t) {
  const identity = getEl('groupIdentity');
  const network = getEl('groupNetwork');
  clearClocks();
  if (identity) identity.innerHTML = '';
  if (network) network.innerHTML = '';
  if (!basic) return;
  const lang = state.lang;
  const rows = t.rows || {};
  const locale = localeOf(lang);
  const details = state.serverData?.details || {};
  const hasIp = !!state.serverData;

  if (identity) {
    if (hasIp) {
      const rawCity = details.city || state.serverData?.geo?.city || '';
      const rawCountry = details.country_name || state.serverData?.geo?.country || '';
      const countryCode = resolveCountryCode(details, state.serverData?.raw, state.serverData?.geo) || '';
      const localCity = CITY_NAMES[rawCity]?.[lang] || rawCity;
      const localCountry = COUNTRY_NAMES[countryCode.toUpperCase()]?.[lang] || rawCountry;
      if (localCity || localCountry) {
        const flag = countryCode ? countryCodeToFlag(countryCode) : '';
        identity.appendChild(mkRow(rows.location, `${flag} ${esc(localCity)}${localCity && localCountry ? ', ' : ''}${esc(localCountry)}`, { html: true }));
      }
    }
    const now = new Date();
    identity.appendChild(mkRow(rows.date, now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })));
    // A live clock: the time a site reads is the one the device shows.
    const timeRow = mkRow(rows.time, '');
    const timeValue = timeRow.querySelector('.data-value');
    timeValue.classList.add('live-clock');
    const tick = () => { timeValue.textContent = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
    tick();
    clockIntervals.add(window.setInterval(tick, 1000));
    identity.appendChild(timeRow);
    if (basic.timezone) identity.appendChild(mkRow(rows.timezone, basic.timezone, { code: true }));
    if (basic.languages?.length) {
      identity.appendChild(mkRow(rows.languages, basic.languages.slice(0, 5).map(l => `${langToFlag(l)} ${esc(l)}`).join(', '), { html: true }));
    }
    const device = guessDevice(basic);
    const deviceName = deviceDisplayName(device, t);
    if (deviceName) {
      const osVer = guessOSVersion(basic);
      identity.appendChild(mkRow(rows.device, `${deviceIcon(device)} ${esc(osVer ? `${deviceName} · ${osVer}` : deviceName)}`, { html: true }));
    }
    if (basic.hw?.deviceMemory) identity.appendChild(mkRow(rows.ram, `≈${basic.hw.deviceMemory} GB`));
    if (basic.battery && basic.battery.level != null && !basic.battery.unavailable) {
      identity.appendChild(mkRow(rows.battery, `${Math.round(basic.battery.level * 100)}%${basic.battery.charging ? rows.charging : ''}`));
    }
    const browserStr = browserDisplayName(basic);
    if (browserStr && browserStr !== '—') {
      const icon = browserIcon(browserStr);
      const row = mkRow(rows.browser, `${icon ? icon + ' ' : ''}<code>${esc(browserStr)}</code>`, { html: true });
      appendStatLabel(row, getStatPercent('browsers', browserStr), t);
      identity.appendChild(row);
      const perms = basic.perms || {};
      const granted = ['camera', 'microphone', 'geolocation'].filter(k => perms[k] === 'granted').map(k => rows.perms?.[k] || k);
      if (granted.length) identity.appendChild(mkRow(rows.permissions, granted.join(', '), { badge: 'warning' }));
    }
  }

  if (network) {
    const ip = state.serverData?.ip || '';
    if (ip) network.appendChild(mkRow(rows.ip, ip, { code: true }));
    const net = basic.net || {};
    const ispParts = [];
    if (hasIp && details.org) ispParts.push(details.org);
    if (state.speed?.mbps) ispParts.push(`${state.speed.mbps} Mbps`);
    else if (net.downlink) ispParts.push(`${net.downlink} Mbps`);
    if (ispParts.length) network.appendChild(mkRow(rows.isp, ispParts.join(' · ')));
    if (net.type && net.type !== 'unknown') network.appendChild(mkRow(rows.connectionType, rows.connection?.[net.type] || net.type));
    if (hasIp) {
      const tzMismatch = details.timezone && basic.timezone && (details.timezone.split('/')[0] || '') !== (basic.timezone.split('/')[0] || '');
      const likely = tzMismatch || state.vpn?.status === 'likely';
      network.appendChild(mkRow(rows.vpn, likely ? rows.detected : rows.notDetected, { badge: likely ? 'danger' : 'safe' }));
    }
    const webrtc = state.webrtc;
    if (!webrtc || !webrtc.checked) network.appendChild(mkRow(rows.webrtc, rows.unavailable, { badge: 'warning' }));
    else if (webrtc.leak) network.appendChild(mkRow(rows.webrtc, rows.leak + webrtc.ips.join(', '), { badge: 'danger' }));
    else network.appendChild(mkRow(rows.webrtc, rows.safe, { badge: 'safe' }));
    const spoofing = checkSpoofing();
    state.spoofing = spoofing;
    network.appendChild(mkRow(rows.browserData, spoofing.consistent ? rows.looksNatural : rows.inconsistencies, { badge: spoofing.consistent ? 'safe' : 'warning' }));
  }

  const section = getEl('shockSection');
  const shock = getEl('shock');
  if (shock) shock.style.display = 'block';
  if (section) { section.style.display = 'block'; section.classList.add('shock-animate'); }
}

// "(у 12% посетителей)" under a row's value, from /api/stats.
export function appendStatLabel(rowEl, pct, t) {
  if (pct == null) return;
  const valSpan = rowEl.querySelector('.data-value');
  if (!valSpan) return;
  const label = document.createElement('span');
  label.className = 'stat-share';
  label.textContent = '(' + (typeof t.statVisitors === 'function' ? t.statVisitors(pct) : `${pct}%`) + ')';
  valSpan.appendChild(label);
}

/* ---- Risks and recommendations ---- */

const browserGroup = detectBrowserGroup();

function createRecCard(rec, levelLabels, isPersonal, altPrefix, t) {
  const levelClass = rec.level === 'easy' ? 'rec-card--green' : rec.level === 'medium' ? 'rec-card--yellow' : rec.level === 'hard' ? 'rec-card--red' : '';
  const card = document.createElement('div');
  card.className = 'rec-card ' + (isPersonal ? 'rec-card--personal' : levelClass);
  const zoneTop = document.createElement('div');
  zoneTop.className = 'rec-zone-top';
  const header = document.createElement('div');
  header.className = 'rec-header';
  const levelHtml = isPersonal && rec.level && levelLabels[rec.level] ? '<span class="rec-level">' + esc(levelLabels[rec.level]) + '</span>' : '';
  header.innerHTML = '<span class="rec-title">' + esc(rec.title) + '</span>' + levelHtml;
  zoneTop.appendChild(header);
  card.appendChild(zoneTop);
  const why = typeof rec.problem === 'function' ? rec.problem() : (rec.problem || rec.body || '');
  if (why) {
    const zoneWhy = document.createElement('div');
    zoneWhy.className = 'rec-zone-why';
    zoneWhy.textContent = why;
    card.appendChild(zoneWhy);
  }
  const instr = (rec.instructions && (rec.instructions[browserGroup] || rec.instructions.chrome)) || null;
  if (instr) {
    const zoneAction = document.createElement('div');
    zoneAction.className = 'rec-zone-action';
    const actionEl = document.createElement('div');
    actionEl.className = 'rec-action';
    if (instr.link) actionEl.innerHTML = esc(instr.action) + ' → <a href="' + esc(instr.link.url) + '" target="_blank" rel="noopener">' + esc(instr.link.text) + '</a>';
    else actionEl.textContent = instr.action;
    zoneAction.appendChild(actionEl);
    const extras = [['rec-detail', instr.detail], ['rec-note', instr.note && '✓ ' + instr.note], ['rec-alt', rec.alternative && browserGroup !== 'brave' && (altPrefix || '') + rec.alternative]];
    for (const [className, text] of extras) {
      if (!text) continue;
      const el = document.createElement('div');
      el.className = className;
      el.textContent = text;
      zoneAction.appendChild(el);
    }
    if (rec.expandDetail) {
      const details = document.createElement('details');
      details.className = 'rec-expand';
      const summary = document.createElement('summary');
      summary.textContent = t.vpnMore || 'More';
      details.appendChild(summary);
      const body = document.createElement('div');
      body.className = 'rec-expand-body';
      body.innerHTML = rec.expandDetail; // from the page's own strings
      details.appendChild(body);
      zoneAction.appendChild(details);
    }
    card.appendChild(zoneAction);
  }
  return card;
}

// A recommendation whose "problem" text takes a number (plugins, languages, fonts).
function withCount(rec, n) {
  if (!rec || typeof rec.problem !== 'function') return rec;
  const fn = rec.problem;
  return { ...rec, problem: () => fn(n) };
}

export function renderImplications(basic, t) {
  const impl = t.implications;
  if (!impl) return;
  getEl('implProblemTitle').textContent = impl.problemTitle || '';
  getEl('implProblemText').innerHTML = impl.problemText || '';
  getEl('implRisksTitle').textContent = impl.risksTitle || '';
  const grid = getEl('implRisksGrid');
  if (grid) {
    grid.innerHTML = '';
    (impl.risks || []).forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'risk-card';
      card.dataset.riskIndex = String(i);
      card.innerHTML = '<div class="risk-icon">' + r.icon + '</div><div class="risk-title">' + r.title + '</div><div class="risk-body">' + r.body + '</div>';
      grid.appendChild(card);
    });
    // Mark the risks the scan results point at: no VPN (0, 1), few trackers blocked (1), a
    // distinctive fingerprint (4).
    if (basic) {
      const tagCard = idx => {
        const c = grid.querySelector('[data-risk-index="' + idx + '"]');
        if (c && !c.querySelector('.relevant-badge')) {
          const badge = document.createElement('span');
          badge.className = 'relevant-badge';
          badge.textContent = t.relevantBadge || '';
          c.appendChild(badge);
        }
      };
      if (state.vpn?.status !== 'likely') { tagCard(0); tagCard(1); }
      if ((state.trackerResults || []).filter(r => r.blocked).length < 2) tagCard(1);
      if ((state.uniquenessPct || 0) > 70) tagCard(4);
    }
  }
  getEl('implStepsTitle').textContent = impl.stepsTitle || '';
  getEl('personalRecsSummaryText').textContent = impl.personalTitle || '';
  getEl('generalRecsSummaryText').textContent = impl.generalTitle || '';
  const altPrefix = impl.altPrefix || '';
  const levelLabels = impl.levelLabels || {};
  const personalEl = getEl('personalRecs');
  if (personalEl) {
    personalEl.innerHTML = '';
    if (basic && impl.personal) {
      const p = impl.personal;
      const picks = [];
      if (basic.hashes?.canvas) picks.push(p.canvas);
      if ((basic.plugins || []).length > 3) picks.push(withCount(p.plugins, basic.plugins.length));
      if (Object.values(basic.perms || {}).some(v => String(v).toLowerCase() === 'granted')) picks.push(p.permissions);
      if (state.vpn?.status === 'likely') picks.push(p.vpn);
      if (state.webrtc?.leak) picks.push(p.webrtc);
      if ((basic.languages || []).length > 2) picks.push(withCount(p.languages, basic.languages.length));
      if (basic.webgl?.supported) picks.push(p.webgl);
      if (basic.audioFp?.supported) picks.push(p.audioFp);
      if (basic.fontsFp?.count > 15) picks.push(withCount(p.fonts, basic.fontsFp.count));
      const issues = state.spoofing?.issues || [];
      if (issues.includes('ua_platform')) picks.push(p.spoofing);
      if (issues.includes('canvas_randomized')) picks.push(p.canvasRandomized);
      if (issues.includes('tz_mismatch')) picks.push(p.tzMismatch);
      for (const rec of picks) if (rec) personalEl.appendChild(createRecCard(rec, levelLabels, true, altPrefix, t));
    }
  }
  const generalEl = getEl('generalRecs');
  if (generalEl) {
    generalEl.innerHTML = '';
    if (impl.general?.length) {
      const order = { easy: 0, medium: 1, hard: 2 };
      const sorted = [...impl.general].sort((a, b) => (order[a.level] ?? 1) - (order[b.level] ?? 1));
      const VISIBLE = 3;
      sorted.slice(0, VISIBLE).forEach(rec => generalEl.appendChild(createRecCard(rec, levelLabels, false, altPrefix, t)));
      if (sorted.length > VISIBLE) {
        const details = document.createElement('details');
        details.className = 'rec-overflow-wrap';
        const summary = document.createElement('summary');
        summary.className = 'btn btn-inline rec-more';
        summary.textContent = t.moreRecs || 'More';
        details.appendChild(summary);
        sorted.slice(VISIBLE).forEach(rec => details.appendChild(createRecCard(rec, levelLabels, false, altPrefix, t)));
        generalEl.appendChild(details);
      }
    }
  }
}

/* ---- Detail cards ---- */

export function renderCards(snapshot, t) {
  const { basic, fp } = snapshot;
  const cards = getEl('cards');
  if (!cards) return;
  cards.textContent = '';
  const frag = document.createDocumentFragment();
  const locale = localeOf(state.lang);
  const s = basic.screen;
  const tzForClock = basic.timezone || LOCAL_TZ || 'UTC';
  const memParts = [];
  if (basic.hw.deviceMemory) memParts.push(`≈${basic.hw.deviceMemory} ${t.units.gb}`);
  if (basic.hw.memoryLimitGb && (!basic.hw.deviceMemory || Math.abs(basic.hw.memoryLimitGb - basic.hw.deviceMemory) > 1)) memParts.push(`heap ≤${basic.hw.memoryLimitGb} ${t.units.gb}`);
  const memText = memParts.length ? memParts.join(' / ') : '—';
  const networkInfo = formatNetworkSummary(basic.net);
  const netParts = [];
  if (networkInfo) {
    if (networkInfo.type) netParts.push(networkInfo.type);
    if (networkInfo.downlink != null) netParts.push(`~${networkInfo.downlink} ${t.units.mbps}`);
    if (networkInfo.rtt != null) netParts.push(`${t.labels.latency} ${networkInfo.rtt} ${t.units.ms}`);
  }
  const permEntries = Object.entries(basic.perms || {});
  const formattedPerms = formatPermissionEntries(permEntries, t);
  const touchPoints = typeof basic.touch?.maxTouchPoints === 'number' ? basic.touch.maxTouchPoints : 0;
  const exposure = basic.exposure || {};

  addCard(frag, 'tz', `${basic.timezone || '—'} (${utcOffsetStr(-basic.tzOffsetMinutes)}) • ${timeInTZ(tzForClock, locale)}`, t);
  addCard(frag, 'ua', browserDisplayName(basic), t);
  addCard(frag, 'plat', guessOSVersion(basic), t);
  addCard(frag, 'screen', [`${s.w}×${s.h}@${s.pixelRatio}`, `${s.colorDepth}-bit`, formatMonitorText(s.monitors, t)].filter(Boolean).join(' • '), t);
  addCard(frag, 'langs', (basic.languages || []).join(', ') || '—', t);
  addCard(frag, 'hw', `${basic.hw.hardwareConcurrency || '?'} ${t.units.cores} • ${memText}${memParts.length ? ` (${t.memoryNote || ''})` : ''}`.trim(), t);
  addCard(frag, 'store', formatStorage(basic.storage, basic.cookiesEnabled, t) || '—', t);
  addCard(frag, 'dnt', formatDntStatus(basic.dnt, t), t);
  addCard(frag, 'touch', `${touchPoints} ${t.labels.touchPoints} • ${t.labels.pointer}: ${formatPointerLabel(basic.pointer, t)}`, t);
  addCard(frag, 'net', netParts.length ? netParts.join(' • ') : '—', t);
  addCard(frag, 'gl', basic.gl && (basic.gl.vendor || basic.gl.renderer) ? `${basic.gl.vendor} / ${basic.gl.renderer}` : '—', t);
  addHashCard(frag, 'canvas', basic.hashes.canvas, t);
  addHashCard(frag, 'audio', basic.hashes.audio, t);
  addCard(frag, 'perm', formattedPerms.length ? formattedPerms.join(' • ') : (t.permStates?.unknown || '—'), t);
  addCard(frag, 'plugins', String((basic.plugins || []).length), t);
  addCard(frag, 'media', basic.media?.length ? basic.media.map(m => `${m.kind}:${m.label ? t.units.yes : t.units.no}`).join(' • ') : '—', t);
  addCard(frag, 'bat', formatBatteryStatus(basic.battery) || (basic.battery?.unavailable ? (t.batteryUnavailable || '—') : '—'), t);
  addCard(frag, 'fontsExposure', summariseList(exposure.fonts), t);
  addCard(frag, 'trackerExposure', summariseList(exposure.trackers), t);
  addCard(frag, 'resourceExposure', summariseList(exposure.resources), t);

  // How many of the collected fields carry a value.
  let filled = 0, total = 0;
  (function walk(o) {
    for (const k in o) {
      total++;
      const v = o[k];
      if (v == null) continue;
      if (typeof v === 'string') { if (v.length) filled++; }
      else if (typeof v === 'number' && !Number.isNaN(v)) filled++;
      else if (typeof v === 'boolean') filled++;
      else if (typeof v === 'object') { if (Array.isArray(v)) { if (v.length) filled++; } else walk(v); }
    }
  })(basic);
  addCard(frag, 'fullness', t.formatFullness(filled, total), t);
  addHashCard(frag, 'fp', fp, t);
  cards.appendChild(frag);
}
