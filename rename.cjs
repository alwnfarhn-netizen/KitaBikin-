const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        replaceInDir(fullPath);
      }
    } else {
      if (['.js', '.jsx', '.html', '.md', '.json', '.css'].includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content
          .replace(/KitaBikin/g, 'Kawakita')
          .replace(/kitabikin/g, 'kawakita')
          .replace(/Kita Bikin/g, 'Kawakita')
          .replace(/KITA BIKIN/g, 'KAWAKITA');
        
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

replaceInDir(__dirname);
