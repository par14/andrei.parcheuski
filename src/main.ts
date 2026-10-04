import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

// Vercel Web Analytics is injected once, from App (browser-only).
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
