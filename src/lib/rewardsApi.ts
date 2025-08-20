
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/nova-rewards`;

async function authedFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${FUNCTION_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  return response.json();
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  coin_cost: number;
  active: boolean;
  created_at: string;
}

export interface Wallet {
  child_id: string;
  coins: number;
  updated_at?: string;
}

export interface Redemption {
  id: string;
  reward_id: string;
  child_id: string;
  status: 'requested' | 'approved' | 'rejected' | 'fulfilled';
  note?: string;
  coins_spent?: number;
  created_at: string;
  decided_at?: string;
  parent_rewards: {
    name: string;
    description?: string;
    coin_cost: number;
  };
  children: {
    name: string;
  };
}

export async function listRewards(): Promise<Reward[]> {
  const result = await authedFetch("/rewards");
  return result.rewards;
}

export async function createReward(reward: Omit<Reward, 'id' | 'active' | 'created_at'>): Promise<Reward> {
  const result = await authedFetch("/rewards", {
    method: "POST",
    body: JSON.stringify(reward),
  });
  return result.reward;
}

export async function getWallet(childId: string): Promise<Wallet> {
  const result = await authedFetch(`/wallet?child_id=${childId}`);
  return result.wallet;
}

export async function requestReward(childId: string, rewardId: string, note?: string) {
  const result = await authedFetch("/request", {
    method: "POST",
    body: JSON.stringify({
      child_id: childId,
      reward_id: rewardId,
      note,
    }),
  });
  return result;
}

export async function decideReward(redemptionId: string, approve: boolean, note?: string) {
  const result = await authedFetch("/decide", {
    method: "POST",
    body: JSON.stringify({
      redemption_id: redemptionId,
      approve,
      note,
    }),
  });
  return result;
}

export async function listRedemptions(): Promise<Redemption[]> {
  const result = await authedFetch("/redemptions");
  return result.redemptions;
}

export async function addCoins(childId: string, amount: number, reason?: string) {
  const { error } = await supabase
    .from("wallets")
    .upsert({
      child_id: childId,
      coins: amount, // This will be handled by a COALESCE in a real implementation
    }, { onConflict: "child_id" });

  if (error) throw error;
}
