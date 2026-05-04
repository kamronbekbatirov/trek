/**
 * Payme Merchant API webhook handler
 *
 * Payme sends JSON-RPC requests when payments are made through checkout.
 * Auth: Basic auth with Paycom:{SECRET_KEY}
 *
 * Methods handled:
 * - CheckPerformTransaction: verify the order can be paid
 * - CreateTransaction: record the pending transaction
 * - PerformTransaction: mark as paid, activate subscription
 * - CancelTransaction: handle cancellation
 * - CheckTransaction: return transaction status
 * - GetStatement: return list of transactions in time range
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateMerchantAuth,
  PRO_PLAN_AMOUNT,
  PAYME_ERROR,
  PAYME_STATE,
} from "@/lib/payme";

function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({
    id,
    error: { code, message, data: message },
  });
}

function rpcResult(id: unknown, result: Record<string, unknown>) {
  return NextResponse.json({ id, result });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!validateMerchantAuth(authHeader)) {
    return NextResponse.json(
      { error: { code: -32504, message: "Forbidden", data: "Forbidden" } },
      { status: 403 }
    );
  }

  let body: { id: unknown; method: string; params: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body;

  switch (method) {
    case "CheckPerformTransaction":
      return handleCheckPerform(id, params);
    case "CreateTransaction":
      return handleCreateTransaction(id, params);
    case "PerformTransaction":
      return handlePerformTransaction(id, params);
    case "CancelTransaction":
      return handleCancelTransaction(id, params);
    case "CheckTransaction":
      return handleCheckTransaction(id, params);
    case "GetStatement":
      return handleGetStatement(id, params);
    default:
      return rpcError(id, -32601, "Method not found");
  }
}

// ---------------------------------------------------------------------------
// CheckPerformTransaction
// Verify the order can be performed (user exists, amount is correct)
// ---------------------------------------------------------------------------
async function handleCheckPerform(
  id: unknown,
  params: Record<string, unknown>
) {
  const amount = params.amount as number;
  const account = params.account as Record<string, string>;
  const userId = account?.user_id;

  if (amount !== PRO_PLAN_AMOUNT) {
    return rpcError(id, PAYME_ERROR.INVALID_AMOUNT.code, "Invalid amount");
  }

  if (!userId) {
    return rpcError(id, PAYME_ERROR.USER_NOT_FOUND.code, "User not found");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return rpcError(id, PAYME_ERROR.USER_NOT_FOUND.code, "User not found");
  }

  return rpcResult(id, { allow: true });
}

// ---------------------------------------------------------------------------
// CreateTransaction
// Record the pending transaction
// ---------------------------------------------------------------------------
async function handleCreateTransaction(
  id: unknown,
  params: Record<string, unknown>
) {
  const transId = params.id as string;
  const amount = params.amount as number;
  const createTime = params.time as number;
  const account = params.account as Record<string, string>;
  const userId = account?.user_id;

  if (amount !== PRO_PLAN_AMOUNT) {
    return rpcError(id, PAYME_ERROR.INVALID_AMOUNT.code, "Invalid amount");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return rpcError(id, PAYME_ERROR.USER_NOT_FOUND.code, "User not found");
  }

  // Check if transaction already exists
  const existing = await prisma.payment.findUnique({
    where: { paymeTransId: transId },
  });

  if (existing) {
    if (existing.paymeState === PAYME_STATE.CANCELLED || existing.paymeState === PAYME_STATE.CANCELLED_AFTER_COMPLETE) {
      return rpcError(id, PAYME_ERROR.CANNOT_PERFORM.code, "Transaction cancelled");
    }
    return rpcResult(id, {
      create_time: Number(existing.paymeCreateTime),
      transaction: existing.id,
      state: existing.paymeState,
    });
  }

  // Get or create subscription
  let subscription = user.subscription;
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: { userId: user.id },
    });
  }

  const payment = await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount,
      status: "PENDING",
      paymeTransId: transId,
      paymeState: PAYME_STATE.CREATED,
      paymeCreateTime: BigInt(createTime),
      description: "Подписка Pro — trek.uz",
    },
  });

  return rpcResult(id, {
    create_time: createTime,
    transaction: payment.id,
    state: PAYME_STATE.CREATED,
  });
}

// ---------------------------------------------------------------------------
// PerformTransaction
// Mark as paid, activate Pro subscription
// ---------------------------------------------------------------------------
async function handlePerformTransaction(
  id: unknown,
  params: Record<string, unknown>
) {
  const transId = params.id as string;
  const performTime = params.time as number ?? Date.now();

  const payment = await prisma.payment.findUnique({
    where: { paymeTransId: transId },
    include: { subscription: true },
  });

  if (!payment) {
    return rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, "Transaction not found");
  }

  if (payment.paymeState === PAYME_STATE.COMPLETED) {
    return rpcResult(id, {
      transaction: payment.id,
      perform_time: Number(payment.paymePerformTime),
      state: PAYME_STATE.COMPLETED,
    });
  }

  if (payment.paymeState !== PAYME_STATE.CREATED) {
    return rpcError(id, PAYME_ERROR.CANNOT_PERFORM.code, "Cannot perform transaction");
  }

  // Activate Pro subscription
  const now = new Date();
  const nextBilling = new Date(now);
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paymeState: PAYME_STATE.COMPLETED,
        paymePerformTime: BigInt(performTime),
      },
    }),
    prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        plan: "PRO",
        status: "ACTIVE",
        nextBillingDate: nextBilling,
      },
    }),
  ]);

  return rpcResult(id, {
    transaction: payment.id,
    perform_time: performTime,
    state: PAYME_STATE.COMPLETED,
  });
}

// ---------------------------------------------------------------------------
// CancelTransaction
// ---------------------------------------------------------------------------
async function handleCancelTransaction(
  id: unknown,
  params: Record<string, unknown>
) {
  const transId = params.id as string;
  const reason = params.reason as number;
  const cancelTime = Date.now();

  const payment = await prisma.payment.findUnique({
    where: { paymeTransId: transId },
  });

  if (!payment) {
    return rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, "Transaction not found");
  }

  if (payment.paymeState === PAYME_STATE.COMPLETED) {
    // Downgrade subscription back to FREE
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "CANCELLED",
          paymeState: PAYME_STATE.CANCELLED_AFTER_COMPLETE,
          paymeCancelTime: BigInt(cancelTime),
          paymeCancelReason: reason,
        },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { plan: "FREE", status: "CANCELLED", cancelledAt: new Date() },
      }),
    ]);

    return rpcResult(id, {
      transaction: payment.id,
      cancel_time: cancelTime,
      state: PAYME_STATE.CANCELLED_AFTER_COMPLETE,
    });
  }

  if (
    payment.paymeState === PAYME_STATE.CANCELLED ||
    payment.paymeState === PAYME_STATE.CANCELLED_AFTER_COMPLETE
  ) {
    return rpcResult(id, {
      transaction: payment.id,
      cancel_time: Number(payment.paymeCancelTime),
      state: payment.paymeState,
    });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "CANCELLED",
      paymeState: PAYME_STATE.CANCELLED,
      paymeCancelTime: BigInt(cancelTime),
      paymeCancelReason: reason,
    },
  });

  return rpcResult(id, {
    transaction: payment.id,
    cancel_time: cancelTime,
    state: PAYME_STATE.CANCELLED,
  });
}

// ---------------------------------------------------------------------------
// CheckTransaction
// ---------------------------------------------------------------------------
async function handleCheckTransaction(
  id: unknown,
  params: Record<string, unknown>
) {
  const transId = params.id as string;

  const payment = await prisma.payment.findUnique({
    where: { paymeTransId: transId },
  });

  if (!payment) {
    return rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, "Transaction not found");
  }

  return rpcResult(id, {
    create_time: Number(payment.paymeCreateTime),
    perform_time: payment.paymePerformTime ? Number(payment.paymePerformTime) : 0,
    cancel_time: payment.paymeCancelTime ? Number(payment.paymeCancelTime) : 0,
    transaction: payment.id,
    state: payment.paymeState,
    reason: payment.paymeCancelReason ?? null,
  });
}

// ---------------------------------------------------------------------------
// GetStatement
// Return list of transactions in time range
// ---------------------------------------------------------------------------
async function handleGetStatement(
  id: unknown,
  params: Record<string, unknown>
) {
  const from = params.from as number;
  const to = params.to as number;

  const payments = await prisma.payment.findMany({
    where: {
      paymeCreateTime: {
        gte: BigInt(from),
        lte: BigInt(to),
      },
      paymeTransId: { not: null },
    },
    include: { subscription: true },
  });

  const transactions = payments.map((p) => ({
    id: p.paymeTransId,
    time: Number(p.paymeCreateTime),
    amount: p.amount,
    account: { user_id: p.subscription.userId },
    create_time: Number(p.paymeCreateTime),
    perform_time: p.paymePerformTime ? Number(p.paymePerformTime) : 0,
    cancel_time: p.paymeCancelTime ? Number(p.paymeCancelTime) : 0,
    transaction: p.id,
    state: p.paymeState,
    reason: p.paymeCancelReason ?? null,
  }));

  return rpcResult(id, { transactions });
}
