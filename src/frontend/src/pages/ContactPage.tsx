import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitContactSubmission } from "../hooks/useQueries";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const submit = useSubmitContactSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await submit.mutateAsync(form);
      setSubmitted(true);
      toast.success("Message sent! We'll be in touch shortly.");
    } catch {
      toast.error("Failed to send. Please try again or contact us directly.");
    }
  };

  const contactDetails = [
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 9059296914",
      href: "tel:+919059296914",
      display: "+91 9059296914",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: "takshvipvt.ltd@gmail.com",
      href: "mailto:takshvipvt.ltd@gmail.com",
      display: "takshvipvt.ltd@gmail.com",
    },
    {
      icon: Clock,
      label: "Office Hours",
      value: "Mon – Sat, 9:00 AM – 6:00 PM",
      href: null,
      display: "Mon – Sat, 9:00 AM – 6:00 PM",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "India",
      href: null,
      display: "Serving clients across India",
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Header */}
      <section className="bg-navy-deep py-16 border-b border-gold-dim/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-deco-pattern opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-dim" />
              <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                Reach Out
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-gold-bright">Us</span>
            </h1>
            <p className="text-foreground/60 text-lg">
              Our team of financial experts is ready to assist you. Send us a
              message or reach out directly.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card
                  className="card-gold-border bg-card"
                  data-ocid="contact.panel"
                >
                  <CardContent className="p-6 lg:p-8">
                    {submitted ? (
                      <div
                        className="text-center py-12"
                        data-ocid="contact.success_state"
                      >
                        <div className="w-16 h-16 rounded-full bg-gold-mid/10 border border-gold-dim/30 flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-7 h-7 text-gold-bright" />
                        </div>
                        <div className="gold-divider mb-6" />
                        <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                          Message Received!
                        </h3>
                        <p className="text-foreground/60 mb-6">
                          Thank you for reaching out. Our team will respond
                          within 24 business hours.
                        </p>
                        <Button
                          onClick={() => {
                            setSubmitted(false);
                            setForm({
                              name: "",
                              email: "",
                              phone: "",
                              message: "",
                            });
                          }}
                          variant="outline"
                          className="border-gold-dim/50 text-gold-mid hover:border-gold-mid hover:bg-gold-mid/5"
                          data-ocid="contact.secondary_button"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                            Send Us a Message
                          </h2>
                          <p className="text-foreground/50 text-sm">
                            Fields marked{" "}
                            <span className="text-gold-mid">*</span> are
                            required.
                          </p>
                        </div>
                        <form
                          onSubmit={handleSubmit}
                          className="space-y-5"
                          noValidate
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <Label
                                htmlFor="name"
                                className="text-foreground/80 text-sm mb-2 block"
                              >
                                Full Name{" "}
                                <span className="text-gold-mid">*</span>
                              </Label>
                              <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Rajesh Kumar"
                                className="bg-input border-border text-foreground placeholder:text-foreground/30 focus:ring-gold-mid/50"
                                required
                                data-ocid="contact.input"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="email"
                                className="text-foreground/80 text-sm mb-2 block"
                              >
                                Email Address{" "}
                                <span className="text-gold-mid">*</span>
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="rajesh@company.com"
                                className="bg-input border-border text-foreground placeholder:text-foreground/30 focus:ring-gold-mid/50"
                                required
                                data-ocid="contact.input"
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor="phone"
                              className="text-foreground/80 text-sm mb-2 block"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={form.phone}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              placeholder="+91 98765 43210"
                              className="bg-input border-border text-foreground placeholder:text-foreground/30 focus:ring-gold-mid/50"
                              data-ocid="contact.input"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="message"
                              className="text-foreground/80 text-sm mb-2 block"
                            >
                              Message <span className="text-gold-mid">*</span>
                            </Label>
                            <Textarea
                              id="message"
                              value={form.message}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  message: e.target.value,
                                }))
                              }
                              placeholder="Tell us about your financial needs, business goals, or any questions you have…"
                              className="bg-input border-border text-foreground placeholder:text-foreground/30 focus:ring-gold-mid/50 min-h-[140px] resize-none"
                              required
                              data-ocid="contact.textarea"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={submit.isPending}
                            className="btn-gold w-full py-5 text-base rounded-sm"
                            data-ocid="contact.submit_button"
                          >
                            {submit.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {submit.isPending ? "Sending…" : "Send Message"}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-5"
              >
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Get in Touch
                  </h2>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    We're here Monday through Saturday. Reach us through any of
                    the following channels.
                  </p>
                </div>

                {contactDetails.map((detail, i) => {
                  const Icon = detail.icon;
                  return (
                    <motion.div
                      key={detail.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                    >
                      <Card
                        className="card-gold-border bg-card"
                        data-ocid={`contact.item.${i + 1}`}
                      >
                        <CardContent className="p-5 flex items-start gap-4">
                          <div className="p-2.5 rounded-sm bg-gold-mid/10 border border-gold-dim/25 flex-shrink-0">
                            <Icon className="w-4 h-4 text-gold-mid" />
                          </div>
                          <div>
                            <p className="text-foreground/50 text-xs uppercase tracking-widest mb-1 font-semibold">
                              {detail.label}
                            </p>
                            {detail.href ? (
                              <a
                                href={detail.href}
                                className="text-gold-mid hover:text-gold-bright transition-colors font-medium text-sm underline underline-offset-2 decoration-gold-dim/30"
                                data-ocid={`contact.link.${i + 1}`}
                              >
                                {detail.display}
                              </a>
                            ) : (
                              <p className="text-foreground/70 text-sm">
                                {detail.display}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                <Card className="card-gold-border bg-card overflow-hidden mt-4">
                  <CardContent className="p-0">
                    <div className="bg-deco-pattern bg-navy-deep p-6">
                      <h3 className="font-display text-lg font-bold text-gold-bright mb-2">
                        Need Urgent Support?
                      </h3>
                      <p className="text-foreground/60 text-sm mb-4">
                        For time-sensitive financial matters, call us directly
                        during office hours.
                      </p>
                      <a
                        href="tel:+919059296914"
                        className="flex items-center justify-center gap-2 btn-gold px-4 py-2.5 rounded-sm text-sm font-semibold w-full"
                        data-ocid="contact.primary_button"
                      >
                        <Phone className="w-4 h-4" />
                        Call +91 9059296914
                      </a>
                      <p className="text-foreground/40 text-xs text-center mt-3">
                        "Need help with your account? Contact our support at
                        9059296914."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
