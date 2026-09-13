import katex from 'katex';
import { Vector2 } from '../math/vector2';
import { Mobject } from '../scene/mobject';

export interface TexOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  fontSize?: number;
}

export class Tex extends Mobject {
  readonly expression: string;
  readonly fontSize: number;
  private readonly displayMode: boolean;
  private readonly throwOnError: boolean;

  constructor(expression: string, options: TexOptions = {}) {
    super();
    this.expression = expression;
    this.fontSize = options.fontSize ?? 32;
    this.displayMode = options.displayMode ?? false;
    this.throwOnError = options.throwOnError ?? false;
    this.setStyle({ fill: 'currentColor', stroke: 'none' });
  }

  toSvg(): string {
    const html = katex.renderToString(this.expression, {
      output: 'html',
      displayMode: this.displayMode,
      throwOnError: this.throwOnError,
      trust: false
    });
    // KaTeX's supported browser output is HTML. The foreignObject keeps the
    // formula inside the SVG scene graph while preserving KaTeX's typography.
    return `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${html}</div></foreignObject></svg>`;
  }

  getBounds() {
    const width = Math.max(1, this.expression.length * this.fontSize * 0.55);
    return { min: this.position, max: this.position.add(new Vector2(width, this.fontSize)) };
  }
}

export class MathTex extends Tex {}