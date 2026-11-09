package br.edu.ifrn.portal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.AfterTestExecutionCallback;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.v139.page.Page;

class SubmissaoProjetoSeleniumTest {
  private static final String APP_URL = env("PORTAL_URL", "http://localhost:5173");
  private WebDriver driver;
  private WebDriverWait wait;

  @RegisterExtension
  final AfterTestExecutionCallback screenshotOnFailure = context -> {
    if (driver == null || context.getExecutionException().isEmpty()) return;
    Path pasta = Path.of("target", "screenshots");
    Files.createDirectories(pasta);
    Path destino = pasta.resolve(context.getDisplayName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png");
    Files.copy(((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE).toPath(), destino,
        StandardCopyOption.REPLACE_EXISTING);
  };

  @BeforeEach
  void abrirPortalComSessaoFicticia() {
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    try {
      driver = new org.openqa.selenium.chrome.ChromeDriver(options);
    } catch (Exception falha) {
      throw new IllegalStateException("Não foi possível iniciar o Chrome. Instale Chrome e Maven.", falha);
    }
    wait = new WebDriverWait(driver, Duration.ofSeconds(12));

    driver.get(APP_URL);
    if (driver instanceof HasDevTools devToolsDriver) {
      var devTools = devToolsDriver.getDevTools();
      devTools.createSession();
      devTools.send(Page.enable(Optional.empty()));
      devTools.send(Page.addScriptToEvaluateOnNewDocument("""
        const sessao = {
          token: 'selenium-token-ficticio',
          tipoUsuario: 'ALUNO',
          usuario: {
            id: 900001,
            nome: 'Aluno Selenium de Teste',
            email: 'aluno.selenium@example.invalid',
            cursoId: 101
          },
          expiraEm: Date.now() + 60 * 60 * 1000
        };
        sessionStorage.setItem('portal-cursos-sessao', JSON.stringify(sessao));
        const originalFetch = window.fetch.bind(window);
        window.__seleniumApiCalls = [];
        window.fetch = async (input, init = {}) => {
          const url = String(input);
          const method = (init.method || 'GET').toUpperCase();
          window.__seleniumApiCalls.push({
            url,
            method,
            body: typeof init.body === 'string' ? JSON.parse(init.body) : null
          });
          const json = (data, status = 200) => new Response(JSON.stringify(data), {
            status, headers: { 'Content-Type': 'application/json' }
          });
          if (url.includes('/cursos')) return json([{ id: 101, nome: 'Curso Selenium', sigla: 'CS', acronimo: 'CS', campusId: 10 }]);
          if (url.includes('/professores/buscar')) return json([{ id: 201, cursoId: 101, usuario: { nome: 'Orientador Selenium', email: 'orientador.selenium@example.invalid' } }]);
          if (url.includes('/disciplinas')) return json([]);
          if (url.includes('/projetos') && method === 'POST') return json({ id: 301 });
          if (url.includes('/documentos') && method === 'POST') return json({ id: 401 });
          if (url.includes('/notificacoes') && method === 'POST') return json({ enviado: true });
          return originalFetch(input, init);
        };
        """, Optional.empty(), Optional.empty(), Optional.empty()));
    }
    driver.get(urlSubmissao());
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main.pagina-submissao h1")));
  }

  @AfterEach
  void fecharNavegador() {
    if (driver != null) driver.quit();
  }

  @Test
  void mostraErroQuandoIdentificacaoObrigatoriaEstaIncompleta() {
    driver.findElement(By.xpath("//button[contains(., 'Continuar para o projeto')]")).click();
    new Select(rotulo("Tipo de produção")).selectByVisibleText("Projeto Integrador");
    rotulo("Resumo").sendKeys("Resumo suficiente para validar a etapa.");
    rotulo("Objetivos e resultados").sendKeys("Objetivo válido para o teste.");
    rotulo("Requisitos, escopo e solução proposta").sendKeys("Escopo válido para o teste.");
    driver.findElement(By.xpath("//button[contains(., 'Continuar para a equipe')]")).click();

    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='alert']")));
    assertEquals("Informe título.", driver.findElement(By.id("erro-titulo")).getText());
    assertEquals("true", rotulo("Título").getAttribute("aria-invalid"));
  }

  @Test
  void alunoEnviaProjetoIntegradorComDocumentosPdfFicticios() throws IOException {
    driver.findElement(By.xpath("//button[contains(., 'Continuar para o projeto')]")).click();

    assertTrue(wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("dados-projeto"), "Projeto")));
    new Select(rotulo("Tipo de produção")).selectByVisibleText("Projeto Integrador");
    rotulo("Título").sendKeys("Projeto Selenium de demonstração");
    driver.findElement(By.id("campo-resumo")).sendKeys("Resumo de teste automatizado com dados fictícios.");
    driver.findElement(By.id("campo-objetivos")).sendKeys("Validar submissão no ambiente de testes.");
    driver.findElement(By.id("campo-informacoes-especificas")).sendKeys("Escopo demonstrativo, sem dados reais.");
    driver.findElement(By.xpath("//button[contains(., 'Continuar para a equipe')]")).click();

    new Select(rotulo("Professor orientador")).selectByVisibleText("Orientador Selenium");
    driver.findElement(By.xpath("//button[contains(., 'Continuar para os documentos')]")).click();

    anexarPdf("arquivo-requisitos", "requisitos-teste.pdf");
    anexarPdf("arquivo-relatorio", "relatorio-teste.pdf");
    driver.findElement(By.xpath("//label[contains(@class, 'consentimento-submissao')]//input[@type='checkbox']")).click();
    driver.findElement(By.xpath("//button[normalize-space()='Enviar projeto']")).click();

    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("titulo-confirmacao")))
        .getText().contains("Projeto enviado."));
    assertTrue(driver.findElement(By.cssSelector(".submissao-confirmacao__resumo strong"))
        .getText().contains("Projeto Selenium de demonstração"));
    @SuppressWarnings("unchecked")
    var envio = (java.util.Map<String, Object>) ((JavascriptExecutor) driver).executeScript("""
        return window.__seleniumApiCalls.find(chamada =>
          chamada.url.includes('/projetos') && chamada.method === 'POST'
        ).body;
        """);
    assertEquals("Projeto Selenium de demonstração", envio.get("nome"));
    assertEquals("PROJETO_INTEGRADOR", envio.get("tipoProjeto"));
    assertEquals("Resumo de teste automatizado com dados fictícios.", envio.get("resumo"));
    assertEquals(201, ((Number) ((java.util.Map<?, ?>) ((java.util.List<?>) envio.get("professores")).get(0))
        .get("professorId")).intValue());
    assertEquals(2, ((Number) ((JavascriptExecutor) driver).executeScript("""
        return window.__seleniumApiCalls.filter(chamada =>
          chamada.url.includes('/documentos') && chamada.method === 'POST'
        ).length;
        """)).intValue());
    assertFalse(driver.findElements(By.cssSelector("[role='alert']")).stream()
        .anyMatch(alerta -> alerta.isDisplayed()));
  }

  private String urlSubmissao() {
    String base = APP_URL.replaceAll("/+$", "");
    return base.endsWith("/submeter") ? base : base + "/submeter";
  }

  private WebElement rotulo(String texto) {
    return driver.findElement(By.xpath(
        "//label[starts-with(normalize-space(string(.)), '" + texto + "')]/*[self::input or self::select or self::textarea]"));
  }

  private void anexarPdf(String inputId, String nome) throws IOException {
    Path arquivo = Files.createTempFile("selenium-", "-" + nome);
    byte[] conteudo = Base64.getDecoder().decode("JVBERi0xLjQKJUVPRgo=");
    Files.write(arquivo, conteudo);
    driver.findElement(By.id(inputId)).sendKeys(arquivo.toAbsolutePath().toString());
    arquivo.toFile().deleteOnExit();
  }

  private static String env(String chave, String padrao) {
    String valor = System.getenv(chave);
    return valor == null || valor.isBlank() ? padrao : valor;
  }
}
