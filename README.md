# Biathlon Simulator 
A small browser game, about the hardest part of Biathlon: the shooting range.

Four stages, five targets each. Before every stage choose how hard you ski: a faster lap saves seconds, but you arrive at the polygon with a racing heart and shaking sights. At the range your sights rise and fall with your breath and jump with every heartbeat. Waiting, calms you down while the clock keeps running, and every miss costs 25 seconds penalty.

## How to use it
Visit this page, and just start playing. 

## Controls

| | Mouse / keyboard | Touch |
|---|---|---|
| Aim | move the mouse, or arrow keys | drag on the range |
| Fire | left click, `Enter` or `F` | **Fire** button |
| Hold breath | hold `Space` or the right button | hold **Hold breath** |

## Local 

```bash
npm i
npm start # http://localhost:4200
npm test # tests
npm run build # builds the static site in dist/frontend/browser
```

If you have Angular installed:

```bash
npm i -g @angular/cli
ng serve # http://localhost:4200
ng tests # tests
ng build # builds the static site dist/frontend/browser
```

The build is a static site with hash routning, and a relative base path, so it can be served from any folder (Github Pages included). Best times are kept in the browser only.

## Tech Stack
- Angular 22
- Tailwind 4
- one canvas

The game rules live in `src/app/game` as plain TS: `shooter.ts` is the sway model, `race.ts` the race state machine, `renderer.ts` draws a frame.