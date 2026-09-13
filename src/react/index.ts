import { useCallback, useEffect, useMemo, useRef, useState, createElement, type CSSProperties, type ReactNode, type ChangeEvent } from 'react';
import { Canvas2DRenderer } from '../renderers/canvas-renderer';
import { SvgRenderer } from '../renderers/svg-renderer';
import { Mobject } from '../scene/mobject';
import { Timeline } from '../animation/timeline';

export interface UseTimelineOptions { autoPlay?: boolean; }

export function useTimeline(timeline: Timeline, options: UseTimelineOptions = {}) {
  const [currentTime, setCurrentTime] = useState(timeline.currentTime);
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (options.autoPlay) timeline.play();
    let frame = 0;
    let previous = performance.now();
    const update = (now: number) => {
      timeline.tick((now - previous) / 1000);
      previous = now;
      setCurrentTime(timeline.currentTime);
      setVersion((version) => version + 1);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [options.autoPlay, timeline]);

  const play = useCallback(() => timeline.play(), [timeline]);
  const pause = useCallback(() => timeline.pause(), [timeline]);
  const seek = useCallback((time: number) => { timeline.seek(time); setCurrentTime(timeline.currentTime); }, [timeline]);
  return { timeline, currentTime, duration: timeline.duration, status: timeline.status, play, pause, seek };
}

export function useMathSignal<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  return [value, setValue] as const;
}

export function useAnimathScene(factory: () => Mobject, dependencies: readonly unknown[] = []): Mobject {
  return useMemo(factory, dependencies);
}

export interface AnimathCanvasProps {
  scene: Mobject;
  timeline?: Timeline;
  width?: number;
  height?: number;
  renderer?: 'svg' | 'canvas';
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function AnimathCanvas({ scene, timeline, width = 800, height = 480, renderer = 'svg', animate = true, className, style }: AnimathCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const activeRenderer = renderer === 'canvas'
      ? new Canvas2DRenderer(canvasRef.current ?? undefined)
      : new SvgRenderer(svgRef.current ?? undefined);
    activeRenderer.resize(width, height);
    let frame = 0;
    let previous = performance.now();
    const render = (now: number) => {
      if (timeline && animate) {
        timeline.tick((now - previous) / 1000);
        previous = now;
      }
      activeRenderer.beginFrame();
      activeRenderer.renderMobject(scene);
      activeRenderer.endFrame();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [animate, height, renderer, scene, timeline, width]);

  const commonProps = { className, style, width, height };
  return renderer === 'canvas'
    ? createElement('canvas', { ...commonProps, ref: canvasRef })
    : createElement('svg', { ...commonProps, ref: svgRef, viewBox: `0 0 ${width} ${height}` });
}

export interface AnimathPlayerProps extends AnimathCanvasProps {
  children?: ReactNode;
}

export function AnimathPlayer({ timeline, children, ...canvasProps }: AnimathPlayerProps) {
  const fallbackTimeline = useMemo(() => new Timeline(), []);
  const controller = useTimeline(timeline ?? fallbackTimeline);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!controller) return;
    if (playing) controller.pause(); else controller.play();
    setPlaying(!playing);
  };
  return createElement('div', { className: 'animath-player' },
    createElement(AnimathCanvas, { ...canvasProps, timeline, animate: false }),
    createElement('div', { className: 'animath-player-controls' },
      createElement('button', { type: 'button', onClick: toggle }, playing ? 'Pause' : 'Play'),
      controller && createElement('input', {
        type: 'range', min: 0, max: controller.duration, step: 0.01, value: controller.currentTime,
        onChange: (event: ChangeEvent<HTMLInputElement>) => controller.seek(Number(event.target.value))
      }),
      children
    )
  );
}