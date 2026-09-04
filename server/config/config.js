const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from root and FlotBot directories
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../FlotBot/.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10),
  
  // Database Configuration
  db: {
    // Prefer PostgreSQL if DATABASE_URL or PGHOST is present
    type: (process.env.DATABASE_URL || process.env.PGHOST) ? 'postgres' : 'sqlite',
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'cyberguardian',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    
    // SQLite Fallback database file
    sqlitePath: process.env.SQLITE_PATH || path.resolve(__dirname, '../../FlotBot/data/cyberguardian_unified.db'),
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'ibmhack-c98c2',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || (
      [
        path.resolve(__dirname, '../../serviceAccountkey.json'),
        path.resolve(__dirname, '../../serviceAccountKey.json'),
        path.resolve(__dirname, '../../service-account.json'),
      ].find((candidate) => fs.existsSync(candidate)) || undefined
    ),
  },

  // FlotBot AI / Ollama Configuration
  ai: {
    ollamaHost: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b',
    geminiApiKey: process.env.GEMINI_API_KEY,
  },

  // Threat Intelligence APIs
  threatIntel: {
    virusTotalApiKey: process.env.VIRUSTOTAL_API_KEY || '',
    safeBrowsingApiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY || '',
    hybridAnalysisApiKey: process.env.HYBRID_ANALYSIS_API_KEY || '',
  },
};

module.exports = config;

