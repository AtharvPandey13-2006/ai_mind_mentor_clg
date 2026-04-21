import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found. Token invalid.' 
      });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ 
        error: 'Invalid or expired token. Please login again.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed.',
      message: error.message 
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};
