import axios, { AxiosInstance } from 'axios';

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerReference: string;
}

interface BkashRefundResponse {
  refundTrxID: string;
  transactionStatus: string;
  originalTrxID: string;
  completedTime: string;
  currency: string;
  amount: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAxiosInstance = (): AxiosInstance =>
  axios.create({
    baseURL: process.env.BKASH_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

export const getToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const client = getAxiosInstance();
  const response = await client.post<BkashTokenResponse>(
    '/tokenized/checkout/token/grant',
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    }
  );

  cachedToken = response.data.id_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  return cachedToken;
};

export const createPayment = async (
  amount: number,
  invoiceNumber: string
): Promise<BkashCreatePaymentResponse> => {
  const token = await getToken();
  const client = getAxiosInstance();

  const response = await client.post<BkashCreatePaymentResponse>(
    '/tokenized/checkout/create',
    {
      mode: '0011',
      payerReference: invoiceNumber,
      callbackURL: `${process.env.FRONTEND_URL}/payment/callback`,
      amount: amount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNumber,
    },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return response.data;
};

export const verifyPayment = async (
  paymentID: string
): Promise<BkashExecutePaymentResponse> => {
  const token = await getToken();
  const client = getAxiosInstance();

  const response = await client.post<BkashExecutePaymentResponse>(
    '/tokenized/checkout/execute',
    { paymentID },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return response.data;
};

export const refundPayment = async (
  paymentID: string,
  trxID: string,
  amount: number
): Promise<BkashRefundResponse> => {
  const token = await getToken();
  const client = getAxiosInstance();

  const response = await client.post<BkashRefundResponse>(
    '/tokenized/checkout/payment/refund',
    {
      paymentID,
      trxID,
      amount: amount.toFixed(2),
      currency: 'BDT',
      reason: 'Customer request',
    },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY,
      },
    }
  );

  return response.data;
};
