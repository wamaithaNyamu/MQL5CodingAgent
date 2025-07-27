import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google"; // Removed Geist imports
import "./globals.css";
import { AppProviders } from "./providers"; // <-- use wrapper here
import { Toaster } from "@/components/ui/sonner";

import localFont from "next/font/local"; // Import localFont


// Define your custom fonts
const sansMonoRegular = localFont({
  src: [
    {
      path: "../../public/fonts/Google-Sans-Mono-Regular.ttf", // Adjust the path based on your file structure
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/Google-Sans-Mono-Regular.ttf",
      weight: "700",
      style: "normal",
    },
    // Add more font files for different weights/styles if needed
  ],
  variable: "--font-sans-regular-mono", // Optional: for CSS variables
  display: "swap", // Recommended for better performance and to prevent FOIT/FOUT
});

const sansMonoMedium = localFont({
  src: "../../public/fonts/Google-Sans-Mono-Regular.ttf", // Example for a mono font
  variable: "--font-sans-medium-mono",
  display: "swap",
});

// Initialize Fira Code for code blocks
const firaCode = Fira_Code({
  weight: ["300", "400", "500", "600", "700"], // Or specify weights you need
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap", // Recommended for better font loading
});

// Initialize Fira Sans for general text
const firaSans = Fira_Sans({
  weight: ["300", "400", "500", "600", "700"], // Or specify weights you need
  subsets: ["latin"],
  variable: "--font-fira-sans",
  display: "swap", // Recommended for better font loading
});

const intelOneMonoRegular = localFont({
  src: "../../public/fonts/intel/IntelOneMono-Regular.ttf", // Example for a mono font
  variable: "--font-intel-medium",
  display: "swap",
  weight: "200",
  style: "normal",
});
export const metadata: Metadata = {
  title: "PeepPips",
  description: "AI Data-driven trading predictions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={
          `${firaSans.variable} 
          ${firaCode.variable} 
          ${sansMonoRegular.variable} ${sansMonoMedium.variable} 
          ${intelOneMonoRegular.variable}
          antialiased`} // Removed Geist variables
      
      
      >
               
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}