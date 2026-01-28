/** biome-ignore-all lint/style/useNamingConvention: REST handlers are UPPER case */

// biome-ignore lint/correctness/noNodejsModules: this is server
import process from 'node:process';
import { serve } from 'bun';
import index from './index.html';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    '/api/hello': {
      GET() {
        return Response.json({
          message: 'Hello, world!',
          method: 'GET',
        });
      },
      PUT() {
        return Response.json({
          message: 'Hello, world!',
          method: 'PUT',
        });
      },
    },

    '/api/hello/:name': (req) => {
      const { name } = req.params;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

// biome-ignore lint/suspicious/noConsole: init
console.log(`🚀 Server running at ${server.url}`);
