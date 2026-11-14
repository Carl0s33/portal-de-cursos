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

Abra outro PowerShell e entre na pasta `tests/selenium` (se ainda estiver na raiz do frontend).
Informe o e-mail real e a senha de uma conta de aluno criada pelo seeder. A senha é lida sem ser
exibida e não deve ser gravada no repositório. Não pressione Enter deixando os campos vazios.

```powershell
if (-not (Test-Path .\mvnw.cmd)) { Set-Location .\tests\selenium }
$env:SELENIUM_EMAIL = Read-Host 'E-mail real do aluno do seeder'
$senhaSelenium = Read-Host 'Senha real do aluno do seeder' -AsSecureString
$env:SELENIUM_PASSWORD = [System.Net.NetworkCredential]::new('', $senhaSelenium).Password
if ([string]::IsNullOrWhiteSpace($env:SELENIUM_EMAIL) -or [string]::IsNullOrWhiteSpace($env:SELENIUM_PASSWORD)) {
  throw 'Informe o e-mail e a senha reais da conta do seeder antes de executar o teste.'
}
$env:PORTAL_URL = 'http://localhost:5173'
.\mvnw.cmd test
```

Antes de iniciar o navegador, o teste verifica se a página de login do Vite e a rota de cursos do
gateway respondem. Se algum serviço estiver parado, ele encerra com o endereço que precisa ser
verificado, sem aguardar vários minutos pelo carregamento do navegador.

O Maven Wrapper resolve o Maven. O Selenium Manager tenta resolver o navegador e o ChromeDriver.
Para evitar downloads e usar a instalação local do Brave com um driver já existente no cache, defina
os caminhos antes de rodar o Maven:

Para executar com Brave, configure também o caminho local do executável antes do Maven:

```powershell
$env:BROWSER_BINARY = "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
$driver = Get-ChildItem "$env:USERPROFILE\.cache\selenium\chromedriver\win64\*\chromedriver.exe" |
  Sort-Object { [version]$_.Directory.Name } -Descending |
  Select-Object -First 1
$env:CHROMEDRIVER_PATH = $driver.FullName
```

Em caso de falha, o navegador salva uma captura em `target/screenshots`.

