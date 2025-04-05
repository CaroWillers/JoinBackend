// check-import-exports.js (NodeJS)
// Stelle sicher, dass du im Root-Verzeichnis bist und `fs` nutzen kannst

const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'static/js'); // Pfad zu deinen JS-Dateien

function scanJSFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanJSFiles(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`🔍 ${file}`);

            const importMatches = [...content.matchAll(/import\s.*?from\s.*?;/g)];
            const exportMatches = [...content.matchAll(/export\s+(?:function|const|let|class)\s+\w+/g)];

            if (importMatches.length > 0) {
                console.log('  📥 Imports:');
                importMatches.forEach(i => console.log('   →', i[0]));
            }
            if (exportMatches.length > 0) {
                console.log('  📤 Exports:');
                exportMatches.forEach(e => console.log('   →', e[0]));
            }
            if (importMatches.length === 0 && exportMatches.length === 0) {
                console.log('  ⚠️ Keine Imports/Exports gefunden');
            }
        }
    }
}

scanJSFiles(directoryPath);
