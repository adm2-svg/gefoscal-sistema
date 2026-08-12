# Sistema Gefoscal — front-end

Aplicação web do sistema interno da Gefoscal. Página estática que fala direto
com o Supabase pela API REST. Sem build, sem dependência instalada.

## Arquivos

| arquivo | o que é |
|---|---|
| `index.html` | a aplicação inteira (telas, consultas, estilos de layout) |
| `config.js` | endereço e chave do Supabase, e a skin padrão |
| `skins_gefoscal.css` | os três temas: sofisticado, plataforma, daylight |
| `.nojekyll` | evita que o GitHub Pages tente processar os arquivos |

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

- **Expedição** — carregamentos migrados, com filtro por cliente, vendedor e
  período, e link para os anexos no Drive.
- **Financeiro** — lançamentos, receitas, despesas, resultado e saldo em contas.
- **Estoque** — saldo por produto e por local.

O menu lateral é montado a partir da tabela `modulo` do banco. Módulo que ainda
não tem tela aparece apagado. Para acrescentar uma tela, crie a função de
render e registre no objeto `PAGINAS`, dentro do `index.html`.

## Acesso

Quem faz login sem papel definido não enxerga nada — não é erro da aplicação, é
o RLS funcionando. Cadastre a pessoa em `usuario_precadastro` antes do primeiro
login, ou crie o perfil e o papel pelo painel.
