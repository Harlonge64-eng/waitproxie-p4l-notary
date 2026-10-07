import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, MessageSquare, Bell, Star, Settings,
  LogIn, LogOut, Lock, Shield, ScrollText, AlertCircle, Check, X,
  Trash2, ToggleLeft, ToggleRight, Save,
  ChevronDown, ChevronUp, Download, FileText, Send, Eye,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { businessConfig } from '../lib/businessConfig';

type Tab = 'login' | 'dashboard' | 'bookings' | 'messages' | 'ron-leads' | 'testimonials' | 'settings' | 'audit';

interface DbRecord {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setCheckingAuth(false);
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc('is_p4l_admin');
      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        setAuthed(false);
        setLoginError('This account is not authorized to access the P4L admin area.');
        setCheckingAuth(false);
        return;
      }

      setAuthed(true);
      setCheckingAuth(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        if (!session) {
          setAuthed(false);
          setCheckingAuth(false);
          return;
        }

        const { data: isAdmin, error: adminError } = await supabase.rpc('is_p4l_admin');
        if (adminError || !isAdmin) {
          await supabase.auth.signOut();
          setAuthed(false);
          setLoginError('This account is not authorized to access the P4L admin area.');
          setCheckingAuth(false);
          return;
        }

        setAuthed(true);
        setCheckingAuth(false);
      }, 0);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError('Invalid email or password. Please try again.');
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_p4l_admin');
    if (adminError || !isAdmin) {
      await supabase.auth.signOut();
      setAuthed(false);
      setLoginError('This account is not authorized to access the P4L admin area.');
      return;
    }

    setAuthed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setEmail('');
    setPassword('');
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="text-sm font-medium text-brand-800">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
              <Lock className="h-7 w-7 text-brand-700" />
            </div>
            <h1 className="text-2xl font-bold text-brand-800">Admin Login</h1>
            <p className="mt-1 text-sm text-slate-500">{businessConfig.businessName}</p>
          </div>
          {loginError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-800">
              <AlertCircle className="h-4 w-4" />
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Admin Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" autoFocus autoComplete="username" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary w-full">
              <LogIn className="h-4 w-4" />
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ron-leads', label: 'RON Leads', icon: Bell },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 text-white">
          <div className="flex h-16 items-center justify-between border-b border-brand-800 px-4">
            <span className="font-bold">P4L Admin</span>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === item.id ? 'bg-brand-700 text-white' : 'text-brand-200 hover:bg-brand-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full border-t border-brand-800 p-3">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-200 hover:bg-brand-800">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-64 flex-1 p-6">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'ron-leads' && <RonLeadsTab />}
          {tab === 'testimonials' && <TestimonialsTab />}
          {tab === 'settings' && <SettingsTab />}
          {tab === 'audit' && <AuditTab />}
        </main>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState({ bookings: 0, messages: 0, ronLeads: 0, pendingBookings: 0 });

  useEffect(() => {
    (async () => {
      const [b, m, r, pb] = await Promise.all([
        supabase.from('booking_requests').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('ron_notification_leads').select('*', { count: 'exact', head: true }),
        supabase.from('booking_requests').select('*', { count: 'exact', head: true }).in('status', ['Request Submitted', 'Document Review']),
      ]);
      setStats({ bookings: b.count ?? 0, messages: m.count ?? 0, ronLeads: r.count ?? 0, pendingBookings: pb.count ?? 0 });
    })();
  }, []);

  const cards = [
    { label: 'Total Bookings', value: stats.bookings, icon: Calendar, color: 'bg-brand-100 text-brand-700' },
    { label: 'Pending Requests', value: stats.pendingBookings, icon: AlertCircle, color: 'bg-warning-100 text-warning-700' },
    { label: 'New Messages', value: stats.messages, icon: MessageSquare, color: 'bg-accent-100 text-accent-700' },
    { label: 'RON Leads', value: stats.ronLeads, icon: Bell, color: 'bg-success-100 text-success-700' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-brand-800">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [adminMessages, setAdminMessages] = useState<Record<string, string>>({});
  const [notifStatus, setNotifStatus] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false });
      setBookings(data ?? []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const isNoShow = status === 'No Show';
    const isCancellation = status === 'Cancelled';
    const isAppointmentConfirmed = status === 'Appointment Confirmed';
    let penaltyAmount = 0;
    let penaltyApplied = false;
    let penaltyReason = '';
    let cancellationNoticeHours: number | null = null;

    if (isNoShow) {
      penaltyAmount = 5000;
      penaltyApplied = true;
      penaltyReason = 'No-show';
    } else if (isCancellation) {
      const confirmedAt = booking.appointment_confirmed_at
        ? new Date(String(booking.appointment_confirmed_at))
        : null;

      if (confirmedAt && !Number.isNaN(confirmedAt.getTime())) {
        cancellationNoticeHours = (Date.now() - confirmedAt.getTime()) / 3600000;
        if (cancellationNoticeHours >= 24) {
          penaltyAmount = 5000;
          penaltyApplied = true;
          penaltyReason = 'Customer cancellation 24 hours or more after appointment confirmation';
        }
      }

    }

    const updateData: Record<string, unknown> = { status };
    if (isAppointmentConfirmed && !booking.appointment_confirmed_at) {
      updateData.appointment_confirmed_at = new Date().toISOString();
    }
    if (isCancellation || isNoShow) {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_type = isNoShow ? 'no_show' : 'customer';
      updateData.cancellation_reason = isNoShow ? 'Appointment marked as no-show' : 'Customer cancelled appointment';
      updateData.no_show = isNoShow;
      updateData.penalty_amount_cents = penaltyAmount;
      updateData.penalty_applied = penaltyApplied;
      updateData.penalty_reason = penaltyReason || null;
      updateData.cancellation_notice_hours = cancellationNoticeHours;
      updateData.penalty_applied_at = penaltyApplied ? new Date().toISOString() : null;
    }

    const { error } = await supabase.from('booking_requests').update(updateData).eq('id', id);
    if (error) {
      alert(`Unable to update booking: ${error.message}`);
      return;
    }

    setBookings(bookings.map((b) => (b.id === id ? { ...b, ...updateData } : b)));

    await supabase.from('audit_logs').insert({
      action: 'booking_status_changed',
      entity_type: 'booking_requests',
      entity_id: id,
      details: { status, penalty_amount_cents: penaltyAmount, penalty_applied: penaltyApplied, penalty_reason: penaltyReason || null }
    });

    if (penaltyApplied && booking.email) {
      await supabase.from('notifications').insert({
        customer_email: booking.email,
        subject: isNoShow ? 'No-Show Fee Applied' : 'Late Cancellation Fee Applied',
        message: 'A $50 fee has been applied to your booking because the appointment was cancelled 24 hours or more after confirmation or the appointment was missed. Please contact us if you have questions.'
      });
    }
  };

  const saveReviewNotes = async (id: string) => {
    const notes = reviewNotes[id] ?? '';
    await supabase.from('booking_requests').update({ review_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', id);
    setBookings(bookings.map((b) => (b.id === id ? { ...b, review_notes: notes } : b)));
    await supabase.from('audit_logs').insert({ action: 'review_notes_saved', entity_type: 'booking_requests', entity_id: id, details: { notes_length: notes.length } });
  };

  const downloadDocument = async (b: DbRecord) => {
    const path = String(b.document_url ?? '');
    if (!path) return;
    const { data, error } = await supabase.storage.from('customer-documents').download(path);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() ?? 'document';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage.from('customer-documents').createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  const viewDocument = async (b: DbRecord) => {
    const path = String(b.document_url ?? '');
    if (!path) return;
    const url = await getSignedUrl(path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendNotification = async (b: DbRecord) => {
    const id = b.id;
    const message = adminMessages[id]?.trim();
    if (!message) return;
    setNotifStatus({ ...notifStatus, [id]: 'sending' });

    try {
      const { error: notifError } = await supabase.from('notifications').insert({
        booking_id: id,
        customer_email: String(b.email),
        subject: 'Update on your booking request — P4L Mobile Notary',
        message,
      });
      if (notifError) throw notifError;

      await supabase.from('booking_requests').update({
        admin_message: message,
        notified_at: new Date().toISOString(),
      }).eq('id', id);

      await supabase.from('audit_logs').insert({
        action: 'customer_notified',
        entity_type: 'booking_requests',
        entity_id: id,
        details: { message_length: message.length },
      });

      setBookings(bookings.map((bk) => (bk.id === id ? { ...bk, admin_message: message, notified_at: new Date().toISOString() } : bk)));
      setNotifStatus({ ...notifStatus, [id]: 'sent' });
      setAdminMessages({ ...adminMessages, [id]: '' });
      setTimeout(() => setNotifStatus((s) => ({ ...s, [id]: 'idle' })), 3000);
    } catch {
      setNotifStatus({ ...notifStatus, [id]: 'error' });
      setTimeout(() => setNotifStatus((s) => ({ ...s, [id]: 'idle' })), 3000);
    }
  };

  const statuses = ['Request Submitted', 'Document Review', 'Notary Review', 'Awaiting Payment', 'Appointment Confirmed', 'Appointment Scheduled', 'Meet With the Notary', 'Completed', 'Document Delivered', 'Cancelled', 'No Show'];

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Booking Requests</h1>
      {bookings.length === 0 ? (
        <p className="text-slate-500">No booking requests yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const id = b.id;
            const isExpanded = expandedId === id;
            const hasDoc = !!b.document_url;
            const aiFlags = b.ai_review_summary as Record<string, unknown> | null;

            return (
              <div key={id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2 p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-brand-800">{b.full_name}</h3>
                      {b.requires_manual_review && <span className="rounded bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">Manual Review</span>}
                      {b.notified_at && <span className="rounded bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">Notified</span>}
                    </div>
                    <p className="text-sm text-slate-500">{b.email} | {b.phone}</p>
                    <p className="mt-1 text-sm text-slate-600">Service: {b.service} | Document: {b.document_type || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Signers: {b.num_signers} | Date: {b.requested_date || 'N/A'} | Time: {b.preferred_time || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={String(b.status ?? '')} onChange={(e) => updateStatus(id, e.target.value)} className="input-field w-auto text-sm">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Left: Document & AI Review */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-brand-800">Document</h4>
                          {hasDoc ? (
                            <div className="flex gap-2">
                              <button onClick={() => viewDocument(b)} className="btn-secondary text-xs">
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button onClick={() => downloadDocument(b)} className="btn-secondary text-xs">
                                <Download className="h-3.5 w-3.5" /> Download
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">No document uploaded</p>
                          )}
                        </div>

                        {aiFlags && Array.isArray(aiFlags.flags) && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-brand-800">AI-Assisted Preliminary Review</h4>
                            <div className="rounded-lg bg-brand-50 p-3">
                              {(aiFlags.flags as unknown[]).map((flag, i) => (
                                <p key={i} className="text-xs text-slate-600">{String(flag)}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {b.additional_info && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-brand-800">Additional Info</h4>
                            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{b.additional_info}</p>
                          </div>
                        )}

                        {b.receiving_organization && (
                          <div>
                            <h4 className="mb-1 text-sm font-semibold text-brand-800">Receiving Organization</h4>
                            <p className="text-sm text-slate-600">{b.receiving_organization}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Review Notes & Notify Customer */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-800">
                            <FileText className="h-4 w-4" /> Review Notes (Private)
                          </h4>
                          <textarea
                            rows={4}
                            placeholder="Notes about this booking — visible to admin only"
                            value={reviewNotes[id] ?? String(b.review_notes ?? '')}
                            onChange={(e) => setReviewNotes({ ...reviewNotes, [id]: e.target.value })}
                            className="input-field resize-none text-sm"
                          />
                          <button onClick={() => saveReviewNotes(id)} className="btn-ghost mt-2 text-sm">
                            <Save className="h-3.5 w-3.5" /> Save Notes
                          </button>
                        </div>

                        <div>
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-800">
                            <Send className="h-4 w-4" /> Notify Customer
                          </h4>
                          <textarea
                            rows={4}
                            placeholder="Message to send to the customer about their booking status or review outcome"
                            value={adminMessages[id] ?? ''}
                            onChange={(e) => setAdminMessages({ ...adminMessages, [id]: e.target.value })}
                            className="input-field resize-none text-sm"
                          />
                          <button
                            onClick={() => sendNotification(b)}
                            disabled={notifStatus[id] === 'sending' || !(adminMessages[id]?.trim())}
                            className="btn-primary mt-2 text-sm disabled:opacity-50"
                          >
                            {notifStatus[id] === 'sending' ? 'Sending...' : notifStatus[id] === 'sent' ? 'Sent!' : notifStatus[id] === 'error' ? 'Failed — try again' : (
                              <><Send className="h-3.5 w-3.5" /> Send Notification</>
                            )}
                          </button>
                          {b.admin_message && !adminMessages[id] && (
                            <p className="mt-2 text-xs text-slate-400">Last sent: &ldquo;{String(b.admin_message).substring(0, 80)}...&rdquo;</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<DbRecord[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      setMessages(data ?? []);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('contact_messages').update({ status }).eq('id', id);
    setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const deleteMsg = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(messages.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Contact Messages</h1>
      {messages.length === 0 ? (
        <p className="text-slate-500">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-800">{m.name}</h3>
                  <p className="text-sm text-slate-500">{m.email} | {m.phone || 'No phone'}</p>
                  {m.service && <p className="text-xs text-slate-400">Service: {m.service}</p>}
                  <p className="mt-2 text-sm text-slate-700">{m.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={String(m.status ?? '')} onChange={(e) => updateStatus(m.id, e.target.value)} className="input-field w-auto text-xs">
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button onClick={() => deleteMsg(m.id)} className="rounded p-1.5 text-error-600 hover:bg-error-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RonLeadsTab() {
  const [leads, setLeads] = useState<DbRecord[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('ron_notification_leads').select('*').order('created_at', { ascending: false });
      setLeads(data ?? []);
    })();
  }, []);

  const exportCsv = () => {
    const csv = ['Name,Email,Consent,Date'];
    leads.forEach((l) => csv.push(`"${l.name}","${l.email}","${l.consent}","${new Date(String(l.created_at)).toLocaleDateString()}"`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ron-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">RON Notification Leads</h1>
        {leads.length > 0 && <button onClick={exportCsv} className="btn-secondary text-sm">Export CSV</button>}
      </div>
      {leads.length === 0 ? (
        <p className="text-slate-500">No RON leads yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Consent</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{l.name}</td>
                  <td className="px-4 py-3 text-slate-600">{l.email}</td>
                  <td className="px-4 py-3">{l.consent ? <Check className="h-4 w-4 text-success-600" /> : <X className="h-4 w-4 text-error-600" />}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(String(l.created_at)).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<DbRecord[]>([]);
  const [form, setForm] = useState({ author_name: '', author_location: '', content: '', rating: 5, is_demo: true });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      setTestimonials(data ?? []);
    })();
  }, []);

  const addTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('testimonials').insert({
      author_name: form.author_name,
      author_location: form.author_location || null,
      content: form.content,
      rating: form.rating,
      is_demo: form.is_demo,
      is_approved: false,
    }).select();
    if (data) setTestimonials([data[0], ...testimonials]);
    setForm({ author_name: '', author_location: '', content: '', rating: 5, is_demo: true });
  };

  const toggle = async (id: string, field: string, value: boolean) => {
    await supabase.from('testimonials').update({ [field]: value }).eq('id', id);
    setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const remove = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id);
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Testimonials</h1>

      <form onSubmit={addTestimonial} className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-brand-800">Add Testimonial</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input placeholder="Author name *" required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="input-field" />
          <input placeholder="Location" value={form.author_location} onChange={(e) => setForm({ ...form, author_location: e.target.value })} className="input-field" />
        </div>
        <textarea placeholder="Testimonial content *" required rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field mt-4 resize-none" />
        <div className="mt-4 flex items-center gap-4">
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="input-field w-auto">
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_demo} onChange={(e) => setForm({ ...form, is_demo: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Mark as DEMO
          </label>
          <button type="submit" className="btn-primary ml-auto text-sm">Add</button>
        </div>
      </form>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-brand-800">{t.author_name} {t.author_location && <span className="text-sm text-slate-400">| {t.author_location}</span>}</p>
                <p className="mt-1 text-sm text-slate-600">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-2 flex gap-2">
                  {t.is_demo && <span className="rounded bg-warning-100 px-2 py-0.5 text-xs font-bold text-warning-700">DEMO</span>}
                  {t.is_approved && <span className="rounded bg-success-100 px-2 py-0.5 text-xs font-bold text-success-700">APPROVED</span>}
                  {!t.is_approved && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">PENDING</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(t.id, 'is_approved', !t.is_approved)} title="Toggle approval" className="rounded p-1.5 text-brand-600 hover:bg-brand-50">
                  {t.is_approved ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <button onClick={() => remove(t.id)} className="rounded p-1.5 text-error-600 hover:bg-error-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<DbRecord | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).single();
      if (data) setSettings(data);
    })();
  }, []);

  const save = async () => {
    if (!settings) return;
    await supabase.from('site_settings').update({
      ron_status: settings.ron_status,
      business_hours: settings.business_hours,
      logo_url: settings.logo_url,
    }).eq('id', settings.id);
    await supabase.from('audit_logs').insert({ action: 'settings_changed', entity_type: 'site_settings', details: { ron_status: settings.ron_status } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <p className="text-slate-500">Loading settings...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Business Settings</h1>

      <div className="space-y-6">
        {/* RON Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-brand-800">
            <Shield className="h-5 w-5" /> RON Status
          </h2>
          <p className="mb-4 text-sm text-slate-500">Control whether Remote Online Notarization is shown as available or coming soon.</p>
          <div className="flex gap-3">
            {(['coming_soon', 'available', 'disabled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSettings({ ...settings, ron_status: status })}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  settings.ron_status === status ? 'border-brand-700 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {status === 'coming_soon' ? 'Coming Soon' : status === 'available' ? 'Available' : 'Disabled'}
              </button>
            ))}
          </div>
        </div>

        {/* Business Info (read-only display) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-brand-800">Business Information</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-slate-400">Business Name</dt><dd className="text-sm font-medium text-slate-700">{settings.business_name}</dd></div>
            <div><dt className="text-xs text-slate-400">Phone</dt><dd className="text-sm font-medium text-slate-700">{settings.phone}</dd></div>
            <div><dt className="text-xs text-slate-400">Email</dt><dd className="text-sm font-medium text-slate-700">{settings.email}</dd></div>
            <div><dt className="text-xs text-slate-400">Notary</dt><dd className="text-sm font-medium text-slate-700">{settings.notary_name}</dd></div>
            <div><dt className="text-xs text-slate-400">Commission #</dt><dd className="text-sm font-medium text-slate-700">{settings.commission_number}</dd></div>
            <div><dt className="text-xs text-slate-400">Commission Expires</dt><dd className="text-sm font-medium text-slate-700">{settings.commission_expiration}</dd></div>
          </dl>
        </div>

        {/* Business Hours */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-brand-800">Business Hours</h2>
          <input value={String(settings.business_hours ?? '')} onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })} className="input-field" placeholder="e.g., Mon-Fri 9AM-6PM, Sat by appointment" />
        </div>

        {/* Logo URL */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-brand-800">Logo URL</h2>
          <input value={String(settings.logo_url ?? '')} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} className="input-field" placeholder="/path/to/logo.png" />
          <p className="mt-2 text-xs text-slate-400">Upload your official logo and enter the URL here to replace the placeholder.</p>
        </div>

        <button onClick={save} className="btn-primary">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState<DbRecord[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      setLogs(data ?? []);
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Audit Log</h1>
      {logs.length === 0 ? (
        <p className="text-slate-500">No audit entries yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-700">{l.action}</span>
                <span className="text-xs text-slate-400">{new Date(String(l.created_at)).toLocaleString()}</span>
              </div>
              {l.entity_type && <span className="text-xs text-slate-400">{l.entity_type}: {String(l.entity_id ?? '').substring(0, 8)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
