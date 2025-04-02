import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/NavBar";

const notosansjp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",  
})

export const metadata: Metadata = {
  title: 'J掲示板',
  description: 'この令和の時代にホスティングされているとマズいレベルの脆弱性モリモリな掲示板',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
        <head>
        {/* 意図的にクライアント側の環境変数を漏洩させる */}
        <script dangerouslySetInnerHTML={{ __html: `
          console.log('環境変数:', {
            API_KEY: '${process.env.NEXT_PUBLIC_API_KEY}',
            API_URL: '${process.env.NEXT_PUBLIC_API_URL}',
            PAYMENT_ENDPOINT: '${process.env.NEXT_PUBLIC_PAYMENT_ENDPOINT}',
            ENABLE_PREMIUM_FEATURES: ${process.env.NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES}
          });
        `}} />
      </head>
      <body className={notosansjp.variable}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
