const { hashPassword } = require('./hash');

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node hash-cli.js <password>');
    process.exit(1);
  }
  const hash = await hashPassword(password);
  console.log(hash);
}

main();
