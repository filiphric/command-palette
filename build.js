const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join('dist', 'command-palette.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for archive-related events
output.on('close', () => {
  console.log(`\n✅ Archive created: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files
const filesToInclude = [
  'src/manifest.json',
  'src/background.js',
  'src/palette.js',
  'src/palette.html',
  'src/palette.css',
  'src/icons/icon16.png',
  'src/icons/icon32.png',
  'src/icons/icon48.png',
  'src/icons/icon128.png'
];

filesToInclude.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  } else {
    console.warn(`⚠️  Warning: ${file} not found`);
  }
});

// Finalize the archive
archive.finalize();