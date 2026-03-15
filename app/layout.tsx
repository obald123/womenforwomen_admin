import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./dashboard/components/Sidebar"; // Adjust paths based on your project
import Header from "./dashboard/components/Header";
import ToastProvider from "./components/ToastProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Women — Admin",
  description: "Admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased font-montserrat bg-[#FAF9F6] text-[#0D2323]">
        <div className="flex min-h-screen">
          {/* SIDEBAR: The vertical pillar (Top to Bottom) */}
          <Sidebar />

          {/* MAIN WRAPPER: Occupies the rest of the width */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* HEADER: Pinned to the top of this section only */}
            <Header />

            {/* PAGE CONTENT */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
