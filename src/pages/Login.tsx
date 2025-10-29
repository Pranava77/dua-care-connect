import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  fullName: z.string().trim().min(2, { message: "Full name is required" }).max(100).optional(),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { refreshSession, user, loading } = useAuth();

  // Navigate to dashboard when user becomes authenticated
  useEffect(() => {
    if (!loading && user && location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Session check is now handled at the app level

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.parse({ email, password });
      
      const { data, error } = await mockApi.signIn(validated.email, validated.password);

      if (error) throw error;

      // Store session in localStorage
      localStorage.setItem('mock-session', JSON.stringify(data.session));

      // Refresh the auth context to update user state
      await refreshSession();

      toast({
        title: "Login successful",
        description: "Welcome back to SilverSync",
      });
      
      // Force a small delay to ensure state updates, then navigate as fallback
      // The useEffect will handle navigation if state propagates, but this ensures it happens
      setTimeout(() => {
        // Double-check user state before navigating
        const currentSession = localStorage.getItem('mock-session');
        if (currentSession) {
          navigate("/dashboard", { replace: true });
        }
      }, 100);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.parse({ email, password, fullName });
      
      const { data, error } = await mockApi.signUp(validated.email, validated.password);

      if (error) throw error;

      // Store session in localStorage
      localStorage.setItem('mock-session', JSON.stringify(data.session));

      // Refresh the auth context to update user state
      await refreshSession();

      toast({
        title: "Account created",
        description: "Welcome to SilverSync",
      });
      
      // Force a small delay to ensure state updates, then navigate as fallback
      // The useEffect will handle navigation if state propagates, but this ensures it happens
      setTimeout(() => {
        // Double-check user state before navigating
        const currentSession = localStorage.getItem('mock-session');
        if (currentSession) {
          navigate("/dashboard", { replace: true });
        }
      }, 100);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-headline-1 text-gradient-primary font-bold">SilverSync</h1>
          <p className="text-body text-muted-foreground">
            Care Management Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-headline-2 text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-caption text-muted-foreground">
          Secure authentication powered by SilverSync
        </p>
      </div>
    </div>
  );
};

export default Login;
