import { ordenarSubmissoes } from '@/shared/utils/ordenarSubmissoes.js'
import Indicadores from '@/shared/componentes/Indicadores.jsx'
import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import { basePortal, enderecoPrivado } from '../../app/rotas.js'
import Icone from '@/shared/componentes/Icone.jsx'
import TabelaSubmissoes from '@/pages/administracao/componentes/TabelaSubmissoes.jsx'
import GestaoConteudos from '@/pages/administracao/componentes/GestaoConteudos.jsx'
import GestaoProfessores from '@/pages/administracao/componentes/GestaoProfessores.jsx'
import { filtrarContextoCoordenacao } from './servicos/filtrarContextoCoordenacao.js'
import '@/shared/styles/painel.css'
import './coordenacao.css'

export default function PaginaCoordenacao({ secao, sessao, rascunhos, aoAlterar, submissoes }) {
  const [cursos, mudarCursos] = useState([])
  useEffect(() => {
    const controller = new AbortController()
    listarCursos(controller.signal)
      .then((registros) => {
        if (!controller.signal.aborted) mudarCursos(registros)
      })
      .catch(() => {
        if (!controller.signal.aborted) mudarCursos([])
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
            restritoAoCurso
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
          restritoAoCurso
          dominio="disciplinas"
          itens={rascunhos.disciplinas}
          cursos={cursosDaCoordenacao}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar('disciplinas', itens)}
          cursoId={curso?.id || cursoId}
          curso={curso}
        />
      </main>
    )

  if (secao === 'projetos')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoConteudos
          restritoAoCurso
          dominio="projetos"
          itens={rascunhos.projetos}
          cursos={cursosDaCoordenacao}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar('projetos', itens)}
          cursoId={curso?.id || cursoId}
          curso={curso}
        />
      </main>
    )

  if (secao === 'submissoes')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <header className="painel-titulo coordenacao-boas-vindas">
          <div>
            <h1>Submissões do curso</h1>
            <p>Avalie as submissões aceitas pelos orientadores e decida sobre a publicação.</p>
          </div>
          <div className="coordenacao-boas-vindas__acoes">
            <a className="botao-primario" href={`${basePortal}#submeter`}>
              Enviar projeto
            </a>
          </div>
        </header>
        <section
          className="painel-secao coordenacao-registros coordenacao-lista"
          aria-labelledby="coordenacao-lista-titulo"
        >
          <header>
            <h2 id="coordenacao-lista-titulo">Todas as submissões</h2>
            <span className="coordenacao-lista__total">
              {submissoesDoCurso.length}{' '}
              {submissoesDoCurso.length === 1 ? 'submissão' : 'submissões'}
            </span>
          </header>
          <TabelaSubmissoes
            itens={ordenarSubmissoes(submissoesDoCurso)}
            baseDetalhes={enderecoPrivado('coordenacao/submissao')}
            ocultarCurso
          />
        </section>
      </main>
    )

  return (
    <main id="conteudo" className="pagina-painel pagina-painel--administracao coordenacao-painel">
      <header className="painel-titulo coordenacao-boas-vindas">
        <div>
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
            Enviar projeto
          </a>
        </div>
      </header>

      <Indicadores
        itens={[
          {
            titulo: 'Total de submissões',
            valor: indicadores.total,
            icone: 'projetos-detalhe',
            tom: 'primario',
          },
          {
            titulo: 'Em análise na coordenação',
            valor: indicadores.emAnaliseCoord,
            icone: 'relogio-cursos',
            tom: 'pendente',
          },
          {
            titulo: 'Aguardando orientador',
            valor: indicadores.aguardandoOrientador,
            icone: 'docentes-detalhe',
            tom: 'andamento',
          },
          {
            titulo: 'Publicados no portal',
            valor: indicadores.publicados,
            icone: 'confirmacao-cursos',
            tom: 'sucesso',
          },
        ]}
      />

      <section className="painel-secao coordenacao-registros coordenacao-fila">
        <header>
          <div>
            <h2>Aguardando minha avaliação</h2>
            <p>Decida sobre a publicação dos trabalhos encaminhados à coordenação.</p>
          </div>
          {indicadores.emAnaliseCoord > 0 && (
            <a href={enderecoPrivado('coordenacao/submissoes')}>Ver todas as submissões</a>
          )}
        </header>
        <TabelaSubmissoes
          itens={ordenarSubmissoes(submissoesDoCurso)
            .filter((item) => item.status === 'Aguardando Coordenação')
            .slice(0, 8)}
          baseDetalhes={enderecoPrivado('coordenacao/submissao')}
          ocultarCurso
          textoVazio="Nenhuma submissão para avaliar."
          acaoVaziaHref={enderecoPrivado('coordenacao/submissoes')}
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
