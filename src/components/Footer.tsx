// Standard TalkyTools footer. Imported via MarketingShell.
// Source: _shared/templates/components/Footer.tsx.template (placeholders replaced)

import Link from "next/link";

const FOOTER_LINKS = {
  product: [
    { label: "Pricing", href: "/pricing" },
    { label: "Features", href: "/features" },
    { label: "Security", href: "/security" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
  family: [
    { label: "TalkyTools Suite", href: "https://talkytools.com" },
    { label: "Optimo (SEO)", href: "https://optimo.talkytools.com" },
    { label: "BillForge (Invoicing)", href: "https://billforge.in" },
    { label: "SeizeLead (Lead capture)", href: "https://seizelead.talkytools.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Cherishu
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Employee rewards &amp; recognition that actually gets used. Part of the TalkyTools family.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-900">Product</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-900">Legal</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-900">TalkyTools Family</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.family.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-gray-600 hover:text-indigo-600"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TalkyTools. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
