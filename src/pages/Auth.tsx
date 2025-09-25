import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, ShieldCheck } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
  companyName: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validatedData = signUpSchema.parse(signUpData);
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
            company_name: validatedData.companyName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Cet email est déjà utilisé. Veuillez vous connecter.");
        } else {
          setError(signUpError.message);
        }
      } else {
        toast({
          title: "Compte créé avec succès!",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Une erreur est survenue lors de la création du compte");
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validatedData = signInSchema.parse(signInData);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou mot de passe incorrect");
        } else {
          setError(signInError.message);
        }
      } else {
        toast({
          title: "Connexion réussie!",
          description: "Vous êtes maintenant connecté.",
        });
        navigate("/");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Une erreur est survenue lors de la connexion");
      }
      console.error("Signin error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StockFlow
          </h1>
          <p className="text-muted-foreground">
            Gestion d'inventaire intelligente
          </p>
        </div>

        <Card className="shadow-elevated border-0 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">Accès à votre compte</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous ou créez un compte pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({ ...signInData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Nom complet</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Jean Dupont"
                      value={signUpData.fullName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Nom de l'entreprise (optionnel)</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="Ma Société"
                      value={signUpData.companyName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer un compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Auth;