package br.edu.ifrn.portal;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

final class SubmissaoPage {
  private final WebDriver driver;
  private final WebDriverWait wait;
  private final String url;

  SubmissaoPage(WebDriver driver, WebDriverWait wait, String portalUrl) {
    this.driver = driver;
    this.wait = wait;
    String base = portalUrl.replaceAll("/+$", "");
    this.url = base.endsWith("/submeter") ? base : base + "/submeter";
  }

  void abrir() {
    driver.get(url);
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main.pagina-submissao h1")));
  }

  void irParaEtapaProjeto() {
    driver.findElement(By.xpath("//button[contains(., 'Continuar para o projeto')]")).click();
  }

  void preencherProjetoIntegrador() {
    escolherTipoProjeto();
    campo("Título").sendKeys("Projeto Selenium de demonstração");
    preencherDescricaoProjeto();
  }

  void preencherProjetoIntegradorSemTitulo() {
    escolherTipoProjeto();
    preencherDescricaoProjeto();
  }

  private void escolherTipoProjeto() {
    new Select(campo("Tipo de produção")).selectByVisibleText("Projeto Integrador");
  }

  private void preencherDescricaoProjeto() {
    driver.findElement(By.id("campo-resumo")).sendKeys("Resumo de teste automatizado com dados fictícios.");
    driver.findElement(By.id("campo-objetivos")).sendKeys("Validar submissão no ambiente de testes.");
    driver.findElement(By.id("campo-informacoes-especificas"))
        .sendKeys("Escopo demonstrativo, sem dados reais.");
  }

  void continuarParaEquipe() {
    driver.findElement(By.xpath("//button[contains(., 'Continuar para a equipe')]")).click();
  }

  void selecionarOrientador() {
    new Select(campo("Professor orientador")).selectByVisibleText("Orientador Selenium");
  }

  void continuarParaDocumentos() {
    driver.findElement(By.xpath("//button[contains(., 'Continuar para os documentos')]")).click();
  }

  void anexarDocumentosObrigatorios() throws IOException {
    anexarPdf("arquivo-requisitos", "requisitos-teste.pdf");
    anexarPdf("arquivo-relatorio", "relatorio-teste.pdf");
  }

  private void anexarPdf(String inputId, String nome) throws IOException {
    Path arquivo = Files.createTempFile("selenium-", "-" + nome);
    Files.write(arquivo, java.util.Base64.getDecoder().decode("JVBERi0xLjQKJUVPRgo="));
    arquivo.toFile().deleteOnExit();
    driver.findElement(By.id(inputId)).sendKeys(arquivo.toAbsolutePath().toString());
  }

  void autorizarPublicacao() {
    driver.findElement(By.xpath(
        "//label[contains(@class, 'consentimento-submissao')]//input[@type='checkbox']")).click();
  }

  void enviarProjeto() {
    driver.findElement(By.xpath("//button[normalize-space()='Enviar projeto']")).click();
  }

  String erroDoTitulo() {
    return driver.findElement(By.id("erro-titulo")).getText();
  }

  String tituloInvalido() {
    return campo("Título").getAttribute("aria-invalid");
  }

  boolean confirmacaoDeEnvioVisivel() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("titulo-confirmacao"))).isDisplayed();
  }

  String tituloConfirmado() {
    return driver.findElement(By.cssSelector(".submissao-confirmacao__resumo strong")).getText();
  }

  String nomeEnviado() {
    return campoDoCadastro("nome");
  }

  String tipoEnviado() {
    return campoDoCadastro("tipoProjeto");
  }

  String resumoEnviado() {
    return campoDoCadastro("resumo");
  }

  int orientadorEnviado() {
    List<?> professores = (List<?>) corpoDoCadastro().get("professores");
    Map<?, ?> orientador = (Map<?, ?>) professores.get(0);
    return ((Number) orientador.get("professorId")).intValue();
  }

  int quantidadeDeUploads() {
    Object quantidade = ((JavascriptExecutor) driver).executeScript("""
        return window.__seleniumApiCalls.filter(chamada =>
          chamada.url.includes('/documentos') && chamada.method === 'POST'
        ).length;
        """);
    return ((Number) quantidade).intValue();
  }

  boolean mostraErro() {
    return driver.findElements(By.cssSelector("[role='alert']")).stream().anyMatch(WebElement::isDisplayed);
  }

  private String campoDoCadastro(String nome) {
    return String.valueOf(corpoDoCadastro().get(nome));
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> corpoDoCadastro() {
    return (Map<String, Object>) ((JavascriptExecutor) driver).executeScript("""
        return window.__seleniumApiCalls.find(chamada =>
          chamada.url.includes('/projetos') && chamada.method === 'POST'
        ).body;
        """);
  }

  private WebElement campo(String rotulo) {
    return driver.findElement(By.xpath(
        "//label[starts-with(normalize-space(string(.)), '" + rotulo
            + "')]/*[self::input or self::select or self::textarea]"));
  }
}
