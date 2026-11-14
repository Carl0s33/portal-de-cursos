# Testes Selenium integrados

Os cenários usam o navegador para autenticar um aluno e submeter um Projeto Integrador pelos
serviços reais do Portal de Cursos. O teste não substitui `fetch`, não injeta sessão e não cria
respostas ou dados de API simulados.

O fluxo validado cobre login do aluno, consulta real de curso, professor e disciplina, validação do
título, cadastro da submissão e envio dos dois PDFs obrigatórios. O Selenium gera arquivos PDF
mínimos e fictícios em diretório temporário. A submissão é gravada no ambiente local e pode acionar
as notificações configuradas nos serviços; não execute estes testes contra produção.

## Pré-requisitos

- Java 21 ou superior
- Node.js compatível com o projeto
- Gateway e microsserviços locais ativos, incluindo os serviços de usuários e projetos
- Portal Vite iniciado em `http://localhost:5173`
- Chrome ou Brave instalado
- Conta de aluno criada pelo seeder do serviço de usuários

## Executar

Na raiz do frontend, inicie o portal:

```powershell
npm run dev -- --host 0.0.0.0
```

Em outro PowerShell, configure as credenciais do aluno criado pelo seeder sem salvá-las no
repositório e execute:

```powershell
$env:SELENIUM_EMAIL = 'e-mail do aluno de teste'
$env:SELENIUM_PASSWORD = 'senha definida no seeder'
$env:PORTAL_URL = 'http://localhost:5173'
cd tests/selenium
.\mvnw.cmd test
```

O teste falha com uma mensagem clara se as variáveis `SELENIUM_EMAIL` ou `SELENIUM_PASSWORD` não
estiverem definidas. O Maven Wrapper resolve o Maven e o Selenium Manager resolve o ChromeDriver.
Se o Selenium Manager não puder baixar o driver, defina `CHROMEDRIVER_PATH` com o caminho de um
ChromeDriver compatível já instalado.

Para executar com Brave, configure também o caminho local do executável antes do Maven:

```powershell
$env:BROWSER_BINARY = "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
$env:CHROMEDRIVER_PATH = 'C:\caminho\para\chromedriver.exe'
```

Em caso de falha, o navegador salva uma captura em `target/screenshots`.

