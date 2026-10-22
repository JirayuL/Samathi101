/** Site-wide text and contact details. */

export const site = {
  name: 'Willpower Institute',
  tagline: 'Founded by Luangphor Viriyang Sirintharo',
  title: 'THAILAND Willpower Institute, English Meditation Courses',
  description:
    'Meditation courses in English of Willpower Institute Foundation Luangphor Viriyang Sirintharo.',
  heroTitle: 'English Meditation Courses',
  heroSubtitle: 'in Thailand, Indonesia and the USA',
  heroLine:
    'Based on the teachings of Somdet Phra Nyanavajirodom (Luangphor Viriyang Sirintharo), in the lineage of the Thai Forest tradition.',
  quote: 'Meditation promotes reason, responsibility, and loving-kindness.',
};

export const contact = {
  headquarters: {
    heading: 'Global headquarters in Thailand',
    items: [
      {
        label: 'Meditation Courses in Foreign Language Department',
        value: 'Wat Dhammamongkol, Soi Sukhumvit 101',
        href: 'https://maps.app.goo.gl/G9nXpVbbJhNQCAJW7',
      },
      { label: 'Email', value: 'wif.meditation@gmail.com', href: 'mailto:wif.meditation@gmail.com' },
      { label: 'Facebook', value: 'facebook.com/willpower.fls', href: 'https://www.facebook.com/willpower.fls' },
      { label: 'Line', value: '@willpower.fls', href: 'https://lin.ee/j0y9jZc' },
      {
        label: 'Website (global)',
        value: 'english.samathi101.com',
        href: 'https://english.samathi101.com/',
      },
    ],
  },
  countries: {
    heading: 'Indonesia and USA',
    items: [
      {
        label: 'Indonesia (Jakarta) — Facebook',
        value: 'facebook.com/willpower.jakarta',
        href: 'https://facebook.com/willpower.jakarta',
      },
      {
        label: 'USA — Website',
        value: 'willpowerinstitute.us',
        href: 'https://willpowerinstitute.us/',
      },
      {
        label: 'USA — Facebook',
        value: 'facebook.com/meditation.willpowerinstitute.us',
        href: 'https://www.facebook.com/meditation.willpowerinstitute.us',
      },
    ],
  },
} as const;
