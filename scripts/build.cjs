const fs = require('node:fs');
const path = require('node:path');
const CleanCSS = require('clean-css');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
execFileSync(process.execPath, [
  require.resolve('tailwindcss/lib/cli.js'), '--config', 'tailwind.config.cjs',
  '--input', 'scripts/tailwind-input.css', '--output', 'assets/css/tailwind.css', '--minify',
], { cwd: root, stdio: 'inherit' });
const cssFiles = ['assets/css/fonts.css', 'assets/css/tailwind.css', 'assets/css/icons.css', 'styles.css'];
const css = cssFiles.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const minified = new CleanCSS({ rebase: false, level: 1 }).minify(css);
if (minified.errors.length) throw Error(minified.errors.join('\n'));
fs.writeFileSync(path.join(root, 'assets/css/site.min.css'), minified.styles);
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'robots.txt', 'sitemap.xml']) {
  fs.copyFileSync(path.join(root, name), path.join(output, name));
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
