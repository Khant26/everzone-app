import express from 'express';
import ContactFormController from '../controllers/ContactFormController.js';

const router = express.Router();

// POST submit contact form (public)
router.post('/', ContactFormController.create);

// Listing, updating and deleting inquiries exposes customer PII, so those
// endpoints exist only behind admin auth under /api/admin/contact-forms.

export default router;
