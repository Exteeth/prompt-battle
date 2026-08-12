import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import evaluateHandler from './api/evaluate.js';

function vercelApiDevPlugin(env) {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/evaluate' && req.method === 'POST') {
          // Ensure environment variables are accessible in process.env
          Object.assign(process.env, env);

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              res.status = (code) => { res.statusCode = code; return res; };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              await evaluateHandler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      vercelApiDevPlugin(env),
    ],
    server: {
      port: 3000,
      open: false,
    },
    test: {
      environment: 'happy-dom',
      globals: true,
    }
  };
});

