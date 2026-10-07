import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { businessConfig } from '../lib/businessConfig';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Contact', path: '/contact' },
  { label: 'Track', path: '/track' },
];

export default function Navbar({ currentPath, navigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <nav className="container-max flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('/')} className="focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg" aria-label="Go to homepage">
          <Logo variant="dark" size="md" />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                currentPath === link.path
                  ? 'text-brand-700'
                  : 'text-slate-600 hover:text-brand-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={businessConfig.phoneTel}
            className="btn-ghost"
            aria-label={`Call ${businessConfig.phone}`}
          >
            <Phone className="h-4 w-4" />
            {businessConfig.phone}
          </a>
          <button onClick={() => handleNav('/book')} className="btn-primary">
            Book a Notary
          </button>
        </div>

        <button
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-slate-100 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                  currentPath === link.path
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <a href={businessConfig.phoneTel} className="btn-secondary w-full">
                <Phone className="h-4 w-4" />
                Call {businessConfig.phone}
              </a>
              <button onClick={() => handleNav('/book')} className="btn-primary w-full">
                Book a Notary
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
