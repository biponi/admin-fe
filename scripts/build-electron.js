const esbuild = require('esbuild');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

async function build() {
  console.log('Building Electron main process...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '../electron/main.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, '../dist-electron/main.js'),
    external: ['electron'],
    sourcemap: isDev,
    minify: !isDev,
  });

  console.log('Building Electron preload script...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '../electron/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, '../dist-electron/preload.js'),
    external: ['electron'],
    sourcemap: isDev,
    minify: !isDev,
  });

  console.log('Electron build complete!');
}

build().catch(console.error);