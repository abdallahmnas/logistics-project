import axios from 'axios';
import { AISHA_INTENTS, AISHA_SYSTEM_PROMPT, Intent } from '../data/aishaKnowledge';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AiService {
  private static scoreIntent(text: string, intent: Intent): number {
    const textLower = text.toLowerCase();
    let score = 0;

    for (const pattern of intent.patterns) {
      if (textLower.includes(pattern)) {
        const wordCount = pattern.split(/\s+/).length;
        score += wordCount * 2;
      }
    }

    return score;
  }

  private static detectIntent(text: string, history: ChatMessage[] = []): Intent | null {
    let bestIntent: Intent | null = null;
    let maxScore = 0;

    for (const intent of AISHA_INTENTS) {
      if (intent.tag === 'fallback') continue;
      const score = this.scoreIntent(text, intent);
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    if (bestIntent && maxScore > 0) return bestIntent;

    // Context Inheritance: check last 4 user messages in history
    const userHistory = history.filter((h) => h.role === 'user').slice(-4).reverse();
    for (const prevMsg of userHistory) {
      for (const intent of AISHA_INTENTS) {
        if (intent.tag === 'fallback') continue;
        const score = this.scoreIntent(prevMsg.content, intent);
        if (score > maxScore) {
          maxScore = score;
          bestIntent = intent;
        }
      }
      if (bestIntent && maxScore > 0) return bestIntent;
    }

    return null;
  }

  private static getRandomResponse(intent: Intent): string {
    if (!intent.responses || intent.responses.length === 0) {
      return 'I am here to assist you with your HAMZA RMB GLOBAL shipping, RMB exchange, and wallet funding requests!';
    }
    const idx = Math.floor(Math.random() * intent.responses.length);
    return intent.responses[idx];
  }

  public static async chat(message: string, history: ChatMessage[] = []): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct';

    const detectedIntent = this.detectIntent(message, history);

    // MODE A: Knowledge-Base Only (No API key provided)
    if (!apiKey) {
      if (detectedIntent) {
        return this.getRandomResponse(detectedIntent);
      }
      const fallbackIntent = AISHA_INTENTS.find((i) => i.tag === 'fallback') || AISHA_INTENTS[0];
      return this.getRandomResponse(fallbackIntent);
    }

    // MODE B: Hybrid AI (API key present)
    try {
      let enrichedSystemPrompt = AISHA_SYSTEM_PROMPT;
      if (detectedIntent && detectedIntent.responses.length > 0) {
        enrichedSystemPrompt += `\n\n[AUTHORITATIVE TOPIC CONTEXT - ${detectedIntent.tag.toUpperCase()}]:\nUse this accurate information as inspiration if relevant:\n${detectedIntent.responses.join('\n')}`;
      }

      // Keep last 10 conversation turns
      const recentHistory = history.slice(-10).map((h) => ({
        role: h.role,
        content: h.content,
      }));

      const apiMessages = [
        { role: 'system', content: enrichedSystemPrompt },
        ...recentHistory,
        { role: 'user', content: message },
      ];

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: apiMessages,
          max_tokens: 512,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://hamzarmbglobal.com',
            'X-Title': 'Hamza RMB Global Aisha AI',
          },
          timeout: 25000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        return reply.trim();
      }

      // Fallback if API returned empty reply
      if (detectedIntent) return this.getRandomResponse(detectedIntent);
      return this.getRandomResponse(AISHA_INTENTS.find((i) => i.tag === 'fallback') || AISHA_INTENTS[0]);
    } catch (err: any) {
      console.warn('OpenRouter/AI API call failed, falling back to local Knowledge Base:', err?.message || err);
      if (detectedIntent) {
        return this.getRandomResponse(detectedIntent);
      }
      const fallbackIntent = AISHA_INTENTS.find((i) => i.tag === 'fallback') || AISHA_INTENTS[0];
      return this.getRandomResponse(fallbackIntent);
    }
  }
}
