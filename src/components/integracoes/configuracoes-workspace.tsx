"use client";

import * as React from "react";
import { toast } from "sonner";

import { Pode } from "@/components/auth/pode";
import { categoriaCustoLabels } from "@/components/integracoes/labels";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField, FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import {
  listarCustosEnvioApi,
  obterConfiguracaoIntegracoesApi,
  salvarConfiguracaoIntegracoesApi,
  testarEmailApi,
  testarWhatsappApi,
  type CustoEnvio,
  type IntegracaoConfiguracao,
} from "@/services/integracoes";

export function IntegracoesConfiguracoesWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const podeEditar = temPermissao(sessao?.permissoes, "integracoes", "editar");
  const [config, setConfig] = React.useState<IntegracaoConfiguracao | null>(null);
  const [custos, setCustos] = React.useState<CustoEnvio[]>([]);
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);
  const [testeWhatsapp, setTesteWhatsapp] = React.useState("");
  const [testeEmail, setTesteEmail] = React.useState(sessao?.email ?? "");

  const [whatsapp, setWhatsapp] = React.useState({
    phoneNumberId: "",
    wabaId: "",
    appId: "",
    accessToken: "",
    appSecret: "",
    verifyToken: "",
    ambiente: "producao",
  });
  const [email, setEmail] = React.useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUsuario: "",
    smtpSenha: "",
    smtpRemetente: "",
    smtpRemetenteNome: "",
    smtpSeguro: "tls",
  });

  React.useEffect(() => {
    let ativo = true;
    Promise.all([obterConfiguracaoIntegracoesApi(), listarCustosEnvioApi()])
      .then(([cfg, listaCustos]) => {
        if (!ativo) return;
        setConfig(cfg);
        setCustos(listaCustos);
        setWhatsapp({
          phoneNumberId: cfg.whatsapp.phoneNumberId ?? "",
          wabaId: cfg.whatsapp.wabaId ?? "",
          appId: cfg.whatsapp.appId ?? "",
          accessToken: cfg.whatsapp.accessTokenMascarado ?? "",
          appSecret: cfg.whatsapp.appSecretMascarado ?? "",
          verifyToken: cfg.whatsapp.verifyTokenMascarado ?? "",
          ambiente: cfg.whatsapp.ambiente,
        });
        setEmail({
          smtpHost: cfg.email.smtpHost ?? "",
          smtpPort: cfg.email.smtpPort ?? 587,
          smtpUsuario: cfg.email.smtpUsuario ?? "",
          smtpSenha: cfg.email.smtpSenhaMascarada ?? "",
          smtpRemetente: cfg.email.smtpRemetente ?? "",
          smtpRemetenteNome: cfg.email.smtpRemetenteNome ?? "",
          smtpSeguro: cfg.email.smtpSeguro ?? "tls",
        });
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as configurações.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function salvarWhatsApp() {
    setSalvando(true);
    try {
      const atualizado = await salvarConfiguracaoIntegracoesApi({
        whatsappPhoneNumberId: whatsapp.phoneNumberId,
        whatsappWabaId: whatsapp.wabaId,
        whatsappAppId: whatsapp.appId,
        whatsappAccessToken: whatsapp.accessToken,
        whatsappAppSecret: whatsapp.appSecret,
        whatsappVerifyToken: whatsapp.verifyToken,
        whatsappAmbiente: whatsapp.ambiente,
      });
      setConfig(atualizado);
      toast.success("Configuração do WhatsApp salva.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o WhatsApp.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEmail() {
    setSalvando(true);
    try {
      const atualizado = await salvarConfiguracaoIntegracoesApi({
        smtpHost: email.smtpHost,
        smtpPort: email.smtpPort,
        smtpUsuario: email.smtpUsuario,
        smtpSenha: email.smtpSenha,
        smtpRemetente: email.smtpRemetente,
        smtpRemetenteNome: email.smtpRemetenteNome,
        smtpSeguro: email.smtpSeguro,
      });
      setConfig(atualizado);
      toast.success("Configuração de e-mail salva.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o e-mail.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(campo: "lembretesAtivos" | "whatsappAtivo" | "emailAtivo", valor: boolean) {
    try {
      const atualizado = await salvarConfiguracaoIntegracoesApi({ [campo]: valor });
      setConfig(atualizado);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível atualizar o status.");
    }
  }

  if (erro) return <EmptyState title="Não foi possível carregar" description={erro} />;
  if (!config) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações de integrações"
        description="Credenciais da Meta, SMTP da clínica, ativação dos lembretes e valores de repasse."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lembretes automáticos</CardTitle>
            <CardDescription>Somente agendamentos da agenda geram comunicações.</CardDescription>
          </div>
          <Switch
            checked={config.lembretesAtivos}
            disabled={!podeEditar}
            onCheckedChange={(valor) => void alternar("lembretesAtivos", valor)}
          />
        </CardHeader>
      </Card>

      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>WhatsApp Business (Meta Cloud API)</CardTitle>
                <CardDescription>
                  {config.whatsapp.configurado ? "Credenciais cadastradas." : "Aguardando configuração da Meta."}
                </CardDescription>
              </div>
              <Switch checked={config.whatsapp.ativo} disabled={!podeEditar} onCheckedChange={(valor) => void alternar("whatsappAtivo", valor)} />
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSection title="Conta da Meta" description="Dados do app e do número oficial. Tokens nunca são exibidos por completo.">
                <FormField label="Phone Number ID" htmlFor="phoneNumberId">
                  <Input id="phoneNumberId" value={whatsapp.phoneNumberId} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, phoneNumberId: e.target.value }))} />
                </FormField>
                <FormField label="WhatsApp Business Account ID" htmlFor="wabaId">
                  <Input id="wabaId" value={whatsapp.wabaId} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, wabaId: e.target.value }))} />
                </FormField>
                <FormField label="Meta App ID" htmlFor="appId">
                  <Input id="appId" value={whatsapp.appId} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, appId: e.target.value }))} />
                </FormField>
                <FormField label="Ambiente" htmlFor="ambiente">
                  <Select value={whatsapp.ambiente} onValueChange={(valor) => setWhatsapp((a) => ({ ...a, ambiente: valor }))} disabled={!podeEditar}>
                    <SelectTrigger id="ambiente"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="producao">Produção</SelectItem>
                      <SelectItem value="sandbox">Sandbox / teste</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Access Token" htmlFor="accessToken" hint="Cole um token novo para substituir. Deixe a máscara para manter o atual.">
                  <Input id="accessToken" type="password" autoComplete="off" value={whatsapp.accessToken} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, accessToken: e.target.value }))} />
                </FormField>
                <FormField label="App Secret" htmlFor="appSecret" hint="Usado para validar a assinatura do webhook.">
                  <Input id="appSecret" type="password" autoComplete="off" value={whatsapp.appSecret} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, appSecret: e.target.value }))} />
                </FormField>
                <FormField label="Verify Token" htmlFor="verifyToken" hint="O mesmo valor cadastrado no painel da Meta.">
                  <Input id="verifyToken" type="password" autoComplete="off" value={whatsapp.verifyToken} disabled={!podeEditar} onChange={(e) => setWhatsapp((a) => ({ ...a, verifyToken: e.target.value }))} />
                </FormField>
                <FormField label="URL do webhook" htmlFor="webhookUrl" full>
                  <Input id="webhookUrl" readOnly value={config.webhookUrl} onFocus={(e) => e.currentTarget.select()} />
                </FormField>
              </FormSection>
              <Pode modulo="integracoes" acao="editar">
                <div className="flex flex-wrap items-end gap-3">
                  <FormField label="Número para teste" htmlFor="testeWhatsapp">
                    <Input id="testeWhatsapp" placeholder="5511999999999" value={testeWhatsapp} onChange={(e) => setTesteWhatsapp(e.target.value)} />
                  </FormField>
                  <Button
                    variant="outline"
                    disabled={!testeWhatsapp}
                    onClick={() => {
                      testarWhatsappApi(testeWhatsapp)
                        .then((res) => toast.success(res.message))
                        .catch((error) => toast.error(error instanceof ApiError ? error.message : "Falha no teste."));
                    }}
                  >
                    Testar conexão
                  </Button>
                  <Button loading={salvando} onClick={() => void salvarWhatsApp()}>
                    Salvar WhatsApp
                  </Button>
                </div>
              </Pode>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>E-mail (SMTP)</CardTitle>
                <CardDescription>
                  {config.email.configurado ? "Servidor configurado para esta clínica." : "Use o SMTP da clínica ou o fallback do servidor."}
                </CardDescription>
              </div>
              <Switch checked={config.email.ativo} disabled={!podeEditar} onCheckedChange={(valor) => void alternar("emailAtivo", valor)} />
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSection title="Servidor" columns={2}>
                <FormField label="Host" htmlFor="smtpHost">
                  <Input id="smtpHost" value={email.smtpHost} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpHost: e.target.value }))} />
                </FormField>
                <FormField label="Porta" htmlFor="smtpPort">
                  <Input id="smtpPort" type="number" value={email.smtpPort} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpPort: Number(e.target.value) }))} />
                </FormField>
                <FormField label="Usuário" htmlFor="smtpUsuario">
                  <Input id="smtpUsuario" value={email.smtpUsuario} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpUsuario: e.target.value }))} />
                </FormField>
                <FormField label="Senha" htmlFor="smtpSenha" hint="Deixe a máscara para manter a senha atual.">
                  <Input id="smtpSenha" type="password" autoComplete="off" value={email.smtpSenha} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpSenha: e.target.value }))} />
                </FormField>
                <FormField label="Remetente" htmlFor="smtpRemetente">
                  <Input id="smtpRemetente" value={email.smtpRemetente} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpRemetente: e.target.value }))} />
                </FormField>
                <FormField label="Nome do remetente" htmlFor="smtpRemetenteNome">
                  <Input id="smtpRemetenteNome" value={email.smtpRemetenteNome} disabled={!podeEditar} onChange={(e) => setEmail((a) => ({ ...a, smtpRemetenteNome: e.target.value }))} />
                </FormField>
                <FormField label="Segurança" htmlFor="smtpSeguro">
                  <Select value={email.smtpSeguro} disabled={!podeEditar} onValueChange={(valor) => setEmail((a) => ({ ...a, smtpSeguro: valor }))}>
                    <SelectTrigger id="smtpSeguro"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </FormSection>
              <Pode modulo="integracoes" acao="editar">
                <div className="flex flex-wrap items-end gap-3">
                  <FormField label="E-mail para teste" htmlFor="testeEmail">
                    <Input id="testeEmail" value={testeEmail} onChange={(e) => setTesteEmail(e.target.value)} />
                  </FormField>
                  <Button
                    variant="outline"
                    disabled={!testeEmail}
                    onClick={() => {
                      testarEmailApi(testeEmail)
                        .then((res) => toast.success(res.message))
                        .catch((error) => toast.error(error instanceof ApiError ? error.message : "Falha no teste."));
                    }}
                  >
                    Testar envio
                  </Button>
                  <Button loading={salvando} onClick={() => void salvarEmail()}>
                    Salvar e-mail
                  </Button>
                </div>
              </Pode>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <CardTitle>Custos de disparo</CardTitle>
              <CardDescription>
                Tabela de repasse definida no contrato da clínica. Os valores não são editáveis neste painel — cada envio registra o custo vigente para faturamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {custos.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                  <p className="text-sm font-medium text-foreground">{categoriaCustoLabels[item.categoria] ?? `${item.canal} · ${item.categoria}`}</p>
                  <p className="text-sm tabular-nums font-medium text-foreground">{formatCurrency(item.valor)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
