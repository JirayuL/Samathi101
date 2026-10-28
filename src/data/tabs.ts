/**
 * Page sections and the header navigation.
 *
 * `panels` lists every section on the page, in order — src/pages/index.astro renders one
 * <div role="tabpanel"> per id, and each course in courses.ts picks its section with `tab: '<id>'`.
 * A section id is also its link, e.g. https://english.samathi101.com/#mic-online
 *
 * `nav` is the header: Home, an "All Courses" dropdown to each course section, and Contact Us.
 * 'home', 'all-courses', 'contact' and 'mic-online-registration' are special sections (see index.astro):
 * the MIC Online application form lives on its own section, opened from the MIC Online course's button.
 */
export const panels = [
  'home',
  'all-courses',
  'mic',
  'mic-online',
  'one-day',
  'retreat',
  'children',
  'mic-online-registration',
  'contact',
] as const;

export type TabId = (typeof panels)[number];

export interface NavChild {
  id: TabId;
  label: string;
}
export interface NavItem {
  id: TabId;
  label: string;
  children?: readonly NavChild[];
}

export const nav: readonly NavItem[] = [
  { id: 'home', label: 'Home' },
  {
    id: 'all-courses',
    label: 'All Courses',
    children: [
      { id: 'mic', label: 'MIC: 6-Month Course' },
      { id: 'mic-online', label: 'MIC Online: 6-Month Online Course' },
      { id: 'one-day', label: 'MSC: 1-Day Course' },
      { id: 'retreat', label: '7 Days of Mind Power Retreat' },
      { id: 'children', label: 'Yuvasa: Children Courses' },
    ],
  },
  { id: 'contact', label: 'Contact Us' },
];
