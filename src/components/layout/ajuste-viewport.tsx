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
      if (tecladoAberto) return;
      if (window.scrollX !== 0 || window.scrollY !== 0 || (vv && vv.offsetTop > 0)) {
        window.scrollTo(0, 0);
      }
    };

    aplicar();
    vv?.addEventListener("resize", aplicar);
    vv?.addEventListener("scroll", aplicar);
    window.addEventListener("orientationchange", aplicar);
    window.addEventListener("focusout", aplicar);

    return () => {
      vv?.removeEventListener("resize", aplicar);
      vv?.removeEventListener("scroll", aplicar);
      window.removeEventListener("orientationchange", aplicar);
      window.removeEventListener("focusout", aplicar);
    };
  }, []);

  return null;
}
