/**
 * Registration forms on this site. Each one is shown on the Register tab and sends the answers to the
 * Google Apps Script web app (apps-script/Code.gs), which saves one row per application in the Google Sheet
 * and emails the applicant a copy. See AGENTS.md -> "Google Sheet".
 *
 * Questions are worded exactly as in the Google Form they replace, so the Sheet's columns (one per `label`)
 * line up with that form's responses. Changing a label starts a new column in the Sheet.
 *
 * Field types: 'email' | 'text' | 'tel' | 'date' | 'textarea' | 'radio' (one answer) | 'checkbox' (any number)
 * `other: true` adds an "Other:" choice with a text box. `showIf` shows a section only for one answer.
 */

export type FieldType = 'email' | 'text' | 'tel' | 'date' | 'textarea' | 'radio' | 'checkbox';

export interface Field {
  name: string; // short id, used in the page only
  label: string; // the question, and the Sheet column header
  type: FieldType;
  required?: boolean;
  options?: string[];
  other?: boolean;
  help?: string[]; // lines shown under the question
}

export interface FormSection {
  heading?: string;
  text?: string[];
  showIf?: { field: string; equals: string };
  fields: Field[];
}

export interface RegistrationForm {
  id: string; // the form's #anchor is apply-<id>; the script's FORMS config uses the same id
  courseId: string; // the course in courses.ts
  title: string;
  intro: string[];
  /** Used while the Google Sheet isn't connected (PUBLIC_SHEET_API_URL empty) */
  googleFormUrl: string;
  /** At least one of these must be filled in */
  oneOf?: { fields: string[]; message: string }[];
  sections: FormSection[];
  /** Shown after a successful submission */
  thankYou: string[];
}

const THAI = 'I am a Thai with proficiency in English';

export const registrationForms: RegistrationForm[] = [
  {
    id: 'mic-online-2027',
    courseId: 'mic-online-2027',
    title: 'MIC Online — Batch 1 (2027) Application Form',
    intro: [
      'Regular registration: 1 November – 31 December 2026. Late registration: 1–10 January 2027, subject to availability.',
      'Limited to approximately 75 participants. Offered by the Willpower Institute Foundation, Luangphor Viriyang Sirintharo.',
    ],
    googleFormUrl: 'https://forms.gle/sPF3JG52DH9VHdRw5',
    oneOf: [
      {
        fields: ['line_id', 'whatsapp'],
        message: 'Please give your LINE ID or your WhatsApp number, so we can add you to a course chat group.',
      },
    ],
    sections: [
      {
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            help: ['Please ensure your email address is correct, as we will send you further instructions before the course begins.'],
          },
          {
            name: 'applicant',
            label:
              'This comprehensive six-month online meditation course is conducted in English and welcomes people of all nationalities and faiths, including Thai participants with English proficiency who have never enrolled in the Thai version of the course.',
            type: 'radio',
            required: true,
            options: ['I am a non-Thai', THAI],
          },
          {
            name: 'session',
            label:
              'Our weekly live online sessions are held on Saturday evenings from 19:30–21:00 and Sunday mornings from 10:00–11:30, Bangkok time (UTC+7). Please choose one as your primary session. You may attend the other session in weeks when you cannot attend your preferred one.',
            type: 'radio',
            required: true,
            options: [
              'Saturday evenings from 19:30–21:00 Bangkok time (UTC+7)',
              'Sunday mornings from 10:00–11:30, Bangkok time (UTC+7)',
            ],
          },
        ],
      },
      {
        heading: 'Important information for Thai applicants',
        text: [
          'This course is intended for an English-speaking audience. We welcome both foreign and Thai applicants, but Thai participants must demonstrate proficiency in English. If you are already a graduate of Thai Kru Samadhi course, you are not eligible for this course, as the content is the same.',
          'To demonstrate English proficiency, please provide as much background information as possible for our team to assess. If necessary, we will contact you to arrange a phone conversation with you. Your application will be evaluated on a case-by-case basis.',
        ],
        showIf: { field: 'applicant', equals: THAI },
        fields: [
          { name: 'native_language', label: 'What is your native language?', type: 'radio', required: true, options: ['Thai', 'English'], other: true },
          {
            name: 'english_level',
            label: 'What is your English proficiency level?',
            type: 'radio',
            required: true,
            options: ['Native or Fluent', 'Proficient', 'Intermediate'],
            other: true,
            help: [
              'Native or Fluent – You can think, speak, and write in English with ease. You use complex language naturally, including idioms, slang, and cultural expressions.',
              'Proficient – You understand nearly everything you hear or read, including long and complex discussions. You can express yourself spontaneously and precisely.',
              'Intermediate – You can express yourself clearly and communicate well in everyday situations. However, more complex topics, such as technical, academic, or abstract subjects, may be challenging.',
            ],
          },
          {
            name: 'english_journey',
            label: 'Please describe your journey in learning English, including any formal courses or self-study experiences?',
            type: 'textarea',
            required: true,
          },
          {
            name: 'not_kru_samadhi',
            label:
              'Since the content of the English MIC and the Thai version of the Kru-Samadhi course is the same, please confirm that you have not previously studied the Thai version of the Kru-Samadhi course.',
            type: 'checkbox',
            required: true,
            options: ['I have never taken Thai version of Kru-Samadhi course'],
          },
        ],
      },
      {
        heading: 'Meditation Course Application Form',
        fields: [
          { name: 'prefix', label: 'Prefix', type: 'radio', required: true, options: ['Mr.', 'Mrs.', 'Miss', 'Dr.'], other: true },
          { name: 'first_name', label: 'First name', type: 'text', required: true },
          { name: 'last_name', label: 'Last name', type: 'text', required: true },
          {
            name: 'line_id',
            label: 'What is your LINE ID?',
            type: 'text',
            help: [
              'Please provide either your LINE ID or WhatsApp number. We will invite you to one of the course’s chat groups before the course begins.',
              'LINE is a messaging app primarily used in Thailand. We recommend using WhatsApp if you live outside Thailand and do not have a Thai phone number.',
            ],
          },
          { name: 'whatsapp', label: 'What is your WhatsApp number?', type: 'tel' },
          { name: 'birth_date', label: 'Date of Birth', type: 'date', required: true },
          { name: 'education', label: 'Education', type: 'checkbox', options: ['Bachelor', 'Master', 'Doctorate'], other: true },
          { name: 'occupation', label: 'Occupation', type: 'text', required: true },
          { name: 'country', label: 'What country do you currently live in?', type: 'text', required: true },
          { name: 'nationality', label: 'What is your nationality?', type: 'text', required: true },
          { name: 'address', label: 'Contact address', type: 'textarea', required: true },
          { name: 'mobile', label: 'Mobile number (including country code and area code)', type: 'tel' },
          {
            name: 'heard_from',
            label: "How did you know about Willpower Institute Foundation's meditation course?",
            type: 'radio',
            required: true,
            options: ['Social media (Facebook, Line)', 'Friend', 'Banners at the temple', 'Willpower Institute Website'],
            other: true,
          },
          {
            name: 'experience_years',
            label: 'How many years of meditation experience do you have?',
            type: 'radio',
            required: true,
            options: ['no prior experience', '1-5 years', '6-10 years', 'more than 10 years'],
          },
          {
            name: 'reasons',
            label: 'Please describe your reasons or expectations for attending this English meditation course.',
            type: 'textarea',
            required: true,
          },
          { name: 'prior_experience', label: 'If you have prior experience in meditation, please explain.', type: 'textarea' },
          { name: 'questions', label: 'If you have any questions or comments, please let us know.', type: 'textarea' },
          {
            name: 'consent',
            label: 'I hereby agree to the following terms and conditions for registering for this meditation course:',
            type: 'checkbox',
            required: true,
            options: ['Agree'],
            help: [
              "1. I consent to the provision of my personal information as specified in this application form for various activities in the meditation course. Willpower Institute Foundation will not disclose or use my information for purposes other than the foundation's meditation courses.",
              '2. I agree to comply with all the rules and regulations set by the foundation or its branch where I registered for the meditation course.',
            ],
          },
        ],
      },
    ],
    thankYou: [
      'Thank you. Your application has been received.',
      'We have emailed you a copy of your answers. Please keep it as proof of your application. We will also send confirmation emails with further instructions before the orientation.',
      'If you have any other questions, email us at wif.meditation@gmail.com or message us on LINE at @willpower.fls.',
    ],
  },
];
