# Briefing — Manual do usuário (ClinicERP)

Use este arquivo como **única fonte** para gerar um PDF de manual do usuário final. O texto abaixo descreve o sistema como ele funciona hoje.

---

## Instruções para a IA que vai gerar o PDF

1. **Idioma:** português do Brasil, tom profissional, claro e direto. Trate o leitor por “você”.
2. **Público:** equipe da clínica (recepção, gestores, profissionais de saúde e financeiro). Não é manual técnico de TI.
3. **Não incluir no PDF:** esta seção de instruções; nomes de arquivos, rotas internas (`/agenda`), APIs, banco de dados, “mock”, “RBAC”, stack (Next.js etc.).
4. **Incluir:** capa, sumário, capítulos por módulo, tabelas de perfis, listas de campos de cada cadastro e um glossário de status no final.
5. **Capa sugerida:** título “Manual do usuário”; subtítulo “Sistema de gestão para clínicas”; uma frase de posicionamento: painel administrativo para cadastro de pacientes, agenda, atendimento, prontuário, financeiro, convênios, estoque e relatórios.
6. **Exportação:** nas telas o botão se chama **Exportar**. Gera um arquivo **CSV** (abre no Excel, Google Planilhas e similares), com as linhas já filtradas e as colunas visíveis. Não é um arquivo `.xlsx` nativo.
7. **Multiunidade:** a clínica pode ter várias unidades. O usuário só vê as unidades liberadas na conta e troca o contexto na barra superior.
8. **O que cada perfil vê** deve aparecer cedo no PDF (capítulo próprio), porque o menu muda conforme o acesso.
9. **Não invente** telas, campos ou integrações que não estejam neste briefing (gateway de pagamento, portal do paciente, busca global na barra superior e calendário externo **não existem** no produto atual). WhatsApp e e-mail de lembretes existem no módulo Integrações (plano Ilimitado).
10. Quando um recurso for restrito a um perfil, deixe isso explícito no capítulo correspondente.

---

# Conteúdo do manual

## 1. O que é o sistema

Sistema web de gestão para clínicas médicas, odontológicas, estéticas e de outras especialidades. Cobre o ciclo da operação:

- cadastro de pacientes e profissionais;
- agenda e atendimento;
- prontuário e documentos clínicos;
- financeiro (receber, pagar, fluxo de caixa, convênios e comissões);
- estoque de insumos;
- relatórios gerenciais;
- configurações da clínica, usuários e permissões.

É um **painel interno** (back-office). Não há portal do paciente.

A clínica pode ter **várias unidades**. Quase tudo que a pessoa vê (agenda, pacientes, financeiro etc.) vale para a **unidade selecionada** no momento.

---

## 2. Como entrar e usar o painel

### 2.1 Primeiro acesso da clínica (configuração inicial)

Na primeira vez, um assistente em três passos cria a clínica:

1. **Clínica** — nome fantasia, razão social, CNPJ, telefone e e-mail.
2. **Unidade** — nome da unidade e cidade (a primeira unidade da clínica).
3. **Administrador** — nome, e-mail e senha (mínimo 8 caracteres, com confirmação).

Essa primeira conta nasce com o perfil **Administrador**. Os demais usuários são criados depois em Configurações.

### 2.2 Login

- Campos: e-mail, senha, opção **Lembrar-me**.
- Link **Esqueci minha senha**.
- Se a conta tiver **mais de uma unidade**, o sistema pede para escolher a unidade da sessão antes de abrir o painel.
- Conta **inativa** não entra.

### 2.3 Recuperação de senha

1. Na tela de login, abrir **Esqueci minha senha**.
2. Informar o e-mail da conta.
3. Se o envio de e-mail estiver configurado na clínica, chega um link para **redefinir a senha**.
4. Na redefinição, informar a nova senha (mínimo 8 caracteres) e confirmar.

### 2.4 Layout do painel

**Menu lateral (esquerda)**

- Pode ser recolhido (só ícones) ou expandido (ícones + nomes).
- Em telas menores, abre pelo botão de menu.
- Itens agrupados em **Operação**, **Gestão** e **Sistema**.
- Só aparecem os módulos que o perfil da pessoa pode visualizar.
- No topo do menu: nome da clínica.

**Barra superior**

- Caminho da página (breadcrumb).
- **Seletor de unidade** (quando a conta tem unidades liberadas).
- **Sino de notificações** (ver seção 15).
- **Menu do usuário:** nome, perfil, e-mail e **Sair**. O administrador também tem atalho **Meu perfil** (vai para a lista de usuários).

**Área principal**

- Título da tela, descrição curta e botões de ação (Novo, Exportar etc.).
- Tabelas, calendário, cards e formulários.

### 2.5 Padrão das tabelas (vale para quase todas as listagens)

Nas telas de lista, em geral você encontra:

| Recurso | O que faz |
|---|---|
| Busca | Filtra pelo texto digitado (o placeholder indica o que busca: nome, CPF, telefone etc.). |
| Filtros | Listas suspensas (status, convênio, categoria…). |
| Colunas | Mostra ou esconde colunas da tabela. |
| Ordenação | Clique no cabeçalho da coluna para ordenar. |
| Exportar | Baixa CSV das **linhas filtradas**, com as **colunas visíveis** (a coluna de ações não entra). Abre no Excel. |
| Paginação | Anterior / próxima página, com contagem de registros. |
| Clique na linha | Em várias telas, abre o detalhe do registro. |
| Menu ⋮ | Ações da linha (ver, editar, arquivar, registrar pagamento etc.). |

O arquivo exportado usa o nome da tela, por exemplo: `pacientes.csv`, `contas-a-receber.csv`, `relatorio-faturamento.csv`.

---

## 3. Menu do sistema

### Operação

- Dashboard
- Pacientes
- Agenda
- Profissionais

### Gestão

- Financeiro
  - Visão geral
  - Contas a receber
  - Contas a pagar
  - Fluxo de caixa
  - Faturamento de convênios
  - Comissões
- Convênios
- Estoque
- Relatórios

### Sistema (só quem tem permissão de Configurações; em geral o Administrador)

- Dados da clínica
- Usuários *(somente Administrador)*
- Perfis e permissões *(somente Administrador)*
- Procedimentos
- Formas de pagamento

---

## 4. Perfis de acesso

Cada usuário pertence a **uma clínica**, tem **um perfil** e pode atuar em **uma ou mais unidades**.

O perfil define:

- o que aparece no **menu**;
- quais **rotas** a pessoa pode abrir (se tentar um endereço sem permissão, o sistema redireciona);
- as ações **Visualizar / Criar / Editar / Excluir** de cada módulo.

Na configuração inicial a clínica já recebe cinco **perfis de sistema**:

| Perfil | Para quem é | Resumo |
|---|---|---|
| Administrador | Dono / TI da clínica | Acesso total, inclusive usuários, permissões e dados da clínica. |
| Gestor | Gerência da operação | Agenda, pacientes, profissionais, financeiro, convênios, estoque e relatórios. Sem configurações. |
| Recepção | Balcão / secretaria | Pacientes, agenda, recebimentos e consulta a profissionais e convênios. Sem estoque, relatórios nem configurações. |
| Profissional de saúde | Médico, dentista, terapeuta etc. | Só a **própria agenda** e os **próprios pacientes** (preferidos ou já atendidos). Sem financeiro geral e sem cadastro de profissionais. |
| Financeiro | Tesouraria | Financeiro completo, convênios e relatórios. Sem prontuário clínico e sem configurações. |

O administrador pode **ajustar a matriz** dos outros perfis em **Configurações › Perfis e permissões**. As permissões do **Administrador não podem ser alteradas**. A mudança vale para todas as contas daquele perfil.

**Usuários** e **Perfis e permissões** só o Administrador acessa, mesmo que Configurações esteja visível.

### 4.1 O que cada perfil vê no menu (padrão de fábrica)

| Módulo | Admin | Gestor | Recepção | Prof. saúde | Financeiro |
|---|---|---|---|---|---|
| Dashboard | Sim | Sim | Sim | Sim | Sim |
| Pacientes | Sim | Sim | Sim | Sim | Sim |
| Agenda | Sim | Sim | Sim | Sim (só a própria) | Sim |
| Profissionais | Sim | Sim | Só visualizar | Não | Só visualizar |
| Financeiro | Sim | Sim | Sim (recebimentos) | Não | Sim |
| Convênios | Sim | Sim | Só visualizar | Só visualizar | Sim |
| Estoque | Sim | Sim | Não | Só visualizar | Só visualizar |
| Relatórios | Sim | Sim | Não | Não | Sim |
| Configurações | Sim | Não | Não | Não | Não |

### 4.2 Matriz padrão de ações

Legenda: V = visualizar · C = criar · E = editar · X = excluir.

**Administrador:** V C E X em todos os módulos.

**Gestor**

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | ● | ● | |
| Agenda | ● | ● | ● | ● |
| Profissionais | ● | ● | ● | |
| Financeiro | ● | ● | ● | |
| Convênios | ● | ● | ● | |
| Estoque | ● | ● | ● | |
| Relatórios | ● | | | |
| Configurações | | | | |

**Recepção**

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | ● | ● | |
| Agenda | ● | ● | ● | |
| Profissionais | ● | | | |
| Financeiro | ● | ● | | |
| Convênios | ● | | | |
| Estoque | | | | |
| Relatórios | | | | |
| Configurações | | | | |

**Profissional de saúde**

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | | ● | |
| Agenda | ● | ● | ● | |
| Profissionais | | | | |
| Financeiro | | | | |
| Convênios | ● | | | |
| Estoque | ● | | | |
| Relatórios | | | | |
| Configurações | | | | |

**Financeiro**

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | | | |
| Agenda | ● | | | |
| Profissionais | ● | | | |
| Financeiro | ● | ● | ● | ● |
| Convênios | ● | ● | ● | |
| Estoque | ● | | | |
| Relatórios | ● | | | |
| Configurações | | | | |

### 4.3 Regras extras (além da matriz)

- **Prontuário e documentos clínicos** do paciente: só **Administrador**, **Gestor** e **Profissional de saúde**. Recepção e Financeiro **não veem** essas abas.
- **Profissional de saúde:** lista só pacientes em que é o profissional preferido **ou** já teve agendamento; na agenda, só os próprios horários. O login precisa estar **vinculado** ao cadastro clínico em Profissionais.
- **Dashboard do profissional de saúde:** não mostra faturamento, contas a receber/pagar, gráficos financeiros nem alertas de gestão.
- **Financeiro do paciente** (extrato na ficha): visível para quem acessa o perfil do paciente, inclusive quem não entra no módulo Financeiro geral — o profissional de saúde vê saldo e pendências reais, sem o menu Financeiro.
- Não dá para inativar a **própria conta** nem o **último administrador** da clínica.

### 4.4 Planos e limite de contas

O número de usuários **ativos** segue o plano da clínica:

| Plano | Contas ativas |
|---|---|
| Essencial | até 5 |
| Profissional | até 20 |
| Ilimitado | sem teto |

Ao estourar o limite, o administrador precisa inativar contas para criar novas. Nada é apagado automaticamente.

---

## 5. Dashboard

Tela inicial após o login. Visão do **dia** e do **mês**.

**Atalhos no topo**

- Ver relatórios (se o perfil tiver o módulo Relatórios).
- Abrir agenda (se o perfil tiver Agenda).

**Indicadores (cards)**

- Atendimentos hoje (total, confirmados, agendados, cancelados).
- Faturamento do mês (com variação em relação ao período anterior) — oculto sem permissão financeira.
- Taxa de ocupação da agenda no mês.
- Taxa de faltas (no-show).
- Novos pacientes no mês.
- Previsto para hoje (soma dos atendimentos ativos do dia) — financeiro.
- A receber em 7 dias (quantidade e valor em atraso) — financeiro.
- A pagar em 7 dias (quantidade e valor vencido) — financeiro.

**Gráficos** (os financeiros só para quem tem o módulo Financeiro)

- Faturamento dos últimos 30 dias / 12 meses.
- Distribuição convênio × particular.
- Atendimentos por profissional.
- Funil de agendamentos (agendado → confirmado → atendido → faltou/cancelado).

**Listas**

- Próximos atendimentos do dia (horário, paciente, procedimento, profissional, sala, valor se houver permissão financeira, status). Clique no nome abre a ficha do paciente. Atalho “Ver agenda”.
- Alertas de gestão (estoque baixo, documentos, financeiro etc.) — só com permissão financeira.
- Aniversariantes do mês (nome, idade que fará, dia/mês). Clique abre a ficha.

---

## 6. Pacientes

Cadastro central da clínica. Listagem, ficha completa, prontuário, histórico, documentos e extrato financeiro.

### 6.1 Listagem

- Botão **Novo paciente**.
- Busca por **nome, CPF ou telefone**.
- Filtros: status (ativo / inativo / arquivado), convênio (incluindo Particular), profissional preferido, faixa etária (criança até 17, adulto 18–59, idoso 60+).
- Colunas: paciente (com idade e alerta de alergia), telefone, convênio, último atendimento, próximo agendamento, valor em aberto, status.
- **Exportar** → `pacientes.csv`.
- Clique na linha ou **Ver perfil** abre a ficha.

**Ações da linha (menu ⋮)**

- Ver perfil
- Agendar (abre a agenda já com o paciente)
- Editar (se tiver permissão de editar)
- Arquivar (se ativo e tiver permissão de editar) — pede confirmação

O profissional de saúde só vê a lista restrita aos seus pacientes.

### 6.2 Cadastro e edição

Formulário em seções. O aceite de **LGPD é obrigatório** para salvar.

**Dados pessoais**

- Nome completo (obrigatório)
- CPF (obrigatório, validado)
- RG
- Data de nascimento (obrigatória)
- Sexo: Masculino, Feminino, Outro
- Estado civil: Solteiro(a), Casado(a), Divorciado(a), Viúvo(a), União estável
- Profissão

**Contato**

- Telefone (obrigatório)
- WhatsApp
- E-mail
- Endereço: CEP (preenche logradouro, bairro, cidade e UF pela consulta de CEP), número, complemento

**Convênio**

- Convênio ou **Particular**
- Se for convênio: número da carteirinha (obrigatório) e validade

**Responsável** (opcional — menores ou dependentes)

- Nome, CPF, parentesco, telefone

**Dados clínicos gerais** (tags / lista)

- Alergias
- Condições pré-existentes
- Medicações em uso

**Preferências**

- Profissional preferido
- Forma de contato: WhatsApp, telefone ou e-mail
- Observações gerais

**Consentimentos**

- Aceite do termo LGPD (obrigatório)
- Autorização de uso de imagem

Status do paciente: **Ativo**, **Inativo** ou **Arquivado**.

### 6.3 Ficha do paciente (perfil)

**Cabeçalho**

- Iniciais, nome, status, idade, CPF mascarado, profissão.
- Badges: convênio ou particular, carteirinha, alergias em destaque, saldo em aberto.
- Telefone, e-mail, bairro/cidade.
- Botões **Editar** (se puder) e **Agendar**.

**Abas**

1. **Visão geral** — próximos agendamentos, últimas visitas, resumo do acompanhamento clínico (se o perfil puder ver prontuário), pendências financeiras.
2. **Acompanhamento** (prontuário) — só Admin, Gestor e Profissional de saúde.
3. **Histórico** — agendamentos passados.
4. **Documentos** — só quem vê prontuário.
5. **Financeiro** — extrato, baixa e gerar cobrança.

Não existe aba de histórico de mensagens/WhatsApp.

### 6.4 Acompanhamento / prontuário

Linha do tempo clínica do paciente.

**Acompanhamentos**

- Título, especialidade, profissional, queixa inicial, quadro inicial, objetivo.
- Status: Em acompanhamento, Alta, Abandonado.
- Datas de início e de alta; resumo da alta.

**Registros na linha do tempo**

Tipos: Avaliação inicial, Evolução, Retorno, Alta.

Campos de um registro:

- Tipo
- Procedimento realizado
- Profissional
- Queixa principal
- Quadro clínico
- Evolução (texto)
- Conduta
- Resposta ao tratamento: Melhorou, Estável, Piorou, Resolvido
- Escala de dor (0 a 10), quando aplicável
- Próximo retorno sugerido
- Anexos do atendimento

Quem pode **registrar** evolução: os mesmos perfis que veem o prontuário (Admin, Gestor, Profissional de saúde).

### 6.5 Histórico

Tabela de agendamentos do paciente.

- Busca por procedimento ou profissional.
- **Exportar** → `historico-paciente.csv`.
- Status de cada consulta (agendado, atendido, faltou etc.).

### 6.6 Documentos do paciente

Arquivos clínicos e cadastrais.

- Tipos: Exame laboratorial, Exame de imagem, Laudo, Receita, Atestado, Termo de consentimento, Documento pessoal.
- Formatos: **PDF, JPG ou PNG**, até **10 MB**.
- Ações: enviar, baixar, excluir (quem pode registrar no prontuário).

### 6.7 Financeiro do paciente

- Lista de cobranças (descrição, valor, vencimento, status, forma de pagamento).
- Busca e **Exportar** → `financeiro-paciente.csv`.
- **Gerar cobrança** avulsa.
- **Registrar pagamento** (baixa).
- Saldo em aberto no cabeçalho da ficha.

---

## 7. Agenda

Calendário operacional da unidade.

### 7.1 Visão

- Modos: **Dia**, **Semana**, **Mês**.
- Navegação: período anterior / próximo.
- Filtros: profissional, sala/consultório, status.
- Cores por status do agendamento (ver glossário).
- Visão tipo “colunas por profissional” no dia (grade da clínica).

**Cards do dia**

- Atendimentos do dia
- Confirmados / check-in
- Em atendimento
- Previsto no dia (valor)

O profissional de saúde vê **somente a própria agenda**.

### 7.2 Novo agendamento

Painel lateral. O paciente precisa **já estar cadastrado** em Pacientes (não há cadastro rápido pela agenda).

Pode abrir já com paciente pré-selecionado (pela ficha do paciente) ou a partir de um horário vazio no calendário.

**Paciente**

- Busca por nome, CPF ou telefone.
- Alerta de alergia, se houver.

**Atendimento**

- Profissional (obrigatório)
- Procedimento (obrigatório) — a duração padrão preenche o horário de término
- Data, início e término
- Sala / consultório (Consultório 1, 2, 3, Sala de Exames, Sala Cirúrgica — conforme cadastro da clínica)
- Status inicial

**Convênio e valor**

- Particular ou convênio
- Valor calculado pela tabela (particular ou preço do convênio)

**Observações**

- Anotações da recepção

### 7.3 Fluxo de status

```
Agendado → Confirmado → Check-in → Em atendimento → Atendido
                              ↘ Cancelado
                              ↘ Faltou
```

Ao marcar **Atendido**, o sistema **gera a cobrança** correspondente (se ainda não existir).

Há indicador de **lembrete enviado**. No plano Ilimitado, o módulo Integrações envia o lembrete de verdade por WhatsApp (API oficial da Meta) e/ou e-mail, conforme as regras da clínica.

### 7.4 Outras ações

- **Reagendar** (incluindo arrastar no calendário, quando a visão permitir).
- **Bloquear horário** (almoço, folga, indisponibilidade): profissional, data, início, término e motivo.
- **Lista de espera:** paciente, período preferido (manhã, tarde ou qualquer), profissional, procedimento. Depois dá para **encaixar** em um horário.

---

## 8. Profissionais

Cadastro **clínico** da pessoa que atende (é diferente da conta de login). O vínculo com o usuário é opcional e é o que faz o perfil “Profissional de saúde” ver só a própria agenda e os próprios pacientes.

### 8.1 Listagem

- Botão **Novo profissional**.
- Busca por nome, e-mail ou registro do conselho.
- Filtros por especialidade e status (ativo/inativo).
- Colunas típicas: nome, especialidade, tipo de vínculo (CLT / PJ / Autônomo), status, % de comissão.
- **Exportar** → `profissionais.csv`.

### 8.2 Cadastro e edição

**Dados pessoais**

- Nome, CPF, RG, e-mail, telefone, foto (URL)

**Dados profissionais**

- Especialidade(s) — ao menos uma. Opções: Clínica Geral, Cardiologia, Dermatologia, Ortopedia, Pediatria, Ginecologia, Odontologia, Nutrição, Fisioterapia, Estética.
- Conselho: CRM, CRO, CREFITO, CRN, CRP, COREN
- Número do registro

**Vínculo e remuneração**

- Tipo: CLT, PJ ou Autônomo
- Data de admissão
- Forma: Fixo, Comissão ou Misto
- Percentual de comissão (obrigatório se não for só fixo)
- Opção de comissão por procedimento

**Grade semanal**

- Para cada dia da semana: ativo ou não, horário de início e fim.
- É obrigatório ao menos um dia de atendimento.
- O fim deve ser depois do início.

**Procedimentos habilitados**

- Quais serviços da clínica aquele profissional pode realizar (usado na agenda). Ao menos um.

**Vínculo com login**

- Associar (ou não) a uma conta de usuário com perfil Profissional de saúde.

### 8.3 Perfil do profissional

Abas:

1. **Visão geral** — indicadores (atendimentos no mês, faturamento gerado, ocupação).
2. **Agenda** — agenda daquela pessoa, com busca e **Exportar** → `agenda-do-profissional.csv`.
3. **Pacientes** — pacientes atendidos; busca e **Exportar** → `pacientes-do-profissional.csv`.
4. **Comissões** — extrato por competência; busca e **Exportar** → `comissoes-do-profissional.csv`. Status: Prevista, Aprovada, Paga.
5. **Documentos** — área para contrato, certidões do conselho e certificações (tipos: Contrato, Certificação, Conselho de classe, Documento pessoal).

---

## 9. Financeiro

Menu com subtelas. O profissional de saúde **não entra** neste módulo.

### 9.1 Visão geral

Cards de resumo:

- Total em aberto a receber / atrasado / recebido no mês / vencendo em 7 dias
- Total a pagar / vencido / pago no mês / vencendo em 7 dias
- Entradas, saídas e saldo do mês (com variação)
- Lotes de convênio: apresentado, glosado, recebido, taxa de glosa
- Comissões da competência: previsto, aprovadas, pagas

Também há:

- Gráfico de fluxo de caixa
- DRE simplificado (receitas × despesas por categoria)
- Lista de inadimplentes
- Atalhos para as subtelas

### 9.2 Contas a receber

Cobranças de pacientes (geradas ao concluir o atendimento ou avulsas).

**Status:** Pendente, Pago, Atrasado, Parcelado, Cancelado. Pendente com vencimento passado aparece como **Atrasado**.

- Busca por paciente ou descrição.
- Filtros: status, origem (particular / convênios / um convênio específico), forma de pagamento.
- **Exportar** → `contas-a-receber.csv`.
- Botão **Gerar cobrança:** paciente, descrição, valor, vencimento, convênio ou particular, número de parcelas (1 = à vista).

**Ações da linha**

- Registrar pagamento (dinheiro, PIX, cartão de crédito/débito, boleto, convênio)
- Ver parcelas (quando houver parcelamento)
- Ver paciente

### 9.3 Contas a pagar

Despesas da clínica.

**Status:** A pagar, Pago, Vencido.

- Busca por despesa ou fornecedor.
- Filtros: status e categoria.
- **Exportar** → `contas-a-pagar.csv`.
- Botão **Nova despesa:** descrição, categoria, fornecedor, valor, vencimento, recorrente (sim/não).
- Ação: **dar baixa** no pagamento.

**Categorias de despesa**

Aluguel, Folha de pagamento, Comissões, Insumos e materiais, Energia elétrica, Água, Internet e telefonia, Software e sistemas, Marketing, Manutenção, Impostos, Limpeza, Outros.

O fechamento da folha de comissões **gera uma despesa** na categoria Comissões.

### 9.4 Fluxo de caixa

Entradas × saídas no período, com base nas **baixas** (o que realmente entrou ou saiu).

- Visão consolidada e gráfico (diário / mensal).
- Saldo do período.

### 9.5 Faturamento de convênios

Lotes de guias por convênio e competência (mês de referência).

**Status do lote:** Aberto, Enviado, Pago, Glosado, Pago parcial.

- Busca por convênio.
- **Exportar** → `faturamento-convenios.csv`.
- **Novo lote:** convênio + competência.
- No detalhe: enviar o lote; conciliar informando valor glosado e valor recebido.
- Ao encerrar/conciliar como pago, as cobranças do lote são marcadas como pagas.

### 9.6 Comissões

Cálculo a partir dos **atendimentos realizados** no período, usando o percentual (e regras) do cadastro do profissional.

**Status:** Prevista, Aprovada, Paga.

- Cards: total previsto, aprovadas, pagas, profissionais comissionados.
- Filtro por competência (mês).
- Busca por profissional.
- **Exportar** → `comissoes.csv`.
- Ações: **Calcular** comissões da competência, **Aprovar**, **Pagar**, **Fechar folha** (gera a despesa correspondente).

---

## 10. Convênios

Cadastro das operadoras usadas em pacientes, agenda, tabela de preços e faturamento.

O **faturamento em lote** fica no Financeiro (Faturamento de convênios), não nesta tela.

### 10.1 Listagem

- Botão **Novo convênio**.
- Busca por nome ou registro ANS.
- Filtro de status (ativo/inativo).
- Colunas: nome, ANS, prazo de pagamento, autorização prévia, contato, status.
- **Exportar** → `convenios.csv`.

### 10.2 Cadastro

- Nome
- Registro ANS
- Prazo médio de pagamento (1 a 180 dias)
- Exige autorização prévia (sim/não)
- Nome e telefone do contato
- URL do portal da operadora (opcional)
- Status: ativo ou inativo

### 10.3 Detalhe do convênio

- Dados de contato e prazo.
- Indicadores (pacientes vinculados, valores da tabela).
- **Tabela de preços** por procedimento (comparável ao valor particular).
- Lista de **pacientes vinculados** àquele convênio.

---

## 11. Estoque

Produtos e insumos da unidade (odontologia, estética, enfermagem etc.).

**Cards**

- Total de itens ativos
- Valor em estoque (quantidade × custo unitário)
- Itens abaixo do mínimo
- Saídas no período

Alerta visual quando há produto abaixo do mínimo (o sino também avisa quem tem permissão de estoque).

Abas: **Produtos e insumos**, **Movimentações**, **Consumo**.

### 11.1 Produtos

Cadastro:

- Nome
- Categoria: Material odontológico, Material de enfermagem, Medicamento, Estética, Descartáveis, Escritório
- Unidade de medida: unidade, caixa, frasco, litro, galão, seringa, rolo, ampola, pacote
- Quantidade atual
- Estoque mínimo (para o alerta)
- Custo unitário
- Fornecedor
- Ativo / inativo — inativo some das **novas** movimentações

Busca por produto, categoria ou fornecedor. **Exportar** → `estoque-produtos.csv`.

### 11.2 Movimentações

Entrada ou saída.

- Produto, tipo (entrada/saída), quantidade, data, motivo.
- Saída pode ser ligada a um **procedimento**.
- O saldo **não pode ficar negativo**.
- Busca por produto, motivo ou responsável. **Exportar** → `estoque-movimentacoes.csv`.

### 11.3 Consumo

Agrupa as saídas: produto, quantidade total e número de ocorrências. **Exportar** → `estoque-consumo.csv`.

---

## 12. Relatórios

Visão gerencial com **período**, **tabela**, **gráfico** e **Exportar** (CSV) em cada bloco. Os números vêm do banco (agenda, cobranças e comissões).

**Períodos**

- Este mês
- Mês anterior
- Últimos 30 dias
- Últimos 12 meses
- Ano corrente

**Abas / tipos**

1. **Faturamento** — total, quantidade de atendimentos, ticket médio; por profissional; por convênio (gráfico); por procedimento. Arquivos: `relatorio-faturamento.csv`, `relatorio-faturamento-convenio.csv`, `relatorio-faturamento-procedimento.csv`.
2. **Atendimentos** — realizados, cancelados e faltas; evolução no período. Arquivo: `relatorio-atendimentos.csv`.
3. **Inadimplência** — pacientes com cobranças vencidas em aberto. Arquivo: `relatorio-inadimplencia.csv`.
4. **Novos × recorrentes** — cadastros novos versus quem já frequentava. Arquivo: `relatorio-pacientes.csv`.
5. **Produtividade** — por profissional: realizados, faltas, ocupação, faturamento. Arquivo: `relatorio-produtividade.csv`.
6. **Comissões** — extrato do período com status. Arquivo: `relatorio-comissoes.csv`.

Recepção e Profissional de saúde **não** veem este módulo no padrão de fábrica.

---

## 13. Configurações

Em geral só o **Administrador**. Procedimentos e formas de pagamento exigem permissão de Configurações.

### 13.1 Dados da clínica

**Identificação**

- Nome fantasia, razão social, CNPJ, telefone, e-mail
- Endereço com CEP (preenchimento automático), logradouro, número, complemento, bairro, cidade, UF
- Logo: JPG, PNG ou WebP, até **2 MB** (enviar ou remover)

O nome fantasia aparece no menu lateral.

**Unidades**

- Cadastro: nome e cidade.
- Ações: editar, inativar, reativar.
- A clínica precisa ficar com **pelo menos uma unidade ativa**.
- Unidade nova é liberada automaticamente para o administrador que cadastrou e para os demais administradores ativos.
- O seletor da barra superior usa esta lista.

### 13.2 Usuários *(somente Administrador)*

- Busca por nome ou e-mail.
- Filtro de status (ativo/inativo).
- **Exportar** → `usuarios.csv`.
- Colunas: nome, e-mail, perfil, último acesso, status.

**Novo usuário**

- Nome, e-mail (único no sistema; é o login), senha (mínimo 8 caracteres), perfil, ao menos uma unidade.

**Ações**

- Ativar / inativar (não vale para a própria conta nem para o último administrador).
- O limite do plano impede criar se todas as vagas ativas estiverem ocupadas.

### 13.3 Perfis e permissões *(somente Administrador)*

- Escolher o perfil na lista.
- Tabela: módulos × Visualizar / Criar / Editar / Excluir.
- Salvar grava para **todos** os usuários daquele perfil.
- Perfil **Administrador** bloqueado para edição (sempre acesso total).
- Se **Visualizar** estiver desligado, o módulo some do menu daquele perfil.

### 13.4 Procedimentos

Catálogo de serviços da clínica (consultas, exames, terapias etc.). A agenda usa a **duração padrão** para calcular o fim do horário e o **valor** (particular ou tabela do convênio).

Cadastro:

- Nome
- Categoria: Consulta, Exame, Procedimento cirúrgico, Odontologia, Estética, Terapia
- Duração padrão: 10 a 240 minutos
- Valor particular
- Status: ativo / inativo (inativar pelo menu da linha)

Busca, filtros de status e categoria. **Exportar** → `procedimentos.csv`.

Os preços por convênio são ajustados na **tabela do convênio**, não nesta tela.

### 13.5 Formas de pagamento

Canais usados no caixa e no faturamento particular. Clínicas novas já nascem com o conjunto padrão. Dá para ativar/desativar e informar a **taxa** (percentual informativo para o líquido).

| Canal | Taxa padrão (informativa) |
|---|---|
| Dinheiro | 0% |
| PIX | 0% |
| Cartão de débito | 1,49% |
| Cartão de crédito | 3,29% |
| Boleto bancário | 2,5% |
| Faturamento por convênio | 0% |

Botão **Salvar**.

O módulo **Integrações e lembretes** (plano Ilimitado) configura WhatsApp oficial da Meta, e-mail SMTP, regras de lembrete, custos de disparo e o histórico. Gateway de pagamento e calendário externo continuam fora do produto.

### 13.7 Integrações e lembretes (plano Ilimitado)

Menu **Integrações e lembretes**:

- **Dashboard:** totais de envios, custos, taxas de sucesso/falha e agendamentos impactados, com filtro de período, canal, status e tipo.
- **Configurações:** WhatsApp (token, Phone Number ID, WABA, webhook), e-mail SMTP, **conta de cobrança** (clínica ou repasse da plataforma) e ativar/desativar lembretes. A tabela de custos de disparo aparece só para consulta.
- **Lembretes:** regras (por exemplo 24 h antes, 2 h antes, confirmação, cancelamento) e templates. Sempre ligados a um agendamento da agenda.
- **Histórico de envios:** auditoria (paciente, profissional, canal, status, custo estimado ou a faturar, erro).

A Meta cobra a WABA que envia a mensagem; o SMTP cobra o dono da conta. O modo recomendado é **conta da clínica**: o cliente cadastra o pagamento no Gerenciador de Negócios da Meta (não neste painel) e vocês não antecipam o custo. O modo **repasse da plataforma** é o fallback: vocês pagam e faturam depois pela tabela do contrato.

---

## 14. Notificações (sino)

Ícone de sino na barra superior. Atualiza sozinho a cada minuto.

- Ponto vermelho e contador de não lidas.
- Clique numa notificação marca como lida e, se houver destino, abre a tela (estoque, contas a pagar, pacientes etc.).
- **Marcar lidas** marca todas.

**Alertas gerados pelo sistema** (conforme a permissão da pessoa):

| Tipo | Quando aparece | Para quem | Destino |
|---|---|---|---|
| Estoque baixo | Produto ativo abaixo do mínimo | Quem vê Estoque | Estoque |
| Despesas vencidas | Conta a pagar não paga com vencimento passado | Quem vê Financeiro | Contas a pagar |
| Carteirinhas | Paciente ativo com validade da carteirinha nos próximos 6 meses (ou já vencida) | Quem vê Pacientes | Pacientes |

Severidade: alta, média ou baixa (cor no item).

---

## 15. Recurso comum: cores de status

Usadas em badges nas telas:

- Verde: confirmado, pago, ativo, atendido, alta.
- Amarelo: pendente, check-in, a pagar, prevista.
- Vermelho: cancelado, faltou, atrasado, vencido, glosado, alergia.
- Azul: agendado, em atendimento, em acompanhamento, enviado.
- Cinza: inativo, arquivado, abandonado.

---

## 16. Glossário de status

**Paciente:** Ativo · Inativo · Arquivado

**Agendamento:** Agendado · Confirmado · Check-in · Em atendimento · Atendido · Cancelado · Faltou

**Cobrança:** Pendente · Pago · Atrasado · Parcelado · Cancelado

**Parcela:** Pendente · Paga · Atrasada

**Despesa:** A pagar · Pago · Vencido

**Lote de convênio:** Aberto · Enviado · Pago · Glosado · Pago parcial

**Comissão:** Prevista · Aprovada · Paga

**Acompanhamento clínico:** Em acompanhamento · Alta · Abandonado

**Registro clínico:** Avaliação inicial · Evolução · Retorno · Alta

---

## 17. Cadastros do sistema (mapa rápido)

Use esta tabela no PDF como índice visual dos cadastros.

| Cadastro | Onde | Campos principais | Quem cria/edita no padrão |
|---|---|---|---|
| Clínica | Configurações › Dados da clínica | Fantasia, razão, CNPJ, contato, endereço, logo | Administrador |
| Unidade | Mesma tela | Nome, cidade, ativo | Administrador |
| Usuário | Configurações › Usuários | Nome, e-mail, senha, perfil, unidades, status | Administrador |
| Perfil de acesso | Configurações › Perfis e permissões | Nome + matriz de permissões | Administrador (exceto o perfil Admin) |
| Procedimento | Configurações › Procedimentos | Nome, categoria, duração, valor particular, status | Administrador |
| Forma de pagamento | Configurações › Formas de pagamento | Canal, taxa, ativo | Administrador |
| Paciente | Pacientes | Pessoais, contato, convênio, responsável, clínico, LGPD | Admin, Gestor, Recepção (editar); Prof. saúde só edita |
| Profissional | Profissionais | Pessoais, conselho, vínculo, grade, procedimentos, login | Admin, Gestor |
| Convênio | Convênios | ANS, prazo, contato, autorização, tabela de preços | Admin, Gestor, Financeiro |
| Agendamento | Agenda | Paciente, profissional, procedimento, data/hora, sala, valor, status | Quem tem criar/editar em Agenda |
| Bloqueio de agenda | Agenda | Profissional, data, horário, motivo | Quem opera a agenda |
| Lista de espera | Agenda | Paciente, período, profissional, procedimento | Quem opera a agenda |
| Evolução / prontuário | Ficha do paciente › Acompanhamento | Tipo, quadro, evolução, conduta, dor, retorno | Admin, Gestor, Prof. saúde |
| Documento do paciente | Ficha › Documentos | Tipo + arquivo PDF/JPG/PNG | Quem registra prontuário |
| Cobrança | Financeiro › Receber (e ficha do paciente) | Paciente, valor, vencimento, parcelas, status | Quem cria no Financeiro; atendimento **Atendido** gera sozinho |
| Despesa | Financeiro › Pagar | Descrição, categoria, fornecedor, valor, recorrência | Quem cria no Financeiro |
| Lote de convênio | Financeiro › Faturamento de convênios | Convênio, competência, guias, glosa, recebido | Quem opera Financeiro |
| Comissão | Financeiro › Comissões | Profissional, competência, %, valor, status | Cálculo/aprovação/pagamento no Financeiro |
| Produto | Estoque | Nome, categoria, unidade, saldo, mínimo, custo, fornecedor | Quem cria/edita Estoque |
| Movimentação de estoque | Estoque | Entrada/saída, quantidade, motivo, procedimento opcional | Quem cria em Estoque |

---

## 18. O que o sistema **não** faz ainda (não coloque como recurso no PDF)

Para a IA do PDF: **não descreva** estes itens como disponíveis.

- Portal do paciente (app externo).
- Cadastro rápido de paciente de dentro da agenda.
- Busca global na barra superior (além da busca de cada tabela).
- Gateway de pagamento e calendário externo.
- Exportação nativa em PDF das telas (a exportação das listas é CSV para Excel).

---

## 19. Sugestão de estrutura do PDF

1. Capa  
2. Sumário  
3. Bem-vindo e como entrar  
4. O painel (menu, unidades, notificações, tabelas e Exportar)  
5. Perfis de acesso (tabelas)  
6. Dashboard  
7. Pacientes (lista, cadastro, ficha, prontuário, documentos, financeiro)  
8. Agenda  
9. Profissionais  
10. Financeiro  
11. Convênios  
12. Estoque  
13. Relatórios  
14. Configurações  
15. Glossário de status  
16. Mapa de cadastros  

Cada capítulo de módulo deve ter: para que serve, quem acessa, o que há na tela (filtros, botões, exportar) e os campos do cadastro.
