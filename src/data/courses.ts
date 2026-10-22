/**
 * All course content lives here. To add, edit, reorder or close a course,
 * edit this file only — the page re-renders from this list.
 *
 * Button styles: 'primary' (robe ochre) | 'secondary' (forest green) | 'outline'
 * Status:        'open' | 'closed' | 'coming-soon'
 */
import type { ImageMetadata } from 'astro';
import type { TabId } from './tabs';

import retreatPoster from '../assets/courses/retreat-poster.jpg';
import retreatBrochure from '../assets/courses/retreat-brochure.png';
import oneDayBangkok from '../assets/courses/one-day-bangkok.jpg';
import yuvasa from '../assets/courses/yuvasa.png';
import micVideo from '../assets/courses/mic-video.png';
import oneDayChiangMai from '../assets/courses/one-day-chiang-mai.jpg';
import oneDayPhuket from '../assets/courses/one-day-phuket.png';

export type ButtonStyle = 'primary' | 'secondary' | 'outline';
export type Status = 'open' | 'closed' | 'coming-soon';

export interface CourseImage {
  src: ImageMetadata;
  alt: string;
  href?: string;
}

export interface Fact {
  label: string;
  value: string; // use \n for line breaks
}

export interface Course {
  id: string; // used as the #anchor, e.g. /#retreat-7-day
  tab: TabId; // which tab this course appears under (see tabs.ts)
  title: string;
  status: Status;
  images?: CourseImage[];
  /** YouTube video ID (the part after watch?v=). When set, replaces the images with an embedded video. */
  youtubeId?: string;
  paragraphs?: string[];
  facts?: Fact[];
  afterFacts?: string[];
  sections?: { heading: string; text?: string; items?: string[] }[];
  links?: { label: string; href: string }[];
  enrollNote?: string;
  closedNote?: { text: string[]; linkLabel?: string; linkHref?: string };
  /** Short lines shown on the Register tab (when, where, fee) */
  summary?: string[];
  /** kind: 'download' buttons (brochures) are not repeated on the Register tab */
  buttons?: { label: string; sub?: string; href: string; style: ButtonStyle; kind?: 'register' | 'download' }[];
}

const BROCHURE_7_DAY =
  'https://drive.google.com/file/d/1uY_JoWNuKbijPsAvoMBGwi25hAfshNoB/view?usp=sharing';

export const courses: Course[] = [
  {
    id: 'retreat-7-day',
    tab: 'retreat',
    summary: ['17–24 December 2026', 'Wat Pa Dhampanomwan, Nakhon Ratchasima', 'THB 3,900 if you register by 31 October'],
    title: '7 Days Of Mind Power : English Meditation Retreat',
    status: 'open',
    images: [
      {
        src: retreatPoster,
        alt: '7 Days of Mind Power poster — 17–24 December 2026, Wat Pa Dhampanomwan, Wang Nam Khiao, Nakhon Ratchasima',
      },
      {
        src: retreatBrochure,
        alt: '7 Days of Mind Power brochure with accommodation, precepts, what to bring and fees',
        href: BROCHURE_7_DAY,
      },
    ],
    paragraphs: [
      'The Willpower Institute Foundation invites you to a seven-day English-language meditation retreat at Wat Pa Dhampanomwan, surrounded by the peaceful natural environment of Wang Nam Khiao, Nakhon Ratchasima.',
      'Designed as an introductory meditation retreat, the program provides participants with proper meditation techniques, structured guidance, and ample time for practice and reflection. No prior meditation experience is required.',
    ],
    facts: [
      { label: 'Duration', value: '17–24 December 2026' },
      { label: 'Location', value: 'Wat Pa Dhampanomwan, Wang Nam Khiao, Nakhon Ratchasima, Thailand' },
      { label: 'Early Registration Fee', value: 'THB 3,900 — register by 31 October 2026' },
      { label: 'Registration Deadline', value: '30 November 2026, or earlier if all spaces are filled' },
    ],
    afterFacts: [
      'The fee covers accommodation, meals, facility expenses, and round-trip coach transportation between Bangkok and the retreat venue.',
      'The meditation training itself is provided free of charge. All instructors from the Willpower Institute Foundation volunteer their time and receive no teaching fees.',
    ],
    sections: [
      {
        heading: 'What You Will Experience',
        items: [
          'Daily meditation practice',
          'Accessible teachings and guided learning',
          'A supportive international retreat community',
          'Time for quiet reflection and inner development',
          'Simple temple living close to nature',
        ],
      },
      {
        heading: 'Who Is It For?',
        text: 'The retreat is conducted in English and welcomes participants of all ages, genders, faiths, and backgrounds. No prior meditation experience is required, and beginners are welcome. The program offers a welcoming, meaningful, and structured environment while remaining true to Phra Ajarn Luangphor’s distinctive meditation teachings, presented in a practical and accessible format.',
      },
    ],
    enrollNote: 'Enroll now - 30 November 2026 (or earlier if all spaces are filled)',
    buttons: [
      // Google Form (needs a Google sign-in, likely because of the payment-slip upload)
      { label: 'Register', sub: '7-Day Retreat', href: 'https://docs.google.com/forms/d/e/1FAIpQLSe7AYKJhmo7rLxyPubgMiUCztFdM7nFzN4VWYPN2W2xODJuUg/viewform?usp=header', style: 'primary' },
      { label: 'Download brochure', href: BROCHURE_7_DAY, style: 'outline', kind: 'download' },
    ],
  },
  {
    id: 'one-day-bangkok-pattaya',
    tab: 'one-day',
    summary: ['Bangkok: every second Saturday, 9AM–4PM', 'Pattaya: 21 Feb, 25 Apr, 20 Jun, 22 Aug, 17 Oct, 19 Dec 2026', 'Free'],
    title: 'FREE 1-Day Meditation for Self-Conquering Course in Bangkok and Pattaya',
    status: 'open',
    images: [
      { src: oneDayBangkok, alt: 'Participants meditating on cushions at Wat Dhammamongkol, Bangkok' },
    ],
    paragraphs: [
      'Willpower Institute offers a FREE one-day English meditation course in Bangkok and Pattaya. It is an introductory meditation course that provides proper meditation technique for everyone.',
    ],
    facts: [
      { label: 'Bangkok', value: 'Wat Dhammamongkol\nEvery second Saturday in 2026, 9AM–4PM' },
      { label: 'Pattaya', value: 'Diana Garden Resort, North Pattaya\n21 Feb, 25 Apr, 20 Jun, 22 Aug, 17 Oct, 19 Dec 2026, 9AM–4PM' },
    ],
    enrollNote: 'Enroll now - December 2026',
    buttons: [
      // Google Form: "Registration Form: Free One-Day English Meditation Course (Bangkok & Pattaya)"
      { label: 'Register', sub: 'One-Day Course', href: 'https://forms.gle/umpNTfYY7UHgvEjX9', style: 'primary' },
    ],
  },
  {
    id: 'yuvasa-samadhi',
    tab: 'children',
    summary: ['Third Saturday of each month, Wat Dhammamongkol, Bangkok', 'Kids 09:00–12:00, teens 13:00–16:00', 'Free'],
    title: 'Half-Day Yuvasa Samadhi (Meditation for Youth)',
    status: 'open',
    images: [{ src: yuvasa, alt: 'Illustration of happy children with colorful balloons' }],
    paragraphs: [
      'Yuvasa Samadhi is a free half-day English meditation program for youth. It is designed for children aged 6–11 in the morning and teens aged 12–15 in the afternoon who can communicate comfortably in English. Participants will learn both the theory and practice of meditation through engaging lessons and enjoyable activities.',
    ],
    facts: [
      { label: 'Location', value: 'Wat Dhammamongkol, Bangkok' },
      { label: 'Schedule', value: 'Third Saturday of each month' },
      { label: 'Kids (ages 6–11)', value: '09:00–12:00' },
      { label: 'Teens (ages 12–15)', value: '13:00–16:00' },
      { label: 'Fee', value: 'Free of charge' },
    ],
    enrollNote: 'Enroll now - December 2026',
    buttons: [
      // Google Forms: kids (ages 6–11, morning) and "Meditation for Teens Registration Form" (afternoon)
      { label: 'Register', sub: 'Kids, ages 6–11', href: 'https://forms.gle/2AMSsJ2RbV2WAUgW8', style: 'primary' },
      { label: 'Register', sub: 'Teens, ages 12–15', href: 'https://forms.gle/DQau1198rduHX3Ew8', style: 'secondary' },
    ],
  },
  {
    id: 'meditation-instructor-course',
    tab: 'instructor',
    summary: ['Six months, May–October 2026', 'Thailand, Jakarta and Los Angeles', 'Free'],
    title: 'FREE Meditation Instructor Course (6 Months) | Thailand • Indonesia • USA',
    status: 'closed',
    images: [{ src: micVideo, alt: 'Meditation Instructor Course (MIC) Batch 3 “Tatiyo Hi-Tech” — May to October 2026' }],
    // TODO: paste the YouTube video ID to show the real video instead of the image
    youtubeId: '',
    paragraphs: [
      'After an amazing conclusion of Meditation Instructor Course (MIC) 2025 — with over 80 graduates from 15 countries — the Willpower Institute will offer the MIC Batch 3 in 2026. MIC is a FREE six-month English meditation instructor course, designed as a comprehensive meditation course to enable participants to teach themselves and others.',
    ],
    facts: [
      {
        label: 'Locations',
        value:
          'THAILAND: Bangkok, Pattaya, Hua Hin, Chiang Mai, and Phuket\nINDONESIA: Cetiya Panna Sikkha, Jakarta\nUSA: Wat Thai of Los Angeles, CA',
      },
    ],
    links: [
      {
        label: 'Download a full 6-month course schedule for Thailand and Indonesia',
        href: 'https://drive.google.com/file/d/1CIHBNawoFW-xK6ZgsH7Z09SxL8JN6WWY/view?usp=sharing',
      },
      {
        label: 'Download a full 6-month course schedule for USA',
        href: 'https://drive.google.com/file/d/1yB0kJIOPr9Gfzv1MVqZKAKOaoZLYvwYP/view?usp=sharing',
      },
    ],
    closedNote: {
      text: ['Registration deadline for MIC Batch 3 for the year 2026 has passed.', 'See you again next year.'],
      linkLabel: 'Please join a 1-day course.',
      linkHref: '#one-day-bangkok-pattaya',
    },
    // forms.gle/VA9aqUrcUoFoeZ1u7 = "2026 Meditation Instructor Course USA Application Form" (closed).
    // When registration reopens: set status to 'open' and add
    // buttons: [{ label: 'Register', href: 'https://forms.gle/VA9aqUrcUoFoeZ1u7', style: 'primary' }]
  },
  {
    id: 'one-day-chiang-mai',
    tab: 'one-day',
    summary: ['Dates to be announced', 'Free'],
    title: 'FREE 1-Day Meditation for Self-Conquering Course in Chiang Mai',
    status: 'coming-soon',
    images: [{ src: oneDayChiangMai, alt: 'Group meditating in a temple pavilion in Chiang Mai' }],
    paragraphs: [
      'Willpower Institute offers a FREE one-day English meditation course in Chiang Mai. It is an introductory meditation course that provides proper meditation technique for everyone.',
    ],
  },
  {
    id: 'one-day-phuket',
    tab: 'one-day',
    summary: ['Dates to be announced', 'Free'],
    title: 'FREE 1-Day Meditation for Self-Conquering Course in Phuket',
    status: 'coming-soon',
    images: [{ src: oneDayPhuket, alt: 'Illustration of a group meditating together' }],
    paragraphs: [
      'Willpower Institute offers a FREE one-day English meditation course in Phuket. It is an introductory meditation course that provides proper meditation technique for everyone.',
    ],
  },
];
