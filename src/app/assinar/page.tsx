import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { FormularioAssinatura } from "@/components/landing/formulario-assinatura";
import { listarPlanosPublicos } from "@/lib/planos-publicos";

export const dynamic = "force-dynamic";

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; modo?: string }>;
}) {
  const params = await searchParams;
  const modo = params.modo === "pago" ? "pago" : params.modo === "gratuito" ? "gratuito" : null;
  const planos = await listarPlanosPublicos();
  const plano = planos?.find((item) => item.codigo === params.plano);
  if (!modo || !plano || plano.precoMensal <= 0) notFound();

  return (
    <div className="min-h-full bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/">
          <BrandLogo variant="compact" className="w-28" />
        </Link>
        <Link href="/login" className="text-sm font-medium text-primary">
          Entrar
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <FormularioAssinatura plano={plano.codigo} nomePlano={plano.nome} preco={plano.precoMensal} modo={modo} />
      </main>
    </div>
  );
}
