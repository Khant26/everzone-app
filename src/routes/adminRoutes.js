import express from 'express';
import AdminController from '../controllers/AdminController.js';
import { adminAuthenticateToken, adminAuthorize } from '../middleware/adminAuth.js';
import upload from '../middleware/fileUpload.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====

// Register superadmin (only works if no admin exists)
router.post('/register', strictLimiter, AdminController.register);

// Login
// Login (5 failed attempts per IP per 15 minutes)
router.post('/login', strictLimiter, AdminController.login);

// ===== PROTECTED ROUTES (Require Authentication & Superadmin Role) =====

// Categories Management
router.post('/categories', adminAuthenticateToken, adminAuthorize, AdminController.createCategory);
router.put('/categories/:id', adminAuthenticateToken, adminAuthorize, AdminController.updateCategory);
router.delete('/categories/:id', adminAuthenticateToken, adminAuthorize, AdminController.deleteCategory);

// Services Management
router.post('/services', adminAuthenticateToken, adminAuthorize, upload.single('image'), AdminController.createService);
router.put('/services/:id', adminAuthenticateToken, adminAuthorize, upload.single('image'), AdminController.updateService);
router.delete('/services/:id', adminAuthenticateToken, adminAuthorize, AdminController.deleteService);

// Projects Management
router.post('/projects', adminAuthenticateToken, adminAuthorize, upload.single('image'), AdminController.createProject);
router.put('/projects/:id', adminAuthenticateToken, adminAuthorize, upload.single('image'), AdminController.updateProject);
router.delete('/projects/:id', adminAuthenticateToken, adminAuthorize, AdminController.deleteProject);

// Contact Forms Management
router.get('/contact-forms', adminAuthenticateToken, adminAuthorize, AdminController.getAllContactForms);
router.put('/contact-forms/:id/status', adminAuthenticateToken, adminAuthorize, AdminController.updateContactFormStatus);
router.delete('/contact-forms/:id', adminAuthenticateToken, adminAuthorize, AdminController.deleteContactForm);

export default router;
