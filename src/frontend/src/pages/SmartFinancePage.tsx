import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  Star,
  TrendingUp,
  Unlock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsCallerApproved,
  useIsCallerFinanceApproved,
  useRequestApproval,
  useRequestSmartFinanceAccess,
} from "../hooks/useQueries";

const financeFeatures = [
  {
    icon: TrendingUp,
    title: "Exclusive Lending Rates",
    desc: "Access preferential rates from 7.5% p.a. through our curated lender network",
    stat: "From 7.5% p.a.",
  },
  {
    icon: Zap,
    title: "Rapid Processing",
    desc: "Get decisions within 48 hours with our streamlined approval workflow",
    stat: "48-hour turnaround",
  },
  {
    icon: Shield,
    title: "Secured & Unsecured Loans",
    desc: "Up to ₹5 Crore in unsecured business loans with flexible repayment terms",
    stat: "Up to ₹5 Crore",
  },
  {
    icon: BarChart3,
    title: "Real-Time Portfolio Tracker",
    desc: "Monitor your investments and loan positions in a unified dashboard",
    stat: "Live analytics",
  },
];

export default function SmartFinancePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isFinanceApproved, isLoading: loadingFinance } =
    useIsCallerFinanceApproved();
  const { data: isApproved } = useIsCallerApproved();
  const requestAccess = useRequestSmartFinanceAccess();
  const requestApproval = useRequestApproval();

  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [approvalRequested, setApprovalRequested] = useState(false);

  const handleRequestAccess = async () => {
    if (!message.trim()) {
      toast.error("Please describe your financing needs.");
      return;
    }
    try {
      await requestAccess.mutateAsync({
        message: message.trim(),
        timestamp: BigInt(Date.now()),
      });
      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch {
      toast.error("Failed to submit request. Please try again.");
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

  // Loading
  if (loadingFinance) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div
          data-ocid="smart-finance.loading_state"
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-gold-mid animate-spin" />
          <p className="text-foreground/50 text-sm">Checking access…</p>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className="card-gold-border bg-card"
              data-ocid="smart-finance.panel"
            >
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gold-mid/10 border border-gold-dim/30 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-7 h-7 text-gold-mid" />
                </div>
                <div className="gold-divider mb-6" />
                <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                  Smart Finance Portal
                </h1>
                <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                  Sign in to access our exclusive Smart Finance tools and
                  preferential rates available to registered clients.
                </p>
                <Link to="/login" data-ocid="smart-finance.primary_button">
                  <Button className="btn-gold px-8 py-5 text-base rounded-sm">
                    Sign In to Access
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <p className="mt-6 text-foreground/40 text-sm">
                  Need help?{" "}
                  <a
                    href="tel:+919059296914"
                    className="text-gold-dim hover:text-gold-mid transition-colors"
                  >
                    Call 9059296914
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // Logged in, not site-approved yet
  if (!isApproved) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className="card-gold-border bg-card"
              data-ocid="smart-finance.panel"
            >
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gold-mid/10 border border-gold-dim/30 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-7 h-7 text-gold-mid" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                  Account Pending Approval
                </h1>
                <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                  Your account is awaiting admin approval. Once approved, you
                  can request access to our Smart Finance portal.
                </p>
                {approvalRequested ? (
                  <div
                    className="flex items-center justify-center gap-2 text-gold-mid"
                    data-ocid="smart-finance.success_state"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      Approval request submitted. We'll notify you soon.
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleRequestApproval}
                    disabled={requestApproval.isPending}
                    className="btn-gold px-8 py-5 text-base rounded-sm"
                    data-ocid="smart-finance.primary_button"
                  >
                    {requestApproval.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Request Account Approval
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // Logged in, approved, but NOT finance approved
  if (!isFinanceApproved) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preview of locked features */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-8 bg-gold-dim" />
                <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                  Exclusive Access
                </span>
                <div className="h-px w-8 bg-gold-dim" />
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                Unlock Smart Finance
              </h1>
              <p className="text-foreground/60 max-w-xl mx-auto">
                Request access to our exclusive financing tools. Our team
                reviews all requests personally to ensure the best match.
              </p>
            </div>

            {/* Feature preview (blurred) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 flex flex-col items-center justify-end pb-6 pointer-events-none">
                <Lock className="w-8 h-8 text-gold-mid mb-2 opacity-80" />
                <p className="text-foreground/60 text-sm">
                  Features unlocked after approval
                </p>
              </div>
              {financeFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="card-gold-border bg-card rounded-lg p-5 blur-[2px] opacity-70"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-sm bg-gold-mid/10">
                        <Icon className="w-4 h-4 text-gold-mid" />
                      </div>
                      <Badge className="bg-gold-mid/15 text-gold-bright border-gold-dim/30 text-xs">
                        {f.stat}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-base mb-1">
                      {f.title}
                    </h3>
                    <p className="text-foreground/50 text-sm">{f.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Request Access Card */}
            <Card
              className="card-gold-border bg-card"
              data-ocid="smart-finance.panel"
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-sm bg-gold-mid/10 border border-gold-dim/30">
                    <Unlock className="w-5 h-5 text-gold-mid" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl text-foreground">
                      Request Finance Access
                    </CardTitle>
                    <p className="text-foreground/50 text-sm mt-0.5">
                      Our admin team reviews and grants access promptly
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {submitted ? (
                  <div
                    className="text-center py-8"
                    data-ocid="smart-finance.success_state"
                  >
                    <CheckCircle2 className="w-12 h-12 text-gold-mid mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      Request Submitted!
                    </h3>
                    <p className="text-foreground/60 mb-6">
                      Our admin team will review your request and grant access
                      shortly. You will be notified once your Smart Finance
                      portal is active.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-foreground/60">
                      <a
                        href="tel:+919059296914"
                        className="flex items-center gap-2 text-gold-mid hover:text-gold-bright transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        +91 9059296914
                      </a>
                      <a
                        href="mailto:takshvipvt.ltd@gmail.com"
                        className="flex items-center gap-2 text-gold-mid hover:text-gold-bright transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        takshvipvt.ltd@gmail.com
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="sf-message"
                        className="block text-sm font-medium text-foreground/80 mb-2"
                      >
                        Tell us about your financing needs
                      </label>
                      <Textarea
                        id="sf-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your business, financing requirements, loan amount, and purpose…"
                        className="bg-input border-border text-foreground placeholder:text-foreground/30 min-h-[120px] focus:ring-gold-mid/50 resize-none"
                        data-ocid="smart-finance.textarea"
                      />
                    </div>
                    <div className="bg-muted/50 border border-border rounded-sm p-4 space-y-2">
                      <p className="text-sm font-medium text-foreground/80">
                        Direct Support
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a
                          href="tel:+919059296914"
                          className="flex items-center gap-2 text-gold-mid hover:text-gold-bright transition-colors text-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          9059296914
                        </a>
                        <a
                          href="mailto:takshvipvt.ltd@gmail.com"
                          className="flex items-center gap-2 text-gold-mid hover:text-gold-bright transition-colors text-sm"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          takshvipvt.ltd@gmail.com
                        </a>
                      </div>
                    </div>
                    <Button
                      onClick={handleRequestAccess}
                      disabled={requestAccess.isPending || !message.trim()}
                      className="btn-gold w-full py-5 text-base rounded-sm"
                      data-ocid="smart-finance.submit_button"
                    >
                      {requestAccess.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Access Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // ─── FINANCE APPROVED — Show portal content ─────────────────────────────
  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-sm bg-gold-mid/15 border border-gold-dim/30">
              <Unlock className="w-6 h-6 text-gold-bright" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                  Smart Finance Portal
                </h1>
                <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40">
                  <Star className="w-3 h-3 mr-1" /> Approved
                </Badge>
              </div>
              <p className="text-foreground/60">
                Welcome to your exclusive finance dashboard.
              </p>
            </div>
          </div>

          <div className="gold-divider mb-10" />

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {financeFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className="card-gold-border bg-card h-full"
                    data-ocid={`smart-finance.item.${i + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-sm bg-gold-mid/10">
                          <Icon className="w-4 h-4 text-gold-mid" />
                        </div>
                        <Badge className="bg-gold-mid/15 text-gold-bright border-gold-dim/30 text-xs">
                          {f.stat}
                        </Badge>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-sm mb-1">
                        {f.title}
                      </h3>
                      <p className="text-foreground/50 text-xs leading-relaxed">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Rate table */}
          <Card
            className="card-gold-border bg-card mb-8"
            data-ocid="smart-finance.table"
          >
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gold-mid" />
                Exclusive Financing Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold-dim/20">
                      {[
                        "Product",
                        "Min Amount",
                        "Max Amount",
                        "Rate",
                        "Tenure",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-3 text-gold-mid font-semibold text-xs tracking-wide uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        {
                          product: "Business Loan",
                          min: "₹5 Lakh",
                          max: "₹5 Crore",
                          rate: "9.5% p.a.",
                          tenure: "1–5 years",
                        },
                        {
                          product: "Working Capital",
                          min: "₹1 Lakh",
                          max: "₹1 Crore",
                          rate: "7.5% p.a.",
                          tenure: "6–24 months",
                        },
                        {
                          product: "Equipment Finance",
                          min: "₹10 Lakh",
                          max: "₹10 Crore",
                          rate: "8.75% p.a.",
                          tenure: "1–7 years",
                        },
                        {
                          product: "Startup Credit Line",
                          min: "₹50K",
                          max: "₹50 Lakh",
                          rate: "10.5% p.a.",
                          tenure: "12–36 months",
                        },
                      ] as const
                    ).map((row, i) => (
                      <tr
                        key={row.product}
                        className="border-b border-border/50 hover:bg-gold-mid/3 transition-colors"
                        data-ocid={`smart-finance.row.${i + 1}`}
                      >
                        <td className="py-3.5 px-3 text-foreground/70">
                          {row.product}
                        </td>
                        <td className="py-3.5 px-3 text-foreground/70">
                          {row.min}
                        </td>
                        <td className="py-3.5 px-3 text-foreground/70">
                          {row.max}
                        </td>
                        <td className="py-3.5 px-3 text-gold-bright font-semibold">
                          {row.rate}
                        </td>
                        <td className="py-3.5 px-3 text-foreground/70">
                          {row.tenure}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card
            className="card-gold-border bg-card"
            data-ocid="smart-finance.card"
          >
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl font-bold text-gold-bright mb-3">
                Ready to Apply?
              </h3>
              <p className="text-foreground/60 mb-6 max-w-md mx-auto">
                Contact your dedicated relationship manager to begin your
                financing journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a
                  href="tel:+919059296914"
                  className="flex items-center gap-3 btn-gold px-6 py-3 rounded-sm font-semibold text-sm"
                  data-ocid="smart-finance.link"
                >
                  <Phone className="w-4 h-4" />
                  +91 9059296914
                </a>
                <a
                  href="mailto:takshvipvt.ltd@gmail.com"
                  className="flex items-center gap-3 text-gold-mid hover:text-gold-bright transition-colors text-sm"
                  data-ocid="smart-finance.link"
                >
                  <Mail className="w-4 h-4" />
                  takshvipvt.ltd@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
