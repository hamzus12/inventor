import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { Product, CreateProductData, UpdateProductData } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  price: z.number().min(0, "Le prix doit être positif"),
  quantity: z.number().int().min(0, "La quantité doit être un nombre entier positif"),
  min_stock: z.number().int().min(0, "Le stock minimum doit être un nombre entier positif"),
  max_stock: z.number().int().min(0, "Le stock maximum doit être un nombre entier positif").optional(),
  sku: z.string().optional(),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  barcode: z.string().optional(),
  location: z.string().max(100, "L'emplacement ne peut pas dépasser 100 caractères").optional(),
});

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<Product | null>;
  product?: Product | null;
  title: string;
}

const ProductModal = ({ isOpen, onClose, onSubmit, product, title }: ProductModalProps) => {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    price: 0,
    quantity: 0,
    min_stock: 5,
    sku: "",
    description: "",
    category_id: "",
    barcode: "",
    location: "",
  });

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          min_stock: product.min_stock,
          max_stock: product.max_stock,
          sku: product.sku,
          description: product.description || "",
          category_id: product.category_id || "",
          barcode: product.barcode || "",
          location: product.location || "",
        });
      } else {
        setFormData({
          name: "",
          price: 0,
          quantity: 0,
          min_stock: 5,
          sku: "",
          description: "",
          category_id: "",
          barcode: "",
          location: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = productSchema.parse({
        ...formData,
        max_stock: formData.max_stock || undefined,
      });

      // Prepare submission data
      const submissionData = product 
        ? ({ ...validatedData, id: product.id } as UpdateProductData)
        : (validatedData as CreateProductData);

      const result = await onSubmit(submissionData);
      
      if (result) {
        onClose();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Error submitting product:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProductData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {product && (
              <Badge variant="secondary" className="ml-2">
                {product.sku}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nom du produit"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Laissez vide pour génération automatique"
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité en stock *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>

            {/* Min Stock */}
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock minimum *</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleInputChange("min_stock", parseInt(e.target.value) || 0)}
                className={errors.min_stock ? "border-destructive" : ""}
              />
              {errors.min_stock && (
                <p className="text-sm text-destructive">{errors.min_stock}</p>
              )}
            </div>

            {/* Max Stock */}
            <div className="space-y-2">
              <Label htmlFor="max_stock">Stock maximum</Label>
              <Input
                id="max_stock"
                type="number"
                min="0"
                value={formData.max_stock || ""}
                onChange={(e) => handleInputChange("max_stock", parseInt(e.target.value) || undefined)}
                placeholder="Optionnel"
                className={errors.max_stock ? "border-destructive" : ""}
              />
              {errors.max_stock && (
                <p className="text-sm text-destructive">{errors.max_stock}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) => handleInputChange("category_id", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="Code-barres"
                className={errors.barcode ? "border-destructive" : ""}
              />
              {errors.barcode && (
                <p className="text-sm text-destructive">{errors.barcode}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Emplacement</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Emplacement dans l'entrepôt"
              className={errors.location ? "border-destructive" : ""}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description du produit"
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;