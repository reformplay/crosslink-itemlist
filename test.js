const { execSync } = require('child_process');

const deploy = execSync('netlify deploy --prod');
console.log(`deploy: ${deploy.toString()}`);