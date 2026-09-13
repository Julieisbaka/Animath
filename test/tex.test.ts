import { describe, expect, it } from 'vitest';
import { MathTex, Tex } from '../src';

describe('Tex', () => {
  it('converts a formula to SVG markup', () => {
    const formula = new Tex('x^2 + y^2 = z^2');
    expect(formula.toSvg()).toContain('<svg');
    expect(new MathTex('x').expression).toBe('x');
  });

  it('preserves superscript groups used by the Euler identity example', () => {
    expect(new MathTex('e^{i\\pi} + 1 = 0').toSvg()).toContain('msupsub');
  });
});