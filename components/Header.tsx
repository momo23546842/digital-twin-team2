"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Digital Twin</span>
        </Link>
        <nav className="header-nav">
          <Link href="/chat" className="nav-link">Chat</Link>
          {/* Admin link removed intentionally; dashboard is private */}
          <Link href="/chat" className="btn btn-primary btn-sm">Get Started</Link>
        </nav>
      </div>
      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .header-container {
          max-width: 72rem;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.125rem;
          color: #fff;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .header-logo:hover {
          opacity: 0.9;
        }
        .logo-icon {
          font-size: 1.25rem;
        }
        .logo-text {
          background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .header-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #a1a1aa;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: #fff;
        }
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
        }
        @media (max-width: 640px) {
          .header-nav {
            gap: 1rem;
          }
          .btn-sm {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
