import { useMemo } from 'react'
import '@/shared/styles/painel-informativo.css'
import Icone from '@/shared/components/Icone.jsx'
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
  const minhasSubmissoes = useMemo(() => {
    const prioridadeStatus = (status = '') => {
      const normalizado = status.toLowerCase()
      if (normalizado.includes('análise') || normalizado.includes('analise')) return 1
      if (normalizado.includes('aguardando')) return 2
      if (normalizado.includes('aprovado') || normalizado.includes('publicado')) return 3
      if (normalizado.includes('recusado')) return 4
      return 5
    }

    const compararData = (a = '', b = '') => {
      const pA = a.split('/')
      const pB = b.split('/')
      if (pA.length === 3 && pB.length === 3) {
        return (
          new Date(Number(pB[2]), Number(pB[1]) - 1, Number(pB[0])).getTime() -
          new Date(Number(pA[2]), Number(pA[1]) - 1, Number(pA[0])).getTime()
        )
      }
      return 0
    }

    return submissoes
      .filter((s) => {
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
      })
      .sort((a, b) => {
        const pA = prioridadeStatus(a.status)
        const pB = prioridadeStatus(b.status)
        if (pA !== pB) return pA - pB
        const diff = compararData(a.enviadoEm, b.enviadoEm)
        if (diff !== 0) return diff
        return Number(b.id || b.identificador || 0) - Number(a.id || a.identificador || 0)
      })
  }, [submissoes, emailAluno, nomeAluno])

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
          + Enviar projeto
        </a>
      </header>

      {/* Indicadores */}
      <dl className="painel-indicadores painel-aluno-indicadores">
        <div className="painel-indicadores__card painel-indicadores__card--total">
          <dt className="painel-indicadores__rotulo">
            <span className="painel-indicadores__icone" aria-hidden="true">
              <Icone nome="projetos-detalhe" />
            </span>
            <span>Total</span>
          </dt>
          <dd className="painel-indicadores__valor">{totais.total}</dd>
          <dd className="painel-indicadores__detalhe">submissões no portal</dd>
        </div>
        <div className="painel-indicadores__card painel-indicadores__card--aguardando">
          <dt className="painel-indicadores__rotulo">
            <span className="painel-indicadores__icone" aria-hidden="true">
              <Icone nome="relogio-cursos" />
            </span>
            <span>Em análise</span>
          </dt>
          <dd className="painel-indicadores__valor">{totais.analise}</dd>
          <dd className="painel-indicadores__detalhe">aguardando avaliação</dd>
        </div>
        <div className="painel-indicadores__card painel-indicadores__card--publicadas">
          <dt className="painel-indicadores__rotulo">
            <span className="painel-indicadores__icone" aria-hidden="true">
              <Icone nome="confirmacao-cursos" />
            </span>
            <span>Aprovados</span>
          </dt>
          <dd className="painel-indicadores__valor">{totais.aprovados}</dd>
          <dd className="painel-indicadores__detalhe">publicados no portal</dd>
        </div>
        <div className="painel-indicadores__card painel-indicadores__card--recusadas">
          <dt className="painel-indicadores__rotulo">
            <span className="painel-indicadores__icone" aria-hidden="true">
              <Icone nome="erro-cursos" />
            </span>
            <span>Recusados</span>
          </dt>
          <dd className="painel-indicadores__valor">{totais.recusados}</dd>
          <dd className="painel-indicadores__detalhe">não publicados</dd>
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
              <Icone nome="vazio-projetos-detalhe" />
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
              Enviar meu primeiro projeto
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
                        {item.orientador && `, ${item.orientador}`}
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
