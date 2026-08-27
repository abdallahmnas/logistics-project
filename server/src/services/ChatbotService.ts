import { Package, ExchangeRate, User, SupportTicket } from '../models/index';
import { Op } from 'sequelize';

export interface ChatMessageRequest {
  message: string;
  language?: 'ha' | 'en' | 'pcm'; // Hausa, English, Pidgin
  userId?: string;
  conversationHistory?: Array<{ sender: 'user' | 'bot'; text: string }>;
}

export interface ChatMessageResponse {
  reply: string;
  language: 'ha' | 'en' | 'pcm';
  actionCard?: {
    type: 'tracking' | 'exchange' | 'freight' | 'ticket' | 'faq';
    data?: any;
  };
  suggestedReplies?: string[];
}

export class ChatbotService {
  /**
   * Levenshtein Distance Algorithm for Fuzzy Typo Matching
   */
  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Checks if target text contains any keyword or fuzzy variant (with up to maxEditDistance typos)
   */
  private fuzzyMatch(text: string, targets: string[], maxEditDistance: number = 2): boolean {
    const tokens = text.toLowerCase().split(/[\s,?.!/\\_]+/);
    for (const token of tokens) {
      if (token.length < 3) continue;
      for (const target of targets) {
        if (token.includes(target) || target.includes(token)) return true;
        if (Math.abs(token.length - target.length) <= maxEditDistance) {
          const dist = this.levenshtein(token, target);
          if (dist <= maxEditDistance) return true;
        }
      }
    }
    return false;
  }

  /**
   * Auto-detect language if not explicitly passed
   */
  private detectLanguage(text: string): 'ha' | 'en' | 'pcm' {
    const hausaKeywords = ['sannu', 'sanu', 'snu', 'kaya', 'kayana', 'duba', 'chanji', 'chanjii', 'aiko', 'jirgi', 'naira', 'rmb', 'kudi', 'adreshin', 'tambaya', 'ina', 'yaushe', 'zamu', 'nawa', 'kama', 'sanin', 'watsapp', 'biyu'];
    const pidginKeywords = ['how far', 'wetin', 'my package', 'dey', 'abeg', 'waka', 'kobo', 'shekpe', 'una'];

    const lower = text.toLowerCase();

    if (hausaKeywords.some(kw => lower.includes(kw))) {
      return 'ha';
    }
    if (pidginKeywords.some(kw => lower.includes(kw))) {
      return 'pcm';
    }
    return 'en';
  }

  /**
   * Optional LLM API call if OpenAI/OpenRouter/Gemini key is configured
   */
  private async queryExternalLLM(promptText: string, lang: 'ha' | 'en' | 'pcm', dbContext: any): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
      const endpoint = process.env.OPENAI_API_KEY
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the friendly, expert AI Support Assistant for Hamza RMB Global Logistics & Financial Services. You fluently understand Hausa, English, and Nigerian Pidgin. Always reply in the user's primary language (${lang}).
Live DB Context:
- Current RMB Rate: 1 RMB = ₦${dbContext.rate || 220} NGN
- China Warehouse: No. 88 Baiyun Cargo Road, Guangzhou, China (+86 20 8888 9999)
- Air Freight Rate: $10.50/kg (3-5 days delivery)
- Sea Freight Rate: $210.00/CBM (30-40 days delivery)
Keep responses concise, clear, and helpful.`
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.warn('[ChatbotService] External LLM call skipped, falling back to NLP engine:', err);
    }
    return null;
  }

  /**
   * Main Intelligent Message Handler with Typo Tolerance & Fuzzy Intent Recognition
   */
  async processMessage(req: ChatMessageRequest): Promise<ChatMessageResponse> {
    const text = req.message.trim();
    const lang = req.language || this.detectLanguage(text);
    const lowerText = text.toLowerCase();

    // Fetch active exchange rate from DB
    const activeRate = await ExchangeRate.findOne({ where: { isActive: true } });
    const currentRate = activeRate?.rateNairaPerRmb || 220;

    // 0. Try External LLM if API Key is available
    const llmReply = await this.queryExternalLLM(text, lang, { rate: currentRate });
    if (llmReply) {
      return {
        reply: llmReply,
        language: lang,
        suggestedReplies: lang === 'ha'
          ? ['Duba kaya ta', 'Nawa ne chanjin RMB?', 'China Warehouse', 'Magana da Support']
          : ['Track Package', 'RMB Exchange Rate', 'China Warehouse', 'Talk to Support']
      };
    }

    // 1. Package Tracking Intent (with typo tolerance: traking, trak, trakin, pakage, status, duba, kaya)
    const trackingMatch = text.match(/(HZ-[A-Z0-9-]+|[A-Z]{2}[0-9]{8,12})/i);
    const isTrackingIntent = trackingMatch || this.fuzzyMatch(lowerText, ['tracking', 'traking', 'trak', 'trakin', 'traker', 'package', 'pakage', 'shipment', 'status', 'duba', 'kaya']);

    if (trackingMatch) {
      const trackingId = trackingMatch[0].toUpperCase();
      const pkg = await Package.findOne({
        where: {
          [Op.or]: [
            { trackingId: { [Op.iLike]: `%${trackingId}%` } },
            { chineseTrackingNo: { [Op.iLike]: `%${trackingId}%` } },
          ]
        }
      });

      if (pkg) {
        if (lang === 'ha') {
          const statusText = pkg.status === 'received_cn' ? 'Sun iso Dakin Ajiya na China (Guangzhou Hub)'
            : pkg.status === 'arrived_ng' ? 'Sun iso Hub na Nigeria (Lagos LOS)'
            : pkg.status === 'delivered' ? 'An mika muku kayan ku kalau'
            : 'Suna kan hanyar isowa (In Transit)';

          return {
            language: 'ha',
            reply: `Kayan ku mai lambar tracking #${pkg.trackingId} (${pkg.description || 'Kaya'}):\n📌 Matsayi: ${statusText}\n⚖️ Nauyi: ${pkg.weightKg || 0} kg\n⏱️ Tsammanin Isowa: ${pkg.estimatedDeliveryDays || 'Kwanaki 3-5'}`,
            actionCard: {
              type: 'tracking',
              data: {
                trackingId: pkg.trackingId,
                status: pkg.status,
                weightKg: pkg.weightKg,
                destinationHub: pkg.destinationHub,
                description: pkg.description,
              }
            },
            suggestedReplies: ['Ina adreshin China warehouse?', 'Nawa ne chanjin RMB yau?', 'Magana da Support']
          };
        } else {
          return {
            language: 'en',
            reply: `Package #${pkg.trackingId} (${pkg.description || 'Goods'}):\n📌 Status: ${pkg.status.toUpperCase()}\n⚖️ Weight: ${pkg.weightKg || 0} kg\n⏱️ Estimated Transit: ${pkg.estimatedDeliveryDays || '3-5 Days'}`,
            actionCard: {
              type: 'tracking',
              data: {
                trackingId: pkg.trackingId,
                status: pkg.status,
                weightKg: pkg.weightKg,
                destinationHub: pkg.destinationHub,
                description: pkg.description,
              }
            },
            suggestedReplies: ['China Warehouse Address', 'Current RMB Exchange Rate', 'Talk to Support Agent']
          };
        }
      } else {
        if (lang === 'ha') {
          return {
            language: 'ha',
            reply: `An duba amman ba a sami kayan da lambar #${trackingId} ba a tsarin mu. Tabbatar kun shigar da lambar da kyau ko kuma ku tuntuɓi cibiyar ma'aikata.`,
            suggestedReplies: ['Ina adreshin China warehouse?', 'Magana da Support']
          };
        } else {
          return {
            language: 'en',
            reply: `Could not find any active shipment matching tracking ID #${trackingId}. Please verify the tracking number or contact support.`,
            suggestedReplies: ['China Warehouse Address', 'Talk to Support Agent']
          };
        }
      }
    }

    // 2. Dynamic Freight Calculation (handles typos: kg, kilo, kilogram, cbm, cubic, m3, shpping, frieght, flite, cost, kudin)
    const weightMatch = lowerText.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilogram)/i);
    const cbmMatch = lowerText.match(/(\d+(\.\d+)?)\s*(cbm|cubic|m3)/i);

    if (weightMatch || cbmMatch) {
      if (weightMatch) {
        const kgVal = parseFloat(weightMatch[1]);
        const usdCost = kgVal * 10.5;
        const nairaEst = usdCost * 1500;

        if (lang === 'ha') {
          return {
            language: 'ha',
            reply: `Lissafin Kudin Aiko Kayan Jirgin Sama (Air Express) don nauyin ${kgVal} kg:\n💵 Kudin USD: $${usdCost.toFixed(2)} USD\n🇳🇬 Tsammanin Naira: ₦${nairaEst.toLocaleString()} NGN ($10.50/kg, kwanaki 3-5).\n\nKuna son aiko kayan ku yanzu?`,
            actionCard: {
              type: 'freight',
              data: { kgVal, usdCost, nairaEst, mode: 'Air Express' }
            },
            suggestedReplies: ['Ina adreshin China warehouse?', 'Nawa ne chanjin RMB?', 'Magana da Support']
          };
        } else {
          return {
            language: 'en',
            reply: `Air Express Shipping Estimate for ${kgVal} kg:\n💵 USD Amount: $${usdCost.toFixed(2)} USD\n🇳🇬 NGN Estimate: ₦${nairaEst.toLocaleString()} NGN (@ $10.50/kg, 3-5 days delivery).`,
            actionCard: {
              type: 'freight',
              data: { kgVal, usdCost, nairaEst, mode: 'Air Express' }
            },
            suggestedReplies: ['China Warehouse Address', 'RMB Exchange Calculator', 'Talk to Support Agent']
          };
        }
      } else if (cbmMatch) {
        const cbmVal = parseFloat(cbmMatch[1]);
        const usdCost = cbmVal * 210;
        const nairaEst = usdCost * 1500;

        if (lang === 'ha') {
          return {
            language: 'ha',
            reply: `Lissafin Kudin Aiko Kayan Jirgin Ruwa (Sea Freight) don girman ${cbmVal} CBM:\n💵 Kudin USD: $${usdCost.toFixed(2)} USD\n🇳🇬 Tsammanin Naira: ₦${nairaEst.toLocaleString()} NGN ($210/CBM, kwanaki 30-40).`,
            actionCard: {
              type: 'freight',
              data: { cbmVal, usdCost, nairaEst, mode: 'Sea Freight' }
            },
            suggestedReplies: ['Ina adreshin China warehouse?', 'Nawa ne chanjin RMB?', 'Magana da Support']
          };
        } else {
          return {
            language: 'en',
            reply: `Sea Freight Shipping Estimate for ${cbmVal} CBM:\n💵 USD Amount: $${usdCost.toFixed(2)} USD\n🇳🇬 NGN Estimate: ₦${nairaEst.toLocaleString()} NGN (@ $210/CBM, 30-40 days delivery).`,
            actionCard: {
              type: 'freight',
              data: { cbmVal, usdCost, nairaEst, mode: 'Sea Freight' }
            },
            suggestedReplies: ['China Warehouse Address', 'RMB Exchange Calculator', 'Talk to Support Agent']
          };
        }
      }
    }

    // 3. RMB Exchange Rate Intent (handles typos: rmb, exchanj, excange, rate, convert, naira, ngn, kudi, chanji, chanjii)
    const isExchangeIntent = this.fuzzyMatch(lowerText, ['rmb', 'exchange', 'exchanj', 'excange', 'rate', 'convert', 'naira', 'ngn', 'kudi', 'chanji', 'chanjii', 'yuan', 'renminbi']);

    if (isExchangeIntent) {
      const amountMatch = lowerText.match(/(\d+[\d,]*)\s*(rmb|naira|¥|₦)/i) || lowerText.match(/(rmb|naira|¥|₦)\s*(\d+[\d,]*)/i);
      let conversionText = '';

      if (amountMatch) {
        const valStr = amountMatch[1].match(/^\d+/) ? amountMatch[1] : amountMatch[2];
        const val = parseFloat(valStr.replace(/,/g, ''));
        const unit = amountMatch[0].toLowerCase().includes('rmb') || amountMatch[0].includes('¥') ? 'rmb' : 'naira';

        if (unit === 'rmb') {
          const nairaValue = val * currentRate;
          conversionText = lang === 'ha'
            ? `¥${val.toLocaleString()} RMB zai kasance ₦${nairaValue.toLocaleString()} Naira.`
            : `¥${val.toLocaleString()} RMB equals ₦${nairaValue.toLocaleString()} NGN.`;
        } else {
          const rmbValue = val / currentRate;
          conversionText = lang === 'ha'
            ? `₦${val.toLocaleString()} Naira zai sayi ¥${rmbValue.toFixed(2)} RMB.`
            : `₦${val.toLocaleString()} NGN converts to ¥${rmbValue.toFixed(2)} RMB.`;
        }
      }

      if (lang === 'ha') {
        return {
          language: 'ha',
          reply: `Chanjin RMB zuwa Naira a Hamza RMB Global a yau shi ne: 1 RMB = ₦${currentRate} Naira. ${conversionText}`,
          actionCard: {
            type: 'exchange',
            data: { rateNairaPerRmb: currentRate }
          },
          suggestedReplies: ['Ina adreshin China warehouse?', 'Duba kudin aiko 20kg', 'Magana da Support']
        };
      } else {
        return {
          language: 'en',
          reply: `Today's official RMB exchange rate at Hamza RMB Global is: 1 RMB = ₦${currentRate} NGN. ${conversionText}`,
          actionCard: {
            type: 'exchange',
            data: { rateNairaPerRmb: currentRate }
          },
          suggestedReplies: ['Request RMB Exchange', 'China Warehouse Address', 'Calculate 20kg Air Freight']
        };
      }
    }

    // 4. Warehouse Address Intent (handles typos: warehouse, wharehouse, werhouse, guangzhou, guangzu, guangzo, address, adreshin, location, dakin, ajiya)
    const isWarehouseIntent = this.fuzzyMatch(lowerText, ['warehouse', 'wharehouse', 'werhouse', 'guangzhou', 'guangzu', 'guangzo', 'address', 'adreshin', 'location', 'dakin', 'ajiya']);

    if (isWarehouseIntent) {
      if (lang === 'ha') {
        return {
          language: 'ha',
          reply: `Adreshin Dakin Ajiya (Warehouse) na Hamza RMB Global a China:\n📍 No. 88 Baiyun Cargo Road, Guangzhou, China\n📞 Lambar Waya: +86 20 8888 9999\n✉️ Email: guangzhou@hamzarmb.com\n\nTabbatar kun rubuta sunanku da Customer ID dinku a jikin kowace kaya.`,
          actionCard: {
            type: 'faq',
            data: {
              title: 'China Warehouse Address',
              address: 'No. 88 Baiyun Cargo Road, Guangzhou, China',
              phone: '+86 20 8888 9999'
            }
          },
          suggestedReplies: ['Nawa ne chanjin RMB?', 'Duba kudin aiko 15kg', 'Magana da Support']
        };
      } else {
        return {
          language: 'en',
          reply: `Our official Guangzhou China Warehouse Address:\n📍 No. 88 Baiyun Cargo Road, Guangzhou, China\n📞 Phone: +86 20 8888 9999\n✉️ Email: guangzhou@hamzarmb.com\n\nAlways ensure your Customer ID is labeled on inbound packages.`,
          actionCard: {
            type: 'faq',
            data: {
              title: 'Guangzhou Warehouse Address',
              address: 'No. 88 Baiyun Cargo Road, Guangzhou, China',
              phone: '+86 20 8888 9999'
            }
          },
          suggestedReplies: ['Current RMB Rate', 'Calculate 15kg Freight', 'Talk to Support Agent']
        };
      }
    }

    // 5. 1688 / Buy-For-Me Procurement Intent (handles typos: 1688, taobao, procurement, buyforme, sourcing, supplier, sayi, soya)
    const isProcurementIntent = this.fuzzyMatch(lowerText, ['1688', 'taobao', 'procurement', 'buyforme', 'sourcing', 'supplier', 'buy', 'sayi', 'soya']);

    if (isProcurementIntent) {
      if (lang === 'ha') {
        return {
          language: 'ha',
          reply: `Manhajar Sayen Kaya ta 1688 / Buy-For-Me:\n🛒 Muna taimaka muku sayen kaya kai tsaye daga masana'antun China (1688 / Taobao) a kan kudin RMB tare da biyan cazar 5% kawai.\n\nKuna iya aika mana da link din kayan ko hoton kayan don sanin farashin.`,
          actionCard: {
            type: 'faq',
            data: {
              title: '1688 / Buy-For-Me Procurement',
              fee: '5% Service Fee'
            }
          },
          suggestedReplies: ['Nawa ne chanjin RMB?', 'China Warehouse Address', 'Magana da Support']
        };
      } else {
        return {
          language: 'en',
          reply: `1688 & China Factory Procurement (Buy-For-Me):\n🛒 We assist in purchasing goods directly from Chinese suppliers (1688 / Taobao) with a low 5% service fee.\n\nYou can submit product links or images on your dashboard to request a quote.`,
          actionCard: {
            type: 'faq',
            data: {
              title: '1688 / Buy-For-Me Procurement',
              fee: '5% Service Fee'
            }
          },
          suggestedReplies: ['Current RMB Rate', 'Guangzhou Warehouse', 'Talk to Support Agent']
        };
      }
    }

    // 6. Prohibited & Customs Clearance Intent (handles typos: customs, clearance, forbidden, prohibited, haram, hana)
    const isCustomsIntent = this.fuzzyMatch(lowerText, ['customs', 'clearance', 'prohibited', 'forbidden', 'haramban', 'hana']);

    if (isCustomsIntent) {
      if (lang === 'ha') {
        return {
          language: 'ha',
          reply: `Hana-Kaya & Ka'idojin Customs:\n🚫 Abubuwan da aka hana aikawa: Magungunan da ba a yarda da su ba, Kayan konewa/wuta, Counterfeit kayayyaki masu rigimar trademark, da bindigogi.\n\nDuk sauran kayan kasuwanci (tufafi, electronics, spare parts) ana fito da su cikin aminci.`,
          suggestedReplies: ['China Warehouse Address', 'Nawa ne chanjin RMB?']
        };
      } else {
        return {
          language: 'en',
          reply: `Customs Clearance & Prohibited Items Policy:\n🚫 Strictly Prohibited: Flammables, explosives, illegal pharmaceuticals, weapons, and counterfeit brand items.\n\nAll standard commercial goods (apparel, electronics, machinery, spares) undergo smooth customs clearance at Lagos hub.`,
          suggestedReplies: ['Guangzhou Warehouse Address', 'Current RMB Exchange Rate']
        };
      }
    }

    // 7. Human Support Escalation Intent (handles typos: support, suport, agent, maikaci, ma'aikaci, human, tket, ticket)
    const isSupportIntent = this.fuzzyMatch(lowerText, ['support', 'suport', 'agent', 'maikaci', "ma'aikaci", 'human', 'ticket', 'tket', 'help', 'human']);

    if (isSupportIntent) {
      if (lang === 'ha') {
        return {
          language: 'ha',
          reply: `Za mu mika ku ga cibiyar tallafin ma'aikatan mu nan take. Kuna iya danna maballin da ke kasa don bude Support Ticket.`,
          actionCard: {
            type: 'ticket',
            data: { title: 'Tuntubi Ma\'aikaci' }
          },
          suggestedReplies: ['Duba kaya ta', 'Nawa ne chanjin RMB?']
        };
      } else {
        return {
          language: 'en',
          reply: `Connecting you with our support help desk. You can click below to open a direct support ticket.`,
          actionCard: {
            type: 'ticket',
            data: { title: 'Contact Support Agent' }
          },
          suggestedReplies: ['Track Package', 'Current RMB Rate']
        };
      }
    }

    // 8. Fuzzy Intelligent Default Response
    if (lang === 'ha') {
      return {
        language: 'ha',
        reply: `Sannu da zuwa Hamza RMB Global AI Assistant! 🇳🇬\nZan iya lissafa muku kudin aiko kaya (misali: "nawa ne kudin aiko 25kg?"), duba kayan ku mai tracking #, ko baka chanjin RMB yau.\n\nYaya zan taimake ku?`,
        suggestedReplies: [
          'Duba kaya ta (Tracking)',
          'Nawa ne chanjin RMB yau?',
          'Duba kudin aiko 25kg',
          'China Warehouse Address'
        ]
      };
    } else {
      return {
        language: 'en',
        reply: `Welcome to Hamza RMB Global AI Assistant! 🌍\nI can calculate shipping costs (e.g. "calculate 20kg freight"), track packages by ID, convert RMB currency, or provide Guangzhou warehouse info. How can I help?`,
        suggestedReplies: [
          'Track My Shipment',
          'Current RMB Exchange Rate',
          'Calculate 20kg Freight',
          'Guangzhou Warehouse Address'
        ]
      };
    }
  }
}
