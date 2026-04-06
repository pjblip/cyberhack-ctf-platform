import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new sqlite3.Database('./backend/database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the database.');
});

// Since UUID generates a unique id, we can just insert it.
const id = 'crypto004';
const sql = `INSERT INTO challenges (id, title, description, category, difficulty, points, flag, hint, is_active, estimated_time, duration, file_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

db.run(sql, [
    id,
    'Ransomware Reversal',
    'A ransomware infected our server. We recovered the encryption script and the encrypted string on the host disk. Reverse the math to recover the data.',
    'cryptography',
    'hard',
    250,
    'flag{x0r_m4th_1s_r3v3rs1bl3}',
    'The script uses XOR encryption with key 0x42. XORing the encrypted hex with 0x42 again will reveal the plaintext.',
    1,
    '20 MIN',
    1200,
    'mock'
], function (err) {
    if (err) {
        // If it already exists, just update it
        if (err.message.includes('UNIQUE constraint failed')) {
            console.log('Challenge already exists in DB. All good!');
        } else {
            return console.log(err.message);
        }
    } else {
        console.log(\`A row has been inserted with rowid \${this.lastID}\`);
    }
});

db.close();
