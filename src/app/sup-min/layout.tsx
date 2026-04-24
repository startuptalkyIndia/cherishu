import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cherishu Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function SupMinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
