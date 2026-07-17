const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Decrypt an OpenSSL AES-256-CBC encrypted file created with:
// openssl aes-256-cbc -salt -in service_account.json -out service_account.json.enc -k "MY_PASSPHRASE"

const ENC_FILE = path.resolve(process.cwd(), 'service_account.json.enc');
const OUT_DIR = path.resolve(process.cwd(), 'netlify/functions/_secrets');
const OUT_FILE = path.join(OUT_DIR, 'service_account.json');
const PASSPHRASE = process.env.SECRETS_PASSPHRASE;

if (!PASSPHRASE) {
  console.error('[decrypt-secrets] Missing SECRETS_PASSPHRASE environment variable. Aborting.');
  process.exit(1);
}

if (!fs.existsSync(ENC_FILE)) {
  console.log('[decrypt-secrets] No encrypted secrets file found at', ENC_FILE, '- skipping.');
  process.exit(0);
}

try {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  // Use openssl cli (available on the Netlify build image)
  execSync(`openssl aes-256-cbc -d -in "${ENC_FILE}" -out "${OUT_FILE}" -k "${PASSPHRASE}"`, { stdio: 'inherit' });
  console.log('[decrypt-secrets] Decrypted secrets to', OUT_FILE);
} catch (err) {
  console.error('[decrypt-secrets] Failed to decrypt secrets:', err.message);
  process.exit(1);
}
