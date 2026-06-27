import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],          // enable react/jsx support so .jsx files run
  server: { port: 3000 },      // dev server for the frontend
  build: {
    outDir: 'build',         // tells vite which folder to put the commpiled files into
  },
});

// compiled frontend lands exactly where Express expects to find it. That's the whole 
// reason you can run the entire app (frontend + backend) on one port (30100): Express 
// serves both the API and the built React app from that one build folder.

// runs the react frontend powers npm start and npm build