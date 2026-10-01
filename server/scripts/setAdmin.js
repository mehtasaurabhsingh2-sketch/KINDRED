require('dotenv').config(); // Load variables from .env
const { auth } = require('../src/config/firebaseAdmin');

async function setAdminClaim(uid, isAdmin = true) {
  if (!uid) {
    console.error('Please provide a user UID.');
    process.exit(1);
  }

  try {
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
    console.log(`Success! Admin claim set to ${isAdmin} for user: ${uid}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const uid = args[0];
const removeAdmin = args[1] === 'false';

setAdminClaim(uid, !removeAdmin);
