import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/out.min.js',
  minify: false,
  bundle: true,
  platform: 'node',
  // sourcemap: true,
}).catch(() => process.exit(1));