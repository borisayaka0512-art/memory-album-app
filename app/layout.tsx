import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "思い出アルバム",
  description: "大切な思い出を、一冊の本として未来へ残すアルバムアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
