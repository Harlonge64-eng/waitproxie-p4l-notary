import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import BookingPage from './pages/BookingPage';
import RonPage from './pages/RonPage';
import AdminPage from './pages/AdminPage';
import LegalPage from './pages/LegalPage';
import TrackPage from './pages/TrackPage';
import CustomerAuthPage from './pages/CustomerAuthPage';

function getPath(): string {
  const hash = window.location.hash.replace(/^#/, '');

  if (hash) return hash;

  if (
    window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/')
  ) {
    return window.location.pathname;
  }

  return '/';
}

export default function App() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(getPath());
      window.scrollTo(0, 0);
    };

    const onPopState = () => {
      setPath(getPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const navigate = useCallback((newPath: string) => {
    window.location.hash = newPath;
  }, []);

  const isAdmin = path.startsWith('/admin');

  const renderPage = () => {
    if (path === '/') return <HomePage navigate={navigate} />;
    if (path === '/services') return <ServicesPage navigate={navigate} />;
    if (path === '/about') return <AboutPage navigate={navigate} />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/pricing') return <PricingPage navigate={navigate} />;
    if (path === '/auth') return <CustomerAuthPage navigate={navigate} />;
    if (path === '/book') return <BookingPage navigate={navigate} />;
    if (path === '/track') return <TrackPage navigate={navigate} />;
    if (path === '/ron') return <RonPage navigate={navigate} />;
    if (path.startsWith('/admin')) return <AdminPage />;

    if (path === '/privacy-policy')
      return (
        <LegalPage
          title="Privacy Policy"
          navigate={navigate}
          sections={privacySections}
        />
      );

    if (path === '/terms-of-service')
      return (
        <LegalPage
          title="Terms of Service"
          navigate={navigate}
          sections={termsSections}
        />
      );

    if (path === '/refund-cancellation')
      return (
        <LegalPage
          title="Refund & Cancellation Policy"
          navigate={navigate}
          sections={refundSections}
        />
      );

    if (path === '/document-storage')
      return (
        <LegalPage
          title="Document Storage Policy"
          navigate={navigate}
          sections={documentStorageSections}
        />
      );

    if (path === '/data-security')
      return (
        <LegalPage
          title="Data Security"
          navigate={navigate}
          sections={dataSecuritySections}
        />
      );

    if (path === '/no-legal-advice')
      return (
        <LegalPage
          title="No Legal Advice Disclaimer"
          navigate={navigate}
          sections={noLegalAdviceSections}
        />
      );

    if (path === '/ron-information')
      return (
        <LegalPage
          title="Remote Online Notarization Information"
          navigate={navigate}
          sections={ronInfoSections}
        />
      );

    return <HomePage navigate={navigate} />;
  };

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentPath={path} navigate={navigate} />
      <main className="flex-1 pt-16">{renderPage()}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

const privacySections = [
  {
    heading: 'Information We Collect',
    body: 'P4L Mobile Notary Services LLC collects information you provide directly to us, including your name, email address, phone number, and any information you include in booking requests or contact messages. When you upload documents for appointment preparation, those documents are stored securely and accessibly only to authorized personnel.',
  },
  {
    heading: 'How We Use Your Information',
    body: 'We use your information to process booking requests, communicate with you about appointments, provide notarial services, and respond to your inquiries. We do not sell or rent your personal information to third parties.',
  },
  {
    heading: 'Data Retention',
    body: 'Documents and personal information are retained according to our document storage policy and applicable legal requirements. You may request deletion of your personal data subject to legal retention obligations.',
  },
  {
    heading: 'Your Rights',
    body: 'You have the right to request access to, correction of, or deletion of your personal information. Contact us at waltpoitevien734@gmail.com to exercise these rights.',
  },
];

const termsSections = [
  {
    heading: 'Acceptance of Terms',
    body: 'By using this website and the services of P4L Mobile Notary Services LLC, you agree to these terms of service.',
  },
  {
    heading: 'Notarial Services',
    body: 'P4L Mobile Notary Services LLC provides notarial services as a commissioned Virginia Notary Public. The notary does not provide legal advice or determine the legal sufficiency of documents. Final acceptance and notarization decisions remain with the commissioned notary.',
  },
  {
    heading: 'Appointments',
    body: 'Appointment requests are subject to availability and confirmation by the notary. Booking a request does not guarantee a specific time until confirmed.',
  },
  {
    heading: 'AI-Assisted Preliminary Review',
    body: 'Any AI-assisted preliminary review is provided for appointment preparation only. It does not determine whether a document can legally be notarized and does not replace the commissioned notary.',
  },
  {
    heading: 'Remote Online Notarization',
    body: 'Remote Online Notarization is currently listed as "Coming Soon" and is not available for booking until the required electronic-notary approval process is complete.',
  },
];

const refundSections = [
  {
    heading: 'Cancellation by Customer',
    body: 'Customers may cancel or request to reschedule an appointment by contacting P4L Mobile Notary Services LLC as early as possible. A $50 cancellation fee applies when a customer cancels 24 hours or more after the appointment has been confirmed. Cancellations made before 24 hours have elapsed from appointment confirmation are not subject to this $50 cancellation fee. The 24-hour rule is measured from the time the appointment is confirmed, not from how close the cancellation is to the scheduled appointment date or time.',
  },
  {
    heading: 'No-Show Fee',
    body: 'A $50 no-show fee applies when a customer does not attend a confirmed appointment. If you are unable to attend because of an unexpected circumstance, please contact P4L Mobile Notary Services LLC as soon as possible so the circumstances can be reviewed.',
  },
  {
    heading: 'Refunds',
    body: 'Refund eligibility depends on the circumstances of the cancellation and whether services have been rendered. When a refund is eligible, any applicable cancellation or no-show fee will be deducted from the amount otherwise refundable. Contact us at waltpoitevien734@gmail.com to request a refund or discuss a cancellation fee.',
  },
  {
    heading: 'Cancellation by Notary',
    body: 'If the notary or P4L Mobile Notary Services LLC must cancel an appointment, reasonable efforts will be made to reschedule. Any payment collected for services that have not been rendered will be refunded in accordance with the circumstances of the cancellation.',
  },
  {
    heading: 'Disputing a Fee',
    body: 'If you believe a $50 cancellation or no-show fee was applied incorrectly, please contact P4L Mobile Notary Services LLC at waltpoitevien734@gmail.com with your booking reference and a brief explanation. We will review the booking records and circumstances surrounding the cancellation or missed appointment.',
  },
];

const documentStorageSections = [
  {
    heading: 'Document Upload',
    body: 'Customers may upload documents for appointment preparation. Documents should only be uploaded if they are necessary for the requested service.',
  },
  {
    heading: 'Access Restrictions',
    body: 'Uploaded documents are stored in private storage and are not publicly accessible. Access is restricted to authorized personnel.',
  },
  {
    heading: 'Retention',
    body: 'Document retention periods are configurable and documents may be deleted according to the businessâ€™s policy and applicable legal requirements.',
  },
  {
    heading: 'Security Measures',
    body: 'While we take reasonable measures to protect your documents, no system can guarantee absolute security. Customers should retain their own copies of important documents.',
  },
];

const dataSecuritySections = [
  {
    heading: 'HTTPS Encryption',
    body: 'This website uses HTTPS encryption in production to protect data in transit.',
  },
  {
    heading: 'Secure Authentication',
    body: 'Administrative access is protected by authentication and authorization controls.',
  },
  {
    heading: 'Row Level Security',
    body: 'Database access is governed by row-level security policies to ensure customers can only access their own data.',
  },
  {
    heading: 'Private Document Storage',
    body: 'Customer documents are stored in private storage buckets and are not publicly accessible.',
  },
  {
    heading: 'No Secret Exposure',
    body: 'Private credentials, signing certificates, and seal assets are never exposed in frontend code or public interfaces.',
  },
];

const noLegalAdviceSections = [
  {
    heading: 'Disclaimer',
    body: 'P4L Mobile Notary Services LLC provides notarial services and related administrative support. We do not provide legal advice or determine the legal sufficiency of documents. Customers should consult a qualified attorney for legal questions concerning their documents.',
  },
  {
    heading: 'AI-Assisted Review',
    body: 'Any AI-assisted preliminary review is for appointment preparation only and does not constitute legal advice or a legal determination of any kind.',
  },
];

const ronInfoSections = [
  {
    heading: 'Current Status: Coming Soon',
    body: 'Remote Online Notarization services are currently being prepared and will become available once P4L Mobile Notary Services LLC completes the required electronic-notary approval process.',
  },
  {
    heading: 'What RON Will Offer',
    body: 'Once approved, eligible customers will be able to access remote online notarization through an approved platform, including official identity verification and a live audio-video session with the commissioned notary.',
  },
  {
    heading: 'Notify Me',
    body: 'You can sign up to be notified when Remote Online Notarization becomes available by using the "Notify Me" form on our RON page.',
  },
];

