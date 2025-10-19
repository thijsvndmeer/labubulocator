const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('log.txt', { flags: 'a' });

const backend = spawn('npx --workspace=backend npm run dev', { shell: true });
const frontend = spawn('npx vite', { shell: true });

backend.stdout.pipe(logStream);
backend.stderr.pipe(logStream);
frontend.stdout.pipe(logStream);
frontend.stderr.pipe(logStream);

backend.on('close', (code) => {
  logStream.write(`Backend process exited with code ${code}\n`);
});

frontend.on('close', (code) => {
  logStream.write(`Frontend process exited with code ${code}\n`);
});
