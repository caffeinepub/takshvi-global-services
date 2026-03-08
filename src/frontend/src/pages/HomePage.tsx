import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Tag,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetApprovedProperties,
  useIsCallerFinanceApproved,
} from "../hooks/useQueries";

const services = [
  {
    icon: TrendingUp,
    title: "Smart Finance",
    description:
      "Exclusive financing tools, preferential rates, and tailored loan structures for qualified clients. Access our curated network of lending partners.",
    cta: "Access Finance Portal",
    href: "/smart-finance",
    locked: true,
    highlight: true,
  },
  {
    icon: Globe2,
    title: "Global Consulting",
    description:
      "Strategic consulting for businesses expanding across international markets. Market analysis, regulatory guidance, and cross-border advisory.",
    cta: "Learn More",
    href: "/contact",
    locked: false,
    highlight: false,
  },
  {
    icon: BarChart3,
    title: "Investment Advisory",
    description:
      "Data-driven investment strategies with a focus on emerging markets and diversified portfolios. Maximise returns with managed risk.",
    cta: "Explore Advisory",
    href: "/contact",
    locked: false,
    highlight: false,
  },
  {
    icon: Briefcase,
    title: "Business Solutions",
    description:
      "End-to-end business solutions: company registration, licensing, corporate restructuring, and operational optimisation for sustainable growth.",
    cta: "Get Started",
    href: "/contact",
    locked: false,
    highlight: false,
  },
];

const stats = [
  { value: "₹500Cr+", label: "Assets Under Advisory" },
  { value: "1,200+", label: "Clients Served" },
  { value: "15+", label: "Years of Excellence" },
  { value: "98%", label: "Client Satisfaction" },
];

const features = [
  "Personalised financial planning tailored to your goals",
  "Access to exclusive investment opportunities",
  "Dedicated relationship managers for premium clients",
  "Transparent processes with regular progress reporting",
  "Compliance-first approach to all financial services",
];

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isFinanceApproved } = useIsCallerFinanceApproved();
  const { data: approvedProperties } = useGetApprovedProperties();
  const featuredProperties = approvedProperties?.slice(0, 3) ?? [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <main>
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy-deep">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-takshvi.dim_1400x700.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/50 to-navy-deep" />
        </div>

        {/* Geometric accent lines */}
        <div className="absolute inset-0 bg-deco-pattern opacity-20 pointer-events-none" />
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-12 bg-gold-mid" />
              <span className="text-gold-mid text-xs font-body tracking-[0.25em] uppercase font-semibold">
                Premium Financial Services
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
            >
              <span className="text-foreground">Smart Finance.</span>
              <br />
              <span className="text-gold-bright">Global Vision.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-foreground/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl font-body"
            >
              Takshvi Global Services delivers premium financial solutions,
              investment advisory, and strategic consulting — empowering
              businesses and individuals to achieve extraordinary results.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/smart-finance" data-ocid="home.primary_button">
                <Button
                  size="lg"
                  className="btn-gold px-8 py-6 text-base font-semibold rounded-sm group"
                >
                  Explore Smart Finance
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact" data-ocid="home.secondary_button">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold-dim/50 text-gold-mid hover:border-gold-mid hover:bg-gold-mid/5 px-8 py-6 text-base rounded-sm"
                >
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative corner ornament */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="w-full h-full"
            aria-hidden="true"
          >
            <path
              d="M200 0 L200 200 L0 200"
              stroke="oklch(0.74 0.12 75)"
              strokeWidth="1"
            />
            <path
              d="M200 40 L200 200 L40 200"
              stroke="oklch(0.74 0.12 75)"
              strokeWidth="0.5"
            />
            <path
              d="M200 80 L200 200 L80 200"
              stroke="oklch(0.74 0.12 75)"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="bg-card border-y border-gold-dim/20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="font-display text-3xl lg:text-4xl font-bold text-gold-bright mb-1">
                  {stat.value}
                </div>
                <div className="text-foreground/50 text-sm font-body">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services Section ─── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold-dim" />
              <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                What We Offer
              </span>
              <div className="h-px w-8 bg-gold-dim" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto text-base leading-relaxed">
              Comprehensive financial and business services designed for the
              discerning client.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              const showLock =
                service.locked && isAuthenticated && !isFinanceApproved;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card
                    className={`card-gold-border bg-card h-full transition-all duration-300 ${
                      service.highlight ? "ring-1 ring-gold-dim/40" : ""
                    }`}
                    data-ocid={`services.item.${i + 1}`}
                  >
                    <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2.5 rounded-sm bg-gold-mid/10 border border-gold-dim/30 flex-shrink-0">
                          <Icon className="w-5 h-5 text-gold-mid" />
                        </div>
                        {service.highlight && (
                          <span className="ml-auto text-xs text-gold-bright bg-gold-mid/15 border border-gold-dim/30 px-2 py-0.5 rounded-sm font-semibold tracking-wide uppercase">
                            Exclusive
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-3">
                        {service.title}
                      </h3>
                      <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-grow">
                        {service.description}
                      </p>
                      <Link
                        to={service.href}
                        data-ocid={`services.link.${i + 1}`}
                      >
                        <Button
                          variant="ghost"
                          className="text-gold-mid hover:text-gold-bright hover:bg-gold-mid/5 px-0 group w-full justify-start"
                        >
                          {service.cta}
                          {showLock ? (
                            <Lock className="ml-2 w-3.5 h-3.5" />
                          ) : (
                            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          )}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ─── */}
      {featuredProperties.length > 0 && (
        <section className="py-20 lg:py-24 bg-card border-t border-gold-dim/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-gold-dim" />
                  <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                    Real Estate
                  </span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
                  Featured Properties
                </h2>
              </div>
              <Link to="/properties" data-ocid="home.link">
                <Button
                  variant="ghost"
                  className="text-gold-mid hover:text-gold-bright hover:bg-gold-mid/5 group"
                >
                  View All Properties
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProperties.map((property, i) => {
                const firstPhoto = property.photos?.[0];
                return (
                  <motion.div
                    key={property.id.toString()}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <Card
                      className="card-gold-border bg-background h-full flex flex-col overflow-hidden"
                      data-ocid={`home.item.${i + 1}`}
                    >
                      {/* Photo thumbnail */}
                      {firstPhoto ? (
                        <div className="aspect-video overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={firstPhoto}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gold-mid/5 border-b border-gold-dim/15 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-gold-dim/30" />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col gap-3 h-full">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-sm bg-gold-mid/10 border border-gold-dim/30 flex-shrink-0 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-gold-mid" />
                          </div>
                          <h3 className="font-display text-base font-bold text-foreground leading-snug">
                            {property.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground/60 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-gold-dim flex-shrink-0" />
                          <span className="truncate">{property.location}</span>
                        </div>
                        <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-sm bg-gold-mid/8 border border-gold-dim/20">
                          <Tag className="w-3 h-3 text-gold-mid flex-shrink-0" />
                          <span className="text-gold-bright font-display font-semibold text-sm">
                            {property.valuation}
                          </span>
                        </div>
                        <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2 flex-grow">
                          {property.description}
                        </p>
                        {property.locationLink && (
                          <a
                            href={property.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-gold-mid hover:text-gold-bright transition-colors text-xs font-medium"
                            data-ocid={`home.link.${i + 1}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Location
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link to="/properties" data-ocid="home.secondary_button">
                <Button className="btn-gold rounded-sm px-8">
                  Browse All Properties
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Why Choose Us ─── */}
      <section className="py-20 lg:py-24 bg-card border-t border-gold-dim/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold-dim" />
                <span className="text-gold-dim text-xs tracking-[0.25em] uppercase font-semibold">
                  Why Takshvi
                </span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Trusted by India's{" "}
                <span className="text-gold-bright">Leading</span> Businesses
              </h2>
              <p className="text-foreground/60 leading-relaxed mb-8">
                With over 15 years of experience in financial services and
                global consulting, Takshvi Global Services stands as a beacon of
                trust, expertise, and results. Our team of seasoned
                professionals delivers tailored solutions that transform
                financial goals into reality.
              </p>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gold-mid flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/70 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Decorative card stack */}
              <div className="relative">
                <div className="absolute inset-0 bg-gold-mid/5 rounded-sm transform rotate-2" />
                <Card className="card-gold-border relative bg-card">
                  <CardContent className="p-8">
                    <div className="gold-divider mb-6" />
                    <h3 className="font-display text-2xl font-bold text-gold-bright mb-2">
                      Smart Finance Portal
                    </h3>
                    <p className="text-foreground/60 text-sm mb-6">
                      Our exclusive Smart Finance portal gives approved clients
                      access to preferential lending rates, curated investment
                      opportunities, and dedicated relationship management.
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        "Competitive interest rates from 7.5% p.a.",
                        "Loan processing within 48 hours",
                        "Up to ₹5 Crore unsecured business loans",
                        "Real-time portfolio tracking",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-foreground/70"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-mid flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="gold-divider" />
                    <div className="mt-5">
                      <Link
                        to={isAuthenticated ? "/smart-finance" : "/login"}
                        data-ocid="home.panel.link"
                      >
                        <Button className="btn-gold w-full rounded-sm">
                          {isAuthenticated
                            ? "Access Smart Finance"
                            : "Sign In to Access"}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Contact Strip ─── */}
      <section className="py-14 bg-navy-deep border-t border-gold-dim/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Ready to Get Started?
              </h3>
              <p className="text-foreground/60">
                Contact our team and let us guide you to financial excellence.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href="tel:+919059296914"
                className="flex items-center gap-3 group"
                data-ocid="home.link"
              >
                <Phone className="w-5 h-5 text-gold-mid group-hover:text-gold-bright transition-colors" />
                <span className="text-gold-mid group-hover:text-gold-bright transition-colors font-semibold">
                  +91 9059296914
                </span>
              </a>
              <a
                href="mailto:takshvipvt.ltd@gmail.com"
                className="flex items-center gap-3 group"
                data-ocid="home.link"
              >
                <Mail className="w-5 h-5 text-gold-mid group-hover:text-gold-bright transition-colors" />
                <span className="text-gold-mid underline underline-offset-2 group-hover:text-gold-bright transition-colors">
                  takshvipvt.ltd@gmail.com
                </span>
              </a>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-foreground/40" />
                <span className="text-foreground/60 text-sm">
                  Mon–Sat, 9AM–6PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
