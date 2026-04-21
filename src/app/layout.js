import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "../components/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Oryzo — Made for Mugs. Built for Tables.",
  description: "The world's most unnecessarily sophisticated cork coaster.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
