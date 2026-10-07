import { useState, FormEvent } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, UserCheck, Calendar, Clock, Info } from 'lucide-react';
import { businessConfig } from '../lib/businessConfig';
import { supabase } from '../lib/supabase';

interface BookingPageProps {
  navigate: (path: string) => void;
}

const documentTypes = [
  'General Document',
  'Power of Attorney',
  'Real Estate Document',
  'Vehicle Title',
  'Loan / Signing Document',
  'Will or Trust',
  'International / Apostille Document',
  'Business Document',
  'Other',
];

const specializedTypes = ['Power of Attorney', 'Real Estate Document', 'Vehicle Title', 'Loan / Signing Document', 'Will or Trust', 'International / Apostille Document'];

const services = [
  'Mobile Notary Services',
  'General Document Notarization',
  'Business & Personal Documents',
  'Specialized Documents',
];

const steps = ['Your Information', 'Document Details', 'Review & Submit'];

export default function BookingPage({ navigate }: BookingPageProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', numSigners: '1', signerLocation: '',
    documentType: '', receivingOrganization: '', requestedDate: '', preferredTime: '',
    service: '', additionalInfo: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [requiresManualReview, setRequiresManualReview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selected.type)) {
      setErrorMsg('Please upload a PDF, DOCX, JPG, or PNG file.');
      return;
    }
    if (selected.size > 26214400) {
      setErrorMsg('File size must be under 25MB.');
      return;
    }

    setErrorMsg('');
    setFile(selected);

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${selected.name}`;

    try {
      setUploadProgress(50);
      const { data, error } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, selected);

      if (error) throw error;

      setUploadProgress(100);
      setDocumentUrl(data?.path ?? fileName);

      // AI-Assisted Preliminary Review (simulated client-side analysis)
      const isSpecialized = specializedTypes.some((t) => form.documentType.includes(t));
      const flags: string[] = [];

      if (selected.type === 'application/pdf') flags.push('PDF file opens correctly');
      else if (selected.type.startsWith('image/')) flags.push('Image file received');
      else flags.push('Document file received');

      flags.push(`File size: ${(selected.size / 1024).toFixed(0)} KB`);

      if (isSpecialized) {
        flags.push('This document type may require review by the commissioned notary before the appointment can be confirmed.');
        setRequiresManualReview(true);
      } else {
        setRequiresManualReview(false);
      }

      flags.push('This preliminary review is for appointment preparation only and does not determine whether the document can legally be notarized.');

      setAiReview(flags.join('\n'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const requestId = crypto.randomUUID();

    try {
      const { error } = await supabase.from('booking_requests').insert({
        id: requestId,
        full_name: form.fullName,
        phone: form.phone,
        email: form.email,
        num_signers: parseInt(form.numSigners) || 1,
        signer_location: form.signerLocation || null,
        document_type: form.documentType || null,
        receiving_organization: form.receivingOrganization || null,
        requested_date: form.requestedDate || null,
        preferred_time: form.preferredTime || null,
        service: form.service,
        additional_info: form.additionalInfo || null,
        status: requiresManualReview ? 'Document Review' : 'Request Submitted',
        requires_manual_review: requiresManualReview,
        document_url: documentUrl,
        ai_review_summary: aiReview ? { flags: aiReview.split('\n') } : null,
      });

      if (error) throw error;

      setBookingId(requestId);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.fullName && form.phone && form.email && form.service;
    if (step === 1) return form.documentType;
    return true;
  };

  if (status === 'success') {
    return (
      <div className="animate-fade-in section-padding bg-slate-50">
        <div className="container-max max-w-2xl">
          <div className="card text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-brand-800">Request Submitted!</h1>
            <p className="mb-6 text-slate-600">
              Thank you, {form.fullName}. Your appointment request has been received.
            </p>
            {requiresManualReview && (
              <div className="mb-6 rounded-lg bg-warning-50 px-6 py-4 text-left">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-600" />
                  <p className="text-sm text-warning-800">
                    Your request requires review by the commissioned notary before the appointment can be confirmed. We will contact you at {form.email} once the review is complete.
                  </p>
                </div>
              </div>
            )}
            <p className="mb-6 text-sm text-slate-500">
              Your request status: <span className="font-semibold text-brand-700">{requiresManualReview ? 'Document Review' : 'Request Submitted'}</span>
              {bookingId && <>
                <br /><br />
                <span className="text-slate-400">Your Reference ID:</span><br />
                <span className="font-mono text-lg font-bold tracking-wider text-brand-800">{bookingId.substring(0, 8).toUpperCase()}</span>
                <br /><span className="text-xs text-slate-400">Save this ID to track your request status.</span>
              </>}
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Next step: The notary will review your request and contact you to confirm the appointment details.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
              <button onClick={() => navigate('/track')} className="btn-secondary">
                Track This Request
              </button>
              <a href={businessConfig.phoneTel} className="btn-ghost">
                Call {businessConfig.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-12 text-center sm:py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Book a Notary</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            Request a convenient mobile notary appointment with {businessConfig.businessName}.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max max-w-3xl">
          {/* Steps */}
          <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i <= step ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`hidden text-sm font-medium sm:inline ${i <= step ? 'text-brand-700' : 'text-slate-400'}`}>{label}</span>
                {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-12 ${i < step ? 'bg-brand-700' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card">
            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 rounded-lg bg-error-50 px-4 py-3 text-error-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Step 0: Your Information */}
            {step === 0 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-800">
                  <UserCheck className="h-5 w-5" /> Your Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Full Legal Name *</label>
                    <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone *</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Number of Signers</label>
                    <select value={form.numSigners} onChange={(e) => setForm({ ...form, numSigners: e.target.value })} className="input-field">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Signer Location</label>
                    <input type="text" value={form.signerLocation} onChange={(e) => setForm({ ...form, signerLocation: e.target.value })} className="input-field" placeholder="City or address" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Service *</label>
                  <select required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="input-field">
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" disabled={!canProceed()} onClick={() => setStep(1)} className="btn-primary disabled:opacity-50">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Document Details */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-800">
                  <FileText className="h-5 w-5" /> Document Details
                </h2>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Document Type *</label>
                  <select required value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className="input-field">
                    <option value="">Select document type</option>
                    {documentTypes.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Receiving Organization</label>
                  <input type="text" value={form.receivingOrganization} onChange={(e) => setForm({ ...form, receivingOrganization: e.target.value })} className="input-field" placeholder="If applicable" />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Upload Document (Optional)</label>
                  <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
                    {file ? (
                      <div className="space-y-2">
                        <CheckCircle className="mx-auto h-8 w-8 text-success-600" />
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        {uploadProgress < 100 && <p className="text-xs text-slate-500">Uploading: {uploadProgress}%</p>}
                        {uploadProgress === 100 && <p className="text-xs text-success-600">Upload complete</p>}
                        <button type="button" onClick={() => { setFile(null); setDocumentUrl(null); setAiReview(null); }} className="text-xs text-error-600 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                        <p className="text-sm text-slate-600">Click to upload PDF, DOCX, JPG, or PNG (max 25MB)</p>
                        <input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="mt-3 text-sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* AI-Assisted Preliminary Review */}
                {aiReview && (
                  <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-800">
                      <Info className="h-4 w-4" /> AI-Assisted Preliminary Review
                    </h3>
                    <div className="space-y-1">
                      {aiReview.split('\n').map((line, i) => (
                        <p key={i} className="text-xs text-slate-600">{line}</p>
                      ))}
                    </div>
                    <p className="mt-3 border-t border-brand-100 pt-2 text-xs italic text-slate-500">
                      This preliminary review is provided for appointment preparation only. It does not determine whether a document can legally be notarized. Final acceptance and notarization decisions remain with the commissioned notary.
                    </p>
                  </div>
                )}

                {requiresManualReview && (
                  <div className="rounded-lg bg-warning-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-600" />
                      <p className="text-sm text-warning-800">
                        Your request requires review by the commissioned notary before the appointment can be confirmed.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(0)} className="btn-ghost">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" disabled={!canProceed()} onClick={() => setStep(2)} className="btn-primary disabled:opacity-50">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review & Submit */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-800">
                  <Calendar className="h-5 w-5" /> Appointment Preferences
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Requested Completion Date</label>
                    <input type="date" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Preferred Time</label>
                    <select value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="input-field">
                      <option value="">Select a time</option>
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 5 PM)</option>
                      <option>Evening (5 PM - 8 PM)</option>
                      <option>After Hours</option>
                      <option>Weekend</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Additional Information</label>
                  <textarea rows={4} value={form.additionalInfo} onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })} className="input-field resize-none" placeholder="Any special requests or details we should know" />
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-brand-800">Booking Summary</h3>
                  <dl className="space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between"><dt>Name:</dt><dd className="font-medium">{form.fullName}</dd></div>
                    <div className="flex justify-between"><dt>Service:</dt><dd className="font-medium">{form.service}</dd></div>
                    <div className="flex justify-between"><dt>Document Type:</dt><dd className="font-medium">{form.documentType}</dd></div>
                    <div className="flex justify-between"><dt>Signers:</dt><dd className="font-medium">{form.numSigners}</dd></div>
                    {requiresManualReview && <div className="flex justify-between text-warning-700"><dt>Review Required:</dt><dd className="font-medium">Yes</dd></div>}
                  </dl>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={status === 'submitting'} className="btn-primary">
                    {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Actual notarization is performed by the commissioned notary at your appointment.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
