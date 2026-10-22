import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

class AdminController {
  // ===== AUTHENTICATION =====
  
  // Register a new superadmin (only if no admins exist)
  static async register(req, res) {
    try {
      const { username, password, email } = req.body;

      // Validate input
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, and email are required'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters'
        });
      }

      // Check if any admin exists
      const adminCheck = await pool.query('SELECT COUNT(*) as count FROM admins');
      if (parseInt(adminCheck.rows[0].count) > 0) {
        return res.status(403).json({
          success: false,
          message: 'Superadmin already exists. Only one superadmin allowed.'
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create admin
      const result = await pool.query(
        'INSERT INTO admins (username, password_hash, email, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at',
        [username, passwordHash, email, 'superadmin', true]
      );

      res.status(201).json({
        success: true,
        message: 'Superadmin registered successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register admin'
      });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find admin
      const result = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const admin = result.rows[0];

      // Check if admin is active
      if (!admin.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is inactive'
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, admin.password_hash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          email: admin.email
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Update last login
      await pool.query(
        'UPDATE admins SET last_login = NOW() WHERE id = $1',
        [admin.id]
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          }
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to login'
      });
    }
  }

  // ===== CATEGORIES MANAGEMENT =====

  static async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description || null]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create category error:', error);
      
      if (error.constraint === 'categories_name_key') {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create category'
      });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const result = await pool.query(
        'UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [name, description || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update category'
      });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM categories WHERE id = $1 RETURNING id, name',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete category'
      });
    }
  }

  // ===== SERVICES MANAGEMENT =====

  static async createService(req, res) {
    try {
      const { title, description, image } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }

      // Use uploaded file if available, otherwise use image URL from body
      let imageData = image || null;
      if (req.file) {
        // Convert file buffer to base64
        imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const result = await pool.query(
        'INSERT INTO services (title, description, image) VALUES ($1, $2, $3) RETURNING *',
        [title, description, imageData]
      );

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create service'
      });
    }
  }

  static async updateService(req, res) {
    try {
      const { id } = req.params;
      const { title, description, image } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }

      // Use uploaded file if available, otherwise use image URL from body
      let imageData = image || null;
      if (req.file) {
        // Convert file buffer to base64
        imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const result = await pool.query(
        'UPDATE services SET title = $1, description = $2, image = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [title, description, imageData, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update service'
      });
    }
  }

  static async deleteService(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM services WHERE id = $1 RETURNING id, title',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete service'
      });
    }
  }

  // ===== PROJECTS MANAGEMENT =====

  static async createProject(req, res) {
    try {
      const { name, title, category_id, location, duration, area, description, image } = req.body;

      if (!name || !title || !category_id || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name, title, category_id, and description are required'
        });
      }

      // Use uploaded file if available, otherwise use image URL from body
      let imageData = image || null;
      if (req.file) {
        // Convert file buffer to base64
        imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const result = await pool.query(
        'INSERT INTO projects (name, title, category_id, location, duration, area, description, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, title, category_id, location || null, duration || null, area || null, description, imageData]
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create project'
      });
    }
  }

  static async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { name, title, category_id, location, duration, area, description, image } = req.body;

      if (!name || !title || !category_id || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name, title, category_id, and description are required'
        });
      }

      // Use uploaded file if available, otherwise use image URL from body
      let imageData = image || null;
      if (req.file) {
        // Convert file buffer to base64
        imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const result = await pool.query(
        'UPDATE projects SET name = $1, title = $2, category_id = $3, location = $4, duration = $5, area = $6, description = $7, image = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
        [name, title, category_id, location || null, duration || null, area || null, description, imageData, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update project'
      });
    }
  }

  static async deleteProject(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM projects WHERE id = $1 RETURNING id, name, title',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete project'
      });
    }
  }

  // ===== CONTACT FORMS MANAGEMENT =====

  static async getAllContactForms(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM contact_forms ORDER BY created_at DESC'
      );

      res.status(200).json({
        success: true,
        message: 'Contact forms fetched successfully',
        data: result.rows
      });
    } catch (error) {
      console.error('Get contact forms error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch contact forms'
      });
    }
  }

  static async updateContactFormStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'reviewed', 'responded', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const result = await pool.query(
        'UPDATE contact_forms SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact form not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact form status updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update contact form error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update contact form'
      });
    }
  }

  static async deleteContactForm(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM contact_forms WHERE id = $1 RETURNING id, name, email',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact form not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact form deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Delete contact form error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete contact form'
      });
    }
  }
}

export default AdminController;
