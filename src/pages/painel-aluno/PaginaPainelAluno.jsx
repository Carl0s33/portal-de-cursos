import { ordenarSubmissoes } from '@/shared/utils/ordenarSubmissoes.js'
import Indicadores from '@/shared/componentes/Indicadores.jsx'
import EtapasSubmissao from '@/shared/componentes/EtapasSubmissao.jsx'
import { useMemo } from 'react'
import '@/shared/styles/painel-informativo.css'
import EstadoVazio from '@/shared/componentes/EstadoVazio.jsx'
import { basePortal } from '../../app/rotas.js'
import './painel-aluno.css'

const classeStatus = {
  'Aguardando Orientador': 'status--aguardando-orientador',
  'Aprovado pelo orientador': 'status--aprovado-orientador',
  'Aguardando Coordenação': 'status--aguardando-coordenação',
  Aprovado: 'status--aprovado',
  'Recusado pelo orientador': 'status--recusado',
  'Publicação recusada': 'status--recusado',
}

export default function PaginaPainelAluno({ sessao, submissoes = [] }) {
  const emailAluno = sessao?.usuario?.email?.toLowerCase() || ''
  const nomeAluno = sessao?.usuario?.nome?.toLowerCase() || ''

  // Exibe projetos onde o aluno é autor principal ou co-autor (integrante)
  const minhasSubmissoes = useMemo(
    () =>
      ordenarSubmissoes(
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
      ),
    [submissoes, emailAluno, nomeAluno],
  )

  const totais = useMemo(
    () => ({
      total: minhasSubmissoes.length,
      analise: minhasSubmissoes.filter((s) =>
        ['Aguardando Orientador', 'Aprovado pelo orientador', 'Aguardando Coordenação'].includes(
          s.status,
        ),
      ).length,
      aprovados: minhasSubmissoes.filter((s) => s.status === 'Aprovado').length,
      recusados: minhasSubmissoes.filter((s) =>
        ['Recusado pelo orientador', 'Publicação recusada'].includes(s.status),
      ).length,
    }),
    [minhasSubmissoes],
  )

  return (
    <main className="limite pagina-painel-aluno" id="conteudo">
      <header className="painel-aluno-cabecalho">
        <div>
          <h1>Meus projetos</h1>
          <p>
            Acompanhe os projetos que você submeteu ou em que consta como integrante, e o status de
            cada um.
          </p>
        </div>
        <a id="btn-submeter-projeto" className="botao-primario" href={`${basePortal}#submeter`}>
          Enviar projeto
        </a>
      </header>

      <Indicadores
        itens={[
          {
            titulo: 'Total de submissões',
            valor: totais.total,
            icone: 'projetos-detalhe',
            tom: 'primario',
          },
          {
            titulo: 'Em análise',
            valor: totais.analise,
            icone: 'relogio-cursos',
            tom: 'andamento',
          },
          {
            titulo: 'Aprovados',
            valor: totais.aprovados,
            icone: 'confirmacao-cursos',
            tom: 'sucesso',
          },
          {
            titulo: 'Recusados',
            valor: totais.recusados,
            icone: 'erro',
            tom: 'erro',
          },
        ]}
      />

      {/* Tabela de submissões */}
      <section className="painel" aria-labelledby="titulo-minhas-submissoes">
        <header className="painel__cabecalho">
          <div>
            <h2 id="titulo-minhas-submissoes">Submissões</h2>
            <p>Acompanhe o parecer e as decisões registradas em cada projeto.</p>
          </div>
          <span className="painel-contagem">
            {totais.total} {totais.total === 1 ? 'resultado' : 'resultados'}
          </span>
        </header>
        {minhasSubmissoes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum projeto enviado"
            descricao="Envie seu primeiro projeto para avaliação do professor orientador. Você poderá acompanhar cada etapa neste painel."
            acao="Enviar primeiro projeto"
            destino={`${basePortal}#submeter`}
            idAcao="btn-submeter-primeiro"
          />
        ) : (
          <div
            className="tabela-container"
            role="region"
            aria-label="Lista de submissões"
            tabIndex={0}
          >
            <table className="tabela tabela-projetos-aluno">
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
                      <span className="tabela__titulo">{item.titulo}</span>
                      <EtapasSubmissao status={item.status} compact />
                      <span className="tabela__descricao">
                        {item.tipo}
                        {item.orientador && ` · ${item.orientador}`}
                      </span>
                    </th>
                    <td data-label="Curso">{item.cursoCompleto || item.curso || '—'}</td>
                    <td data-label="Enviado em">{item.enviadoEm}</td>
                    <td data-label="Situação">
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

        <footer className="painel-aluno__rodape-aviso">
          <strong>Acompanhamento de submissões.</strong> Projetos em análise aguardam o parecer
          docente. Em caso de devolução para ajustes, você poderá editar e reenviar o projeto.
        </footer>
      </section>
    </main>
  )
}
