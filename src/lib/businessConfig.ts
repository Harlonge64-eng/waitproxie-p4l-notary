export const businessConfig = {
  businessName: 'P4L Mobile Notary Services LLC',
  website: 'https://www.p4lmobilenotary.com',
  phone: '347-641-3313',
  phoneTel: 'tel:+13476413313',
  email: 'waltpoitevien734@gmail.com',
  emailLink: 'mailto:waltpoitevien734@gmail.com',
  address: {
    street: '7410 Hull Street Road, Suite 200, Unit 352',
    city: 'North Chesterfield',
    state: 'VA',
    zip: '23235',
    full: '7410 Hull Street Road, Suite 200, Unit 352, North Chesterfield, VA 23235',
  },
  serviceAreas: 'Richmond, North Chesterfield, Surrounding Virginia areas',
  serviceAreasExtended:
    'P4L Mobile Notary Services LLC may travel throughout Virginia depending on distance and appointment availability.',
  notary: {
    name: 'Walt Dimitri Poitevien',
    title: 'Virginia Notary Public',
    titlePhrase: 'Commissioned Virginia Notary Public',
    commissionNumber: '8059995',
    commissionExpiration: 'July 31, 2027',
  },
  ron: {
    status: 'coming_soon' as 'coming_soon' | 'available' | 'disabled',
    comingSoonText:
      'Remote Online Notarization services are currently being prepared and will become available once P4L Mobile Notary Services LLC completes the required electronic-notary approval process.',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=7410+Hull+Street+Road+Suite+200+North+Chesterfield+VA+23235',
  legalDisclaimer:
    'P4L Mobile Notary Services LLC provides notarial services and related administrative support. We do not provide legal advice or determine the legal sufficiency of documents. Customers should consult a qualified attorney for legal questions concerning their documents.',
};

export type BusinessConfig = typeof businessConfig;
