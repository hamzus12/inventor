import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  description?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des catégories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData: CreateCategoryData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            ...categoryData,
            color: categoryData.color || "#3B82F6",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: "Catégorie créée",
        description: `La catégorie ${data.name} a été créée avec succès.`,
      });

      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la catégorie",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update category
  const updateCategory = async (id: string, categoryData: Partial<CreateCategoryData>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => 
        prev.map((category) => (category.id === id ? data : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      toast({
        title: "Catégorie modifiée",
        description: `La catégorie ${data.name} a été modifiée avec succès.`,
      });

      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification de la catégorie",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("user_id", user.id);

      if (error) throw error;

      setCategories((prev) => prev.filter((category) => category.id !== categoryId));

      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la catégorie",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};