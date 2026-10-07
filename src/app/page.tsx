import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { listarPlanosPublicos, reais, RECURSOS_PLANO } from "@/lib/planos-publicos";

export const dynamic = "force-dynamic";

const PASSOS = [
  { titulo: "Escolha o plano", texto: "Essencial, Profissional ou Ilimitado, conforme o tamanho da clínica." },
  { titulo: "Teste ou assine", texto: "7 dias grátis, sem cartão, ou pagamento do plano na hora." },
  { titulo: "Entre pelo e-mail", texto: "O acesso do administrador chega no e-mail e a clínica já fica disponível." },
];

export default async function LandingPage() {
  const planos = await listarPlanosPublicos();

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <BrandLogo variant="compact" priority className="w-28 sm:w-32" />
        <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-hover">
          Entrar
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 pb-12 pt-8 text-center sm:px-6 sm:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">J.A. Clinics</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            A gestão da clínica, pronta para usar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Agenda, prontuário e financeiro no mesmo lugar. Comece com 7 dias grátis ou assine o plano e receba o acesso por e-mail.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-3">
          {planos === null ? (
            <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              Não foi possível carregar os planos agora. Tente de novo em instantes.
            </p>
          ) : (
            planos.map((plano) => {
              const recursos = RECURSOS_PLANO[plano.codigo] ?? plano.modulos;
              const destaque = plano.codigo === "profissional";
              return (
                <article
                  key={plano.codigo}
                  className={`flex flex-col rounded-2xl border bg-card p-6 ${destaque ? "border-primary shadow-sm" : "border-border"}`}
                >
                  <h2 className="text-lg font-semibold">{plano.nome}</h2>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {reais(plano.precoMensal)}
                    <span className="text-sm font-normal text-muted-foreground"> /mês</span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                    {recursos.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-2">
                    <Link
                      href={`/assinar?plano=${plano.codigo}&modo=gratuito`}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                    >
                      Testar 7 dias grátis
                    </Link>
                    <Link
                      href={`/assinar?plano=${plano.codigo}&modo=pago`}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-card px-4 text-sm font-medium hover:bg-muted"
                    >
                      Assinar agora
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {PASSOS.map((passo, indice) => (
              <div key={passo.titulo}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">0{indice + 1}</p>
                <h2 className="mt-2 text-lg font-semibold">{passo.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{passo.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
