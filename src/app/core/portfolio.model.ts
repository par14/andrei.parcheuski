export interface PersonalInfo {
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  tagline: string;
  availability: string;
}

export interface HighlightInfo {
  value: string;
  label: string;
}

export interface SkillGroupInfo {
  name: string;
  skills: string[];
}

export interface ExperienceOverview {
  startYear: number;
}

export interface AboutInfo {
  description: string;
}

export interface CareerEntryInfo {
  company: string;
  location: string;
  startYear: number;
  endYear?: number;
  role: string;
  description?: string;
  achievements?: string[];
}

export interface EducationInfo {
  degree: string;
  institution: string;
  location: string;
  startYear: number;
  endYear: number;
}

export interface LanguageInfo {
  name: string;
  level: string;
}

export interface LinkInfo {
  text: string;
  link: string;
  description: string;
}

export interface ContactInfo {
  heading: string;
  body: string;
  clickable?: boolean;
  link?: string;
}

export interface Quote {
  text: string;
}

export interface FooterInfo {
  mainMessage: string;
  subMessage: string;
}

export interface StatusInfo {
  text: string;
}

export interface NgPortfolio {
  personalInfo: PersonalInfo;
  experienceOverview: ExperienceOverview;
  highlights: HighlightInfo[];
  aboutInfo: AboutInfo;
  careerEntries: CareerEntryInfo[];
  education: EducationInfo[];
  skillGroups: SkillGroupInfo[];
  languages: LanguageInfo[];
  links: LinkInfo[];
  contactInfo: ContactInfo[];
  quote: Quote;
  footerInfo: FooterInfo;
  statusInfo: StatusInfo;
}
