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
  Camera,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  ImageIcon,
  Loader2,
  MapPin,
  PlusCircle,
  Tag,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Property } from "../backend.d";
import { PropertyStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddPropertyPhoto,
  useGetApprovedProperties,
  useGetMyProperties,
  useIsCallerApproved,
  useRemovePropertyPhoto,
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

// ─── Photo Upload Zone ─────────────────────────────────────────────────────

interface UploadedPhoto {
  previewUrl: string; // local object URL for preview
  blobUrl: string | null; // final blob storage URL after upload
  uploading: boolean;
  error?: string;
  file: File;
}

function PhotoUploadZone({
  photos,
  onPhotosChange,
  maxPhotos = 10,
}: {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentPhotosRef = useRef<UploadedPhoto[]>(photos);
  currentPhotosRef.current = photos;

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      const current = currentPhotosRef.current;
      const remaining = maxPhotos - current.length;
      const toAdd = fileArr.slice(0, remaining);
      if (!toAdd.length) return;

      const newEntries: UploadedPhoto[] = toAdd.map((f) => ({
        previewUrl: URL.createObjectURL(f),
        blobUrl: null,
        uploading: true,
        file: f,
      }));
      const updated = [...current, ...newEntries];
      onPhotosChange(updated);

      for (let i = 0; i < toAdd.length; i++) {
        const idx = current.length + i;
        const file = toAdd[i];
        (async () => {
          try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const blobObj = ExternalBlob.fromBytes(bytes);
            const url = blobObj.getDirectURL();
            const latest = [...currentPhotosRef.current];
            latest[idx] = { ...latest[idx], blobUrl: url, uploading: false };
            onPhotosChange(latest);
          } catch {
            const latest = [...currentPhotosRef.current];
            latest[idx] = {
              ...latest[idx],
              uploading: false,
              error: "Upload failed",
            };
            onPhotosChange(latest);
            toast.error(`Failed to upload ${file.name}`);
          }
        })();
      }
    },
    [maxPhotos, onPhotosChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].previewUrl);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-foreground/60 text-xs uppercase tracking-wider">
          Photos{" "}
          <span className="text-foreground/30 normal-case">
            (up to {maxPhotos})
          </span>
        </Label>
        <span className="text-foreground/40 text-xs">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      {/* Thumbnails grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {photos.map((photo, i) => (
            <div
              key={photo.previewUrl}
              className="relative group aspect-square rounded-sm overflow-hidden border border-border bg-muted"
              data-ocid={`properties.photo.item.${i + 1}`}
            >
              <img
                src={photo.previewUrl}
                alt={`Property listing ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {photo.uploading && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-gold-mid animate-spin" />
                </div>
              )}
              {photo.error && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80 hover:border-destructive"
                data-ocid={`properties.photo.delete_button.${i + 1}`}
                aria-label="Remove photo"
              >
                <X className="w-3 h-3 text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-sm p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
            isDragging
              ? "border-gold-mid bg-gold-mid/5"
              : "border-border hover:border-gold-dim/50 hover:bg-gold-mid/3"
          }`}
          onClick={() => inputRef.current?.click()}
          data-ocid="properties.dropzone"
          aria-label="Upload photos"
        >
          <Camera className="w-6 h-6 text-foreground/30" />
          <p className="text-foreground/50 text-xs text-center">
            Drag & drop photos here, or{" "}
            <span className="text-gold-dim font-medium">browse</span>
          </p>
          <p className="text-foreground/30 text-xs">
            JPG, PNG, WebP — max {maxPhotos} photos
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
        data-ocid="properties.upload_button"
      />
    </div>
  );
}

// ─── Property Card (public view) ──────────────────────────────────────────

function PropertyCard({
  property,
  index,
}: { property: Property; index: number }) {
  const firstPhoto = property.photos?.[0];
  const photoCount = property.photos?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Card
        className="card-gold-border bg-card h-full flex flex-col overflow-hidden"
        data-ocid={`properties.item.${index + 1}`}
      >
        {/* Photo hero */}
        {firstPhoto ? (
          <div className="relative aspect-video overflow-hidden bg-muted flex-shrink-0">
            <img
              src={firstPhoto}
              alt={property.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photoCount > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 border border-border/60 rounded-sm px-1.5 py-0.5 text-xs text-foreground/70">
                <ImageIcon className="w-3 h-3" />
                {photoCount} photos
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gold-mid/5 border-b border-gold-dim/15 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-gold-dim/30" />
          </div>
        )}

        <CardContent className="p-6 flex flex-col h-full gap-4">
          {/* Title + location */}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1.5 text-foreground/60 text-sm">
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

  // Existing photos from backend
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    property.photos ?? [],
  );
  // New photos being uploaded
  const [newPhotos, setNewPhotos] = useState<UploadedPhoto[]>([]);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const updateProperty = useUpdateProperty();
  const addPhoto = useAddPropertyPhoto();
  const removePhoto = useRemovePropertyPhoto();

  const handleRemoveExisting = async (url: string) => {
    setRemovingUrl(url);
    try {
      await removePhoto.mutateAsync({ id: property.id, photoUrl: url });
      setExistingPhotos((prev) => prev.filter((u) => u !== url));
      toast.success("Photo removed.");
    } catch {
      toast.error("Failed to remove photo.");
    } finally {
      setRemovingUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload any newly added photos first
    const pendingNewUrls = newPhotos
      .filter((p) => p.blobUrl)
      .map((p) => p.blobUrl as string);

    // Add new photos to backend
    for (const url of pendingNewUrls) {
      try {
        await addPhoto.mutateAsync({ id: property.id, photoUrl: url });
      } catch {
        // continue even if individual photo fails
      }
    }

    const allPhotos = [...existingPhotos, ...pendingNewUrls];

    try {
      await updateProperty.mutateAsync({
        id: property.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        valuation: form.valuation.trim(),
        locationLink: form.locationLink.trim(),
        photos: allPhotos,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Property updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update property. Please try again.");
    }
  };

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-gold-dim/30 text-foreground max-w-xl max-h-[90vh] overflow-y-auto"
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

          {/* Existing photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground/60 text-xs uppercase tracking-wider">
                Current Photos
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {existingPhotos.map((url, i) => (
                  <div
                    key={url}
                    className="relative group aspect-square rounded-sm overflow-hidden border border-border bg-muted"
                    data-ocid={`properties.photo.item.${i + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Existing listing ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(url)}
                      disabled={removingUrl === url}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80 hover:border-destructive disabled:opacity-50"
                      data-ocid={`properties.photo.delete_button.${i + 1}`}
                      aria-label="Remove photo"
                    >
                      {removingUrl === url ? (
                        <Loader2 className="w-3 h-3 animate-spin text-foreground" />
                      ) : (
                        <X className="w-3 h-3 text-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add more photos */}
          {totalPhotos < 10 && (
            <div className="space-y-2">
              <Label className="text-foreground/60 text-xs uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Add More Photos
              </Label>
              <PhotoUploadZone
                photos={newPhotos}
                onPhotosChange={setNewPhotos}
                maxPhotos={10 - existingPhotos.length}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="btn-gold flex-1 rounded-sm"
              disabled={
                updateProperty.isPending || newPhotos.some((p) => p.uploading)
              }
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
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const [editTarget, setEditTarget] = useState<Property | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingUploads = uploadedPhotos.filter((p) => p.uploading);
    if (pendingUploads.length > 0) {
      toast.error("Please wait for photos to finish uploading.");
      return;
    }
    const photoUrls = uploadedPhotos
      .filter((p) => p.blobUrl)
      .map((p) => p.blobUrl as string);

    try {
      await submitProperty.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        valuation: form.valuation.trim(),
        locationLink: form.locationLink.trim(),
        photos: photoUrls,
        timestamp: BigInt(Date.now()),
      });
      // Revoke object URLs
      for (const p of uploadedPhotos) URL.revokeObjectURL(p.previewUrl);
      setForm({
        title: "",
        description: "",
        location: "",
        valuation: "",
        locationLink: "",
      });
      setUploadedPhotos([]);
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
                  className="card-gold-border bg-card overflow-hidden"
                  data-ocid="properties.loading_state"
                >
                  <Skeleton className="w-full aspect-video bg-muted" />
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
                <div className="mt-6 flex items-start gap-2 p-3 rounded-sm bg-gold-mid/5 border border-gold-dim/20">
                  <Camera className="w-4 h-4 text-gold-mid flex-shrink-0 mt-0.5" />
                  <p className="text-foreground/60 text-sm">
                    Upload up to 10 photos to make your listing stand out. The
                    first photo will be used as the hero image.
                  </p>
                </div>
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

                        {/* Photo upload */}
                        <PhotoUploadZone
                          photos={uploadedPhotos}
                          onPhotosChange={setUploadedPhotos}
                          maxPhotos={10}
                        />

                        <Button
                          type="submit"
                          className="btn-gold w-full rounded-sm"
                          disabled={
                            submitProperty.isPending ||
                            uploadedPhotos.some((p) => p.uploading)
                          }
                          data-ocid="properties.submit_button"
                        >
                          {submitProperty.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : uploadedPhotos.some((p) => p.uploading) ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                          )}
                          {uploadedPhotos.some((p) => p.uploading)
                            ? "Uploading photos…"
                            : "Submit for Review"}
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
                {myProperties.map((property, i) => {
                  const firstPhoto = property.photos?.[0];
                  return (
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
                          {/* Thumbnail */}
                          {firstPhoto ? (
                            <div className="w-16 h-16 rounded-sm overflow-hidden border border-border flex-shrink-0">
                              <img
                                src={firstPhoto}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-sm border border-border bg-gold-mid/5 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-gold-dim/40" />
                            </div>
                          )}

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
                              {property.photos?.length > 0 && (
                                <span className="text-foreground/40 text-xs flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  {property.photos.length} photo
                                  {property.photos.length !== 1 ? "s" : ""}
                                </span>
                              )}
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
                  );
                })}
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
