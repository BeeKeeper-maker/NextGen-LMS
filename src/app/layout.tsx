import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextGen Global LMS — AI-Powered Learning Platform",
  description: "The next-generation Learning Management System with AI-powered content generation, integrated communities, zero transaction fees, and advanced analytics. Build, teach, and scale your academy globally.",
  keywords: ["LMS", "Learning Management System", "AI Education", "Online Courses", "Community Platform", "Course Builder", "Zero Transaction Fees", "Multi-tenant LMS"],
  authors: [{ name: "NextGen LMS Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NextGen Global LMS — AI-Powered Learning Platform",
    description: "AI-Powered Architecture. Integrated Communities. Zero Transaction Taxation. Build your academy with the most advanced LMS platform.",
    siteName: "NextGen Global LMS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextGen Global LMS — AI-Powered Learning Platform",
    description: "AI-Powered Architecture. Integrated Communities. Zero Transaction Taxation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
