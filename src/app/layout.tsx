import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Premcare Physiotherapy Clinic | Expert Physiotherapy & Rehabilitation",
  description: "Expert physiotherapy services for sports injuries, post-op rehab, back pain, and more. Book your appointment today at Premcare Physiotherapy Clinic.",
  keywords: "physiotherapy, physical therapy, sports rehab, back pain treatment, physiotherapist, rehabilitation, sports injuries",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: "Premcare Physiotherapy Clinic",
    description: "Expert physiotherapy services for sports injuries, post-op rehab, back pain, and more.",
    type: "website",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
