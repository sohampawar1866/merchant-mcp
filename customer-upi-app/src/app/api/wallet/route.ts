import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getDbPool();

    // 1. Fetch primary delegated agent wallet (claude-buyer-01)
    const walletRes = await pool.query(`
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
      WHERE agent_id = 'claude-buyer-01' OR user_id = 'user-soham-01'
      ORDER BY created_at ASC
      LIMIT 1;
    `);

    if (walletRes.rows.length === 0) {
      return NextResponse.json({ error: 'WALLET_NOT_FOUND', message: 'No delegated agent wallet found' }, { status: 404 });
    }

    const w = walletRes.rows[0];

    // 2. Fetch recent ledger records
    const ledgerRes = await pool.query(`
      SELECT 
        id,
        wallet_id,
        order_id,
        entry_type,
        amount_paise,
        balance_after_paise,
        description,
        created_at
      FROM agent_wallet_ledger
      WHERE wallet_id = $1
      ORDER BY created_at DESC
      LIMIT 15;
    `, [w.id]);

    const formattedWallet = {
      ...w,
      balance_inr: (Number(w.balance_paise) / 100).toFixed(2),
      monthly_allowance_inr: (Number(w.monthly_allowance_paise) / 100).toFixed(2),
      per_transaction_cap_inr: (Number(w.per_transaction_cap_paise) / 100).toFixed(2),
      monthly_spent_inr: (Number(w.monthly_spent_paise) / 100).toFixed(2),
      percent_spent: Math.min(100, Math.round((Number(w.monthly_spent_paise) / (Number(w.monthly_allowance_paise) || 1)) * 100)),
    };

    const formattedLedger = ledgerRes.rows.map((l: any) => ({
      ...l,
      amount_inr: (Number(l.amount_paise) / 100).toFixed(2),
      balance_after_inr: (Number(l.balance_after_paise) / 100).toFixed(2),
      is_debit: l.entry_type === 'DEBIT_PURCHASE',
    }));

    return NextResponse.json({
      success: true,
      wallet: formattedWallet,
      ledger: formattedLedger,
      account_info: {
        holder_name: 'Soham Pawar',
        bank_name: 'State Bank of India',
        masked_account: '•••• •••• •••• 4092',
        upi_id: 'soham@oksbi',
        upi_circle_status: 'ACTIVE_DELEGATED',
      },
    });
  } catch (error: any) {
    console.error('Error fetching UPI Circle wallet:', error);
    return NextResponse.json({ error: 'DB_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const pool = getDbPool();

    // Fetch primary wallet
    const walletRes = await pool.query(`
      SELECT id, balance_paise, monthly_allowance_paise, monthly_spent_paise, per_transaction_cap_paise, status
      FROM agent_wallets
      WHERE agent_id = 'claude-buyer-01' OR user_id = 'user-soham-01'
      ORDER BY created_at ASC
      LIMIT 1;
    `);

    if (walletRes.rows.length === 0) {
      return NextResponse.json({ error: 'WALLET_NOT_FOUND' }, { status: 404 });
    }

    const wallet = walletRes.rows[0];

    // ACTION 1: UPDATE PER-TRANSACTION CAP SLIDER
    if (action === 'update_cap') {
      const capPaise = parseInt(body.cap_paise, 10);
      if (isNaN(capPaise) || capPaise < 50000 || capPaise > 500000) {
        return NextResponse.json({ error: 'INVALID_CAP', message: 'Cap must be between ₹500 and ₹5,000' }, { status: 400 });
      }

      await pool.query(`
        UPDATE agent_wallets
        SET per_transaction_cap_paise = $1
        WHERE id = $2;
      `, [capPaise, wallet.id]);

      return NextResponse.json({
        success: true,
        action: 'update_cap',
        new_cap_paise: capPaise,
        new_cap_inr: (capPaise / 100).toFixed(2),
        message: `Auto-debit cap updated to ₹${(capPaise / 100).toLocaleString('en-IN')}`,
      });
    }

    // ACTION 2: REFILL / TOP-UP BALANCE
    if (action === 'refill') {
      const refillAmountPaise = parseInt(body.amount_paise || '500000', 10); // Default ₹5,000
      const newBalance = Number(wallet.balance_paise) + refillAmountPaise;

      await pool.query('BEGIN');

      await pool.query(`
        UPDATE agent_wallets
        SET balance_paise = $1
        WHERE id = $2;
      `, [newBalance, wallet.id]);

      await pool.query(`
        INSERT INTO agent_wallet_ledger (wallet_id, entry_type, amount_paise, balance_after_paise, description)
        VALUES ($1, 'CREDIT_ALLOWANCE', $2, $3, 'Top-Up / Monthly Allowance Replenishment via SBI');
      `, [wallet.id, refillAmountPaise, newBalance]);

      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        action: 'refill',
        new_balance_paise: newBalance,
        new_balance_inr: (newBalance / 100).toFixed(2),
        message: `Replenished ₹${(refillAmountPaise / 100).toLocaleString('en-IN')} to agent allowance`,
      });
    }

    // ACTION 3: SIMULATE AGENT PURCHASE
    if (action === 'simulate_purchase') {
      const amountPaise = parseInt(body.amount_paise, 10);
      const productName = body.product_name || 'Item';

      // Check Cap Enforcement
      if (amountPaise > Number(wallet.per_transaction_cap_paise)) {
        return NextResponse.json({
          success: false,
          escalate_2fa: true,
          reason: 'CAP_EXCEEDED',
          amount_paise: amountPaise,
          amount_inr: (amountPaise / 100).toFixed(2),
          cap_inr: (Number(wallet.per_transaction_cap_paise) / 100).toFixed(2),
          message: `Blocked: ₹${(amountPaise / 100).toLocaleString('en-IN')} exceeds your ₹${(Number(wallet.per_transaction_cap_paise) / 100).toLocaleString('en-IN')} auto-debit cap. Razorpay Step-Up 2FA required.`,
        });
      }

      // Check Balance
      if (amountPaise > Number(wallet.balance_paise)) {
        return NextResponse.json({
          success: false,
          escalate_2fa: false,
          reason: 'INSUFFICIENT_FUNDS',
          message: `Insufficient allowance. Balance is ₹${(Number(wallet.balance_paise) / 100).toFixed(2)}, required ₹${(amountPaise / 100).toFixed(2)}.`,
        });
      }

      // Execute Atomic Debit
      await pool.query('BEGIN');

      const newBalance = Number(wallet.balance_paise) - amountPaise;
      const newMonthlySpent = Number(wallet.monthly_spent_paise) + amountPaise;
      const merchantId = 'efe794fa-e1e2-4d30-8f13-cb74b2b5f110'; // Soham Gadgets

      // Find product for Soham Gadgets
      const prodRes = await pool.query(`
        SELECT id FROM products WHERE merchant_id = $1 LIMIT 1;
      `, [merchantId]);
      const productId = prodRes.rows[0]?.id;

      // Update wallet balance
      await pool.query(`
        UPDATE agent_wallets
        SET balance_paise = $1, monthly_spent_paise = $2
        WHERE id = $3;
      `, [newBalance, newMonthlySpent, wallet.id]);

      // Record in double-entry ledger
      const idempotencyKey = `idemp_sim_${randomUUID().substring(0, 12)}`;
      const orderInsertRes = await pool.query(`
        INSERT INTO orders (merchant_id, product_id, agreed_price, status, idempotency_key, created_at, updated_at)
        VALUES ($1, $2, $3, 'paid', $4, NOW(), NOW())
        RETURNING id;
      `, [merchantId, productId, amountPaise, idempotencyKey]);

      const simulatedOrderId = orderInsertRes.rows[0]?.id || `ord_sim_${randomUUID().substring(0, 8)}`;

      await pool.query(`
        INSERT INTO agent_wallet_ledger (wallet_id, order_id, entry_type, amount_paise, balance_after_paise, description)
        VALUES ($1, $2, 'DEBIT_PURCHASE', $3, $4, $5);
      `, [wallet.id, simulatedOrderId, amountPaise, newBalance, `Purchased: ${productName} at Soham Gadgets`]);

      // Insert audit log for merchant dashboard live activity stream
      await pool.query(`
        INSERT INTO audit_log (merchant_id, correlation_id, tool_name, input, output, decision, reason_code, created_at)
        VALUES (
          $1,
          gen_random_uuid(),
          'upi_circle_auto_debit',
          $2,
          $3,
          'APPROVED',
          'WITHIN_DELEGATED_CAP',
          NOW()
        );
      `, [
        merchantId,
        JSON.stringify({ amount_paise: amountPaise, product: productName }),
        JSON.stringify({ order_id: simulatedOrderId, status: 'paid', balance_after_paise: newBalance }),
      ]);

      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        order_id: simulatedOrderId,
        amount_inr: (amountPaise / 100).toFixed(2),
        new_balance_inr: (newBalance / 100).toFixed(2),
        product_name: productName,
        message: `⚡ Auto-Approved via UPI Circle! ₹${(amountPaise / 100).toLocaleString('en-IN')} debited with zero human MPIN clicks.`,
      });
    }

    return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing UPI Circle action:', error);
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
