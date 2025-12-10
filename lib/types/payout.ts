/**
 * Payout and Wallet Type Definitions
 */

export interface Wallet {
  id: string;
  helper_id: string;
  balance_cents: number;
  locked_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutRequest {
  id: string;
  helper_id: string;
  requester_user_id: string;
  amount_cents: number;
  status: PayoutRequestStatus;
  stripe_transfer_id: string | null;
  stripe_payout_id: string | null;
  idempotency_key: string | null;
  platform_fee_cents: number;
  note: string | null;
  failed_reason: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type PayoutRequestStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface PlatformTransaction {
  id: string;
  type: PlatformTransactionType;
  reference_type: PlatformTransactionReferenceType;
  reference_id: string;
  helper_id: string;
  amount_cents: number;
  balance_before_cents: number;
  balance_after_cents: number;
  locked_before_cents: number;
  locked_after_cents: number;
  description: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export type PlatformTransactionType =
  | "credit"
  | "debit"
  | "lock"
  | "unlock"
  | "fee"
  | "refund";

export type PlatformTransactionReferenceType =
  | "payment_request"
  | "payout_request"
  | "refund"
  | "adjustment";

export interface WalletSummary {
  available_balance: number; // balance_cents - locked_cents
  locked_balance: number; // locked_cents
  total_balance: number; // balance_cents
  total_earnings: number;
  total_withdrawn: number;
  currency: string;
}

export interface PayoutRequestCreatePayload {
  amount_cents: number;
  note?: string;
}

export interface PayoutRequestResponse {
  success: boolean;
  data?: PayoutRequest;
  error?: string;
}

export interface WalletResponse {
  success: boolean;
  data?: {
    wallet: WalletSummary;
    payout_requests: PayoutRequest[];
    transactions: PlatformTransaction[];
    stripe_account: {
      connected: boolean;
      charges_enabled: boolean;
      payouts_enabled: boolean;
      details_submitted: boolean;
    } | null;
  };
  error?: string;
}
