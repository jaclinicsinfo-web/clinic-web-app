# Documentação Técnica — ERP para Gestão de Clínicas
### Sistema Administrativo (Back-office)

---

## 1. Visão Geral

Sistema ERP web para gestão administrativa de clínicas médicas/odontológicas/estéticas (multi-especialidade), cobrindo o ciclo completo: cadastro de pacientes, agendamento, atendimento, prontuário, financeiro, gestão de profissionais e relatórios gerenciais.

Este documento descreve **apenas o painel administrativo** (back-office), usado por recepcionistas, gestores, financeiro e profissionais de saúde. Não cobre o portal do paciente (app externo).

### 1.1 Objetivo do documento
Servir de especificação para geração do frontend via IA, com estrutura de módulos, telas, componentes, fluxos e modelo de dados suficientes para implementação sem ambiguidade.

### 1.2 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Componentes UI | shadcn/ui (Radix + Tailwind) |
| Ícones | lucide-react |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |
| Tabelas | TanStack Table |
| Estado global | Zustand (ou Context API para casos simples) |
| Data fetching | TanStack Query (React Query) |
| Autenticação | JWT / NextAuth (a definir com backend) |
| Datas | date-fns |

---

## 2. Arquitetura de Telas (Estrutura de Pastas Sugerida)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── recuperar-senha/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── pacientes/
│   │   │   ├── page.tsx              # listagem
│   │   │   ├── novo/
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # visão geral do paciente
│   │   │       ├── prontuario/
│   │   │       ├── historico/
│   │   │       ├── documentos/
│   │   │       └── financeiro/
│   │   ├── profissionais/
│   │   │   ├── page.tsx
│   │   │   ├── novo/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── agenda/
│   │   │       └── comissoes/
│   │   ├── agenda/
│   │   │   └── page.tsx              # calendário geral
│   │   ├── financeiro/
│   │   │   ├── contas-a-receber/
│   │   │   ├── contas-a-pagar/
│   │   │   ├── fluxo-de-caixa/
│   │   │   ├── convenios/
│   │   │   └── comissoes/
│   │   ├── convenios/
│   │   ├── estoque/
│   │   ├── relatorios/
│   │   └── configuracoes/
│   │       ├── clinica/
│   │       ├── usuarios/
│   │       ├── permissoes/
│   │       └── procedimentos/
│   └── layout.tsx
├── components/
│   ├── ui/                # componentes shadcn base
│   ├── layout/             # sidebar, topbar, breadcrumbs
│   ├── pacientes/
│   ├── profissionais/
│   ├── agenda/
│   ├── financeiro/
│   └── shared/             # tabela genérica, modais, badges de status
├── lib/
├── hooks/
├── types/
└── services/                # chamadas de API
```

---

## 3. Layout Geral do Sistema

### 3.1 Estrutura visual
- **Sidebar fixa** à esquerda (colapsável), com ícones + labels, agrupada por módulo.
- **Topbar** com: notificações, seletor de unidade/clínica (multi-unidade), avatar do usuário logado com menu (perfil, sair). Sem busca global — a busca fica nas tabelas de cada tela.
- **Breadcrumb** abaixo da topbar em páginas internas.
- **Área de conteúdo** com padding consistente, cards com `rounded-xl`, `shadow-sm`, `border`.

### 3.2 Paleta e identidade visual (sugestão, ajustável)
- Cor primária: azul-petróleo ou verde-saúde (transmitir confiança/clínico).
- Cores de status padronizadas:
  - Verde: confirmado / pago / ativo
  - Amarelo: pendente / aguardando
  - Vermelho: cancelado / atrasado / inadimplente
  - Azul: em andamento / agendado
  - Cinza: inativo / arquivado
- Tipografia: Inter ou similar, hierarquia clara (títulos `font-semibold`, corpo `font-normal`).
- Modo claro como padrão; dark mode opcional (nice-to-have).

### 3.3 Navegação (itens do menu lateral)
1. Dashboard
2. Pacientes
3. Agenda
4. Profissionais
5. Financeiro
6. Convênios
7. Estoque (opcional/plano avançado)
8. Relatórios
9. Configurações

---

## 4. Módulo: Autenticação e Controle de Acesso

### 4.1 Telas
- Login (e-mail/senha, opção "esqueci minha senha")
- Recuperação de senha (envio de link por e-mail)
- Redefinição de senha
- Seleção de clínica/unidade (se usuário tiver acesso a mais de uma)

### 4.2 Perfis de acesso (RBAC)
| Perfil | Permissões principais |
|---|---|
| Administrador | Acesso total, configurações, financeiro completo |
| Gestor/Gerente | Relatórios, financeiro, agenda, profissionais (sem config. sistêmica) |
| Recepção | Agenda, cadastro de pacientes, check-in, financeiro básico (recebimentos) |
| Profissional de saúde | Própria agenda, prontuário dos seus pacientes, sem acesso financeiro geral |
| Financeiro | Módulo financeiro completo, sem acesso a prontuário clínico |

- Tela de gestão de usuários e permissões deve permitir criar perfis customizados (matriz de permissões por módulo: visualizar / criar / editar / excluir).

---

## 5. Módulo: Dashboard

Tela inicial com visão consolidada do dia/período.

### 5.1 Componentes (cards de indicadores)
- Atendimentos do dia (total, confirmados, pendentes, cancelados)
- Faturamento do dia/mês (com comparação ao período anterior)
- Taxa de ocupação da agenda (%)
- Taxa de faltas/no-show
- Novos pacientes no período
- Contas a receber vencendo hoje/na semana
- Contas a pagar vencendo hoje/na semana

### 5.2 Gráficos
- Faturamento por período (linha, últimos 30 dias / 12 meses)
- Atendimentos por profissional (barras)
- Distribuição de atendimentos por convênio x particular (pizza/donut)
- Funil de agendamentos (agendado → confirmado → atendido → faltou/cancelado)

### 5.3 Lista/atalhos
- Próximos atendimentos do dia (mini-agenda)
- Pacientes aniversariantes do dia/semana
- Alertas (estoque baixo, documentos vencendo, etc.)

---

## 6. Módulo: Pacientes

### 6.1 Listagem de pacientes
- Tabela com busca (nome, CPF, telefone), filtros (status, convênio, profissional responsável, faixa etária).
- Colunas: nome, telefone, convênio, último atendimento, próximo agendamento, status.
- Ações rápidas: ver perfil, agendar, editar, arquivar.
- Botão "Novo Paciente".

### 6.2 Cadastro/Edição de paciente
Formulário dividido em seções (tabs ou accordion):
- **Dados pessoais**: nome completo, CPF, RG, data de nascimento, sexo, estado civil, profissão.
- **Contato**: telefone, WhatsApp, e-mail, endereço completo (com CEP autopreenchido).
- **Convênio**: convênio/plano, número da carteirinha, validade.
- **Responsável** (se menor de idade ou dependente): nome, CPF, parentesco, contato.
- **Dados clínicos gerais**: alergias, condições pré-existentes, medicações em uso (campo texto/tags).
- **Preferências**: profissional preferido, forma de contato preferida, observações gerais.
- **Consentimentos**: LGPD (aceite de termo), autorização de uso de imagem.

### 6.3 Perfil do Paciente (página de detalhe)
Header com foto/avatar, nome, idade, status, tags rápidas (convênio, alertas de alergia).

Abas:
1. **Visão geral**: resumo de próximos agendamentos, últimas visitas, pendências financeiras.
2. **Prontuário/Acompanhamento clínico**:
   - Linha do tempo de atendimentos (data, profissional, procedimento, evolução/observações).
   - Anexos (exames, receitas, imagens).
   - Registro de evolução por atendimento (texto livre + campos estruturados conforme especialidade).
3. **Histórico**: log de agendamentos passados (realizados, cancelados, faltas) com filtros por período.
4. **Documentos**: upload/download de documentos (exames, laudos, atestados, contratos).
5. **Financeiro**: extrato do paciente (cobranças, pagamentos, parcelamentos, saldo devedor), botão "gerar cobrança".
6. **Comunicação**: histórico de mensagens/lembretes enviados (SMS, WhatsApp, e-mail) — opcional.

---

## 7. Módulo: Agenda

### 7.1 Visualização
- Calendário com visões: dia, semana, mês.
- Filtro por profissional, por sala/consultório, por status.
- Código de cores por status do agendamento (agendado, confirmado, em atendimento, atendido, cancelado, faltou).
- Visão "linha do tempo" por profissional (colunas lado a lado, tipo agenda de clínica).

### 7.2 Criação/edição de agendamento
Modal ou painel lateral (drawer) com:
- Paciente (busca com autocomplete, opção de cadastrar novo inline).
- Profissional responsável.
- Procedimento/tipo de consulta.
- Data, horário início/fim (duração calculada automaticamente pelo tipo de procedimento).
- Sala/consultório (se aplicável).
- Convênio ou particular.
- Observações.
- Status inicial.

### 7.3 Fluxo de status do agendamento
```
Agendado → Confirmado → Check-in (paciente chegou) → Em atendimento → Atendido
                                              ↘ Cancelado
                                              ↘ Faltou (no-show)
```

### 7.4 Funcionalidades adicionais
- Reagendamento (drag-and-drop no calendário).
- Bloqueio de horários (folga, almoço, indisponibilidade do profissional).
- Lista de espera para encaixes.
- Confirmação automática (indicador de lembrete enviado).

---

## 8. Módulo: Profissionais

### 8.1 Listagem
- Tabela: nome, especialidade, tipo de vínculo (CLT/PJ/autônomo), status (ativo/inativo), % comissão.
- Filtro por especialidade e status.

### 8.2 Cadastro/Edição
- **Dados pessoais**: nome, CPF, RG, contato, foto.
- **Dados profissionais**: especialidade(s), registro de conselho (CRM/CRO/CREFITO etc.), número do registro.
- **Vínculo**: tipo de contrato, data de admissão, forma de remuneração (fixo, comissão, misto).
- **Comissionamento**: percentual por procedimento ou tabela de comissão customizada.
- **Horários de atendimento**: grade semanal (dias e horários disponíveis), intervalos, exceções/folgas.
- **Procedimentos habilitados**: quais procedimentos o profissional pode realizar (vincula à agenda).

### 8.3 Perfil do profissional
Abas:
1. **Visão geral**: indicadores (atendimentos no mês, faturamento gerado, taxa de ocupação da agenda).
2. **Agenda**: agenda específica do profissional.
3. **Pacientes atendidos**: lista de pacientes vinculados.
4. **Comissões**: extrato de comissões por período, status de pagamento.
5. **Documentos**: contrato, certificações, documentos do conselho de classe.

---

## 9. Módulo: Financeiro

### 9.1 Submódulos

**a) Contas a Receber**
- Listagem de cobranças (paciente, valor, vencimento, status: pago/pendente/atrasado/parcelado).
- Filtros por período, status, convênio, forma de pagamento.
- Geração de cobrança avulsa ou vinculada a atendimento.
- Registro de pagamento (dinheiro, cartão, PIX, boleto), com baixa manual ou automática (integração gateway).
- Parcelamento e controle de parcelas.

**b) Contas a Pagar**
- Fornecedores, despesas fixas e variáveis (aluguel, insumos, salários, comissões).
- Categorização de despesas.
- Status: a pagar, pago, vencido.
- Recorrência (despesas fixas mensais).

**c) Fluxo de Caixa**
- Visão consolidada de entradas x saídas por período.
- Saldo projetado vs realizado.
- Gráfico de fluxo de caixa mensal/diário.

**d) Convênios/Faturamento**
- Fechamento de lote de guias/faturas por convênio e período.
- Status de envio e glosas (recusas do convênio).
- Reconciliação de pagamentos recebidos de convênios.

**e) Comissões**
- Cálculo automático de comissões por profissional/período com base em atendimentos realizados.
- Aprovação e fechamento de folha de comissão.
- Histórico de pagamentos de comissão.

### 9.2 Componentes-chave de UI
- Cards de resumo no topo (total a receber, total a pagar, saldo do mês, inadimplência).
- Tabelas com exportação (CSV/PDF).
- Modal de registro de pagamento/recebimento.
- Gráfico de DRE simplificado (receitas x despesas por categoria).

---

## 10. Módulo: Convênios / Planos de Saúde

- Cadastro de convênios: nome, tabela de preços por procedimento, prazo médio de pagamento, dados de contato/portal.
- Vínculo de pacientes a convênios.
- Tabela de procedimentos e valores por convênio (comparação com particular).
- Regras de autorização prévia (se aplicável).

---

## 11. Módulo: Estoque (opcional / plano avançado)

Relevante para clínicas que usam insumos (odontológicas, estéticas).
- Cadastro de produtos/insumos (nome, categoria, unidade de medida, estoque mínimo).
- Entrada e saída de estoque (vinculada ou não a procedimentos).
- Alertas de estoque baixo.
- Relatório de consumo por procedimento/profissional.

---

## 12. Módulo: Relatórios

Relatórios gerenciais com filtros de período e exportação (PDF/Excel):
- Relatório de faturamento (geral, por profissional, por convênio, por procedimento).
- Relatório de atendimentos (realizados, cancelados, faltas).
- Relatório de inadimplência.
- Relatório de novos pacientes x recorrentes.
- Relatório de produtividade por profissional.
- Relatório de comissões.

Cada relatório deve ter: seletor de período, filtros específicos, visualização em tabela + gráfico, botão de exportação.

---

## 13. Módulo: Configurações

- **Dados da clínica**: nome, CNPJ, endereço, logo, unidades (multi-unidade).
- **Usuários e permissões**: CRUD de usuários, atribuição de perfis (RBAC).
- **Procedimentos**: cadastro de procedimentos/serviços oferecidos (nome, duração padrão, valor, categoria).
- **Formas de pagamento aceitas**.
- **Modelos de mensagens**: templates de lembrete de consulta (SMS/WhatsApp/e-mail).
- **Integrações**: gateway de pagamento, WhatsApp API, calendário externo.

---

## 14. Modelo de Dados (Entidades Principais)

### Paciente
```
id, nome, cpf, rg, data_nascimento, sexo, telefone, whatsapp, email,
endereco {cep, rua, numero, complemento, bairro, cidade, uf},
convenio_id, numero_carteirinha, responsavel {nome, cpf, parentesco},
alergias[], condicoes_preexistentes[], observacoes,
status (ativo/inativo/arquivado), criado_em, atualizado_em
```

### Profissional
```
id, nome, cpf, foto_url, especialidades[], registro_conselho,
tipo_vinculo, percentual_comissao, procedimentos_habilitados[],
grade_horarios[{dia_semana, hora_inicio, hora_fim}],
status (ativo/inativo), criado_em
```

### Agendamento
```
id, paciente_id, profissional_id, procedimento_id,
data, hora_inicio, hora_fim, sala,
convenio_id | particular (bool),
status (agendado/confirmado/em_atendimento/atendido/cancelado/faltou),
observacoes, criado_por, criado_em
```

### Atendimento / Evolução Clínica
```
id, agendamento_id, paciente_id, profissional_id, data,
procedimento_realizado, evolucao (texto), anexos[],
proximo_retorno_sugerido, criado_em
```

### Procedimento
```
id, nome, categoria, duracao_padrao_min, valor_particular,
valores_por_convenio[{convenio_id, valor}], status
```

### Cobrança / Financeiro (Receber)
```
id, paciente_id, agendamento_id, valor, forma_pagamento,
status (pendente/pago/atrasado/parcelado), vencimento,
parcelas[{numero, valor, vencimento, status}], pago_em
```

### Despesa (Pagar)
```
id, descricao, categoria, fornecedor, valor, vencimento,
status (a_pagar/pago/vencido), recorrente (bool), pago_em
```

### Convênio
```
id, nome, tabela_precos[{procedimento_id, valor}],
prazo_pagamento_dias, contato, status
```

### Usuário (sistema)
```
id, nome, email, senha_hash, perfil_id, unidades_acesso[],
status (ativo/inativo), ultimo_acesso
```

### Perfil de Acesso
```
id, nome, permissoes[{modulo, visualizar, criar, editar, excluir}]
```

---

## 15. Componentes de UI Reutilizáveis (para a IA gerar como base)

| Componente | Uso |
|---|---|
| `DataTable` | Tabela genérica com paginação, ordenação, filtros, busca |
| `StatusBadge` | Badge colorido para status (agendamento, financeiro, paciente) |
| `PatientCard` | Card resumido de paciente (usado em busca/autocomplete) |
| `AppointmentModal` | Modal/drawer de criação e edição de agendamento |
| `CalendarView` | Componente de calendário (dia/semana/mês) com drag-and-drop |
| `StatCard` | Card de indicador numérico do dashboard (com variação %) |
| `Sidebar` | Menu lateral colapsável com grupos de módulos |
| `Topbar` | Barra superior com busca, notificações, usuário |
| `FormSection` | Wrapper de seção de formulário com título e grid responsivo |
| `Timeline` | Linha do tempo de eventos (prontuário, histórico) |
| `MoneyInput` | Input formatado para valores monetários (R$) |
| `EmptyState` | Estado vazio padronizado (sem dados/sem resultados) |
| `ConfirmDialog` | Dialog de confirmação para ações destrutivas |

---

## 16. Requisitos Não Funcionais

- **Responsividade**: prioridade desktop (uso administrativo), mas deve funcionar em tablet; mobile é secundário.
- **Performance**: paginação server-side em listagens grandes; lazy loading de módulos pesados (calendário, relatórios).
- **Acessibilidade**: contraste adequado, navegação por teclado nos formulários e modais.
- **Segurança**: rotas protegidas por sessão/token, controle de acesso por módulo (RBAC), mascaramento de dados sensíveis (CPF) conforme perfil.
- **LGPD**: registro de consentimento do paciente, log de acesso a dados sensíveis (prontuário).
- **Multi-unidade**: estrutura deve suportar clínica com mais de uma unidade/filial, com seletor de contexto.

---

## 17. Prioridade de Implementação (sugestão de ordem para a IA construir)

1. Layout base (sidebar, topbar, autenticação, dashboard vazio)
2. Módulo Pacientes (listagem + cadastro + perfil)
3. Módulo Agenda (calendário + criação de agendamento)
4. Módulo Profissionais (listagem + cadastro + perfil)
5. Módulo Financeiro (contas a receber/pagar)
6. Dashboard completo (com gráficos e indicadores)
7. Módulo Convênios
8. Módulo Relatórios
9. Módulo Configurações
10. Módulo Estoque (se aplicável ao negócio)

---

*Fim do documento. Este arquivo serve como especificação funcional e estrutural para geração do frontend em Next.js + Tailwind CSS + shadcn/ui.*
