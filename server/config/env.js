// This module is imported FIRST in server.js to ensure environment
// variables are available before any other module reads process.env.
//
// In ES modules, static `import` statements are hoisted. By placing
// dotenv.config() in its own module and importing it before all others,
// we guarantee env vars are loaded at module evaluation time.

import dotenv from 'dotenv';
dotenv.config();
