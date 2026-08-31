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

O profissional de saúde vê **só a própria agenda** e os pacientes em que é preferido **ou** já teve agendamento. O vínculo de preferência aponta para o cadastro clínico em `profissionais`, não mais para a conta de usuário.

## Resumo

| Módulo | Tela no painel | API / banco | Prioridade |
|---|---|---|---|
| Agenda | Integrada | Pronto | — |
| Profissionais | Integrada | Pronto (comissões e docs do profissional ainda não) | — |
| Convênios | Integrada | Pronto | — |
| Procedimentos | Integrada (em Configurações) | Pronto | — |
| Prontuário / documentos do paciente | Integrada | Pronto | — |
| Financeiro | Mock | Falta | 1 |
| Dashboard | Mock | Falta | 2 |
| Relatórios | Mock | Falta | 3 |
| Configurações da clínica | Mock | Parcial (clínica/unidade existem no setup) | 3 |
| Formas de pagamento | Mock | Falta | 3 |
| Estoque | Mock | Falta | 4 |
| Recuperação de senha | Não há | Falta | transversal |
| Notificações e busca global | Só o desenho | Falta | transversal |

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

Ainda mock nesta área: aba de **comissões** (depende do financeiro) e **documentos do profissional** (contratos/certidões).

## 3. Convênios e procedimentos

### Convênios (`/convenios`)

CRUD no banco e no painel:

- Nome, ANS, prazo de pagamento, contato, portal, autorização prévia, status
- Tabela de preços por procedimento
- Pacientes vinculados (o vínculo no cadastro do paciente já existia)

Faturamento em lote de guias continua no módulo financeiro.

### Procedimentos (`/configuracoes/procedimentos`)

Catálogo da clínica: nome, categoria, duração padrão, valor particular, valores por convênio, status. A agenda usa a duração para calcular o horário de fim.

A escrita do catálogo exige permissão de **configurações** (em geral Administrador).

## 4. Financeiro

Telas em `/financeiro` (visão geral, contas a receber/pagar, fluxo de caixa, faturamento de convênios, comissões) são mock.

Falta:

**Contas a receber**
- Cobrança ligada a agendamento ou avulsa
- Status: pendente, pago, atrasado, parcelado, cancelado
- Baixa de pagamento (dinheiro, PIX, cartão, boleto, convênio)
- Parcelas
- Extrato no perfil do paciente e botão “gerar cobrança”

**Contas a pagar**
- Despesas, categorias, fornecedor, recorrência
- Status: a pagar, pago, vencido

**Fluxo de caixa**
- Entradas × saídas por período, saldo projetado vs realizado

**Convênios / faturamento**
- Lote de guias por convênio e competência
- Envio, glosa, reconciliação

**Comissões**
- Cálculo por profissional/período a partir dos atendimentos
- Aprovação e pagamento

O perfil **Profissional de saúde** não acessa o módulo financeiro geral; no paciente, saldo e pendências só fazem sentido quando as cobranças existirem.

Formas de pagamento em `/configuracoes/pagamentos` também são lista fixa no front — devem ir para o banco junto deste módulo.

## 5. Dashboard

`/dashboard` ainda monta cards e gráficos com mocks (agenda, faturamento, ocupação, faltas, novos pacientes). Aniversariantes já não usam a lista fake de pacientes.

Falta alimentar com dados reais, respeitando o perfil: o profissional de saúde não vê faturamento, contas a pagar/receber nem alertas de gestão.

## 6. Relatórios

`/relatorios` é mock. Falta, com filtro de período e exportação (PDF/Excel):

- Faturamento (geral, por profissional, convênio, procedimento)
- Atendimentos (realizados, cancelados, faltas)
- Inadimplência
- Novos pacientes × recorrentes
- Produtividade por profissional
- Comissões

Depende de agenda, financeiro e profissionais prontos.

## 7. Configurações que ainda são mock

Usuários, perfis e procedimentos já gravam no banco.

Ainda falta:

| Tela | O que falta |
|---|---|
| Dados da clínica | Editar nome, CNPJ, contato, logo, endereço; CRUD de unidades (hoje nascem só no setup) |
| Formas de pagamento | Ver seção 4 |
| Modelos de mensagem | Templates de lembrete (SMS/WhatsApp/e-mail) — previsto na especificação, sem tela ainda |
| Integrações | Gateway, WhatsApp, calendário externo — fora do núcleo |

## 8. Estoque

`/estoque` é mock e, na especificação, é opcional / plano avançado.

- Produtos (categoria, unidade, mínimo, custo, fornecedor)
- Entrada e saída (avulsa ou ligada a procedimento)
- Alerta de estoque baixo
- Relatório de consumo

Pode ficar por último.

## 9. O que falta **dentro** de Pacientes

Cadastro, agenda, histórico, prontuário e documentos clínicos já gravam no banco.

| Aba | Situação |
|---|---|
| Visão geral (próximos e visitas) | Pronto (saldo continua zerado até o financeiro) |
| Acompanhamento / prontuário | Pronto (evolução, queixa, conduta, alta; log de acesso LGPD) |
| Histórico | Pronto (agendamentos persistidos) |
| Documentos | Pronto (PDF/JPG/PNG até 10 MB no banco) |
| Financeiro do paciente | Falta (cobranças) |
| Comunicação | Opcional (histórico de lembretes) |

Recepção e Financeiro não veem prontuário nem documentos clínicos.

## 10. Transversal (não é item de menu)

- Recuperação e redefinição de senha
- Busca global na topbar
- Centro de notificações (sino)
- Documentos do **profissional** (contratos/certidões) — os do paciente já existem
- Envio real de lembretes (WhatsApp/e-mail)

---

## Ordem sugerida

Segue a seção 17 da especificação, ajustada ao que já existe:

1. ~~Procedimentos e convênios~~ — feito
2. ~~Profissionais~~ — feito
3. ~~Agenda~~ — feito
4. ~~Prontuário e documentos do paciente~~ — feito
5. **Financeiro** — cobrança a partir do atendimento; extrato do paciente
6. **Dashboard** com números reais
7. **Relatórios**
8. **Dados da clínica**, unidades, formas de pagamento
9. **Estoque**, se o negócio precisar
10. Recuperação de senha, lembretes e notificações

Cada módulo deve seguir o padrão já usado: Model → Controller → View na API, e `src/services` no painel sem mock.

