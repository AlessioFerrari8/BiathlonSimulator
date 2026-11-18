import { FIELD } from "./config";
import { Race } from "./race";
import { Vec } from "./shooter";

const COLORS = {
  skyTop: '#9fc4e4',
  skyBottom: '#e9f1f8',
  trees: '#1f3b33',
  snow: '#f4f8fb',
  snowShade: '#d5e2ee',
};

// Draws one frame. The context is already scaled to the FIELD size
export function drawScene(ctx: CanvasRenderingContext2D, race: Race, aim: Vec): void {
  drawBackground(ctx);
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




