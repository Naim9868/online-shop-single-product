require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}


// this is creating admin 
async function createAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');

    // Check existing
    const existing = await users.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('⚠️ Admin already exists:', ADMIN_EMAIL);
      return;
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const result = await users.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created!');
    console.log('📧', ADMIN_EMAIL);
    console.log('🔑', ADMIN_PASSWORD);
    console.log('🆔', result.insertedId);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

createAdmin();