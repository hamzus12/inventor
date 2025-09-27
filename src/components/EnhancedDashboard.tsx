import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Euro,
  BarChart3,
  Settings,
  LogOut,
  Filter,
  Download,
  RefreshCw,
  Package2,
  ShoppingCart,
  Calendar,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useStockMovements } from "@/hooks/useStockMovements";
import { toast } from "@/hooks/use-toast";
import ProductModal from "./ProductModal";
import StockAdjustmentModal from "./StockAdjustmentModal";

const EnhancedDashboard = () => {
  const { user, signOut } = useAuth();
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, adjustStock, refetch: refetchProducts } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { movements, loading: movementsLoading, refetch: refetchMovements } = useStockMovements();

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Computed values
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesStock = stockFilter === "all" || 
                          (stockFilter === "low" && product.quantity <= product.min_stock) ||
                          (stockFilter === "out" && product.quantity === 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const lowStockProducts = useMemo(() => {
    return products.filter(product => product.quantity <= product.min_stock && product.quantity > 0);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(product => product.quantity === 0);
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  }, [products]);

  const recentMovements = useMemo(() => {
    return movements.slice(0, 10);
  }, [movements]);

  // Handlers
  const handleCreateProduct = async (data: any) => {
    const result = await createProduct(data);
    if (result) {
      setProductModalOpen(false);
    }
    return result;
  };

  const handleUpdateProduct = async (data: any) => {
    const result = await updateProduct(data);
    if (result) {
      setProductModalOpen(false);
      setEditingProduct(null);
    }
    return result;
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      await deleteProduct(productId);
    }
  };

  const handleStockAdjustment = async (productId: string, newQuantity: number, reason: string, type: "in" | "out" | "adjustment") => {
    const success = await adjustStock(productId, newQuantity, reason, type);
    if (success) {
      setStockModalOpen(false);
      setAdjustingProduct(null);
      // Refresh movements to show the new adjustment
      refetchMovements();
    }
    return success;
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product);
    setStockModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([refetchProducts(), refetchMovements()]);
    toast({
      title: "Données actualisées",
      description: "Les données ont été mises à jour",
    });
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">StockFlow</h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                v2.0 - Pro
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:ml-2 sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produits totaux
              </CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                +{products.filter(p => {
                  const today = new Date();
                  const productDate = new Date(p.created_at);
                  return productDate.toDateString() === today.toDateString();
                }).length} aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valeur du stock
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalValue.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Valeur totale de l'inventaire
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock faible
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits sous le minimum
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ruptures de stock
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {outOfStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits épuisés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="space-y-3">
            {outOfStockProducts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{outOfStockProducts.length} produit(s) en rupture de stock :</strong>{" "}
                  {outOfStockProducts.slice(0, 3).map(p => p.name).join(", ")}
                  {outOfStockProducts.length > 3 && ` et ${outOfStockProducts.length - 3} autre(s)`}
                </AlertDescription>
              </Alert>
            )}
            
            {lowStockProducts.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{lowStockProducts.length} produit(s) en stock faible :</strong>{" "}
                  {lowStockProducts.slice(0, 3).map(p => p.name).join(", ")}
                  {lowStockProducts.length > 3 && ` et ${lowStockProducts.length - 3} autre(s)`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des produits</CardTitle>
                    <CardDescription>
                      Gérez votre inventaire et suivez vos stocks
                    </CardDescription>
                  </div>
                  <Button onClick={() => setProductModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau produit
                  </Button>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
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

                    <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les stocks</SelectItem>
                        <SelectItem value="low">Stock faible</SelectItem>
                        <SelectItem value="out">Rupture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} produit(s) trouvé(s)
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit trouvé</p>
                    <p className="text-sm">Essayez de modifier vos filtres ou créez un nouveau produit</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{product.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {product.sku}
                              </Badge>
                              {product.categories && (
                                <Badge 
                                  variant="secondary"
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: `${product.categories.color}20`,
                                    color: product.categories.color 
                                  }}
                                >
                                  {product.categories.name}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Prix: {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                              <span>Stock: {product.quantity}</span>
                              <span>Min: {product.min_stock}</span>
                              {product.location && <span>📍 {product.location}</span>}
                            </div>

                            {product.quantity <= product.min_stock && (
                              <div className="flex items-center gap-1 text-sm">
                                <AlertTriangle className="w-4 h-4 text-warning" />
                                <span className={product.quantity === 0 ? "text-destructive" : "text-warning"}>
                                  {product.quantity === 0 ? "Rupture de stock" : "Stock faible"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustStock(product)}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Movements */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Mouvements récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {movementsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentMovements.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucun mouvement récent</p>
                ) : (
                  <div className="space-y-3">
                    {recentMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {movement.products?.name || 'Produit supprimé'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {movement.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            movement.type === 'in' ? 'text-green-600' : 
                            movement.type === 'out' ? 'text-red-600' : 
                            'text-blue-600'
                          }`}>
                            {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                            {movement.quantity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setProductModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser les données
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter l'inventaire
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        title={editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
      />

      <StockAdjustmentModal
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
          setAdjustingProduct(null);
        }}
        onAdjust={handleStockAdjustment}
        product={adjustingProduct}
      />
    </div>
  );
};

export default EnhancedDashboard;