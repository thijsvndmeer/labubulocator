const { spawn } = require('child_process');

const backend = spawn('npx --workspace=backend npm run dev', { stdio: 'inherit', shell: true });
const frontend = spawn('npx vite', { stdio: 'inherit', shell: true });

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});
