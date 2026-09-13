import React from 'react';
import { createRoot } from 'react-dom/client';
import { Circle, MathTex, Timeline, Tween, Vector2, easeInOutQuad } from '../../dist/index.js';
import { AnimathPlayer } from '../../dist/react/index.js';

const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) throw new Error('React example mount point is missing.');

const scene = new Circle(0).setStyle({ opacity: 0 }).moveTo(new Vector2(450, 260));
const orb = new Circle(46).setStyle({ fill: '#c9973f', stroke: '#f0efe9', strokeWidth: 3 }).moveTo(new Vector2(-230, 40));
const satellite = new Circle(16).setStyle({ fill: '#e8b874', stroke: '#f0efe9', strokeWidth: 2 }).moveTo(new Vector2(0, -100));
const formula = new MathTex('f(x) = \\sin(x)', { fontSize: 34 }).setStyle({ fill: '#f0efe9' }).moveTo(new Vector2(-110, -180));
scene.add(orb, satellite, formula);
const timeline = new Timeline()
  .add(new Tween({ duration: 3, easing: easeInOutQuad, onUpdate: (progress) => {
    orb.moveTo(new Vector2(-230 + progress * 460, 40));
    satellite.moveTo(new Vector2(Math.cos(progress * Math.PI * 4) * 120, -100 + Math.sin(progress * Math.PI * 4) * 60));
  }}))
  .add(new Tween({ duration: 1, onUpdate: (progress) => formula.setStyle({ opacity: progress }) }));

function App() {
  return React.createElement(AnimathPlayer, { scene, timeline, width: 860, height: 500, ariaLabel: 'Animated React math scene', style: { width: '100%', height: 'auto' } });
}

createRoot(app).render(React.createElement(App));
