import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getMerchantId(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('merchant_id') || request.headers.get('x-merchant-id') || null;
}

export async function GET(request: NextRequest) {
  const merchantId = getMerchantId(request);
  if (!merchantId) {
    return NextResponse.json({ error: 'MISSING_MERCHANT_ID', message: 'No merchant_id provided' }, { status: 400 });
  }

  try {
    const pool = getDbPool();

    // 1. Fetch all active agent wallets
    const walletsRes = await pool.query(`
      SELECT 
        id,
        agent_id,
        user_id,
        balance_paise,
        monthly_allowance_paise,
        monthly_spent_paise,
        per_transaction_cap_paise,
        whitelisted_categories,
        status,
        created_at
      FROM agent_wallets
      ORDER BY created_at DESC;
    `);

    // 2. Fetch recent double-entry ledger transactions
    const ledgerRes = await pool.query(`
      SELECT 
        l.id,
        l.wallet_id,
        w.agent_id,
        l.order_id,
        l.entry_type,
        l.amount_paise,
        l.balance_after_paise,
        l.description,
        l.created_at
      FROM agent_wallet_ledger l
      JOIN agent_wallets w ON l.wallet_id = w.id
      ORDER BY l.created_at DESC
      LIMIT 20;
    `);

    const wallets = walletsRes.rows.map((w: any) => ({
      ...w,
      balance_inr: `₹${(w.balance_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      monthly_allowance_inr: `₹${(w.monthly_allowance_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      per_transaction_cap_inr: `₹${(w.per_transaction_cap_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      monthly_spent_inr: `₹${(w.monthly_spent_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    }));

    const ledger = ledgerRes.rows.map((l: any) => ({
      ...l,
      amount_inr: `${l.entry_type === 'DEBIT_PURCHASE' ? '-' : '+'}₹${(l.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      balance_after_inr: `₹${(l.balance_after_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    }));

    const primaryWallet = wallets[0] || null;

    return NextResponse.json({
      success: true,
      primary_wallet: primaryWallet,
      wallets,
      ledger,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }
}
