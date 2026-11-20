import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { RacePage } from './pages/race-page/race-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'race', component: RacePage },
  { path: '**', redirectTo: '' },
];
