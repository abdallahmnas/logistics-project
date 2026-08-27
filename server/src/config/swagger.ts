import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Logicore / Hamza RMB Logistics & Mobile API',
      version: '1.0.0',
      description: `
Exhaustive OpenAPI 3.0 REST API documentation for **Logicore Logistics & RMB Exchange**.

This specification provides mobile application developers (React Native, Flutter, Swift, Kotlin) with complete request body schemas, parameters, responses, and Bearer authentication headers.

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
          description: 'Provide JWT token generated from /auth/login or /auth/register',
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
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // ─── AUTH ─────────────────────────────────────────────────────────────
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
      '/auth/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify email registration OTP code',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['otp'],
                  properties: { otp: { type: 'string', example: '123456' } },
                },
              },
            },
          },
          responses: { 200: { description: 'OTP verified successfully' } },
        },
      },
      '/auth/resend-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Resend email registration OTP code',
          responses: { 200: { description: 'New OTP dispatched to email' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user profile',
          responses: { 200: { description: 'User profile object' } },
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
      '/shipments/packages/scan': {
        post: {
          tags: ['Shipments & Warehouse'],
          summary: 'Scan package at warehouse intake (China Hub)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['packageId', 'weightKg', 'cbm'],
                  properties: {
                    packageId: { type: 'string', example: 'pkg-10029' },
                    weightKg: { type: 'number', example: 4.5 },
                    cbm: { type: 'number', example: 0.024 },
                    length: { type: 'number', example: 30 },
                    width: { type: 'number', example: 20 },
                    height: { type: 'number', example: 40 },
                    photos: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Package intake status updated to received_cn' } },
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
                    shippingMethod: { type: 'string', example: 'air' },
                    destinationWarehouse: { type: 'string', example: 'lagos' },
                    paymentMethod: { type: 'string', example: 'wallet' },
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
                    shippingType: { type: 'string', example: 'air' },
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
                  properties: { status: { type: 'string', example: 'purchased' } },
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
                    rmbDestType: { type: 'string', example: 'alipay' },
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

      // ─── WALLET & BILLING ────────────────────────────────────────────────
      '/wallet': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'Get customer wallet balance and details',
          responses: { 200: { description: 'Wallet balance object' } },
        },
      },
      '/wallet/topup': {
        post: {
          tags: ['Wallet & Billing'],
          summary: 'Top up wallet balance',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amount', 'paymentMethod'],
                  properties: {
                    amount: { type: 'number', example: 100000 },
                    paymentMethod: { type: 'string', example: 'card' },
                    reference: { type: 'string', example: 'PAY-891234' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Wallet credited successfully' } },
        },
      },
      '/wallet/transactions': {
        get: {
          tags: ['Wallet & Billing'],
          summary: 'List wallet transaction history',
          responses: { 200: { description: 'Transaction ledger entries' } },
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
                    role: { type: 'string', example: 'warehouse_cn' },
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

      // ─── SUPPORT TICKETS ─────────────────────────────────────────────────
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
                  required: ['subject', 'category', 'description'],
                  properties: {
                    subject: { type: 'string', example: 'Delay on package SF10928' },
                    category: { type: 'string', example: 'shipping' },
                    description: { type: 'string', example: 'Package has been at China hub for 3 days' },
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
      '/support/tickets/{id}/messages': {
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

      // ─── UPLOADS ─────────────────────────────────────────────────────────
      '/upload': {
        post: {
          tags: ['File Uploads'],
          summary: 'Upload image file to Cloudinary storage',
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
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
