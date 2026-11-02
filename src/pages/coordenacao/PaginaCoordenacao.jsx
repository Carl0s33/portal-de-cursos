import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import { basePortal, enderecoPrivado } from '../../app/rotas.js'
import TabelaSubmissoes from '@/pages/administracao/components/TabelaSubmissoes.jsx'
import GestaoConteudos from '@/pages/administracao/components/GestaoConteudos.jsx'
import GestaoProfessores from '@/pages/administracao/components/GestaoProfessores.jsx'
import '@/shared/styles/painel.css'
import '../administracao/administracao.css'

function pertenceAoCurso(item, cursoId, curso) {
  if (String(item.identificadorCurso ?? item.cursoId ?? '') === String(cursoId)) return true
  return Boolean(curso && [curso.sigla, curso.nome].includes(item.curso))
}

function IconeIndicadorCoordenacao({ tipo }) {
  const desenho = {
    total: <path d="M4 4h16v16H4zM8 2v4M16 2v4M8 11h8M8 15h5" />,
    analise: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    aprovado: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Z" />
        <path d="M16 3v5h5M8 14l2.5 2.5L16 11" />
      </>
    ),
    curso: <path d="m3 9 9-5 9 5-9 5-9-5Zm4 2.2v4.5c3.2 2.5 6.8 2.5 10 0v-4.5M21 9v6" />,
  }[tipo]
  return (
    <span
      className={`administracao-indicador__icone administracao-indicador__icone--${tipo === 'curso' ? 'cursos' : tipo === 'analise' ? 'campus' : tipo === 'aprovado' ? 'areas' : 'disciplinas'}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {desenho}
      </svg>
    </span>
  )
}

export default function PaginaCoordenacao({ secao, sessao, rascunhos, aoAlterar, submissoes }) {
  const [cursos, definirCursos] = useState([])
  useEffect(() => {
    const controller = new AbortController()
    listarCursos(controller.signal)
      .then((registros) => {
        if (!controller.signal.aborted) definirCursos(registros)
      })
      .catch(() => {
        if (!controller.signal.aborted) definirCursos([])
      })
    return () => controller.abort()
  }, [])
  const cursoId = sessao.usuario.cursoId
  const referenciaCurso = sessao.usuario.curso
  const curso = cursos.find((item) =>
    [item.identificador, item.id, item.sigla, item.nome].some((valor) =>
      [
        cursoId,
        referenciaCurso?.id,
        referenciaCurso?.identificador,
        referenciaCurso?.sigla,
        referenciaCurso?.nome,
      ]
        .filter(Boolean)
        .some((referencia) => String(referencia) === String(valor)),
    ),
  )
  const idsDoCurso = [
    cursoId,
    referenciaCurso?.id,
    referenciaCurso?.identificador,
    curso?.id,
    curso?.identificador,
  ].filter((id) => id !== undefined && id !== null)
  const cursosDaCoordenacao = cursos.filter((item) =>
    idsDoCurso.some((id) =>
      [item.id, item.identificador].some((valor) => String(valor) === String(id)),
    ),
  )
  const submissoesDoCurso = submissoes.filter((item) =>
    idsDoCurso.some((id) => pertenceAoCurso(item, id, curso)),
  )

  const emAnaliseCoord = submissoesDoCurso.filter((s) => s.status === 'Em análise').length
  const aguardandoOrientador = submissoesDoCurso.filter(
    (s) => s.status === 'Aguardando Orientador',
  ).length
  const publicados = submissoesDoCurso.filter((s) => s.status === 'Aprovado').length

  if (secao === 'curso')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        {cursosDaCoordenacao.length ? (
          <GestaoConteudos
            dominio="cursos"
            itens={cursos}
            aoAlterar={(itens) => aoAlterar('cursos', itens)}
            cursoId={curso?.id || cursoId}
            token={sessao.token}
            somenteEdicao
          />
        ) : (
          <p className="painel-vazio" role="status">
            O curso vinculado à sua conta não está disponível para edição neste ambiente.
          </p>
        )}
      </main>
    )

  if (secao === 'professores')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoProfessores token={sessao.token} cursoId={cursoId} />
      </main>
    )

  if (secao === 'disciplinas')
    return (
      <main
        id="conteudo"
        className="pagina-painel pagina-painel--administracao pagina-painel--disciplinas"
      >
        <GestaoConteudos
          dominio="disciplinas"
          itens={rascunhos.disciplinas}
          cursos={cursosDaCoordenacao}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar('disciplinas', itens)}
          cursoId={curso?.identificador || cursoId}
          curso={curso}
        />
      </main>
    )

  if (secao === 'projetos')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoConteudos
          dominio="projetos"
          itens={rascunhos.projetos}
          cursos={cursosDaCoordenacao}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar('projetos', itens)}
          cursoId={curso?.identificador || cursoId}
          curso={curso}
        />
      </main>
    )

  if (secao === 'submissoes')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <header className="painel-titulo administracao-boas-vindas">
          <div>
            <span className="administracao-boas-vindas__rotulo">Avaliação acadêmica</span>
            <h1>Submissões do curso</h1>
            <p>Avalie as submissões aceitas pelos orientadores e decida sobre a publicação.</p>
          </div>
          <div className="administracao-boas-vindas__acoes">
            <a className="botao-primario" href={`${basePortal}#submeter`}>
              + Submeter projeto
            </a>
          </div>
        </header>
        <section className="painel-secao administracao-registros">
          <header>
            <div>
              <h2>Todas as submissões</h2>
              <p>{submissoesDoCurso.length} produções registradas neste curso.</p>
            </div>
          </header>
          <TabelaSubmissoes
            itens={submissoesDoCurso}
            baseDetalhes={enderecoPrivado('coordenacao/submissao')}
          />
        </section>
      </main>
    )

  return (
    <main id="conteudo" className="pagina-painel pagina-painel--administracao">
      <header className="painel-titulo administracao-boas-vindas">
        <div>
          <span className="administracao-boas-vindas__rotulo">Coordenação de curso</span>
          <h1>{curso?.sigla ? `${curso.sigla} — ${curso.nome}` : 'Coordenação do curso'}</h1>
          <p>
            {curso?.nome
              ? 'Acompanhe as produções acadêmicas, a matriz curricular e o corpo docente do curso.'
              : `Curso vinculado à conta #${cursoId || 'institucional'}`}
          </p>
        </div>
        <div className="administracao-boas-vindas__acoes">
          <a className="botao-secundario" href={enderecoPrivado('coordenacao/curso')}>
            Editar curso
          </a>
          <a className="botao-primario" href={`${basePortal}#submeter`}>
            + Submeter projeto
          </a>
        </div>
      </header>

      <section className="administracao-indicadores" aria-label="Resumo do curso">
        {[
          ['Total de submissões', submissoesDoCurso.length, 'total', 'coordenacao/submissoes'],
          ['Aguardando coordenação', emAnaliseCoord, 'analise', 'coordenacao/submissoes'],
          ['Com o orientador', aguardandoOrientador, 'curso', 'coordenacao/submissoes'],
          ['Publicados no portal', publicados, 'aprovado', 'coordenacao/projetos'],
        ].map(([rotulo, total, tipo, destino]) => (
          <a className="administracao-indicador" href={enderecoPrivado(destino)} key={rotulo}>
            <IconeIndicadorCoordenacao tipo={tipo} />
            <span className="administracao-indicador__texto">
              <span>{rotulo}</span>
              <strong>{total}</strong>
            </span>
            <span className="administracao-indicador__seta" aria-hidden="true">
              →
            </span>
          </a>
        ))}
      </section>

      <section className="painel-secao administracao-registros">
        <header>
          <div>
            <h2>Submissões recentes do curso</h2>
            <p>
              Trabalhos submetidos pelos estudantes que aguardam aceite do orientador ou aprovação
              final da coordenação.
            </p>
          </div>
          <a href={enderecoPrivado('coordenacao/submissoes')}>
            Ver todas <span aria-hidden="true">→</span>
          </a>
        </header>
        <TabelaSubmissoes
          itens={submissoesDoCurso.slice(0, 8)}
          baseDetalhes={enderecoPrivado('coordenacao/submissao')}
        />
      </section>

      <section className="administracao-secao-atalhos">
        <header>
          <div>
            <h2>Gestão acadêmica do curso</h2>
            <p>Acesse rapidamente as configurações e os cadastros sob sua responsabilidade.</p>
          </div>
        </header>
        <div className="administracao-categorias">
          {[
            [
              'Estrutura do curso',
              [
                ['curso', 'Dados do curso', 'Atualize apresentação, turno e carga horária'],
                [
                  'disciplinas',
                  'Matriz curricular',
                  'Organize as disciplinas obrigatórias e optativas',
                ],
              ],
            ],
            [
              'Comunidade e acervo',
              [
                ['professores', 'Corpo docente', 'Gerencie os professores vinculados ao curso'],
                ['projetos', 'Acervo de projetos', 'Consulte e edite os trabalhos do curso'],
                ['submissoes', 'Fila de avaliação', 'Publique ou recuse submissões validadas'],
              ],
            ],
          ].map(([titulo, itens]) => (
            <section className="administracao-categoria" key={titulo}>
              <h3>{titulo}</h3>
              <ul>
                {itens.map(([destino, nome, descricao]) => (
                  <li key={destino}>
                    <a href={enderecoPrivado(`coordenacao/${destino}`)}>
                      <span className="administracao-categoria__texto">
                        <strong>{nome}</strong>
                        <small>{descricao}</small>
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 16 16">
                        <path d="M3 8h9M8 3l5 5-5 5" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}
