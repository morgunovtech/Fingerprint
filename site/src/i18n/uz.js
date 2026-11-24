// Uzbek strings of the page. Keys are the same in ru.js, en.js and uz.js; selftest.js checks that.
import { PERSONAL_URL, CANONICAL_URL } from '../config.js';

export default {
    langButton:'Til',
    langLabels:{ru:'Rus tili',en:'Ingliz tili',uz:'Oʻzbek tili'},
    theme:{label:'Mavzu',modes:{auto:'Avto',light:'Yorugʻ',dark:'Tungi',contrast:'Kontrast'}},
    introTitle:'”Raqamli barmoq izi”: saytlar siz haqingizda nimalarni biladi',
    uniqHeadline:{'high':'Barmoq izingiz koʻpchilikdan koʻra noyobroq','med':'Barmoq izingiz oʻrtacha darajada ajralib turadi','low':'Barmoq izingiz koʻpchilikka oʻxshaydi'},
    trackers:{
      title:"Trekerlardan himoya",
      description:"Biz keng tarqalgan kuzatuv usullarini (reklama piksellari, analitika skriptlari, reklama freymlar) simulyatsiya qilamiz va brauzeringiz ularni bloklayotganini tekshiramiz.",
      pixel:{name:"Reklama pikseli",blocked:"Bloklangan",open:"Bloklanmagan"},
      pixelExplain:"Reklama tarmoqlari sahifalarga joylashtiradigan koʻrinmas 1×1 piksel rasmlar",
      analytics:{name:"Analitika skripti",blocked:"Bloklangan",open:"Bloklanmagan"},
      analyticsExplain:"Saytdagi xatti-harakatlaringiz haqida maʼlumot toʻplaydigan skriptlar",
      iframe:{name:"Reklama freyimi",blocked:"Bloklangan",open:"Bloklanmagan"},
      iframeExplain:"Reklama tarmoqlari serverlaridan kontent yuklaydigan oʻrnatilgan reklama bloklari",
      dnt:{name:"Do Not Track",blocked:"Yoqilgan",open:"Oʻchirilgan"},
      dntExplain:"Saytlardan sizni kuzatmaslikni soʻraydigan brauzer signali",
      gpc:{name:"Global Privacy Control",blocked:"Yoqilgan",open:"Oʻchirilgan"},
      gpcExplain:"Baʻzi mamlakatlar qonunchiligida qoʻllab-quvvatlanadigan maxfiylik signali",
      verdict:function(blocked,total){
        if(blocked>=5) return "✅ Ajoyib himoya! Barcha tekshirilgan trekerlar bloklangan (" + blocked + " / " + total + ").";
        if(blocked>=3) return "Yaxshi himoya. Koʻpchilik trekerlar bloklangan (" + blocked + " / " + total + "). Qolgan bloklanmagan elementlarni tekshiring.";
        if(blocked>=1) return "Qisman himoya (" + blocked + " / " + total + "). Brauzeringiz baʻzi trekerlarni bloklaydi, lekin hammasini emas. Toʻliq himoya uchun uBlock Origin ni tavsiya qilamiz.";
        return "Brauzeringiz birorta ham trekerni bloklamaydi (0 / " + total + "). Saytlar har bir tashrifingizni reklama piksellari, analitika skriptlari va reklama freymlar yordamida kuzatishi mumkin. uBlock Origin oʻrnatishni tavsiya qilamiz — bu bepul kengaytma koʻpchilik muammolarni hal qiladi.";
      }
    },
    implications:{
      problemTitle:'Maʻlumotlaringizga nima boʻlmoqda',
      problemText:'<p>Har safar saytni ochganingizda, brauzer avtomatik ravishda oʻnlab xususiyatlarni uzatadi — sizning ruxsatingizsiz va hech qanday oynalarsiz. Saytlar bu barmoq izini oʻzlarida saqlamaydi — ular uni reklama tarmoqlariga uzatadi.</p><p>Reklama tarmogʻi bir vaqtning oʻzida millionlab saytlarda boʻlishi mumkin. Bu shuni anglatadiki, bitta koʻrinmas treker siz internetda qayerda boʻlsangiz, jimgina kuzatadi — va qiziqishlaringiz, xaridlaringiz, yoʻllaringiz va odatlaringiz toʻliq tarixini yigʻadi.</p><p>Bu profil cookie fayllarini tozalaganingizda oʻchirilmaydi. Inkognito rejimida yoʻqolmaydi. Brauzeringiz va qurilmangiz mavjud ekan, u ham mavjud.</p>',
      risksTitle:'Bu siz uchun shaxsan nima uchun xavfli',
      risks:[
        {icon:'💸',title:'Siz boshqalardan koʻproq toʻlaysiz',body:'Internet-doʻkonlar va bron qilish xizmatlari qurilma modelingiz, brauzeringiz va xatti-harakatlaringizni koʻradi. MacBook foydalanuvchilariga koʻpincha aviabilet va mehmonxonalar uchun byudjetli Android qurilmalar foydalanuvchilariga qaraganda yuqoriroq narxlar koʻrsatiladi — bu narx kamsitishi boʻlib, aksariyat mamlakatlarda qonuniy.'},
        {icon:'🎯',title:'Reklama siz haqingizda doʻstlaringizdan koʻproq biladi',body:'Barmoq izingiz asosida reklama tizimlari qaysi saytlarga kirgansiz, nimani qidirganingiz, kechasi qachon uxlamaganingiz va qaysi mavzular sizni tashvishlantirishini biladi. Bu maʻlumotlar faqat reklama uchun emas — sugʻurta kompaniyalari va ish beruvchilar maʻlumot brokerlaridan profillar sotib oladi.'},
        {icon:'🎣',title:'Fishing (maqsadli firibgarlik xatlari) aniqroq boʻladi',body:'Profilingiz bilan bazani sotib olgan firibgarlar shahringiz, provayderingiz, qurilmangiz va tilingizni biladi. MacBook yoki provayder akkountingizni eslatuvchi xat ishonchli koʻrinadi — nishonlangan fishing hujumlari aynan shunday ishlaydi.'},
        {icon:'🔓',title:'Inkognito rejimi sizni himoya qilmaydi',body:'Koʻpchilik foydalanuvchilar inkognito = anonimlik deb hisoblaydi. Bu notoʻgʻri. Inkognito rejimi tarixni faqat qurilmangizdagi boshqa odamlardan yashiradi. Barmoq izingiz, IP va barcha signallar avvalgidek qoladi — saytlar sizni xuddi shunday koʻradi. Inkognito sessiya tugaganda tarix, cookie va keshni tozalaydi. Lekin raqamli barmoq izingizni yashirmaydi, trafikni shifrlamaydi, IP manzilni berkitmaydi.'},
        {icon:'🗂️',title:'Profilingiz sizning xabaringizsiz mavjud — va sizish abadiy',body:'Hozir maʻlumot brokerlari (Acxiom, Oracle Data Cloud, Nielsen va boshqalar) maʻlumotlar bazasida sizning qiziqishlaringiz, yoʻllaringiz, xaridlaringiz va taxminiy daromadingiz bilan fayl mavjud. Siz bunga rozilik bermadingiz. Uni oʻchira olmaysiz. 2023–2024 yillarda reklama platformalaridan minglab maʻlumot sizishlari roʻy berdi. Agar barmoq izingiz bilan profil sizib chiqqan boʻlsa — uni qaytarib boʻlmaydi. Firibgarlar eski bazalardan yillab nishonlangan hujumlar uchun foydalanadi.'},
        {icon:'🔐',title:"VPN maxfiylikni kafolatlamaydi",body:"VPN trafikni yashirish va IP ni almashtirish uchun yordam beradi, lekin raqamli barmoq izingizni yashirmaydi. Provayder VPN ishlatayotganingizni koʻradi. Baʻzi VPN xizmatlari faoliyatingiz haqidagi maʼlumotlarni saqlaydi."}
      ],
      stepsTitle:'Hozir nima qilish kerak',
      personalTitle:'Barmoq izingiz asosida',
      generalTitle:'Hammaga foydali — natijalardan qatʻiy nazar',
      levelLabels:{easy:'🟢 oson',medium:'🟡 oʻrtacha',hard:'🔴 qiyin'},
      altPrefix:'Yoki: ',
      personal:{
        canvas:{
          title:"Grafik barmoq izini himoya qiling",
          problem:"Brauzeringiz rasmlarni noyob tarzda chizadi — bu xesh boʻyicha sizni cookieʻlarsiz ham tanishadi.",
          instructions:{
            chrome:{action:"CanvasBlocker kengaytmasini oʻrnating",link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/canvas%20blocker'}},
            firefox:{action:"privacy.resistFingerprinting ni yoqing",detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:"Himoya yoqilganligini tekshiring",detail:'Shields → Fingerprinting → Strict',note:"Brave canvas-trekingdan sukut boʻyicha himoyalaydi"},
            safari:{action:"Safari canvas-trekingdan qisman himoyalaydi",note:"Intelligent Tracking Prevention ichki himoyasi"}
          },
          alternative:"Brave da bu himoya ichki va kengaytmalarsiz ishlaydi."
        },
        plugins:{
          title:"Kengaytmalar sonini kamaytiring",
          problem:function(n){return "Sizda "+n+" ta kengaytma bor — nostandart toʻplam profilingizni oson tanib olinadigan qiladi.";},
          instructions:{
            chrome:{action:"Kengaytmalar menejerini oching va keraksizlarini oʻchiring",detail:'chrome://extensions'},
            firefox:{action:"Qoʻshimchalar menejerini oching va keraksizlarini oʻchiring",detail:'about:addons'},
            brave:{action:"Kengaytmalar menejerini oching va keraksizlarini oʻchiring",detail:'brave://extensions'},
            safari:{action:"Kengaytmalar sozlamalarini oching",detail:"Safari → Sozlamalar → Kengaytmalar"}
          }
        },
        permissions:{
          title:"Keraksiz ruxsatlarni bekor qiling",
          problem:"Kamera yoki mikrofon ruxsat berilgan — sayt ularni qayta soʻramasdan faollashtirishi mumkin.",
          instructions:{
            chrome:{action:"Ruxsatlarni tekshiring va bekor qiling",detail:'chrome://settings/content'},
            firefox:{action:"Ruxsatlarni tekshiring va bekor qiling",detail:'about:preferences#privacy → Ruxsatlar'},
            brave:{action:"Ruxsatlarni tekshiring va bekor qiling",detail:'brave://settings/content'},
            safari:{action:"Har bir sayt uchun ruxsatlarni tekshiring",detail:"Safari → Sozlamalar → Veb-saytlar"}
          }
        },
        vpn:{
          title:"VPN va tizim vaqtini sinxronlashtiring",
          problem:"VPN IP ni oʻzgartiradi, lekin tizim vaqt zonasi qoladi — bu nomuvofiqlik darhol seziladi.",
          instructions:{
            chrome:{action:"Vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            firefox:{action:"Vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            brave:{action:"Vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            safari:{action:"Vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"}
          },
          alternative:"Mullvad VPN vaqt zonasini avtomatik sinxronlaydi."
        },
        webrtc:{
          title:"WebRTC oqishini bartaraf eting",
          problem:"WebRTC VPN yoqilgan boʻlsa ham lokal IP ni ochib beradi.",
          instructions:{
            chrome:{action:"WebRTC Leak Prevent kengaytmasini oʻrnating",link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webrtc%20leak%20prevent'}},
            firefox:{action:"WebRTC ni oʻchiring",detail:'about:config → media.peerconnection.enabled → false'},
            brave:{action:"WebRTC Brave da allaqachon bloklangan",note:"Shields sukut boʻyicha WebRTC ni bloklaydi"},
            safari:{action:"Safari WebRTC oqishlarini sukut boʻyicha bloklaydi",note:"Qoʻshimcha amallar talab qilinmaydi"}
          }
        },
        languages:{
          title:"Tillar roʻyxatini soddalashtiring",
          problem:function(n){return "Sozlamalarda "+n+" ta til — nostandart kombinatsiya sizni toraytirib qoʻyadi.";},
          instructions:{
            chrome:{action:"1–2 ta tilni qoldiring",detail:"Sozlamalar → Tillar"},
            firefox:{action:"1–2 ta tilni qoldiring",detail:"about:preferences → Til"},
            brave:{action:"1–2 ta tilni qoldiring",detail:"Sozlamalar → Tillar"},
            safari:{action:"Tizim sozlamalarida tillar tartibini oʻzgartiring",detail:"Tizim sozlamalari → Umumiy → Til va mintaqa"}
          }
        },
        webgl:{
          title:"WebGL barmoq izini himoya qiling",
          problem:"WebGL GPU modelingizni ochib beradi — bu kuchli qurilma identifikatori.",
          instructions:{
            chrome:{action:"WebGL Fingerprint Defender oʻrnating",link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webgl%20fingerprint%20defender'}},
            firefox:{action:"WebGL ni oʻchiring",detail:"about:config → webgl.disabled → true"},
            brave:{action:"Brave WebGL barmoq izini tasodiflashtiradi",note:"Shields → Fingerprinting → Strict"},
            safari:{action:"Safari WebGL ga kirishni sukut boʻyicha cheklaydi",note:"Qoʻshimcha amallar talab qilinmaydi"}
          }
        },
        audioFp:{
          title:"Audio barmoq izini himoya qiling",
          problem:"Brauzer tovushni noyob tarzda qayta ishlaydi — bu belgiga qarab sizni tanish mumkin.",
          instructions:{
            chrome:{action:"Maxsus kengaytmalar yoʻq — Brave yoki Firefox dan foydalaning",detail:"Brave va Firefox resistFingerprinting bilan audio trekingdan himoyalaydi"},
            firefox:{action:"privacy.resistFingerprinting ni yoqing",detail:"about:config → privacy.resistFingerprinting → true"},
            brave:{action:"Brave audio barmoq izini tasodiflashtiradi",note:"Himoya sukut boʻyicha yoqilgan"},
            safari:{action:"Safari audio trekingdan qisman himoyalaydi",note:"ITP ichki himoyasi"}
          }
        },
        fonts:{
          title:"Nostandart shriftlar sonini kamaytiring",
          problem:function(n){return n+" ta nostandart shrift aniqlandi — oʻrnatilgan shriftlar toʻplami qurilmangizni boshqalardan ajratishga yordam beradi.";},
          instructions:{
            chrome:{action:"Ishlatilmaydigan ekzotik shriftlarni oʻchiring",detail:"Boshqaruv paneli → Shriftlar (Windows) yoki Font Book (macOS)"},
            firefox:{action:"Ekzotik shriftlarni oʻchiring + resistFingerprinting ni yoqing",detail:"about:config → privacy.resistFingerprinting → true"},
            brave:{action:"Brave shriftlar koʻrinishini cheklaydi",note:"Shields → Fingerprinting → Strict"},
            safari:{action:"Safari shriftlar roʻyxatiga kirishni cheklaydi",note:"Ichki himoya"}
          }
        },
        spoofing:{
          title:"Brauzer maʻlumotlarida nomuvofiqliklar aniqlandi",
          problem:"Brauzeringizning baʻzi maʻlumotlari bir-biriga mos kelmaydi. Bu VPN, maxfiylik kengaytmasi yoki User-Agent almashtirilishi boʻlishi mumkin. Nomuvofiqliklar baʻzan sizni kamroq emas, balki koʻproq koʻzga koʻrinadigan qiladi.",
          instructions:{
            chrome:{action:"User-Agent ni almashtiruvchi kengaytmalarni tekshiring",detail:"chrome://extensions → User-Agent Switcher va shunga oʻxshashlarni oʻchiring"},
            firefox:{action:"Kengaytmalar va maxfiylik sozlamalarini tekshiring",detail:"about:addons → kerak boʻlmasa UA almashtirishni oʻchiring"},
            brave:{action:"Brave kichik nomuvofiqliklar keltirib chiqarishi mumkin — bu normal",note:"Brave ichki himoyasi baʻzan boshqariladigan anomaliyalar yaratadi"},
            safari:{action:"Safari kengaytmalarini tekshiring",detail:"Safari → Sozlamalar → Kengaytmalar"}
          }
        },
        canvasRandomized:{
          title:"Canvas tasodiflashtirish aniqlandi",
          problem:"Kengaytmangiz canvas barmoq izini tasodiflashtirmoqda. Bu maxfiylik uchun yaxshi, lekin bunday himoyasiz foydalanuvchilar orasida sizni noyob qilishi mumkin.",
          instructions:{
            chrome:{action:"Brave ga oʻtishni koʻrib chiqing",detail:"Brave brauzer darajasida canvas ni tasodiflashtiradi, bu kamroq seziladi"},
            firefox:{action:"privacy.resistFingerprinting xuddi shunday ishlaydi",detail:"Bu Firefox ning standart mexanizmi — kengaytmalarga qaraganda kamroq seziladi"},
            brave:{action:"Brave brauzer darajasida canvas ni tasodiflashtiradi",note:"Bu standart xatti-harakat — oʻzgartirish shart emas"},
            safari:{action:"Safari ichki canvas himoyasiga ega",note:"Qoʻshimcha amallar talab qilinmaydi"}
          }
        },
        tzMismatch:{
          title:"Vaqt zonasi IP bilan mos kelmaydi",
          problem:"Vaqt zonangiz IP manzilingiz bilan mos kelmaydi. Agar VPN ishlatayotgan boʻlsangiz, vaqtni VPN server joylashuvi bilan sinxronlashtiring.",
          instructions:{
            chrome:{action:"Vaqt zonasini VPN bilan sinxronlashtiring",detail:"Tizim vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            firefox:{action:"Vaqt zonasini VPN bilan sinxronlashtiring",detail:"Tizim vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            brave:{action:"Vaqt zonasini VPN bilan sinxronlashtiring",detail:"Tizim vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"},
            safari:{action:"Vaqt zonasini VPN bilan sinxronlashtiring",detail:"Tizim vaqt zonangiz bilan bir xil mamlakatdagi VPN serverni tanlang"}
          }
        }
      },
      general:[
        {
          title:"uBlock Origin oʻrnating",
          body:"Reklama trekerlarini, piksellarni va kuzatuv skriptlarini bloklaydi.",
          instructions:{
            chrome:{action:"Chrome Web Store dan oʻrnating",link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            firefox:{action:"Firefox Add-ons dan oʻrnating",link:{text:'Firefox Add-ons',url:'https://addons.mozilla.org/firefox/addon/ublock-origin/'}},
            brave:{action:"Chrome Web Store dan oʻrnating",link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            safari:{action:"Muqobil — Safari uchun AdGuard oʻrnating",link:{text:'App Store',url:'https://apps.apple.com/app/adguard-for-safari/id1440147259'}}
          },
          level:'easy'
        },
        {
          title:"Alohida brauzer profillaridan foydalaning",
          body:"Ish, xaridlar, shaxsiy — turli profillarda. Signallar aralashmaydi.",
          instructions:{
            chrome:{action:"Yangi profil yarating",detail:"Uch nuqta → Odamlar → Profil qoʻshish"},
            firefox:{action:"Yangi profil yarating",detail:'about:profiles → Create a New Profile'},
            brave:{action:"Yangi profil yarating",detail:"Uch nuqta → Odamlar → Profil qoʻshish"},
            safari:{action:"Safari profillarni qoʻllab-quvvatlamaydi",note:"Turli vazifalar uchun turli brauzerlardan foydalaning"}
          },
          level:'easy'
        },
        {
          title:"Brauzer maʻlumotlarini vaqti-vaqti bilan tozalang",
          body:"Cookie, localStorage va kesh — uchta turli xotira. Uchtasini ham tozalang.",
          instructions:{
            chrome:{action:"Maʻlumotlarni tozalang",detail:"Ctrl+Shift+Delete → hammasini tanlang → tozalang"},
            firefox:{action:"Maʻlumotlarni tozalang",detail:"Ctrl+Shift+Delete → hammasini tanlang → tozalang"},
            brave:{action:"Maʻlumotlarni tozalang",detail:"Ctrl+Shift+Delete → hammasini tanlang → tozalang"},
            safari:{action:"Maʻlumotlarni tozalang",detail:"Safari → Tarixni tozalash → Barcha tarix"}
          },
          level:'easy'
        },
        {
          title:"Asosiy himoya bilan Firefox ga oʻting",
          body:"Firefox + uchta sozlama qulaylikni yoʻqotmasdan jiddiy himoyani taʻminlaydi.",
          instructions:{
            chrome:{action:"Firefox ni yuklab oling va himoyani sozlang",detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            firefox:{action:"Kengaytirilgan himoyani yoqing",detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            brave:{action:"Brave allaqachon shunga oʻxshash himoyani taʻminlaydi",note:"Firefox — moslashuvchan sozlamali muqobil"},
            safari:{action:"Ilgʻor himoya uchun Firefox ni yuklab oling",detail:'about:config → privacy.resistFingerprinting → true'}
          },
          level:'medium'
        },
        {
          title:"Ishonchli VPN dan foydalaning",
          body:"IP va provayderni yashiradi. Loglarsiz xizmatni tanlang.",
          instructions:{
            chrome:{action:"Tavsiya etilgan VPN xizmatlari",detail:'Mullvad (mullvad.net) yoki ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            firefox:{action:"Tavsiya etilgan VPN xizmatlari",detail:'Mullvad (mullvad.net) yoki ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            brave:{action:"Tavsiya etilgan VPN xizmatlari",detail:'Mullvad (mullvad.net) yoki ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            safari:{action:"Tavsiya etilgan VPN xizmatlari",detail:'Mullvad (mullvad.net) yoki ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}}
          },
          expandDetail:"<b>VPN tanlashda nimaga eʻtibor berish kerak:</b><ul style=\"margin:8px 0 0 16px;padding:0\"><li>No-logs siyosati — provayder hech narsa saqlamasa, topshiradigan narsa yoʻq</li><li>Kill-switch — VPN uzilganda tarmoqni oʻchiradi</li><li>Yurisdiksiya — xizmatga maʼlumotlarni oshkor qilishdan bosh tortish imkonini beradi</li><li>Trafik obfuskatsiyasi — VPN ishlatishni provayderdan yashiradi</li><li>Turli mamlakatlarda serverlar</li><li>Mustaqil xavfsizlik auditi natijalari</li></ul>",
          level:'medium'
        },
        {
          title:"Maksimal anonimlik uchun — Tor Browser",
          body:"Barcha Tor Browser foydalanuvchilari bir xil koʻrinadi. Sekinroq, lekin barmoq izini toʻliq normallaydi.",
          instructions:{
            chrome:{action:"Tor Browser ni yuklab oling",link:{text:'torproject.org',url:'https://www.torproject.org'}},
            firefox:{action:"Tor Browser ni yuklab oling",link:{text:'torproject.org',url:'https://www.torproject.org'}},
            brave:{action:"Tor Brave da ichki mavjud",detail:"Yangi maxfiy oyna Tor bilan",note:"Yoki torproject.org dan toʻliq Tor Browser ni yuklab oling"},
            safari:{action:"Tor Browser ni yuklab oling",link:{text:'torproject.org',url:'https://www.torproject.org'}}
          },
          level:'hard'
        }
      ]
    },
    detailTitle:"Mutaxassislar uchun tafsilotlar",
    networkTitle:"Tarmoq tahlili",
    networkDesc:"IP-manzilingiz, provayder, VPN holati va ulanish tezligini aniqlaymiz. Soʻrovlar faqat siz bosganda ketadi: serverimizga, u esa ipquery.io va Google DNS dan soʻraydi.",
    networkButton:"Tarmoqni tekshirish",
    networkLoading:"Tekshirilmoqda...",
    networkRecheck:"Qayta tekshirish",
    osintLoading:"Ochiq bazalar tekshirilmoqda...",
    serverFpTitle:"Server barmoq izi",
    serverFpDesc:"Bu JavaScript ishga tushishidan oldin har qanday server koʻradigan narsa: TLS versiyasi, HTTP protokoli, sarlavhalar tartibi va brauzer Client Hints. Bularni JavaScript yordamida yashirib boʻlmaydi.",
    serverFp:{tls:"TLS",http:"HTTP protokoli",headerHash:"Sarlavha xeshi",headerOrder:"Sarlavhalar tartibi",chPlatform:"CH: Platforma",chMobile:"CH: Mobil",chBrowser:"CH: Brauzer",asn:"ASN",org:"Tashkilot"},
    monitorText:{
      single:'1 ta ekran',
      multi:count=>`${count} ta ekran`,
      unknown:'ekranlar soni ko‘rsatilmagan'
    },
    permNames:{
      geolocation:'geolokatsiya',
      notifications:'bildirishnomalar',
      camera:'kamera',
      microphone:'mikrofon',
      'clipboard-read':'buf. xotiradan o‘qish',
      'clipboard-write':'buf. xotiraga yozish',
      'persistent-storage':'doimiy xotira'
    },
    permStates:{granted:'✅ ruxsat berilgan',denied:'❌ bloklangan',prompt:'so‘rov bo‘yicha',unknown:'maʼlumot yo‘q'},
    pointerLabels:{fine:'sichqoncha/trekpad',coarse:'sensor ekran',none:'maʼlumot yo‘q'},
    dntStatus:{on:'yoqilgan',off:'o‘chirilgan',unknown:'brauzer maʼlumot bermadi'},
    memoryNote:'brauzer qiymatlarni taxmin qiladi, haqiqiy RAM boshqacha bo‘lishi mumkin',
    saveButton:'Chop etish / Saqlash',
    shareButton:'Natijani ulashish',
    share:{
      unavailable:'Hisob yakunlanishini kuting…',
      title:({pct})=>`Qanchalik anonim ekansiz? ${Math.round(pct)}% daraja`,
      tagline:'Saytlar siz haqingizda nimalarni tezda bilishini ko‘ring',
      text:({pct,url})=>`Mening raqamli izi foydalanuvchilarning ${Math.round(pct)}% qismidan ham noyob. Saytlar siz haqingizda nimalarni bir zumda bilishini ko‘ring — ${url||CANONICAL_URL}`,
      shared:'Ulashildi — rahmat!',
      copied:'Havola nusxalandi',
      error:'Avtomatik ulashib boʻlmadi. Havolani qoʻlda nusxalab koʻring.',
      aria:({pct})=>`Natijani ulashish: foydalanuvchilarning ${Math.round(pct)}% qismidan ham noyob`
    },
    copy:{hint:'Nusxa olish uchun bosing',done:'Nusxalandi'},
    examplePrefix:'Misol:',
    advicePrefix:'💡 Maslahat:',
    methodologyButton:"Foiz qanday hisoblanadi?",
    methodSummary:'<b>Natija qanday olinadi</b>',
    methodText:'<p><b>Nimani oʻlchaymiz</b></p><p>Brauzeringiz har bir saytga 21\u00A0ta parametrni uzatadi: brauzer turi, OT, ekran oʻlchami, videokarta, protsessor yadrolari, xotira, tillar, kengaytmalar, grafik va audio izlar, shriftlar va boshqalar.</p><p><b>Qanday baholaymiz</b></p><p>Har bir parametr uchun uning qanchalik kam uchraydigani tekshiriladi. Windows’da Chrome\u00A0— juda keng tarqalgan. Noodatiy GPU bilan eski Firefox\u00A0— noyoblik, siz ajralib turasiz.</p><p>Noyob parametrlar qancha koʻp boʻlsa\u00A0— ball shuncha yuqori.</p><p><b>Maʼlumot qayerdan</b></p><p>Ehtimolliklar EFF\u00A0Panopticlick va FingerprintJS ochiq tadqiqotlariga asoslangan. Signallar orasidagi bogʻliqliklar ham hisobga olinadi.</p><p><b>Foiz nimani anglatadi</b></p><p>25\u00A0000\u00A0ta virtual brauzer modellashtiriladi va sizning natijangiz ular bilan taqqoslanadi. Agar 85% boʻlsa\u00A0— sizning izingiz modellashtirilgan foydalanuvchilarning 85% dan noyobroq.</p><p style="opacity:.7;font-size:13px">Ball brauzeringizda hisoblanadi: uning parametrlari hech qayerga yuborilmaydi.</p>',
    batteryUnavailable:'Bu brauzerda mavjud emas',
    footer:version=>`© <a href="${PERSONAL_URL}" target="_blank" rel="noopener">morgunov.tech</a> • Mahalliy fingerprint audit • <button id="versionBtn" class="btn version-btn" title="Oʻzgarishlar tarixi">v${version}</button><br><span class="footer-note">Cloudflare’da joylashtirilgan. Cloudflare Web Analytics anonim tashrif statistikasini yigʻadi (cookie va shaxsiy maʼlumotlarsiz).</span><br><span id="footerVisitCount" class="footer-note" style="display:none"></span>`,
    errorMessage:msg=>`Xatolik: ${msg}`,
    units:{cores:'yadro',gb:'GB',mbps:'Mbit/s',ms:'ms',yes:'ha',no:'yo‘q'},
    labels:{touchPoints:'sensor nuqtalari',pointer:'ko‘rsatkich',latency:'kechikish',storage:{local:'Mahalliy saqlash',session:'Sessiya saqlashi',idb:'IndexedDB',cookies:'Cookie'}},
    formatFullness:(filled,total)=>`${Math.round(100*filled/Math.max(1,total))}% maʼlumot to‘ldirilган (${filled} / ~${total})`,
    story:{
      toggleStory:'📖 Hikoya',
      toggleReport:'📊 Hisobot',
      stage:'Bosqich',
      dangerTitle:'⚠️ Bu nima uchun xavfli',
      actionTitle:'🛡️ Nima qilish kerak',
      whoSees:'Buni kim ko‘rinadi:',
      difficulty:{easy:'Oson',medium:'O‘rtacha',hard:'Qiyin'},
      rows:{device:'Qurilma',screen:'Ekran',gpu:'GPU',dpr:'DPR',ip:'IP',isp:'Provayder',vpn:'VPN/proksi',browser:'Brauzer',dnt:'DNT',gpc:'GPC',tls:'TLS',cipher:'Shifr',acceptLanguage:'Accept-Language',ua:'UA',canvas:'Canvas',audio:'Audio',webgl:'WebGL',webrtc:'WebRTC oqishi',trackers:'Bloklangan trekerlar'},
      on:'yoq.',off:'o‘ch.',yes:'⚠️ ha',no:'yo‘q',notChecked:'tekshirilmagan',needsNetwork:'«Tarmoqni tekshirish» tugmasini bosing',
      s0:{
        title:'Siz noutbukni ochdingiz',
        subtitle:'Internetga chiqmasdan oldin qurilmangiz allaqachon noyobdir',
        who:'Hali hech kim — lekin bir daqiqadan so‘ng har qanday sayt buni biladi',
        youtube:function(dev,scr,gpu){return 'Siz hali YouTubeʻni ham ochmadingiz, lekin '+dev+' qurilmangiz '+scr+' ekran bilan allaqachon ko‘pchilik foydalanuvchilar orasida ajralib turadi.';},
        danger:'Qurilma xususiyatlari kombinatsiyasi allaqachon noyobdir. Sayt ismingizni bilmaydi, lekin siz ma‘lum narx toifasidagi qurilma egasi ekanligingizni biladi. Bu narx diskriminatsiyasi uchun ishlatiladi: aviachiptalar, mehmonxonalar, obunalar qimmat qurilmada qimmatroq bo‘lishi mumkin.',
        action:'<ul><li>Firefoxʻda Letterboxing rejimini yoqing (resistFingerprinting)</li><li>Brave Browserʻni ko‘rib chiqing — hardware parametrlarini tasodifiy qiladi</li><li>Chrome: Canvas Blocker / Trace kengaytmasi</li><li>Qurilmani to‘liq yashirish mumkin emas, lekin kamroq noyob qilish mumkin</li></ul>',
        actionDiff:'medium'
      },
      s1:{
        title:'Siz Wi-Fiʻga ulandingiz',
        subtitle:'Provayder siz tarmoqda ekanligingizni allaqachon biladi',
        who:'Internet provayder (ISP), Wi-Fi nuqtasi egasi',
        youtube:function(isp,ip){return 'Siz youtube.comʻni kiritganingizda, '+isp+' provayderi buni loglarga yozadi. U videoni ko‘rmaidi, lekin siz o‘sha vaqtda YouTubeʻga kirganingizni biladi.';},
        danger:'Provayder domenlarning to‘liq logini saqlaydi. Ko‘p mamlakatlarda uni 6 oydan 3 yilgacha saqlash shart. Wi-Fi egasi ham xuddi shunini ko‘radi. IP-manzil turli saytlardagi harakatlarni bog‘laydi.',
        action:'<ul><li>Ishonchli provayderdan VPN (Mullvad, ProtonVPN, IVPN)</li><li>Tor Browser — maksimal anonimlashtirish</li><li>DNS-over-HTTPS — domenlarni provayderdan yashiradi</li><li>VPNsiz jamoat Wi-Fiʻidan foydalanmang</li></ul>',
        actionDiff:'easy'
      },
      s2:{
        title:'Siz brauzerni ochdingiz',
        subtitle:'Brauzer allaqachon noyob xususiyatlar to‘plamini o‘zida saqlaydi',
        who:'Hozircha faqat brauzer — lekin hammasi birinchi saytga uzatiladi',
        youtube:function(br,dnt,gpc){return 'Siz hali youtube.comʻni kiritmadingiz, lekin '+br+' brauzeri allaqachon o‘z belgilar to‘plamini ochib beradi'+(dnt?', Do Not Track yoqilgan':'')+(gpc?', GPC yoqilgan':'')+'. Bu kombinatsiya barmoq izi kabidir.';},
        danger:'3-5 ta kengaytma kombinatsiyasi millionlab foydalanuvchilar orasida noyob bo‘lishi mumkin. Do Not Trackʻni yoqish paradoksal ravishda sizni ko‘zga ko‘rinarliroq qiladi.',
        action:'<ul><li>Kengaytmalar sonini minimallashtiring</li><li>Mashhur kengaytmalardan foydalaning (uBlock Origin, Bitwarden)</li><li>Sozlamalarda keraksiz ruxsatlarni bekor qiling</li><li>Maxfiy vazifalar uchun alohida brauzer profilini ko‘rib chiqing</li></ul>',
        actionDiff:'easy'
      },
      s3:{
        title:'Siz youtube.comʻni kiritdingiz',
        subtitle:'Kimdir siz YouTubeʻni ochmoqchi ekanligingizni bildi',
        who:'DNS-provayder — domenni IP-manzilga tarjima qiluvchi. Standart bo‘yicha — ISP',
        youtube:'Siz youtube.comʻni kiritdingiz va Enterʻni bosdingiz. O‘sha zahoti DNS-server so‘rov oldi: YouTube IP-manzilini ko‘rsat. U qaysi videoni tomosha qilishingizni bilmaydi, lekin loglarida IP va vaqt yozuvi paydo bo‘ldi.',
        danger:'DNS-log — manfaatlarning to‘liq xaritasi. youtube.com → webmd.com → linkedin.com — DNS-server zanjirni ko‘radi. Ba‘zi jurisdiktsiyalarda DNS-loglar senzura uchun ishlatiladi.',
        action:'<ul><li>DNS-over-HTTPSʻni yoqing: Chrome → Sozlamalar → Xavfsizlik</li><li>Logsiz DNS-provayder: Cloudflare (1.1.1.1), Quad9 (9.9.9.9), NextDNS</li><li>VPN bu muammoni avtomatik hal qiladi</li></ul>',
        actionDiff:'easy',
        isInfo:true
      },
      s4:{
        title:'Brauzer YouTube serveriga ulanmoqda',
        subtitle:'Server sahifa yuklanishidan oldin sizning uslubingizni bildi',
        who:'YouTube serveri va har qanday vositachi — korporativ proksi, provayder DPI',
        youtube:function(tls){return 'Brauzer YouTube serveri bilan '+tls+' orqali ulanadi — va bu salomlashish usuli xat yozish uslubi kabi noyobdir. IPʻni o‘zgartiring, cookieʻlarni tozalang — TLS-izi bir xil qoladi.';},
        danger:'TLS-izi IP, VPN o‘zgartirilganda yoki cookieʻlar tozalanganda o‘zgarmaydi. DPI-tizimlari VPN-protokollarni aniqlash va bloklash uchun TLS fingerprintingʻdan foydalanadi.',
        action:'<ul><li>Tor Browser TLS-izini standartlashtiradi</li><li>Firefox + privacy.resistFingerprinting qisman normallashtiradi</li><li>Brauzerni muntazam yangilab turing</li><li>Oddiy Chrome/Safari/Edgeʻda nazorat yo‘q</li></ul>',
        actionDiff:'hard'
      },
      s5:{
        title:'YouTube so‘rovingizni oldi',
        subtitle:'Server allaqachon tilingizni, OTʻni va qayerdan kelganingizni biladi',
        who:'Sayt egasi — server loglarida. Bu ISTALGAN saytning ISTALGAN egasi ko‘radi',
        youtube:function(langs){return 'YouTube o‘qidi: Accept-Language: '+langs+'. Endi u til profilingizni biladi. Siz buni kiritmadingiz — brauzer o‘zi yubordi.';},
        danger:'Accept-Language milliyatni oshkor qiladi. Referer qayerdan kelganingizni aytadi. Sarlavhalar tartibi — noaniq, lekin kuchli identifikator.',
        action:'<ul><li>Tillar ro‘xatini minimallashtiring — 1-2 ta qoldiring (en-US, en)</li><li>Referer nazorati: Firefox — network.http.referer.XOriginPolicy = 2</li><li>Tor Browser sarlavhalarni standartlashtiradi</li></ul>',
        actionDiff:'medium'
      },
      s6:{
        title:'YouTube yuklandi va skriptlarni ishga tushirdi',
        subtitle:'Ko‘rinmas testlar allaqachon boshlandi — ayni hozir',
        who:'YouTube (Google) va skriptli har qanday sayt',
        youtube:function(canvas,audio){return 'Siz video tomosha qilayotganingizda, YouTube fonda ko‘rinmas rasm chizadi (Canvas: '+canvas+'), ovozisiz tovush ijro etadi (Audio: '+audio+') va yashirin 3D-obyekt renderlaydi.';},
        danger:'Canvas/Audio/WebGL barmoq izi — cookieʻsiz kuzatishning asosiy vositasi. Tarixni tozaladingiz, hisobni o‘zgartirdingiz — iz avvalgidek. WebRTC-sizintisi: sayt VPNʻni chetlab o‘tib haqiqiy IP-ni oladi.',
        action:'<ul><li><b>Canvas</b>: CanvasBlocker (Firefox), Brave — o‘zida mavjud</li><li><b>Audio</b>: Firefox + resistFingerprinting bloklaydi</li><li><b>WebGL</b>: o‘chirish mumkin (webgl.disabled = true)</li><li><b>WebRTC</b>: Firefox — media.peerconnection.enabled = false</li><li><b>Battery</b>: Firefox va Brave APIʻni cheklaydi</li></ul>',
        actionDiff:'medium'
      },
      s7:{
        title:'Sizni yana 10+ kompaniya kuzatyapti',
        subtitle:'Reklama tarmoqlari sizni faqat YouTubeʻda emas — minglab saytlarda ko‘radi',
        who:'Reklama tarmoqlari (Google Ads, Meta Pixel, Criteo), analitika, ijtimoiy vidjetlar',
        youtube:function(blocked,total){return 'YouTube — bu Google. Lekin Google skriptlari aksariyat saytlarda mavjud. Ertalab — ta‘mirlash videosi. Kunduz — qurilish do‘koni. Kechqurun — ipoteka kalkulyatori.'+(blocked>0?' Blokeringiz '+blocked+' ta tekshirishni bloklaidi.':' Brauzeringiz birorta kuzatuvchini bloklamadi.');},
        danger:'Odatiy sahifada o‘nlab begona skriptlar mavjud. Har biri iz yig‘adi. Broker sizib chiqishlarida moliyaviy qiyinchiliklar va sog‘liq muammolari teglari bilan profillar topilgan.',
        action:'<ul><li><b>uBlock Origin</b> — oltin standart. Majburiy</li><li>uBlockʻda qo‘shimcha ro‘xatlar: Annoyances va Privacy</li><li>Firefox: Enhanced Tracking Protection → Strict</li><li>Brave: bloker o‘zida mavjud</li><li>Firefox Multi-Account Containers — saytlarni ajratadi</li></ul>',
        actionDiff:'easy'
      },
      verdict:{
        title:'To‘liq rasm',
        subtitle:'Raqamli barmoq izingiz — qurilmani yoqishdan video tomosha qilishgacha',
        now:'Hoziroq (5 daqiqa):',
        nowList:['uBlock Originʻni o‘rnatish','Brauzerni sozlamalarida DNS-over-HTTPSʻni yoqish','Keraksiz saytlardan kamera/mikrofon/joylashuvni bekor qilish'],
        weekend:'Dam olish kuni (30 daqiqa):',
        weekendList:['VPN sozlash (Mullvad / ProtonVPN)','WebRTC sizintisini o‘chirish','CanvasBlocker o‘rnatish yoki Braveʻga o‘tish'],
        advanced:'Rivojlangan foydalanuvchilar uchun:',
        advancedList:['Muhim vazifalar uchun Tor Browser','Firefox + resistFingerprinting','Turli vazifalar uchun alohida brauzerlar']
      }
    },
    introRichHtml:/* html */`
      <section class="fp-section" lang="uz" aria-labelledby="fp-title">
        <p>
          Har bir brauzer noyob iz qoldiradi — texnik xususiyatlar toʻplami,
          saytlar uni jimgina, soʻramasdan va ruxsatingizsiz oʻqiydi.
          Bu raqamli barmoq izi deb ataladi. Servis hozir siz haqingizda nimalar
          koʻrinishini koʻrsatadi va xatarlarni qanday kamaytirish mumkinligini tushuntiradi.
        </p>
        <details>
          <summary class="intro-more">Kuzatuv va xavflar haqida batafsil ▾</summary>
          <h3>Cookielarsiz kuzatuv qanday ishlaydi</h3>
          <p>
            Siz oʻnlab saytlarga roʻyxatdan oʻtmasdan kirdingiz — hammada bir xil iz qoldirdingiz.
            Keyin ulardan birida akkaunt yaratdingiz. Endi reklama tarmoqlari
            barcha oldingi tashriflarni ismingiz bilan bogʻlab, bu profilni sotishi mumkin.
          </p>
          <h3>Bu nima uchun xavfli</h3>
          <ul class="fp-list">
            <li>Doʻkonlar qurilma va toʻlov qobiliyatingizni bilib narxlarni oshiradi.</li>
            <li>Firibgarlar shahar, provayder va qurilmangizni biladi — fishing aniqroq boʻladi.</li>
            <li>Sugʻurta kompaniyalari va ish beruvchilar maʼlumot brokerlaridan profillar sotib oladi.</li>
            <li>Maʼlumotlar bazasi sizib chiqqandan keyin profilni «oʻchirish» mumkin emas.</li>
          </ul>
          <h3>Maʼlumotlar qanday ishlanadi</h3>
          <p>
            Barmoq izi, noyoblik bahosi va profil brauzeringizda hisoblanadi — sahifa ularni yubormaydi,
            hech qanday uchinchi tomon ularni koʻrmaydi. Xizmat bepul, reklama va roʻyxatdan oʻtishsiz. Tarmoqqa nima ketadi:
          </p>
          <ul class="fp-list">
            <li>Sahifa ochilganda — Cloudflare’dagi serverimizdan umumiy statistika soʻraladi, Cloudflare Web Analytics
              esa koʻrishni cookiesiz hisoblaydi. Har qanday server kabi ular IP-manzilingiz va brauzeringizni koʻradi.</li>
            <li>«Tarmoqni tekshirish» bosilganda — serverimizga soʻrovlar ketadi. U IP, provayder va sarlavhalaringizni
              koʻrsatadi, tezlikni oʻlchaydi va IP-ni ipquery.io (zaxira — ipinfo.io) va Google DNS orqali tekshiradi.
              Hisobot IP-ingiz boʻyicha bir soat saqlanadi; anonim statistikaga (brauzer, OT, mamlakat) IP tushmaydi.
              Serverimiz ishlamasa, brauzer ochiq IP xizmatlaridan toʻgʻridan-toʻgʻri soʻraydi
              (ipapi.co, freeipapi.com, ipify.org, myip.com).</li>
          </ul>
        </details>
      </section>
    `,
    shock:{title:'Sayt siz haqingizda nimalarni biladi'},
    heroConclusion:{
      high:'Sizni oson tanish mumkin. Siz kirgan saytlar roʻyxatdan oʻtmasdan ham sizni aniqlashi mumkin. Pastda buni oʻzgartiradigan oddiy qadamlar bor.',
      med:'Sizni aniqlash mumkin, lekin darhol emas. Brauzeringiz ajralib turadi, lekin noyob emas. Bir necha oddiy qadam koʻrinmasroq boʻlishga yordam beradi.',
      low:'Sizni tanish qiyin. Brauzeringiz boshqalarga oʻxshaydi — saytlar sizni ajrata olmaydi. Yaxshi natija.'
    },
    meta:{title:'Fingerprint — internetda qanchalik anonimsiz',description:'Saytlar hozir sizning qanday maʼlumotlaringizni koʻrayotganini koʻrsatamiz, barmoq izingiz noyobligini baholaymiz va maxfiylik boʻyicha maslahatlar beramiz.'},
    rows:{
      location:'Joylashuv',date:'Sana',time:'Vaqt',timezone:'Vaqt zonasi',languages:'Tillar',device:'Qurilma',ram:'💾 RAM',battery:'🔋 Batareya',charging:', quvvat olmoqda',
      browser:'Brauzer',permissions:'Ruxsatlar',ip:'Sizning IP manzilingiz',isp:'Provayder',connectionType:'Turi',vpn:'VPN',webrtc:'WebRTC',browserData:'Brauzer maʼlumotlari',
      detected:'Aniqlangan',notDetected:'Aniqlanmagan',leak:'Oqish: ',safe:'Xavfsiz',unavailable:'Mavjud emas',looksNatural:'Tabiiy koʻrinadi',inconsistencies:'Nomuvofiqliklar aniqlandi',
      perms:{camera:'kamera',microphone:'mikrofon',geolocation:'geolokatsiya'},
      connection:{wifi:'Wi-Fi',cellular:'Mobil tarmoq',ethernet:'Kabel',bluetooth:'Bluetooth'}
    },
    deviceNames:{
      androidFlagship:'Android-flagman smartfon',androidPhone:'Android-smartfon',androidTablet:'Android-planshet',androidDevice:'Android-qurilma',
      windowsWorkstation:'kuchli Windows ish stantsiyasi',windowsPowerful:'kuchli Windows-kompyuter',windowsPc:'Windows-kompyuter',windowsLaptop:'Windows-noutbuk',windowsBudget:'byudjetli Windows-kompyuter',linux:'Linux-tizim'
    },
    osint:{isp:'Provayder',asn:'ASN',type:'Ulanish turi',rep:'IP reputatsiyasi',
      connection:{residential:'Uy ulanishi',datacenter:'Data markaz (shubhali)',vpn:'VPN/Proksi',mobile:'Mobil tarmoq'},
      clean:n=>`✅ IP manzilingiz toza — hech qanday qora roʻyxatda topilmadi (${n} baza tekshirildi)`,
      listed:hits=>`⚠️ IP manzilingiz qora roʻyxatlarda topildi: ${hits}. Bu IP manzilingiz avval spam uchun ishlatilgan boʻlishi mumkinligini anglatadi.`,
      error:'IP ni ochiq bazalar boʻyicha tekshirib boʻlmadi'},
    networkError:'Tarmoqni tekshirib boʻlmadi',
    speedTest:{testing:'Tekshirilmoqda...',failed:'Xatolik',latency:'Kechikish'},
    contradictions:{
      title:"Izchillikni tekshirish",
      consistent:"Maʼlumotlar mos",
      discrepancies:"Nomuvofiqliklar topildi",
      significant:"Jiddiy nomuvofiqliklar",
      timezone:"Vaqt mintaqasi",
      platform:"Platforma",
      browser:"Brauzer",
      uaConsistency:"UA vs Client Hints",
      clientSide:"Brauzer",
      eduTitle:"Bu nima degani?",
      eduText:"Server va klient maʼlumotlari oʻrtasidagi tafovutlar VPN, proksi, emulator yoki barmoq izi almashtirish vositalaridan foydalanishni koʻrsatishi mumkin. Veb-saytlar botlar va firibgarlarni aniqlash uchun bu nomuvofiqliklardan foydalanadi."
    },
    relevantBadge:'⚡ Siz uchun dolzarb',
    moreRecs:'Boshqa tavsiyalar',
    vpnMore:'VPN tanlash haqida batafsil',
    statVisitors:pct=>`${pct}% tashrif buyuruvchilardan`,
    footerVisits:n=>`${n} barmoq izi tekshirildi`,
    changelogTitle:'Oʻzgarishlar tarixi'
};
