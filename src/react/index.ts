import { useCallback, useEffect, useMemo, useRef, useState, createElement, type CSSProperties, type ReactNode, type ChangeEvent, type Dispatch, type ReactElement, type SetStateAction } from 'react';
import { Canvas2DRenderer } from '../renderers/canvas-renderer';
import { SvgRenderer } from '../renderers/svg-renderer';
import { Mobject } from '../scene/mobject';
import { Timeline } from '../animation/timeline';

export interface UseTimelineOptions { autoPlay?: boolean; }

export interface TimelineController {
  timeline: Timeline;
  currentTime: number;
  duration: number;
  status: Timeline['status'];
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

export function useTimeline(timeline: Timeline, options: UseTimelineOptions = {}): TimelineController {
  const [currentTime, setCurrentTime] = useState(timeline.currentTime);
  const [, setVersion] = useState(0);
  const frameRef = useRef<number | null>(null);
  const previousRef = useRef<number | null>(null);

  const tickFrame = useCallback((now: number) => {
    frameRef.current = null;
    const previous = previousRef.current ?? now;
    previousRef.current = now;
    const previousTime = timeline.currentTime;
    const previousStatus = timeline.status;
    timeline.tick((now - previous) / 1000);
    if (timeline.currentTime !== previousTime) setCurrentTime(timeline.currentTime);
    if (timeline.status !== previousStatus) setVersion((version) => version + 1);
    if (timeline.status === 'playing') frameRef.current = requestAnimationFrame(tickFrame);
  }, [timeline]);

  const startLoop = useCallback(() => {
    if (frameRef.current !== null || timeline.status !== 'playing') return;
    previousRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tickFrame);
  }, [tickFrame, timeline]);

  useEffect(() => {
    if (options.autoPlay) timeline.play();
    startLoop();
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [options.autoPlay, startLoop, timeline]);

  const play = useCallback(() => {
    timeline.play();
    setVersion((version) => version + 1);
    startLoop();
  }, [startLoop, timeline]);
  const pause = useCallback(() => {
    timeline.pause();
    setVersion((version) => version + 1);
  }, [timeline]);
  const seek = useCallback((time: number) => {
    timeline.seek(time);
    setCurrentTime(timeline.currentTime);
    setVersion((version) => version + 1);
  }, [timeline]);
  return { timeline, currentTime, duration: timeline.duration, status: timeline.status, play, pause, seek };
}

export function useMathSignal<T>(initialValue: T): readonly [T, Dispatch<SetStateAction<T>>] {
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
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function AnimathCanvas({ scene, timeline, width = 800, height = 480, renderer = 'svg', animate = true, ariaLabel, className, style }: AnimathCanvasProps): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const activeRenderer = renderer === 'canvas'
      ? new Canvas2DRenderer(canvasRef.current ?? undefined)
      : new SvgRenderer(svgRef.current ?? undefined);
    activeRenderer.resize(width, height);
    let frame = 0;
    let previous = performance.now();
    let lastTime = timeline?.currentTime ?? 0;
    let dirty = true;
    const render = (now: number) => {
      if (timeline) {
        if (animate && timeline.status === 'playing') timeline.tick((now - previous) / 1000);
        previous = now;
        if (timeline.currentTime !== lastTime) {
          lastTime = timeline.currentTime;
          dirty = true;
        }
      }
      if (dirty) {
        activeRenderer.beginFrame();
        activeRenderer.renderMobject(scene);
        activeRenderer.endFrame();
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [animate, height, renderer, scene, timeline, width]);

  const accessibilityProps = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : {};
  const commonProps = { ...accessibilityProps, className, style, width, height };
  return renderer === 'canvas'
    ? createElement('canvas', { ...commonProps, ref: canvasRef })
    : createElement('svg', { ...commonProps, ref: svgRef, viewBox: `0 0 ${width} ${height}` });
}

export interface AnimathPlayerProps extends AnimathCanvasProps {
  children?: ReactNode;
}

export function AnimathPlayer({ timeline, children, ...canvasProps }: AnimathPlayerProps): ReactElement {
  const fallbackTimeline = useMemo(() => new Timeline(), []);
  const activeTimeline = timeline ?? fallbackTimeline;
  const controller = useTimeline(activeTimeline);
  const playing = controller.status === 'playing';
  const toggle = () => {
    if (playing) controller.pause(); else controller.play();
  };
  return createElement('div', { className: 'animath-player' },
    createElement(AnimathCanvas, { ...canvasProps, timeline: activeTimeline, animate: false }),
    createElement('div', { className: 'animath-player-controls', role: 'group', 'aria-label': 'Animation controls' },
      createElement('button', { type: 'button', onClick: toggle, 'aria-pressed': playing }, playing ? 'Pause' : 'Play'),
      createElement('input', {
        type: 'range', min: 0, max: controller.duration, step: 0.01, value: controller.currentTime,
        'aria-label': 'Timeline position',
        'aria-valuetext': `${controller.currentTime.toFixed(2)} seconds`,
        onChange: (event: ChangeEvent<HTMLInputElement>) => controller.seek(Number(event.target.value))
      }),
      children
    )
  );
}