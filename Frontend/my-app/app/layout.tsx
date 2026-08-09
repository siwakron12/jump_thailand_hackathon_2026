import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
});
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});
 
export const metadata: Metadata = {
  title: "AIS Reading Learning Platform",
  description: "A child-friendly reading assessment experience with teacher and student flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${sarabun.variable} lg:h-full antialiased`}
    >
      <body className="font-sans bg-[#f4f6f5] w-full">{children}</body>
    </html>
  );
}