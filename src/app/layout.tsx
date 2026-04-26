import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://cherishu.talkytools.com";
const TAGLINE = "Employee rewards & recognition that actually gets used";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Cherishu — ${TAGLINE}`,
    template: "%s | Cherishu",
  },
  description:
    "Cherishu is the employee rewards & recognition platform for modern teams. Send kudos in Slack, auto-celebrate birthdays, redeem rewards from 100+ brands. Built in India.",
  keywords: [
    "employee recognition",
    "employee rewards",
    "kudos platform",
    "rewards and recognition",
    "Bonusly alternative",
    "Xoxoday alternative",
    "employee engagement",
    "HR software India",
    "Slack recognition",
  ],
  authors: [{ name: "TalkyTools" }],
  creator: "TalkyTools",
  publisher: "TalkyTools",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Cherishu",
    title: `Cherishu — ${TAGLINE}`,
    description:
      "Send kudos in Slack. Auto-celebrate birthdays. Redeem rewards from 100+ brands. The recognition platform your team will actually use.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cherishu — Employee Rewards & Recognition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Cherishu — ${TAGLINE}`,
    description:
      "The recognition platform your team will actually use. Slack-native. Auto-celebrations. 100+ brand rewards.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico" },
};

const SCHEMA_ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Cherishu",
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.png`,
      sameAs: ["https://talkytools.com"],
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@cherishu.talkytools.com",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Cherishu",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Employee recognition + rewards platform for modern teams. Slack/Teams integration, marketplace rewards, HR analytics.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR" },
        {
          "@type": "Offer",
          name: "Pro",
          price: "199",
          priceCurrency: "INR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "199",
            priceCurrency: "INR",
            referenceQuantity: { "@type": "QuantitativeValue", value: "1", unitText: "user/month" },
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Cherishu",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG_JSONLD) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
