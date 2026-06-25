import { spawn } from 'node:child_process';

// Prevent Next.js from launching local terminal editors when error stacks are clicked,
// which avoids the "Terminal editors can only be used on macOS" process launch error in sandbox environments.
process.env.REACT_EDITOR = 'none';

const originalArgs = process.argv.slice(2);
const filteredArgs = [];

let hasPort = false;
let hasHostname = false;

for (let i = 0; i < originalArgs.length; i++) {
  const arg = originalArgs[i];
  if (arg === '--host') {
    // Skip '--host' if it's passed as a flag. If the next arg is a value, skip that too.
    const nextArg = originalArgs[i + 1];
    if (nextArg && !nextArg.startsWith('-')) {
      i++; // Skip the value (e.g., '0.0.0.0')
    }
  } else if (arg.startsWith('--host=')) {
    // Skip '--host=0.0.0.0'
  } else {
    if (arg === '-p' || arg === '--port') {
      hasPort = true;
    }
    if (arg === '-H' || arg === '--hostname') {
      hasHostname = true;
    }
    filteredArgs.push(arg);
  }
}

// Ensure the dev server runs on port 3000 and hostname 0.0.0.0 as required by the platform,
// unless they were already set manually and we don't want to duplicate them.
const finalArgs = [];
if (!hasPort) {
  finalArgs.push('--port', '3000');
}
if (!hasHostname) {
  finalArgs.push('--hostname', '0.0.0.0');
}
finalArgs.push(...filteredArgs);

console.log('[Dev Wrapper] Starting Next.js Dev Server with arguments:', finalArgs);

const child = spawn('npx', ['next', 'dev', ...finalArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
