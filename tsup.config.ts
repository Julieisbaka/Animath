import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts'],
  format: ['esm', 'cjs'],
  external: ['react'],
  dts: true,
  clean: true,
  sourcemap: true
});
