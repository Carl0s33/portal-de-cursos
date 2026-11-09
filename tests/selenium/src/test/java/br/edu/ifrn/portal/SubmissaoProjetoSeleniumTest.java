package br.edu.ifrn.portal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.AfterTestExecutionCallback;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

class SubmissaoProjetoSeleniumTest {
  private static final String PORTAL_URL = env("PORTAL_URL", "http://localhost:5173");

  private WebDriver driver;
  private SubmissaoPage submissao;

  @RegisterExtension
  final AfterTestExecutionCallback screenshotOnFailure = context -> {
    if (driver == null || context.getExecutionException().isEmpty()) return;

    Path screenshots = Path.of("target", "screenshots");
    Files.createDirectories(screenshots);
    String filename = context.getDisplayName().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";
    Files.copy(((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE).toPath(),
        screenshots.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
  };

  @BeforeEach
  void abrirFormularioComoAlunoDeTeste() {
    ChromeOptions options = new ChromeOptions();
    options.enableBiDi();
    options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");

    try {
      driver = new org.openqa.selenium.chrome.ChromeDriver(options);
      ApiSubmissaoFalsa.instalarAntesDoCarregamento(driver);
    } catch (Exception falha) {
      throw new IllegalStateException(
          "Não foi possível iniciar o Chrome com WebDriver BiDi. Confira a instalação do Chrome.",
          falha);
    }

    submissao = new SubmissaoPage(driver, new WebDriverWait(driver, Duration.ofSeconds(12)), PORTAL_URL);
    submissao.abrir();
  }

  @AfterEach
  void fecharNavegador() {
    if (driver != null) driver.quit();
  }

  @Test
  void mostraErroQuandoTituloObrigatorioEstaVazio() {
    // Arrange
    submissao.irParaEtapaProjeto();
    submissao.preencherProjetoIntegradorSemTitulo();

    // Act
    submissao.continuarParaEquipe();

    // Assert
    assertEquals("Informe título.", submissao.erroDoTitulo());
    assertEquals("true", submissao.tituloInvalido());
  }

  @Test
  void alunoEnviaProjetoIntegradorComDocumentosPdf() throws IOException {
    // Arrange
    submissao.irParaEtapaProjeto();
    submissao.preencherProjetoIntegrador();
    submissao.continuarParaEquipe();
    submissao.selecionarOrientador();
    submissao.continuarParaDocumentos();
    submissao.anexarDocumentosObrigatorios();
    submissao.autorizarPublicacao();

    // Act
    submissao.enviarProjeto();

    // Assert
    assertTrue(submissao.confirmacaoDeEnvioVisivel());
    assertEquals("Projeto Selenium de demonstração", submissao.tituloConfirmado());
    assertEquals("Projeto Selenium de demonstração", submissao.nomeEnviado());
    assertEquals("PROJETO_INTEGRADOR", submissao.tipoEnviado());
    assertEquals("Resumo de teste automatizado com dados fictícios.", submissao.resumoEnviado());
    assertEquals(201, submissao.orientadorEnviado());
    assertEquals(2, submissao.quantidadeDeUploads());
    assertFalse(submissao.mostraErro());
  }

  private static String env(String key, String fallback) {
    String value = System.getenv(key);
    return value == null || value.isBlank() ? fallback : value;
  }
}
