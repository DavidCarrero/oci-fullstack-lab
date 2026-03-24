export const metadata = {
  title: 'OCI DevOps Lab',
  description: 'Demo de pipeline CI/CD multi-modelo en Oracle Cloud',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
