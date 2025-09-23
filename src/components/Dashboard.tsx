import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingDown, TrendingUp, AlertTriangle, Plus, Search, Edit, Trash2, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AddProductModal from "./AddProductModal";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  price: number;
  category: string;
}

interface StockMovement {
  id: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
}

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "MacBook Pro 14\"", sku: "MBP-14-001", quantity: 15, minStock: 5, price: 2499, category: "Electronics" },
    { id: "2", name: "iPhone 15 Pro", sku: "IP15P-001", quantity: 3, minStock: 10, price: 1199, category: "Electronics" },
    { id: "3", name: "AirPods Pro", sku: "APP-001", quantity: 25, minStock: 15, price: 249, category: "Accessories" },
    { id: "4", name: "Magic Mouse", sku: "MM-001", quantity: 8, minStock: 12, price: 99, category: "Accessories" },
  ]);
  const { toast } = useToast();
  
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Produit ajouté !",
      description: `${newProduct.name} a été ajouté à l'inventaire.`,
    });
  };

  const recentMovements: StockMovement[] = [
    { id: "1", productName: "MacBook Pro 14\"", type: "in", quantity: 10, date: "2024-01-15", reason: "Restockage fournisseur" },
    { id: "2", productName: "iPhone 15 Pro", type: "out", quantity: 7, date: "2024-01-14", reason: "Vente client" },
    { id: "3", productName: "AirPods Pro", type: "in", quantity: 20, date: "2024-01-13", reason: "Commande préventive" },
  ];

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Gestion d'Inventaire
          </h1>
          <p className="text-muted-foreground mt-1">
            Tableau de bord et suivi des stocks en temps réel
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-primary text-white shadow-elevated hover:shadow-card transition-all animate-pulse-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated hover:scale-105 group animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Produits
            </CardTitle>
            <Package className="h-4 w-4 text-primary group-hover:animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2 ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated hover:scale-105 group animate-slide-up [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent group-hover:animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalValue.toLocaleString()}€
            </div>
            <p className="text-xs text-accent mt-1">
              +12.5% ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated hover:scale-105 group animate-slide-up [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning group-hover:animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessite attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated hover:scale-105 group animate-slide-up [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mouvements Jour
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-destructive group-hover:animate-float" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-muted-foreground mt-1">
              8 entrées, 15 sorties
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Inventaire</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher produits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 hover:shadow-card transition-all animate-scale-in border border-transparent hover:border-primary/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full transition-all ${product.quantity <= product.minStock ? 'bg-warning animate-pulse-glow' : 'bg-primary'}`}></div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={product.quantity <= product.minStock ? "destructive" : "secondary"}
                        className="transition-all group-hover:scale-105"
                      >
                        {product.category}
                      </Badge>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{product.quantity} unités</div>
                        <div className="text-sm text-muted-foreground">{product.price}€/unité</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Recent Movements */}
        <div className="space-y-6">
          {/* Stock Alerts */}
          <Card className="bg-gradient-card shadow-card border-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning animate-pulse" />
                Alertes Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="p-3 rounded-lg bg-warning/10 border border-warning/20 hover:bg-warning/15 transition-all animate-slide-up hover:shadow-card"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="font-medium text-warning text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {product.quantity} (Min: {product.minStock})
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 animate-fade-in">
                    Aucune alerte de stock ✨
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card className="bg-gradient-card shadow-card border-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Mouvements Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((movement, index) => (
                  <div 
                    key={movement.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/40 transition-all animate-slide-up hover:shadow-card"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all ${movement.type === 'in' ? 'bg-accent animate-pulse' : 'bg-destructive'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {movement.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity} • {movement.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddProductModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default Dashboard;