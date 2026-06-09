import {
  AboutInfo,
  CareerEntryInfo,
  ContactInfo,
  EducationInfo,
  ExperienceOverview,
  FooterInfo,
  HighlightInfo,
  LanguageInfo,
  LinkInfo,
  NgPortfolio,
  PersonalInfo,
  Quote,
  SkillGroupInfo,
  StatusInfo,
} from './portfolio.model';

export const PERSONAL_INFO: PersonalInfo = {
  firstName: 'Andrei',
  lastName: 'Parcheuski',
  role: 'Senior Angular Developer & Frontend Team Lead',
  location: 'Warsaw, Poland',
  tagline:
    'I build high-performance Angular platforms — and lead the teams that ship them.',
  availability:
    'Open to remote senior / lead roles · Warsaw (CET) · 6+ years working with US teams',
};

export const EXPERIENCE_OVERVIEW: ExperienceOverview = {
  startYear: 2015,
};

export const HIGHLIGHTS: HighlightInfo[] = [
  { value: '11+', label: 'years in frontend' },
  { value: '30+', label: 'enterprise apps shipped' },
  { value: '8', label: 'published npm packages' },
  { value: '95%', label: 'test coverage' },
];

export const ABOUT_INFO: AboutInfo = {
  description:
    'Senior Angular Developer with 11+ years building production-grade web applications across healthcare, e-commerce, LMS, and AR/XR — including 6+ years with US companies (remote) and 4+ years of team-lead experience. Core strength in the Angular ecosystem (9+ years) — Signals, NgRx and Signal Store, RxJS, Reactive Forms, lazy loading, and performance — with frontend architecture built from scratch and published npm packages, backed by solid React and Next.js experience. Strong focus on testing and code quality (Playwright, Vitest, 95% coverage), mentoring developers, and leading distributed teams to ship complex platforms on time.',
};

export const CAREER_ENTRIES: CareerEntryInfo[] = [
  {
    company: '3D Source',
    location: 'Warsaw, Poland',
    startYear: 2023,
    role: 'Senior Front-End Developer',
    achievements: [
      'Architect and build 3D product configurators with Angular and Three.js — approximately 30 enterprise projects on a shared 80,000-line codebase.',
      'Integrated real-time Unreal Engine pixel-streaming into the Angular front end for high-fidelity 3D rendering.',
      'Authored and published 8 internal npm packages under @3dsource — a shared Angular UI component library, data loaders, and configurator APIs.',
      'Built an external integration API enabling embedding and two-way interaction via iframe.',
      'Reached 95% test coverage — Playwright E2E (GraphQL stubbing and code coverage) and Vitest unit tests across core modules.',
      'Led a full front-end performance optimization of the platform.',
    ],
  },
  {
    company: 'ITRex Group',
    location: 'Aliso Viejo, CA, USA (Remote)',
    startYear: 2021,
    endYear: 2023,
    role: 'Front-End Team Lead',
    achievements: [
      'Led a 4-person frontend team and mentored 2 developers across two flagship projects on a 2-week release cycle, shipping approximately 20 major features on budget and on schedule.',
      'Owned the frontend architecture of a React and Next.js vendor-management platform for the sports industry — from schema design to Azure deployment.',
      'Built internationalization for 11 languages with full LTR/RTL support (including Arabic), dynamic routing, and responsive layouts.',
      'Delivered hybrid-app support (iOS and Android via WebView bridge), push notifications, and custom elements through the Kentico CMS API.',
      'Collaborated with management and third parties (Google Ads, Batch) on performance and SEO; reviewed pull requests and owned feature estimations.',
    ],
  },
  {
    company: 'ITRex Group',
    location: 'Aliso Viejo, CA, USA (Remote)',
    startYear: 2019,
    endYear: 2021,
    role: 'Front-End Developer',
    achievements: [
      'Delivered 4 key projects using React, Angular, and 8th Wall.',
      'Built a high-traffic Angular, RxJS, and Material UI marketplace platform, credited with a 25% increase in company sales revenue.',
      'Set up the application architecture, integrated 8th Wall for AR model and asset display, and handled testing and Heroku deployment.',
    ],
  },
  {
    company: 'HQSoftware',
    location: 'USA (Remote)',
    startYear: 2018,
    endYear: 2019,
    role: 'Full-Stack Web Developer',
    achievements: [
      'Led product definition, requirements analysis, and full implementation across new project designs.',
      'Led a 6-person frontend team and synchronized desktop and mobile XR experiences.',
      'Selected and owned the technology stack: Three.js, Angular, Angular Material, NgRx.',
    ],
  },
  {
    company: 'HQSoftware',
    location: 'USA (Remote)',
    startYear: 2017,
    endYear: 2018,
    role: 'Front-End Web Developer',
    achievements: [
      'Built a client web platform from scratch for authoring AR and VR (extended reality) scenes, contributing to a 50% increase in marketing-driven sales.',
      'Developed PWA and SPA experiences with Angular, Three.js, Wikitude, and a custom XR Builder.',
    ],
  },
  {
    company: 'IBA Group',
    location: 'Minsk, Belarus',
    startYear: 2016,
    endYear: 2017,
    role: 'Full-Stack Web Developer',
    achievements: [
      'Migrated a Learning Management System that cut learning time by 40%.',
      'Built React UI components on a Ruby on Rails backend.',
    ],
  },
  {
    company: 'SoftClub',
    location: 'Minsk, Belarus',
    startYear: 2015,
    endYear: 2016,
    role: 'JavaScript Developer',
    achievements: [
      'Built automated banking-data dashboards (JavaScript, QlikView, SQL) that improved reporting productivity by 25%.',
    ],
  },
];

export const EDUCATION: EducationInfo[] = [
  {
    degree: 'M.Sc. in Applied Mathematics and Computer Science',
    institution: 'Belarusian State University',
    location: 'Minsk, Belarus',
    startYear: 2016,
    endYear: 2017,
  },
  {
    degree: 'B.Sc. in Applied Mathematics (Optimization Methods)',
    institution: 'Belarusian State University',
    location: 'Minsk, Belarus',
    startYear: 2011,
    endYear: 2016,
  },
];

export const SKILL_GROUPS: SkillGroupInfo[] = [
  {
    name: 'Core',
    skills: ['Angular', 'TypeScript', 'RxJS', 'Signals', 'NgRx', 'NgRx Signal Store'],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Next.js', 'Reactive Forms', 'Angular Material', 'Tailwind CSS', 'SCSS', 'SSR'],
  },
  {
    name: '3D · AR · XR',
    skills: ['Three.js', 'WebGL', 'Unreal Pixel Streaming', '8th Wall', 'WebXR / AR / VR'],
  },
  {
    name: 'Testing & Quality',
    skills: ['Playwright', 'Vitest', 'Jest', 'Performance', 'Frontend Architecture'],
  },
  {
    name: 'APIs & Tooling',
    skills: ['GraphQL', 'REST APIs', 'Monorepo', 'npm packages', 'CI/CD', 'Docker', 'AWS', 'Azure', 'i18n'],
  },
];

export const LANGUAGES: LanguageInfo[] = [
  { name: 'Russian', level: 'Native' },
  { name: 'Belarusian', level: 'Native' },
  { name: 'English', level: 'Professional Working' },
];

export const LINKS: LinkInfo[] = [
  {
    text: '3D Product Configurators — 3D Source',
    link: 'https://www.3dsource.com',
    description:
      'Architected ~30 enterprise 3D configurators on a shared 80k-line Angular + Three.js codebase, with real-time Unreal Engine pixel-streaming and 8 published @3dsource npm packages. Reached 95% test coverage with Playwright and Vitest.',
  },
  {
    text: 'Vendor-Management Platform — ITRex',
    link: 'https://itrexgroup.com',
    description:
      'Owned the React/Next.js frontend architecture for a sports-industry platform — schema design to Azure deployment — with i18n across 11 languages (full LTR/RTL incl. Arabic) and hybrid iOS/Android support via a WebView bridge.',
  },
  {
    text: 'AR/VR Scene Builder — HQSoftware',
    link: 'https://hqsoftwarelab.com',
    description:
      'Built a client web platform from scratch for authoring AR/VR (extended reality) scenes with Angular, Three.js, and Wikitude — contributing to a 50% increase in marketing-driven sales.',
  },
  {
    text: 'Oyper — AI Browser Extension',
    link: 'https://linkedin.com/in/andrewpar14',
    description:
      'AI-powered Chrome and Facebook extension that lets users upload clothing images and find visually similar products across the web. Built from scratch in Angular with a REST API backend (2020–2021).',
  },
];

export const CONTACT_INFO: ContactInfo[] = [
  {
    heading: 'Email',
    body: 'parchevscky17@gmail.com',
    clickable: true,
    link: 'mailto:parchevscky17@gmail.com',
  },
  {
    heading: 'Phone',
    body: '+48 572 017 314',
    clickable: true,
    link: 'tel:+48572017314',
  },
  {
    heading: 'LinkedIn',
    body: 'andrewpar14',
    clickable: true,
    link: 'https://linkedin.com/in/andrewpar14',
  },
  {
    heading: 'Location',
    body: 'Warsaw, Poland',
  },
];

export const QUOTE: Quote = {
  text: 'Great frontend is more than pixels — it is architecture, performance, and a team that ships.',
};

export const FOOTER_INFO: FooterInfo = {
  mainMessage: 'Let’s build something remarkable.',
  subMessage: 'Open to senior and lead frontend engineering roles.',
};

export const STATUS_INFO: StatusInfo = {
  text: 'Open to senior / lead frontend roles',
};

export const PORTFOLIO_DATA: NgPortfolio = {
  personalInfo: PERSONAL_INFO,
  experienceOverview: EXPERIENCE_OVERVIEW,
  highlights: HIGHLIGHTS,
  aboutInfo: ABOUT_INFO,
  careerEntries: CAREER_ENTRIES,
  education: EDUCATION,
  skillGroups: SKILL_GROUPS,
  languages: LANGUAGES,
  links: LINKS,
  contactInfo: CONTACT_INFO,
  quote: QUOTE,
  footerInfo: FOOTER_INFO,
  statusInfo: STATUS_INFO,
};
