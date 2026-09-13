import { Circle, CubicBezier, MathTex, Polyline, Spring, SvgRenderer, Timeline, Tween, Vector2 } from '../dist/index.js';

function rendererFor(id, width = 520, height = 280) {
  const renderer = new SvgRenderer(document.querySelector(id));
  renderer.resize(width, height);
  return renderer;
}

const springRenderer = rendererFor('#spring-stage');
const springRoot = new Circle(10).setStyle({ fill: '#72a7ff', stroke: '#d9e8ff', strokeWidth: 2 }).moveTo(new Vector2(260, 140));
const satellite = new Circle(18).setStyle({ fill: '#ffcf70', stroke: '#fff0bd', strokeWidth: 2 }).moveTo(new Vector2(120, 0));
springRoot.add(satellite);
const springTimeline = new Timeline().add(new Spring({ duration: 3, frequency: 8, damping: 2.5, onUpdate: (progress) => {
  const angle = progress * Math.PI * 4;
  satellite.moveTo(new Vector2(Math.cos(angle) * (120 - progress * 70), Math.sin(angle) * (120 - progress * 70)));
}}));

const formulaRenderer = rendererFor('#formula-stage');
const formula = new MathTex('e^{i\\pi} + 1 = 0', { fontSize: 34 }).setStyle({ fill: '#9ac2ff', opacity: 0 }).moveTo(new Vector2(100, 130));
const formulaTimeline = new Timeline().add(new Tween({ duration: 1.6, onUpdate: (progress) => formula.setStyle({ opacity: progress }) }));
function drawFormula() {
  formulaRenderer.beginFrame();
  formulaRenderer.renderMobject(formula);
  formulaRenderer.endFrame();
}

const curveRenderer = rendererFor('#curve-stage');
const curve = new CubicBezier(new Vector2(40, 140), new Vector2(120, 10), new Vector2(390, 270), new Vector2(480, 140));
const curvePoints = curve.sample(180);
const curveObject = new Polyline(curvePoints).setStyle({ fill: 'none', stroke: '#9c7bff', strokeWidth: 4 });
function drawCurve(progress) { curveObject.setPoints(curvePoints.slice(0, Math.max(2, Math.floor(curvePoints.length * progress)))); curveRenderer.beginFrame(); curveRenderer.renderMobject(curveObject); curveRenderer.endFrame(); }

document.querySelector('#spring-play').addEventListener('click', () => springTimeline.restart());
document.querySelector('#spring-reset').addEventListener('click', () => springTimeline.seek(0));
document.querySelector('#formula-play').addEventListener('click', () => {
  formulaTimeline.restart();
  drawFormula();
});
document.querySelector('#curve-progress').addEventListener('input', (event) => drawCurve(Number(event.target.value)));

let previous = performance.now();
function frame(now) {
  const delta = (now - previous) / 1000; previous = now;
  if (springTimeline.status === 'playing') {
    springTimeline.tick(delta);
    springRenderer.beginFrame(); springRenderer.renderMobject(springRoot); springRenderer.endFrame();
  }
  if (formulaTimeline.status === 'playing') {
    formulaTimeline.tick(delta);
    drawFormula();
  }
  requestAnimationFrame(frame);
}
springRenderer.beginFrame(); springRenderer.renderMobject(springRoot); springRenderer.endFrame();
drawFormula();
drawCurve(1); requestAnimationFrame(frame);
