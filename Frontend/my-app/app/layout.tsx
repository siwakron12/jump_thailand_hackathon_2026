import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${prompt.variable} lg:h-full antialiased`}
    >
      <body className="h-full overflow-hidden font-sans bg-gray-50/5">{children}</body>
    </html>
  );
}