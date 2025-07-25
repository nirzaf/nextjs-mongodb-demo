import type { Metadata } from "next";
import { QueryProvider } from '@/contexts/QueryContext';
import Layout from '@/components/Layout/Layout';
import ThemeProvider from '@/components/ThemeProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "MongoDB Demo - Jobs Portal",
  description: "A comprehensive MongoDB demonstration with job portal functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <Layout>
              {children}
            </Layout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
