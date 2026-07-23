import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { ClerkProvider } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Sensai - AI Career Coach",
  description: "",
};

export default async function RootLayout({ children }) {
  await checkUser();

  return (
    <ClerkProvider 
      appearance={{
        layout: {
          socialButtonsVariant: 'blockButton'
        },
        variables: {
          colorBackground: '#1c1c1e',
          colorInputBackground: '#2c2c2e',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          colorPrimary: '#ffffff',
          colorTextOnPrimaryBackground: '#000000'
        }
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={inter.className}>
          <Header />

          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors />

          <footer className="bg-muted/50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-200">
              <p>AI Career Coach • Personalized career guidance powered by AI.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}