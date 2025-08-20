
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { listRewards, createReward, getWallet, requestReward, listRedemptions, type Reward, type Wallet, type Redemption } from "@/lib/rewardsApi";
import { toast } from "sonner";

export default function Rewards() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    coin_cost: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load children
      const { data: childrenData } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user!.id);
      
      setChildren(childrenData || []);

      // Load wallets for each child
      const walletData: Record<string, Wallet> = {};
      for (const child of childrenData || []) {
        try {
          const wallet = await getWallet(child.id);
          walletData[child.id] = wallet;
        } catch (error) {
          console.error(`Error loading wallet for child ${child.id}:`, error);
          walletData[child.id] = { child_id: child.id, coins: 0 };
        }
      }
      setWallets(walletData);

      // Load rewards and redemptions
      const [rewardsData, redemptionsData] = await Promise.all([
        listRewards(),
        listRedemptions(),
      ]);
      
      setRewards(rewardsData);
      setRedemptions(redemptionsData);
    } catch (error) {
      console.error("Error loading rewards data:", error);
      toast.error("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault();
    try {
      const reward = await createReward(newReward);
      setRewards([reward, ...rewards]);
      setNewReward({ name: "", description: "", coin_cost: 0 });
      setShowCreateForm(false);
      toast.success("Reward created successfully!");
    } catch (error) {
      console.error("Error creating reward:", error);
      toast.error("Failed to create reward");
    }
  }

  async function handleRequestReward(childId: string, rewardId: string) {
    try {
      await requestReward(childId, rewardId);
      await loadData(); // Refresh data
      toast.success("Reward requested!");
    } catch (error) {
      console.error("Error requesting reward:", error);
      toast.error("Failed to request reward");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "requested":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎁 Nova Rewards</h1>
          <p className="text-muted-foreground">Manage rewards and coins for your children</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Reward
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Reward</CardTitle>
            <CardDescription>Add a custom reward for your children</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <Input
                placeholder="Reward name"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Coin cost"
                value={newReward.coin_cost}
                onChange={(e) => setNewReward({ ...newReward, coin_cost: Number(e.target.value) })}
                min="0"
                required
              />
              <div className="flex gap-2">
                <Button type="submit">Create Reward</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Children Wallets & Rewards */}
      {children.map((child) => (
        <Card key={child.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {child.name}
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-600">{wallets[child.id]?.coins || 0}</span>
                </CardTitle>
                <CardDescription>Available rewards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Gift className="h-5 w-5 text-purple-600" />
                      <Badge variant="secondary" className="text-xs">
                        {reward.coin_cost} coins
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    {reward.description && (
                      <CardDescription className="text-sm">{reward.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full"
                      onClick={() => handleRequestReward(child.id, reward.id)}
                      disabled={(wallets[child.id]?.coins || 0) < reward.coin_cost}
                    >
                      {(wallets[child.id]?.coins || 0) < reward.coin_cost ? "Not enough coins" : "Request"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Latest reward requests from your children</CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No redemptions yet</p>
          ) : (
            <div className="space-y-3">
              {redemptions.slice(0, 10).map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(redemption.status)}
                    <div>
                      <p className="font-medium">{redemption.children.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.parent_rewards.name} ({redemption.parent_rewards.coin_cost} coins)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(redemption.status)}>
                      {redemption.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(redemption.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
