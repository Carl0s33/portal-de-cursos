import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import { basePortal, enderecoPrivado } from '../../app/rotas.js'
import Icone from '@/shared/components/Icone.jsx'
import TabelaSubmissoes from '@/pages/administracao/components/TabelaSubmissoes.jsx'
import GestaoConteudos from '@/pages/administracao/components/GestaoConteudos.jsx'
import GestaoProfessores from '@/pages/administracao/components/GestaoProfessores.jsx'
import { filtrarContextoCoordenacao } from './services/filtrarContextoCoordenacao.js'
import '@/shared/styles/painel.css'
import './coordenacao.css'

const iconesIndicadores = {
  total: 'projetos-detalhe',
  analise: 'relogio-cursos',
  curso: 'docentes-detalhe',
  aprovado: 'confirmacao-cursos',
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

  const { cursoId, curso, cursosDaCoordenacao, submissoesDoCurso, indicadores } =
    filtrarContextoCoordenacao({
      cursos,
      sessao,
      submissoes,
    })

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
        <header className="painel-titulo coordenacao-boas-vindas">
          <div>
            <span className="coordenacao-boas-vindas__rotulo">Avaliação acadêmica</span>
            <h1>Submissões do curso</h1>
            <p>Avalie as submissões aceitas pelos orientadores e decida sobre a publicação.</p>
          </div>
          <div className="coordenacao-boas-vindas__acoes">
            <a className="botao-primario" href={`${basePortal}#submeter`}>
              + Enviar projeto
            </a>
          </div>
        </header>
        <section className="painel-secao coordenacao-registros">
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
    <main id="conteudo" className="pagina-painel pagina-painel--administracao coordenacao-painel">
      <header className="painel-titulo coordenacao-boas-vindas">
        <div>
          <span className="coordenacao-boas-vindas__rotulo">Coordenação de curso</span>
          <h1>{curso?.sigla ? `${curso.sigla} — ${curso.nome}` : 'Coordenação do curso'}</h1>
          <p>
            {curso?.nome
              ? 'Acompanhe as produções acadêmicas, a matriz curricular e o corpo docente do curso.'
              : `Curso vinculado à conta #${cursoId || 'institucional'}`}
          </p>
        </div>
        <div className="coordenacao-boas-vindas__acoes">
          <a className="botao-secundario" href={enderecoPrivado('coordenacao/curso')}>
            Editar curso
          </a>
          <a className="botao-primario" href={`${basePortal}#submeter`}>
            + Enviar projeto
          </a>
        </div>
      </header>

      <section className="coordenacao-indicadores" aria-label="Resumo do curso">
        {[
          [
            'Total de submissões',
            indicadores.total,
            'total',
            'coordenacao/submissoes',
            'registradas no curso',
          ],
          [
            'Aguardando coordenação',
            indicadores.emAnaliseCoord,
            'analise',
            'coordenacao/submissoes',
            'prontas para decisão final',
          ],
          [
            'Com o orientador',
            indicadores.aguardandoOrientador,
            'curso',
            'coordenacao/submissoes',
            'em avaliação inicial',
          ],
          [
            'Publicados no portal',
            indicadores.publicados,
            'aprovado',
            'coordenacao/projetos',
            'disponíveis no acervo público',
          ],
        ].map(([rotulo, total, tipo, destino, detalhe]) => (
          <a
            className={`coordenacao-indicador coordenacao-indicador--${tipo}`}
            href={enderecoPrivado(destino)}
            key={rotulo}
          >
            <span className="coordenacao-indicador__topo">
              <span className="coordenacao-indicador__icone" aria-hidden="true">
                <Icone nome={iconesIndicadores[tipo]} />
              </span>
              <span className="coordenacao-indicador__rotulo">{rotulo}</span>
            </span>
            <strong className="coordenacao-indicador__valor">{total}</strong>
            <span className="coordenacao-indicador__detalhe">{detalhe}</span>
            <span className="coordenacao-indicador__seta" aria-hidden="true">
              <Icone nome="seta" />
            </span>
          </a>
        ))}
      </section>

      <section className="painel-secao coordenacao-registros">
        <header>
          <div>
            <h2>Submissões recentes do curso</h2>
            <p>
              Trabalhos submetidos pelos estudantes que aguardam aceite do orientador ou aprovação
              final da coordenação.
            </p>
          </div>
          <a href={enderecoPrivado('coordenacao/submissoes')}>
            Ver todas
          </a>
        </header>
        <TabelaSubmissoes
          itens={submissoesDoCurso.slice(0, 8)}
          baseDetalhes={enderecoPrivado('coordenacao/submissao')}
        />
      </section>

      <section className="coordenacao-secao-atalhos">
        <header>
          <div>
            <h2>Gestão acadêmica do curso</h2>
            <p>Acesse rapidamente as configurações e os cadastros sob sua responsabilidade.</p>
          </div>
        </header>
        <div className="coordenacao-categorias">
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
            <section className="coordenacao-categoria" key={titulo}>
              <h3>{titulo}</h3>
              <ul>
                {itens.map(([destino, nome, descricao]) => (
                  <li key={destino}>
                    <a href={enderecoPrivado(`coordenacao/${destino}`)}>
                      <span className="coordenacao-categoria__texto">
                        <strong>{nome}</strong>
                        <small>{descricao}</small>
                      </span>
                      <Icone nome="seta" />
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
