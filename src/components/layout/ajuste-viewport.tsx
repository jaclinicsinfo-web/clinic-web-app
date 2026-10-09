"use client";

import * as React from "react";

/** Mantém a altura da tela igual à área visível e desfaz o deslocamento que o iPad deixa ao fechar o teclado. */
export function AjusteViewport() {
  React.useEffect(() => {
    const raiz = document.documentElement;
    const vv = window.visualViewport;

    const aplicar = () => {
      const altura = Math.round(vv?.height ?? window.innerHeight);
      raiz.style.setProperty("--app-altura", `${altura}px`);

      const tecladoAberto = vv ? window.innerHeight - vv.height > 80 : false;
      const deslocamento = tecladoAberto ? Math.round(vv?.offsetTop ?? 0) : 0;
      raiz.style.transform = deslocamento > 0 ? `translateY(${deslocamento}px)` : "";

      if (tecladoAberto) return;
      if (window.scrollX !== 0 || window.scrollY !== 0 || (vv && vv.offsetTop > 0)) {
        window.scrollTo(0, 0);
      }
    };

    const revelarCampo = (event: FocusEvent) => {
      const alvo = event.target;
      if (!(alvo instanceof HTMLElement)) return;
      if (!alvo.matches("input, textarea, select")) return;
      window.setTimeout(() => {
        alvo.scrollIntoView({ block: "center", inline: "nearest" });
      }, 120);
    };

    aplicar();
    vv?.addEventListener("resize", aplicar);
    vv?.addEventListener("scroll", aplicar);
    window.addEventListener("orientationchange", aplicar);
    window.addEventListener("focusin", revelarCampo);
    window.addEventListener("focusout", aplicar);

    return () => {
      vv?.removeEventListener("resize", aplicar);
      vv?.removeEventListener("scroll", aplicar);
      window.removeEventListener("orientationchange", aplicar);
      window.removeEventListener("focusin", revelarCampo);
      window.removeEventListener("focusout", aplicar);
      raiz.style.transform = "";
    };
  }, []);

  return null;
}
