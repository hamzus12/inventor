import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (productId: string, newQuantity: number, reason: string, type: "in" | "out" | "adjustment") => Promise<boolean>;
  product: Product | null;
}

const adjustmentReasons = {
  in: [
    "Réception de commande",
    "Retour client",
    "Ajustement inventaire (surplus)",
    "Production interne",
    "Transfert d'entrepôt",
    "Autre entrée",
  ],
  out: [
    "Vente",
    "Perte/Casse",
    "Vol",
    "Retour fournisseur",
    "Ajustement inventaire (manquant)",
    "Transfert d'entrepôt",
    "Autre sortie",
  ],
  adjustment: [
    "Correction d'inventaire",
    "Recomptage physique",
    "Erreur de saisie",
    "Ajustement technique",
    "Autre ajustement",
  ],
};

const StockAdjustmentModal = ({ isOpen, onClose, onAdjust, product }: StockAdjustmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out" | "adjustment">("adjustment");
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  // Initialize form when product changes
  useState(() => {
    if (product) {
      setNewQuantity(product.quantity);
      setReason("");
      setCustomReason("");
      setError("");
      setAdjustmentType("adjustment");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setError("");

    try {
      // Validation
      if (newQuantity < 0) {
        setError("La quantité ne peut pas être négative");
        return;
      }

      if (newQuantity === product.quantity) {
        setError("La nouvelle quantité doit être différente de l'actuelle");
        return;
      }

      const finalReason = reason === "Autre" || reason.includes("Autre") ? customReason : reason;
      if (!finalReason.trim()) {
        setError("La raison est obligatoire");
        return;
      }

      const success = await onAdjust(product.id, newQuantity, finalReason, adjustmentType);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      setError("Erreur lors de l'ajustement du stock");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: "in" | "out" | "adjustment") => {
    setAdjustmentType(type);
    setReason("");
    setCustomReason("");
    
    // Auto-calculate new quantity based on type
    if (product) {
      if (type === "in") {
        setNewQuantity(product.quantity + 1);
      } else if (type === "out") {
        setNewQuantity(Math.max(0, product.quantity - 1));
      } else {
        setNewQuantity(product.quantity);
      }
    }
  };

  const quantityDiff = product ? newQuantity - product.quantity : 0;
  const needsCustomReason = reason === "Autre" || reason.includes("Autre");

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ajuster le stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{product.name}</span>
              <Badge variant="outline">{product.sku}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Stock actuel: <span className="font-medium">{product.quantity}</span> unités
            </div>
            {product.categories && (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: product.categories.color }}
                />
                {product.categories.name}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={adjustmentType === "in" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeChange("in")}
                className="flex items-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                Entrée
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "out" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeChange("out")}
                className="flex items-center gap-1"
              >
                <TrendingDown className="w-4 h-4" />
                Sortie
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "adjustment" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeChange("adjustment")}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Ajuster
              </Button>
            </div>

            {/* New Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Nouvelle quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                className={quantityDiff !== 0 ? "border-primary" : ""}
              />
              {quantityDiff !== 0 && (
                <div className={`text-sm font-medium ${quantityDiff > 0 ? "text-green-600" : "text-red-600"}`}>
                  {quantityDiff > 0 ? "+" : ""}{quantityDiff} unités
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Raison</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une raison" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons[adjustmentType].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Reason */}
            {needsCustomReason && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Préciser la raison</Label>
                <Textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Décrivez la raison de l'ajustement"
                  rows={2}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Warning for low stock */}
            {newQuantity <= product.min_stock && (
              <Alert>
                <AlertDescription>
                  ⚠️ Le stock sera en dessous du minimum recommandé ({product.min_stock} unités)
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading || quantityDiff === 0 || !reason}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer l'ajustement
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;