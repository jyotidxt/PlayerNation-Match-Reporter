const fs = require('fs');
const path = require('path');
const https = require('https');

const PLAYERS_URL = 'https://ndownloader.figshare.com/files/15073721';
const TEAMS_URL = 'https://ndownloader.figshare.com/files/15073697';

const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} -> ${dest}...`);
    https.get(url, (response) => {
      // Handle redirects if any
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest} successfully.`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
    await downloadFile(PLAYERS_URL, path.join(dataDir, 'players.json'));
    await downloadFile(TEAMS_URL, path.join(dataDir, 'teams.json'));
    console.log('All metadata downloaded successfully!');
  } catch (error) {
    console.error('Error downloading metadata:', error);
    process.exit(1);
  }
}

main();
