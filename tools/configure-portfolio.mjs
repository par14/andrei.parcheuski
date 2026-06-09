#!/usr/bin/env node

/**
 * NG-Portfolio Configuration Tool
 *
 * This CLI tool allows users to configure their portfolio data interactively.
 * It prompts for all portfolio properties and generates a new portfolio.data.ts file.
 */

// Required dependencies (need to be installed)
// npm install inquirer figlet chalk fs-extra

import inquirer from 'inquirer';
import figlet from 'figlet';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the portfolio.data.ts file
const portfolioDataPath = path.join(__dirname, '../src/app/core/portfolio.data.ts');

// ASCII art header
console.log(
  chalk.cyan(
    figlet.textSync('NG-Portfolio', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
  )
);
console.log(chalk.cyan('='.repeat(80)));
console.log(chalk.white('Welcome to the NG-Portfolio Configuration Tool!'));
console.log(chalk.white('This tool will help you configure your portfolio data.'));
console.log(chalk.white('You can add as many skills, languages, career entries, etc. as you want.'));
console.log(chalk.cyan('='.repeat(80)));
console.log('');

// Main function to run the CLI tool
async function run() {
  try {
    // Get all portfolio data from user input
    const portfolioData = await collectPortfolioData();

    // Generate the portfolio.data.ts file content
    const fileContent = generatePortfolioDataFile(portfolioData);

    // Write the file
    await fs.writeFile(portfolioDataPath, fileContent);

    console.log('');
    console.log(chalk.green('✓ Portfolio data has been successfully updated!'));
    console.log(chalk.green(`✓ File saved to: ${portfolioDataPath}`));

    console.log(chalk.cyan('\nStarting the application and opening it in the browser...'));

    const child = exec('npm run start', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('Error starting the application:'), error);
        return;
      }
      console.log(stdout);
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  } catch (error) {
    console.error(chalk.red('Error updating portfolio data:'), error);
    process.exit(1);
  }
}

// Collect all portfolio data from user input
async function collectPortfolioData() {
  // Personal Info
  const personalInfo = await promptPersonalInfo();

  // Experience Overview
  const experienceOverview = await promptExperienceOverview();

  // About Info
  const aboutInfo = await promptAboutInfo();

  // Career Entries
  const careerEntries = await promptCareerEntries();

  // Skills
  const skills = await promptSkills();

  // Languages
  const languages = await promptLanguages();

  // References
  const references = await promptReferences();

  // Links
  const links = await promptLinks();

  // Contact Info
  const contactInfo = await promptContactInfo();

  // Quote
  const quote = await promptQuote();

  // Template Config
  const templateConfig = await promptTemplateConfig();

  // Footer Info
  const footerInfo = await promptFooterInfo();

  // Status Info
  const statusInfo = await promptStatusInfo();

  return {
    personalInfo,
    experienceOverview,
    aboutInfo,
    careerEntries,
    skills,
    languages,
    references,
    links,
    contactInfo,
    quote,
    templateConfig,
    footerInfo,
    statusInfo,
  };
}

// Prompt for personal info
async function promptPersonalInfo() {
  console.log(chalk.cyan('\n=== Personal Information ==='));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'First Name:',
      default: 'Franz',
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Last Name:',
      default: 'Mustermann',
    },
    {
      type: 'input',
      name: 'role',
      message: 'Professional Role:',
      default: 'Senior Software Engineer from Supervalley',
    },
    {
      type: 'input',
      name: 'location',
      message: 'Location:',
      default: 'Zurich, Switzerland',
    },
  ]);

  return answers;
}

// Prompt for experience overview
async function promptExperienceOverview() {
  console.log(chalk.cyan('\n=== Experience Overview ==='));

  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'startYear',
      message: 'Career Start Year:',
      default: 2011,
    },
  ]);

  return answers;
}

// Prompt for about info
async function promptAboutInfo() {
  console.log(chalk.cyan('\n=== About Information ==='));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Write a description about yourself (you can use multiple lines, press Enter when done):',
      default: 'Experienced in designing, building, and maintaining scalable software systems. Skilled in leading development teams, mentoring junior developers, and driving technical decisions.'
    },
  ]);

  return answers;
}

// Prompt for career entries
async function promptCareerEntries() {
  console.log(chalk.cyan('\n=== Career Entries ==='));

  const careerEntries = [];
  let addMore = true;

  while (addMore) {
    const entry = await inquirer.prompt([
      {
        type: 'input',
        name: 'company',
        message: 'Company Name:',
        default: careerEntries.length === 0 ? 'Apple' : '',
      },
      {
        type: 'input',
        name: 'location',
        message: 'Company Location:',
        default: careerEntries.length === 0 ? 'Berlin' : '',
      },
      {
        type: 'number',
        name: 'startYear',
        message: 'Start Year:',
        default: careerEntries.length === 0 ? 2022 : new Date().getFullYear(),
      },
      {
        type: 'input',
        name: 'role',
        message: 'Your Role:',
        default: careerEntries.length === 0 ? 'Frontend Engineer' : '',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Job Description (you can use multiple lines, press Enter when done):',
        default: careerEntries.length === 0 ? 'Built and optimized responsive web applications using React and TypeScript.' : '',
      },
    ]);

    careerEntries.push(entry);

    const { addMoreEntries } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreEntries',
      message: 'Add another career entry?',
      default: false,
    });

    addMore = addMoreEntries;
  }

  return careerEntries;
}

// Prompt for skills
async function promptSkills() {
  console.log(chalk.cyan('\n=== Skills ==='));

  const skills = [];
  let addMore = true;

  while (addMore) {
    const { skillName } = await inquirer.prompt({
      type: 'input',
      name: 'skillName',
      message: 'Skill Name:',
      default: skills.length === 0 ? 'JavaScript' : '',
    });

    skills.push({ name: skillName });

    const { addMoreSkills } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreSkills',
      message: 'Add another skill?',
      default: true,
    });

    addMore = addMoreSkills;
  }

  return skills;
}

// Prompt for languages
async function promptLanguages() {
  console.log(chalk.cyan('\n=== Languages ==='));

  const languages = [];
  let addMore = true;

  while (addMore) {
    const language = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Language Name:',
        default: languages.length === 0 ? 'English' : '',
      },
      {
        type: 'list',
        name: 'level',
        message: 'Proficiency Level:',
        choices: ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner'],
        default: 'Advanced',
      },
    ]);

    languages.push(language);

    const { addMoreLanguages } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreLanguages',
      message: 'Add another language?',
      default: true,
    });

    addMore = addMoreLanguages;
  }

  return languages;
}

// Prompt for references
async function promptReferences() {
  console.log(chalk.cyan('\n=== References ==='));

  const references = [];
  let addMore = true;

  while (addMore) {
    const reference = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Reference Name:',
        default: references.length === 0 ? 'Marcus Taylor' : '',
      },
      {
        type: 'input',
        name: 'role',
        message: 'Reference Role:',
        default: references.length === 0 ? 'Team Lead' : '',
      },
      {
        type: 'input',
        name: 'company',
        message: 'Reference Company:',
        default: references.length === 0 ? 'Digital Campaigns' : '',
      },
      {
        type: 'input',
        name: 'imageUrl',
        message: 'Reference Image URL (relative to assets):',
        default: references.length === 0 ? 'marcus.webp' : '',
      },
      {
        type: 'input',
        name: 'feedback',
        message: 'Reference Feedback (you can use multiple lines, press Enter when done):',
        default: references.length === 0 ? 'Working with the engineer was an absolute game changer.' : '',
      },
    ]);

    references.push(reference);

    const { addMoreReferences } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreReferences',
      message: 'Add another reference?',
      default: false,
    });

    addMore = addMoreReferences;
  }

  return references;
}

// Prompt for links
async function promptLinks() {
  console.log(chalk.cyan('\n=== Links ==='));

  const links = [];
  let addMore = true;

  while (addMore) {
    const link = await inquirer.prompt([
      {
        type: 'input',
        name: 'text',
        message: 'Link Text:',
        default: links.length === 0 ? 'Zoneless Angular' : '',
      },
      {
        type: 'input',
        name: 'link',
        message: 'Link URL:',
        default: links.length === 0 ? 'https://angularexperts.io/blog/zoneless-angular' : '',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Link Description:',
        default: links.length === 0 ? 'What you need to know and how to prepare' : '',
      },
    ]);

    links.push(link);

    const { addMoreLinks } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreLinks',
      message: 'Add another link?',
      default: false,
    });

    addMore = addMoreLinks;
  }

  return links;
}

// Prompt for contact info
async function promptContactInfo() {
  console.log(chalk.cyan('\n=== Contact Information ==='));

  const contactInfo = [];
  let addMore = true;

  while (addMore) {
    // Ask for title and value/description
    const contactBasic = await inquirer.prompt([
      {
        type: 'input',
        name: 'heading',
        message: 'Contact Title:',
        default: contactInfo.length === 0 ? 'Email' :
                 contactInfo.length === 1 ? 'Phone' :
                 contactInfo.length === 2 ? 'LinkedIn' : 'GitHub',
      },
      {
        type: 'input',
        name: 'body',
        message: 'Contact Value/Description:',
        default: contactInfo.length === 0 ? 'franz.mustermann@example.com' :
                 contactInfo.length === 1 ? '+41 785 43 21' :
                 contactInfo.length === 2 ? 'franz-mustermann' : 'franzmustermann',
      },
    ]);

    // Ask if the contact is clickable
    const { isClickable } = await inquirer.prompt({
      type: 'confirm',
      name: 'isClickable',
      message: 'Is this contact clickable (has a link)?',
      default: true,
    });

    // Create the contact object with the basic info and clickable property
    const contact = {
      heading: contactBasic.heading,
      body: contactBasic.body,
      clickable: isClickable
    };

    // If clickable, ask for the external link
    if (isClickable) {
      const { link } = await inquirer.prompt({
        type: 'input',
        name: 'link',
        message: 'Contact Link:',
        default: function() {
          if (contactBasic.heading === 'Email') return `mailto:${contactBasic.body}`;
          if (contactBasic.heading === 'Phone') return `tel:${contactBasic.body.replace(/\s+/g, '')}`;
          if (contactBasic.heading === 'LinkedIn') return `https://linkedin.com/in/${contactBasic.body}`;
          if (contactBasic.heading === 'GitHub') return `https://github.com/${contactBasic.body}`;
          return '';
        },
      });

      // Add the link to the contact object
      contact.link = link;
    }

    contactInfo.push(contact);

    // Ask if the user wants to add another contact
    const { addMoreContacts } = await inquirer.prompt({
      type: 'confirm',
      name: 'addMoreContacts',
      message: 'Add another contact?',
      default: contactInfo.length < 4,
    });

    addMore = addMoreContacts;
  }

  return contactInfo;
}

// Prompt for quote
async function promptQuote() {
  console.log(chalk.cyan('\n=== Quote ==='));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: 'Your Quote:',
      default: 'Code is written for humans first, machines second. Mastery means never forgetting that.',
    },
  ]);

  return answers;
}

// Prompt for template config
async function promptTemplateConfig() {
  console.log(chalk.cyan('\n=== Template Configuration ==='));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'layoutMode',
      message: 'Layout Mode:',
      choices: ['spotlight', 'portrait'],
      default: 'spotlight',
    },
    {
      type: 'input',
      name: 'customImageUrl',
      message: 'Custom Image URL (optional):',
      default: '',
      when: (answers) => answers.layoutMode === 'portrait',
    },
  ]);

  return answers;
}

// Prompt for footer info
async function promptFooterInfo() {
  console.log(chalk.cyan('\n=== Footer Information ==='));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'mainMessage',
      message: 'Main Footer Message:',
      default: "Glad you're here!",
    },
    {
      type: 'input',
      name: 'subMessage',
      message: 'Sub Footer Message:',
      default: "Let's build something awesome!",
    },
  ]);

  return answers;
}

// Prompt for status info
async function promptStatusInfo() {
  console.log(chalk.cyan('\n=== Status Information ==='));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: 'Status Text:',
      default: 'Open to new opportunities',
    },
    {
      type: 'confirm',
      name: 'isAvailable',
      message: 'Are you available?',
      default: true,
    },
  ]);

  return answers;
}

// Generate the portfolio.data.ts file content
function generatePortfolioDataFile(data) {
  return `import {
  AboutInfo,
  CareerEntryInfo,
  ContactInfo,
  ExperienceOverview,
  FooterInfo,
  TemplateConfig,
  LanguageInfo,
  LinkInfo,
  NgPortfolio,
  PersonalInfo,
  Quote,
  ReferenceInfo,
  SkillInfo,
  StatusInfo,
} from './portfolio.model';

export const PERSONAL_INFO: PersonalInfo = ${formatObject(data.personalInfo)};

export const EXPERIENCE_OVERVIEW: ExperienceOverview = ${formatObject(data.experienceOverview)};

export const ABOUT_INFO: AboutInfo = ${formatObject(data.aboutInfo)};

export const CAREER_ENTRIES: CareerEntryInfo[] = ${formatArray(data.careerEntries)};

export const SKILLS: SkillInfo[] = ${formatArray(data.skills)};

export const LANGUAGES: LanguageInfo[] = ${formatArray(data.languages)};

export const REFERENCES: ReferenceInfo[] = ${formatArray(data.references)};

export const LINKS: LinkInfo[] = ${formatArray(data.links)};

export const CONTACT_INFO: ContactInfo[] = ${formatArray(data.contactInfo)};

export const QUOTE: Quote = ${formatObject(data.quote)};

export const HERO_CONFIG: TemplateConfig = ${formatObject(data.templateConfig)};

export const FOOTER_INFO: FooterInfo = ${formatObject(data.footerInfo)};

export const STATUS_INFO: StatusInfo = ${formatObject(data.statusInfo)};

export const PORTFOLIO_DATA: NgPortfolio = {
  personalInfo: PERSONAL_INFO,
  experienceOverview: EXPERIENCE_OVERVIEW,
  aboutInfo: ABOUT_INFO,
  careerEntries: CAREER_ENTRIES,
  skills: SKILLS,
  languages: LANGUAGES,
  references: REFERENCES,
  links: LINKS,
  contactInfo: CONTACT_INFO,
  quote: QUOTE,
  templateConfig: HERO_CONFIG,
  footerInfo: FOOTER_INFO,
  statusInfo: STATUS_INFO,
};
`;
}

// Format an object as a string with proper indentation
function formatObject(obj) {
  // Check if this is a ReferenceInfo object (has name, role, company, feedback properties)
  const isReferenceInfo = obj.name !== undefined && obj.role !== undefined &&
                         obj.company !== undefined && obj.feedback !== undefined;

  // If it's a ReferenceInfo and doesn't have imageUrl, add an empty one
  if (isReferenceInfo && !obj.imageUrl) {
    obj.imageUrl = '';
  }

  // Check if this is a LinkInfo object (has text, link, description properties)
  const isLinkInfo = obj.text !== undefined && obj.link !== undefined &&
                    obj.description !== undefined;

  // Check if this is a CareerEntryInfo object (has company, location, startYear, role, description properties)
  const isCareerEntryInfo = obj.company !== undefined && obj.location !== undefined &&
                           obj.startYear !== undefined && obj.role !== undefined &&
                           obj.description !== undefined;

  return `{
  ${Object.entries(obj)
    .filter(([key, value]) => value !== undefined && (value !== '' ||
      (isReferenceInfo && ['name', 'role', 'company', 'imageUrl', 'feedback'].includes(key)) ||
      (isLinkInfo && ['text', 'link', 'description'].includes(key)) ||
      (isCareerEntryInfo && ['company', 'location', 'role', 'description'].includes(key))
    ))
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join(',\n  ')}
}`;
}

// Format an array as a string with proper indentation
function formatArray(arr) {
  if (!arr.length) return '[]';

  return `[
  ${arr.map(item => formatObject(item)).join(',\n  ')}
]`;
}

// Format a value based on its type
function formatValue(value) {
  if (typeof value === 'string') {
    // Escape quotes and format multiline strings
    const escapedValue = value
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');

    if (escapedValue.includes('\\n')) {
      return `"${escapedValue}"`;
    }

    return `"${escapedValue}"`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return formatArray(value);
  }

  if (typeof value === 'object' && value !== null) {
    return formatObject(value);
  }

  return 'null';
}

// Run the CLI tool
run();
