import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Door } from "@/components/door/Door";
import { DoorMark } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  fullName: z.string().trim().min(2, { message: "Full name is required" }).max(100).optional(),
});

const Login = () => {
  useDocumentTitle("Sign in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useAuth();

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
      
      await signIn(validated.email, validated.password);

      toast({
        title: "Login successful",
        description: "Welcome back to SilverSync",
      });
      
      navigate("/dashboard", { replace: true });
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
      
      await signUp(validated.email, validated.password, validated.fullName);

      toast({
        title: "Account created",
        description: "Welcome to SilverSync",
      });
      
      navigate("/dashboard", { replace: true });
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

  const field = "space-y-1.5";
  const label = "text-sm font-bold";

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.15fr_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">
        Skip to sign in
      </a>
      {/* The entrance: a stretch of corridor, one call light on */}
      <aside className="relative flex flex-col justify-between gap-10 overflow-hidden border-b border-border bg-card px-[var(--gutter)] py-8 lg:border-b-0 lg:border-r lg:p-14">
        <div className="flex items-center gap-2.5">
          <DoorMark />
          <span className="text-lg font-extrabold tracking-[-0.03em]">SilverSync</span>
        </div>
        <p className="text-display max-w-[13ch] text-[clamp(1.75rem,1.2rem+3vw,4rem)]">Every resident has their own door.</p>
        <div className="login-corridor" aria-hidden="true">
          {["101", "102", "103", "104", "105"].map((room, i) => (
            <Door key={room} room={room} name="" size="md" call={i === 2} className="login-corridor__door" />
          ))}
        </div>
      </aside>

      <main id="main" className="flex items-center justify-center px-[var(--gutter)] py-12">
        <div className="w-full max-w-[26rem] space-y-8">
          <div className="space-y-2">
            <h1 className="text-headline-1">Start your shift</h1>
            <p className="text-muted-foreground">Sign in with your work email to see who needs you today.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className={field}>
                  <label htmlFor="login-email" className={label}>Work email</label>
                  <Input id="login-email" type="email" autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className={field}>
                  <label htmlFor="login-password" className={label}>Password</label>
                  <Input id="login-password" type="password" autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className={field}>
                  <label htmlFor="signup-name" className={label}>Full name</label>
                  <Input id="signup-name" type="text" autoComplete="name" value={fullName}
                    onChange={(e) => setFullName(e.target.value)} required disabled={isLoading} />
                </div>
                <div className={field}>
                  <label htmlFor="signup-email" className={label}>Work email</label>
                  <Input id="signup-email" type="email" autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className={field}>
                  <label htmlFor="signup-password" className={label}>Password</label>
                  <Input id="signup-password" type="password" autoComplete="new-password" minLength={6} value={password}
                    onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                  <p className="text-xs text-muted-foreground">At least 6 characters. New accounts start with reception access; an administrator can change your role.</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="border-t border-border pt-6 text-sm lg:hidden">
            New here? Read <Link to="/about" className="text-link">what SilverSync does</Link>.
          </p>
          <div className="hidden items-center gap-4 border-t border-border pt-6 lg:flex">
            <img src="/qe-silversync.png" alt="QR code that opens SilverSync on a phone" width={72} height={72}
              className="h-[72px] w-[72px] rounded-md border border-border bg-white p-1"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="space-y-1 text-sm">
              <p className="font-bold">On the floor?</p>
              <p className="text-muted-foreground">Scan to open SilverSync on your phone, or read <Link to="/about" className="text-link">what SilverSync does</Link>.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
