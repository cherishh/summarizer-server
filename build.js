const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/out.min.js',
  minify: true,
  bundle: true,
  platform: 'node',
  // sourcemap: true,
}).catch(() => process.exit(1));