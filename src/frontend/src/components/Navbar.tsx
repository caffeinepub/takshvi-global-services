import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsCallerAdmin,
  useIsCallerFinanceApproved,
} from "../hooks/useQueries";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isFinanceApproved } = useIsCallerFinanceApproved();

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

  const hasAdminSession =
    sessionStorage.getItem("takshvi_admin_session") === "true";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/properties", label: "Properties", locked: false },
    {
      to: "/smart-finance",
      label: "Smart Finance",
      locked: isAuthenticated && !isFinanceApproved,
    },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-deep/95 backdrop-blur-md border-b border-gold-dim/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            data-ocid="nav.link"
          >
            <div className="w-10 h-10 rounded-sm overflow-hidden border border-gold-dim/40 group-hover:border-gold-mid/70 transition-colors">
              <img
                src="/assets/generated/takshvi-logo-transparent.dim_200x200.png"
                alt="Takshvi Global Services"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-gold-bright leading-tight block">
                Takshvi
              </span>
              <span className="text-xs text-foreground/60 tracking-widest uppercase leading-tight block">
                Global Services
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                  isActive(link.to)
                    ? "text-gold-bright bg-gold-mid/10"
                    : "text-foreground/70 hover:text-gold-mid hover:bg-gold-mid/5"
                }`}
                data-ocid="nav.link"
              >
                {link.label}
                {link.locked && <Lock className="w-3 h-3 text-gold-dim" />}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-mid rounded-full"
                  />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/admin")
                    ? "text-gold-bright bg-gold-mid/10"
                    : "text-foreground/70 hover:text-gold-mid hover:bg-gold-mid/5"
                }`}
                data-ocid="nav.link"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side: auth + badges */}
          <div className="hidden md:flex items-center gap-3">
            {!hasAdminSession && (
              <Link
                to="/admin-login"
                className="text-xs text-gold-dim/70 hover:text-gold-dim transition-colors"
                data-ocid="nav.link"
              >
                Admin
              </Link>
            )}
            {isAuthenticated && isFinanceApproved && (
              <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Finance Pro
              </Badge>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
              className={`border-gold-dim/50 hover:border-gold-mid transition-all ${
                isAuthenticated
                  ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                  : "text-gold-mid hover:text-gold-bright btn-gold border-none"
              }`}
              data-ocid="nav.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </>
              )}
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-foreground/70 hover:text-gold-mid transition-colors"
            data-ocid="nav.toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-navy-deep border-t border-gold-dim/20"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "text-gold-bright bg-gold-mid/10"
                      : "text-foreground/70 hover:text-gold-mid"
                  }`}
                  data-ocid="nav.link"
                >
                  {link.label}
                  {link.locked && (
                    <Lock className="w-3.5 h-3.5 text-gold-dim" />
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-foreground/70 hover:text-gold-mid"
                  data-ocid="nav.link"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {!hasAdminSession && (
                <Link
                  to="/admin-login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gold-dim/70 hover:text-gold-dim"
                  data-ocid="nav.link"
                >
                  Admin Login
                </Link>
              )}
              <div className="pt-2 border-t border-gold-dim/20">
                <Button
                  onClick={handleAuth}
                  disabled={isLoggingIn}
                  className="w-full btn-gold"
                  data-ocid="nav.primary_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : isAuthenticated ? (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
