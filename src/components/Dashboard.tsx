import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingDown, TrendingUp, AlertTriangle, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
  
  // Mock data
  const products: Product[] = [
    { id: "1", name: "MacBook Pro 14\"", sku: "MBP-14-001", quantity: 15, minStock: 5, price: 2499, category: "Electronics" },
    { id: "2", name: "iPhone 15 Pro", sku: "IP15P-001", quantity: 3, minStock: 10, price: 1199, category: "Electronics" },
    { id: "3", name: "AirPods Pro", sku: "APP-001", quantity: 25, minStock: 15, price: 249, category: "Accessories" },
    { id: "4", name: "Magic Mouse", sku: "MM-001", quantity: 8, minStock: 12, price: 99, category: "Accessories" },
  ];

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
        <Button className="bg-gradient-primary text-white shadow-elevated hover:shadow-card transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Produits
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2 ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
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

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessite attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0 transition-all hover:shadow-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mouvements Jour
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
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
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <h3 className="font-medium text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={product.quantity <= product.minStock ? "destructive" : "secondary"}>
                        {product.category}
                      </Badge>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{product.quantity} unités</div>
                        <div className="text-sm text-muted-foreground">{product.price}€/unité</div>
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
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertes Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="font-medium text-warning text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {product.quantity} (Min: {product.minStock})
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune alerte de stock
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-foreground">Mouvements Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-2 h-2 rounded-full ${movement.type === 'in' ? 'bg-accent' : 'bg-destructive'}`}></div>
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
    </div>
  );
};

export default Dashboard;