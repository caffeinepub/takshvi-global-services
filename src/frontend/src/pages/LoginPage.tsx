import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Phone,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsCallerAdmin,
  useIsCallerApproved,
  useIsCallerFinanceApproved,
  useRequestApproval,
} from "../hooks/useQueries";

export default function LoginPage() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: isApproved, isLoading: loadingApproved } =
    useIsCallerApproved();
  const { data: isFinanceApproved } = useIsCallerFinanceApproved();
  const { data: isAdmin } = useIsCallerAdmin();
  const requestApproval = useRequestApproval();
  const [approvalRequested, setApprovalRequested] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleRequestApproval = async () => {
    try {
      await requestApproval.mutateAsync();
      setApprovalRequested(true);
      toast.success("Approval request submitted!");
    } catch {
      toast.error("Failed to request approval.");
    }
  };

  // Auto-navigate approved users
  useEffect(() => {
    if (isAuthenticated && isApproved && isFinanceApproved) {
      setTimeout(() => navigate({ to: "/smart-finance" }), 1200);
    }
  }, [isAuthenticated, isApproved, isFinanceApproved, navigate]);

  if (isInitializing) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div
          data-ocid="login.loading_state"
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-7 h-7 text-gold-mid animate-spin" />
          <p className="text-foreground/50 text-sm">Initialising…</p>
        </div>
      </main>
    );
  }

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
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {isAuthenticated ? "Your Account" : "Welcome Back"}
              </h1>
              <p className="text-foreground/60 text-sm">
                {isAuthenticated
                  ? "Manage your Takshvi account and access"
                  : "Sign in to access Takshvi Global Services"}
              </p>
            </div>

            <Card className="card-gold-border bg-card" data-ocid="login.panel">
              <CardContent className="p-6 lg:p-8">
                {!isAuthenticated ? (
                  /* ── Not logged in ── */
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {[
                        {
                          icon: Lock,
                          text: "Secure Internet Identity authentication",
                        },
                        {
                          icon: Shield,
                          text: "Admin-reviewed account approvals",
                        },
                        {
                          icon: Star,
                          text: "Access exclusive Smart Finance portal",
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.text}
                            className="flex items-center gap-3 text-sm text-foreground/60"
                          >
                            <Icon className="w-4 h-4 text-gold-dim flex-shrink-0" />
                            {item.text}
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      onClick={handleAuth}
                      disabled={isLoggingIn}
                      className="btn-gold w-full py-5 text-base rounded-sm"
                      data-ocid="login.primary_button"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Signing In…
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In with Internet Identity
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* ── Logged in ── */
                  <div className="space-y-5">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-green-900/30 text-green-400 border-green-700/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Authenticated
                      </Badge>
                      {isAdmin && (
                        <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {isFinanceApproved && (
                        <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Finance Pro
                        </Badge>
                      )}
                    </div>

                    {/* Principal */}
                    {identity && (
                      <div className="bg-muted/50 rounded-sm p-3 border border-border">
                        <p className="text-xs text-foreground/50 mb-1 font-medium uppercase tracking-widest">
                          Your Principal
                        </p>
                        <p className="text-foreground/70 text-xs font-mono break-all">
                          {identity.getPrincipal().toString()}
                        </p>
                      </div>
                    )}

                    {/* Approval status */}
                    {!loadingApproved && (
                      <div className="border border-border rounded-sm p-4">
                        <p className="text-xs text-foreground/50 uppercase tracking-widest font-semibold mb-2">
                          Account Status
                        </p>
                        {isApproved ? (
                          <div
                            className="flex items-center gap-2 text-sm"
                            data-ocid="login.success_state"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-foreground/80">
                              Account approved
                            </span>
                          </div>
                        ) : approvalRequested ? (
                          <div
                            className="flex items-center gap-2 text-sm text-gold-mid"
                            data-ocid="login.success_state"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approval request submitted
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-foreground/60 text-sm">
                              Your account is pending approval.
                            </p>
                            <Button
                              onClick={handleRequestApproval}
                              disabled={requestApproval.isPending}
                              size="sm"
                              className="btn-gold rounded-sm text-sm"
                              data-ocid="login.secondary_button"
                            >
                              {requestApproval.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              ) : null}
                              Request Approval
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation shortcuts */}
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/admin" })}
                          className="text-sm text-gold-mid hover:text-gold-bright transition-colors text-left flex items-center gap-2"
                          data-ocid="login.link"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Go to Admin Dashboard
                        </button>
                      )}
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/smart-finance" })}
                          className="text-sm text-gold-mid hover:text-gold-bright transition-colors text-left flex items-center gap-2"
                          data-ocid="login.link"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Go to Smart Finance
                        </button>
                      )}
                    </div>

                    <Button
                      onClick={handleAuth}
                      variant="outline"
                      className="w-full border-border text-foreground/60 hover:text-foreground hover:bg-muted"
                      data-ocid="login.secondary_button"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support note */}
            <p className="text-center text-foreground/40 text-xs">
              Need help with your account?{" "}
              <a
                href="tel:+919059296914"
                className="text-gold-dim hover:text-gold-mid transition-colors inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                Contact support at 9059296914
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
