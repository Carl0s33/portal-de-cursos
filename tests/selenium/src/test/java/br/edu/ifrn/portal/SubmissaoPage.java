package br.edu.ifrn.portal;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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
    this.url = base + "/#submeter";
  }

  void abrirDepoisDoLogin() {
    driver.get(url);
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main.pagina-submissao h1")));
    wait.until(ExpectedConditions.elementToBeClickable(
        By.xpath("//button[contains(., 'Continuar para o projeto')]")));
  }

  void irParaEtapaProjeto() {
    clicar(By.xpath("//button[contains(., 'Continuar para o projeto')]"));
  }

  void preencherProjetoIntegrador(String titulo) {
    escolherTipoProjeto();
    preencherDescricaoProjeto();
    preencherTitulo(titulo);
  }

  void preencherTitulo(String titulo) {
    campo("Título").clear();
    campo("Título").sendKeys(titulo);
  }

  void preencherProjetoIntegradorSemTitulo() {
    escolherTipoProjeto();
    preencherDescricaoProjeto();
  }

  private void escolherTipoProjeto() {
    new Select(campo("Tipo de produção")).selectByVisibleText("Projeto Integrador");
  }

  private void preencherDescricaoProjeto() {
    driver.findElement(By.id("campo-resumo")).sendKeys("Resumo criado pelo teste Selenium integrado.");
    driver.findElement(By.id("campo-objetivos")).sendKeys("Validar a submissão pelos serviços reais.");
    driver.findElement(By.id("campo-informacoes-especificas"))
        .sendKeys("Registro identificável de teste automatizado do Portal de Cursos.");
  }

  void continuarParaEquipe() {
    clicar(By.xpath("//button[contains(., 'Continuar para a equipe')]"));
  }

  void selecionarOrientadorDisponivel() {
    WebElement campoOrientador = selectDoRotulo("Professor orientador");
    wait.until(driverAtual -> new Select(campoOrientador).getOptions().size() > 1);
    Select opcoes = new Select(campoOrientador);
    opcoes.selectByIndex(1);
  }

  void selecionarDisciplinaDisponivel() {
    WebElement campoDisciplina = selectDoRotulo("Adicionar disciplina curricular associada");
    wait.until(driverAtual -> new Select(campoDisciplina).getOptions().size() > 1);
    new Select(campoDisciplina).selectByIndex(1);
  }

  void continuarParaDocumentos() {
    clicar(By.xpath("//button[contains(., 'Continuar para os documentos')]"));
    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("arquivo-requisitos")));
  }

  void anexarDocumentosObrigatorios() throws IOException {
    anexarPdf("arquivo-requisitos", "requisitos-teste.pdf");
    anexarPdf("arquivo-relatorio", "relatorio-teste.pdf");
  }

  private void anexarPdf(String inputId, String nome) throws IOException {
    Path arquivo = Files.createTempFile("portal-selenium-", "-" + nome);
    Files.write(arquivo, pdfMinimo());
    arquivo.toFile().deleteOnExit();
    driver.findElement(By.id(inputId)).sendKeys(arquivo.toAbsolutePath().toString());
    wait.until(ExpectedConditions.presenceOfElementLocated(
        By.cssSelector(".campo-arquivo__lista li")));
  }

  private byte[] pdfMinimo() {
    List<String> objetos = List.of(
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Resources << >> /Contents 4 0 R >>",
        "<< /Length 0 >>\nstream\n\nendstream");
    StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
    List<Integer> offsets = new ArrayList<>();
    for (int indice = 0; indice < objetos.size(); indice++) {
      offsets.add(pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length);
      pdf.append(indice + 1).append(" 0 obj\n").append(objetos.get(indice)).append("\nendobj\n");
    }
    int inicioXref = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;
    pdf.append("xref\n0 ").append(objetos.size() + 1).append("\n0000000000 65535 f \n");
    for (int deslocamento : offsets) {
      pdf.append(String.format("%010d 00000 n \n", deslocamento));
    }
    pdf.append("trailer\n<< /Size ").append(objetos.size() + 1)
        .append(" /Root 1 0 R >>\nstartxref\n").append(inicioXref).append("\n%%EOF\n");
    return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
  }

  void autorizarPublicacao() {
    clicar(By.xpath("//label[contains(@class, 'consentimento-submissao')]//input[@type='checkbox']"));
  }

  void enviarProjeto() {
    clicar(By.xpath("//button[normalize-space()='Enviar projeto']"));
  }

  String erroDoTitulo() {
    return driver.findElement(By.id("erro-titulo")).getText();
  }

  String tituloInvalido() {
    return campo("Título").getAttribute("aria-invalid");
  }

  boolean confirmacaoDeEnvioVisivel() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("titulo-confirmacao")))
        .isDisplayed();
  }

  String tituloConfirmado() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.cssSelector(".submissao-confirmacao__resumo strong"))).getText();
  }

  boolean mostraErro() {
    return driver.findElements(By.cssSelector("[role='alert']")).stream().anyMatch(WebElement::isDisplayed);
  }

  private WebElement campo(String rotulo) {
    return driver.findElement(By.xpath(
        "//label[starts-with(normalize-space(string(.)), '" + rotulo
            + "')]/*[self::input or self::select or self::textarea]"));
  }

  private WebElement selectDoRotulo(String rotulo) {
    return driver.findElement(By.xpath("//label[starts-with(normalize-space(string(.)), '" + rotulo + "')]//select"));
  }

  private void clicar(By localizador) {
    WebElement elemento = wait.until(ExpectedConditions.elementToBeClickable(localizador));
    ((JavascriptExecutor) driver).executeScript(
        "arguments[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });",
        elemento);
    wait.until(ExpectedConditions.elementToBeClickable(elemento)).click();
  }
}

