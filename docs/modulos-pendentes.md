# Módulos que faltam

Este documento lista o que ainda **não está integrado ao banco e à API**. As telas podem existir no painel com dados mockados; isso não conta como módulo pronto.

A especificação completa está em [`especificacao-erp-clinicas.md`](./especificacao-erp-clinicas.md). Usuários e perfis estão em [`usuarios-e-perfis.md`](./usuarios-e-perfis.md).

## O que já está no banco

| Área | Situação |
|---|---|
| Login, sessão, troca de unidade, setup, cadastro pós-compra | Pronto |
| Planos (limite de contas) | Pronto |
| Usuários e perfis (RBAC no menu e nas rotas) | Pronto |
| Pacientes (listagem, cadastro, edição, arquivar, perfil cadastral) | Pronto |
| Convênios (CRUD, tabela de preços, autorização prévia) | Pronto |
| Procedimentos (catálogo da clínica) | Pronto |
| Profissionais (cadastro clínico, grade, procedimentos, vínculo com login) | Pronto |
| Agenda (agendamentos, status, reagendamento, bloqueios, lista de espera) | Pronto |
| Prontuário e documentos do paciente (evolução, anexos, log de acesso) | Pronto |
| Financeiro (receber, pagar, fluxo, lotes de convênio, comissões, formas de pagamento) | Pronto |
| Dados da clínica e unidades | Pronto |
| Estoque | Pronto |
| Recuperação de senha | Pronto |
| Notificações (sino) | Pronto |
| Dashboard | Pronto |

O profissional de saúde vê **só a própria agenda** e os pacientes em que é preferido **ou** já teve agendamento. O vínculo de preferência aponta para o cadastro clínico em `profissionais`, não mais para a conta de usuário.

## Resumo

| Módulo | Tela no painel | API / banco | Prioridade |
|---|---|---|---|
| Agenda | Integrada | Pronto | — |
| Profissionais | Integrada | Pronto (docs do profissional ainda não) | — |
| Convênios | Integrada | Pronto | — |
| Procedimentos | Integrada (em Configurações) | Pronto | — |
| Prontuário / documentos do paciente | Integrada | Pronto | — |
| Financeiro | Integrada | Pronto | — |
| Formas de pagamento | Integrada | Pronto | — |
| Dados da clínica / unidades | Integrada | Pronto | — |
| Estoque | Integrada | Pronto | — |
| Recuperação de senha | Integrada | Pronto | — |
| Notificações | Integrada (sino) | Pronto | — |
| Dashboard | Integrada | Pronto | — |
| Relatórios | Mock | Falta | 1 |

---

## 1. Agenda

Tela `/agenda` grava no banco: calendário (dia/semana/mês), drawer de agendamento, bloqueio de horário e lista de espera.

Já persiste:

- Agendamento (paciente, profissional, procedimento, data, horário, sala, convênio/particular, valor, status, observações, quem criou)
- Fluxo de status: agendado → confirmado → check-in → em atendimento → atendido, com cancelado e faltou
- Reagendamento
- Bloqueio de horários (almoço, folga)
- Lista de espera (inclusão e encaixe)
- Indicador de lembrete enviado (envio real de WhatsApp/e-mail continua opcional)

Ao marcar o atendimento como **atendido**, o sistema gera a cobrança correspondente (se ainda não existir).

O profissional de saúde vê **só a própria agenda**. No perfil do paciente, próximo agendamento, último atendimento e a aba Histórico usam esses registros.

Cadastro rápido de paciente pela agenda foi desativado: use a ficha em Pacientes.

## 2. Profissionais

Tela `/profissionais` (lista, cadastro, perfil, agenda e pacientes atendidos) usa a API.

Entidade clínica própria, distinta da conta de login:

- Dados pessoais e de conselho (CRM, CRO, CREFITO etc.)
- Especialidades, tipo de vínculo, remuneração, % de comissão
- Grade semanal de horários
- Procedimentos que a pessoa pode realizar
- Vínculo opcional com a conta de login (para o profissional de saúde ver só os seus pacientes e a sua agenda)
- Aba de **comissões** integrada ao cálculo/folha do módulo financeiro

Ainda mock nesta área: **documentos do profissional** (contratos/certidões).

## 3. Convênios e procedimentos

### Convênios (`/convenios`)

CRUD no banco e no painel:

- Nome, ANS, prazo de pagamento, contato, portal, autorização prévia, status
- Tabela de preços por procedimento
- Pacientes vinculados (o vínculo no cadastro do paciente já existia)

Faturamento em lote de guias está no módulo financeiro (`/financeiro/convenios`).

### Procedimentos (`/configuracoes/procedimentos`)

Catálogo da clínica: nome, categoria, duração padrão, valor particular, valores por convênio, status. A agenda usa a duração para calcular o horário de fim.

A escrita do catálogo exige permissão de **configurações** (em geral Administrador).

## 4. Financeiro

Telas em `/financeiro` gravam no banco: visão geral, contas a receber/pagar, fluxo de caixa, faturamento de convênios e comissões.

Já persiste:

**Contas a receber**
- Cobrança ligada a agendamento (gerada ao concluir o atendimento) ou avulsa
- Status efetivo: pendente, pago, atrasado, parcelado, cancelado
- Baixa de pagamento (dinheiro, PIX, cartão, boleto, convênio)
- Parcelas
- Extrato no perfil do paciente e botão “gerar cobrança”

**Contas a pagar**
- Despesas, categorias, fornecedor, recorrência
- Status efetivo: a pagar, pago, vencido

**Fluxo de caixa**
- Entradas × saídas por período (realizado a partir das baixas)

**Convênios / faturamento**
- Lote de guias por convênio e competência
- Envio, glosa e reconciliação (marca as cobranças do lote como pagas ao encerrar)

**Comissões**
- Cálculo por profissional/período a partir dos atendimentos
- Aprovação, fechamento de folha e pagamento (gera despesa na categoria Comissões)

**Formas de pagamento** em `/configuracoes/pagamentos` ficam no banco (canais e taxas). Clínicas novas já nascem com o conjunto padrão.

O perfil **Profissional de saúde** não acessa o módulo financeiro geral; no paciente, saldo e pendências usam as cobranças reais.

## 5. Dashboard

Tela `/dashboard` usa a API. Cards, gráficos, próximos atendimentos, alertas e aniversariantes vêm do banco.

Já persiste / já lê:

- Atendimentos de hoje (total, confirmados, agendados, cancelados)
- Faturamento do mês (recebido, com variação em relação ao mês anterior) e previsto do dia
- Taxa de ocupação (grade semanal × agendamentos do mês, descontando bloqueios)
- Taxa de faltas do mês
- Novos pacientes no mês
- Contas a receber e a pagar nos próximos 7 dias
- Gráficos: faturamento 30 dias / 12 meses, convênio × particular, atendimentos por profissional, funil
- Próximos atendimentos do dia, alertas de gestão e aniversariantes do mês

O profissional de saúde vê só a própria agenda e os próprios pacientes. Sem permissão financeira, a API omite faturamento, contas, gráficos financeiros e alertas de gestão.

## 6. Relatórios

`/relatorios` é mock. Falta, com filtro de período e exportação (PDF/Excel):

- Faturamento (geral, por profissional, convênio, procedimento)
- Atendimentos (realizados, cancelados, faltas)
- Inadimplência
- Novos pacientes × recorrentes
- Produtividade por profissional
- Comissões

Depende de agenda, financeiro e profissionais prontos — os três já estão no banco.

## 7. Dados da clínica e unidades

Tela `/configuracoes/clinica` grava no banco: identificação, endereço, logo e unidades.

Já persiste:

- Nome fantasia, razão social, CNPJ, telefone e e-mail
- Endereço (CEP com consulta ViaCEP, logradouro, número, complemento, bairro, cidade, UF)
- Logo (JPG/PNG/WebP até 2 MB no banco)
- Unidades: cadastro, edição, inativar/reativar (a clínica precisa ficar com ao menos uma ativa)

Unidades novas são liberadas automaticamente para o administrador que cadastrou e para os demais administradores ativos. O seletor da topbar e o nome no menu lateral usam esses registros.

Ainda mock nesta área: **modelos de mensagem** e **integrações** (gateway, WhatsApp, calendário externo).

## 8. Estoque

Tela `/estoque` grava no banco: produtos/insumos, movimentações e consumo.

Já persiste:

- Cadastro de produtos (nome, categoria, unidade de medida, quantidade, mínimo, custo, fornecedor)
- Entrada e saída (opcionalmente ligada a um procedimento)
- Alerta de estoque baixo (na tela e no sino de notificações)
- Consumo agrupado pelas saídas registradas

Unidades inativas de produto deixam de aparecer nas novas movimentações. O saldo não pode ficar negativo.

## 9. O que falta **dentro** de Pacientes

Cadastro, agenda, histórico, prontuário, documentos clínicos e financeiro do paciente já gravam no banco.

| Aba | Situação |
|---|---|
| Visão geral (próximos e visitas) | Pronto (saldo usa cobranças reais) |
| Acompanhamento / prontuário | Pronto (evolução, queixa, conduta, alta; log de acesso LGPD) |
| Histórico | Pronto (agendamentos persistidos) |
| Documentos | Pronto (PDF/JPG/PNG até 10 MB no banco) |
| Financeiro do paciente | Pronto (cobranças, baixa e gerar cobrança) |
| Comunicação | Opcional (histórico de lembretes) |

Recepção e Financeiro não veem prontuário nem documentos clínicos.

## 10. Transversal (não é item de menu)

- ~~Recuperação e redefinição de senha~~ — feito (`/esqueci-senha` e `/redefinir-senha`; envio por SMTP se configurado)
- ~~Centro de notificações (sino)~~ — feito (estoque baixo, despesas vencidas, carteirinhas)
- Busca global na topbar
- Documentos do **profissional** (contratos/certidões) — os do paciente já existem
- Envio real de lembretes (WhatsApp/e-mail)

---

## Ordem sugerida

Segue a seção 17 da especificação, ajustada ao que já existe:

1. ~~Procedimentos e convênios~~ — feito
2. ~~Profissionais~~ — feito
3. ~~Agenda~~ — feito
4. ~~Prontuário e documentos do paciente~~ — feito
5. ~~Financeiro~~ — feito (cobrança a partir do atendimento; extrato do paciente)
6. ~~Dados da clínica~~ — feito (identidade, endereço, logo e CRUD de unidades)
7. ~~Estoque~~ — feito (produtos, movimentações, consumo e alerta de mínimo)
8. ~~Recuperação de senha e notificações~~ — feito
9. ~~Dashboard~~ — feito (números reais; recorte por perfil)
10. **Relatórios**

Cada módulo deve seguir o padrão já usado: Model → Controller → View na API, e `src/services` no painel sem mock.
