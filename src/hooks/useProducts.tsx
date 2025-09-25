import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantity: number;
  min_stock: number;
  max_stock?: number;
  category_id?: string;
  image_url?: string;
  barcode?: string;
  location?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateProductData {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  quantity: number;
  min_stock: number;
  max_stock?: number;
  category_id?: string;
  image_url?: string;
  barcode?: string;
  location?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch products
  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (productData: CreateProductData) => {
    if (!user) return null;

    try {
      // Generate SKU if not provided
      let sku = productData.sku;
      if (!sku) {
        const { data: skuData } = await supabase.rpc("generate_sku");
        sku = skuData;
      }

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            sku,
            user_id: user.id,
          },
        ])
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;

      setProducts((prev) => [data, ...prev]);
      
      toast({
        title: "Produit créé",
        description: `Le produit ${data.name} a été créé avec succès.`,
      });

      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du produit",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update product
  const updateProduct = async (productData: UpdateProductData) => {
    if (!user) return null;

    try {
      const { id, ...updateFields } = productData;
      const { data, error } = await supabase
        .from("products")
        .update(updateFields)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) throw error;

      setProducts((prev) => 
        prev.map((product) => (product.id === id ? data : product))
      );

      toast({
        title: "Produit modifié",
        description: `Le produit ${data.name} a été modifié avec succès.`,
      });

      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du produit",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("user_id", user.id);

      if (error) throw error;

      setProducts((prev) => prev.filter((product) => product.id !== productId));

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du produit",
        variant: "destructive",
      });
      return false;
    }
  };

  // Adjust stock
  const adjustStock = async (
    productId: string,
    newQuantity: number,
    reason: string,
    type: "in" | "out" | "adjustment" = "adjustment"
  ) => {
    if (!user) return false;

    try {
      // Get current product
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");

      const quantityDiff = newQuantity - product.quantity;

      // Create stock movement
      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert([
          {
            product_id: productId,
            type,
            quantity: Math.abs(quantityDiff),
            previous_quantity: product.quantity,
            new_quantity: newQuantity,
            reason,
            user_id: user.id,
          },
        ]);

      if (movementError) throw movementError;

      // Update product quantity (handled automatically by trigger)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, quantity: newQuantity } : p
        )
      );

      toast({
        title: "Stock ajusté",
        description: `Le stock de ${product.name} a été ajusté à ${newQuantity} unités.`,
      });

      return true;
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajustement du stock",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    refetch: fetchProducts,
  };
};