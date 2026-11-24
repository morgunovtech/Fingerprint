// English strings of the page. Keys are the same in ru.js, en.js and uz.js; selftest.js checks that.
import { PERSONAL_URL, CANONICAL_URL } from '../config.js';

export default {
    langButton:'Language',
    langLabels:{ru:'Russian',en:'English',uz:'Uzbek'},
    theme:{label:'Theme',modes:{auto:'Auto',light:'Light',dark:'Dark',contrast:'Contrast'}},
    introTitle:'”Digital fingerprint”: what websites know about you',
    uniqHeadline:{'high':'Your fingerprint stands out more than most users','med':'Your fingerprint is moderately distinctive','low':'Your fingerprint blends in with the crowd'},
    trackers:{
      title:'Tracker protection',
      description:'We simulate common tracking methods (ad pixels, analytics scripts, ad frames) and check whether your browser or extensions block them. The more blocked, the better your privacy is protected.',
      pixel:{name:'Ad tracking pixel',blocked:'Blocked',open:'Not blocked'},
      pixelExplain:'Invisible 1×1 pixel images that ad networks embed in pages to track your visits',
      analytics:{name:'Analytics script',blocked:'Blocked',open:'Not blocked'},
      analyticsExplain:'Scripts like Google Analytics that collect data about your behavior on sites',
      iframe:{name:'Ad frame',blocked:'Blocked',open:'Not blocked'},
      iframeExplain:'Embedded ad blocks that load content from ad network servers',
      dnt:{name:'Do Not Track',blocked:'Enabled',open:'Disabled'},
      dntExplain:'A browser signal asking sites not to track you (most sites ignore it)',
      gpc:{name:'Global Privacy Control',blocked:'Enabled',open:'Disabled'},
      gpcExplain:'A legally binding privacy signal supported by laws in some countries',
      verdict:function(blocked,total){
        if(blocked>=5) return '✅ Excellent protection! All tested trackers are blocked (' + blocked + ' of ' + total + ').';
        if(blocked>=3) return 'Good protection. Most trackers are blocked (' + blocked + ' of ' + total + '). Check the remaining unblocked elements.';
        if(blocked>=1) return 'Partial protection (' + blocked + ' of ' + total + '). Your browser blocks some trackers, but not all. For full protection we recommend uBlock Origin.';
        return 'Your browser does not block any trackers (0 of ' + total + '). Websites can track every visit using ad pixels, analytics scripts, and ad frames. We recommend installing uBlock Origin — a free extension that solves most of these issues.';
      }
    },
    implications:{
      problemTitle:'What happens to your data',
      problemText:'<p>Every time you open a website, your browser automatically sends dozens of characteristics — without your permission and without any pop-ups. Sites do not store this fingerprint themselves — they pass it to ad networks.</p><p>An ad network can be present on millions of sites at once. That means a single invisible tracker silently follows you everywhere you go online — collecting a complete history of your interests, purchases, routes, and habits.</p><p>This profile is not deleted when you clear cookies. It does not disappear in incognito mode. It exists as long as your browser and device exist.</p>',
      risksTitle:'Why this is dangerous for you personally',
      risks:[
        {icon:'💸',title:'You pay more than others',body:'Online stores and booking services see your device model, browser, and behaviour. MacBook users are often shown higher prices for flights and hotels than users of budget Android devices — this is price discrimination, and it is legal in most countries.'},
        {icon:'🎯',title:'Ads know more about you than your friends',body:'Based on your fingerprint, ad systems know which sites you visited, what you searched for, when you were awake at night, and which topics concern you. This data is used not only for ads — insurance companies and employers buy profiles from data brokers.'},
        {icon:'🎣',title:'Phishing (targeted scam emails) becomes more precise',body:'Scammers who bought a database with your profile know your city, ISP, device, and language. An email that mentions your MacBook or your ISP account looks convincing — this is exactly how targeted phishing attacks work.'},
        {icon:'🔓',title:'Incognito mode does not protect you',body:'Most users believe that incognito = anonymity. It is not. Incognito mode only hides history from other people on your device. Your fingerprint, IP, and all signals remain the same — sites see you just as before. Incognito clears history, cookies, and cache when the session ends — that is all. It does not hide your digital fingerprint, does not encrypt traffic, does not mask your IP address, and keeps downloaded files.'},
        {icon:'🗂️',title:'Your profile exists without your knowledge — and leaks are forever',body:'Right now, in the databases of data brokers (Acxiom, Oracle Data Cloud, Nielsen, etc.) there is a file with your interests, routes, purchases, and estimated income. You did not consent to this. You cannot delete it. In 2023–2024, thousands of data leaks occurred from advertising platforms. If a profile with your fingerprint leaked — it cannot be recalled. Scammers use old databases for targeted attacks for years.'},
        {icon:'🔐',title:'VPN does not guarantee your privacy',body:'A VPN helps hide your traffic and mask your IP, but it does not conceal your digital fingerprint. Your ISP can see you are using a VPN. Some VPN providers log your activity, and this data can be obtained through legal requests or breaches.'}
      ],
      stepsTitle:'What to do right now',
      personalTitle:'Based on your fingerprint',
      generalTitle:'Useful for everyone — regardless of results',
      levelLabels:{easy:'🟢 easy',medium:'🟡 medium',hard:'🔴 hard'},
      altPrefix:'Or: ',
      personal:{
        canvas:{
          title:'Protect your graphics fingerprint',
          problem:'Your browser renders images uniquely — this hash identifies you on any site even without cookies.',
          instructions:{
            chrome:{action:'Install the CanvasBlocker extension',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/canvas%20blocker'}},
            firefox:{action:'Enable privacy.resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Check that protection is enabled',detail:'Shields → Fingerprinting → Strict',note:'Brave protects against canvas tracking by default'},
            safari:{action:'Safari partially protects against canvas tracking',note:'Built-in Intelligent Tracking Prevention'}
          },
          alternative:'Brave has this protection built in and it works without extensions.'
        },
        plugins:{
          title:'Reduce the number of extensions',
          problem:function(n){return 'You have '+n+' extensions — a non-standard set makes your profile easily recognisable.';},
          instructions:{
            chrome:{action:'Open the extension manager and disable unused ones',detail:'chrome://extensions'},
            firefox:{action:'Open the add-ons manager and disable unused ones',detail:'about:addons'},
            brave:{action:'Open the extension manager and disable unused ones',detail:'brave://extensions'},
            safari:{action:'Open extension settings',detail:'Safari → Settings → Extensions'}
          }
        },
        permissions:{
          title:'Revoke unnecessary permissions',
          problem:'Camera or microphone is allowed — a site can activate them without asking again.',
          instructions:{
            chrome:{action:'Review and revoke permissions',detail:'chrome://settings/content'},
            firefox:{action:'Review and revoke permissions',detail:'about:preferences#privacy → Permissions'},
            brave:{action:'Review and revoke permissions',detail:'brave://settings/content'},
            safari:{action:'Review permissions for each website',detail:'Safari → Settings → Websites'}
          }
        },
        vpn:{
          title:'Sync your VPN and system time',
          problem:'VPN changes your IP, but the system timezone stays — this mismatch is immediately noticeable.',
          instructions:{
            chrome:{action:'Choose a VPN server in the same country as your timezone'},
            firefox:{action:'Choose a VPN server in the same country as your timezone'},
            brave:{action:'Choose a VPN server in the same country as your timezone'},
            safari:{action:'Choose a VPN server in the same country as your timezone'}
          },
          alternative:'Mullvad VPN automatically synchronises timezone.'
        },
        webrtc:{
          title:'Fix the WebRTC leak',
          problem:'WebRTC reveals your local IP even with VPN enabled.',
          instructions:{
            chrome:{action:'Install the WebRTC Leak Prevent extension',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webrtc%20leak%20prevent'}},
            firefox:{action:'Disable WebRTC',detail:'about:config → media.peerconnection.enabled → false'},
            brave:{action:'WebRTC is already blocked in Brave',note:'Shields block WebRTC by default'},
            safari:{action:'Safari blocks WebRTC leaks by default',note:'No additional action required'}
          }
        },
        languages:{
          title:'Simplify your language list',
          problem:function(n){return n+' languages in settings — a non-standard combination narrows you down.';},
          instructions:{
            chrome:{action:'Keep 1–2 languages',detail:'Settings → Languages'},
            firefox:{action:'Keep 1–2 languages',detail:'about:preferences → Language'},
            brave:{action:'Keep 1–2 languages',detail:'Settings → Languages'},
            safari:{action:'Change language order in system settings',detail:'System Settings → General → Language & Region'}
          }
        },
        webgl:{
          title:'Protect your WebGL fingerprint',
          problem:'WebGL reveals your GPU model — a powerful device identifier.',
          instructions:{
            chrome:{action:'Install WebGL Fingerprint Defender',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/search/webgl%20fingerprint%20defender'}},
            firefox:{action:'Disable WebGL',detail:'about:config → webgl.disabled → true'},
            brave:{action:'Brave randomises the WebGL fingerprint',note:'Shields → Fingerprinting → Strict'},
            safari:{action:'Safari limits WebGL access by default',note:'No additional action required'}
          }
        },
        audioFp:{
          title:'Protect your audio fingerprint',
          problem:'Your browser processes sound uniquely — this trait can identify you.',
          instructions:{
            chrome:{action:'No dedicated extensions — use Brave or Firefox',detail:'Brave and Firefox with resistFingerprinting protect against audio tracking'},
            firefox:{action:'Enable privacy.resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Brave randomises the audio fingerprint',note:'Protection is enabled by default'},
            safari:{action:'Safari partially protects against audio tracking',note:'Built-in ITP protection'}
          }
        },
        fonts:{
          title:'Reduce non-standard fonts',
          problem:function(n){return n+' non-standard fonts detected — installed fonts help sites distinguish your device from others.';},
          instructions:{
            chrome:{action:'Remove exotic fonts you do not use',detail:'Control Panel → Fonts (Windows) or Font Book (macOS)'},
            firefox:{action:'Remove exotic fonts + enable resistFingerprinting',detail:'about:config → privacy.resistFingerprinting → true'},
            brave:{action:'Brave limits font visibility',note:'Shields → Fingerprinting → Strict'},
            safari:{action:'Safari limits access to the font list',note:'Built-in protection'}
          }
        },
        spoofing:{
          title:'Browser data inconsistencies detected',
          problem:'Some of your browser data does not match. This could be a VPN, a privacy extension, or User-Agent spoofing. Inconsistencies sometimes make you more visible, not less.',
          instructions:{
            chrome:{action:'Check extensions that spoof your User-Agent',detail:'chrome://extensions → disable User-Agent Switcher and similar'},
            firefox:{action:'Check extensions and privacy settings',detail:'about:addons → disable UA spoofing if not needed'},
            brave:{action:'Brave may cause minor inconsistencies — this is normal',note:'Brave built-in protection sometimes creates controlled anomalies'},
            safari:{action:'Check your Safari extensions',detail:'Safari → Settings → Extensions'}
          }
        },
        canvasRandomized:{
          title:'Canvas randomisation detected',
          problem:'Your extension randomises the canvas fingerprint. This is good for privacy, but may make you unique among users without such protection.',
          instructions:{
            chrome:{action:'Consider switching to Brave',detail:'Brave randomises canvas at the browser level, which is less detectable'},
            firefox:{action:'privacy.resistFingerprinting works similarly',detail:'This is a standard Firefox mechanism — less detectable than extensions'},
            brave:{action:'Brave randomises canvas at the browser level',note:'This is standard behaviour — no need to change'},
            safari:{action:'Safari has built-in canvas protection',note:'No additional action required'}
          }
        },
        tzMismatch:{
          title:'Timezone does not match IP',
          problem:'Your timezone does not match your IP address. If you use a VPN, synchronise the time with the VPN server location.',
          instructions:{
            chrome:{action:'Synchronise your timezone with VPN',detail:'Choose a VPN server in the same country as your system timezone'},
            firefox:{action:'Synchronise your timezone with VPN',detail:'Choose a VPN server in the same country as your system timezone'},
            brave:{action:'Synchronise your timezone with VPN',detail:'Choose a VPN server in the same country as your system timezone'},
            safari:{action:'Synchronise your timezone with VPN',detail:'Choose a VPN server in the same country as your system timezone'}
          }
        }
      },
      general:[
        {
          title:'Install uBlock Origin',
          body:'Blocks ad trackers, pixels, and tracking scripts.',
          instructions:{
            chrome:{action:'Install from Chrome Web Store',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            firefox:{action:'Install from Firefox Add-ons',link:{text:'Firefox Add-ons',url:'https://addons.mozilla.org/firefox/addon/ublock-origin/'}},
            brave:{action:'Install from Chrome Web Store',link:{text:'Chrome Web Store',url:'https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm'}},
            safari:{action:'Install the equivalent — AdGuard for Safari',link:{text:'App Store',url:'https://apps.apple.com/app/adguard-for-safari/id1440147259'}}
          },
          level:'easy'
        },
        {
          title:'Use separate browser profiles',
          body:'Work, shopping, personal — in different profiles. Signals do not mix.',
          instructions:{
            chrome:{action:'Create a new profile',detail:'Three dots → People → Add profile'},
            firefox:{action:'Create a new profile',detail:'about:profiles → Create a New Profile'},
            brave:{action:'Create a new profile',detail:'Three dots → People → Add profile'},
            safari:{action:'Safari does not support profiles',note:'Use different browsers for different tasks'}
          },
          level:'easy'
        },
        {
          title:'Periodically clear browser data',
          body:'Cookies, localStorage, and cache — three different stores. Clear all three.',
          instructions:{
            chrome:{action:'Clear data',detail:'Ctrl+Shift+Delete → select all → clear'},
            firefox:{action:'Clear data',detail:'Ctrl+Shift+Delete → select all → clear'},
            brave:{action:'Clear data',detail:'Ctrl+Shift+Delete → select all → clear'},
            safari:{action:'Clear data',detail:'Safari → Clear History → All History'}
          },
          level:'easy'
        },
        {
          title:'Switch to Firefox with basic protection',
          body:'Firefox + three settings provide serious protection without losing convenience.',
          instructions:{
            chrome:{action:'Download Firefox and configure protection',detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            firefox:{action:'Enable extended protection',detail:'about:config → privacy.resistFingerprinting → true + uBlock Origin + CanvasBlocker'},
            brave:{action:'Brave already provides similar protection',note:'Firefox is an alternative with more flexible settings'},
            safari:{action:'Download Firefox for advanced protection',detail:'about:config → privacy.resistFingerprinting → true'}
          },
          level:'medium'
        },
        {
          title:'Use a reputable VPN',
          body:'Hides IP and ISP. Choose a no-logs service.',
          instructions:{
            chrome:{action:'Recommended VPN services',detail:'Mullvad (mullvad.net) or ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            firefox:{action:'Recommended VPN services',detail:'Mullvad (mullvad.net) or ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            brave:{action:'Recommended VPN services',detail:'Mullvad (mullvad.net) or ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}},
            safari:{action:'Recommended VPN services',detail:'Mullvad (mullvad.net) or ProtonVPN (protonvpn.com)',link:{text:'Mullvad',url:'https://mullvad.net'}}
          },
          expandDetail:'<b>What to look for when choosing a VPN:</b><ul class="rec-expand-list"><li>No-logs policy — if the provider stores nothing, there is nothing to hand over</li><li>Kill-switch — cuts network when VPN connection drops</li><li>Jurisdiction — allows the provider to refuse data disclosure</li><li>Traffic obfuscation — hides VPN usage from your ISP</li><li>Servers in multiple countries — access to regional content</li><li>Independent security audit results</li></ul>',
          level:'medium'
        },
        {
          title:'For maximum anonymity — Tor Browser',
          body:'All Tor Browser users look identical. Slower, but fully normalises the fingerprint.',
          instructions:{
            chrome:{action:'Download Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}},
            firefox:{action:'Download Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}},
            brave:{action:'Tor is available built-in in Brave',detail:'New private window with Tor',note:'Or download the full Tor Browser from torproject.org'},
            safari:{action:'Download Tor Browser',link:{text:'torproject.org',url:'https://www.torproject.org'}}
          },
          level:'hard'
        }
      ]
    },
    detailTitle:'Details for professionals',
    networkTitle:'Network Analysis',
    networkDesc:'We’ll detect your IP address, ISP, VPN status, and connection speed. Requests go out only when you click: to our server, which then asks ipquery.io and Google DNS.',
    networkButton:'Check network',
    networkLoading:'Checking...',
    networkRecheck:'Re-check',
    osintLoading:'Scanning public databases...',
    serverFpTitle:'Server Fingerprint',
    serverFpDesc:'This is what any server sees before JavaScript runs: TLS version, HTTP protocol, header order, and browser Client Hints. These cannot be hidden by JavaScript.',
    serverFp:{tls:'TLS',http:'HTTP Protocol',headerHash:'Header Hash',headerOrder:'Header Order',chPlatform:'CH: Platform',chMobile:'CH: Mobile',chBrowser:'CH: Browser',asn:'ASN',org:'Organization'},
    monitorText:{
      single:'1 screen',
      multi:count=>{
        return `${count} screens`;
      },
      unknown:'screen count not shared'
    },
    permNames:{
      geolocation:'location',
      notifications:'notifications',
      camera:'camera',
      microphone:'microphone',
      'clipboard-read':'read clipboard',
      'clipboard-write':'write clipboard',
      'persistent-storage':'persistent storage'
    },
    permStates:{granted:'✅ allowed',denied:'❌ blocked',prompt:'on request',unknown:'not reported'},
    pointerLabels:{fine:'mouse/trackpad',coarse:'touchscreen',none:'not reported'},
    dntStatus:{on:'enabled',off:'disabled',unknown:'not reported'},
    memoryNote:'browser rounds numbers, actual RAM may differ',
    saveButton:'Print / Save',
    shareButton:'Share result',
    share:{
      unavailable:'Wait until the calculation is ready…',
      title:({pct})=>`How anonymous are you? More unique than ${Math.round(pct)}%`,
      tagline:'See what sites learn about you in seconds',
      text:({pct,url})=>`My digital fingerprint is more unique than ${Math.round(pct)}% of people. See what sites learn about you in seconds — ${url||CANONICAL_URL}`,
      shared:'Shared — thank you!',
      copied:'Link copied!',
      error:'Could not share automatically. Please copy the link instead.',
      aria:({pct})=>`Share result: more unique than ${Math.round(pct)}% of users`
    },
    copy:{hint:'Click to copy',done:'Copied'},
    examplePrefix:'Example:',
    advicePrefix:'💡 Tip:',
    methodologyButton:'How is the percentage calculated?',
    methodSummary:'<b>How we calculate it</b>',
    methodText:'<p><b>What we measure</b></p><p>Your browser reveals 21\u00A0parameters to every website: browser type, OS, screen resolution, GPU, CPU cores, memory, languages, extensions, graphics and audio fingerprints, fonts, and more.</p><p><b>How we score</b></p><p>For each parameter we check how common it is. Chrome on Windows is extremely common. An older Firefox with an unusual GPU is rare\u00A0— and that rarity makes you stand out.</p><p>The more rare parameters match\u00A0— the higher your score.</p><p><b>Where the data comes from</b></p><p>Probabilities are based on public research by EFF\u00A0Panopticlick and FingerprintJS. We also account for correlations between signals (Safari always runs on Apple\u00A0GPU, so that pair doesn’t double-count).</p><p><b>What the percentage means</b></p><p>We simulate 25,000\u00A0virtual browsers and compare your result against them. If you scored 85%\u00A0— your fingerprint is more unique than 85% of simulated users.</p><p style="opacity:.7;font-size:13px">The score is computed in your browser; the parameters behind it are not uploaded.</p>',
    batteryUnavailable:'Not available in this browser',
    footer:version=>`© <a href="${PERSONAL_URL}" target="_blank" rel="noopener">morgunov.tech</a> • Local fingerprint audit • <button id="versionBtn" class="btn version-btn" title="Changelog">v${version}</button><br><span class="footer-note">Hosted on Cloudflare. Cloudflare Web Analytics collects anonymous visit statistics (no cookies, no personal data).</span><br><span id="footerVisitCount" class="footer-note" style="display:none"></span>`,
    errorMessage:msg=>`Error: ${msg}`,
    units:{cores:'cores',gb:'GB',mbps:'Mbps',ms:'ms',yes:'yes',no:'no'},
    labels:{touchPoints:'touch points',pointer:'pointer',latency:'latency',storage:{local:'Local storage',session:'Session storage',idb:'IndexedDB',cookies:'Cookies'}},
    formatFullness:(filled,total)=>`${Math.round(100*filled/Math.max(1,total))}% of data filled (${filled} of ~${total})`,
    story:{
      toggleStory:'📖 Story',
      toggleReport:'📊 Report',
      stage:'Stage',
      dangerTitle:'⚠️ Why this is dangerous',
      actionTitle:'🛡️ What to do',
      whoSees:'Who sees this:',
      difficulty:{easy:'Easy',medium:'Medium',hard:'Hard'},
      rows:{device:'Device',screen:'Screen',gpu:'GPU',dpr:'DPR',ip:'IP',isp:'ISP',vpn:'VPN/proxy',browser:'Browser',dnt:'DNT',gpc:'GPC',tls:'TLS',cipher:'Cipher',acceptLanguage:'Accept-Language',ua:'UA',canvas:'Canvas',audio:'Audio',webgl:'WebGL',webrtc:'WebRTC leak',trackers:'Trackers blocked'},
      on:'on',off:'off',yes:'⚠️ yes',no:'no',notChecked:'not checked',needsNetwork:'click “Check network”',
      s0:{
        title:'You opened your laptop',
        subtitle:'Before you even touch the internet, your device is already unique',
        who:'No one yet — but in a minute, any website will know',
        youtube:function(dev,scr,gpu){return 'You haven\'t even opened YouTube yet, but your '+dev+' with a '+scr+' screen already stands out among most users. YouTube will know this within seconds.';},
        danger:'The combination of device specs is already unique. The site doesn\'t know your name — but it knows you own a device in a certain price range. This is used for price discrimination: flights, hotels, subscriptions may cost more on an expensive device. Resolution + pixel ratio + GPU is almost a serial number.',
        action:'<ul><li>Enable "Letterboxing" mode in Firefox (resistFingerprinting) — rounds screen resolution</li><li>Consider Brave Browser — randomizes hardware parameters</li><li>Chrome: Canvas Blocker / Trace extension</li><li>Fully hiding your device is impossible, but you can make it less unique</li></ul>',
        actionDiff:'medium'
      },
      s1:{
        title:'You connected to Wi-Fi',
        subtitle:'Your ISP already knows you\'re online',
        who:'Your internet provider (ISP), the Wi-Fi hotspot owner',
        youtube:function(isp,ip){return 'When you type youtube.com, your ISP '+isp+' will log it. They won\'t see the video, but will know you visited YouTube at that time.';},
        danger:'Your ISP keeps a full log of domains. In many countries it\'s required to store them for 6 months to 3 years. The Wi-Fi owner sees the same. Your IP address links activity across different sites. Geo-blocking: content and prices change depending on your country.',
        action:'<ul><li>VPN from a trusted provider (Mullvad, ProtonVPN, IVPN)</li><li>Tor Browser — maximum anonymization</li><li>Encrypted DNS (DNS-over-HTTPS) — hides domains from your ISP</li><li>Don\'t use public Wi-Fi without a VPN</li></ul>',
        actionDiff:'easy'
      },
      s2:{
        title:'You opened your browser',
        subtitle:'Your browser already carries a set of unique characteristics',
        who:'Only your browser for now — but everything will be sent to the first site you visit',
        youtube:function(br,dnt,gpc){return 'You haven\'t typed youtube.com yet, but your '+br+' browser already exposes its own set of traits'+(dnt?', Do Not Track enabled':'')+(gpc?', GPC enabled':'')+'. This combination is like a fingerprint.';},
        danger:'A combination of 3–5 extensions can be unique among millions of users. Enabling Do Not Track paradoxically makes you more visible: less than 7% of users turn it on. Granted permissions (camera, location) reveal your habits.',
        action:'<ul><li>Minimize the number of extensions</li><li>Use popular extensions (uBlock Origin, Bitwarden)</li><li>Revoke unnecessary permissions in settings</li><li>Consider a separate browser profile for sensitive tasks</li></ul>',
        actionDiff:'easy'
      },
      s3:{
        title:'You typed youtube.com',
        subtitle:'Someone learned you want to open YouTube',
        who:'Your DNS provider — the one who translates domains to IP. By default — your ISP',
        youtube:'You typed youtube.com and pressed Enter. At that moment the DNS server received a request: give me YouTube\'s IP address. It won\'t know which video you\'ll watch, but its logs now have your IP and a timestamp.',
        danger:'A DNS log is a complete map of your interests. youtube.com → webmd.com → linkedin.com → zillow.com — the DNS server sees the chain and understands: this person got distracted from video, googled symptoms, is looking for a job, and is thinking about moving. In some jurisdictions DNS logs are used for censorship.',
        action:'<ul><li>Enable DNS-over-HTTPS: Chrome → Settings → Security → "Use secure DNS"</li><li>No-log DNS providers: Cloudflare (1.1.1.1), Quad9 (9.9.9.9), NextDNS</li><li>A VPN solves this automatically</li></ul>',
        actionDiff:'easy',
        isInfo:true
      },
      s4:{
        title:'Your browser connects to YouTube\'s server',
        subtitle:'The server recognized your handwriting before the page even loaded',
        who:'YouTube\'s server and any intermediary — corporate proxy, ISP deep packet inspection',
        youtube:function(tls){return 'Your browser shakes hands with YouTube\'s server via '+tls+' — and the way it does it is unique, like handwriting. Change your IP, clear cookies — the TLS fingerprint stays the same.';},
        danger:'The TLS fingerprint doesn\'t change when you change IP, VPN, or clear cookies. Morning from home Wi-Fi, evening through VPN — fingerprint matched, sessions linked. DPI systems use TLS fingerprinting to identify and block VPN protocols.',
        action:'<ul><li>Tor Browser standardizes the TLS fingerprint</li><li>Firefox + privacy.resistFingerprinting partially normalizes</li><li>Keep your browser updated — the fingerprint changes between versions</li><li>In regular Chrome/Safari/Edge there\'s no control</li></ul>',
        actionDiff:'hard'
      },
      s5:{
        title:'YouTube received your request',
        subtitle:'The server already knows your language, OS, and where you came from',
        who:'The site owner — in server logs. ANY owner of ANY website sees this',
        youtube:function(langs){return 'YouTube read: Accept-Language: '+langs+'. Now it knows your language profile. You didn\'t enter this — your browser sent it automatically.';},
        danger:'Accept-Language reveals nationality. Referer tells where you came from. The order of headers is a subtle but powerful identifier: it can\'t be spoofed by an extension. If you spoofed the User-Agent but Client Hints reveal the real browser — the mismatch is detected.',
        action:'<ul><li>Minimize your language list — keep 1–2 (en-US, en)</li><li>Referer control: Firefox — network.http.referer.XOriginPolicy = 2</li><li>Tor Browser standardizes headers</li><li>Header order cannot be controlled with extensions</li></ul>',
        actionDiff:'medium'
      },
      s6:{
        title:'YouTube loaded and ran its scripts',
        subtitle:'Invisible tests have already started — right now',
        who:'YouTube (Google) and any site with scripts',
        youtube:function(canvas,audio){return 'While you watch the video, YouTube draws an invisible image in the background (Canvas: '+canvas+'), plays a silent sound (Audio: '+audio+'), and renders a hidden 3D object. Private mode? The Canvas fingerprint stayed the same.';},
        danger:'Canvas/Audio/WebGL fingerprint — the primary tracking tool without cookies. Cleared history, changed account — fingerprint is the same because it depends on hardware. WebRTC leak: the site gets your real IP bypassing the VPN. Battery API: exact charge level = session identifier.',
        action:'<ul><li><b>Canvas</b>: CanvasBlocker (Firefox), Brave — built-in, Chrome — Trace</li><li><b>Audio</b>: Firefox + resistFingerprinting blocks it</li><li><b>WebGL</b>: can be disabled (webgl.disabled = true), but breaks some sites</li><li><b>WebRTC</b>: Firefox — media.peerconnection.enabled = false. Critical when using VPN</li><li><b>Battery</b>: Firefox and Brave restrict the API</li></ul>',
        actionDiff:'medium'
      },
      s7:{
        title:'10+ more companies are watching you',
        subtitle:'Ad networks see you not just on YouTube — but on thousands of sites',
        who:'Ad networks (Google Ads, Meta Pixel, Criteo), analytics, social widgets',
        youtube:function(blocked,total){return 'YouTube is Google. But Google\'s scripts run on most sites. Morning — repair video. Afternoon — hardware store. Evening — mortgage calculator. Three sites — one pixel.'+(blocked>0?' Your blocker blocked '+blocked+' of '+total+' checks.':' Your browser didn\'t block a single tracker.');},
        danger:'A typical page has dozens of third-party scripts. Each collects a fingerprint. Morning health article, afternoon lawyer search, evening apartment prices — one pixel, full picture of your life. Data broker leaks have found profiles tagged financial difficulties and health issues.',
        action:'<ul><li><b>uBlock Origin</b> — the gold standard. Essential</li><li>Extra lists in uBlock: "Annoyances" and "Privacy"</li><li>Firefox: Enhanced Tracking Protection → Strict</li><li>Brave: blocker is built-in</li><li>Firefox Multi-Account Containers — isolates sites from each other</li></ul>',
        actionDiff:'easy'
      },
      verdict:{
        title:'The full picture',
        subtitle:'Your digital fingerprint — from turning on your device to watching a video',
        now:'Right now (5 minutes):',
        nowList:['Install uBlock Origin','Enable DNS-over-HTTPS in browser settings','Revoke camera/mic/location from sites that don\'t need it'],
        weekend:'This weekend (30 minutes):',
        weekendList:['Set up a VPN (Mullvad / ProtonVPN)','Disable WebRTC leak','Install CanvasBlocker or switch to Brave'],
        advanced:'For advanced users:',
        advancedList:['Tor Browser for sensitive tasks','Firefox + resistFingerprinting','Separate browsers for different tasks']
      }
    },
    introRichHtml:/* html */`
      <section class="fp-section" lang="en" aria-labelledby="fp-title">
        <p>
          Every browser leaves a unique trail — a set of technical characteristics
          that websites read silently, without asking and without your permission.
          This is called a digital fingerprint. This service shows what is visible about you
          right now and explains how to reduce the risks.
        </p>
        <details>
          <summary class="intro-more">More about tracking and risks ▾</summary>
          <h3>How tracking works without cookies</h3>
          <p>
            You visited dozens of websites without signing up — leaving the same fingerprint everywhere.
            Then you created an account on one of them. Now ad networks can link
            all your past visits to your name and sell that profile.
          </p>
          <h3>Why this is dangerous</h3>
          <ul class="fp-list">
            <li>Stores raise prices based on your device and perceived spending power.</li>
            <li>Scammers know your city, ISP, and device — phishing becomes more precise.</li>
            <li>Insurance companies and employers buy profiles from data brokers.</li>
            <li>Once a database leaks, the profile cannot be “deleted” — it is tied to you forever.</li>
          </ul>
          <h3>How we process data</h3>
          <p>
            Your fingerprint, uniqueness score and profile are computed in your browser; the page does not upload them,
            and no third party sees them. The service is free, with no ads and no sign-up. What does go over the network:
          </p>
          <ul class="fp-list">
            <li>When the page opens: a request for aggregate stats to our server on Cloudflare, and a cookieless
              page view count by Cloudflare Web Analytics. Like any server, they see your IP address and browser.</li>
            <li>When you click “Check network”: requests to our server. It shows you your IP, ISP and headers,
              measures your speed and checks your IP with ipquery.io (ipinfo.io as fallback) and Google DNS.
              The report is cached under your IP for one hour; the anonymous stats (browser, OS, country) never get your IP.
              If our server is down, the browser asks public IP services directly
              (ipapi.co, freeipapi.com, ipify.org, myip.com).</li>
          </ul>
        </details>
      </section>
    `,
    shock:{title:'What the site knows about you'},
    heroConclusion:{
      high:'You are easy to identify. Websites you visit can tell it is you — even without signing in or using cookies. Below are simple steps that will change this.',
      med:'You can be identified, but not immediately. Your browser stands out, though it is not unique. A few simple steps will help you blend in.',
      low:'You are hard to identify. Your browser looks like many others — websites have difficulty singling you out. Good result.'
    },
    meta:{title:'Fingerprint — how anonymous are you online',description:'Shows what any website learns about you the moment you open it, how unique your browser is, and how to hide.'},
    rows:{
      location:'Location',date:'Date',time:'Time',timezone:'Timezone',languages:'Languages',device:'Device',ram:'💾 RAM',battery:'🔋 Battery',charging:', charging',
      browser:'Browser',permissions:'Permissions',ip:'Your IP address',isp:'ISP',connectionType:'Type',vpn:'VPN',webrtc:'WebRTC',browserData:'Browser data',
      detected:'Detected',notDetected:'Not detected',leak:'Leak: ',safe:'Safe',unavailable:'Unavailable',looksNatural:'Looks natural',inconsistencies:'Inconsistencies found',
      perms:{camera:'camera',microphone:'mic',geolocation:'geolocation'},
      connection:{wifi:'Wi-Fi',cellular:'Cellular',ethernet:'Ethernet',bluetooth:'Bluetooth'}
    },
    deviceNames:{
      androidFlagship:'Android flagship smartphone',androidPhone:'Android smartphone',androidTablet:'Android tablet',androidDevice:'Android device',
      windowsWorkstation:'powerful Windows workstation',windowsPowerful:'powerful Windows PC',windowsPc:'Windows PC',windowsLaptop:'Windows laptop',windowsBudget:'budget Windows PC',linux:'Linux system'
    },
    osint:{isp:'ISP',asn:'ASN',type:'Connection type',rep:'IP reputation',
      connection:{residential:'Home connection',datacenter:'Data center (suspicious)',vpn:'VPN/Proxy',mobile:'Mobile network'},
      clean:n=>`✅ Your IP is clean — not found in any blacklist (${n} databases checked)`,
      listed:hits=>`⚠️ Your IP is found in blacklists: ${hits}. This may mean your IP was previously used for spam. Some websites may block access, and emails from your address may land in spam.`,
      error:'Could not check the IP against the public databases'},
    networkError:'Network check failed',
    speedTest:{testing:'Testing...',failed:'Test failed',latency:'Latency'},
    contradictions:{
      title:'Consistency Check',
      consistent:'Data consistent',
      discrepancies:'Discrepancies found',
      significant:'Significant discrepancies',
      timezone:'Timezone',
      platform:'Platform',
      browser:'Browser',
      uaConsistency:'UA vs Client Hints',
      clientSide:'Browser',
      eduTitle:'What does this mean?',
      eduText:'Discrepancies between server-side and client-side data may indicate VPN usage, proxy, emulator, or fingerprint-spoofing tools. Websites use these mismatches to detect bots and fraudsters.'
    },
    relevantBadge:'⚡ Relevant for you',
    moreRecs:'More recommendations',
    vpnMore:'More on choosing a VPN',
    statVisitors:pct=>`${pct}% of visitors`,
    footerVisits:n=>`${n} fingerprints checked`,
    changelogTitle:'Changelog'
};
