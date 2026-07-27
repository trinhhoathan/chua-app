import type { Metadata } from "next";
import { Be_Vietnam_Pro, Literata } from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const displayFont = Literata({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chùa Cổ Viễn | Linh Quang Tự — Hà Nam",
  description:
    "Chùa Cổ Viễn (Linh Quang Tự) tại xã Hưng Công, huyện Bình Lục, tỉnh Hà Nam — di tích lịch sử quốc gia, ngôi chùa làng cổ kính gắn với truyền thống Phật giáo và cách mạng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
