import { Mobject } from '../scene/mobject';
import { Tween } from './tween';

export function fadeIn(mobject: Mobject, duration: number): Tween {
  const targetOpacity = mobject.style.opacity ?? 1;
  mobject.setStyle({ opacity: 0 });
  return new Tween({ duration, onUpdate: (progress) => mobject.setStyle({ opacity: targetOpacity * progress }) });
}

export function fadeOut(mobject: Mobject, duration: number): Tween {
  const startingOpacity = mobject.style.opacity ?? 1;
  return new Tween({ duration, onUpdate: (progress) => mobject.setStyle({ opacity: startingOpacity * (1 - progress) }) });
}