import { ArrowLeft, FileText } from 'lucide-react';

interface LegalPageProps {
  title: string;
  navigate: (path: string) => void;
  sections: { heading: string; body: string }[];
}

export default function LegalPage({ title, navigate, sections }: LegalPageProps) {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-12 text-center sm:py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="text-brand-100">P4L Mobile Notary Services LLC</p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max max-w-4xl">
          <button onClick={() => navigate('/')} className="btn-ghost mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
              <FileText className="h-6 w-6 text-brand-700" />
              <h2 className="text-2xl font-bold text-brand-800">{title}</h2>
            </div>
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i}>
                  <h3 className="mb-2 text-lg font-semibold text-brand-800">{section.heading}</h3>
                  <p className="leading-relaxed text-slate-700">{section.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400">
                This page was last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. For questions about this policy, contact us at waltpoitevien734@gmail.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
