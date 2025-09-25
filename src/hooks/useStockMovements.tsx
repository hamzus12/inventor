import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface StockMovement {
  id: string;
  product_id: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    sku: string;
  };
}

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch stock movements
  const fetchMovements = async (limit = 50) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setMovements(data?.map(movement => ({
        ...movement,
        type: movement.type as "in" | "out" | "adjustment" | "transfer"
      })) || []);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des mouvements de stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get movements for a specific product
  const getProductMovements = async (productId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching product movements:", error);
      return [];
    }
  };

  // Create stock movement
  const createMovement = async (movementData: {
    product_id: string;
    type: "in" | "out" | "adjustment" | "transfer";
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .insert([
          {
            ...movementData,
            user_id: user.id,
          },
        ])
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `)
        .single();

      if (error) throw error;

      setMovements((prev) => [{
        ...data,
        type: data.type as "in" | "out" | "adjustment" | "transfer"
      }, ...prev]);
      return data;
    } catch (error) {
      console.error("Error creating stock movement:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du mouvement de stock",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get stock summary by type
  const getStockSummary = async (dateFrom?: string, dateTo?: string) => {
    if (!user) return null;

    try {
      let query = supabase
        .from("stock_movements")
        .select("type, quantity");

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = data.reduce((acc, movement) => {
        acc[movement.type] = (acc[movement.type] || 0) + movement.quantity;
        return acc;
      }, {} as Record<string, number>);

      return summary;
    } catch (error) {
      console.error("Error getting stock summary:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [user]);

  return {
    movements,
    loading,
    createMovement,
    getProductMovements,
    getStockSummary,
    refetch: fetchMovements,
  };
};