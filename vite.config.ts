import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        try {
          // Shim helper methods on response object for standard Vercel serverless functions
          const enhancedRes = res as any;
          if (!enhancedRes.status) {
            enhancedRes.status = (code: number) => {
              enhancedRes.statusCode = code;
              return enhancedRes;
            };
          }
          if (!enhancedRes.json) {
            enhancedRes.json = (data: any) => {
              enhancedRes.setHeader('Content-Type', 'application/json');
              enhancedRes.end(JSON.stringify(data));
              return enhancedRes;
            };
          }

          if (pathname === '/api/health') {
            const { default: handler } = await import('./api/health.js');
            return await handler(req, enhancedRes);
          }

          if (pathname === '/api/bus-arrival' || pathname === '/api/busArrival') {
            const { default: handler } = await import('./api/bus-arrival.js');
            return await handler(req, enhancedRes);
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

