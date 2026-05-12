// BookmarkBackend/controllers/userController.js
const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    console.log('📝 Registration attempt:', { name, email });

    // Validation
    if (!name || !email) {
      console.log('❌ Missing fields:', { name, email });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ name, email });
    await user.save();
    
    console.log('✅ User registered successfully:', user._id);
    res.status(201).json(user);
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching user by ID:', id);

    const user = await User.findById(id);
    if (!user) {
      console.log('⚠️ User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', user._id);
    res.json(user);
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log('🔍 Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('⚠️ No account found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found for login:', user._id);
    res.json(user);
  } catch (error) {
    console.error('❌ Get user by email error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    console.log('👋 Logout request');
    // Logout is primarily client-side in this app
    // Backend can clear any sessions if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUser,
  getUserByEmail,
  logout
};