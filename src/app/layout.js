import "./globals.css";

export const metadata = {
  title: "Cálculo PA",
  description: "Cálculo e histórico de PA das vendedoras",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
