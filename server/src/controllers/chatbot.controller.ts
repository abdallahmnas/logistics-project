import { Request, Response } from 'express';
import { ChatbotService } from '../services/ChatbotService';

const chatbotService = new ChatbotService();

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message: userMessage, language } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid text message string',
      });
    }

    const userId = (req as any).user?.id;
    const response = await chatbotService.processMessage({
      message: userMessage,
      language,
      userId,
    });

    return res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (error: any) {
    console.error('[ChatbotController] Error handling message:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing chatbot response',
    });
  }
};
