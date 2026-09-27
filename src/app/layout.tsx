import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Absensi Guru & Staf Berbasis Jadwal Hari",
  description: "Aplikasi Absensi Guru & Staf Sekolah dengan Supabase, Next.js, dan Netlify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
