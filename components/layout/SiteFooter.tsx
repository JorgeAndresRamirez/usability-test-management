import { Mail } from "lucide-react";
import Link from "next/link";

import { GithubIcon, LinkedinIcon } from "@/components/icons/social-icons";
import { SITE_AUTHOR } from "@/lib/site-author";

const socialLinks = [
  {
    href: SITE_AUTHOR.linkedin,
    label: "LinkedIn de Jorge Andrés Ramírez Sierra",
    icon: LinkedinIcon,
  },
  {
    href: SITE_AUTHOR.github,
    label: "GitHub de Jorge Andrés Ramírez Sierra",
    icon: GithubIcon,
  },
  {
    href: `mailto:${SITE_AUTHOR.email}`,
    label: `Correo: ${SITE_AUTHOR.email}`,
    icon: Mail,
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/80 bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            © {year} {SITE_AUTHOR.name}
          </p>
          <p className="text-xs text-muted-foreground">Todos los derechos reservados.</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {SITE_AUTHOR.role} · {SITE_AUTHOR.degree} · {SITE_AUTHOR.location}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Contacto
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
              >
                <Icon className="size-4" aria-hidden />
              </Link>
            ))}
          </div>
          <a
            href={`mailto:${SITE_AUTHOR.email}`}
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            {SITE_AUTHOR.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
