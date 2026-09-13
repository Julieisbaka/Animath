import { Circle, MathTex, SvgRenderer, Timeline, Tween, Vector2, easeInOutQuad } from '../../dist/index.js';

const svg = document.querySelector('#stage');
const playButton = document.querySelector('#play');
const resetButton = document.querySelector('#reset');
const scrubber = document.querySelector('#scrubber');
const timeLabel = document.querySelector('#time');
if (!(svg instanceof SVGSVGElement) || !(playButton instanceof HTMLButtonElement) || !(resetButton instanceof HTMLButtonElement) || !(scrubber instanceof HTMLInputElement) || !(timeLabel instanceof HTMLOutputElement)) {
  throw new Error('Core example controls are missing.');
}

const renderer = new SvgRenderer(svg);
renderer.resize(900, 520);

const scene = new Circle(0).setStyle({ opacity: 0 }).moveTo(new Vector2(450, 260));
const blue = new Circle(42).setStyle({ fill: '#c9973f', stroke: '#f0efe9', strokeWidth: 3 }).moveTo(new Vector2(-260, 0));
const pink = new Circle(30).setStyle({ fill: '#e8b874', stroke: '#f0efe9', strokeWidth: 3 }).moveTo(new Vector2(0, 0));
const gold = new Circle(22).setStyle({ fill: '#8f8f88', stroke: '#f0efe9', strokeWidth: 3 }).moveTo(new Vector2(0, 0));
const formula = new MathTex('a^2 + b^2 = c^2', { fontSize: 32 }).setStyle({ fill: '#f0efe9' }).moveTo(new Vector2(-145, -175));
scene.add(blue, pink.add(gold), formula);

const timeline = new Timeline()
  .add(new Tween({ duration: 2, easing: easeInOutQuad, onUpdate: (progress) => {
    blue.moveTo(new Vector2(-260 + progress * 520, 0));
    blue.rotate(0.08);
  }}))
  .add(new Tween({ duration: 2, easing: easeInOutQuad, onUpdate: (progress) => {
    pink.moveTo(new Vector2(0, progress * 130));
    pink.setScale(new Vector2(1 + progress * 0.5, 1 + progress * 0.5));
  }}))
  .add(new Tween({ duration: 2, easing: easeInOutQuad, onUpdate: (progress) => {
    gold.moveTo(new Vector2(Math.sin(progress * Math.PI * 2) * 130, -progress * 100));
    gold.setStyle({ opacity: 1 - progress * 0.7 });
  }}));

function render() {
  renderer.beginFrame();
  renderer.renderMobject(scene);
  renderer.endFrame();
  scrubber.value = String(timeline.currentTime);
  timeLabel.textContent = `${timeline.currentTime.toFixed(2)}s`;
  playButton.textContent = timeline.status === 'playing' ? 'Pause' : 'Play';
}

playButton.addEventListener('click', () => {
  if (timeline.status === 'playing') timeline.pause();
  else timeline.play();
  render();
});
resetButton.addEventListener('click', () => { timeline.seek(0); render(); });
scrubber.addEventListener('input', () => { timeline.seek(Number(scrubber.value)); render(); });

let previous = performance.now();
function frame(now) {
  const delta = (now - previous) / 1000;
  previous = now;
  if (timeline.status === 'playing') {
    timeline.tick(delta);
    render();
  }
  requestAnimationFrame(frame);
}
timeline.seek(0);
render();
requestAnimationFrame(frame);
