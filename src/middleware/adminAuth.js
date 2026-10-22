import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Admin authentication middleware
export const adminAuthenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please login.'
      });
    }

    jwt.verify(token, config.jwtSecret, (err, admin) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired. Please login again.'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Invalid or malformed token'
        });
      }

      // Attach admin info to request
      req.admin = admin;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Admin authorization middleware (check if user is superadmin)
export const adminAuthorize = (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      });
    }

    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can perform this action'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};
