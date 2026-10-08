import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Logo from './Logo';
import { businessConfig } from '../lib/businessConfig';

interface FooterProps {
  navigate: (path: string) => void;
}

const legalLinks = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms of Service', path: '/terms-of-service' },
  { label: 'Refund & Cancellation', path: '/refund-cancellation' },
  { label: 'Document Storage', path: '/document-storage' },
  { label: 'Data Security', path: '/data-security' },
  { label: 'No Legal Advice', path: '/no-legal-advice' },
  { label: 'RON Information', path: '/ron-information' },
];

const quickLinks = [
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Book a Notary', path: '/book' },
  { label: 'Track Request', path: '/track' },
  { label: 'Contact', path: '/contact' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Admin Login', path: '/admin' },
];

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-brand-900 text-slate-300">
      <div className="container-max px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="light" size="md" />
            <p className="text-sm leading-relaxed text-slate-400">
              Professional notary services serving Richmond, North Chesterfield, and surrounding Virginia areas.
            </p>
            <p className="text-xs text-slate-500">
              {businessConfig.notary.titlePhrase}
              <br />
              Commission #{businessConfig.notary.commissionNumber}
              <br />
              Expires {businessConfig.notary.commissionExpiration}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-500">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-500">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-500">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href={businessConfig.phoneTel} className="flex items-start gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {businessConfig.phone}
                </a>
              </li>
              <li>
                <a href={businessConfig.emailLink} className="flex items-start gap-2 text-sm text-slate-400 transition-colors hover:text-white break-all">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {businessConfig.email}
                </a>
              </li>
              <li>
                <a href={businessConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    {businessConfig.address.street}<br />
                    {businessConfig.address.city}, {businessConfig.address.state} {businessConfig.address.zip}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>By appointment</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {businessConfig.businessName}. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {businessConfig.legalDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
