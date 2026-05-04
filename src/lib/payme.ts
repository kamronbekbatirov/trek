/**
 * Payme Subscribe & Merchant API client for trek.uz
 *
 * Payme uses two APIs:
 * - Subscribe API: card tokenization and direct charging
 * - Merchant API (webhooks): receive payment events from Payme checkout
 *
 * Amounts are in tiyin (1 UZS = 100 tiyin).
 * Pro plan: 79,000 UZS = 7,900,000 tiyin
 */

export const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID ?? "";
export const PAYME_SECRET_KEY = process.env.PAYME_SECRET_KEY ?? "";
export const PAYME_TEST_KEY = process.env.PAYME_TEST_KEY ?? "";
export const IS_TEST_MODE = process.env.PAYME_TEST_MODE === "true";

export const PRO_PLAN_AMOUNT = 7_900_000; // tiyin

const SUBSCRIBE_URL = IS_TEST_MODE
  ? "https://checkout.test.paycom.uz/api"
  : "https://checkout.paycom.uz/api";

export const CHECKOUT_URL = IS_TEST_MODE
  ? "https://checkout.test.paycom.uz"
  : "https://checkout.paycom.uz";

// Payme transaction states
export const PAYME_STATE = {
  CREATED: 1,
  COMPLETED: 2,
  CANCELLED: -1,
  CANCELLED_AFTER_COMPLETE: -2,
} as const;

// Payme error codes for Merchant API
export const PAYME_ERROR = {
  INVALID_AMOUNT: { code: -31001, message: "Invalid amount" },
  USER_NOT_FOUND: { code: -31050, message: "User not found" },
  TRANSACTION_NOT_FOUND: { code: -31003, message: "Transaction not found" },
  CANNOT_PERFORM: { code: -31008, message: "Cannot perform transaction" },
  CANNOT_CANCEL: { code: -31007, message: "Cannot cancel transaction" },
  INTERNAL_ERROR: { code: -32400, message: "Internal error" },
} as const;

interface PaymeRpcRequest {
  method: string;
  params: Record<string, unknown>;
}

interface PaymeRpcResponse {
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

async function callSubscribeApi(
  method: string,
  params: Record<string, unknown>
): Promise<PaymeRpcResponse> {
  const key = IS_TEST_MODE ? PAYME_TEST_KEY : PAYME_SECRET_KEY;
  const credentials = Buffer.from(`Paycom:${key}`).toString("base64");

  const body: PaymeRpcRequest = {
    method,
    params,
  };

  const res = await fetch(SUBSCRIBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  return res.json() as Promise<PaymeRpcResponse>;
}

/**
 * Create a card token (first step of card binding)
 * Returns: { card: { _id, number, expire, phone, verify: false } }
 */
export async function cardsCreate(number: string, expire: string) {
  return callSubscribeApi("cards.create", {
    card: { number, expire },
    amount: PRO_PLAN_AMOUNT,
  });
}

/**
 * Request SMS verification code for a card token
 */
export async function cardsGetVerifyCode(token: string) {
  return callSubscribeApi("cards.get_verify_code", { _id: token });
}

/**
 * Verify card with SMS code
 * Returns: { card: { _id, number, verify: true } }
 */
export async function cardsVerify(token: string, code: string) {
  return callSubscribeApi("cards.verify", { _id: token, code });
}

/**
 * Remove a card token
 */
export async function cardsRemove(token: string) {
  return callSubscribeApi("cards.remove", { _id: token });
}

/**
 * Create a payment receipt
 */
export async function receiptsCreate(
  amount: number,
  orderId: string,
  userId: string,
  description: string
) {
  return callSubscribeApi("receipts.create", {
    amount,
    account: { order_id: orderId, user_id: userId },
    description,
  });
}

/**
 * Pay a receipt using a card token
 */
export async function receiptsPay(receiptId: string, cardToken: string) {
  return callSubscribeApi("receipts.pay", {
    _id: receiptId,
    payer: { card: cardToken },
  });
}

/**
 * Get Payme checkout URL for one-time payment redirect
 */
export function getCheckoutUrl(
  userId: string,
  amount: number,
  locale: string = "ru"
): string {
  const params = [
    `m=${PAYME_MERCHANT_ID}`,
    `ac.user_id=${userId}`,
    `a=${amount}`,
    `l=${locale === "uz" || locale === "uzc" ? "uz" : locale === "en" ? "en" : "ru"}`,
    `c=${process.env.NEXT_PUBLIC_APP_URL}/billing?payment=success`,
  ].join(";");

  const encoded = Buffer.from(params).toString("base64");
  return `${CHECKOUT_URL}/${encoded}`;
}

/**
 * Validate Merchant API Basic auth header
 */
export function validateMerchantAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;
  const encoded = authHeader.slice(6);
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  // Format: "Paycom:{secret}" — merchant key is the password
  const [, password] = decoded.split(":");
  return password === PAYME_SECRET_KEY || password === PAYME_TEST_KEY;
}
