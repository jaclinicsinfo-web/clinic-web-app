# Integrações e lembretes

Módulo do plano **Ilimitado**. Envia comunicações geradas **somente a partir da agenda** (não existe lembrete avulso).

Telas: **Integrações › Dashboard**, **Configurações**, **Lembretes** e **Histórico de envios**.

## Fluxo

```
Agendamento (criar, confirmar, reagendar, cancelar)
        ↓
Motor de lembretes (regras da clínica)
        ↓
Fila (envios_lembrete, chave de idempotência)
        ↓
Canal: WhatsApp Cloud API da Meta  |  SMTP
        ↓
Registro de status + custo para repasse
```

A agenda continua sendo a única fonte de verdade. O processador interno da API roda a cada minuto (`INTEGRACOES_INTERVALO_MS`) e também após eventos da agenda.

## WhatsApp (API oficial da Meta)

Use apenas a **WhatsApp Business Platform / Cloud API**. Não há WhatsApp Web, QR Code pessoal nem bibliotecas não oficiais.

No painel da Meta:

1. Crie um app Business e ative **WhatsApp**.
2. Copie **Phone Number ID**, **WhatsApp Business Account ID**, **App ID**, **Access Token** permanente e **App Secret**.
3. Crie um **Verify Token** (texto secreto seu).
4. Em Integrações › Configurações, cole esses dados. Tokens já salvos aparecem mascarados.
5. Cadastre o webhook:

   `GET/POST {API_PUBLIC_URL}/api/webhooks/whatsapp/{clinicaId}`

   Callback URL = o valor exibido no campo **URL do webhook**. Verify token = o mesmo cadastrado na clínica. Campos: `messages`.

6. Crie e **aprove templates** (categoria Utility, idioma `pt_BR`). O nome do template no sistema precisa ser idêntico ao da Meta.

Variáveis do corpo (`{{paciente.nome}}`, `{{data}}`, `{{horario}}`…) são enviadas na ordem em que aparecem, como `{{1}}`, `{{2}}`… no template da Meta. Fora da janela de 24h só template aprovado é enviado.

Status recebidos no webhook: enviado, entregue, lido, falhou.

## E-mail

SMTP por clínica (host, porta, usuário, senha, remetente, TLS/SSL). Se a clínica não preencher, a API tenta o SMTP do servidor (`SMTP_*` no `.env`), o mesmo da recuperação de senha.

## Lembretes

Regras configuráveis, por exemplo:

- 24 horas antes → WhatsApp + e-mail para o paciente
- 2 horas antes → WhatsApp para o paciente
- Após confirmação → e-mail ao profissional (desligado por padrão)
- Reagendamento e cancelamento → paciente

Destinatários usam o cadastro já existente (paciente/profissional). Sem e-mail ou WhatsApp, o envio fica **falhou** com o motivo, sem inventar contato.

## Custos e repasse

O custo **não é absorvido** pela empresa do sistema e **a clínica não define o preço**.

Vocês controlam a tabela no deploy da API (mesmo padrão do `PLANO`):

```
CUSTO_WHATSAPP_UTILITY=0.42
CUSTO_WHATSAPP_MARKETING=0.80
CUSTO_WHATSAPP_AUTHENTICATION=0.35
CUSTO_WHATSAPP_SERVICE=0
CUSTO_EMAIL=0.05
```

O painel só **exibe** os valores vigentes. Cada envio grava o custo daquele momento no histórico, para faturar a clínica. Se a Meta mudar a tabela, vocês atualizam o `.env` (ou as env vars no Render) e reiniciam a API.

## Idempotência

A chave `agendamento + regra + destinatário + canal + tipo` (e o novo horário no reagendamento) impede disparo duplicado se o processador rodar mais de uma vez.

Não envia antecedência para agendamento cancelado, faltou ou já iniciado.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `API_PUBLIC_URL` | URL pública da API (webhook). Opcional. |
| `CREDENTIALS_KEY` | AES-256-GCM dos tokens/senhas. Se vazia, usa `JWT_SECRET`. |
| `META_GRAPH_VERSION` | Padrão `v21.0`. |
| `INTEGRACOES_INTERVALO_MS` | Padrão `60000`. |
| `CUSTO_WHATSAPP_UTILITY` | Repasse por envio Utility (R$). |
| `CUSTO_WHATSAPP_MARKETING` | Repasse Marketing. |
| `CUSTO_WHATSAPP_AUTHENTICATION` | Repasse Authentication. |
| `CUSTO_WHATSAPP_SERVICE` | Repasse Service. |
| `CUSTO_EMAIL` | Repasse por e-mail. |
| `SMTP_*` | Fallback de e-mail. |

Nunca coloque tokens no código, no frontend ou nos logs.

## Como testar

1. Plano `PLANO=ilimitado`.
2. Ative lembretes, WhatsApp e/ou e-mail.
3. Preencha o **nome do template na Meta** nos templates de WhatsApp.
4. Use **Testar conexão** / **Testar envio**.
5. Crie um agendamento futuro; o histórico deve mostrar pendente/enviado.
6. Confirme, reagende e cancele para ver os demais tipos.
7. Webhook inválido (sem assinatura) responde 403.

## Status

pendente → processando → enviado → entregue → lido. Também: falhou, cancelado.
