export const pageMap = {
  home: { title: 'Home', sub: 'Platform landing page for UniNest FUW' },
  applications: { title: 'Applications Queue', sub: 'Pending and processed student applications' },
  landlords: { title: 'Verified Landlords', sub: 'KYC registry and landlord management' },
  payments: { title: 'Payments & Escrow', sub: 'Transaction tracking and escrow management' },
  settings: { title: 'Settings', sub: 'Platform configuration' },
};

export const navSections = [
  {
    label: 'Overview',
    items: [
      { key: 'home', icon: 'ti-home', label: 'Home' },
    ],
  },
  {
    label: 'Hostel Module',
    items: [
      { key: 'applications', icon: 'ti-file-text', label: 'Applications' },
    ],
  },
  {
    label: 'Housing Market',
    items: [
      { key: 'landlords', icon: 'ti-user-check', label: 'Verified Landlords' },
      { key: 'payments', icon: 'ti-credit-card', label: 'Payments & Escrow' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { key: 'settings', icon: 'ti-settings', label: 'Settings' },
    ],
  },
];
