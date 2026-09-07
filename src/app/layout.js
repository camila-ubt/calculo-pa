import LoginSecurityNotice from "@/components/LoginSecurityNotice";
import "./globals.css";
import "./calculadora-metas-theme.css";
import "./compact-labels.css";
import "./rodape-autoria.css";
import "./login-security.css";

export const metadata = {
  title: "Cálculo PA",
  description: "Cálculo e histórico de PA das vendedoras",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <LoginSecurityNotice />
        <footer className="rodape-autoria">
          <span>© 2026 Cálculo PA</span>
          <span aria-hidden="true"> • </span>
          <a
            href="https://github.com/camila-ubt/calculo-pa/releases"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver releases do Cálculo PA"
          >
            v1.1.0
          </a>
          <span aria-hidden="true"> • </span>
          <span>Desenvolvido por</span>{" "}
          <a href="https://github.com/camila-ubt" target="_blank" rel="noopener noreferrer">
            @camila-ubt
          </a>
        </footer>
      </body>
    </html>
  );
}
