import { Request, Response } from 'express';
import { AiService } from '../services/aiService';

export const chatWithAisha = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const reply = await AiService.chat(message.trim(), Array.isArray(history) ? history : []);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while processing your request.',
    });
  }
};

export const chatWithHamza = chatWithAisha;
