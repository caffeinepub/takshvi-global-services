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
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Loader2,
  MapPin,
  PlusCircle,
  Tag,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Property } from "../backend.d";
import { PropertyStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetApprovedProperties,
  useGetMyProperties,
  useIsCallerApproved,
  useSubmitProperty,
  useUpdateProperty,
} from "../hooks/useQueries";

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PropertyStatus }) {
  const map: Record<
    PropertyStatus,
    { label: string; className: string; icon: typeof CheckCircle2 }
  > = {
    [PropertyStatus.approved]: {
      label: "Approved",
      className: "bg-green-900/30 text-green-400 border-green-700/30",
      icon: CheckCircle2,
    },
    [PropertyStatus.rejected]: {
      label: "Rejected",
      className: "bg-red-900/30 text-red-400 border-red-700/30",
      icon: XCircle,
    },
    [PropertyStatus.pending]: {
      label: "Pending Review",
      className: "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
      icon: Clock,
    },
  };
  const {
    label,
    className,
    icon: Icon,
  } = map[status] ?? {
    label: status,
    className: "",
    icon: Clock,
  };
  return (
    <Badge className={`${className} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

// ─── Property Card (public view) ──────────────────────────────────────────

function PropertyCard({
  property,
  index,
}: { property: Property; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Card
        className="card-gold-border bg-card h-full flex flex-col"
        data-ocid={`properties.item.${index + 1}`}
      >
        <CardContent className="p-6 flex flex-col h-full gap-4">
          {/* Title + location */}
          <div>
            <div className="flex items-start gap-2 mb-1">
              <div className="p-1.5 rounded-sm bg-gold-mid/10 border border-gold-dim/30 flex-shrink-0 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gold-mid" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                {property.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-foreground/60 text-sm">
              <MapPin className="w-3.5 h-3.5 text-gold-dim flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          </div>

          {/* Valuation */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-sm bg-gold-mid/8 border border-gold-dim/20">
            <Tag className="w-3.5 h-3.5 text-gold-mid flex-shrink-0" />
            <span className="text-gold-bright font-display font-semibold text-sm">
              {property.valuation}
            </span>
            <span className="text-foreground/40 text-xs ml-auto">
              Valuation
            </span>
          </div>

          {/* Description */}
          <p className="text-foreground/60 text-sm leading-relaxed flex-grow line-clamp-3">
            {property.description}
          </p>

          {/* Location link */}
          {property.locationLink && (
            <a
              href={property.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gold-mid hover:text-gold-bright transition-colors text-sm font-medium mt-auto"
              data-ocid={`properties.link.${index + 1}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Location
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Edit Property Dialog ─────────────────────────────────────────────────

function EditPropertyDialog({
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

  const updateProperty = useUpdateProperty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProperty.mutateAsync({
        id: property.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        valuation: form.valuation.trim(),
        locationLink: form.locationLink.trim(),
        timestamp: BigInt(Date.now()),
      });
      toast.success("Property updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update property. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-gold-dim/30 text-foreground max-w-lg"
        data-ocid="properties.dialog"
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
              data-ocid="properties.input"
              required
            />
          </div>
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
              data-ocid="properties.input"
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
              data-ocid="properties.input"
              required
            />
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
              data-ocid="properties.textarea"
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
              placeholder="https://maps.google.com/..."
              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
              data-ocid="properties.input"
              type="url"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="btn-gold flex-1 rounded-sm"
              disabled={updateProperty.isPending}
              data-ocid="properties.save_button"
            >
              {updateProperty.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground/60 hover:text-foreground rounded-sm"
              data-ocid="properties.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isApproved } = useIsCallerApproved();
  const canPost = isAuthenticated && isApproved;

  const { data: approvedProperties, isLoading: loadingApproved } =
    useGetApprovedProperties();
  const { data: myProperties, isLoading: loadingMine } = useGetMyProperties();

  const submitProperty = useSubmitProperty();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    valuation: "",
    locationLink: "",
  });

  const [editTarget, setEditTarget] = useState<Property | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitProperty.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        valuation: form.valuation.trim(),
        locationLink: form.locationLink.trim(),
        timestamp: BigInt(Date.now()),
      });
      setForm({
        title: "",
        description: "",
        location: "",
        valuation: "",
        locationLink: "",
      });
      setSubmitted(true);
      toast.success("Property submitted for admin review.");
    } catch {
      toast.error("Failed to submit property. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* ─── Hero ─── */}
      <section className="relative py-16 lg:py-20 bg-navy-deep border-b border-gold-dim/20 overflow-hidden">
        <div className="absolute inset-0 bg-deco-pattern opacity-10 pointer-events-none" />
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-gold-mid" />
              <span className="text-gold-mid text-xs tracking-[0.25em] uppercase font-semibold">
                Real Estate
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Properties
            </h1>
            <p className="text-foreground/60 text-lg leading-relaxed">
              Browse available properties listed by our verified clients. Each
              listing is reviewed and approved by our admin team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Public Listings ─── */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-gold-dim" />
              <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                Available Now
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              Listed Properties
            </h2>
          </motion.div>

          {loadingApproved ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="card-gold-border bg-card"
                  data-ocid="properties.loading_state"
                >
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <Skeleton className="h-12 w-full bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-2/3 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !approvedProperties?.length ? (
            <div
              className="text-center py-20 text-foreground/40"
              data-ocid="properties.empty_state"
            >
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-display text-lg">
                No properties available yet.
              </p>
              <p className="text-sm mt-1">Check back soon for new listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedProperties.map((property, i) => (
                <PropertyCard
                  key={property.id.toString()}
                  property={property}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── List Your Property (auth + approved only) ─── */}
      {canPost && (
        <section className="py-16 lg:py-20 bg-card border-t border-gold-dim/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-gold-dim" />
                  <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                    Submit a Listing
                  </span>
                </div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  List Your Property
                </h2>
                <p className="text-foreground/60 leading-relaxed">
                  Submit your property for review. Once approved by our admin
                  team, it will appear in the public listings above.
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card
                  className="card-gold-border bg-card"
                  data-ocid="properties.panel"
                >
                  <CardContent className="p-6 lg:p-8">
                    {submitted ? (
                      <div
                        className="flex flex-col items-center py-8 gap-4 text-center"
                        data-ocid="properties.success_state"
                      >
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                        <div>
                          <p className="font-display text-lg font-bold text-foreground">
                            Submission Received
                          </p>
                          <p className="text-foreground/60 text-sm mt-1">
                            Your property has been submitted for admin review.
                            You'll see it in "My Properties" below.
                          </p>
                        </div>
                        <Button
                          onClick={() => setSubmitted(false)}
                          className="btn-gold rounded-sm text-sm"
                          data-ocid="properties.secondary_button"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Submit Another
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="prop-title"
                              className="text-foreground/60 text-xs uppercase tracking-wider"
                            >
                              Property Title
                            </Label>
                            <Input
                              id="prop-title"
                              value={form.title}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="e.g. 3BHK Apartment in Banjara Hills"
                              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                              data-ocid="properties.input"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="prop-location"
                              className="text-foreground/60 text-xs uppercase tracking-wider"
                            >
                              Location
                            </Label>
                            <Input
                              id="prop-location"
                              value={form.location}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  location: e.target.value,
                                }))
                              }
                              placeholder="e.g. Hyderabad, Telangana"
                              className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                              data-ocid="properties.input"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="prop-valuation"
                            className="text-foreground/60 text-xs uppercase tracking-wider"
                          >
                            Valuation
                          </Label>
                          <Input
                            id="prop-valuation"
                            value={form.valuation}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                valuation: e.target.value,
                              }))
                            }
                            placeholder="e.g. ₹1.2 Crore"
                            className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                            data-ocid="properties.input"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="prop-description"
                            className="text-foreground/60 text-xs uppercase tracking-wider"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="prop-description"
                            value={form.description}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            rows={4}
                            placeholder="Describe the property in detail…"
                            className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm resize-none"
                            data-ocid="properties.textarea"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="prop-link"
                            className="text-foreground/60 text-xs uppercase tracking-wider"
                          >
                            Location Link{" "}
                            <span className="text-foreground/30 normal-case">
                              (optional)
                            </span>
                          </Label>
                          <Input
                            id="prop-link"
                            value={form.locationLink}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                locationLink: e.target.value,
                              }))
                            }
                            type="url"
                            placeholder="https://maps.google.com/..."
                            className="bg-muted/40 border-border focus:border-gold-dim rounded-sm text-sm"
                            data-ocid="properties.input"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="btn-gold w-full rounded-sm"
                          disabled={submitProperty.isPending}
                          data-ocid="properties.submit_button"
                        >
                          {submitProperty.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                          )}
                          Submit for Review
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ─── My Properties (auth + approved only) ─── */}
      {canPost && (
        <section className="py-16 lg:py-20 bg-background border-t border-gold-dim/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-gold-dim" />
                <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                  My Listings
                </span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                My Properties
              </h2>
            </motion.div>

            {loadingMine ? (
              <div className="space-y-3" data-ocid="properties.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-20 w-full bg-muted rounded-sm"
                  />
                ))}
              </div>
            ) : !myProperties?.length ? (
              <div
                className="text-center py-16 text-foreground/40"
                data-ocid="properties.empty_state"
              >
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-display text-base">
                  You haven't listed any properties yet.
                </p>
                <p className="text-sm mt-1">
                  Use the form above to submit your first property.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myProperties.map((property, i) => (
                  <motion.div
                    key={property.id.toString()}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card
                      className="card-gold-border bg-card"
                      data-ocid={`properties.item.${i + 1}`}
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-foreground text-base truncate">
                              {property.title}
                            </h3>
                            <StatusBadge status={property.status} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-foreground/50 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {property.location}
                            </span>
                            <span className="text-gold-dim text-xs flex items-center gap-1 font-medium">
                              <Tag className="w-3 h-3" />
                              {property.valuation}
                            </span>
                          </div>
                          <p className="text-foreground/50 text-xs mt-2 line-clamp-1">
                            {property.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditTarget(property)}
                          className="border-gold-dim/40 text-gold-mid hover:border-gold-mid hover:bg-gold-mid/5 flex-shrink-0 rounded-sm"
                          data-ocid={`properties.edit_button.${i + 1}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sign-in prompt for unauthenticated or non-approved users */}
      {!canPost && (
        <section className="py-16 bg-card border-t border-gold-dim/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="card-gold-border bg-card max-w-xl mx-auto">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-foreground text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gold-mid" />
                  Want to List Your Property?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/60 text-sm mb-4">
                  {!isAuthenticated
                    ? "Sign in and request account approval to list your property on our platform."
                    : "Your account needs admin approval before you can list properties."}
                </p>
                <a href="/login">
                  <Button
                    className="btn-gold rounded-sm text-sm"
                    data-ocid="properties.primary_button"
                  >
                    {!isAuthenticated
                      ? "Sign In to Get Started"
                      : "Check Account Status"}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Edit dialog */}
      {editTarget && (
        <EditPropertyDialog
          property={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </main>
  );
}
