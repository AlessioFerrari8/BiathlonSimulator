import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { RacePage } from './pages/race-page/race-page';
import { ResultPage } from './pages/result-page/result-page';
import { AthletePage } from './pages/athlete-page/athlete-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'athlete', component: AthletePage },
  { path: 'race', component: RacePage },
  { path: 'result', component: ResultPage },
  { path: '**', redirectTo: '' },
];
