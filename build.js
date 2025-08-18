const esbuild = require('esbuild');
const fs = require('fs');

// Asegurar que existe la carpeta dist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copiar archivos estáticos
fs.cpSync('icons', 'dist/icons', { recursive: true });
fs.copyFileSync('manifest.json', 'dist/manifest.json');
fs.copyFileSync('background.js', 'dist/background.js');

// Bundlear content scripts
esbuild.build({
  entryPoints: ['src/content/main.js'],
  bundle: true,
  outfile: 'dist/content.js',
  format: 'iife',  // Immediately Invoked Function Expression
  minify: false,   // Por ahora sin minificar para debug
  sourcemap: true, // Mapa para debugging
}).then(() => {
  console.log('✅ Build completado!');
}).catch(() => process.exit(1));