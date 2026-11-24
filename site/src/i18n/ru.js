// Russian strings of the page. Keys are the same in ru.js, en.js and uz.js; selftest.js checks that.
import { PERSONAL_URL, CANONICAL_URL } from '../config.js';

export default {
    langButton:'Язык',
    langLabels:{ru:'Русский',en:'Английский',uz:'Узбекский'},
    theme:{label:'Тема',modes:{auto:'Авто',light:'Светлая',dark:'Тёмная',contrast:'Контраст'}},
    introTitle:'«Цифровой отпечаток»: что о вас знают сайты',
    uniqHeadline:{'high':'Ваш отпечаток уникальнее, чем у большинства пользователей','med':'Ваш отпечаток заметнее среднего','low':'Ваш отпечаток близок к среднему'},
    trackers:{
      title:'Защита от трекеров',
      description:'Мы имитируем типичные методы слежки (рекламные пиксели, скрипты аналитики, рекламные фреймы) и проверяем, блокирует ли ваш браузер или расширения эти элементы. Чем больше заблокировано — тем лучше защищена ваша приватность.',
      pixel:{name:'Рекламный пиксель',blocked:'Заблокирован',open:'Не заблокирован'},
      pixelExplain:'Невидимые картинки 1×1 пиксель, которые рекламные сети встраивают в страницы для отслеживания ваших визитов',
      analytics:{name:'Скрипт аналитики',blocked:'Заблокирован',open:'Не заблокирован'},
      analyticsExplain:'Скрипты вроде Google Analytics, которые собирают данные о вашем поведении на сайте',
      iframe:{name:'Рекламный фрейм',blocked:'Заблокирован',open:'Не заблокирован'},
      iframeExplain:'Встроенные рекламные блоки, которые загружают контент с серверов рекламных сетей',
      dnt:{name:'Do Not Track',blocked:'Включён',open:'Выключен'},
      dntExplain:'Сигнал браузера, просящий сайты не отслеживать вас (большинство сайтов его игнорируют)',
      gpc:{name:'Global Privacy Control',blocked:'Включён',open:'Выключен'},
      gpcExplain:'Юридически обязывающий сигнал приватности, поддерживаемый законодательством некоторых стран',
      verdict:function(blocked,total){
        if(blocked>=5) return '✅ Отличная защита! Все проверенные трекеры заблокированы (' + blocked + ' из ' + total + ').';
        if(blocked>=3) return 'Хорошая защита. Большинство трекеров заблокированы (' + blocked + ' из ' + total + '). Проверьте оставшиеся незаблокированные элементы.';
        if(blocked>=1) return 'Частичная защита (' + blocked + ' из ' + total + '). Ваш браузер блокирует некоторые трекеры, но не все. Для полной защиты рекомендуем uBlock Origin.';
        return 'Ваш браузер не блокирует ни один трекер (0 из ' + total + '). Сайты могут отслеживать каждый ваш визит с помощью рекламных пикселей, скриптов аналитики и рекламных фреймов. Рекомендуем установить uBlock Origin — это бесплатное расширение, которое решит большинство проблем.';
      }
    },
    implications:{
      problemTitle:'Что происходит с вашими данными',
      problemText:'<p>Каждый раз, когда вы открываете сайт, браузер автоматически передаёт десятки характеристик — без вашего разрешения и без всплывающих окон. Сайты не хранят этот отпечаток у себя — они передают его рекламным сетям.</p><p>Рекламная сеть может присутствовать сразу на миллионах сайтов. Это значит, что один невидимый трекер молча следит за вами везде, где вы бываете в интернете — и собирает полную историю ваших интересов, покупок, маршрутов и привычек.</p><p>Этот профиль не удаляется, когда вы чистите cookies. Он не исчезает в режиме инкогнито. Он существует, пока существует ваш браузер и устройство.</p>',
      risksTitle:'Чем это опасно лично для вас',
      risks:[
        {icon:'💸',title:'Вы платите больше, чем другие',body:'Интернет-магазины и сервисы бронирования видят вашу модель устройства, браузер и поведение. Пользователям MacBook нередко показывают более высокие цены на авиабилеты и отели, чем пользователям бюджетных Android-устройств — это ценовая дискриминация, и она законна в большинстве стран.'},
        {icon:'🎯',title:'Реклама знает о вас больше, чем ваши друзья',body:'На основе отпечатка рекламные системы знают, какие сайты вы посещали, что искали, когда не спали ночью и какие темы вас беспокоят. Эти данные используются не только для рекламы — страховые компании и работодатели покупают профили у брокеров данных.'},
        {icon:'🎣',title:'Мошенничество становится точнее',body:'Мошенники, купившие базу с вашим профилем, знают ваш город, провайдера, устройство и язык. Письмо, в котором упоминается ваш MacBook или аккаунт вашего провайдера, выглядит убедительно — именно так работают целевые мошеннические атаки.'},
        {icon:'🔓',title:'Режим инкогнито вас не защищает',body:'Большинство пользователей верят, что инкогнито = анонимность. Это не так. Режим инкогнито скрывает историю только от других людей на вашем устройстве. Ваш отпечаток, IP и все сигналы при этом остаются прежними — сайты видят вас точно так же. Инкогнито стирает историю, куки и кэш при завершении сессии — на этом всё. Он не скрывает ваш цифровой отпечаток, не шифрует трафик, не маскирует IP-адрес и сохраняет загруженные файлы.'},
        {icon:'🗂️',title:'Ваш профиль существует без вашего ведома — и утечка навсегда',body:'Прямо сейчас в базах данных брокеров данных (Acxiom, Oracle Data Cloud, Nielsen и др.) существует файл с вашими интересами, маршрутами, покупками и предполагаемым доходом. Вы не давали на это согласие. Вы не можете его удалить. В 2023–2024 годах произошли тысячи утечек данных из рекламных платформ. Если профиль с вашим отпечатком утёк — его не отозвать. Мошенники годами используют старые базы для целевых атак.'},
        {icon:'🔐',title:'VPN не гарантирует вашу приватность',body:'VPN помогает скрыть трафик и подменить IP, но не прячет ваш цифровой отпечаток. Провайдер видит, что вы используете VPN. Некоторые VPN-сервисы хранят данные о ваших действиях, и доступ к ним может быть получен по запросу или через утечку.'}
      ],
      stepsTitle:'Что сделать прямо сейчас',
      personalTitle:'На основе вашего отпечатка',
      generalTitle:'Полезно всем — независимо от результатов',
      levelLabels:{easy:'🟢 легко',medium:'🟡 средне',hard:'🔴 сложно'},
      altPrefix:'Или: ',
      personal:{
        canvas:{
          title:'Защитите графический отпечаток',
          problem:'Ваш браузер рисует картинки уникально — по этому хэшу вас узнают даже без cookies.',
          instructions:{
            chrome:{action:'Установите расширение CanvasBlocker',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/canvas%20blocker'}},
            firefox:{action:'Включите privacy.resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Проверьте, что защита включена',detail:'Shields → Fingerprinting → Strict',note:'Brave защищает от canvas-трекинга по умолчанию'},
            safari:{action:'Safari частично защищает от canvas-трекинга',note:'Встроенная защита Intelligent Tracking Prevention'}
          },
          alternative:'В Brave эта защита встроена и работает без расширений.'
        },
        plugins:{
          title:'Сократите количество расширений',
          problem:function(n){return 'У вас '+n+' расширений — нестандартный набор делает ваш профиль легко узнаваемым.';},
          instructions:{
            chrome:{action:'Откройте менеджер расширений и отключите ненужные',detail:'chrome://extensions'},
            firefox:{action:'Откройте менеджер дополнений и отключите ненужные',detail:'about:addons'},
            brave:{action:'Откройте менеджер расширений и отключите ненужные',detail:'brave://extensions'},
            safari:{action:'Откройте настройки расширений',detail:'Safari → Настройки → Расширения'}
          }
        },
        permissions:{
          title:'Отзовите ненужные разрешения',
          problem:'Камера или микрофон разрешены — сайт может активировать их без повторного запроса.',
          instructions:{
            chrome:{action:'Проверьте и отзовите разрешения',detail:'chrome://settings/content'},
            firefox:{action:'Проверьте и отзовите разрешения',detail:'about:preferences#privacy → Разрешения'},
            brave:{action:'Проверьте и отзовите разрешения',detail:'brave://settings/content'},
            safari:{action:'Проверьте разрешения для каждого сайта',detail:'Safari → Настройки → Веб-сайты'}
          }
        },
        vpn:{
          title:'Синхронизируйте VPN и системное время',
          problem:'VPN меняет IP, но системный часовой пояс остаётся — это противоречие сразу заметно.',
          instructions:{
            chrome:{action:'Выбирайте сервер VPN в той же стране, что и ваш часовой пояс'},
            firefox:{action:'Выбирайте сервер VPN в той же стране, что и ваш часовой пояс'},
            brave:{action:'Выбирайте сервер VPN в той же стране, что и ваш часовой пояс'},
            safari:{action:'Выбирайте сервер VPN в той же стране, что и ваш часовой пояс'}
          },
          alternative:'Mullvad VPN автоматически согласовывает timezone.'
        },
        webrtc:{
          title:'Устраните утечку WebRTC',
          problem:'WebRTC раскрывает ваш локальный IP даже при включённом VPN.',
          instructions:{
            chrome:{action:'Установите расширение WebRTC Leak Prevent',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webrtc%20leak%20prevent'}},
            firefox:{action:'Отключите WebRTC',detail:'about:config → media.peerconnection.enabled → false'},
            brave:{action:'WebRTC уже заблокирован в Brave',note:'Shields блокируют WebRTC по умолчанию'},
            safari:{action:'Safari блокирует WebRTC-утечки по умолчанию',note:'Дополнительных действий не требуется'}
          }
        },
        languages:{
          title:'Упростите список языков',
          problem:function(n){return n+' языка в настройках — нестандартная комбинация сужает круг.';},
          instructions:{
            chrome:{action:'Оставьте 1–2 языка',detail:'Настройки → Языки'},
            firefox:{action:'Оставьте 1–2 языка',detail:'about:preferences → Язык'},
            brave:{action:'Оставьте 1–2 языка',detail:'Настройки → Языки'},
            safari:{action:'Измените порядок языков в системных настройках',detail:'Системные настройки → Основные → Язык и регион'}
          }
        },
        webgl:{
          title:'Защитите WebGL-отпечаток',
          problem:'WebGL раскрывает модель вашего GPU — это мощный идентификатор устройства.',
          instructions:{
            chrome:{action:'Установите WebGL Fingerprint Defender',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webgl%20fingerprint%20defender'}},
            firefox:{action:'Отключите WebGL',detail:'about:config → webgl.disabled → true'},
            brave:{action:'Brave рандомизирует WebGL-отпечаток',note:'Shields → Fingerprinting → Strict'},
            safari:{action:'Safari ограничивает доступ к WebGL по умолчанию',note:'Дополнительных действий не требуется'}
          }
        },
        audioFp:{
          title:'Защитите аудио-отпечаток',
          problem:'Браузер обрабатывает звук уникально — по этому признаку вас можно узнать.',
          instructions:{
            chrome:{action:'Специальных расширений нет — используйте Brave или Firefox',detail:'Brave и Firefox с resistFingerprinting защищают от аудио-трекинга'},
            firefox:{action:'Включите privacy.resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Brave рандомизирует аудио-отпечаток',note:'Защита включена по умолчанию'},
            safari:{action:'Safari частично защищает от аудио-трекинга',note:'Встроенная защита ITP'}
          }
        },
        fonts:{
          title:'Сократите список нестандартных шрифтов',
          problem:function(n){return 'Обнаружено '+n+' нестандартных шрифтов — набор установленных шрифтов помогает сайтам отличить ваше устройство от других.';},
          instructions:{
            chrome:{action:'Удалите экзотические шрифты, которые не используете',detail:'Панель управления → Шрифты (Windows) или Font Book (macOS)'},
            firefox:{action:'Удалите экзотические шрифты + включите resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Brave ограничивает видимость шрифтов',note:'Shields → Fingerprinting → Strict'},
            safari:{action:'Safari ограничивает доступ к списку шрифтов',note:'Встроенная защита'}
          }
        },
        spoofing:{
          title:'Обнаружены несоответствия в данных браузера',
          problem:'Некоторые данные вашего браузера не совпадают друг с другом. Это может быть VPN, расширение для приватности или подмена User-Agent. Несоответствия иногда делают вас более заметным, а не менее.',
          instructions:{
            chrome:{action:'Проверьте расширения, которые подменяют User-Agent',detail:'chrome://extensions → отключите User-Agent Switcher и подобные'},
            firefox:{action:'Проверьте расширения и настройки приватности',detail:'about:addons → отключите подмену UA, если не нужна'},
            brave:{action:'Brave может вызывать мелкие несоответствия — это нормально',note:'Встроенная защита Brave иногда создаёт контролируемые аномалии'},
            safari:{action:'Проверьте расширения Safari',detail:'Safari → Настройки → Расширения'}
          }
        },
        canvasRandomized:{
          title:'Обнаружена рандомизация canvas',
          problem:'Ваше расширение рандомизирует canvas-отпечаток. Это хорошо для приватности, но может сделать вас уникальным среди пользователей без такой защиты.',
          instructions:{
            chrome:{action:'Рассмотрите переход на Brave',detail:'В Brave рандомизация canvas работает на уровне браузера, что менее заметно'},
            firefox:{action:'privacy.resistFingerprinting работает аналогично',detail:'Это стандартный механизм Firefox — менее заметен, чем расширения'},
            brave:{action:'Brave рандомизирует canvas на уровне браузера',note:'Это штатное поведение — не стоит менять'},
            safari:{action:'Safari имеет встроенную защиту canvas',note:'Дополнительных действий не требуется'}
          }
        },
        tzMismatch:{
          title:'Часовой пояс не совпадает с IP',
          problem:'Ваш часовой пояс не совпадает с вашим IP-адресом. Если вы используете VPN, синхронизируйте время с локацией VPN-сервера.',
          instructions:{
            chrome:{action:'Синхронизируйте часовой пояс с VPN',detail:'Выберите VPN-сервер в той же стране, что и ваш системный часовой пояс'},
            firefox:{action:'Синхронизируйте часовой пояс с VPN',detail:'Выберите VPN-сервер в той же стране, что и ваш системный часовой пояс'},
            brave:{action:'Синхронизируйте часовой пояс с VPN',detail:'Выберите VPN-сервер в той же стране, что и ваш системный часовой пояс'},
            safari:{action:'Синхронизируйте часовой пояс с VPN',detail:'Выберите VPN-сервер в той же стране, что и ваш системный часовой пояс'}
          }
        }
      },
      general:[
        {
          title:'Установите uBlock Origin',
          body:'Блокирует рекламные трекеры, пиксели и скрипты слежки.',
          instructions:{
            chrome:{action:'Установите из Chrome Web Store',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            firefox:{action:'Установите из Firefox Add-ons',link:{text:'Firefox Add-ons',url:'https://addons.mozilla.org/firefox/addon/ublock-origin/'}},
            brave:{action:'Установите из Chrome Web Store',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            safari:{action:'Установите аналог — AdGuard для Safari',link:{text:'App Store',url:'https://apps.apple.com/app/adguard-for-safari/id1440147259'}}
          },
          level:'easy'
        },
        {
          title:'Используйте отдельные профили браузера',
          body:'Работа, покупки, личное — в разных профилях. Сигналы не смешиваются.',
          instructions:{
            chrome:{action:'Создайте новый профиль',detail:'Три точки → Люди → Добавить профиль'},
            firefox:{action:'Создайте новый профиль',detail:'about:profiles → Create a New Profile'},
            brave:{action:'Создайте новый профиль',detail:'Три точки → Люди → Добавить профиль'},
            safari:{action:'Safari не поддерживает профили',note:'Используйте разные браузеры для разных задач'}
          },
          level:'easy'
        },
        {
          title:'Периодически чистите данные браузера',
          body:'Cookies, localStorage и кэш — три разных хранилища. Чистите все три.',
          instructions:{
            chrome:{action:'Очистите данные',detail:'Ctrl+Shift+Delete → выбрать всё → очистить'},
            firefox:{action:'Очистите данные',detail:'Ctrl+Shift+Delete → выбрать всё → очистить'},
            brave:{action:'Очистите данные',detail:'Ctrl+Shift+Delete → выбрать всё → очистить'},
            safari:{action:'Очистите данные',detail:'Safari → Очистить историю → Всю историю'}
          },
          level:'easy'
        },
        {
          title:'Переключитесь на Firefox с базовой защитой',
          body:'Firefox + три настройки дают серьёзную защиту без потери удобства.',
          instructions:{
            chrome:{action:'Скачайте Firefox и настройте защиту',detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            firefox:{action:'Включите расширенную защиту',detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            brave:{action:'Brave уже предоставляет аналогичную защиту',note:'Firefox — альтернатива с более гибкими настройками'},
            safari:{action:'Скачайте Firefox для продвинутой защиты',detail:'about:config → privacy.resistFingerprinting → true'}
          },
          level:'medium'
        },
        {
          title:'Используйте VPN с хорошей репутацией',
          body:'Скрывает IP и провайдера. Выбирайте сервис без логов.',
          instructions:{
            chrome:{action:'Рекомендуемые VPN-сервисы',detail:'Mullvad (mullvad.net) или ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            firefox:{action:'Рекомендуемые VPN-сервисы',detail:'Mullvad (mullvad.net) или ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            brave:{action:'Рекомендуемые VPN-сервисы',detail:'Mullvad (mullvad.net) или ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            safari:{action:'Рекомендуемые VPN-сервисы',detail:'Mullvad (mullvad.net) или ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}}
          },
          expandDetail:'<b>На что обратить внимание при выборе VPN:</b><ul class="rec-expand-list"><li>Политика no-logs — если провайдер ничего не хранит, выдавать нечего</li><li>Kill-switch — отключает сеть при потере связи с VPN-сервером</li><li>Юрисдикция — позволяет сервису отказаться от раскрытия данных</li><li>Обфускация трафика — маскирует VPN-соединение от провайдера</li><li>Серверы в разных странах — доступ к локальным ресурсам</li><li>Результаты независимых аудитов безопасности</li></ul>',
          level:'medium'
        },
        {
          title:'Для максимальной анонимности — Tor Browser',
          body:'Все пользователи Tor Browser выглядят одинаково. Медленнее, но полностью нормализует отпечаток.',
          instructions:{
            chrome:{action:'Скачайте Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}},
            firefox:{action:'Скачайте Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}},
            brave:{action:'Tor доступен встроенно в Brave',detail:'Новое приватное окно с Tor',note:'Или скачайте полноценный Tor Browser с torproject.org'},
            safari:{action:'Скачайте Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}}
          },
          level:'hard'
        }
      ]
    },
    detailTitle:'Подробности для профессионалов',
    networkTitle:'Анализ сети',
    networkDesc:'Определим ваш IP-адрес, провайдера, наличие VPN и скорость соединения. Запросы уходят только по нажатию: нашему серверу, а от него — ipquery.io и Google DNS.',
    networkButton:'Проверить сеть',
    networkLoading:'Проверяем...',
    networkRecheck:'Проверить снова',
    osintLoading:'Сканируем публичные базы данных...',
    serverFpTitle:'Серверный отпечаток',
    serverFpDesc:'Это то, что любой сервер видит ещё до выполнения JavaScript: TLS-версия, HTTP-протокол, порядок заголовков и клиентские подсказки браузера. Эти данные нельзя скрыть средствами JavaScript.',
    serverFp:{tls:'TLS',http:'HTTP-протокол',headerHash:'Хеш заголовков',headerOrder:'Порядок заголовков',chPlatform:'CH: Платформа',chMobile:'CH: Мобильное',chBrowser:'CH: Браузер',asn:'ASN',org:'Организация'},
    monitorText:{
      single:'1 экран',
      multi:count=>{
        const mod10=count%10;
        const mod100=count%100;
        let word='экранов';
        if(mod10===1&&mod100!==11) word='экран';
        else if(mod10>=2&&mod10<=4&&(mod100<10||mod100>=20)) word='экрана';
        return `${count} ${word}`;
      },
      unknown:'количество экранов не раскрывается'
    },
    permNames:{
      geolocation:'геолокация',
      notifications:'уведомления',
      camera:'камера',
      microphone:'микрофон',
      'clipboard-read':'чтение буфера обмена',
      'clipboard-write':'запись в буфер обмена',
      'persistent-storage':'постоянное хранилище'
    },
    permStates:{granted:'✅ разрешено',denied:'❌ запрещено',prompt:'по запросу',unknown:'не сообщается'},
    pointerLabels:{fine:'мышь/трекпад',coarse:'тачскрин',none:'не сообщает'},
    dntStatus:{on:'включена',off:'выключена',unknown:'браузер не сообщил'},
    memoryNote:'браузер округляет цифры, реальные значения могут отличаться',
    saveButton:'Распечатать / Сохранить',
    shareButton:'Поделиться результатом',
    share:{
      unavailable:'Подождите расчёта…',
      title:({pct})=>`Насколько вы анонимны: уникальнее, чем ${Math.round(pct)}% людей`,
      tagline:'Проверьте, что сайты узнают о вас за секунды',
      text:({pct,url})=>`Мой цифровой отпечаток уникальнее, чем у ${Math.round(pct)}% пользователей. Проверьте, что сайты узнают о вас за секунды — ${url||CANONICAL_URL}`,
      shared:'Отправили! Спасибо, что делитесь.',
      copied:'Ссылка скопирована',
      error:'Не удалось поделиться автоматически. Попробуйте скопировать ссылку вручную.',
      aria:({pct})=>`Поделиться результатом: уникальнее, чем ${Math.round(pct)}% пользователей`
    },
    copy:{hint:'Нажмите, чтобы скопировать',done:'Скопировано'},
    examplePrefix:'Пример:',
    advicePrefix:'💡 Совет:',
    methodologyButton:'Как рассчитывается процент?',
    methodSummary:'<b>Как считаем результат</b>',
    methodText:'<p><b>Что мы измеряем</b></p><p>Ваш браузер передаёт сайтам 21\u00A0параметр: тип браузера, ОС, разрешение экрана, видеокарту, число ядер процессора, объём памяти, языки, расширения, графический и аудио‑отпечатки, шрифты и другие.</p><p><b>Как считаем</b></p><p>Для каждого параметра мы смотрим, насколько он редкий. Например, Chrome на Windows\u00A0— массовая комбинация. А старый Firefox с необычным GPU\u00A0— редкость, которая выделяет вас из толпы.</p><p>Чем больше редких параметров совпало\u00A0— тем выше итоговый балл.</p><p><b>Откуда берутся данные</b></p><p>Вероятности основаны на открытых исследованиях EFF\u00A0Panopticlick и FingerprintJS. Мы также учитываем зависимости между параметрами (Safari всегда работает с Apple\u00A0GPU, поэтому эта пара не удваивает счёт).</p><p><b>Что означает процент</b></p><p>Мы моделируем 25\u00A0000\u00A0виртуальных браузеров и сравниваем ваш результат с ними. Если вы набрали 85%\u00A0— значит ваш отпечаток уникальнее, чем у 85% смоделированных пользователей.</p><p style="opacity:.7;font-size:13px">Балл считается в вашем браузере: параметры для него никуда не отправляются.</p>',
    batteryUnavailable:'Недоступно в этом браузере',
    footer:version=>`© <a href="${PERSONAL_URL}" target="_blank" rel="noopener">morgunov.tech</a> • Локальный аудит отпечатка • <button id="versionBtn" class="btn version-btn" title="История изменений">v${version}</button><br><span class="footer-note">Сервис размещён на Cloudflare. Cloudflare Web Analytics собирает анонимную статистику посещений (без cookies и персональных данных).</span><br><span id="footerVisitCount" class="footer-note" style="display:none"></span>`,
    errorMessage:msg=>`Ошибка: ${msg}`,
    units:{cores:'ядра',gb:'ГБ',mbps:'Мбит/с',ms:'мс',yes:'да',no:'нет'},
    labels:{touchPoints:'касания',pointer:'указатель',latency:'задержка',storage:{local:'Локальное хранилище',session:'Сессионное хранилище',idb:'IndexedDB (база)',cookies:'Cookie'}},
    formatFullness:(filled,total)=>`${Math.round(100*filled/Math.max(1,total))}% данных заполнено (${filled} из ~${total})`,
    story:{
      toggleStory:'📖 История',
      toggleReport:'📊 Отчёт',
      stage:'Этап',
      dangerTitle:'⚠️ Чем это опасно',
      actionTitle:'🛡️ Что делать',
      whoSees:'Кто это видит:',
      difficulty:{easy:'Просто',medium:'Средне',hard:'Сложно'},
      rows:{device:'Устройство',screen:'Экран',gpu:'GPU',dpr:'DPR',ip:'IP',isp:'Провайдер',vpn:'VPN/прокси',browser:'Браузер',dnt:'DNT',gpc:'GPC',tls:'TLS',cipher:'Шифр',acceptLanguage:'Accept-Language',ua:'UA',canvas:'Canvas',audio:'Audio',webgl:'WebGL',webrtc:'Утечка WebRTC',trackers:'Трекеров заблокировано'},
      on:'вкл',off:'выкл',yes:'⚠️ да',no:'нет',notChecked:'не проверялось',needsNetwork:'нажмите «Проверить сеть»',
      s0:{
        title:'Вы открыли ноутбук',
        subtitle:'Ещё до выхода в интернет ваше устройство уже уникально',
        who:'Пока никто — но через минуту это увидит любой сайт',
        youtube:function(dev,scr,gpu){return 'Вы ещё даже не открыли YouTube, но ваш '+dev+' с экраном '+scr+' уже выделяется среди большинства пользователей. YouTube это узнает через несколько секунд.';},
        danger:'Комбинация характеристик устройства уже уникальна. Сайт не знает ваше имя — но знает, что вы владелец устройства определённой ценовой категории. Это используется для ценовой дискриминации: авиабилеты, отели, подписки могут стоить дороже на дорогом устройстве. Разрешение + pixel ratio + GPU — это почти серийный номер.',
        action:'<ul><li>Включить режим «XLetterboxing» в Firefox (resistFingerprinting) — округляет разрешение</li><li>Рассмотреть Brave Browser — рандомизирует hardware-параметры</li><li>Chrome: расширение Canvas Blocker / Trace</li><li>Полностью скрыть устройство невозможно, но можно сделать его менее уникальным</li></ul>',
        actionDiff:'medium'
      },
      s1:{
        title:'Вы подключились к Wi-Fi',
        subtitle:'Провайдер уже знает, что вы в сети',
        who:'Ваш интернет-провайдер (ISP), владелец Wi-Fi-точки',
        youtube:function(isp,ip){return 'Когда вы введёте youtube.com, провайдер '+isp+' запишет это в лог. Он не увидит видео, но будет знать, что в это время вы зашли на YouTube.';},
        danger:'Провайдер ведёт полный лог доменов. Во многих странах он обязан хранить его от 6 месяцев до 3 лет. Владелец Wi-Fi видит то же самое. IP-адрес позволяет связать действия на разных сайтах. Гео-блокировка: контент и цены меняются в зависимости от страны.',
        action:'<ul><li>VPN от проверенного провайдера (Mullvad, ProtonVPN, IVPN)</li><li>Tor Browser — максимальная анонимизация</li><li>Encrypted DNS (DNS-over-HTTPS) — скрывает домены от провайдера</li><li>Не использовать публичный Wi-Fi без VPN</li></ul>',
        actionDiff:'easy'
      },
      s2:{
        title:'Вы открыли браузер',
        subtitle:'Браузер уже несёт набор уникальных характеристик',
        who:'Пока только браузер — но всё будет передано первому же сайту',
        youtube:function(br,dnt,gpc){return 'Вы ещё не набрали youtube.com, но браузер '+br+' уже выдаёт свой набор признаков'+(dnt?', включён Do Not Track':'')+(gpc?', включён GPC':'')+'. Эта комбинация — как отпечаток пальца.';},
        danger:'Комбинация из 3–5 расширений может быть уникальной среди миллионов пользователей. Включённый Do Not Track парадоксально делает вас заметнее: его включают менее 7% пользователей. Выданные разрешения (камера, геолокация) говорят о привычках.',
        action:'<ul><li>Минимизировать количество расширений</li><li>Использовать популярные расширения (uBlock Origin, Bitwarden)</li><li>Отозвать ненужные разрешения в настройках</li><li>Рассмотреть отдельный профиль браузера для чувствительных задач</li></ul>',
        actionDiff:'easy'
      },
      s3:{
        title:'Вы набрали youtube.com',
        subtitle:'Кто-то узнал, что вы хотите открыть YouTube',
        who:'DNS-провайдер — тот, кто переводит домен в IP-адрес. По умолчанию — ваш ISP',
        youtube:'Вы набрали youtube.com и нажали Enter. В этот момент DNS-сервер получил запрос: «покажи IP-адрес YouTube». Он не узнает, какое видео вы будете смотреть, но в его логах появилась запись с вашим IP и временем.',
        danger:'DNS-лог — полная карта интересов. youtube.com → webmd.com → hh.ru → avito.ru/kvartiry — DNS-сервер видит цепочку и понимает: человек отвлёкся от видео, загуглил симптомы, ищет работу и думает о переезде. В некоторых юрисдикциях DNS-логи используются для цензуры.',
        action:'<ul><li>Включить DNS-over-HTTPS: Chrome → Настройки → Безопасность → «Безопасный DNS»</li><li>DNS-провайдер без логирования: Cloudflare (1.1.1.1), Quad9 (9.9.9.9), NextDNS</li><li>VPN решает эту проблему автоматически</li></ul>',
        actionDiff:'easy',
        isInfo:true
      },
      s4:{
        title:'Браузер подключается к серверу YouTube',
        subtitle:'Сервер узнал ваш почерк ещё до загрузки страницы',
        who:'Сервер YouTube и любой посредник — корпоративный прокси, DPI провайдера',
        youtube:function(tls){return 'Браузер «здоровается» с сервером YouTube через '+tls+' — и способ рукопожатия уникален, как почерк. Смените IP, очистите cookies — TLS-отпечаток останется прежним.';},
        danger:'TLS-отпечаток не меняется при смене IP, VPN и очистке cookies. Утром с домашнего Wi-Fi, вечером через VPN — отпечаток совпал, сервер связал сессии. DPI-системы используют TLS fingerprinting для идентификации и блокировки VPN-протоколов.',
        action:'<ul><li>Tor Browser стандартизирует TLS-отпечаток</li><li>Firefox + privacy.resistFingerprinting частично нормализует</li><li>Регулярно обновлять браузер — отпечаток меняется между версиями</li><li>В обычном Chrome/Safari/Edge контроля нет</li></ul>',
        actionDiff:'hard'
      },
      s5:{
        title:'YouTube получил ваш запрос',
        subtitle:'Сервер уже знает ваш язык, ОС и откуда вы пришли',
        who:'Владелец сайта — в серверных логах. Это видит ЛЮБОЙ владелец ЛЮБОГО сайта',
        youtube:function(langs){return 'YouTube прочитал: «Accept-Language: '+langs+'». Теперь он знает ваш языковой профиль. Вы не вводили это — браузер отправил сам.';},
        danger:'Accept-Language раскрывает национальность. Referer рассказывает, откуда пришли. Порядок заголовков — неочевидный, но мощный идентификатор: его нельзя подменить расширением. Если подменили User-Agent, но Client Hints выдают реальный браузер — расхождение обнаруживается.',
        action:'<ul><li>Минимизировать список языков — оставить 1–2 (en-US, en)</li><li>Контроль Referer: Firefox — network.http.referer.XOriginPolicy = 2</li><li>Tor Browser стандартизирует заголовки</li><li>Порядок заголовков невозможно контролировать расширениями</li></ul>',
        actionDiff:'medium'
      },
      s6:{
        title:'YouTube загрузился и запустил скрипты',
        subtitle:'Невидимые тесты уже начались — прямо сейчас',
        who:'YouTube (Google) и любой сайт со скриптами',
        youtube:function(canvas,audio){return 'Пока вы смотрите видео, YouTube в фоне рисует невидимую картинку (Canvas: '+canvas+'), проигрывает беззвучный звук (Audio: '+audio+') и рендерит скрытый 3D-объект. Приватный режим? Canvas fingerprint остался тем же.';},
        danger:'Canvas/Audio/WebGL fingerprint — главный инструмент трекинга без cookies. Очистили историю, сменили аккаунт — отпечаток прежний, потому что зависит от железа. WebRTC-утечка: сайт получает реальный IP в обход VPN. Battery API: точный уровень заряда = идентификатор сессии.',
        action:'<ul><li><b>Canvas</b>: CanvasBlocker (Firefox), Brave — встроенно, Chrome — Trace</li><li><b>Audio</b>: Firefox + resistFingerprinting блокирует</li><li><b>WebGL</b>: можно отключить (webgl.disabled = true), но сломает часть сайтов</li><li><b>WebRTC</b>: Firefox — media.peerconnection.enabled = false. Критично при VPN</li><li><b>Battery</b>: Firefox и Brave ограничивают API</li></ul>',
        actionDiff:'medium'
      },
      s7:{
        title:'За вами наблюдают ещё 10+ компаний',
        subtitle:'Рекламные сети видят вас не только на YouTube — а на тысячах сайтов',
        who:'Рекламные сети (Google Ads, Meta Pixel, Criteo), аналитика, соцвиджеты',
        youtube:function(blocked,total){return 'YouTube — это Google. Но скрипты Google стоят на большинстве сайтов. Утром — видео о ремонте. Днём — строительный магазин. Вечером — ипотечный калькулятор. Три сайта — один пиксель.'+(blocked>0?' Ваш блокировщик заблокировал '+blocked+' из '+total+' проверок.':' Ваш браузер не заблокировал ни одного трекера.');},
        danger:'На типичной странице десятки чужих скриптов. Каждый собирает отпечаток. Утром статья о симптомах, днём поиск юриста, вечером цены на квартиры — один пиксель, полная картина жизни. В утечках брокеров находили профили с тегами «финансовые трудности», «проблемы со здоровьем».',
        action:'<ul><li><b>uBlock Origin</b> — золотой стандарт. Обязателен</li><li>Доп. списки в uBlock: «Annoyances» и «Privacy»</li><li>Firefox: Enhanced Tracking Protection → Strict</li><li>Brave: блокировщик встроен</li><li>Firefox Multi-Account Containers — изолирует сайты друг от друга</li></ul>',
        actionDiff:'easy'
      },
      verdict:{
        title:'Полная картина',
        subtitle:'Ваш цифровой отпечаток — от включения устройства до просмотра видео',
        now:'Прямо сейчас (5 минут):',
        nowList:['Установить uBlock Origin','Включить DNS-over-HTTPS в настройках браузера','Отозвать камеру/микрофон/гео у ненужных сайтов'],
        weekend:'На выходных (30 минут):',
        weekendList:['Настроить VPN (Mullvad / ProtonVPN)','Отключить WebRTC leak','Установить CanvasBlocker или перейти на Brave'],
        advanced:'Для продвинутых:',
        advancedList:['Tor Browser для чувствительных задач','Firefox + resistFingerprinting','Раздельные браузеры для разных задач']
      }
    },
    shock:{title:'Что сайт знает о вас'},
    // Text under the percentage in the hero block.
    heroConclusion:{
      high:'Вас легко узнать. Сайты, на которые вы заходите, могут понять, что это именно вы — даже без регистрации и cookies. Ниже — простые шаги, которые это изменят.',
      med:'Вас можно узнать, но не сразу. Ваш браузер выделяется среди других, хотя и не уникален. Несколько простых шагов помогут стать незаметнее.',
      low:'Вас сложно узнать. Ваш браузер похож на многие другие — сайтам трудно выделить именно вас. Хороший результат.'
    },
    meta:{title:'Fingerprint — узнай, насколько ты анонимен в сети',description:'Показываем, какие данные сайты видят уже сейчас, оцениваем уникальность отпечатка и даём понятные советы по защите приватности.'},
    // Labels of the data rows in "What the site knows about you" and "Network analysis".
    rows:{
      location:'Геолокация',date:'Дата',time:'Время',timezone:'Часовой пояс',languages:'Языки',device:'Устройство',ram:'💾 RAM',battery:'🔋 Батарея',charging:', заряжается',
      browser:'Браузер',permissions:'Разрешения',ip:'Ваш IP-адрес',isp:'Провайдер',connectionType:'Тип',vpn:'VPN',webrtc:'WebRTC',browserData:'Данные браузера',
      detected:'Обнаружен',notDetected:'Не обнаружен',leak:'Утечка: ',safe:'Безопасно',unavailable:'Недоступен',looksNatural:'Выглядит естественно',inconsistencies:'Обнаружены несоответствия',
      perms:{camera:'камера',microphone:'микрофон',geolocation:'геолокация'},
      connection:{wifi:'Wi-Fi',cellular:'Мобильная сеть',ethernet:'Кабель',bluetooth:'Bluetooth'}
    },
    deviceNames:{
      androidFlagship:'Android-смартфон (флагман)',androidPhone:'Android-смартфон',androidTablet:'Android-планшет',androidDevice:'Android-устройство',
      windowsWorkstation:'мощная Windows-рабочая станция',windowsPowerful:'мощный Windows-ПК',windowsPc:'Windows-ПК',windowsLaptop:'Windows-ноутбук',windowsBudget:'бюджетный Windows-ПК',linux:'Linux-система'
    },
    osint:{isp:'Провайдер',asn:'ASN',type:'Тип подключения',rep:'Репутация IP',
      connection:{residential:'Домашнее подключение',datacenter:'Дата-центр (подозрительно)',vpn:'VPN/Прокси',mobile:'Мобильная сеть'},
      clean:n=>`✅ Ваш IP чист — не числится ни в одном чёрном списке (проверено ${n} баз)`,
      listed:hits=>`⚠️ Ваш IP найден в чёрных списках: ${hits}. Это может означать, что ваш IP ранее использовался для рассылки спама. Последствия: некоторые сайты могут блокировать доступ.`,
      error:'Не удалось проверить IP по публичным базам'},
    networkError:'Проверка сети не удалась',
    speedTest:{testing:'Измеряем...',failed:'Ошибка замера',latency:'Задержка'},
    contradictions:{
      title:'Проверка консистентности',
      consistent:'Данные консистентны',
      discrepancies:'Обнаружены расхождения',
      significant:'Значительные расхождения',
      timezone:'Часовой пояс',
      platform:'Платформа',
      browser:'Браузер',
      uaConsistency:'UA vs Client Hints',
      clientSide:'Браузер',
      eduTitle:'Что это значит?',
      eduText:'Расхождения между серверными и клиентскими данными могут указывать на использование VPN, прокси, эмулятора или инструментов для подмены отпечатка. Сайты используют эти несоответствия для выявления ботов и мошенников.'
    },
    relevantBadge:'⚡ Актуально для вас',
    moreRecs:'Ещё рекомендации',
    vpnMore:'Подробнее о выборе VPN',
    statVisitors:pct=>`у ${pct}% посетителей`,
    footerVisits:n=>`Проверено ${n} отпечатков`,
    changelogTitle:'История изменений'
};
