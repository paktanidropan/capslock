const axios = require('axios');
const fs = require('fs').promises;
const readline = require('readline');
const fs2 = require('fs');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0';

const plus = '    [\x1b[32m+\x1b[0m]';
const mins = '    [\x1b[31m-\x1b[0m]';
const seru = '\x1b[0m[\x1b[34m!\x1b[0m]';

async function readHashes() {
  try {
    const content = await fs.readFile('hash.txt', 'utf8');
    return content.split('\n')
      .map(line => line.trim().replace('\r', ''))
      .filter(line => line !== '');
  } catch (error) {
    console.error(`${mins} Error reading hash.txt:`, error.message);
    process.exit(1);
  }
}

async function processAccount(hash) {
  const cleanHash = hash.trim();
  const headers = {
    'Authorization': `tma ${cleanHash}`,
    'User-Agent': USER_AGENT,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const initialInfo = await axios.post('https://capsbot.com/api/auth/login', {}, { headers });
    const userData = initialInfo.data.data;
    
    console.log(`\n${seru} Akun ${userData.telegram_id}`);
    console.log(`${plus} Username: ${userData.username}`);

    await claimAchiev(headers);
  } catch (error) {
    console.error(`${seru} Error processing account:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

async function claimAchiev(headers) {
  try {
    const payload = {
      "achievementID": 4,
      "code": "4775"
    };

    const response = await axios.post(
      'https://capsbot.com/api/achievements/complete',
      payload,
      { headers }
    );

    if (response.data.success) {
      console.log(`${plus} Berhasil mengklaim achievment!`);
      console.log(`${plus} Response:`, JSON.stringify(response.data));
    } else {
      console.log(`${mins} Gagal mengklaim achievment`);
      console.log(`${mins} Response:`, JSON.stringify(response.data));
    }
  } catch (error) {
    console.error(`${mins} Error:`, error.message);
    if (error.response) {
      console.error(`${mins} Response data:`, error.response.data);
      console.error(`${mins} Status code:`, error.response.status);
    }
  }
}

async function main() {
  try {
    const hashes = await readHashes();
    console.log(`\n${seru} [ \x1b[33mACHIEVMENT DAYS 4 CLAIMER\x1b[0m ]`);
    console.log(`${seru} Total akun: ${hashes.length}`);

    for (const hash of hashes) {
      await processAccount(hash);
    }

    console.log('\nProses selesai!');
  } catch (error) {
    console.error('Main error:', error.message);
  }
}

main();