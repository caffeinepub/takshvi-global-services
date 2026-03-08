import { Clock, ExternalLink, Mail, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-navy-deep border-t border-gold-dim/20">
      {/* Gold divider */}
      <div className="gold-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm overflow-hidden border border-gold-dim/40">
                <img
                  src="/assets/generated/takshvi-logo-transparent.dim_200x200.png"
                  alt="Takshvi Global Services"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-gold-bright block leading-tight">
                  Takshvi
                </span>
                <span className="text-xs text-foreground/50 tracking-widest uppercase">
                  Global Services
                </span>
              </div>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-xs">
              Your trusted partner for smart finance solutions, global
              consulting, and strategic investment advisory.
            </p>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-gold-mid uppercase tracking-widest mb-5">
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+919059296914"
                  className="flex items-center gap-3 group"
                  data-ocid="footer.link"
                >
                  <Phone className="w-4 h-4 text-gold-mid flex-shrink-0 group-hover:text-gold-bright transition-colors" />
                  <span className="text-gold-mid group-hover:text-gold-bright transition-colors font-medium text-sm">
                    +91 9059296914
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:takshvipvt.ltd@gmail.com"
                  className="flex items-center gap-3 group"
                  data-ocid="footer.link"
                >
                  <Mail className="w-4 h-4 text-gold-mid flex-shrink-0 group-hover:text-gold-bright transition-colors" />
                  <span className="text-gold-mid underline underline-offset-2 decoration-gold-dim/40 group-hover:text-gold-bright group-hover:decoration-gold-mid transition-colors text-sm break-all">
                    takshvipvt.ltd@gmail.com
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                  <span className="text-foreground/60 text-sm">
                    Mon – Sat, 9:00 AM – 6:00 PM
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-gold-mid uppercase tracking-widest mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Smart Finance", href: "/smart-finance" },
                { label: "Contact Us", href: "/contact" },
                { label: "Sign In", href: "/login" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-foreground/60 hover:text-gold-mid transition-colors text-sm"
                    data-ocid="footer.link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gold-dim/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-foreground/40 text-xs text-center sm:text-left">
            © {year} Takshvi Global Services. All rights reserved.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground/40 hover:text-foreground/60 transition-colors text-xs"
          >
            Built with love using caffeine.ai
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
