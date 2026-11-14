package br.edu.ifrn.portal;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

final class LoginPage {
  private final WebDriver driver;
  private final WebDriverWait wait;
  private final String portalUrl;

  LoginPage(WebDriver driver, String portalUrl) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    this.portalUrl = portalUrl.replaceAll("/+$", "");
  }

  void abrirComoAluno() {
    driver.get(portalUrl + "/aluno/login");
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("identificacao")));
  }

  void autenticarAluno(String email, String senha) {
    driver.findElement(By.id("identificacao")).sendKeys(email);
    driver.findElement(By.id("senha")).sendKeys(senha);
    driver.findElement(By.cssSelector("button.acesso-entrar[type='submit']")).click();
    wait.until(ExpectedConditions.urlContains("/aluno/painel"));
  }

  String erroDeLogin() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='alert']")))
        .getText();
  }

  boolean alertaVisivel() {
    return driver.findElements(By.cssSelector("[role='alert']")).stream()
        .anyMatch(elemento -> elemento.isDisplayed());
  }
}

