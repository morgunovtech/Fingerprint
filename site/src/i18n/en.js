// English strings of the page. Keys are the same in ru.js, en.js and uz.js; selftest.js checks that.
import { PERSONAL_URL, CANONICAL_URL } from '../config.js';

export default {
  langButton: 'Language',
  langLabels: { ru: 'Russian', en: 'English', uz: 'Uzbek' },
  theme: { label: 'Theme', modes: { auto: 'Auto', light: 'Light', dark: 'Dark', contrast: 'Contrast' } },
  meta: {
    title: 'Fingerprint — who learns what about you while you open a website',
    description: 'Six steps from opening your laptop to a loaded website: who learns what about you at each one, on your real data, and what to do about it.'
  },
  introTitle: 'Who learns what about you while you open a website',
  introRichHtml: /* html */`
      <section class="fp-section" lang="en" aria-labelledby="fp-title">
        <p>
          Between opening your laptop and a loaded web page, several companies learn something about you.
          This page walks through it step by step, on your real data: everything below is what your browser
          just handed to this site. Nothing is sent anywhere except one request you trigger yourself at step 3.
        </p>
        <details>
          <summary class="intro-more">How this page handles your data ▾</summary>
          <p>
            Everything is computed in your browser and never uploaded; no third party sees it. The service is free,
            with no ads and no sign-up. What does go out:
          </p>
          <ul class="fp-list">
            <li>On page load: a request for aggregate statistics to our server on Cloudflare, and Cloudflare Web Analytics
              counting the view without cookies. Like any server, they see your IP address and browser.</li>
            <li>On the button at step 3: requests to our server. It shows your IP, provider and headers, and checks the IP
              through ipquery.io (ipinfo.io as fallback) and Google DNS. The report is kept under your IP for an hour;
              the anonymous statistics (browser, OS, country) do not include the IP. If our server is down, the browser asks
              public IP services directly (ipapi.co, freeipapi.com, ipify.org, myip.com).</li>
          </ul>
        </details>
      </section>
    `,

  stepLabel: n => `Step ${n} of 6`,
  labels: {
    who: 'Who learns this',
    measured: 'Measured right now',
    afterCheck: 'Appears after the check at step 3',
    notVisible: 'Not visible from a web page: this is how the system works',
    how: 'How it works',
    danger: 'Why it matters',
    action: 'What to do',
    nothingToDo: 'Nothing to do here'
  },

  parties: {
    nobody: 'Nobody yet',
    nobodyNote: 'but the browser will show this device passport to every site at step 6',
    osVendor: 'maker of the system',
    distro: 'the distribution’s community',
    distroNote: 'usually no telemetry',
    isp: 'your provider',
    ispUnknown: 'your internet provider',
    carrier: 'your mobile carrier',
    wifiOwner: 'the owner of the Wi-Fi router',
    wifiOwnerNote: 'home, office, café',
    everySite: 'every website',
    everySiteNote: 'sees your IP address',
    browserVendor: 'maker of the browser',
    extensions: 'your extensions',
    extensionsNote: 'see the content of pages',
    dns: 'the DNS server',
    dnsDefault: 'by default, your provider’s',
    cloudflare: 'Cloudflare',
    cloudflareNote: 'the network this site runs on',
    siteOwner: 'the site owner',
    siteOwnerNote: 'here, morgunov.tech',
    adNetworks: 'ad networks and analytics',
    adNetworksNote: 'none on this page; 10 to 30 on a typical site'
  },
  vendors: { apple: 'Apple', microsoft: 'Microsoft', google: 'Google', mozilla: 'Mozilla', brave: 'Brave Software', yandex: 'Yandex', opera: 'Opera', samsung: 'Samsung', vivaldi: 'Vivaldi', arc: 'The Browser Company' },

  rows: {
    device: 'Device', screen: 'Screen', gpu: 'Graphics card', memory: 'Memory', cores: 'Processor', battery: 'Battery', charging: ', charging',
    timezone: 'Time zone', languages: 'System languages', localTime: 'Time on the device',
    os: 'System', vendor: 'Maker', arch: 'Architecture',
    ip: 'Your IP address', isp: 'Provider', location: 'Where the IP places you', connection: 'Connection type', vpn: 'VPN or proxy', ipTimezone: 'Time zone of the IP',
    browser: 'Browser', blocker: 'Ad blocker', dnt: 'Do Not Track', gpc: 'Global Privacy Control', permissions: 'Granted permissions', cookies: 'Cookies', storage: 'Site storage',
    host: 'This site runs on', tls: 'Encryption version (TLS)', http: 'HTTP protocol', colo: 'Nearest network node',
    userAgent: 'User-Agent', acceptLanguage: 'Languages the browser asked for', clientHints: 'Client Hints', headerOrder: 'Headers in the request',
    canvas: 'Graphics fingerprint (Canvas)', audio: 'Audio fingerprint', webgl: 'Graphics card fingerprint (WebGL)', fonts: 'Fonts', webrtc: 'Address leak through WebRTC', thirdParty: 'Third-party resources on this page',
    detected: 'detected', notDetected: 'not detected', yes: 'yes', no: 'no', on: 'on', off: 'off', none: 'none', unknown: 'not reported',
    leak: 'an address is visible', safe: 'none found', notChecked: 'not checked', found: n => `${n} found`, mismatch: (ip, local) => `IP says ${ip}, device says ${local}`, same: 'matches the device',
    coresValue: n => `${n} cores`, memoryValue: n => `≈${n} GB`,
    fontsFound: n => `${n} ${n === 1 ? 'font' : 'fonts'}`
  },
  connection: { residential: 'home or office', mobile: 'mobile network', datacenter: 'data centre', vpn: 'VPN or proxy' },
  perms: { camera: 'camera', microphone: 'microphone', geolocation: 'location' },
  deviceNames: {
    androidFlagship: 'Android flagship smartphone', androidPhone: 'Android smartphone', androidTablet: 'Android tablet', androidDevice: 'Android device',
    windowsWorkstation: 'powerful Windows workstation', windowsPowerful: 'powerful Windows PC', windowsPc: 'Windows PC', windowsLaptop: 'Windows laptop', windowsBudget: 'budget Windows PC', linux: 'Linux system'
  },

  steps: {
    s1: {
      title: { laptop: 'You opened your laptop', phone: 'You unlocked your phone', tablet: 'You picked up your tablet', desktop: 'You switched on your computer' },
      subtitle: 'Before any internet, the device is already described: model, screen, memory, time zone, languages',
      how: 'A site needs no permission to read the screen size, the number of cores, the memory or the time zone: the browser hands them to any script. Each is a detail; together they are a recognisable device passport.',
      danger: 'The device passport gives away the class and price of your hardware. Shops and booking sites can show owners of expensive devices higher prices. The time zone and languages hint at where you live, even without an IP address.',
      action: 'This is ordinary data, and hiding it breaks websites. The one thing to remember: it goes to every site, unasked. Protection starts at step 4.'
    },
    s2: {
      title: 'The operating system started',
      lead: (os, vendor) => (vendor ? `You run ${os}. ${vendor} makes it, and from the moment it boots the system goes online on its own.` : `You run ${os}. From the moment it boots the system goes online on its own.`),
      how: 'The system checks for updates, syncs the clock, verifies the signatures of programs it launches (Apple), sends diagnostics (Microsoft, Google). The maker learns that the device is on, roughly where it is (from the Wi-Fi networks it sees) and its serial number.',
      danger: 'Not tracking in the everyday sense, but the maker holds an exact log of when and where the device went online. It is handed over on legal request and leaks in breaches.',
      action: {
        mac: 'System Settings → Privacy & Security → Analytics & Improvements: untick “Share Mac Analytics”.',
        ios: 'Settings → Privacy & Security → Analytics & Improvements: switch everything off.',
        windows: 'Settings → Privacy → Diagnostics & feedback: keep only the required data.',
        android: 'Settings → Google → All services → Usage & diagnostics: switch off.',
        chromeos: 'Settings → Privacy and security: turn off sending usage data.',
        linux: 'Usually nothing to switch off: most distributions send no telemetry.',
        other: 'Find “Diagnostics” or “Analytics” in the system settings and turn off data sharing.'
      }
    },
    s3: {
      title: { wifi: 'You joined a Wi-Fi network', cellular: 'You went online through your mobile carrier', other: 'You connected to the internet' },
      subtitle: 'The provider learns you are online and sees the address of every site you visit',
      check: {
        button: 'See what the provider sees',
        note: 'One request to our server on Cloudflare. Like any site, it sees your IP address and browser headers, asks ipquery.io and Google DNS who the address belongs to, and returns the answer to you. The report is kept under your IP for an hour; the anonymous statistics do not include the IP.',
        loading: 'Asking…',
        recheck: 'Check again',
        failed: 'The server did not answer. Try again later.'
      },
      how: 'The provider assigns your IP address and carries all your traffic. It cannot read encrypted pages, but it sees the names of sites: in DNS lookups and at the start of every connection (the SNI field). The owner of the Wi-Fi router sees the same.',
      danger: 'The log of addresses is kept for months or years: in many countries the law obliges the provider to. Sites use the IP to tell your country and city, change prices and availability, and anti-fraud systems link your actions across sites.',
      action: 'A VPN with an audited no-logs policy (Mullvad, ProtonVPN) hides site names from the provider, but moves the same trust to the VPN service. If a VPN is already on, pick a server in the country of your time zone: the mismatch gives the VPN away to sites.'
    },
    s4: {
      title: name => `You opened ${name}`,
      subtitle: 'The browser adds its own traits and settings to the device passport',
      how: 'The maker of the browser sees more than any site: your history, if sync is on, and every address checked against Safe Browsing. Extensions see the content of the pages they have access to. Sites see the version, the settings and the permissions you granted.',
      danger: 'A granted camera, microphone or location permission is used without asking again. A rare browser, an unusual set of extensions or Do Not Track switched on make you stand out by themselves: few people are set up that way.',
      action: {
        chrome: 'chrome://settings/content: revoke camera, microphone and location from sites that do not need them. Install uBlock Origin Lite from the Chrome Web Store.',
        firefox: 'Settings → Privacy & Security → Enhanced Tracking Protection: Strict. Install uBlock Origin. Turn on Global Privacy Control: about:config → privacy.globalprivacycontrol.enabled → true.',
        brave: 'Shields are already on. Check Settings → Shields → Block fingerprinting: Strict. Revoke spare permissions in brave://settings/content.',
        safari: 'Settings → Privacy → “Prevent cross-site tracking”. Install AdGuard for Safari from the App Store. Site permissions are under Settings → Websites.'
      }
    },
    s5: {
      title: 'You typed the site’s address',
      subtitle: 'Before the page opens, the site’s name goes to DNS and the browser introduces itself to the server',
      how: 'First the browser asks a DNS server for the site’s IP. By default that is the provider’s server, and it records every name. Then the browser opens an encrypted connection: the content is encrypted, but the site’s name in the first packet is open (SNI), and the connection parameters, the encryption version and cipher set, are one more trait of the browser.',
      danger: 'A DNS log is a map of interests. youtube.com, webmd.com, a job board, a flat-rental site in one evening tell a story without a single page being read. In some countries DNS logs are used for blocking.',
      action: 'Turn on DNS over HTTPS: Chrome → Settings → Privacy → Use secure DNS; Firefox → Settings → Privacy → DNS over HTTPS; Android → Settings → Network → Private DNS; iOS through a DoH profile. The provider stops seeing DNS lookups. It still sees the site name in SNI: only a VPN closes that.'
    },
    s6: {
      title: 'The site loaded',
      subtitle: 'The server got the request, the page ran its scripts: everything from steps 1–5 is now with the site',
      serverTitle: 'What the server got before any script ran',
      scriptsTitle: 'What this page’s scripts collected',
      baitTitle: 'Ad-blocker check',
      baitNote: 'Three bait elements on this page with the class names blockers hide, plus two browser signals. Nothing is loaded from anywhere.',
      how: 'Before any script, the server gets the User-Agent, the languages and the order of headers. Then scripts draw an invisible image and play a silent sound: the result depends on the graphics card and drivers, the same for you every time and different for others. That is how a site recognises you without cookies and after a cleared history.',
      danger: 'The same fingerprint on thousands of sites sharing one ad network adds up to a profile: interests, purchases, routes, health. Profiles are sold to data brokers, they leak, and they cannot be deleted.',
      action: {
        chrome: 'uBlock Origin Lite blocks the trackers. Chrome does not protect against fingerprinting: keep a second browser, Brave or Firefox, for sensitive tasks.',
        firefox: 'uBlock Origin plus about:config → privacy.resistFingerprinting → true: Firefox will give every site the same picture.',
        brave: 'Shields → Block fingerprinting: Strict. Brave adds noise to Canvas and audio, so the fingerprint changes from site to site.',
        safari: 'Safari partly protects against fingerprinting by itself. Add AdGuard for Safari against the trackers.'
      }
    }
  },

  trackers: {
    pixel: { name: 'Bait for an ad pixel', blocked: 'Blocked', open: 'Not blocked' },
    analytics: { name: 'Bait for an analytics script', blocked: 'Blocked', open: 'Not blocked' },
    iframe: { name: 'Bait for an ad unit', blocked: 'Blocked', open: 'Not blocked' },
    dnt: { name: 'Do Not Track signal', blocked: 'On', open: 'Off' },
    gpc: { name: 'Global Privacy Control signal', blocked: 'On', open: 'Off' },
    verdict: (blocked, total) => {
      if (blocked >= 3) return `A blocker is in place: ${blocked} of ${total} checks passed.`;
      if (blocked >= 1) return `Partial protection: ${blocked} of ${total}. The baits left in place would be live trackers on an ordinary site.`;
      return `Nothing blocked (0 of ${total}). On an ordinary site every tracker and pixel would have fired.`;
    }
  },

  summary: {
    title: 'The sum: who learned what',
    lead: 'You have not typed a name or a password yet. Here is who already knows something about you:',
    parties: {
      os: vendor => `${vendor}: the device is on, its model and system version, its rough location`,
      isp: name => `${name}: your IP address, when you went online, the name of every site`,
      ispPending: 'Your provider: IP address, when you went online, the name of every site. Press the button at step 3 and its name appears here',
      browser: vendor => `${vendor}: browser version and settings; with sync on, your history`,
      dns: name => `The DNS server (${name}): the name of every site you opened`,
      cloudflare: 'Cloudflare: your IP, your browser and the fact of this request',
      site: items => `This site: all of the above plus the browser fingerprint (${items})`
    },
    checklistTitle: 'What to do, one thing per step',
    shareButton: 'Share',
    saveButton: 'Print / Save',
    share: {
      text: ({ device, parties, url }) => `While I opened one website from my ${device}, these learned about me: ${parties}. Check yourself in a minute: ${url}`,
      title: 'Who learns about you while you open a website',
      copied: 'Text copied',
      shared: 'Shared',
      error: 'Could not share. Copy the address by hand.',
      unavailable: 'Wait, the page is still collecting data'
    }
  },

  details: {
    title: 'Everything the browser handed over',
    groups: { device: 'Device', browser: 'Browser', network: 'Network', server: 'What the server saw', fingerprint: 'Fingerprints' },
    pending: 'appears after the check at step 3',
    copy: 'Click to copy',
    copied: 'Copied'
  },

  units: { gb: 'GB', yes: 'yes', no: 'no' },
  footer: version => `© <a href="${PERSONAL_URL}" target="_blank" rel="noopener">morgunov.tech</a> • Everything is computed in your browser • <button id="versionBtn" class="btn version-btn" title="Changelog">v${version}</button><br><span class="footer-note">Hosted on Cloudflare. Cloudflare Web Analytics collects anonymous visit statistics (no cookies, no personal data).</span><br><span id="footerVisitCount" class="footer-note" style="display:none"></span>`,
  footerVisits: n => `Checked ${n} times`,
  statVisitors: pct => `${pct}% of visitors`,
  changelogTitle: 'Changelog',
  errorMessage: msg => `Error: ${msg}`,
  shareUrl: CANONICAL_URL
};
