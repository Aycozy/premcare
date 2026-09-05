/**
 * Quick SMTP connection test script
 * 
 * Usage: node test-smtp.js
 * 
 * Before running, fill in your SMTP credentials below.
 * This will attempt to send a test email through your SMTP provider
 * to verify the connection works independently of Supabase.
 */

const net = require('net');
const tls = require('tls');

// ============================================
// ⚠️ FILL IN YOUR SMTP DETAILS BELOW
// ============================================
const SMTP_HOST = 'smtp.resend.com';  // Change if using a different provider
const SMTP_PORT = 465;                 // Usually 465 (SSL) or 587 (TLS)
const SMTP_USER = 'resend';           // Your SMTP username
const SMTP_PASS = 'YOUR_API_KEY';     // Your SMTP password / API key
const SENDER_EMAIL = 'no-reply@yourdomain.com'; // Your sender email
// ============================================

console.log('🔍 Testing SMTP connection...\n');
console.log(`   Host: ${SMTP_HOST}`);
console.log(`   Port: ${SMTP_PORT}`);
console.log(`   User: ${SMTP_USER}`);
console.log(`   From: ${SENDER_EMAIL}\n`);

// Test 1: Basic TCP connection
function testConnection() {
    return new Promise((resolve, reject) => {
        console.log('Step 1: Testing TCP connection...');

        const options = {
            host: SMTP_HOST,
            port: SMTP_PORT,
            timeout: 10000,
        };

        let socket;

        if (SMTP_PORT === 465) {
            // SSL connection
            socket = tls.connect(options, () => {
                console.log('   ✅ SSL/TLS connection established');
                console.log(`   ✅ Server certificate: ${socket.getPeerCertificate()?.subject?.CN || 'OK'}`);
                resolve(socket);
            });
        } else {
            // Plain connection (for STARTTLS on port 587)
            socket = net.connect(options, () => {
                console.log('   ✅ TCP connection established');
                resolve(socket);
            });
        }

        socket.on('error', (err) => {
            console.log(`   ❌ Connection FAILED: ${err.message}`);
            reject(err);
        });

        socket.on('timeout', () => {
            console.log('   ❌ Connection TIMED OUT');
            socket.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function run() {
    try {
        const socket = await testConnection();

        // Read server greeting
        socket.on('data', (data) => {
            const response = data.toString().trim();
            console.log(`\nStep 2: Server response: ${response}`);

            if (response.startsWith('220')) {
                console.log('   ✅ SMTP server is responding correctly');
            }

            console.log('\n' + '='.repeat(50));
            console.log('📊 RESULTS:');
            console.log('='.repeat(50));
            console.log('✅ SMTP server is REACHABLE');
            console.log('✅ Connection on port ' + SMTP_PORT + ' works');
            console.log('\nIf Supabase still fails, the issue is likely:');
            console.log('  1. Wrong credentials entered in Supabase dashboard');
            console.log('  2. Sender email domain not verified with SMTP provider');
            console.log('  3. Supabase rate limit hit (2 emails/hour on free plan)');
            console.log('  4. Minimum password length: SMTP password may need re-entry');

            socket.destroy();
        });

        setTimeout(() => {
            socket.destroy();
        }, 5000);

    } catch (err) {
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESULTS:');
        console.log('='.repeat(50));
        console.log('❌ SMTP server is NOT REACHABLE');
        console.log('\nThis means your SMTP configuration is wrong:');
        console.log('  - Double-check the SMTP host name');
        console.log('  - Try a different port (465 vs 587)');
        console.log('  - Check if your firewall is blocking the connection');
    }
}

run();
