import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Euro, Hash, Tag } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: any) => void;
}

const AddProductModal = ({ open, onOpenChange, onAddProduct }: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",
    minStock: "",
    category: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock),
      category: formData.category,
      description: formData.description
    };

    onAddProduct(newProduct);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: "",
      sku: "",
      price: "",
      quantity: "",
      minStock: "",
      category: "",
      description: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card shadow-elevated border-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Ajouter un nouveau produit
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nom du produit *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 15 Pro"
                required
                className="transition-all focus:shadow-card"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium text-foreground flex items-center gap-1">
                <Hash className="w-3 h-3" />
                SKU *
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="IP15P-001"
                required
                className="transition-all focus:shadow-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground flex items-center gap-1">
                <Euro className="w-3 h-3" />
                Prix unitaire *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1199.99"
                required
                className="transition-all focus:shadow-card"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-foreground">
                Quantité *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="50"
                required
                className="transition-all focus:shadow-card"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStock" className="text-sm font-medium text-foreground">
                Stock minimum *
              </Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="10"
                required
                className="transition-all focus:shadow-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Catégorie *
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="transition-all focus:shadow-card">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Électronique</SelectItem>
                <SelectItem value="Accessories">Accessoires</SelectItem>
                <SelectItem value="Clothing">Vêtements</SelectItem>
                <SelectItem value="Books">Livres</SelectItem>
                <SelectItem value="Home">Maison</SelectItem>
                <SelectItem value="Sports">Sport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée du produit..."
              rows={3}
              className="transition-all focus:shadow-card resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 transition-all hover:shadow-card"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-white shadow-card hover:shadow-elevated transition-all"
            >
              Ajouter le produit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;