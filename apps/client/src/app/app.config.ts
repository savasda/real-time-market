import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { FINNHUB_WS_URL, SERVER_URL } from './core/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: FINNHUB_WS_URL, useValue: 'ws://localhost:8080' },
    { provide: SERVER_URL, useValue: 'http://localhost:8080' },
  ],
};
