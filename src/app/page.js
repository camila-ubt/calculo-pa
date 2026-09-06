import PainelPA from "@/components/PainelPA";

export default function Home() {
  // Activate only after the access/login work is ready. The public notice stays the default.
  if (process.env.PA_PAINEL_ATIVO === "true") return <PainelPA />;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(180deg, #fffaf7 0%, #f8f1ec 100%)",
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(116, 86, 68, 0.14)",
          borderRadius: "24px",
          padding: "48px 28px",
          boxShadow: "0 18px 55px rgba(88, 61, 44, 0.08)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "#f3ebe5",
            color: "#735947",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: "22px",
          }}
        >
          Em desenvolvimento
        </div>

        <h1
          style={{
            margin: "0 0 14px",
            fontFamily: '"Playfair Display", serif',
            fontSize: "clamp(34px, 8vw, 48px)",
            lineHeight: 1.05,
            color: "#45372f",
          }}
        >
          Cálculo PA
        </h1>

        <p
          style={{
            margin: "0 auto",
            maxWidth: "430px",
            color: "#76675e",
            fontSize: "16px",
            lineHeight: 1.65,
          }}
        >
          Estamos finalizando os ajustes de acesso e login antes do lançamento.
          A página estará disponível em breve.
        </p>
      </section>
    </main>
  );
}
