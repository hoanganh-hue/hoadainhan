#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the script path from arguments
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('Usage: node run.js <script-path>');
  process.exit(1);
}

// Resolve the script path
const fullScriptPath = path.resolve(__dirname, scriptPath);

// Run the script with Node.js
const child = spawn('node', ['--experimental-modules', fullScriptPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('close', (code) => {
  process.exit(code);
});