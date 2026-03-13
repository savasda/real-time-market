import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'stocks',
  },
  {
    path: 'stocks',
    loadComponent: () =>
      import('./pages/stocks/stocks-page.component').then((module) => module.StocksPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then(
        (module) => module.NotFoundComponent,
      ),
  },
];
