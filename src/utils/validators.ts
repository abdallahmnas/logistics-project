import * as Yup from 'yup';

// ─── Auth Validators ──────────────────────────────────────

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const step1RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^(\+?234|0)?[789]\d{9}$/, 'Please enter a valid phone number (e.g. 080... or 80...)')
    .required('Phone number is required'),
});

export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^(\+?234|0)?[789]\d{9}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// ─── Shipment Validators ──────────────────────────────────

export const preAlertSchema = Yup.object().shape({
  chineseTrackingNo: Yup.string()
    .min(5, 'Tracking number seems too short')
    .max(50, 'Tracking number seems too long')
    .required('Chinese tracking number is required'),
  supplierName: Yup.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .required('Supplier name is required'),
  description: Yup.string()
    .min(5, 'Please provide a brief description of the items')
    .max(500, 'Description must not exceed 500 characters')
    .required('Item description is required'),
  estimatedItems: Yup.number()
    .min(1, 'Must be at least 1 item')
    .max(1000, 'Please contact support for bulk shipments')
    .nullable(),
  notes: Yup.string().max(500, 'Notes must not exceed 500 characters').nullable(),
});

// ─── Procurement Validators ───────────────────────────────

export const buyForMeSchema = Yup.object().shape({
  productUrl: Yup.string()
    .url('Please enter a valid product URL')
    .required('Product link is required'),
  quantity: Yup.number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Please contact support for large orders')
    .required('Quantity is required'),
  specifications: Yup.string()
    .min(10, 'Please provide detailed specifications')
    .max(2000, 'Specifications must not exceed 2000 characters')
    .required('Specifications are required'),
  sizes: Yup.string().max(200, 'Size info must not exceed 200 characters').nullable(),
  colors: Yup.string().max(200, 'Color info must not exceed 200 characters').nullable(),
  variations: Yup.string().max(500, 'Variations must not exceed 500 characters').nullable(),
  notes: Yup.string().max(1000, 'Notes must not exceed 1000 characters').nullable(),
});

// ─── Exchange Validators ──────────────────────────────────

export const exchangeRequestSchema = Yup.object().shape({
  amountNaira: Yup.number()
    .min(10000, 'Minimum exchange amount is ₦10,000')
    .max(50000000, 'Maximum exchange amount is ₦50,000,000')
    .required('Amount in Naira is required'),
  rmbDestType: Yup.string()
    .oneOf(['alipay', 'wechat_pay', 'chinese_bank'], 'Please select a valid destination')
    .required('RMB destination type is required'),
  rmbDestAccount: Yup.string()
    .min(5, 'Account identifier seems too short')
    .max(50, 'Account identifier seems too long')
    .required('Destination account is required'),
  rmbDestName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .required('Account holder name is required'),
});

// ─── Local Delivery Validators ────────────────────────────

export const localDeliverySchema = Yup.object().shape({
  pickupAddress: Yup.string()
    .min(10, 'Please enter a complete pickup address')
    .max(300, 'Address must not exceed 300 characters')
    .required('Pickup address is required'),
  pickupCity: Yup.string().required('Pickup city is required'),
  pickupPhone: Yup.string()
    .matches(/^(\+234|0)[789]\d{9}$/, 'Please enter a valid Nigerian phone number')
    .required('Pickup phone number is required'),
  pickupContactName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Pickup contact name is required'),
  dropoffAddress: Yup.string()
    .min(10, 'Please enter a complete drop-off address')
    .max(300, 'Address must not exceed 300 characters')
    .required('Drop-off address is required'),
  dropoffCity: Yup.string().required('Drop-off city is required'),
  dropoffPhone: Yup.string()
    .matches(/^(\+234|0)[789]\d{9}$/, 'Please enter a valid Nigerian phone number')
    .required('Drop-off phone number is required'),
  dropoffContactName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Drop-off contact name is required'),
  packageDescription: Yup.string()
    .min(5, 'Please describe the package')
    .max(500, 'Description must not exceed 500 characters')
    .required('Package description is required'),
  vehicleType: Yup.string()
    .oneOf(['motorbike', 'sedan', 'box_truck'], 'Please select a vehicle type')
    .required('Vehicle type is required'),
  paymentMethod: Yup.string()
    .oneOf(['wallet', 'cash_on_delivery'], 'Please select a payment method')
    .required('Payment method is required'),
});

// ─── Admin Validators ─────────────────────────────────────

export const packageScanSchema = Yup.object().shape({
  trackingId: Yup.string().required('Tracking ID is required'),
  weightKg: Yup.number()
    .min(0.01, 'Weight must be greater than 0')
    .max(5000, 'Weight seems too high, please verify')
    .required('Weight is required'),
  length: Yup.number().min(0.1, 'Length must be greater than 0').required('Length is required'),
  width: Yup.number().min(0.1, 'Width must be greater than 0').required('Width is required'),
  height: Yup.number().min(0.1, 'Height must be greater than 0').required('Height is required'),
});

export const procurementQuoteSchema = Yup.object().shape({
  productCostRmb: Yup.number()
    .min(0.01, 'Product cost must be greater than 0')
    .required('Product cost is required'),
  serviceFeeRmb: Yup.number()
    .min(0, 'Service fee cannot be negative')
    .required('Service fee is required'),
  supplierName: Yup.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .required('Supplier name is required'),
});

export const exchangeRateSchema = Yup.object().shape({
  platformRate: Yup.number()
    .min(1, 'Rate must be greater than 0')
    .required('Platform rate is required'),
  buyRate: Yup.number()
    .min(1, 'Rate must be greater than 0')
    .required('Buy rate is required'),
  sellRate: Yup.number()
    .min(1, 'Rate must be greater than 0')
    .required('Sell rate is required'),
});

// ─── Helper: Validate with Yup ───────────────────────────

export const validateField = async (
  schema: Yup.AnySchema,
  field: string,
  value: unknown
): Promise<string | undefined> => {
  try {
    await schema.validateAt(field, { [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return err.message;
    }
    return 'Validation error';
  }
};

export const validateForm = async <T extends object>(
  schema: Yup.ObjectSchema<Yup.AnyObject>,
  values: T
): Promise<Record<string, string>> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((e) => {
        if (e.path) {
          errors[e.path] = e.message;
        }
      });
      return errors;
    }
    return { _form: 'Validation error' };
  }
};
