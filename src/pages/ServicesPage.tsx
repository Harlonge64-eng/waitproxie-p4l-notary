import { FileText, Building2, Briefcase, ScrollText, Bell, BookOpen, Phone } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';

interface ServicesPageProps {
  navigate: (path: string) => void;
}

const services = [
  {
    icon: FileText,
    title: 'Mobile Notary Services',
    desc: 'Professional notarial services at a convenient location agreed upon with the customer.',
  },
  {
    icon: Building2,
    title: 'General Document Notarization',
    desc: 'Professional notarial support for eligible documents requiring notarization.',
  },
  {
    icon: Briefcase,
    title: 'Business & Personal Documents',
    desc: 'Professional notarial support for eligible business and personal documents.',
  },
  {
    icon: ScrollText,
    title: 'Specialized Documents',
    desc: 'Documents such as powers of attorney, real-estate documents, vehicle titles, loan/signing documents, wills and trusts, and international documents. These are routed for manual review where appropriate.',
    note: 'Specialized and international documents may require review by the commissioned notary before the appointment can be confirmed.',
  },
];

export default function ServicesPage({ navigate }: ServicesPageProps) {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-16 text-center sm:py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Our Notary Services</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            Professional notarial services for individuals, families, businesses, and organizations throughout Richmond, North Chesterfield, and surrounding Virginia communities.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max">
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((service, i) => (
              <div key={i} className="card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <service.icon className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-brand-800">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
                {service.note && (
                  <p className="mt-3 rounded-lg bg-warning-50 px-4 py-2 text-sm text-warning-800">
                    {service.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* RON Card */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-accent-300 bg-accent-50/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
              <Bell className="h-7 w-7 text-accent-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-brand-800">Remote Online Notarization</h3>
            <span className="inline-block rounded-full bg-accent-200 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-800">
              Coming Soon
            </span>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              {businessConfig.ron.comingSoonText}
            </p>
            <button onClick={() => navigate('/ron')} className="btn-primary mt-6">
              <Bell className="h-4 w-4" />
              Notify Me
            </button>
          </div>
        </div>
      </section>

      <section className="bg-brand-800 py-12 text-center">
        <div className="container-max px-4">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Ready to Book?</h2>
          <p className="mb-6 text-brand-100">Schedule a convenient appointment with P4L Mobile Notary Services LLC.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => navigate('/book')} className="btn-accent">
              <BookOpen className="h-5 w-5" />
              Book a Notary
            </button>
            <a href={businessConfig.phoneTel} className="btn-secondary border-white/30 text-white hover:bg-white/10">
              <Phone className="h-4 w-4" />
              Call {businessConfig.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
