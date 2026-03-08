import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  Loader2,
  MessageSquare,
  Shield,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Property } from "../backend.d";
import { PropertyStatus, SmartFinanceRole } from "../backend.d";
import {
  ApprovalStatus,
  useAdminUpdateProperty,
  useGetAllContactSubmissions,
  useGetAllProperties,
  useGetFinanceRoles,
  useGetSmartFinanceRequests,
  useIsCallerAdmin,
  useListApprovals,
  useSetApproval,
  useSetPropertyStatus,
  useSetSmartFinanceRole,
} from "../hooks/useQueries";

// ─── Property Status Badge ──────────────────────────────────────────────────

function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const map: Record<PropertyStatus, { label: string; className: string }> = {
    [PropertyStatus.approved]: {
      label: "Approved",
      className: "bg-green-900/30 text-green-400 border-green-700/30",
    },
    [PropertyStatus.rejected]: {
      label: "Rejected",
      className: "bg-red-900/30 text-red-400 border-red-700/30",
    },
    [PropertyStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
    },
  };
  const { label, className } = map[status] ?? { label: status, className: "" };
  return <Badge className={`${className} text-xs`}>{label}</Badge>;
}

// ─── Admin Property Edit Dialog ────────────────────────────────────────────

function AdminPropertyEditDialog({
  property,
  open,
  onClose,
}: {
  property: Property;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: property.title,
    description: property.description,
    location: property.location,
    valuation: property.valuation,
    locationLink: property.locationLink,
  });

  const adminUpdateProperty = useAdminUpdateProperty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminUpdateProperty.mutateAsync({
        id: property.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        valuation: form.valuation.trim(),
        locationLink: form.locationLink.trim(),
        photos: property.photos ?? [],
        timestamp: BigInt(Date.now()),
      });
      toast.success("Property updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update property.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-gold-dim/30 text-foreground max-w-lg"
        data-ocid="admin.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            Edit Property
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-foreground/60 text-xs uppercase tracking-wider">
              Title
            </Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground/60 text-xs uppercase tracking-wider">
                Location
              </Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/60 text-xs uppercase tracking-wider">
                Valuation
              </Label>
              <Input
                value={form.valuation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valuation: e.target.value }))
                }
                placeholder="e.g. ₹50 Lakhs"
                className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground/60 text-xs uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm resize-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground/60 text-xs uppercase tracking-wider">
              Location Link (optional)
            </Label>
            <Input
              value={form.locationLink}
              onChange={(e) =>
                setForm((p) => ({ ...p, locationLink: e.target.value }))
              }
              type="url"
              placeholder="https://maps.google.com/..."
              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="btn-gold flex-1 rounded-sm text-sm"
              disabled={adminUpdateProperty.isPending}
              data-ocid="admin.save_button"
            >
              {adminUpdateProperty.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground/60 hover:text-foreground rounded-sm text-sm"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function truncatePrincipal(p: Principal | string): string {
  const s = typeof p === "string" ? p : p.toString();
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { label: string; className: string }> = {
    [ApprovalStatus.approved]: {
      label: "Approved",
      className: "bg-green-900/30 text-green-400 border-green-700/30",
    },
    [ApprovalStatus.rejected]: {
      label: "Rejected",
      className: "bg-red-900/30 text-red-400 border-red-700/30",
    },
    [ApprovalStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
    },
  };
  const { label, className } = map[status] ?? { label: status, className: "" };
  return <Badge className={`${className} text-xs`}>{label}</Badge>;
}

function FinanceRoleBadge({ role }: { role: SmartFinanceRole }) {
  if (role === SmartFinanceRole.financeApproved) {
    return (
      <Badge className="bg-gold-mid/20 text-gold-bright border-gold-dim/40 text-xs">
        <Star className="w-3 h-3 mr-1" /> Finance Pro
      </Badge>
    );
  }
  return (
    <Badge className="bg-muted text-muted-foreground text-xs">Standard</Badge>
  );
}

export default function AdminPage() {
  const { data: isAdmin, isLoading: loadingAdmin } = useIsCallerAdmin();
  const hasAdminSession =
    sessionStorage.getItem("takshvi_admin_session") === "true";
  const { data: approvals, isLoading: loadingApprovals } = useListApprovals();
  const { data: financeRequests, isLoading: loadingFinanceReqs } =
    useGetSmartFinanceRequests();
  const { data: contactSubmissions, isLoading: loadingContacts } =
    useGetAllContactSubmissions();
  const { data: financeRoles, isLoading: loadingRoles } = useGetFinanceRoles();
  const { data: allProperties, isLoading: loadingProperties } =
    useGetAllProperties();

  const setApproval = useSetApproval();
  const setFinanceRole = useSetSmartFinanceRole();
  const setPropertyStatus = useSetPropertyStatus();
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  const handleSetApproval = async (
    principal: Principal,
    status: ApprovalStatus,
  ) => {
    try {
      await setApproval.mutateAsync({ user: principal, status });
      toast.success(`User ${status}.`);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const handleGrantFinance = async (principal: Principal) => {
    try {
      await setFinanceRole.mutateAsync({
        user: principal,
        role: SmartFinanceRole.financeApproved,
      });
      toast.success("Smart Finance access granted!");
    } catch {
      toast.error("Failed to grant access.");
    }
  };

  const handleRevokeFinance = async (principal: Principal) => {
    try {
      await setFinanceRole.mutateAsync({
        user: principal,
        role: SmartFinanceRole.standard,
      });
      toast.success("Smart Finance access revoked.");
    } catch {
      toast.error("Failed to revoke access.");
    }
  };

  const handleSetPropertyStatus = async (
    id: bigint,
    status: PropertyStatus,
  ) => {
    try {
      await setPropertyStatus.mutateAsync({
        id,
        status,
        timestamp: BigInt(Date.now()),
      });
      toast.success(
        `Property ${status === PropertyStatus.approved ? "approved" : "rejected"}.`,
      );
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  if (loadingAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div
          data-ocid="admin.loading_state"
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-7 h-7 text-gold-mid animate-spin" />
          <p className="text-foreground/50 text-sm">Verifying admin access…</p>
        </div>
      </main>
    );
  }

  if (!isAdmin && !hasAdminSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div
          className="text-center max-w-md px-4"
          data-ocid="admin.error_state"
        >
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-foreground/60">
            You don't have permission to view the admin dashboard. Please sign
            in with an admin account.
          </p>
        </div>
      </main>
    );
  }

  const pendingApprovals =
    approvals?.filter((a) => a.status === ApprovalStatus.pending) ?? [];
  const stats = [
    { label: "Pending Approvals", value: pendingApprovals.length, icon: Clock },
    {
      label: "Finance Requests",
      value: financeRequests?.length ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Contact Submissions",
      value: contactSubmissions?.length ?? 0,
      icon: MessageSquare,
    },
    {
      label: "Finance Approved",
      value:
        financeRoles?.filter(([, r]) => r === SmartFinanceRole.financeApproved)
          .length ?? 0,
      icon: Star,
    },
    {
      label: "Total Properties",
      value: allProperties?.length ?? 0,
      icon: Building2,
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-sm bg-gold-mid/10 border border-gold-dim/30">
              <Shield className="w-6 h-6 text-gold-bright" />
            </div>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-foreground/50 text-sm mt-0.5">
                Manage users, approvals, and Smart Finance access
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.label}
                  className="card-gold-border bg-card"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-sm bg-gold-mid/10 flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold-mid" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gold-bright font-display">
                        {s.value}
                      </div>
                      <div className="text-foreground/50 text-xs">
                        {s.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Property edit dialog */}
          {editProperty && (
            <AdminPropertyEditDialog
              property={editProperty}
              open={!!editProperty}
              onClose={() => setEditProperty(null)}
            />
          )}

          {/* Tabs */}
          <Tabs defaultValue="approvals">
            <TabsList className="bg-card border border-border mb-6 gap-1 p-1 h-auto flex-wrap">
              {[
                {
                  value: "approvals",
                  label: "User Approvals",
                  count: pendingApprovals.length,
                },
                {
                  value: "finance-requests",
                  label: "Finance Requests",
                  count: financeRequests?.length,
                },
                {
                  value: "contacts",
                  label: "Contact Submissions",
                  count: contactSubmissions?.length,
                },
                {
                  value: "finance-roles",
                  label: "Finance Roles",
                  count: undefined,
                },
                {
                  value: "properties",
                  label: "Properties",
                  count: allProperties?.filter(
                    (p) => p.status === PropertyStatus.pending,
                  ).length,
                },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-gold-mid/15 data-[state=active]:text-gold-bright text-foreground/60 rounded-sm text-sm"
                  data-ocid={"admin.tab"}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge className="ml-2 bg-gold-mid/20 text-gold-bright border-gold-dim/30 text-xs px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ─── Tab 1: User Approvals ─── */}
            <TabsContent value="approvals">
              <Card
                className="card-gold-border bg-card"
                data-ocid="admin.table"
              >
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-mid" />
                    User Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {loadingApprovals ? (
                    <div
                      className="space-y-2 px-6 pb-6"
                      data-ocid="admin.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 bg-muted" />
                      ))}
                    </div>
                  ) : !approvals?.length ? (
                    <div
                      className="text-center py-12 text-foreground/50"
                      data-ocid="admin.empty_state"
                    >
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No users yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider pl-6">
                              Principal
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvals.map((user, i) => (
                            <TableRow
                              key={user.principal.toString()}
                              className="border-border hover:bg-gold-mid/3"
                              data-ocid={`admin.row.${i + 1}`}
                            >
                              <TableCell className="pl-6">
                                <span className="font-mono text-xs text-foreground/70">
                                  {truncatePrincipal(user.principal)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <ApprovalBadge status={user.status} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {user.status !== ApprovalStatus.approved && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSetApproval(
                                          user.principal,
                                          ApprovalStatus.approved,
                                        )
                                      }
                                      disabled={setApproval.isPending}
                                      className="btn-gold h-7 px-3 text-xs rounded-sm"
                                      data-ocid={`admin.confirm_button.${i + 1}`}
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                  )}
                                  {user.status !== ApprovalStatus.rejected && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleSetApproval(
                                          user.principal,
                                          ApprovalStatus.rejected,
                                        )
                                      }
                                      disabled={setApproval.isPending}
                                      className="border-destructive/50 text-destructive hover:bg-destructive/10 h-7 px-3 text-xs rounded-sm"
                                      data-ocid={`admin.delete_button.${i + 1}`}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Tab 2: Finance Requests ─── */}
            <TabsContent value="finance-requests">
              <Card
                className="card-gold-border bg-card"
                data-ocid="admin.table"
              >
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold-mid" />
                    Smart Finance Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {loadingFinanceReqs ? (
                    <div
                      className="space-y-2 px-6 pb-6"
                      data-ocid="admin.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 bg-muted" />
                      ))}
                    </div>
                  ) : !financeRequests?.length ? (
                    <div
                      className="text-center py-12 text-foreground/50"
                      data-ocid="admin.empty_state"
                    >
                      <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No finance requests yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider pl-6">
                              User
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Request
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Date
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {financeRequests.map((req, i) => (
                            <TableRow
                              key={`${req.user.toString()}-${i}`}
                              className="border-border hover:bg-gold-mid/3"
                              data-ocid={`admin.row.${i + 1}`}
                            >
                              <TableCell className="pl-6">
                                <span className="font-mono text-xs text-foreground/70">
                                  {truncatePrincipal(req.user)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <p className="text-foreground/70 text-sm max-w-xs truncate">
                                  {req.request}
                                </p>
                              </TableCell>
                              <TableCell>
                                <span className="text-foreground/50 text-xs">
                                  {new Date(
                                    Number(req.timestamp),
                                  ).toLocaleDateString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleGrantFinance(req.user)}
                                  disabled={setFinanceRole.isPending}
                                  className="btn-gold h-7 px-3 text-xs rounded-sm"
                                  data-ocid={`admin.confirm_button.${i + 1}`}
                                >
                                  {setFinanceRole.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  ) : (
                                    <Star className="w-3 h-3 mr-1" />
                                  )}
                                  Grant Access
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Tab 3: Contact Submissions ─── */}
            <TabsContent value="contacts">
              <Card
                className="card-gold-border bg-card"
                data-ocid="admin.table"
              >
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gold-mid" />
                    Contact Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {loadingContacts ? (
                    <div
                      className="space-y-2 px-6 pb-6"
                      data-ocid="admin.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 bg-muted" />
                      ))}
                    </div>
                  ) : !contactSubmissions?.length ? (
                    <div
                      className="text-center py-12 text-foreground/50"
                      data-ocid="admin.empty_state"
                    >
                      <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No contact submissions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 px-6 pb-6">
                      {contactSubmissions.map((sub, i) => (
                        <Card
                          key={`${sub.email}-${sub.name}`}
                          className="bg-muted/30 border-border"
                          data-ocid={`admin.item.${i + 1}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-foreground text-sm">
                                    {sub.name}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                                  <a
                                    href={`mailto:${sub.email}`}
                                    className="text-gold-dim hover:text-gold-mid transition-colors text-xs"
                                  >
                                    {sub.email}
                                  </a>
                                  {sub.phone && (
                                    <a
                                      href={`tel:${sub.phone}`}
                                      className="text-gold-dim hover:text-gold-mid transition-colors text-xs"
                                    >
                                      {sub.phone}
                                    </a>
                                  )}
                                </div>
                                <p className="text-foreground/60 text-sm leading-relaxed">
                                  {sub.message}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Tab 5: Properties ─── */}
            <TabsContent value="properties">
              <Card
                className="card-gold-border bg-card"
                data-ocid="admin.table"
              >
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gold-mid" />
                    Property Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {loadingProperties ? (
                    <div
                      className="space-y-2 px-6 pb-6"
                      data-ocid="admin.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 bg-muted" />
                      ))}
                    </div>
                  ) : !allProperties?.length ? (
                    <div
                      className="text-center py-12 text-foreground/50"
                      data-ocid="admin.empty_state"
                    >
                      <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No properties submitted yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider pl-6 w-12">
                              Photo
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Title
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Location
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Valuation
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Owner
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allProperties.map((property, i) => (
                            <TableRow
                              key={property.id.toString()}
                              className="border-border hover:bg-gold-mid/3"
                              data-ocid={`admin.row.${i + 1}`}
                            >
                              <TableCell className="pl-6">
                                {property.photos?.[0] ? (
                                  <div className="w-10 h-10 rounded-sm overflow-hidden border border-border flex-shrink-0">
                                    <img
                                      src={property.photos[0]}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-sm border border-border bg-gold-mid/5 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-4 h-4 text-gold-dim/40" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-foreground text-sm max-w-[140px] truncate block">
                                  {property.title}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-foreground/70 text-xs max-w-[100px] truncate block">
                                  {property.location}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gold-dim text-xs font-medium">
                                  {property.valuation}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs text-foreground/60">
                                  {truncatePrincipal(property.owner)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <PropertyStatusBadge status={property.status} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {property.status !==
                                    PropertyStatus.approved && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSetPropertyStatus(
                                          property.id,
                                          PropertyStatus.approved,
                                        )
                                      }
                                      disabled={setPropertyStatus.isPending}
                                      className="btn-gold h-7 px-3 text-xs rounded-sm"
                                      data-ocid={`admin.confirm_button.${i + 1}`}
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                  )}
                                  {property.status !==
                                    PropertyStatus.rejected && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleSetPropertyStatus(
                                          property.id,
                                          PropertyStatus.rejected,
                                        )
                                      }
                                      disabled={setPropertyStatus.isPending}
                                      className="border-destructive/50 text-destructive hover:bg-destructive/10 h-7 px-3 text-xs rounded-sm"
                                      data-ocid={`admin.delete_button.${i + 1}`}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditProperty(property)}
                                    className="border-gold-dim/40 text-gold-mid hover:border-gold-mid hover:bg-gold-mid/5 h-7 px-3 text-xs rounded-sm"
                                    data-ocid={`admin.edit_button.${i + 1}`}
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Tab 4: Finance Roles ─── */}
            <TabsContent value="finance-roles">
              <Card
                className="card-gold-border bg-card"
                data-ocid="admin.table"
              >
                <CardHeader className="px-6 pt-5 pb-4">
                  <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-mid" />
                    Finance Role Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {loadingRoles ? (
                    <div
                      className="space-y-2 px-6 pb-6"
                      data-ocid="admin.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 bg-muted" />
                      ))}
                    </div>
                  ) : !financeRoles?.length ? (
                    <div
                      className="text-center py-12 text-foreground/50"
                      data-ocid="admin.empty_state"
                    >
                      <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No finance roles assigned yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider pl-6">
                              Principal
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Role
                            </TableHead>
                            <TableHead className="text-foreground/50 text-xs uppercase tracking-wider">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {financeRoles.map(([principal, role], i) => (
                            <TableRow
                              key={principal.toString()}
                              className="border-border hover:bg-gold-mid/3"
                              data-ocid={`admin.row.${i + 1}`}
                            >
                              <TableCell className="pl-6">
                                <span className="font-mono text-xs text-foreground/70">
                                  {truncatePrincipal(principal)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <FinanceRoleBadge role={role} />
                              </TableCell>
                              <TableCell>
                                {role === SmartFinanceRole.financeApproved ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRevokeFinance(principal)
                                    }
                                    disabled={setFinanceRole.isPending}
                                    className="border-destructive/50 text-destructive hover:bg-destructive/10 h-7 px-3 text-xs rounded-sm"
                                    data-ocid={`admin.delete_button.${i + 1}`}
                                  >
                                    <Ban className="w-3 h-3 mr-1" />
                                    Revoke Access
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleGrantFinance(principal)
                                    }
                                    disabled={setFinanceRole.isPending}
                                    className="btn-gold h-7 px-3 text-xs rounded-sm"
                                    data-ocid={`admin.confirm_button.${i + 1}`}
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    Grant Access
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
