import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ status: 'success', message: 'Registered successfully. Check your email for OTP.', data: result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({ status: 'success', message: 'Logged in successfully', data: result });
  } catch (error: any) {
    res.status(401).json({ status: 'error', message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { otp } = req.body;
    if (!otp) { res.status(400).json({ status: 'error', message: 'OTP is required' }); return; }
    const result = await authService.verifyOtp(userId, otp);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const result = await authService.resendOtp(userId);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ status: 'error', message: 'Email is required' }); return; }
    const result = await authService.forgotPassword(email);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ status: 'error', message: 'Token and password are required' }); return; }
    const result = await authService.resetPassword(token, password);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const photoBuffer = (req as any).file?.buffer;
    const user = await authService.updateProfile(userId, req.body, photoBuffer);
    res.status(200).json({ status: 'success', message: 'Profile updated', data: user });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;
    const result = await authService.checkAvailability(email, phone);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(409).json({ status: 'error', message: error.message });
  }
};
