import { InjectionToken } from '@angular/core';

/**
 * WebSocket URL of the local proxy server.
 * Example: 'ws://localhost:8080'
 */
export const FINNHUB_WS_URL = new InjectionToken<string>('FINNHUB_WS_URL');

/**
 * HTTP base URL of the local proxy server (for REST endpoints).
 * Example: 'http://localhost:8080'
 *
 * The Finnhub API key is intentionally kept server-side only.
 * The client communicates exclusively with our NestJS proxy.
 */
export const SERVER_URL = new InjectionToken<string>('SERVER_URL');
