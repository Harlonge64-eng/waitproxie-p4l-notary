import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        service: form.service || null,
        message: form.message,
      });

      if (error) throw error;

      setStatus('success');
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-16 text-center sm:py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Contact P4L Mobile Notary Services LLC</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            We're here to help with your notary needs. Reach out by phone, email, or the form below.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Phone className="h-5 w-5 text-brand-700" />
                </div>
                <h3 className="mb-1 font-semibold text-brand-800">Phone</h3>
                <a href={businessConfig.phoneTel} className="text-slate-600 hover:text-brand-700">{businessConfig.phone}</a>
              </div>
              <div className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Mail className="h-5 w-5 text-brand-700" />
                </div>
                <h3 className="mb-1 font-semibold text-brand-800">Email</h3>
                <a href={businessConfig.emailLink} className="break-all text-slate-600 hover:text-brand-700">{businessConfig.email}</a>
              </div>
              <div className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <MapPin className="h-5 w-5 text-brand-700" />
                </div>
                <h3 className="mb-1 font-semibold text-brand-800">Address</h3>
                <p className="text-slate-600">
                  {businessConfig.address.street}<br />
                  {businessConfig.address.city}, {businessConfig.address.state} {businessConfig.address.zip}
                </p>
                <a href={businessConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Get Directions &rarr;
                </a>
              </div>
              <div className="card">
                <h3 className="mb-2 font-semibold text-brand-800">Service Area</h3>
                <p className="text-sm text-slate-600">{businessConfig.serviceAreas}.</p>
                <p className="mt-2 text-sm text-slate-500">{businessConfig.serviceAreasExtended}</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="mb-6 text-2xl font-bold text-brand-800">Send Us a Message</h2>

                {status === 'success' && (
                  <div className="mb-6 flex items-center gap-3 rounded-lg bg-success-50 px-4 py-3 text-success-800">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Your message has been sent. We'll get back to you soon.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mb-6 flex items-center gap-3 rounded-lg bg-error-50 px-4 py-3 text-error-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
                      <input id="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
                      <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                      <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label htmlFor="service" className="mb-1 block text-sm font-medium text-slate-700">Service</label>
                      <select id="service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="input-field">
                        <option value="">Select a service</option>
                        <option>Mobile Notary Services</option>
                        <option>General Document Notarization</option>
                        <option>Business & Personal Documents</option>
                        <option>Specialized Documents</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">Message *</label>
                    <textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
                    {status === 'submitting' ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
