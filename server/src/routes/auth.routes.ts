import { Router } from 'express';
import multer from 'multer';
import {
  register,
  login,
  getMe,
  logout,
  checkAvailability,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePushToken,
  changePassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/check-availability', checkAvailability);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated Routes
router.post('/verify-otp', requireAuth, verifyOtp);
router.post('/resend-otp', requireAuth, resendOtp);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, upload.single('photo'), updateProfile);
router.post('/push-token', requireAuth, updatePushToken);
router.post('/change-password', requireAuth, changePassword);

export default router;
