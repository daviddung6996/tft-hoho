import { useEffect } from 'react';
import './ComingSoonPage.css';

export const ComingSoonPage: React.FC = () => {
  useEffect(() => {
    // Log maintenance mode activation
    console.info('[TFTISEASY] Maintenance mode active - Coming Soon page displayed');
    
    // Set page title
    document.title = 'TFTISEASY - Sắp ra mắt | Coming Soon';
  }, []);

  return (
    <main className="coming-soon-page" role="main" aria-label="Coming Soon Page">
      <div className="coming-soon-content">
        <div className="coming-soon-logo" aria-hidden="true">
          <img
            src="/coach-assets/tftiseasy-thumb.png"
            alt="TFTISEASY"
            className="coming-soon-avatar"
          />
        </div>
        
        <h1 className="coming-soon-title">
          TFTISEASY
        </h1>
        
        <p className="coming-soon-message">
          Dự án đang phát triển sẽ sớm ra mắt<br />
          hãy chờ đợi...
        </p>
        
        <div className="hex-divider" aria-hidden="true" role="separator" />
      </div>
    </main>
  );
};
