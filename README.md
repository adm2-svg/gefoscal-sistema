# Sistema Gefoscal — front-end

Aplicação web do sistema interno do Grupo Gefoscal. Página estática que fala
direto com o Supabase pela API REST. Sem build, sem dependência instalada,
sem servidor próprio.

Funciona também como app instalável (PWA): dá pra colocar na tela inicial do
celular e abrir em tela cheia.

## Arquivos

| arquivo | o que é |
|---|---|
| `index.html` | a aplicação inteira — telas, consultas e a maior parte dos estilos |
| `config.js` | endereço e chave do Supabase, e a skin padrão |
| `skins_gefoscal.css` | os temas visuais |
| `manifest.json` | dados do app instalável (nome, ícones, cores) |
| `service-worker.js` | o que torna o app instalável e guarda o esqueleto da página em cache |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon-32.png` | ícones |
| `som-*.mp3` | sons de notificação — um por skin, mais o padrão |
| `apps-script-enviar-emails.gs` | script que roda no Google Workspace, não neste site (instruções dentro do arquivo) |

## Rodar na sua máquina

O app usa módulos JavaScript, e o navegador bloqueia `import` quando a página é
aberta direto do disco. Abrir o `index.html` com duplo clique **não funciona** —
precisa de um servidor, mesmo local:

```bash
cd caminho/para/esta/pasta
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Para parar, `Ctrl+C`.

## Publicar no GitHub Pages

1. Crie um repositório em github.com (pode ser privado; o Pages exige plano pago
   para repositório privado, então para começar use público — a chave que está
   no `config.js` é publicável e pode ficar exposta).
2. Envie estes arquivos para a raiz do repositório.
3. No repositório: **Settings → Pages**.
4. Em *Source*, escolha **Deploy from a branch**; branch `main`, pasta `/ (root)`.
5. Salve e aguarde cerca de um minuto. O endereço aparece no topo da mesma tela,
   no formato `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Toda vez que você atualizar um arquivo no repositório, o site republica sozinho.

> Se algum arquivo não aparecer no ar, crie um arquivo vazio chamado `.nojekyll`
> na raiz. Ele impede o GitHub Pages de processar a pasta como um site Jekyll.

## Depois de publicar

No painel do Supabase, em **Authentication → URL Configuration**, acrescente o
endereço do site em *Site URL* e em *Redirect URLs*. Para login com senha ainda
não é obrigatório, mas passa a ser assim que houver recuperação de senha ou
login com Google.

## Segurança

A chave em `config.js` é a **publicável**. Ela identifica o projeto, não
autoriza nada: quem decide o que cada pessoa enxerga são as policies de RLS no
banco, avaliadas depois do login.

A `service_role key` **nunca** pode entrar neste repositório. Ela ignora o RLS e
daria acesso a DP, aprovação de crédito e financeiro para qualquer pessoa que
abrisse o código-fonte da página.

## Telas

O menu lateral é montado a partir da tabela `modulo` do banco e vem agrupado.
Módulo que a pessoa não tem permissão de ver simplesmente não aparece; grupo que
ficou vazio some junto.

**Sempre visíveis** (independem de permissão de módulo)

- **Visão geral** — painel de entrada, com o painel do gestor para quem gerencia setor
- **Solicitações** — solicitações internas, coordenação, cotação e aprovação
- **Compras** — solicitações de compra e seu fluxo
- **RH** — desempenho, trilhas de treinamento e certificação
- **Projetos** — projetos, tarefas e membros

**Comercial** — CRM (CRM Comercial, SDR WhatsApp, CRM Técnico), Cadastro,
Faturamento, Crédito e Cobrança, Marketing

**Operações** — Estoque e Produção, Combustível, Manutenção Industrial,
Frota Corporativa, Frota, Laboratório, e o agrupador Manutenção no menu

**Gestão** — Financeiro, DP e Segurança, Viagens (Onfly), Jurídico, Ferramentas,
Banco de Informações, Gestão de TI, Treinamento IA, Painel Executivo

**Relatórios** — uma tela por área (Solicitações, Compras, Projetos, RH, CRM
Comercial, SDR WhatsApp, CRM Técnico, Faturamento, Cadastro de Funcionários,
Financeiro, Estoque, Combustível, Manutenção, Frota, Jurídico, Onfly, DP,
Laboratório, Marketing, Gestão de TI); cada uma só aparece para quem já vê o
módulo correspondente

**Administração Sistema** — Configuração Geral (módulos, permissões, usuários)

### Acrescentar uma tela

Crie a função de render e registre no objeto `PAGINAS`, dentro do `index.html`.
Para ela aparecer no menu, cadastre o módulo na tabela `modulo` do banco com a
mesma chave, e opcionalmente encaixe a chave em `GRUPOS_MENU` — chave que não
estiver mapeada cai no grupo "Outros", para nunca sumir.

## Campos de seleção com busca

Todo `<select>` da aplicação vira automaticamente um campo com busca — não
precisa fazer nada ao criar uma tela nova. O componente fica no `index.html`,
logo depois dos utilitários, e o estilo no `skins_gefoscal.css`.

O `<select>` original continua no DOM, escondido, com o mesmo `id` e `name`:
quem lê `.value` ou escuta `onchange` não percebe diferença.

A busca acha o termo em **qualquer posição** do texto, ignora acento e
maiúscula, e aceita **vários termos em qualquer ordem** — cada palavra digitada
precisa aparecer em algum lugar. "ltda gama" acha "Agro Gama Ltda".

Dois atributos opcionais na `<option>` ampliam isso:

| atributo | efeito |
|---|---|
| `data-busca` | texto que entra na busca **sem aparecer** na tela — CNPJ, telefone, apelido, código |
| `data-info` | texto que **aparece** como segunda linha na lista, para separar cadastros de nome parecido |

Os campos de fornecedor de Compras e de Manutenção já usam os dois, via a função
`opcaoFornecedor()`: dá para achar pelo CNPJ ou pelo nome do contato, e os dois
aparecem embaixo do nome na lista. Onde o cache só traz o nome (Frota,
Combustível), basta acrescentar os campos na consulta e usar a mesma função.

Para um campo específico continuar sendo o `select` nativo: `<select data-sem-busca>`.

Para listas curtas (status, turno, sim/não) voltarem ao seletor nativo — mais
confortável no celular — suba a constante `MIN_OPCOES_BUSCA` de `0` para `8`.

## Skins

Cinco temas, trocados pelo ícone no topo e guardados por pessoa:
`sofisticado`, `plataforma`, `plataforma-claro`, `grey` e `daylight`.
O padrão sai do `SKIN_PADRAO`, no `config.js`.

Três deles têm som de notificação próprio (`som-sofisticado`, `som-plataforma`,
`som-daylight`); os demais usam `som-padrao.mp3`.

Todo estilo novo deve usar as variáveis de tema (`var(--panel)`, `var(--txt)`,
`var(--rust)` e companhia) em vez de cor fixa — é isso que faz a tela funcionar
nas cinco skins sem retrabalho.

## Acesso

Quem faz login sem papel definido não enxerga nada — não é erro da aplicação, é
o RLS funcionando. Cadastre a pessoa em `usuario_precadastro` antes do primeiro
login, ou crie o perfil e o papel pelo painel.

A visibilidade de cada módulo é decidida por `podeVer()` e `podeEditar()`, que
espelham no navegador as mesmas regras do RLS. Valem quatro caminhos:

1. papel total — `ADMIN` ou `DIRETORIA` enxergam tudo;
2. permissão de módulo — o checkbox marcado em Configuração Geral;
3. papel específico — `cobranca`, `crm` e `sdr_whatsapp` também abrem por papel
   (`COMERCIAL`, `COBRANCA`);
4. gestor do setor Comercial — abre o CRM.

O navegador só esconde a tela. Quem realmente barra o dado é o RLS no banco.

## Serviços de apoio

Além das tabelas, o front chama Edge Functions do Supabase para o que não pode
rodar no navegador — criação e exclusão de usuário, envio de e-mail de pedido,
extração de dados de nota e de cotação por IA, os agentes de IA, sincronização
com Onfly e Google Contatos, consulta de débitos de veículo e os painéis de
mercado e notícias do agro.

O `apps-script-enviar-emails.gs` roda no Google Workspace, dentro da conta dona
da caixa de e-mail, e envia as mensagens para uma Edge Function. Ele não faz
parte do site — está aqui só para ficar versionado junto.
