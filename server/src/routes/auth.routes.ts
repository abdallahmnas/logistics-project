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
  verifyResetOtp,
  resetPassword,
  updateProfile,
  updatePushToken,
  changePassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return requireAuth(req, res, next);
  }
  next();
};

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/check-availability', checkAvailability);
router.post('/verify-otp', optionalAuth, verifyOtp);
router.post('/resend-otp', optionalAuth, resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Authenticated Routes
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, upload.single('photo'), updateProfile);
router.post('/push-token', requireAuth, updatePushToken);
router.post('/change-password', requireAuth, changePassword);

export default router;
