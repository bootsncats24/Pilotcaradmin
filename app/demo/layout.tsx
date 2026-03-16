import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo - Pilot Car Admin",
  description: "Try Pilot Car Admin in your browser",
  robots: "noindex, nofollow", // Don't index demo pages
};

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout doesn't need to add any wrapper since ConditionalLayout handles it
  return <>{children}</>;
}
