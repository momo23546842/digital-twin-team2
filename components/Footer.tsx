"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">
            <span className="logo-icon">⚡</span>
            <span>Digital Twin</span>
          </span>
          <p className="footer-tagline">AI-powered professional portfolio assistant</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Product</h4>
            <a href="/chat">Chat</a>
            <a href="/">Portfolio</a>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <a href="/admin">Admin</a>
            <a href="#">About</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Digital Twin — Built with AI</p>
      </div>
      <style jsx>{`
        .footer {
          width: 100%;
          background: rgba(10, 10, 15, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 4rem;
        }
        .footer-container {
          max-width: 72rem;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-brand {
          max-width: 280px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.125rem;
          color: #fff;
        }
        .logo-icon {
          font-size: 1.25rem;
        }
        .footer-tagline {
          color: #71717a;
          font-size: 0.875rem;
          margin-top: 0.75rem;
          line-height: 1.5;
        }
        .footer-links {
          display: flex;
          gap: 4rem;
        }
        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-column h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }
        .footer-column a {
          font-size: 0.875rem;
          color: #71717a;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-column a:hover {
          color: #a78bfa;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem;
          text-align: center;
        }
        .footer-bottom p {
          margin: 0;
          font-size: 0.8125rem;
          color: #52525b;
        }
        @media (max-width: 640px) {
          .footer-container {
            flex-direction: column;
          }
          .footer-links {
            gap: 2rem;
          }
        }
      `}</style>
    </footer>
  );
}
