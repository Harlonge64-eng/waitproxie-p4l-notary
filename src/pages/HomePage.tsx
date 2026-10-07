import { Phone, BookOpen, ArrowRight, ShieldCheck, MapPin, FileCheck, MessageSquareShare, UserCheck, Bell, Clock } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';

interface HomePageProps {
  navigate: (path: string) => void;
}

const trustItems = [
  { icon: UserCheck, title: 'Commissioned Virginia Notary Public', desc: 'Walt Dimitri Poitevien, Commission #' + businessConfig.notary.commissionNumber },
  { icon: MapPin, title: 'Richmond & North Chesterfield Service Area', desc: 'Serving surrounding Virginia communities' },
  { icon: Clock, title: 'Mobile Appointment Options', desc: 'Convenient scheduling at agreed-upon locations' },
  { icon: FileCheck, title: 'Professional Document Handling', desc: 'Secure and confidential processing' },
  { icon: ShieldCheck, title: 'Secure Customer Communication', desc: 'Your information is protected' },
  { icon: MessageSquareShare, title: 'Designed Around Virginia Notarial Requirements', desc: 'Professional and compliant service' },
];

const servicePreview = [
  { title: 'Mobile Notary Services', desc: 'Professional notarial services at a convenient location agreed upon with the customer.' },
  { title: 'General Document Notarization', desc: 'Professional notarial support for eligible documents requiring notarization.' },
  { title: 'Business & Personal Documents', desc: 'Professional notarial support for eligible business and personal documents.' },
  { title: 'Specialized Documents', desc: 'Powers of attorney, real-estate documents, vehicle titles, loan/signing documents, wills and trusts, and international documents.' },
];

export default function HomePage({ navigate }: HomePageProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="container-max relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-500">
              {businessConfig.businessName}
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Professional Notary Services, Wherever You Need Them.
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-brand-100 sm:text-xl">
              Convenient mobile notary services serving Richmond, North Chesterfield, and surrounding Virginia areas.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={() => navigate('/book')} className="btn-accent w-full sm:w-auto">
                <BookOpen className="h-5 w-5" />
                Book a Notary
              </button>
              <button onClick={() => navigate('/services')} className="btn-secondary w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                View Services
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href={businessConfig.phoneTel} className="btn-ghost w-full text-white hover:bg-white/10 sm:w-auto">
                <Phone className="h-4 w-4" />
                Call {businessConfig.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-max">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-brand-800 sm:text-4xl">Why Choose P4L</h2>
            <p className="text-lg text-slate-600">Professional, reliable, and designed around Virginia notarial requirements.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item, i) => (
              <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <item.icon className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-brand-800">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-brand-800 sm:text-4xl">Our Services</h2>
            <p className="text-lg text-slate-600">Professional notarial support for a wide range of document types.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {servicePreview.map((service, i) => (
              <div key={i} className="card">
                <h3 className="mb-2 text-lg font-semibold text-brand-800">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/services')} className="btn-secondary">
              View All Services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* RON Coming Soon */}
      <section className="section-padding bg-gradient-to-br from-slate-100 to-brand-50">
        <div className="container-max">
          <div className="mx-auto max-w-3xl rounded-2xl border border-accent-200 bg-white p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
              <Bell className="h-8 w-8 text-accent-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-brand-800">Remote Online Notarization — Coming Soon</h2>
            <p className="mb-8 text-slate-600">
              {businessConfig.ron.comingSoonText}
            </p>
            <button onClick={() => navigate('/ron')} className="btn-primary">
              <Bell className="h-4 w-4" />
              Notify Me When Available
            </button>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-brand-800 sm:text-4xl">Serving Virginia Communities</h2>
              <p className="mb-4 text-lg text-slate-600">
                {businessConfig.serviceAreas}.
              </p>
              <p className="text-slate-600">
                {businessConfig.serviceAreasExtended}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Richmond', 'North Chesterfield', 'Surrounding Areas'].map((area) => (
                  <span key={area} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="h-6 w-6 text-brand-700" />
                <h3 className="text-xl font-semibold text-brand-800">Our Location</h3>
              </div>
              <p className="text-slate-700">
                {businessConfig.address.street}<br />
                {businessConfig.address.city}, {businessConfig.address.state} {businessConfig.address.zip}
              </p>
              <a
                href={businessConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Get Directions &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-brand-800">
        <div className="container-max text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Need a Notary?</h2>
          <p className="mb-8 text-lg text-brand-100">
            Schedule a convenient appointment with {businessConfig.businessName}.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => navigate('/book')} className="btn-accent w-full sm:w-auto">
              <BookOpen className="h-5 w-5" />
              Book a Notary
            </button>
            <a href={businessConfig.phoneTel} className="btn-secondary w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
              <Phone className="h-4 w-4" />
              Call {businessConfig.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
