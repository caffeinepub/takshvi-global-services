import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Lock, LogIn, LogOut, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// Hardcoded admin credentials (frontend-only admin access)
const ADMIN_CREDENTIALS: Record<string, string> = {
  "krishna.ku": "admin.ku",
  "dilip.ku": "admin.ku",
};

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("takshvi_admin_session") === "true";
  });
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    const expected = ADMIN_CREDENTIALS[adminId.trim()];
    if (expected && expected === adminPassword) {
      sessionStorage.setItem("takshvi_admin_session", "true");
      setAdminLoggedIn(true);
      toast.success(
        `Welcome, ${adminId.trim()}! Redirecting to Admin Dashboard…`,
      );
      setTimeout(() => navigate({ to: "/admin" }), 1200);
    } else {
      setAdminLoginError("Invalid Admin ID or password. Please try again.");
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("takshvi_admin_session");
    setAdminLoggedIn(false);
    setAdminId("");
    setAdminPassword("");
    toast.success("Signed out from admin session.");
  };

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Brand mark */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-sm overflow-hidden border border-gold-dim/40">
                <img
                  src="/assets/generated/takshvi-logo-transparent.dim_200x200.png"
                  alt="Takshvi Global Services"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="gold-divider mb-4" />
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-1.5 rounded-sm bg-gold-mid/10 border border-gold-dim/20">
                  <KeyRound className="w-4 h-4 text-gold-mid" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Admin Login
                </h1>
              </div>
              <p className="text-foreground/60 text-sm">
                Authorised administrators only
              </p>
            </div>

            <Card
              className="card-gold-border bg-card"
              data-ocid="admin_login.panel"
            >
              <CardContent className="p-6 lg:p-8">
                {adminLoggedIn ? (
                  <div
                    className="space-y-4"
                    data-ocid="admin_login.success_state"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-sm bg-gold-mid/10 border border-gold-dim/30">
                      <Shield className="w-4 h-4 text-gold-bright flex-shrink-0" />
                      <div>
                        <p className="text-gold-bright text-sm font-semibold">
                          Admin Session Active
                        </p>
                        <p className="text-foreground/50 text-xs">
                          You are logged in as admin
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => navigate({ to: "/admin" })}
                        className="btn-gold w-full rounded-sm text-sm"
                        data-ocid="admin_login.primary_button"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Go to Admin Dashboard
                      </Button>
                      <Button
                        onClick={handleAdminLogout}
                        variant="outline"
                        className="w-full border-border text-foreground/50 hover:text-foreground hover:bg-muted rounded-sm text-sm"
                        data-ocid="admin_login.secondary_button"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="admin-id"
                        className="text-foreground/60 text-xs uppercase tracking-wider"
                      >
                        Admin ID
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <Input
                          id="admin-id"
                          type="text"
                          placeholder="Enter your admin ID"
                          value={adminId}
                          onChange={(e) => {
                            setAdminId(e.target.value);
                            setAdminLoginError("");
                          }}
                          className="pl-9 bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                          data-ocid="admin_login.input"
                          autoComplete="username"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="admin-password"
                        className="text-foreground/60 text-xs uppercase tracking-wider"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={adminPassword}
                          onChange={(e) => {
                            setAdminPassword(e.target.value);
                            setAdminLoginError("");
                          }}
                          className="pl-9 bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                          data-ocid="admin_login.input"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                    {adminLoginError && (
                      <p
                        className="text-destructive text-xs"
                        data-ocid="admin_login.error_state"
                      >
                        {adminLoginError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="btn-gold w-full rounded-sm text-sm"
                      disabled={!adminId || !adminPassword}
                      data-ocid="admin_login.submit_button"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In as Admin
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Back to login link */}
            <p className="text-center text-foreground/40 text-xs">
              Not an admin?{" "}
              <a
                href="/login"
                className="text-gold-dim hover:text-gold-mid transition-colors"
                data-ocid="admin_login.link"
              >
                ← Back to Login
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
