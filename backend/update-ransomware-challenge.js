/**
 * Script to update or add the enhanced Ransomware Reversal challenge
 * Run this with: node update-ransomware-challenge.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'cyberhack.db');
const db = new sqlite3.Database(dbPath);

const enhancedChallenge = {
    id: uuidv4(),
    title: 'Ransomware Reversal',
    description: 'DarkNet ransomware encrypted our database. We recovered the encryption script from memory. Analyze the multi-layer encryption algorithm and write a decryption script to recover the flag.',
    difficulty: 'hard',
    points: 250,
    flag: 'flag{r3v3rs3_3ng1n33r1ng_m4st3r}',
    isActive: 1,
    duration: 900,
    fileUrl: '/challenge-files/ransomware-reversal.html',
    hints: 'The encryption uses 3 layers. You must reverse them in opposite order: Layer 3 → Layer 2 → Layer 1,XOR is its own inverse. The key "D4RKN3T" is visible in the encryption script. Use it to undo both XOR operations.,Layer 2 uses addition (byte + position) mod 256. Reverse it with subtraction: (byte - position) mod 256. In Python: (byte - i) % 256',
    hintCosts: '5,10,15',
    estimatedTime: 25
};

console.log('🔄 Updating Ransomware Reversal Challenge...\n');

// First, check if the challenge exists
db.get(
    "SELECT * FROM challenges WHERE title = 'Ransomware Reversal'",
    (err, row) => {
        if (err) {
            console.error('❌ Error checking for existing challenge:', err);
            db.close();
            return;
        }

        if (row) {
            // Update existing challenge
            console.log('📝 Found existing Ransomware Reversal challenge');
            console.log(`   Current flag: ${row.flag}`);
            console.log(`   Current points: ${row.points}`);
            console.log('\n🔄 Updating to enhanced version...\n');

            db.run(
                `UPDATE challenges SET 
                    description = ?,
                    points = ?,
                    flag = ?,
                    duration = ?,
                    file_url = ?,
                    hints = ?,
                    hint_costs = ?,
                    estimated_time = ?
                WHERE title = 'Ransomware Reversal'`,
                [
                    enhancedChallenge.description,
                    enhancedChallenge.points,
                    enhancedChallenge.flag,
                    enhancedChallenge.duration,
                    enhancedChallenge.fileUrl,
                    enhancedChallenge.hints,
                    enhancedChallenge.hintCosts,
                    enhancedChallenge.estimatedTime
                ],
                function(updateErr) {
                    if (updateErr) {
                        console.error('❌ Error updating challenge:', updateErr);
                    } else {
                        console.log('✅ Successfully updated Ransomware Reversal challenge!');
                        console.log(`   New flag: ${enhancedChallenge.flag}`);
                        console.log(`   New points: ${enhancedChallenge.points}`);
                        console.log(`   New file URL: ${enhancedChallenge.fileUrl}`);
                        console.log(`   Hints: 3 progressive hints added`);
                        console.log(`   Estimated time: ${enhancedChallenge.estimatedTime} minutes`);
                    }
                    db.close();
                }
            );
        } else {
            // Insert new challenge
            console.log('➕ No existing Ransomware Reversal challenge found');
            console.log('   Creating new challenge...\n');

            db.run(
                `INSERT INTO challenges (
                    id, title, description, difficulty, points, flag, 
                    is_active, duration, file_url, hints, hint_costs, estimated_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    enhancedChallenge.id,
                    enhancedChallenge.title,
                    enhancedChallenge.description,
                    enhancedChallenge.difficulty,
                    enhancedChallenge.points,
                    enhancedChallenge.flag,
                    enhancedChallenge.isActive,
                    enhancedChallenge.duration,
                    enhancedChallenge.fileUrl,
                    enhancedChallenge.hints,
                    enhancedChallenge.hintCosts,
                    enhancedChallenge.estimatedTime
                ],
                function(insertErr) {
                    if (insertErr) {
                        console.error('❌ Error inserting challenge:', insertErr);
                    } else {
                        console.log('✅ Successfully created Ransomware Reversal challenge!');
                        console.log(`   ID: ${enhancedChallenge.id}`);
                        console.log(`   Flag: ${enhancedChallenge.flag}`);
                        console.log(`   Points: ${enhancedChallenge.points}`);
                        console.log(`   File URL: ${enhancedChallenge.fileUrl}`);
                    }
                    db.close();
                }
            );
        }
    }
);

// Also show current challenges
setTimeout(() => {
    const checkDb = new sqlite3.Database(dbPath);
    console.log('\n📋 Current challenges in database:');
    console.log('─'.repeat(80));
    
    checkDb.all(
        "SELECT title, difficulty, points, flag FROM challenges ORDER BY difficulty, points",
        (err, rows) => {
            if (err) {
                console.error('Error fetching challenges:', err);
            } else {
                rows.forEach(row => {
                    const diffBadge = 
                        row.difficulty === 'easy' ? '🟢' :
                        row.difficulty === 'medium' ? '🟡' : '🔴';
                    console.log(`${diffBadge} ${row.title.padEnd(30)} | ${row.difficulty.padEnd(8)} | ${row.points} pts`);
                });
                console.log('─'.repeat(80));
                console.log(`Total: ${rows.length} challenges`);
            }
            checkDb.close();
        }
    );
}, 1000);
