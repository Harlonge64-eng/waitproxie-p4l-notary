import { useState, FormEvent } from 'react';
import {
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Calendar,
  User,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { businessConfig } from '../lib/businessConfig';
import officialStamp from '../assets/Official-Stamp-jpg.jpg';

interface TrackPageProps {
  navigate: (path: string) => void;
}

interface BookingResult {
  id: string;
  full_name: string;
  service: string;
  document_type: string | null;
  status: string;
  admin_message: string | null;
  requires_manual_review: boolean;
  created_at: string;
  notified_at: string | null;

  // Cancellation / no-show / penalty information
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancellation_type: string | null;
  penalty_amount_cents: number;
  penalty_applied: boolean;
  penalty_reason: string | null;
  no_show: boolean;
  cancellation_notice_hours: number | null;
  penalty_applied_at: string | null;
}

interface NotificationResult {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const statusFlow = [
  'Request Submitted',
  'Document Review',
  'Notary Review',
  'Awaiting Payment',
  'Appointment Confirmed',
  'Appointment Scheduled',
  'Meet With the Notary',
  'Completed',
  'Document Delivered',
];

const statusColors: Record<string, string> = {
  'Request Submitted': 'bg-slate-100 text-slate-700',
  'Document Review': 'bg-warning-100 text-warning-700',
  'Notary Review': 'bg-warning-100 text-warning-700',
  'Awaiting Payment': 'bg-accent-100 text-accent-700',
  'Appointment Confirmed': 'bg-success-100 text-success-700',
  'Appointment Scheduled': 'bg-success-100 text-success-700',
  'Meet With the Notary': 'bg-brand-100 text-brand-700',
  'Completed': 'bg-success-100 text-success-700',
  'Document Delivered': 'bg-success-100 text-success-700',
  'Cancelled': 'bg-error-100 text-error-700',
  'No Show': 'bg-error-100 text-error-700',
};

export default function TrackPage({ navigate }: TrackPageProps) {
  const [refId, setRefId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'found' | 'notfound' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('searching');
    setErrorMsg('');
    setBooking(null);
    setNotifications([]);

    try {
      const { data: bookingData, error: bookingError } = await supabase.rpc(
        'lookup_booking',
        {
          lookup_id: refId,
          lookup_email: email,
        }
      );

      if (bookingError) throw bookingError;

      if (!bookingData || bookingData.length === 0) {
        setStatus('notfound');
        return;
      }

      const b = bookingData[0] as unknown as BookingResult;
      setBooking(b);

      const { data: notifData } = await supabase.rpc(
        'lookup_notifications',
        {
          lookup_email: email,
        }
      );

      setNotifications(
        (notifData as unknown as NotificationResult[]) ?? []
      );

      setStatus('found');
    } catch (err) {
      setStatus('error');

      const message =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string'
          ? err.message
          : 'Something went wrong. Please try again.';

      setErrorMsg(message);
    }
  };

  const currentStepIndex = booking
    ? statusFlow.indexOf(booking.status)
    : -1;

  const isCancelled =
    booking?.status === 'Cancelled' ||
    booking?.status === 'No Show';

  const hasPenalty =
    Boolean(booking?.penalty_applied) &&
    Number(booking?.penalty_amount_cents ?? 0) > 0;

  const penaltyAmount = hasPenalty
    ? (Number(booking?.penalty_amount_cents ?? 0) / 100).toLocaleString(
        'en-US',
        {
          style: 'currency',
          currency: 'USD',
        }
      )
    : null;

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-800 py-12 text-center sm:py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Track Your Request
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-brand-100">
            Enter your booking reference and email to check the status of your
            booking request.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-max max-w-3xl">

          {/* Search form */}
          <div className="card mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ref-id"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Booking Reference *
                  </label>

                  <input
                    id="ref-id"
                    type="text"
                    required
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    className="input-field"
                    placeholder="e.g., A1B2C3D4"
                  />
                </div>

                <div>
                  <label
                    htmlFor="track-email"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Email *
                  </label>

                  <input
                    id="track-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'searching'}
                className="btn-primary w-full"
              >
                {status === 'searching' ? (
                  'Searching...'
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Track Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="card mb-6 flex items-center gap-3 border-error-200 bg-error-50">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-error-600" />

              <p className="text-sm font-medium text-error-800">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Not found */}
          {status === 'notfound' && (
            <div className="card mb-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-warning-500" />

              <h2 className="mb-2 text-lg font-semibold text-brand-800">
                No Booking Found
              </h2>

              <p className="text-sm text-slate-500">
                We couldn't find a booking with that booking reference and email
                combination. Please check your booking reference (from your booking
                confirmation) and the email you used when booking.
              </p>

              <button
                onClick={() => navigate('/book')}
                className="btn-secondary mt-4 text-sm"
              >
                Submit a New Request
              </button>
            </div>
          )}

          {/* Found */}
          {status === 'found' && booking && (
            <div className="space-y-6 animate-fade-in">

              {/* Booking details */}
              <div className="card">
                <div className="mb-5 flex justify-center border-b border-slate-100 pb-5 sm:justify-end">
                  <img
                    src={officialStamp}
                    alt="Official P4L Mobile Notary Services stamp"
                    className="h-24 w-24 object-contain opacity-90"
                  />
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-800">
                    Booking Details
                  </h2>

                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      statusColors[booking.status] ??
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />

                    <div>
                      <dt className="text-xs text-slate-400">
                        Name
                      </dt>

                      <dd className="text-sm font-medium text-slate-700">
                        {booking.full_name}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />

                    <div>
                      <dt className="text-xs text-slate-400">
                        Service
                      </dt>

                      <dd className="text-sm font-medium text-slate-700">
                        {booking.service}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />

                    <div>
                      <dt className="text-xs text-slate-400">
                        Document Type
                      </dt>

                      <dd className="text-sm font-medium text-slate-700">
                        {booking.document_type || 'N/A'}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />

                    <div>
                      <dt className="text-xs text-slate-400">
                        Submitted
                      </dt>

                      <dd className="text-sm font-medium text-slate-700">
                        {new Date(
                          booking.created_at
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>

                </dl>
              </div>

              {/* Status timeline / cancellation */}
              {!isCancelled ? (
                <div className="card">
                  <h2 className="mb-4 text-lg font-bold text-brand-800">
                    Status Timeline
                  </h2>

                  <div className="space-y-1">
                    {statusFlow.map((step, i) => {
                      const isDone = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;

                      return (
                        <div
                          key={step}
                          className="flex items-center gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                isDone
                                  ? 'bg-brand-700 text-white'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {isDone && !isCurrent ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                i + 1
                              )}
                            </div>

                            {i < statusFlow.length - 1 && (
                              <div
                                className={`h-6 w-0.5 ${
                                  i < currentStepIndex
                                    ? 'bg-brand-700'
                                    : 'bg-slate-200'
                                }`}
                              />
                            )}
                          </div>

                          <span
                            className={`text-sm ${
                              isCurrent
                                ? 'font-semibold text-brand-800'
                                : isDone
                                ? 'text-slate-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {step}
                          </span>

                          {isCurrent && (
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="card border-error-200 bg-error-50">

                  <h2 className="mb-2 text-lg font-bold text-error-800">
                    {booking.status === 'No Show'
                      ? 'Appointment Marked as No-Show'
                      : 'Request Cancelled'}
                  </h2>

                  <p className="text-sm text-error-700">
                    {booking.status === 'No Show'
                      ? 'This appointment was marked as a no-show. If you believe this is an error, please contact us at '
                      : 'This booking request has been cancelled. If you believe this is an error, please contact us at '}
                    {businessConfig.phone}.
                  </p>

                  {/* $50 penalty information */}
                  {hasPenalty && (
                    <div className="mt-4 rounded-lg border border-error-300 bg-white p-4">
                      <div className="flex items-start gap-3">

                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-error-600" />

                        <div>
                          <h3 className="text-sm font-bold text-error-800">
                            {penaltyAmount} Cancellation / No-Show Fee Applied
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            A {penaltyAmount} fee has been applied to this
                            booking.
                          </p>

                          {booking.penalty_reason && (
                            <p className="mt-2 text-xs text-slate-500">
                              Reason: {booking.penalty_reason}
                            </p>
                          )}

                          {booking.penalty_applied_at && (
                            <p className="mt-1 text-xs text-slate-400">
                              Applied on:{' '}
                              {new Date(
                                booking.penalty_applied_at
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Cancellation details */}
                  {booking.cancellation_reason && (
                    <div className="mt-4 rounded-lg bg-white/70 p-3">
                      <p className="text-xs font-semibold text-slate-500">
                        Cancellation Details
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {booking.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin message */}
              {booking.admin_message && (
                <div className="card border-brand-200 bg-brand-50">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-800">
                    <Mail className="h-5 w-5" />
                    Message from the Notary
                  </h2>

                  <p className="text-sm leading-relaxed text-slate-700">
                    {booking.admin_message}
                  </p>

                  {booking.notified_at && (
                    <p className="mt-3 text-xs text-slate-400">
                      Sent on{' '}
                      {new Date(
                        booking.notified_at
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="card">
                  <h2 className="mb-4 text-lg font-bold text-brand-800">
                    Notifications
                  </h2>

                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-lg p-4 ${
                          n.is_read
                            ? 'bg-slate-50'
                            : 'border border-brand-100 bg-brand-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-brand-800">
                            {n.subject}
                          </h3>

                          {!n.is_read && (
                            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-600">
                          {n.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Penalty summary for cancelled/no-show bookings */}
              {isCancelled && hasPenalty && (
                <div className="card border-error-200 bg-error-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-error-600" />

                    <div>
                      <h2 className="text-lg font-bold text-error-800">
                        Cancellation Fee
                      </h2>

                      <p className="mt-1 text-sm text-error-700">
                        A {penaltyAmount} fee has been applied because the
                        appointment was cancelled within the applicable
                        cancellation period or the appointment was missed.
                      </p>

                      <p className="mt-2 text-sm font-semibold text-error-800">
                        Amount: {penaltyAmount}
                      </p>

                      {booking.cancellation_notice_hours !== null && (
                        <p className="mt-1 text-xs text-slate-500">
                          Notice provided:{' '}
                          {booking.cancellation_notice_hours.toFixed(1)}{' '}
                          hours before the appointment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next steps */}
              <div className="card text-center">
                <Clock className="mx-auto mb-3 h-8 w-8 text-brand-600" />

                <h2 className="mb-2 text-lg font-bold text-brand-800">
                  What Happens Next?
                </h2>

                <p className="mb-4 text-sm text-slate-600">
                  {booking.requires_manual_review
                    ? 'Your request requires review by the commissioned notary. You will be notified once the review is complete.'
                    : isCancelled
                    ? 'If you have questions about this cancellation or any applicable fee, please contact the notary using the contact information below.'
                    : 'The notary will review your request and contact you to confirm the appointment details.'}
                </p>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate('/book')}
                    className="btn-secondary text-sm"
                  >
                    New Request
                  </button>

                  <a
                    href={businessConfig.phoneTel}
                    className="btn-ghost text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Call {businessConfig.phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Idle */}
          {status === 'idle' && (
            <div className="card text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-400" />

              <p className="text-sm text-slate-500">
                Your booking reference was shown on the confirmation screen when
                you submitted your booking request. It starts with an
                8-character code (e.g., A1B2C3D4).
              </p>

              <button
                onClick={() => navigate('/book')}
                className="btn-secondary mt-4 text-sm"
              >
                Submit a New Request
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}