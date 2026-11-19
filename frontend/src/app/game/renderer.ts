import { FIELD, TARGET_RADIUS, TARGET_XS, TARGET_Y } from "./config";
import { Race } from "./race";
import { Vec } from "./shooter";

const COLORS = {
  skyTop: '#9fc4e4',
  skyBottom: '#e9f1f8',
  trees: '#1f3b33',
  snow: '#f4f8fb',
  snowShade: '#d5e2ee',
  frame: '#161b22',
  target: '#05070a',
  hit: '#ffffff',
  miss: '#e5484d',
  flag: '#f5a524',
  mask: '#rgba(6, 9, 14, 0.74)',
  sight: '#05070a',
  sightBusy: '#8a94a3',
};

const SCOPE_RADIUS = 170;

// Draws one frame. The context is already scaled to the FIELD size
export function drawScene(ctx: CanvasRenderingContext2D, race: Race, aim: Vec): void {
  drawBackground(ctx);
  drawFlag(ctx, 190, race.wind);
  drawFlag(ctx, 810, race.wind);
  drawTargets(ctx, race);
  drawScope(ctx, race.sight(aim), TARGET_RADIUS[race.position] * 1.6, race.reloadMs > 0);
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const sky = ctx.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, COLORS.skyTop);
  sky.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD.width, 220);

  // Row of firs behind the range: fixed heights, no randomness on each frame
  ctx.fillStyle = COLORS.trees;
  for (let x = -10; x < FIELD.width; x += 34) {
    const height = 46 + ((x * 7) % 31);
    ctx.beginPath();
    ctx.moveTo(x, 222);
    ctx.lineTo(x + 17, 222 - height);
    ctx.lineTo(x + 34, 222);
    ctx.fill();
  }

  const snow = ctx.createLinearGradient(0, 220, 0, FIELD.height);
  snow.addColorStop(0, COLORS.snowShade);
  snow.addColorStop(1, COLORS.snow);
  ctx.fillStyle = snow;
  ctx.fillRect(0, 220, FIELD.width, FIELD.height - 220);

  // Edges of the shooting lane, narrowing towards the targets
  ctx.strokeStyle = COLORS.snowShade;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, FIELD.height);
  ctx.lineTo(250, 345);
  ctx.moveTo(920, FIELD.height);
  ctx.lineTo(750, 345);
  ctx.stroke();
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, wind: number): void {
  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, 350);
  ctx.lineTo(x, 262);
  ctx.stroke();

  // More wind = a tauter flag; with no widn it hangs along the pole, as it would in reality
  const reach = wind * 16;
  const droop = 30 * (1 - Math.abs(wind));
  ctx.fillStyle = COLORS.flag;
  ctx.beginPath();
  ctx.moveTo(x, 264);
  ctx.lineTo(x + reach, 272 + droop);
  ctx.lineTo(x, 284);
  ctx.fill();
}

function drawTargets(ctx: CanvasRenderingContext2D, race: Race): void {
  const radius = TARGET_RADIUS[race.position];

  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(240, TARGET_Y - 50, 520, 100);
  ctx.strokeStyle = COLORS.hit;
  ctx.lineWidth = 2;
  ctx.strokeRect(240, TARGET_Y - 50, 520, 100);

  TARGET_XS.forEach((x, i) => {
    // As on real targets: a hit black disc gets covered by a white one
    ctx.fillStyle = race.hits[i] ? COLORS.hit : COLORS.target;
    ctx.beginPath();
    ctx.arc(x, TARGET_Y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = COLORS.miss;
  for (const shot of race.shots) {
    if (shot.target >= 0) continue;
    ctx.beginPath();
    ctx.arc(shot.impact.x, shot.impact.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}


function drawScope(ctx: CanvasRenderingContext2D, sight: Vec, ring: number, busy: boolean): void {
  // Everything dark expect one hole: it is the rear sight, you only see where you aim
  ctx.fillStyle = COLORS.mask;
  ctx.beginPath();
  ctx.rect(0, 0, FIELD.width, FIELD.height);
  ctx.arc(sight.x, sight.y, SCOPE_RADIUS, 0, Math.PI * 2);
  ctx.fill('evenodd');

  ctx.strokeStyle = COLORS.sight;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(sight.x, sight.y, SCOPE_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Aiming ring: grey while reloading, so it is clear the rifle will not fire
  ctx.strokeStyle = busy ? COLORS.sightBusy : COLORS.sight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(sight.x, sight.y, ring, 0, Math.PI * 2);
  ctx.stroke();
}
