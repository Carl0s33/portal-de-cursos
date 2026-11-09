package br.edu.ifrn.portal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.module.Script;

final class ApiSubmissaoFalsa {
  private static final String PRELOAD_SCRIPT = """
      () => {
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
        const fetchOriginal = window.fetch.bind(window);
        window.__seleniumApiCalls = [];

        window.fetch = async (input, init = {}) => {
          const url = String(input);
          const method = (init.method || 'GET').toUpperCase();
          window.__seleniumApiCalls.push({
            url,
            method,
            body: typeof init.body === 'string' ? JSON.parse(init.body) : null
          });

          const json = (data) => new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });

          if (url.includes('/cursos')) {
            return json([{ id: 101, nome: 'Curso Selenium', sigla: 'CS', acronimo: 'CS', campusId: 10 }]);
          }
          if (url.includes('/professores/buscar')) {
            return json([{
              id: 201,
              cursoId: 101,
              usuario: { nome: 'Orientador Selenium', email: 'orientador.selenium@example.invalid' }
            }]);
          }
          if (url.includes('/disciplinas')) return json([]);
          if (url.includes('/projetos') && method === 'POST') return json({ id: 301 });
          if (url.includes('/documentos') && method === 'POST') return json({ id: 401 });
          if (url.includes('/notificacoes') && method === 'POST') return json({ enviado: true });

          return fetchOriginal(input, init);
        };
      }
      """;

  private ApiSubmissaoFalsa() {}

  static void instalarAntesDoCarregamento(WebDriver driver) {
    new Script(driver).addPreloadScript(PRELOAD_SCRIPT);
  }
}
