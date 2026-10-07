import { ShieldCheck, Award, BookOpen, Phone } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export default function AboutPage({ navigate }: AboutPageProps) {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-16 text-center sm:py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">About P4L Mobile Notary Services LLC</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            Professional, convenient, and reliable notarial services.
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-800">Our Commitment</h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-700">
                P4L Mobile Notary Services LLC is committed to providing convenient and professional notarial services for individuals, families, businesses, and organizations throughout Richmond, North Chesterfield, and surrounding Virginia areas.
              </p>
              <p className="mb-4 text-slate-600">
                We understand that notarization needs don't always happen during standard business hours or at a convenient office. That's why we offer mobile appointment options, bringing professional notary services to a location agreed upon with the customer.
              </p>
              <p className="text-slate-600">
                {businessConfig.serviceAreasExtended}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-brand-700" />
                <h3 className="text-xl font-semibold text-brand-800">Notary Information</h3>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Name</dt>
                  <dd className="text-lg font-semibold text-brand-800">{businessConfig.notary.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Title</dt>
                  <dd className="text-lg text-slate-800">{businessConfig.notary.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Commission Number</dt>
                  <dd className="text-lg text-slate-800">{businessConfig.notary.commissionNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Commission Expiration</dt>
                  <dd className="text-lg text-slate-800">{businessConfig.notary.commissionExpiration}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                <ShieldCheck className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-brand-800">Designed Around Virginia Notarial Requirements</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                <Award className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-brand-800">{businessConfig.notary.titlePhrase}</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                <BookOpen className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-brand-800">AI-Assisted Preliminary Intake</h3>
              <p className="mt-1 text-sm text-slate-500">For appointment preparation only</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-800 py-12 text-center">
        <div className="container-max px-4">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Ready to Work With Us?</h2>
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
