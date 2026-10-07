import { useState, FormEvent } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, Video, ShieldCheck, UserCheck } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';
import { supabase } from '../lib/supabase';

interface RonPageProps {
  navigate: (path: string) => void;
}

export default function RonPage({ navigate }: RonPageProps) {
  const [form, setForm] = useState({ name: '', email: '', consent: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setStatus('error');
      setErrorMsg('Please provide consent to be notified.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');

    try {
      const { error } = await supabase.from('ron_notification_leads').insert({
        name: form.name,
        email: form.email,
        consent: form.consent,
      });

      if (error) throw error;

      setStatus('success');
      setForm({ name: '', email: '', consent: true });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-16 text-center sm:py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/20">
            <Bell className="h-8 w-8 text-accent-500" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Remote Online Notarization</h1>
          <span className="inline-block rounded-full bg-accent-500 px-6 py-2 text-sm font-bold uppercase tracking-wider text-white">
            Coming Soon
          </span>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max">
          <div className="mx-auto max-w-3xl">
            <div className="card text-center">
              <p className="text-lg leading-relaxed text-slate-700">
                {businessConfig.ron.comingSoonText}
              </p>
            </div>

            {/* What RON Will Offer */}
            <div className="mt-8">
              <h2 className="mb-6 text-2xl font-bold text-brand-800">What RON Will Offer</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                    <Video className="h-6 w-6 text-brand-700" />
                  </div>
                  <h3 className="font-semibold text-brand-800">Live Audio-Video Session</h3>
                  <p className="mt-1 text-sm text-slate-600">Remote notarization through an approved platform</p>
                </div>
                <div className="card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                    <UserCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <h3 className="font-semibold text-brand-800">Identity Verification</h3>
                  <p className="mt-1 text-sm text-slate-600">Official identity verification workflow</p>
                </div>
                <div className="card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                    <ShieldCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <h3 className="font-semibold text-brand-800">Secure & Compliant</h3>
                  <p className="mt-1 text-sm text-slate-600">Through an approved electronic-notary platform</p>
                </div>
              </div>
            </div>

            {/* Notify Me Form */}
            <div className="mt-12 rounded-2xl border border-accent-200 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100">
                  <Bell className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-800">Notify Me When Available</h2>
                  <p className="text-sm text-slate-500">We'll let you know when RON services launch.</p>
                </div>
              </div>

              {status === 'success' && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-success-50 px-4 py-3 text-success-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Thank you! We'll notify you when Remote Online Notarization becomes available.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-error-50 px-4 py-3 text-error-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ron-name" className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
                    <input id="ron-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="ron-email" className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
                    <input id="ron-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="ron-consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="ron-consent" className="text-sm text-slate-600">
                    I consent to receive a notification when Remote Online Notarization becomes available. My information will be used solely for this purpose.
                  </label>
                </div>
                <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
                  {status === 'submitting' ? 'Submitting...' : 'Notify Me'}
                </button>
              </form>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Need notary services now? We offer mobile notary services today.</span>
            </div>
            <div className="mt-4 text-center">
              <button onClick={() => navigate('/book')} className="btn-secondary">
                Book a Mobile Notary Instead
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
