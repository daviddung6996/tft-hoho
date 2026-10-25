import { useEffect, useState } from 'react';
import './ComingSoonPage.css';

type Lang = 'vi' | 'en';

const TEXT: Record<Lang, { message1: string; message2: string; title: string }> = {
  vi: {
    message1: 'Dự án đang phát triển sẽ sớm ra mắt',
    message2: 'hãy chờ đợi...',
    title: 'TFTISEASY - Sắp ra mắt | Coming Soon',
  },
  en: {
    message1: 'The project is under development and will launch soon',
    message2: 'please stay tuned...',
    title: 'TFTISEASY - Coming Soon',
  },
};

export const ComingSoonPage: React.FC = () => {
  // Default VI, like the tftiseasy Worker fallback (country unknown -> VN).
  // This page has no language toggle, so the visitor's IP country decides,
  // exactly like tftiseasy.com/protips: VN -> VI, everywhere else -> EN.
  // The country comes from Cloudflare's own /cdn-cgi/trace on this domain,
  // the same geo source the protips Worker reads as request.cf.country.
  const [lang, setLang] = useState<Lang>('vi');

  useEffect(() => {
    // Log maintenance mode activation
    console.info('[TFTISEASY] Maintenance mode active - Coming Soon page displayed');

    // Set page title
    document.title = TEXT[lang].title;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof fetch !== 'function') return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3000);
    fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        const match = text.match(/^loc=([A-Z]{2})$/m);
        if (match && match[1] !== 'VN') setLang('en');
      })
      .catch(() => {
        // Trace unavailable (local dev, non-Cloudflare host, timeout):
        // stay on the VI default, never blank the page.
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const copy = TEXT[lang];

  return (
    <main className="coming-soon-page" role="main" aria-label="Coming Soon Page">
      <div className="coming-soon-content">
        <div className="coming-soon-logo" aria-hidden="true">
          <picture>
            <source srcSet="/tftiseasy-logo.webp" type="image/webp" />
            <img
              src="/tftiseasy-logo.png"
              alt="TFTISEASY"
              className="coming-soon-avatar"
            />
          </picture>
        </div>
        
        <h1 className="coming-soon-title">
          TFTISEASY
        </h1>
        
        <p className="coming-soon-message">
          {copy.message1}<br />
          {copy.message2}
        </p>
        
        <div className="hex-divider" aria-hidden="true" role="separator" />
      </div>
    </main>
  );
};
