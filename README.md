# Loja Virtual — Integração Expo Router + Supabase

Aplicação de loja virtual desenvolvida com **React Native, Expo Router, TypeScript e Supabase**, utilizando serviços de computação em nuvem para gerenciar autenticação, clientes, produtos, estoque e pedidos.

O projeto foi desenvolvido como parte da atividade de **Computação em Nuvem — Grupo 4: Loja Virtual**, envolvendo conceitos de IaaS e PaaS.

Este repositório contém a implementação do aplicativo e sua integração com o backend hospedado no Supabase.

## Funcionalidades

- Catálogo público de produtos com imagem, nome, descrição, preço e disponibilidade.
- Controle de estoque integrado ao banco de dados.
- Carrinho de compras com adição, remoção e alteração de quantidades.
- Cálculo automático de subtotais e valor total.
- Cadastro e login de clientes utilizando Supabase Auth.
- Gerenciamento de perfil com nome, e-mail e telefone.
- Persistência da sessão de autenticação no dispositivo.
- Finalização de pedidos vinculados ao cliente autenticado.
- Registro de itens, quantidades e preços no banco.
- Atualização do estoque durante a finalização.
- Numeração sequencial de pedidos, como `#000001`, `#000002` e `#000003`.
- Histórico e acompanhamento de pedidos.
- Administração de produtos, preços, estoque, imagens e disponibilidade.
- Gerenciamento dos status dos pedidos.
- Cancelamento de pedidos elegíveis com reposição do estoque.
- Controle de acesso administrativo.
- Políticas Row Level Security (RLS) para proteção dos dados.

## 1. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React Native | Desenvolvimento da interface mobile |
| Expo | Ambiente de desenvolvimento e execução |
| Expo Router | Navegação baseada em arquivos |
| TypeScript | Tipagem e organização do código |
| React Context API | Gerenciamento de autenticação e carrinho |
| Supabase | Plataforma de backend em nuvem |
| PostgreSQL | Banco de dados relacional |
| Supabase Auth | Cadastro, login e sessões |
| Supabase RPC | Execução de funções PostgreSQL |
| AsyncStorage | Persistência local da sessão |
| React Navigation | Recursos de navegação utilizados pelo Expo Router |
| React Native URL Polyfill | Compatibilidade com APIs de URL |

### Arquitetura

O frontend utiliza React Native e Expo Router, enquanto o backend utiliza serviços gerenciados do Supabase.

A comunicação acontece diretamente com os serviços disponibilizados pelo Supabase, utilizando a chave pública do projeto e a autenticação dos usuários.

A arquitetura também considera a utilização de armazenamento de objetos em nuvem para imagens de produtos.

## 2. Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js e npm instalados.
- Git instalado.
- Visual Studio Code ou editor equivalente.
- Expo Go no dispositivo Android ou um ambiente de desenvolvimento Android compatível.
- Acesso ao repositório do projeto.
- Acesso ao projeto Supabase, conforme as permissões concedidas pela equipe.
- Arquivo `.env` disponibilizado pelos desenvolvedores.

## 3. Instalação do projeto

Clone o repositório e acesse a pasta do projeto.

Instale as dependências declaradas no `package.json`:

```bash
npm install
```

Caso seja necessário instalar ou corrigir manualmente as dependências utilizadas na integração, execute:

```bash
npx expo install expo-router
```

```bash
npx expo install @react-navigation/native
```

```bash
npx expo install @react-native-async-storage/async-storage
```

```bash
npx expo install react-native-url-polyfill
```

```bash
npm install @supabase/supabase-js
```

As dependências são utilizadas da seguinte forma:

- **expo-router:** gerenciamento de rotas, telas e navegação.
- **@react-navigation/native:** recursos de navegação utilizados pelo Expo Router e seus componentes.
- **@react-native-async-storage/async-storage:** persistência local de informações de autenticação.
- **react-native-url-polyfill:** compatibilidade das APIs de URL com React Native.
- **@supabase/supabase-js:** comunicação com o banco, autenticação e funções do Supabase.

Como o projeto utiliza Expo, recomenda-se instalar dependências nativas por meio de `npx expo install`, que procura selecionar versões compatíveis com o SDK utilizado.

Para verificar possíveis incompatibilidades:

```bash
npx expo install --check
```

Para corrigir versões incompatíveis identificadas pelo Expo:

```bash
npx expo install --fix
```

Também é possível realizar uma verificação geral utilizando:

```bash
npx expo-doctor
```

**Observação:** o `package.json` e o arquivo de lock do repositório devem ser considerados a referência das versões efetivamente utilizadas no projeto. Os comandos individuais acima são destinados à instalação ou correção das dependências quando necessário.

## 4. Configuração das variáveis de ambiente

O aplicativo utiliza variáveis de ambiente para estabelecer a comunicação com o Supabase.

### Localização do arquivo `.env`

**O arquivo `.env` oficial do projeto está armazenado em uma pasta privada no Google Drive da equipe de desenvolvimento.**

Por motivos de segurança, esse arquivo não está disponível diretamente neste README e não deve ser publicado em repositórios públicos.

Para obter o arquivo, **solicite acesso à pasta do Google Drive aos desenvolvedores responsáveis pelo projeto**.

Após receber acesso:

1. Abra a pasta compartilhada no Google Drive.
2. Localize o arquivo `.env` disponibilizado pela equipe.
3. Faça o download do arquivo.
4. Coloque o arquivo na raiz do projeto Expo, no mesmo nível do `package.json`.
5. Verifique se o nome do arquivo permanece exatamente `.env`.

A estrutura esperada é:

```text
loja-virtual/
├── app/
├── AuthContext.tsx
├── CartContext.tsx
├── supabase.ts
├── tipos.ts
├── avisos.ts
├── package.json
├── .env
└── ...
```

### Estrutura das variáveis

O arquivo `.env` deve conter as variáveis públicas utilizadas pelo cliente Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

**Regras de segurança:**

- Não publicar o `.env` no GitHub.
- Não compartilhar as credenciais em mensagens públicas.
- Não adicionar a chave `service_role` ou outras chaves secretas ao frontend.
- Utilizar exclusivamente a chave pública apropriada para o aplicativo.
- Manter as políticas RLS ativadas e corretamente configuradas.

As variáveis com prefixo `EXPO_PUBLIC_` são incorporadas ao aplicativo e não devem conter segredos de servidor.

Recomenda-se adicionar ao `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

## 5. Executando o aplicativo

Após instalar as dependências e configurar o `.env`, execute:

```bash
npx expo start
```

Caso o projeto apresente problemas de cache ou após alterações nas dependências, execute:

```bash
npx expo start -c
```

No Android, abra o aplicativo utilizando o Expo Go, quando compatível com as dependências instaladas, ou uma development build.

Se alguma dependência nativa exigir reconstrução do aplicativo, utilize um ambiente Android configurado e execute:

```bash
npx expo run:android
```

## 6. Banco de dados Supabase

O backend utiliza PostgreSQL hospedado no Supabase.

### Tabelas principais

**clientes**

Armazena as informações dos clientes cadastrados.

Campos principais:

- `id`
- `usuario_id`
- `nome`
- `email`
- `telefone`

**produtos**

Armazena os produtos disponíveis no catálogo.

Campos principais:

- `id`
- `nome`
- `descricao`
- `preco`
- `quantidade_estoque`
- `imagem_url`
- `ativo`

O campo oficial utilizado para o controle de estoque é `quantidade_estoque`.

**pedidos**

Armazena os pedidos realizados pelos clientes.

Campos principais:

- `id`
- `numero_pedido`
- `cliente_id`
- `status`
- `total`
- `created_at`

O campo `id` é utilizado internamente como UUID, enquanto `numero_pedido` representa a identificação sequencial exibida ao usuário.

**itens_pedido**

Armazena os produtos associados a cada pedido.

Campos principais:

- `id`
- `pedido_id`
- `produto_id`
- `quantidade`
- `preco_unitario`
- `nome_produto`

**administradores**

Armazena os identificadores dos usuários que possuem acesso às funcionalidades administrativas.

Campo principal:

- `usuario_id`

## 7. Autenticação dos usuários

O projeto utiliza o Supabase Auth para autenticação por e-mail e senha.

O cadastro solicita:

- Nome completo.
- E-mail.
- Senha com pelo menos oito caracteres.

### Persistência da autenticação

O aplicativo utiliza `AsyncStorage` para armazenar a sessão localmente.

O Supabase Auth gerencia os tokens de autenticação e a renovação da sessão, permitindo que o usuário continue autenticado entre aberturas do aplicativo.

### Cadastro de clientes

Após a criação da identidade no Supabase Auth, o banco mantém o registro do cliente na tabela `clientes`.

A função `garantir_cliente` é utilizada para assegurar a existência do perfil associado ao usuário autenticado.

## 8. Catálogo e controle de estoque

O catálogo consulta a tabela `produtos` do Supabase.

Cada produto apresenta:

- Imagem.
- Nome.
- Descrição.
- Preço.
- Quantidade disponível.
- Botão para adicionar ao carrinho.

### Campo de estoque

O campo oficial do banco é:

```sql
quantidade_estoque
```

No frontend, a consulta pode utilizar um alias:

```typescript
.select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
```

Assim, a propriedade `estoque` continua disponível nos componentes React Native, enquanto a informação é obtida da coluna correta no banco.

Produtos sem unidades disponíveis são identificados como esgotados, impedindo sua adição ao carrinho.

A disponibilidade final também é validada pelo backend durante o checkout.

## 9. Carrinho de compras

O carrinho utiliza a Context API do React para compartilhar informações entre as telas.

Funcionalidades:

- Adicionar produtos.
- Aumentar quantidades.
- Diminuir quantidades.
- Remover produtos.
- Consultar subtotais.
- Consultar valor total.
- Finalizar pedidos.

O carrinho respeita a quantidade em estoque conhecida pelo frontend.

Entretanto, a verificação definitiva da disponibilidade acontece no banco, evitando que compras simultâneas ultrapassem o estoque real.

## 10. Finalização de pedidos

O usuário precisa estar autenticado para finalizar uma compra.

A função PostgreSQL `finalizar_pedido`, disponibilizada pelo Supabase RPC, é responsável por processar a operação.

O processo envolve:

1. Identificar o cliente autenticado.
2. Receber os produtos e suas quantidades.
3. Consultar os preços reais no banco.
4. Validar a disponibilidade.
5. Calcular o valor total.
6. Registrar o pedido.
7. Registrar os itens associados.
8. Atualizar o estoque.
9. Retornar a identificação do pedido.

O processamento deve ocorrer dentro de uma transação atômica, mantendo a consistência das informações em caso de falha.

### Numeração dos pedidos

O banco mantém duas identificações:

- `id`: UUID utilizado internamente nos relacionamentos e nas operações.
- `numero_pedido`: número sequencial apresentado ao usuário.

Exemplo de apresentação:

```text
Pedido #000001
Pedido #000002
Pedido #000003
```

O número é formatado no frontend com:

```typescript
String(pedido.numero_pedido).padStart(6, '0')
```

Ao finalizar uma compra, a função `finalizar_pedido` retorna o UUID. O aplicativo consulta a coluna `numero_pedido` correspondente e apresenta esse número na mensagem de sucesso.

O UUID continua sendo utilizado nas operações internas, inclusive nas alterações de status.

## 11. Histórico e acompanhamento dos pedidos

Na tela **Meus Pedidos**, o cliente pode consultar suas compras.

São apresentadas informações como:

- Número sequencial do pedido.
- Data da compra.
- Situação atual.
- Valor total.
- Produtos comprados.
- Quantidade de cada produto.
- Preço unitário.

Os pedidos podem apresentar os seguintes status:

| Status | Significado |
|---|---|
| `pendente` | Pedido registrado, aguardando confirmação |
| `confirmado` | Pedido confirmado pela loja |
| `enviado` | Pedido enviado |
| `entregue` | Pedido entregue |
| `cancelado` | Pedido cancelado |

A tela também permite atualizar os dados para consultar eventuais alterações realizadas pela administração.

## 12. Área administrativa

O projeto possui uma área administrativa acessível apenas a usuários autorizados.

O acesso é validado por meio da função PostgreSQL:

```sql
usuario_e_admin()
```

Essa função verifica as permissões do usuário autenticado.

### Funcionalidades administrativas

**Gerenciamento de produtos**

- Cadastrar produtos.
- Editar nome e descrição.
- Alterar preços.
- Atualizar quantidades em estoque.
- Informar URLs de imagens.

**Gerenciamento de pedidos**

- Consultar pedidos registrados.
- Identificar o cliente responsável.
- Consultar datas e valores.
- Visualizar números sequenciais.
- Alterar o status dos pedidos.
- Cancelar pedidos elegíveis.

A função `alterar_status_pedido` realiza as operações de mudança de status no backend.

Quando um pedido elegível é cancelado, o estoque deve ser reposto automaticamente.

### Cadastro de administrador

A conta deve ser criada inicialmente pelo processo normal de cadastro.

Depois, um responsável autorizado pode executar o seguinte SQL no Supabase:

```sql
INSERT INTO public.administradores (usuario_id)
SELECT id
FROM auth.users
WHERE email = 'EMAIL_DO_ADMINISTRADOR'
ON CONFLICT (usuario_id) DO NOTHING;
```

Substitua `EMAIL_DO_ADMINISTRADOR` pelo endereço cadastrado.

O usuário deve sair e entrar novamente no aplicativo para atualizar a interface, se necessário.

A opção **Gestão da loja** ficará disponível em **Minha Conta** para usuários reconhecidos como administradores.

Não existe cadastro público de administradores.

## 13. Segurança

O projeto utiliza recursos do Supabase para proteção dos dados.

Entre os mecanismos implementados estão:

- Autenticação com Supabase Auth.
- Gerenciamento de sessão.
- Persistência local de tokens.
- Row Level Security (RLS).
- Restrições de acesso aos pedidos de outros clientes.
- Validação das permissões administrativas no banco.
- Processamento das operações de estoque no PostgreSQL.
- Utilização de uma chave pública no frontend.
- Separação entre operações de clientes e administradores.

**A interface não é responsável por garantir as permissões de segurança.**

As operações críticas devem ser protegidas por políticas RLS e verificações executadas no backend.

## 14. Imagens e armazenamento em nuvem

O catálogo utiliza o campo `imagem_url` para apresentar as imagens dos produtos.

Atualmente, as imagens podem ser acessadas por meio de URLs HTTPS públicas cadastradas na tabela `produtos`.

## 15. Modelos de computação em nuvem

A proposta acadêmica considera os seguintes modelos.

### PaaS — Platform as a Service

O Supabase fornece infraestrutura gerenciada para:

- Banco PostgreSQL.
- Autenticação.
- APIs.
- Funções de banco de dados.
- Gerenciamento de dados.

Isso reduz a necessidade de manter servidores próprios.

## 16. Estrutura principal do projeto

```text
loja-virtual/
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── carrinho.tsx
│       ├── pedidos.tsx
│       ├── perfil.tsx
│       └── gestao.tsx
├── AuthContext.tsx
├── CartContext.tsx
├── supabase.ts
├── tipos.ts
├── avisos.ts
├── package.json
├── .env
└── README.md
```

### Responsabilidade dos arquivos

| Arquivo | Finalidade |
|---|---|
| `supabase.ts` | Configuração do cliente Supabase |
| `AuthContext.tsx` | Gerenciamento da autenticação |
| `CartContext.tsx` | Estado compartilhado do carrinho |
| `tipos.ts` | Tipos TypeScript e funções de formatação |
| `avisos.ts` | Exibição de mensagens e alertas |
| `app/_layout.tsx` | Providers globais |
| `app/(tabs)/_layout.tsx` | Configuração das abas |
| `app/(tabs)/index.tsx` | Catálogo e disponibilidade |
| `app/(tabs)/carrinho.tsx` | Carrinho e checkout |
| `app/(tabs)/pedidos.tsx` | Histórico e acompanhamento |
| `app/(tabs)/perfil.tsx` | Cadastro, login e perfil |
| `app/(tabs)/gestao.tsx` | Administração de produtos e pedidos |

---

**Projeto acadêmico — Loja Virtual | React Native + Expo Router + Supabase | Computação em Nuvem**
