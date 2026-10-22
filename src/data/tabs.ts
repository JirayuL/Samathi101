/**
 * Tabs in the header, in order. Each course in courses.ts picks its tab with `tab: '<id>'`.
 * The id is also the link to that tab, e.g. https://english.samathi101.com/#one-day
 * 'home', 'contact' and 'register' are special pages (see src/pages/index.astro).
 */
export const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'children', label: 'Children Course' },
  { id: 'retreat', label: '7-Day Course' },
  { id: 'one-day', label: '1-Day Course' },
  { id: 'instructor', label: 'Instructor Course' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'register', label: 'Register', highlight: true },
] as const;

export type TabId = (typeof tabs)[number]['id'];
