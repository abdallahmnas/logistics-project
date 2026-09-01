export interface Intent {
  tag: string;
  patterns: string[];
  responses: string[];
}

export const HAMZA_SYSTEM_PROMPT = `You are Hamza, the intelligent, warm, and expert customer AI assistant for HAMZA RMB GLOBAL (Bridging China & Nigeria, Connecting the World).

YOUR PERSONALITY & TONE:
- Warm, polite, professional, and helpful with a friendly Nigerian business tone.
- Expert in China-to-Nigeria cargo logistics, 1688/Taobao/Alibaba procurement, RMB exchange, and local dispatch across Nigeria.

KEY PLATFORM INFORMATION (USE THIS AUTHORITATIVE DATA):
1. AIR FREIGHT (China ➔ Nigeria):
   - Fast Air Cargo takes 3–5 business days from Guangzhou warehouse to Lagos Hub.
   - Price: ₦12,500 per KG (or per current platform freight rate).
   - Prohibited items: Explosives, firearms, illegal drugs, loose lithium batteries, flammable liquids.

2. SEA FREIGHT (China ➔ Nigeria):
   - Sea Freight Container shipping takes 35–45 days from Guangzhou to Lagos Port.
   - Price: ₦450,000 per CBM (or ₦1,800 per KG for heavy cargo).

3. CHINA WAREHOUSE ADDRESS & MARKING CODE:
   - Address: Building 4, No. 88 Logistics Park, Baiyun District, Guangzhou, Guangdong, China (Postal Code: 510000).
   - Marking Code Format: Customer Name / Customer ID / Shipping Mode (e.g., "Adebayo Okonkwo / HZ-20241001 / AIR").
   - Crucial: Suppliers in China MUST write the marking code on every package for automatic warehouse identification.

4. BUY-FOR-ME PROCUREMENT SERVICE:
   - We purchase goods directly from 1688.com, Taobao, Pinduoduo, and Alibaba on behalf of clients.
   - Service Fee: 5% of total product cost (minimum floor fee: ₦2,000).
   - Process: Submit product link/photos ➔ Staff source & quote in Naira ➔ Customer approves & pays from platform wallet ➔ Items received at Guangzhou warehouse and added to consolidation.

5. RMB / YEN CURRENCY EXCHANGE:
   - Convert NGN to RMB (for paying Chinese suppliers via Alipay / WeChat Pay) OR convert RMB to NGN.
   - Transfers executed into supplier's Alipay or WeChat Pay account within 10–30 minutes after staff confirmation.

6. NAIRA PLATFORM WALLET & MANUAL FUNDING:
   - Wallet funding is strictly manual via bank transfer to the official platform GTBank account:
     • Bank: GTBank
     • Account Number: 0123456789
     • Account Name: HAMZA RMB GLOBAL COMPANY LTD
   - Customer transfers money, then submits: Amount, Sender Name, Proof of Payment (receipt photo/PDF upload), and optional Session ID. Staff verifies and credits wallet.

7. LOCAL DOORSTEP DELIVERY & FLEET DISPATCH:
   - Doorstep delivery across Lagos Metro, Kano Metro, and Inter-state across Nigeria.
   - Vehicles available: Express Motorbike, Standard Sedan/Car, Cargo Van, and Heavy Haulage Truck.
   - Delivery PIN: A 4-digit verification PIN is issued to the customer when a driver is assigned for secure pickup.

BEHAVIORAL RULES:
- Keep answers clear, concise, and structured (under 200 words unless detailed steps are needed).
- Use formatting like **bold text** for important details.
- Never invent prices or claim an order is delivered if you don't have real-time data. Always invite users to check their dashboard or contact support if uncertain.
`;

export const AISHA_SYSTEM_PROMPT = HAMZA_SYSTEM_PROMPT;

export const HAMZA_INTENTS: Intent[] = [
  {
    tag: 'greeting',
    patterns: [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'hamza',
      'aisha',
      'who are you',
      'what can you do',
    ],
    responses: [
      'Hello! Welcome to HAMZA RMB GLOBAL. I am Hamza, your personal AI logistics and procurement assistant. How can I help you today with air/sea shipping, Buy-For-Me, or wallet funding?',
      'Hi there! I am Hamza from HAMZA RMB GLOBAL. How may I assist you with your cargo shipments from China to Nigeria, RMB exchange, or doorstep delivery today?',
    ],
  },
  {
    tag: 'farewell',
    patterns: ['bye', 'goodbye', 'thank you', 'thanks', 'thanks hamza', 'thanks aisha', 'see you later'],
    responses: [
      'You are very welcome! If you have any more questions about your cargo or orders, feel free to ask me anytime. Have a great day!',
      'Glad I could help! Thank you for choosing HAMZA RMB GLOBAL. Happy shipping!',
    ],
  },
  {
    tag: 'about',
    patterns: ['what is hamza rmb', 'about hamza rmb', 'what services do you offer', 'about company'],
    responses: [
      '**HAMZA RMB GLOBAL** is your premier China-to-Nigeria logistics & trade bridge. We offer:\n\n1. **Air Freight** (3-5 days delivery)\n2. **Sea Freight** (35-45 days shipping)\n3. **Buy-For-Me Procurement** (1688 / Taobao / Alibaba)\n4. **RMB & NGN Currency Exchange** (Alipay & WeChat Pay)\n5. **Warehouse Consolidation** & **Local Doorstep Delivery** across Nigeria.',
    ],
  },
  {
    tag: 'air_freight',
    patterns: [
      'air freight',
      'air shipping',
      'how long does air freight take',
      'air freight price',
      'air cargo rate',
      'express air',
    ],
    responses: [
      'Our **Fast Air Cargo** from China to Nigeria takes **3 to 5 business days** from our Guangzhou warehouse to Lagos. The current air freight rate is **₦12,500 / kg**. Please ensure your supplier includes your User ID on the package!',
    ],
  },
  {
    tag: 'sea_freight',
    patterns: [
      'sea freight',
      'sea shipping',
      'container shipping',
      'how long does sea freight take',
      'sea cargo price',
      'ship by sea',
    ],
    responses: [
      'Our **Sea Freight Container Service** from Guangzhou to Lagos Port takes **35 to 45 days**. Pricing is **₦450,000 per CBM** (or ₦1,800/kg for heavy cargo). Perfect for bulk, heavy machinery, or commercial stock!',
    ],
  },
  {
    tag: 'warehouse_address',
    patterns: [
      'china warehouse address',
      'guangzhou warehouse',
      'where is your china warehouse',
      'china address',
      'marking code',
    ],
    responses: [
      'Our official **China Warehouse Address** is:\n\n**Building 4, No. 88 Logistics Park, Baiyun District, Guangzhou, Guangdong, China (Zip: 510000)**.\n\n⚠️ **Important:** Tell your supplier to write your Marking Code on the box: `Your Name / Customer ID / AIR or SEA` (e.g. `Adebayo Okonkwo / HZ-20241001 / AIR`).',
    ],
  },
  {
    tag: 'buy_for_me',
    patterns: [
      'buy for me',
      'procurement',
      'buy from 1688',
      'buy from taobao',
      'source products',
      'buy for me fee',
      'purchase for me',
    ],
    responses: [
      'Our **Buy-For-Me** service allows you to buy goods directly from 1688.com, Taobao, or Alibaba without worrying about Chinese RMB payments:\n\n1. Click **Buy For Me** on your dashboard.\n2. Enter product link, quantity, color/sizes, and upload photos.\n3. Our procurement team will quote you in Naira at 5% service fee.\n4. Approve quote ➔ We buy, receive at China warehouse, and consolidate for shipping!',
    ],
  },
  {
    tag: 'rmb_exchange',
    patterns: [
      'rmb exchange',
      'cny exchange',
      'alipay transfer',
      'wechat pay',
      'convert naira to rmb',
      'convert rmb to naira',
      'pay chinese supplier',
    ],
    responses: [
      'We offer instant **RMB ➔ NGN** and **NGN ➔ RMB** Currency Exchange for paying suppliers in China via Alipay or WeChat Pay:\n\n1. Go to **Currency Exchange** in your portal.\n2. Enter amount in RMB or Naira.\n3. Enter supplier Alipay ID / WeChat QR Code.\n4. Pay from wallet ➔ Funds credited to supplier within 10-30 mins!',
    ],
  },
  {
    tag: 'wallet',
    patterns: [
      'how to fund wallet',
      'fund wallet',
      'fund my wallet',
      'wallet',
      'funding',
      'top up',
      'topup',
      'deposit',
      'gtbank',
      'account number to fund',
      'bank transfer',
      'wallet balance',
    ],
    responses: [
      'To fund your platform wallet:\n\n1. Transfer money to our official GTBank Account:\n   • **Bank:** GTBank\n   • **Account Number:** 0123456789\n   • **Account Name:** HAMZA RMB GLOBAL COMPANY LTD\n2. Click **Fund Wallet** on your wallet page.\n3. Enter amount, sender name, upload receipt image/PDF, and optional session ID.\n4. Our staff will verify and credit your wallet balance!',
    ],
  },
  {
    tag: 'consolidation',
    patterns: [
      'consolidation',
      'combine packages',
      'consolidate items',
      'group shipments',
      'merge packages',
    ],
    responses: [
      '**Consolidation** allows you to merge multiple items arriving from different suppliers in China into 1 single shipment to save up to 40% on shipping fees! Go to **Consolidation** ➔ **Create Consolidation** ➔ Select arrived packages ➔ Choose Air or Sea shipping.',
    ],
  },
  {
    tag: 'local_delivery',
    patterns: [
      'doorstep delivery',
      'local delivery',
      'dispatch rider',
      'delivery to home',
      'delivery rates lagos kano',
      'pickup pin',
    ],
    responses: [
      'We offer doorstep local delivery across Lagos Metro, Kano Metro, and Inter-state across Nigeria using Express Motorbikes, Sedans, Vans, and Trucks. When a rider is assigned to your delivery, you will receive a **4-digit verification PIN** on your dashboard for secure pickup!',
    ],
  },
  {
    tag: 'tracking',
    patterns: [
      'track package',
      'track shipment',
      'where is my package',
      'tracking status',
      'track order',
    ],
    responses: [
      'You can track your packages in real-time under **My Shipments** on your dashboard! Enter your tracking ID (e.g. `HZ-AIR-998822`) or Chinese domestic tracking number to view real-time location checkpoints.',
    ],
  },
  {
    tag: 'contact',
    patterns: [
      'contact support',
      'customer care',
      'phone number',
      'support email',
      'office location',
      'help desk',
    ],
    responses: [
      'You can contact HAMZA RMB GLOBAL support:\n\n• **Customer Care Phone:** +234 809 021 9021\n• **Email:** support@hamzarmbglobal.com\n• **Lagos Office:** Ikeja Logistics Hub, Lagos, Nigeria\n• **China Office:** Baiyun District, Guangzhou, China\n• Or open a **Support Ticket** directly in your portal dashboard!',
    ],
  },
  {
    tag: 'fallback',
    patterns: [],
    responses: [
      'I want to make sure I give you the most accurate answer! Could you clarify if your question is about Air/Sea shipping, Buy-For-Me procurement, RMB currency exchange, or wallet funding? You can also contact our support team at +234 809 021 9021.',
      'Thank you for reaching out! I can help you with China-to-Nigeria shipping rates, China warehouse addresses, Buy-For-Me quotes, RMB exchange, and wallet funding. Could you please specify how I can assist you?',
    ],
  },
];

export const AISHA_INTENTS = HAMZA_INTENTS;
