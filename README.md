# NG-Portfolio Template 🚀

A sleek, customizable developer portfolio template built with Angular. Set up your professional online presence in minutes!

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Check Out the Template](#check-out-the-template)
3. [Installation](#installation)
4. [Customization Wizard](#customization-wizard)
5. [Manual Configuration (Optional)](#manual-configuration-optional)
6. [Assets: Images, CV, and Favicon](#assets-images-cv-and-favicon)
7. [Meta Tags](#meta-tags)
8. [Deployment to Vercel](#deployment-to-vercel)


## Getting Started

This modern portfolio template helps developers showcase their skills, experience, and projects in a professional and visually appealing way. With an interactive setup wizard and easy customization options, you can have your personal portfolio up and running in minutes.

The template supports two layout modes:
- **Spotlight**: The spotlight mode includes a full-screen hero image that creates a strong visual impact. For the best result, make sure the image follows a similar aesthetic and composition to the one provided in the template (e.g., centered subject, good contrast, transparent background).
  👉 Check out the existing images in the project to get a feel for the recommended style. This helps ensure your portfolio looks polished and professional.
- **Portrait**: Mode with a portrait image in the center

## Check Out the Template

Before diving in, you might want to see what your portfolio could look like. Check out the live demos to get a feel for the design and layout:

- **Portrait Mode Demo**: [View Portrait Demo](https://ng-portfolio-portrait-g2towhjht-niveks-projects.vercel.app/)
- **Spotlight Mode Demo**: [View Spotlight Demo](https://ng-portfolio-p7flvynn2-niveks-projects.vercel.app/)

## Installation

Get started by installing the project dependencies:

```bash
npm install
```

## Customization Wizard

The easiest way to configure your portfolio is by using the built-in customization wizard:

```bash
npm run configure-portfolio
```

This interactive CLI tool will guide you through setting up your portfolio by asking questions about:
- Your personal information (name, job title, location)
- Professional experience and career history
- Skills and languages
- References and testimonials
- Contact information and social links
- Visual preferences and layout options

After completing the wizard, the application will automatically start and open in your browser so you can see your changes immediately.

## Manual Configuration (Optional)

If you prefer to configure your portfolio manually, you can edit the `src/app/core/portfolio.data.ts` file directly. This file contains all the data that populates your portfolio, organized into sections like:

- Personal information
- Experience overview
- Career entries
- Skills and languages
- References and links
- Contact information
- Template configuration

## Assets: Images, CV, and Favicon

To personalize your portfolio with your own assets:

* Replace images in the `public/` folder with your own photos and graphics
* For better performance, use `.webp` format for all images
* Convert your existing images to WebP format using the provided script:

  ```bash
  npm run convert-webp
  ```

* Place your CV/resume in the `public/` folder (PDF format recommended)
* Replace `favicon.ico` in the `public/` folder with your own icon

## Meta Tags

For better SEO and social media sharing, update the meta tags in `index.html`:

1. Open `src/index.html`
2. Update the following tags:
   - `<title>`: Your name or portfolio title
   - `<meta name="description">`: Brief description of your portfolio
   - `<meta property="og:title">`: Title for social media sharing
   - `<meta property="og:description">`: Description for social media sharing
   - `<meta property="og:image">`: Path to your preview image for social media

## Deployment to Vercel

Deploy your portfolio to Vercel in just a few steps:

1. Push your project to a GitHub repository
2. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account
3. Click "Add New" and select "Project", then select your repository.
4. Vercel will automatically detect that it's an Angular project
5. Click "Deploy" and wait for the build to complete
6. That's it! Your portfolio is now live at your Vercel URL

You can also configure a custom domain in the Vercel dashboard settings.

---

Built with ❤️ using Angular. Happy showcasing!
