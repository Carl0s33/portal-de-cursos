# Teste Selenium da submissão de projeto

O teste percorre a submissão como aluno no navegador: identifica o erro de e-mail obrigatório,
preenche um Projeto Integrador, escolhe orientador, anexa dois PDFs fictícios, autoriza publicação,
verifica a confirmação e confere os dados enviados no cadastro. Em falha, salva um screenshot em
`target/screenshots`. As chamadas HTTP de cursos, professores, disciplinas, cadastro de projeto,
upload e notificações recebem respostas simuladas no navegador; nenhum dado é gravado em serviços.

## Pré-requisitos

- Java 21 ou superior
- Node.js compatível com o projeto
- Google Chrome instalado

O Maven Wrapper incluído baixa e usa o Maven necessário automaticamente; não é preciso instalar
o comando global `mvn`.

## Executar

No terminal, na raiz do frontend:

```powershell
npm run dev -- --host 0.0.0.0
```

Abra outro PowerShell na raiz do frontend e execute:

```powershell
cd tests/selenium
$env:PORTAL_URL = 'http://localhost:5173'
.\mvnw.cmd test
```

Se o prompt já estiver em `tests/selenium`, pule o comando `cd tests/selenium` e execute apenas:

```powershell
$env:PORTAL_URL = 'http://localhost:5173'
.\mvnw.cmd test
```

No macOS ou Linux, use `./mvnw test`. O Selenium Manager baixa/resolve o ChromeDriver local
quando necessário.

O usuário, curso, orientador, projeto e conteúdo dos PDFs do teste são fictícios. A sessão é
injetada apenas no `sessionStorage` do navegador de teste. O teste não depende de senha real nem
de backend ativo.
