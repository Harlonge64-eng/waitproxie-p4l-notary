import { DollarSign, Phone, BookOpen, Info } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';

interface PricingPageProps {
  navigate: (path: string) => void;
}

const pricingFactors = [
  { label: 'Number of Notarial Acts', desc: 'Pricing may vary based on the number of notarial acts required.' },
  { label: 'Number of Signers', desc: 'Additional signers may affect the total cost.' },
  { label: 'Mobile Travel Distance', desc: 'Travel to your location is factored into the price.' },
  { label: 'Printing', desc: 'Document printing services, if needed, may be included.' },
  { label: 'Scanning', desc: 'Document scanning services, if needed, may be included.' },
  { label: 'After-Hours Appointments', desc: 'Appointments outside standard hours may have additional fees.' },
  { label: 'Weekend Appointments', desc: 'Weekend service may have additional fees.' },
  { label: 'Rush Service', desc: 'Expedited service requests may incur additional fees.' },
];

export default function PricingPage({ navigate }: PricingPageProps) {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-16 text-center sm:py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Pricing</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            Transparent, configurable pricing based on your specific notary needs.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max max-w-4xl">
          <div className="card mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
              <DollarSign className="h-6 w-6 text-brand-700" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-brand-800">How Our Pricing Works</h2>
            <p className="text-slate-600">
              P4L Mobile Notary Services LLC offers configurable pricing based on several factors. After you submit a booking request, you'll receive a price estimate tailored to your specific needs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pricingFactors.map((factor, i) => (
              <div key={i} className="card">
                <h3 className="mb-1 font-semibold text-brand-800">{factor.label}</h3>
                <p className="text-sm text-slate-600">{factor.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-info-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Getting Your Price Estimate</h3>
                <p className="mt-1 text-sm text-blue-700">
                  All prices are in USD. Submit a booking request with your document details and requirements, and you'll receive a personalized price estimate before your appointment is confirmed.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => navigate('/book')} className="btn-primary">
              <BookOpen className="h-5 w-5" />
              Book a Notary
            </button>
            <a href={businessConfig.phoneTel} className="btn-secondary">
              <Phone className="h-4 w-4" />
              Call for a Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
