import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jitiFactory from 'jiti';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function startDev() {
  console.log('Starting Real-Time Collaborative Workspace in Development Mode...\n');

  const jiti = jitiFactory(path.join(rootDir, 'server.js'));
  jiti('./src/server/index.ts');

  const vite = await createViteServer({
    root: rootDir,
    configFile: path.join(rootDir, 'vite.config.mjs'),
    server: {
      port: 3000,
      host: true,
    },
  });

  await vite.listen();

  console.log('\n====================================================');
  console.log('Development servers are ready!');
  console.log('Frontend (React + Vite):  http://localhost:3000');
  console.log('Backend API (Express):     http://localhost:4000/api');
  console.log('WebSocket Server:          ws://localhost:1234');
  console.log('====================================================\n');
}

startDev().catch((err) => {
  console.error('Failed to start dev servers:', err);
  process.exit(1);
});
