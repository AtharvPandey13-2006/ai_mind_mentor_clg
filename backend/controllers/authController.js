import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import validator from 'validator';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      message: 'Registration successful',
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Update last login and streak
    const now = new Date();
    const lastLogin = user.lastLogin;
    const hoursSinceLastLogin = (now - lastLogin) / (1000 * 60 * 60);
    
    // Update streak (if logged in within 48 hours, maintain/increase streak)
    if (hoursSinceLastLogin <= 48) {
      if (hoursSinceLastLogin >= 20) { // New day
        user.loginStreak += 1;
      }
    } else {
      user.loginStreak = 1; // Reset streak
    }
    
    user.lastLogin = now;
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      message: 'Login successful',
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user data' 
    });
  }
};

export default {
  register,
  login,
  getCurrentUser,
};
