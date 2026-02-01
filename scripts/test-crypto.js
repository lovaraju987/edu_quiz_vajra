const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

async function testCrypto() {
    console.log("Testing bcryptjs...");
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("password", salt);
        console.log("✅ Bcrypt Hash Success:", hash);
        const match = await bcrypt.compare("password", hash);
        console.log("✅ Bcrypt Compare Success:", match);
    } catch (e) {
        console.error("❌ Bcrypt Failed:", e);
    }

    console.log("Testing jose...");
    try {
        const secret = new TextEncoder().encode("super-secret-key-at-least-32-chars-long");
        const token = await new SignJWT({ user: 'test' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(secret);
        console.log("✅ Jose Sign Success:", token);
    } catch (e) {
        console.error("❌ Jose Failed:", e);
    }
}

testCrypto();
