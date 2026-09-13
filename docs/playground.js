import { Axes2D, plotFunction, SvgRenderer } from '../dist/index.js';

const svg = document.querySelector('#plot');
const frequencyInput = document.querySelector('#frequency');
const frequencyValue = document.querySelector('#frequency-value');
const axes = new Axes2D({ xRange: [-Math.PI * 2, Math.PI * 2], yRange: [-1.5, 1.5], width: 800, height: 420, grid: true });
const curve = plotFunction(axes, (x) => Math.sin(x), { samples: 300 });
axes.add(curve);
const renderer = new SvgRenderer(svg);
renderer.resize(800, 420);

function render() {
  const frequency = Number(frequencyInput.value);
  curve.setPoints(Array.from({ length: 301 }, (_, index) => {
    const x = axes.xRange[0] + (index / 300) * (axes.xRange[1] - axes.xRange[0]);
    return axes.coordsToPoint(x, Math.sin(x * frequency));
  }));
  frequencyValue.textContent = frequency.toFixed(2);
  renderer.beginFrame();
  renderer.renderMobject(axes);
  renderer.endFrame();
}

frequencyInput.addEventListener('input', render);
render();
