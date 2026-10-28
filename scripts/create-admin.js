require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { closeDatabase, db, initDatabase } = require('../lib/database');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  try {
    await initDatabase();
    const username = (
      process.env.ADMIN_USERNAME || (await ask('Username admin: '))
    ).trim();
    const password =
      process.env.ADMIN_PASSWORD ||
      (await ask('Password admin (minimal 12 karakter): '));
    if (!username || password.length < 12) {
      throw new Error(
        'Username wajib diisi dan password minimal 12 karakter.',
      );
    }

    const hash = bcrypt.hashSync(password, 12);
    await db.run(
      `INSERT INTO admins(username,password_hash) VALUES(?,?) ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash`,
      [username, hash],
    );
    console.log(`Admin "${username}" berhasil disiapkan.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    try {
      await closeDatabase();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}

main();
