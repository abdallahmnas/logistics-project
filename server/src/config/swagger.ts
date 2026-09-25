import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Logicore / Hamza RMB Logistics & Mobile API',
      version: '1.0.0',
      description: `
Exhaustive OpenAPI 3.0 REST API documentation for **Logicore Logistics & RMB Exchange**.

This specification provides web and mobile application developers (React Native, Flutter, Swift, Kotlin) with complete request body schemas, parameters, responses, and Bearer authentication headers.

### Mobile Client SDK Auto-Generation:
Developers can download the raw JSON schema at \`/api/v1/swagger.json\` and auto-generate client models using **OpenAPI Generator**:
\`\`\`bash
npx @openapitools/openapi-generator-cli generate -i http://localhost:5000/api/v1/swagger.json -g dart -o lib/api
\`\`\`
`,
      contact: {
        name: 'Hamza RMB Engineering',
        email: 'devs@mailinatorr.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT token generated from /auth/login or /auth/set-password',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Invalid parameter or unauthorized access' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr-1002' },
            customerId: { type: 'string', example: 'HZ-20260816-9012' },
            firstName: { type: 'string', example: 'Hamza' },
            lastName: { type: 'string', example: 'RMB' },
            email: { type: 'string', example: 'admin@hamzarmb.com' },
            phone: { type: 'string', example: '+2348099999999' },
            role: { type: 'string', example: 'super_admin' },
            isVerified: { type: 'boolean', example: true },
            photo: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg' },
          },
        },
        Package: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'pkg-10029' },
            trackingNumber: { type: 'string', example: 'SF10928374' },
            customerId: { type: 'string', example: 'HZ-20260816-9012' },
            customerName: { type: 'string', example: 'Hamza RMB' },
            courierName: { type: 'string', example: 'SF Express' },
            declaredValueUsd: { type: 'number', example: 150 },
            weightKg: { type: 'number', example: 4.5 },
            cbm: { type: 'number', example: 0.024 },
            status: { type: 'string', example: 'received_cn' },
            photos: { type: 'array', items: { type: 'string' } },
            receivedDate: { type: 'string', format: 'date-time' },
          },
        },
        Consolidation: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'con-5001' },
            consolidationId: { type: 'string', example: 'CON-10021' },
            customerId: { type: 'string', example: 'HZ-20260816-9012' },
            shippingMethod: { type: 'string', example: 'air' },
            destinationWarehouse: { type: 'string', example: 'lagos' },
            paymentMethod: { type: 'string', example: 'wallet' },
            totalWeightKg: { type: 'number', example: 12.5 },
            totalCbm: { type: 'number', example: 0.08 },
            shippingFee: { type: 'number', example: 125 },
            status: { type: 'string', example: 'ready_to_batch' },
          },
        },
        Batch: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'btc-901' },
            masterTrackingId: { type: 'string', example: 'HZ-BATCH-AIR-20260816-102' },
            carrierName: { type: 'string', example: 'Ethiopian Cargo' },
            flightVoyageNo: { type: 'string', example: 'ET-3801' },
            shippingType: { type: 'string', example: 'air' },
            status: { type: 'string', example: 'shipping_exported' },
            consolidationCount: { type: 'number', example: 8 },
            departureDate: { type: 'string', format: 'date-time' },
          },
        },
        ProcurementRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'proc-881' },
            customerId: { type: 'string', example: 'HZ-20260816-9012' },
            productUrl: { type: 'string', example: 'https://detail.1688.com/offer/67123912.html' },
            quantity: { type: 'number', example: 50 },
            specifications: { type: 'string', example: 'Size XL, Black' },
            productCostRmb: { type: 'number', example: 1200 },
            serviceFeeRmb: { type: 'number', example: 100 },
            totalCostRmb: { type: 'number', example: 1300 },
            exchangeRateUsed: { type: 'number', example: 215 },
            totalCostNaira: { type: 'number', example: 279500 },
            status: { type: 'string', example: 'quoted' },
          },
        },
        ExchangeRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'exg-302' },
            customerId: { type: 'string', example: 'HZ-20260816-9012' },
            amountNaira: { type: 'number', example: 500000 },
            amountRmb: { type: 'number', example: 2325.58 },
            exchangeRate: { type: 'number', example: 215 },
            platformFee: { type: 'number', example: 5000 },
            totalNaira: { type: 'number', example: 505000 },
            status: { type: 'string', example: 'pending' },
            rmbDestType: { type: 'string', example: 'alipay' },
            rmbDestAccount: { type: 'string', example: 'supplier@alipay.cn' },
            rmbDestName: { type: 'string', example: 'Guangzhou Trading Co' },
          },
        },
        SavedExchangeAccount: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'acc-401' },
            userId: { type: 'string', example: 'usr-1002' },
            accountType: { type: 'string', enum: ['alipay', 'wechat_pay', 'chinese_bank'], example: 'alipay' },
            accountNumber: { type: 'string', example: 'supplier@alipay.cn' },
            accountName: { type: 'string', example: 'Guangzhou Trading Co' },
            bankName: { type: 'string', example: 'Bank of China' },
            isDefault: { type: 'boolean', example: true },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'wlt-1002' },
            userId: { type: 'string', example: 'usr-1002' },
            balance: { type: 'number', example: 150000 },
            availableBalance: { type: 'number', example: 150000 },
            currency: { type: 'string', example: 'NGN' },
          },
        },
        WalletDeposit: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'dep-101' },
            userId: { type: 'string', example: 'usr-1002' },
            amount: { type: 'number', example: 250000 },
            paymentMethod: { type: 'string', example: 'bank_transfer' },
            receiptUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/receipt.jpg' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            notes: { type: 'string', example: 'Bank deposit confirmation GTB88219' },
            rejectionReason: { type: 'string', example: 'Unclear payment receipt' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ActivityLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'act-001' },
            userName: { type: 'string', example: 'Admin Hamza' },
            userRole: { type: 'string', example: 'super_admin' },
            module: { type: 'string', example: 'staff' },
            action: { type: 'string', example: 'CREATE_STAFF' },
            description: { type: 'string', example: 'Onboarded staff member Jane Doe' },
            entityId: { type: 'string', example: 'usr-8812' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SystemSettings: {
          type: 'object',
          description: 'Global system metadata, rates, freight pricing, and company contact details',
          properties: {
            cnyExchangeRate: { type: 'number', example: 215.0 },
            usdExchangeRate: { type: 'number', example: 1550.0 },
            airFreightRatePerKg: { type: 'number', example: 12500 },
            seaFreightRatePerCbm: { type: 'number', example: 450000 },
            seaFreightRatePerKg: { type: 'number', example: 3500 },
            minAirFreightKg: { type: 'number', example: 1.0 },
            minSeaFreightCbm: { type: 'number', example: 0.1 },
            buyForMeFeePercent: { type: 'number', example: 5.0 },
            buyForMeFixedFee: { type: 'number', example: 1000 },
            ngnEscrowBankName: { type: 'string', example: 'GTBank' },
            ngnEscrowAccountNo: { type: 'string', example: '0123456789' },
            ngnEscrowAccountName: { type: 'string', example: 'Hamza RMB Trading Escrow Ltd' },
            companyName: { type: 'string', example: 'HAMZA RMB GLOBAL COMPANY LTD' },
            chinaAirCargoAddressCn: { type: 'string', example: '义乌市稠州北路国贸大厦6楼602' },
            nigeriaOfficeAddress: { type: 'string', example: 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria' },
          },
        },
        DeliveryVehicle: {
          type: 'object',
          description: 'Local dispatch vehicle configuration with base fare and per-kilometer rates',
          properties: {
            id: { type: 'string', example: 'vh-001' },
            name: { type: 'string', example: 'Express Motorbike' },
            type: { type: 'string', example: 'motorbike' },
            description: { type: 'string', example: 'Fastest for light packages up to 15kg.' },
            baseFare: { type: 'number', example: 1000 },
            perKmRate: { type: 'number', example: 150 },
            maxWeightKg: { type: 'number', example: 15 },
            imageUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39' },
            isActive: { type: 'boolean', example: true },
          },
        },
        Banner: {
          type: 'object',
          description: 'Sliding promotional banner for mobile app home screen',
          properties: {
            id: { type: 'string', example: 'bnr-101' },
            title: { type: 'string', example: 'Fast Air Cargo Special' },
            subtitle: { type: 'string', example: 'Guangzhou to Lagos in 3-5 days @ ₦12,500/kg' },
            imageUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1570710891163' },
            linkUrl: { type: 'string', example: 'https://hamzarmb.com/air-cargo' },
            targetScreen: { type: 'string', example: 'air_freight' },
            displayOrder: { type: 'number', example: 1 },
            isActive: { type: 'boolean', example: true },
          },
        },
        Facility: {
          type: 'object',
          description: 'Warehouse facility location details',
          properties: {
            id: { type: 'string', example: 'fac-101' },
            name: { type: 'string', example: 'Guangzhou Main Intake Warehouse' },
            code: { type: 'string', example: 'CAN-01' },
            country: { type: 'string', example: 'China' },
            city: { type: 'string', example: 'Guangzhou' },
            address: { type: 'string', example: 'Baiyun District, Logistics Park B' },
            contactName: { type: 'string', example: 'Chen Wei' },
            contactPhone: { type: 'string', example: '+8613800138000' },
            type: { type: 'string', enum: ['warehouse', 'hub', 'office'], example: 'warehouse' },
            isActive: { type: 'boolean', example: true },
          },
        },
        Notification: {
          type: 'object',
          description: 'User in-app alert notification',
          properties: {
            id: { type: 'string', example: 'ntf-901' },
            userId: { type: 'string', example: 'usr-1002' },
            title: { type: 'string', example: 'Package Received in Guangzhou' },
            message: { type: 'string', example: 'Package SF10928374 has arrived at China intake hub.' },
            type: { type: 'string', example: 'shipment_update' },
            isRead: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PermissionGroup: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'grp-01' },
            name: { type: 'string', example: 'Warehouse Operations' },
            description: { type: 'string', example: 'Access to package intake, scanning, and batching' },
            isSystemDefault: { type: 'boolean', example: false },
            permissions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Permission' },
            },
          },
        },
        Permission: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prm-101' },
            groupId: { type: 'string', example: 'grp-01' },
            module: { type: 'string', example: 'shipment' },
            canRead: { type: 'boolean', example: true },
            canCreate: { type: 'boolean', example: true },
            canUpdate: { type: 'boolean', example: true },
            canDelete: { type: 'boolean', example: false },
            canApprove: { type: 'boolean', example: false },
          },
        },
        SupportTicket: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'tkt-801' },
            ticketNumber: { type: 'string', example: 'TCK-20260816-102' },
            userId: { type: 'string', example: 'usr-1002' },
            subject: { type: 'string', example: 'Inquiry regarding package delay' },
            category: { type: 'string', example: 'shipment' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'open' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
            description: { type: 'string', example: 'Package status has not updated in 3 days.' },
            imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'msg-01' },
                  senderRole: { type: 'string', example: 'customer' },
                  senderName: { type: 'string', example: 'Hamza RMB' },
                  message: { type: 'string', example: 'Thank you for your update.' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // ─── PUBLIC METADATA & PRICING (FOR MOBILE / CLIENT APPS) ───────────────
      '/banners': {
        get: {
          tags: ['Public Metadata & Pricing'],
          summary: 'Fetch active home screen sliding banners for mobile apps',
          description: 'Public endpoint consumed by mobile apps to render promotional sliding banners on the home screen carousel.',
          security: [],
          responses: {
            200: {
              description: 'List of active sliding banners ordered by displayOrder',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Banner' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Sliding Banners Management'],
          summary: 'Admin create a new promotional sliding banner',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', example: 'Special Cargo Discount' },
                    subtitle: { type: 'string', example: 'Get 10% off Air freight' },
                    linkUrl: { type: 'string', example: 'https://hamzarmb.com' },
                    targetScreen: { type: 'string', example: 'air_freight' },
                    displayOrder: { type: 'number', example: 1 },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Banner created successfully' } },
        },
      },
      '/banners/admin': {
        get: {
          tags: ['Sliding Banners Management'],
          summary: 'Admin list all sliding banners (active and inactive)',
          responses: {
            200: {
              description: 'Array of all banner objects',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Banner' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/banners/{id}': {
        put: {
          tags: ['Sliding Banners Management'],
          summary: 'Admin update an existing banner',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated Air Freight Special' },
                    subtitle: { type: 'string', example: 'Save big on express air shipments' },
                    linkUrl: { type: 'string' },
                    targetScreen: { type: 'string' },
                    displayOrder: { type: 'number' },
                    isActive: { type: 'boolean' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Banner updated successfully' } },
        },
        delete: {
          tags: ['Sliding Banners Management'],
          summary: 'Admin delete a banner',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Banner deleted successfully' } },
        },
      },
      '/settings': {
        get: {
          tags: ['Public Metadata & Pricing'],
          summary: 'Fetch global system metadata, freight rates, exchange rates & escrow details',
          description: 'Public endpoint consumed by mobile apps to display live exchange rates, Air/Sea freight prices, procurement fee percentages, and bank deposit accounts.',
          security: [],
          responses: {
            200: {
              description: 'Global system settings and live rates object',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/SystemSettings' },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['System Metadata & Options'],
          summary: 'Admin update global freight rates, exchange rates, and minimum thresholds (minAirFreightKg, minSeaFreightCbm)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    airFreightRatePerKg: { type: 'number', example: 12500 },
                    seaFreightRatePerCbm: { type: 'number', example: 450000 },
                    seaFreightRatePerKg: { type: 'number', example: 3500 },
                    minAirFreightKg: { type: 'number', example: 1.0 },
                    minSeaFreightCbm: { type: 'number', example: 0.1 },
                    cnyExchangeRate: { type: 'number', example: 215.0 },
                    usdExchangeRate: { type: 'number', example: 1550.0 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Platform settings updated' },
          },
        },
      },
      '/delivery/vehicles': {
        get: {
          tags: ['Public Metadata & Pricing'],
          summary: 'Fetch active doorstep delivery vehicle fleet & per-kilometer rates',
          description: 'Public endpoint consumed by mobile apps to display dispatch vehicle options, base pickup fares, and per-kilometer rates.',
          security: [],
          responses: {
            200: {
              description: 'Array of active delivery vehicles with per-km rates',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DeliveryVehicle' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/delivery/admin/vehicles': {
        get: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Admin list all delivery vehicle types',
          responses: { 200: { description: 'List of all delivery vehicles' } },
        },
        post: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Admin create delivery vehicle option',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'type', 'baseFare', 'perKmRate'],
                  properties: {
                    name: { type: 'string', example: 'Motorbike Dispatch' },
                    type: { type: 'string', example: 'motorbike' },
                    baseFare: { type: 'number', example: 1000 },
                    perKmRate: { type: 'number', example: 150 },
                    maxWeightKg: { type: 'number', example: 15 },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Vehicle created' } },
        },
      },
      '/delivery/admin/vehicles/{id}': {
        put: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Admin update delivery vehicle option',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Vehicle updated' } },
        },
        delete: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Admin delete delivery vehicle option',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Vehicle deleted' } },
        },
      },

      // ─── AUTHENTICATION & USER PROFILE ─────────────────────────────────────
      '/auth/setup-super-admin': {
        post: {
          tags: ['Authentication'],
          summary: 'One-time initial Super Admin setup endpoint',
          description: 'Onboards the first Super Admin account immediately after deployment. Accessible ONLY when 0 Super Admin accounts exist in DB.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password', 'phone'],
                  properties: {
                    firstName: { type: 'string', example: 'Hamza' },
                    lastName: { type: 'string', example: 'Admin' },
                    email: { type: 'string', example: 'admin@hamzarmb.com' },
                    password: { type: 'string', example: 'SecurePassword123!' },
                    phone: { type: 'string', example: '+2348012345678' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Super Admin onboarded successfully & token issued' },
            403: { description: 'Initialization locked: Super Admin already exists' },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new customer account',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password', 'phone'],
                  properties: {
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john.doe@example.com' },
                    password: { type: 'string', example: 'Password123!' },
                    phone: { type: 'string', example: '+2348012345678' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful' },
            400: { description: 'Validation or duplicate email error' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate customer or staff member',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@hamzarmb.com' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/check-availability': {
        post: {
          tags: ['Authentication'],
          summary: 'Check if email or phone number is already registered',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    phone: { type: 'string', example: '+2348012345678' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Availability check result' },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify email registration OTP code (stored in Redis cache)',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    otp: { type: 'string', example: '123456' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'OTP verified successfully' } },
        },
      },
      '/auth/set-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Set password & push pending registration from Redis cache to database',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Password set and account created in database' } },
        },
      },
      '/auth/resend-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Resend email registration OTP code',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string', example: 'user@example.com' } },
                },
              },
            },
          },
          responses: { 200: { description: 'New OTP dispatched to email' } },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset OTP code',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string', example: 'user@example.com' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Reset OTP sent to email' } },
        },
      },
      '/auth/verify-reset-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify password reset OTP code',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    otp: { type: 'string', example: '654321' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Reset OTP verified' } },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset account password with OTP token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp', 'newPassword'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    otp: { type: 'string', example: '654321' },
                    newPassword: { type: 'string', example: 'NewPassword123!' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Password reset successful' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user profile',
          responses: { 200: { description: 'User profile object' } },
        },
      },
      '/auth/profile': {
        patch: {
          tags: ['Authentication'],
          summary: 'Update user profile info or avatar photo',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string', example: 'Hamza' },
                    lastName: { type: 'string', example: 'RMB' },
                    phone: { type: 'string', example: '+2348099999999' },
                    photo: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },
      '/auth/push-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Register FCM / Expo push notification device token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['pushToken'],
                  properties: {
                    pushToken: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxx]' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Push token updated' } },
        },
      },
      '/auth/change-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Change password for logged in user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string', example: 'OldPassword123!' },
                    newPassword: { type: 'string', example: 'NewSecurePassword123!' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Password changed successfully' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout user session',
          responses: { 200: { description: 'Logged out successfully' } },
        },
      },

      // ─── SHIPMENTS & WAREHOUSE ───────────────────────────────────────────
      '/shipments/pre-alert': {
        post: {
          tags: ['Shipments & Warehouse'],
          summary: 'Submit customer package pre-alert',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'courierName'],
                  properties: {
                    trackingNumber: { type: 'string', example: 'SF10928374' },
                    courierName: { type: 'string', example: 'SF Express' },
                    declaredValueUsd: { type: 'number', example: 150 },
                    itemDescription: { type: 'string', example: 'Designer Handbags' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Pre-alert created' } },
        },
      },
      '/shipments/packages': {
        get: {
          tags: ['Shipments & Warehouse'],
          summary: 'List user or warehouse packages',
          responses: { 200: { description: 'List of package objects' } },
        },
      },
      '/shipments/packages/admin': {
        post: {
          tags: ['Shipments & Warehouse'],
          summary: 'Admin create package on behalf of customer',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'customerId', 'courierName'],
                  properties: {
                    trackingNumber: { type: 'string', example: 'SF10928374' },
                    customerId: { type: 'string', example: 'HZ-20260816-9012' },
                    courierName: { type: 'string', example: 'ZTO Express' },
                    weightKg: { type: 'number', example: 5.2 },
                    cbm: { type: 'number', example: 0.03 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Package created by admin' } },
        },
      },
      '/shipments/packages/{id}/status': {
        patch: {
          tags: ['Shipments & Warehouse'],
          summary: 'Admin update package status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', example: 'received_cn' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Package status updated' } },
        },
      },
      '/shipments/packages/{id}/scan': {
        patch: {
          tags: ['Shipments & Warehouse'],
          summary: 'Intake scan package at China warehouse hub (weight, cbm, photos)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['weightKg', 'cbm'],
                  properties: {
                    weightKg: { type: 'number', example: 4.5 },
                    cbm: { type: 'number', example: 0.024 },
                    photos: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Package intake scan recorded' } },
        },
      },
      '/shipments/consolidations': {
        post: {
          tags: ['Shipments & Warehouse'],
          summary: 'Create package consolidation request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['packageIds', 'shippingMethod', 'destinationWarehouse', 'paymentMethod'],
                  properties: {
                    packageIds: { type: 'array', items: { type: 'string' }, example: ['pkg-1', 'pkg-2'] },
                    shippingMethod: { type: 'string', enum: ['air', 'sea', 'express'], example: 'air' },
                    destinationWarehouse: { type: 'string', example: 'lagos' },
                    paymentMethod: { type: 'string', enum: ['wallet', 'cash_on_delivery'], example: 'wallet' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Consolidation created' } },
        },
        get: {
          tags: ['Shipments & Warehouse'],
          summary: 'List consolidation shipments',
          responses: { 200: { description: 'Consolidation list' } },
        },
      },
      '/shipments/consolidations/{id}': {
        put: {
          tags: ['Shipments & Warehouse'],
          summary: 'Update consolidation shipment status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'batched' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Consolidation updated' } },
        },
      },
      '/shipments/batches': {
        post: {
          tags: ['Shipments & Warehouse'],
          summary: 'Build Master Shipping Batch (Air/Sea)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['carrierName', 'flightVoyageNo', 'shippingType'],
                  properties: {
                    masterTrackingId: { type: 'string', example: 'HZ-BATCH-AIR-20260816-102' },
                    carrierName: { type: 'string', example: 'Ethiopian Cargo' },
                    flightVoyageNo: { type: 'string', example: 'ET-3801' },
                    shippingType: { type: 'string', enum: ['air', 'sea', 'express'], example: 'air' },
                    consolidationIds: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Master batch created' } },
        },
        get: {
          tags: ['Shipments & Warehouse'],
          summary: 'List Master Batches',
          responses: { 200: { description: 'List of master batches' } },
        },
      },
      '/shipments/batches/{id}/packages': {
        patch: {
          tags: ['Shipments & Warehouse'],
          summary: 'Attach additional consolidations to a Master Batch',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['consolidationIds'],
                  properties: {
                    consolidationIds: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Consolidations added to batch' } },
        },
      },
      '/shipments/batches/{id}/status': {
        patch: {
          tags: ['Shipments & Warehouse'],
          summary: 'Update Master Batch tracking status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', example: 'in_transit' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Batch status updated' } },
        },
      },
      '/shipments/tracking/{id}': {
        get: {
          tags: ['Shipments & Warehouse'],
          summary: 'Public track and trace by tracking number or batch ID',
          security: [],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'HZ-CN-90812' },
          ],
          responses: { 200: { description: 'Shipment timeline details' } },
        },
      },

      // ─── BUY-FOR-ME PROCUREMENT ──────────────────────────────────────────
      '/procurements/request': {
        post: {
          tags: ['Buy-For-Me Procurement'],
          summary: 'Submit 1688 / Taobao Buy-For-Me procurement request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productUrl', 'quantity', 'specifications'],
                  properties: {
                    productUrl: { type: 'string', example: 'https://detail.1688.com/offer/67123912.html' },
                    quantity: { type: 'number', example: 50 },
                    specifications: { type: 'string', example: 'Size XL, Black' },
                    notes: { type: 'string', example: 'Please confirm stock' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Procurement request created' } },
        },
      },
      '/procurements/requests': {
        get: {
          tags: ['Buy-For-Me Procurement'],
          summary: 'List procurement requests',
          responses: { 200: { description: 'Procurement request list' } },
        },
      },
      '/procurements/requests/{id}/quote': {
        post: {
          tags: ['Buy-For-Me Procurement'],
          summary: 'Admin issue quote for procurement request',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productCostRmb', 'serviceFeeRmb', 'supplierName'],
                  properties: {
                    productCostRmb: { type: 'number', example: 1200 },
                    serviceFeeRmb: { type: 'number', example: 100 },
                    supplierName: { type: 'string', example: 'Foshan Factory Direct' },
                    exchangeRateUsed: { type: 'number', example: 215 },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Quote issued' } },
        },
      },
      '/procurements/requests/{id}/approve': {
        post: {
          tags: ['Buy-For-Me Procurement'],
          summary: 'Customer approve procurement quote and deduct wallet funds',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Procurement request approved and paid' } },
        },
      },
      '/procurements/requests/{id}/status': {
        patch: {
          tags: ['Buy-For-Me Procurement'],
          summary: 'Admin update procurement request status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['submitted', 'under_review', 'quoted', 'approved', 'purchasing', 'shipped_to_wh', 'received_at_wh', 'cancelled', 'rejected'],
                      example: 'purchased',
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
      },

      // ─── RMB CURRENCY EXCHANGE ───────────────────────────────────────────
      '/exchanges/rate': {
        get: {
          tags: ['RMB Currency Exchange'],
          summary: 'Get current active RMB exchange rate',
          security: [],
          responses: { 200: { description: 'Active exchange rate object' } },
        },
        patch: {
          tags: ['RMB Currency Exchange'],
          summary: 'Admin update active RMB exchange rate',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['buyRate', 'sellRate', 'platformRate'],
                  properties: {
                    buyRate: { type: 'number', example: 213 },
                    sellRate: { type: 'number', example: 217 },
                    platformRate: { type: 'number', example: 215 },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Exchange rate updated' } },
        },
      },
      '/exchanges/saved-accounts': {
        get: {
          tags: ['RMB Currency Exchange'],
          summary: 'List user saved RMB recipient accounts (Alipay, WeChat Pay, Chinese Bank)',
          responses: {
            200: {
              description: 'List of saved RMB accounts',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SavedExchangeAccount' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['RMB Currency Exchange'],
          summary: 'Save a new RMB recipient account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['accountType', 'accountNumber', 'accountName'],
                  properties: {
                    accountType: { type: 'string', enum: ['alipay', 'wechat_pay', 'chinese_bank'], example: 'alipay' },
                    accountNumber: { type: 'string', example: 'supplier@alipay.cn' },
                    accountName: { type: 'string', example: 'Guangzhou Trading Co' },
                    bankName: { type: 'string', example: 'Bank of China' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Account saved' } },
        },
      },
      '/exchanges/saved-accounts/{id}': {
        delete: {
          tags: ['RMB Currency Exchange'],
          summary: 'Delete a saved RMB account',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Account deleted' } },
        },
      },
      '/exchanges/saved-accounts/{id}/default': {
        patch: {
          tags: ['RMB Currency Exchange'],
          summary: 'Set a saved RMB account as default',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Default account updated' } },
        },
      },
      '/exchanges/request': {
        post: {
          tags: ['RMB Currency Exchange'],
          summary: 'Submit RMB currency exchange request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amountNaira', 'rmbDestType', 'rmbDestAccount', 'rmbDestName'],
                  properties: {
                    amountNaira: { type: 'number', example: 500000 },
                    direction: { type: 'string', enum: ['ngn_to_rmb', 'rmb_to_ngn'], example: 'ngn_to_rmb' },
                    rmbDestType: { type: 'string', enum: ['alipay', 'wechat_pay', 'chinese_bank'], example: 'alipay' },
                    rmbDestAccount: { type: 'string', example: 'supplier@alipay.cn' },
                    rmbDestName: { type: 'string', example: 'Guangzhou Trading Co' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Exchange request created' } },
        },
      },
      '/exchanges/requests': {
        get: {
          tags: ['RMB Currency Exchange'],
          summary: 'List currency exchange requests',
          responses: { 200: { description: 'List of exchange requests' } },
        },
      },
      '/exchanges/requests/{id}/verify-naira': {
        post: {
          tags: ['RMB Currency Exchange'],
          summary: 'Admin verify Naira escrow payment deposit',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Naira confirmed' } },
        },
      },
      '/exchanges/requests/{id}/release-rmb': {
        post: {
          tags: ['RMB Currency Exchange'],
          summary: 'Admin mark RMB released to supplier',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Exchange request completed' } },
        },
      },
      '/exchanges/requests/{id}/reject': {
        patch: {
          tags: ['RMB Currency Exchange'],
          summary: 'Admin reject currency exchange request',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { reason: { type: 'string', example: 'Invalid proof of payment' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Exchange request rejected' } },
        },
      },
      '/exchanges/{id}/receipt': {
        post: {
          tags: ['RMB Currency Exchange'],
          summary: 'Upload bank transfer receipt proof for exchange request',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['receipt'],
                  properties: { receipt: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Receipt uploaded' } },
        },
      },

      // ─── WALLET & BILLING ────────────────────────────────────────────────
      '/wallet': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'Get customer wallet balance and details',
          responses: { 200: { description: 'Wallet balance object' } },
        },
      },
      '/wallet/transactions': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'List wallet transaction history',
          responses: { 200: { description: 'Transaction ledger entries' } },
        },
      },
      '/wallet/deposit': {
        post: {
          tags: ['Wallet & Billing'],
          summary: 'Submit manual bank transfer deposit with payment receipt',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['amount'],
                  properties: {
                    amount: { type: 'number', example: 250000 },
                    paymentMethod: { type: 'string', example: 'bank_transfer' },
                    notes: { type: 'string', example: 'GTB Transfer Ref: 9912048' },
                    receipt: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Deposit submitted for approval' } },
        },
      },
      '/wallet/deposits': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'List customer submitted wallet deposit requests',
          responses: { 200: { description: 'List of customer deposits' } },
        },
      },
      '/wallet/admin/deposits': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'Admin list all pending and processed customer deposits',
          responses: { 200: { description: 'List of all system deposits' } },
        },
      },
      '/wallet/admin/deposits/{id}/approve': {
        post: {
          tags: ['Wallet & Billing'],
          summary: 'Admin approve deposit and credit customer wallet',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deposit approved and wallet credited' } },
        },
      },
      '/wallet/admin/deposits/{id}/reject': {
        post: {
          tags: ['Wallet & Billing'],
          summary: 'Admin reject customer deposit submission',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { reason: { type: 'string', example: 'Receipt could not be verified' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Deposit rejected' } },
        },
      },

      // ─── LOCAL DELIVERY & DISPATCH ───────────────────────────────────────
      '/delivery/request': {
        post: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Request doorstep delivery in Nigeria',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['deliveryAddress', 'recipientName', 'recipientPhone'],
                  properties: {
                    consolidationId: { type: 'string', example: 'CON-10021' },
                    deliveryAddress: { type: 'string', example: '12 Lekki Phase 1, Lagos' },
                    recipientName: { type: 'string', example: 'Bayo Adebayo' },
                    recipientPhone: { type: 'string', example: '+2348011112222' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Delivery request created with 4-digit pickup PIN' } },
        },
      },
      '/delivery/deliveries': {
        get: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'List local deliveries',
          responses: { 200: { description: 'List of local deliveries' } },
        },
      },
      '/delivery/deliveries/{id}/dispatch': {
        patch: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Dispatch delivery task to driver',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['driverName', 'driverPhone'],
                  properties: {
                    driverName: { type: 'string', example: 'Musa Driver' },
                    driverPhone: { type: 'string', example: '+2348033334444' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Delivery assigned to driver' } },
        },
      },
      '/delivery/deliveries/{id}/status': {
        patch: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Update delivery status (in_transit, delivered, cancelled)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', example: 'in_transit' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Delivery status updated' } },
        },
      },
      '/delivery/deliveries/{id}/verify-pin': {
        post: {
          tags: ['Local Delivery & Dispatch'],
          summary: 'Driver verify 4-digit customer pickup PIN',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['pickupPin'],
                  properties: { pickupPin: { type: 'string', example: '4891' } },
                },
              },
            },
          },
          responses: { 200: { description: 'PIN verified & delivery marked completed' } },
        },
      },

      // ─── NOTIFICATIONS ───────────────────────────────────────────────────
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Fetch user notification feed',
          responses: {
            200: {
              description: 'Array of notifications',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Notification' },
                  },
                },
              },
            },
          },
        },
      },
      '/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all unread notifications as read',
          responses: { 200: { description: 'All notifications marked as read' } },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark specific notification as read',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Notification marked read' } },
        },
      },

      // ─── ADMIN & STAFF MANAGEMENT ────────────────────────────────────────
      '/admin/stats': {
        get: {
          tags: ['Staff & System Admin'],
          summary: 'Get admin dashboard system overview metrics',
          responses: { 200: { description: 'Dashboard stats object' } },
        },
      },
      '/admin/users': {
        get: {
          tags: ['Staff & System Admin'],
          summary: 'List all system users and staff accounts',
          responses: { 200: { description: 'List of user objects' } },
        },
      },
      '/admin/staff': {
        post: {
          tags: ['Staff & System Admin'],
          summary: 'Super Admin onboard new staff member',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'role', 'password'],
                  properties: {
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'jane.doe@logicore.com' },
                    phone: { type: 'string', example: '+2348012345678' },
                    role: {
                      type: 'string',
                      enum: ['customer', 'super_admin', 'admin', 'warehouse_cn', 'warehouse_ng', 'procurement', 'finance', 'clearance_agent', 'driver'],
                      example: 'warehouse_cn',
                    },
                    password: { type: 'string', example: 'Logistics2026!' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Staff account onboarded successfully' } },
        },
      },
      '/admin/users/{id}': {
        patch: {
          tags: ['Staff & System Admin'],
          summary: 'Update user profile, status, or role permissions',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    role: { type: 'string', example: 'finance' },
                    isVerified: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'User updated' } },
        },
        delete: {
          tags: ['Staff & System Admin'],
          summary: 'Super Admin remove staff member account',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User account removed' } },
        },
      },
      '/admin/activity-logs': {
        get: {
          tags: ['Staff & System Admin'],
          summary: 'Fetch system audit trail & activity logs',
          parameters: [
            { name: 'module', in: 'query', schema: { type: 'string' }, example: 'warehouse' },
            { name: 'search', in: 'query', schema: { type: 'string' }, example: 'Hamza' },
          ],
          responses: { 200: { description: 'Activity logs list' } },
        },
      },

      // ─── ROLE-BASED PERMISSIONS & PERMISSION GROUPS ───────────────────────
      '/permission-groups': {
        get: {
          tags: ['Permissions & Roles'],
          summary: 'List all custom permission groups and matrix rules',
          responses: {
            200: {
              description: 'Array of permission groups',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PermissionGroup' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Permissions & Roles'],
          summary: 'Create a new permission group',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Clearance Agents' },
                    description: { type: 'string', example: 'Customs clearance permission group' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Permission group created' } },
        },
      },
      '/permission-groups/{groupId}': {
        get: {
          tags: ['Permissions & Roles'],
          summary: 'Get permission group details by ID',
          parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Permission group details' } },
        },
        patch: {
          tags: ['Permissions & Roles'],
          summary: 'Update permission group title or description',
          parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Group updated' } },
        },
        delete: {
          tags: ['Permissions & Roles'],
          summary: 'Delete permission group',
          parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Group deleted' } },
        },
      },
      '/permission-groups/{groupId}/permissions': {
        get: {
          tags: ['Permissions & Roles'],
          summary: 'List permissions for a group',
          parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of module permissions' } },
        },
        post: {
          tags: ['Permissions & Roles'],
          summary: 'Create or add module permission to group',
          parameters: [{ name: 'groupId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['module'],
                  properties: {
                    module: { type: 'string', example: 'shipment' },
                    canRead: { type: 'boolean', example: true },
                    canCreate: { type: 'boolean', example: true },
                    canUpdate: { type: 'boolean', example: true },
                    canDelete: { type: 'boolean', example: false },
                    canApprove: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Permission created' } },
        },
      },
      '/permissions/{permissionId}': {
        patch: {
          tags: ['Permissions & Roles'],
          summary: 'Update individual permission module flags',
          parameters: [{ name: 'permissionId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    canRead: { type: 'boolean' },
                    canCreate: { type: 'boolean' },
                    canUpdate: { type: 'boolean' },
                    canDelete: { type: 'boolean' },
                    canApprove: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Permission rule updated' } },
        },
        delete: {
          tags: ['Permissions & Roles'],
          summary: 'Remove permission rule',
          parameters: [{ name: 'permissionId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Permission rule deleted' } },
        },
      },

      // ─── WAREHOUSE FACILITIES ────────────────────────────────────────────
      '/facilities': {
        get: {
          tags: ['Warehouse Facilities'],
          summary: 'List all origin & destination warehouse facilities (Public)',
          description: 'Public endpoint to fetch warehouse facilities, optionally filtered by country code or name (e.g. CN, NG, China, Nigeria).',
          security: [],
          parameters: [
            {
              name: 'country',
              in: 'query',
              required: false,
              description: 'Filter facilities by country code or name (e.g., CN, NG, China, Nigeria)',
              schema: { type: 'string', example: 'CN' },
            },
          ],
          responses: {
            200: {
              description: 'Array of facility objects',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Facility' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Warehouse Facilities'],
          summary: 'Admin add new warehouse facility',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'code', 'country', 'city', 'address'],
                  properties: {
                    name: { type: 'string', example: 'Guangzhou Main Intake Hub' },
                    code: { type: 'string', example: 'CAN-01' },
                    country: { type: 'string', example: 'China' },
                    city: { type: 'string', example: 'Guangzhou' },
                    address: { type: 'string', example: 'Baiyun District Logistics Park' },
                    contactName: { type: 'string', example: 'Mr. Zhang' },
                    contactPhone: { type: 'string', example: '+8613800000000' },
                    type: { type: 'string', example: 'warehouse' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Facility created' } },
        },
      },
      '/facilities/{id}': {
        get: {
          tags: ['Warehouse Facilities'],
          summary: 'Get facility details by ID (Public)',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Facility details' } },
        },
        put: {
          tags: ['Warehouse Facilities'],
          summary: 'Admin update facility information',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Facility updated' } },
        },
        delete: {
          tags: ['Warehouse Facilities'],
          summary: 'Admin delete facility',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Facility deleted' } },
        },
      },

      // ─── SUPPORT TICKETS & CHATBOT ───────────────────────────────────────
      '/support/tickets': {
        post: {
          tags: ['Support Tickets'],
          summary: 'Create support ticket',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['subject', 'category'],
                  properties: {
                    subject: { type: 'string', example: 'Delay on package SF10928' },
                    category: {
                      type: 'string',
                      enum: ['shipment', 'payment', 'exchange', 'procurement', 'delivery', 'account', 'other'],
                      example: 'shipment',
                    },
                    description: { type: 'string', example: 'Package has been at China hub for 3 days' },
                    message: { type: 'string', example: 'Package has been at China hub for 3 days' },
                    imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
                    attachments: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
                    },
                    referenceId: { type: 'string', example: 'PKG-10029' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Support ticket created' } },
        },
        get: {
          tags: ['Support Tickets'],
          summary: 'List support tickets',
          responses: { 200: { description: 'List of tickets' } },
        },
      },
      '/support/tickets/{id}': {
        get: {
          tags: ['Support Tickets'],
          summary: 'Get ticket details with thread messages',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Ticket object with messages array' } },
        },
      },
      '/support/tickets/{id}/reply': {
        post: {
          tags: ['Support Tickets'],
          summary: 'Reply to support ticket thread',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: { message: { type: 'string', example: 'Your package is scheduled for departure tomorrow morning.' } },
                },
              },
            },
          },
          responses: { 201: { description: 'Reply message sent' } },
        },
      },
      '/support/tickets/{id}/status': {
        patch: {
          tags: ['Support Tickets'],
          summary: 'Admin update support ticket status (open, in_progress, resolved, closed)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'resolved' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Ticket status updated' } },
        },
      },
      '/chat/chat': {
        post: {
          tags: ['AI Assistant Aisha Chatbot'],
          summary: 'Interact with AI Support Assistant Aisha',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: { type: 'string', example: 'What is your air cargo rate per kg?' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'AI response text from Aisha',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      response: { type: 'string', example: 'Our Air Freight rate is currently ₦12,500/kg with a minimum threshold of 1.0kg.' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ─── UPLOADS ─────────────────────────────────────────────────────────
      '/upload': {
        post: {
          tags: ['File Uploads'],
          summary: 'Upload image or document file to Cloudinary storage',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Cloudinary image URL returned' } },
        },
      },

      // ─── SYSTEM METADATA & OPTIONS ───────────────────────────────────────
      '/meta/options': {
        get: {
          tags: ['System Metadata & Options'],
          summary: 'Get all valid status enums, categories, roles, and configuration options',
          security: [],
          responses: {
            200: {
              description: 'Dictionary of all system categories, statuses, priorities, vehicle types, and roles',
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
