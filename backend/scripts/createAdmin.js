const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema (inline for script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: String,
  credits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Admin credentials
    const adminData = {
      email: 'admin@telehealth.com',
      password: 'Admin@123',
      role: 'admin',
      name: 'System Administrator',
      age: 30,
      gender: 'other',
      phone: '+1234567890',
      credits: 1000,
      isActive: true,
      isVerified: true,
      blocked: false
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password: Admin@123 (if not changed)');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    // Create admin user
    const admin = await User.create(adminData);

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@telehealth.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Name:     System Administrator');
    console.log('🎭 Role:     admin');
    console.log('═══════════════════════════════════════\n');
    console.log('🌐 Login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
