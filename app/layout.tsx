import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vòng sản xuất - Vòng giá",
  description: "Game ôn tập kinh tế chính trị về quy luật giá trị, cung cầu và giá cả thị trường."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
