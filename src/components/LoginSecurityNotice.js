"use client";

import { useEffect } from "react";

export default function LoginSecurityNotice() {
  useEffect(() => {
    function aplicarProtecaoLogin() {
      const formularios = [...document.querySelectorAll(".loginCard form")];
      const formularioLogin = formularios.find((formulario) => {
        const temEmail = Boolean(formulario.querySelector('input[type="email"]'));
        const senhas = formulario.querySelectorAll('input[type="password"]');
        return temEmail && senhas.length === 1;
      });

      if (!formularioLogin) return;

      formularioLogin.setAttribute("autocomplete", "off");
      formularioLogin.setAttribute("data-pa-login", "true");

      const email = formularioLogin.querySelector('input[type="email"]');
      const senha = formularioLogin.querySelector('input[type="password"]');

      [email, senha].forEach((campo) => {
        if (!campo) return;
        campo.setAttribute("autocomplete", "off");
        campo.setAttribute("data-lpignore", "true");
        campo.setAttribute("data-1p-ignore", "true");
      });

      const card = formularioLogin.closest(".loginCard");
      if (!card || card.querySelector(".loginSecurityNotice")) return;

      const aviso = document.createElement("div");
      aviso.className = "loginSecurityNotice";
      aviso.setAttribute("role", "note");
      aviso.innerHTML = `
        <strong>Por segurança</strong>
        <span>Faça login somente em uma janela anônima/privada e não aceite salvar a senha neste computador.</span>
      `;

      card.insertBefore(aviso, formularioLogin);
    }

    aplicarProtecaoLogin();

    const observador = new MutationObserver(() => {
      requestAnimationFrame(aplicarProtecaoLogin);
    });

    observador.observe(document.body, { childList: true, subtree: true });

    return () => observador.disconnect();
  }, []);

  return null;
}
