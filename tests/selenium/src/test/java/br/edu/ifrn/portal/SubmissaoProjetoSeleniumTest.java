package br.edu.ifrn.portal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.AfterTestExecutionCallback;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

class SubmissaoProjetoSeleniumTest {
  private static final String PORTAL_URL = env("PORTAL_URL", "http://localhost:5173");
  private static final String EMAIL = requiredEnv("SELENIUM_EMAIL");
  private static final String SENHA = requiredEnv("SELENIUM_PASSWORD");

  private WebDriver driver;
  private LoginPage login;
  private SubmissaoPage submissao;

  @RegisterExtension
  final AfterTestExecutionCallback screenshotOnFailure = context -> {
    if (driver == null || context.getExecutionException().isEmpty()) return;

    Path screenshots = Path.of("target", "screenshots");
    Files.createDirectories(screenshots);
    String filename = context.getDisplayName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";
    Files.copy(((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE).toPath(),
        screenshots.resolve(filename), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
  };

  @BeforeEach
  void iniciarNavegador() {
    ChromeOptions options = new ChromeOptions();
    options.enableBiDi();
    String executavelNavegador = System.getenv("BROWSER_BINARY");
    if (executavelNavegador != null && !executavelNavegador.isBlank()) {
      options.setBinary(executavelNavegador);
    }
    options.addArguments(
        "--headless=new",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-crash-reporter",
        "--disable-breakpad",
        "--user-data-dir=" + java.nio.file.Path.of(System.getProperty("java.io.tmpdir"),
            "portal-selenium-" + java.util.UUID.randomUUID()).toAbsolutePath());

    try {
      String executavelDriver = System.getenv("CHROMEDRIVER_PATH");
      if (executavelDriver == null || executavelDriver.isBlank()) {
        driver = new org.openqa.selenium.chrome.ChromeDriver(options);
      } else {
        ChromeDriverService service = new ChromeDriverService.Builder()
            .usingDriverExecutable(java.nio.file.Path.of(executavelDriver).toFile())
            .build();
        driver = new org.openqa.selenium.chrome.ChromeDriver(service, options);
      }
      driver.manage().window().setSize(new Dimension(1440, 1100));
    } catch (Exception falha) {
      throw new IllegalStateException(
          "Não foi possível iniciar o Chrome. Confira a instalação do navegador e do ChromeDriver.",
          falha);
    }

    login = new LoginPage(driver, PORTAL_URL);
    submissao = new SubmissaoPage(driver, new WebDriverWait(driver, Duration.ofSeconds(20)), PORTAL_URL);
  }

  @AfterEach
  void fecharNavegador() {
    if (driver != null) driver.quit();
  }

  @Test
  void alunoRealizaLoginPeloServicoDeUsuarios() {
    login.abrirComoAluno();
    login.autenticarAluno(EMAIL, SENHA);

    assertTrue(driver.getCurrentUrl().contains("/aluno/painel"));
    assertFalse(login.alertaVisivel());
  }

  @Test
  void alunoSubmeteProjetoComDadosEArquivosNosServicosReais() throws Exception {
    login.abrirComoAluno();
    login.autenticarAluno(EMAIL, SENHA);
    submissao.abrirDepoisDoLogin();

    // Confirma a validação da interface antes de criar qualquer registro nos serviços.
    submissao.irParaEtapaProjeto();
    submissao.preencherProjetoIntegradorSemTitulo();
    submissao.continuarParaEquipe();
    assertEquals("Informe título.", submissao.erroDoTitulo());
    assertEquals("true", submissao.tituloInvalido());

    String titulo = "Teste Selenium Portal " + Instant.now().toEpochMilli();
    submissao.preencherTitulo(titulo);
    submissao.continuarParaEquipe();
    submissao.selecionarOrientadorDisponivel();
    submissao.selecionarDisciplinaDisponivel();
    submissao.continuarParaDocumentos();
    submissao.anexarDocumentosObrigatorios();
    submissao.autorizarPublicacao();

    submissao.enviarProjeto();

    assertTrue(submissao.confirmacaoDeEnvioVisivel());
    assertEquals(titulo, submissao.tituloConfirmado());
    assertFalse(submissao.mostraErro());
  }

  private static String env(String key, String fallback) {
    String value = System.getenv(key);
    return value == null || value.isBlank() ? fallback : value;
  }

  private static String requiredEnv(String key) {
    String value = System.getenv(key);
    if (value == null || value.isBlank()) {
      throw new IllegalStateException(
          "Configure " + key + " no ambiente para executar o teste integrado com os serviços reais.");
    }
    return value;
  }
}

