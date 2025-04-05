// validate-project.js
import fs from 'fs';
import path from 'path';

const JS_FOLDER = './static/js/';
const HTML_FOLDER = './templates/';

// 🔍 Scan JS-Dateien nach Exporten und Importen
function scanJsFiles() {
  const jsFiles = fs.readdirSync(JS_FOLDER).filter(f => f.endsWith('.js'));
  const imports = [];
  const exports = [];

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(JS_FOLDER, file), 'utf-8');
    const importMatches = [...content.matchAll(/import\s+(?:.+?)\s+from\s+['"](.+?)['"]/g)];
    const exportMatches = [...content.matchAll(/export\s+(?:default\s+)?(function|const|let|class)\s+(\w+)/g)];

    imports.push({ file, imports: importMatches.map(m => m[1]) });
    exports.push({ file, exports: exportMatches.map(m => m[2]) });
  }

  console.log('📦 IMPORTS:\n', imports);
  console.log('🚀 EXPORTS:\n', exports);
}

// 🔍 Scan HTML-Dateien nach onclick, onchange usw.
function scanHtmlFiles() {
  const htmlFiles = fs.readdirSync(HTML_FOLDER).filter(f => f.endsWith('.html'));

  for (const file of htmlFiles) {
    const content = fs.readFileSync(path.join(HTML_FOLDER, file), 'utf-8');
    const events = [...content.matchAll(/on(click|change|submit|input|focus|blur)=/g)];
    
    if (events.length > 0) {
      console.log(`⚠️  ${file} enthält ${events.length} Inline-Eventhandler:`);
      events.forEach(e => console.log(` → ${e[0]}`));
    }
  }
}

console.log('🔎 Starte Projektanalyse...\n');
scanJsFiles();
scanHtmlFiles();
