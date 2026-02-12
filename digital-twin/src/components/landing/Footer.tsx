'use client';

import Link from 'next/link';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSectionLinks {
  product: readonly FooterLink[];
  company: readonly FooterLink[];
  legal: readonly FooterLink[];
}

export interface FooterProps {
  links: FooterSectionLinks;
  socialLinks: readonly FooterLink[];
  copyrightText: string;
}

/**
 * Footer Component
 * Main footer with links and social media
 */
export function Footer({ links, socialLinks, copyrightText }: FooterProps) {
  const sections = [
    { title: 'Product', links: links.product },
    { title: 'Company', links: links.company },
    { title: 'Legal', links: links.legal },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Links Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Digital Twin</h3>
            <p className="text-gray-600 text-sm">Your AI-powered career companion</p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-gray-900 mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-green-600 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          {/* Copyright & Social */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">{copyrightText}</p>

            {/* Social Links */}
            <div className="flex gap-6">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-green-600 text-sm transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
