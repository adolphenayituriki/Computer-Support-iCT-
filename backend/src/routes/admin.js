import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as beneficiaryCtrl from '../controllers/beneficiaryController.js';

const router = Router();

router.use(authenticate, adminOnly);

// File upload
router.post('/upload', handleUpload, (req, res) => {
  try {
    const files = req.files || {};
    const urls = {};
    for (const [field, fileArr] of Object.entries(files)) {
      if (fileArr && fileArr.length > 0) {
        urls[field] = fileArr.map((f) => ({
          url: `/uploads/courses/${f.filename}`,
          filename: f.filename,
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
        }));
      }
    }
    res.json({ files: urls });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// Users
router.get('/users', adminCtrl.getUsers);
router.post('/users', adminCtrl.createUser);
router.put('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// Tickets
router.get('/tickets', adminCtrl.getAllTickets);
router.post('/tickets', adminCtrl.createTicketAdmin);
router.post('/tickets/:id/messages', adminCtrl.addTicketMessageAdmin);
router.put('/tickets/:id', adminCtrl.updateTicketAdmin);
router.delete('/tickets/:id', adminCtrl.deleteTicketAdmin);

// Suggestions
router.get('/suggestions', adminCtrl.getAllSuggestions);
router.post('/suggestions/:id/messages', adminCtrl.addSuggestionMessageAdmin);
router.put('/suggestions/:id', adminCtrl.updateSuggestionAdmin);
router.delete('/suggestions/:id', adminCtrl.deleteSuggestionAdmin);

// Contacts
router.get('/contacts', adminCtrl.getAllContactsAdmin);
router.put('/contacts/:id', adminCtrl.updateContactAdmin);
router.delete('/contacts/:id', adminCtrl.deleteContactAdmin);

// Team Applications
router.get('/team-apps', adminCtrl.getAllTeamApps);
router.put('/team-apps/:id', adminCtrl.updateTeamAppAdmin);
router.delete('/team-apps/:id', adminCtrl.deleteTeamAppAdmin);

// News
router.get('/news', adminCtrl.getAllNewsAdmin);
router.post('/news', adminCtrl.createNewsAdmin);
router.put('/news/:id', adminCtrl.updateNewsAdmin);
router.delete('/news/:id', adminCtrl.deleteNewsAdmin);

// Courses
router.get('/courses', adminCtrl.getAllCoursesAdmin);
router.post('/courses', adminCtrl.createCourseAdmin);
router.put('/courses/:id', adminCtrl.updateCourseAdmin);
router.delete('/courses/:id', adminCtrl.deleteCourseAdmin);

// Conversations
router.get('/conversations', adminCtrl.getAllConversationsAdmin);
router.post('/conversations', adminCtrl.createConversationAdmin);
router.post('/conversations/:id/messages', adminCtrl.addConversationMessageAdmin);
router.delete('/conversations/:id', adminCtrl.deleteConversationAdmin);

// Team app conversation helper (create or get conversation for an approved applicant)
router.post('/team-apps/:id/conversation', adminCtrl.getOrCreateTeamAppConversation);

// Beneficiaries
router.get('/beneficiaries', beneficiaryCtrl.getAllBeneficiaries);
router.put('/beneficiaries/:id', beneficiaryCtrl.updateBeneficiary);
router.delete('/beneficiaries/:id', beneficiaryCtrl.deleteBeneficiary);

// Testimonials
import * as testimonialCtrl from '../controllers/testimonialController.js';
router.get('/testimonials', testimonialCtrl.getAllTestimonials);
router.put('/testimonials/:id/approve', testimonialCtrl.approveTestimonial);
router.delete('/testimonials/:id', testimonialCtrl.deleteTestimonial);

export default router;
