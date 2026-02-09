import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://premcarephysiotherapyclinic.com'), // Replace with your actual domain when deployed (e.g. from Vercel)
  title: {
    default: "Premcare Physiotherapy | Mobile Physio Services in Lagos",
    template: "%s | Premcare Physiotherapy"
  },
  description: "Expert mobile physiotherapy services delivered to your home in Lekki, Ikoyi, Victoria Island, Ikeja, and across Lagos. Specializing in sports rehab, post-op recovery, and pain management.",
  keywords: [
    "mobile physiotherapy lagos",
    "home physiotherapy service",
    "physiotherapist lekki",
    "physiotherapy ikoyi",
    "sports injury rehabilitation",
    "stroke rehabilitation home service",
    "back pain treatment lagos",
    "private physiotherapist",
    "premcare physiotherapy",
    "physio at home"
  ],
  authors: [{ name: "Premcare Physiotherapy" }],
  creator: "Premcare Physiotherapy",
  publisher: "Premcare Physiotherapy",
  openGraph: {
    title: "Premcare Physiotherapy | Expert Mobile Rehab in Lagos",
    description: "Bringing professional physiotherapy to your doorstep. We serve Lekki, Ikoyi, VI, Ikeja, and more.",
    url: 'https://premcarephysiotherapyclinic.com',
    siteName: 'Premcare Physiotherapy',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png', // Replace with a dedicated OG image if available (1200x630px)
        width: 800,
        height: 600,
        alt: 'Premcare Physiotherapy Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Premcare Mobile Physiotherapy",
    description: "Expert physiotherapy at your home in Lagos. Book your session today.",
    images: ['/logo.png'], // Ideally needs a wider image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
