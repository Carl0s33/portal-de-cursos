import { useMemo } from 'react'
import '@/shared/styles/painel-informativo.css'
import { basePortal } from '../../app/rotas.js'
import './painel-aluno.css'

const classeStatus = {
  'Em análise': 'status--em-análise',
  'Aguardando Orientador': 'status--aguardando-orientador',
  Aprovado: 'status--aprovado',
  Recusado: 'status--recusado',
}

export default function PaginaPainelAluno({ sessao, submissoes = [] }) {
  const emailAluno = sessao?.usuario?.email?.toLowerCase() || ''
  const nomeAluno = sessao?.usuario?.nome?.toLowerCase() || ''

  // Exibe projetos onde o aluno é autor principal ou co-autor (integrante)
  const minhasSubmissoes = useMemo(
    () =>
      submissoes.filter((s) => {
        const eAutor =
          s.autor?.toLowerCase() === nomeAluno ||
          s.email?.toLowerCase() === emailAluno ||
          s.autores?.some(
            (autor) =>
              typeof autor !== 'string' &&
              autor?.nome?.toLowerCase() === nomeAluno &&
              autor?.email?.toLowerCase() === emailAluno,
          )
        const eIntegrante =
          Array.isArray(s.autores) &&
          s.autores.some((a) => {
            const nome = typeof a === 'string' ? a : a?.nome || ''
            const email = typeof a === 'string' ? '' : a?.email || ''
            return nome.toLowerCase() === nomeAluno || email.toLowerCase() === emailAluno
          })
        return eAutor || eIntegrante
      }),
    [submissoes, emailAluno, nomeAluno],
  )

  const totais = useMemo(
    () => ({
      total: minhasSubmissoes.length,
      analise: minhasSubmissoes.filter((s) =>
        ['Aguardando Orientador', 'Em análise'].includes(s.status),
      ).length,
      aprovados: minhasSubmissoes.filter((s) => s.status === 'Aprovado').length,
      recusados: minhasSubmissoes.filter((s) => s.status === 'Recusado').length,
    }),
    [minhasSubmissoes],
  )

  return (
    <main className="limite pagina-painel-aluno" id="conteudo">
      <header className="painel-aluno-cabecalho">
        <div>
          <p className="painel-aluno-rotulo">Área do Aluno</p>
          <h1>Meus projetos</h1>
          <p>
            Acompanhe os projetos que você submeteu ou em que consta como integrante, e o status de
            cada um.
          </p>
        </div>
        <a id="btn-submeter-projeto" className="botao-primario" href={`${basePortal}#submeter`}>
          + Submeter projeto
        </a>
      </header>

      {/* Indicadores */}
      <dl className="painel-aluno-indicadores">
        <div>
          <dt>Total</dt>
          <dd>{totais.total}</dd>
          <p className="painel-indicadores__detalhe">submissões no portal</p>
        </div>
        <div className="painel-aluno-indicadores__destaque">
          <dt>Em análise</dt>
          <dd>{totais.analise}</dd>
          <p className="painel-indicadores__detalhe">aguardando avaliação</p>
        </div>
        <div>
          <dt>Aprovados</dt>
          <dd>{totais.aprovados}</dd>
          <p className="painel-indicadores__detalhe">publicados no portal</p>
        </div>
        <div>
          <dt>Recusados</dt>
          <dd>{totais.recusados}</dd>
          <p className="painel-indicadores__detalhe">não publicados</p>
        </div>
      </dl>

      {/* Tabela de submissões */}
      <section className="painel-secao" aria-labelledby="titulo-minhas-submissoes">
        <header>
          <div>
            <h2 id="titulo-minhas-submissoes">Submissões</h2>
            <p>Projetos em que você figura como autor principal ou co-autor.</p>
          </div>
          <span className="painel-contagem">
            {totais.total} resultado{totais.total !== 1 ? 's' : ''}
          </span>
        </header>
        {minhasSubmissoes.length === 0 ? (
          <div className="painel-vazio" role="status">
            <span className="painel-aluno-vazio-icone" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="36"
                height="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                <path d="M12 10v6M9 13h6" />
              </svg>
            </span>
            <p>
              Você ainda não tem nenhum projeto submetido. Use o botão acima para enviar o seu
              primeiro projeto.
            </p>
            <a
              id="btn-submeter-primeiro"
              className="botao-primario"
              href={`${basePortal}#submeter`}
            >
              Submeter meu primeiro projeto
            </a>
          </div>
        ) : (
          <div
            className="tabela-submissoes"
            role="region"
            aria-label="Lista de submissões"
            tabIndex={0}
          >
            <table>
              <caption className="somente-leitores">
                Acompanhamento das suas submissões acadêmicas
              </caption>
              <thead>
                <tr>
                  <th scope="col">Projeto</th>
                  <th scope="col">Curso</th>
                  <th scope="col">Enviado em</th>
                  <th scope="col">Situação</th>
                </tr>
              </thead>
              <tbody>
                {minhasSubmissoes.map((item) => (
                  <tr key={item.identificador}>
                    <th scope="row">
                      {item.titulo}
                      <span>
                        {item.tipo}
                        {item.orientador && ` · ${item.orientador}`}
                      </span>
                    </th>
                    <td>{item.cursoCompleto || item.curso || '—'}</td>
                    <td>{item.enviadoEm}</td>
                    <td>
                      <span
                        className={`status ${classeStatus[item.status] || 'status--em-análise'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Aviso somente-leitura */}
      <aside
        className="painel-aluno-aviso painel-informativo painel-informativo--observacao"
        aria-label="Informação sobre permissões"
      >
        <span>
          <strong>Somente visualização.</strong> Projetos submetidos não podem ser editados ou
          avaliados pelo aluno. Para correções, entre em contato com o professor orientador.
        </span>
      </aside>
    </main>
  )
}
