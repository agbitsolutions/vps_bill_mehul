// Production entry file
// Runs TypeScript backend using tsx

require('dotenv').config();

// Use tsx to execute TypeScript entry
require('tsx').register();

require('./src/index.ts');