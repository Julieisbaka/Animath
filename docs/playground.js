import { Axes2D, plotFunction, SvgRenderer } from '../dist/index.js';

function startCalculusPlayground() {
  const svg = document.querySelector('#plot-stage, #plot');
  const frequencyInput = document.querySelector('#frequency');
  const frequencyValue = document.querySelector('#frequency-value');
  if (!svg || !frequencyInput || !frequencyValue) return;

  try {
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
  } catch (error) {
    const frame = svg.closest('.demo-frame');
    const message = document.createElement('p');
    message.className = 'muted';
    message.textContent = `Playground failed to start: ${error instanceof Error ? error.message : String(error)}`;
    (frame ?? svg.parentElement)?.appendChild(message);
    console.error('[animath] calculus playground failed', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCalculusPlayground, { once: true });
} else {
  startCalculusPlayground();
}

window.__pgRan = true; console.log('[pg] module evaluated');

// debug: probe guard result
(() => { window.__pgGuard = { svg: !!document.querySelector('#plot-stage, #plot'), freq: !!document.querySelector('#frequency'), val: !!document.querySelector('#frequency-value') }; })();

// debug: instrument startCalculusPlayground
(() => { const svg = document.querySelector('#plot-stage, #plot'); const f = document.querySelector('#frequency'); const v = document.querySelector('#frequency-value'); window.__pgEnter = { svg: !!svg, f: !!f, v: !!v }; try { const axes = new Axes2D({ xRange: [-1,1], yRange: [-1,1], width: 800, height: 420 }); const c = plotFunction(axes, Math.sin, { samples: 4 }); axes.add(c); const r = new SvgRenderer(svg); r.beginFrame(); r.renderMobject(axes); r.endFrame(); window.__pgRender = { children: svg.childElementCount }; } catch (e) { window.__pgErr = String(e) + ' | ' + e.stack; } })();

// debug: watch children over time
(() => { const svg = document.querySelector('#plot-stage'); window.__pgTimeline = []; const log = () => window.__pgTimeline.push(svg.childElementCount); setTimeout(log, 100); setTimeout(log, 500); setTimeout(log, 1500); })();
