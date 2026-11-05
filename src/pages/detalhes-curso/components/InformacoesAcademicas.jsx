import { useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import './informacoes-academicas.css'

export default function InformacoesAcademicas({ curso }) {
  const itens = curso.grade || []
  const [filtroTipo, definirFiltroTipo] = useState('todos') // 'todos' | 'obrigatorias' | 'optativas'

  const obrigatorias = itens.filter((d) => d.obrigatoria)
  const optativas = itens.filter((d) => !d.obrigatoria)

  // Agrupamento por semestre para obrigatórias
  const semestres = [...new Set(obrigatorias.map((d) => d.semestre || 1))].sort((a, b) => a - b)

  const cargaTotalObrigatoria = obrigatorias.reduce((acc, d) => acc + (Number(d.cargaHoraria) || 0), 0)
  const cargaTotalOptativa = optativas.reduce((acc, d) => acc + (Number(d.cargaHoraria) || 0), 0)

  return (
    <section className="bloco-detalhe informacoes-academicas">
      <header className="informacoes-academicas__cabecalho">
        <div>
          <h2>Matriz Curricular e Disciplinas</h2>
          <p>
            Estrutura curricular de {curso.nome} organizada por semestre e modalidades formativas.
          </p>
        </div>

        <div className="informacoes-academicas__resumo-metricas">
          <span className="informacoes-academicas__secao-tag-obrigatoria">
            {obrigatorias.length} Obrigatórias ({cargaTotalObrigatoria}h)
          </span>
          <span className="informacoes-academicas__secao-tag-optativa">
            {optativas.length} Optativas ({cargaTotalOptativa}h)
          </span>
        </div>
      </header>

      {itens.length > 0 ? (
        <>
          <nav className="informacoes-academicas__filtro-abas" aria-label="Filtrar por natureza da disciplina">
            <button
              type="button"
              className={`informacoes-academicas__botao-filtro ${filtroTipo === 'todos' ? 'informacoes-academicas__botao-filtro--ativo' : ''}`}
              onClick={() => definirFiltroTipo('todos')}
            >
              Todas as disciplinas
              <span className="informacoes-academicas__contador">{itens.length}</span>
            </button>
            <button
              type="button"
              className={`informacoes-academicas__botao-filtro ${filtroTipo === 'obrigatorias' ? 'informacoes-academicas__botao-filtro--ativo' : ''}`}
              onClick={() => definirFiltroTipo('obrigatorias')}
            >
              Componentes Obrigatórios
              <span className="informacoes-academicas__contador">{obrigatorias.length}</span>
            </button>
            <button
              type="button"
              className={`informacoes-academicas__botao-filtro ${filtroTipo === 'optativas' ? 'informacoes-academicas__botao-filtro--ativo' : ''}`}
              onClick={() => definirFiltroTipo('optativas')}
            >
              Componentes Optativos
              <span className="informacoes-academicas__contador">{optativas.length}</span>
            </button>
          </nav>

          {/* Seção Obrigatórias */}
          {(filtroTipo === 'todos' || filtroTipo === 'obrigatorias') && (
            <div className="informacoes-academicas__secao-grupo">
              <div className="informacoes-academicas__secao-titulo">
                <h3>
                  <Icone nome="grau-detalhe" />
                  Disciplinas Obrigatórias
                </h3>
                <span className="informacoes-academicas__secao-tag-obrigatoria">
                  Formação Nuclear · {obrigatorias.length} disciplinas
                </span>
              </div>

              {semestres.map((semestre) => {
                const disciplinasDoSemestre = obrigatorias.filter((d) => (d.semestre || 1) === semestre)
                if (disciplinasDoSemestre.length === 0) return null
                return (
                  <div key={semestre} className="informacoes-academicas__semestre-bloco">
                    <h4 style={{ margin: '8px 0 12px', fontSize: '14px', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {semestre}º Semestre
                    </h4>
                    <div className="informacoes-academicas__grade-grid">
                      {disciplinasDoSemestre.map((item, idx) => (
                        <article
                          key={item.id || item.codigo || idx}
                          className="cartao-disciplina cartao-disciplina--obrigatoria"
                        >
                          <div className="cartao-disciplina__topo">
                            {item.codigo && (
                              <span className="cartao-disciplina__codigo">{item.codigo}</span>
                            )}
                            <span className="cartao-disciplina__semestre">{semestre}º Semestre</span>
                          </div>

                          <h5 className="cartao-disciplina__nome">{item.nome}</h5>

                          {item.descricao && (
                            <p className="cartao-disciplina__descricao">{item.descricao}</p>
                          )}

                          <div className="cartao-disciplina__rodape">
                            <span className="cartao-disciplina__carga">
                              {item.cargaHoraria ? `${item.cargaHoraria} horas` : 'Carga a informar'}
                            </span>
                            <span className="cartao-disciplina__badge">Obrigatória</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Seção Optativas */}
          {(filtroTipo === 'todos' || filtroTipo === 'optativas') && (
            <div className="informacoes-academicas__secao-grupo" style={{ marginTop: filtroTipo === 'todos' ? '24px' : '0' }}>
              <div className="informacoes-academicas__secao-titulo">
                <h3>
                  <Icone nome="laboratorio" />
                  Disciplinas Optativas e Eletivas
                </h3>
                <span className="informacoes-academicas__secao-tag-optativa">
                  Formação Complementar · {optativas.length} disciplinas
                </span>
              </div>

              {optativas.length > 0 ? (
                <div className="informacoes-academicas__grade-grid">
                  {optativas.map((item, idx) => (
                    <article
                      key={item.id || item.codigo || idx}
                      className="cartao-disciplina cartao-disciplina--optativa"
                    >
                      <div className="cartao-disciplina__topo">
                        {item.codigo && (
                          <span className="cartao-disciplina__codigo">{item.codigo}</span>
                        )}
                        <span className="cartao-disciplina__semestre">
                          {item.semestre ? `${item.semestre}º Semestre` : 'Eletiva'}
                        </span>
                      </div>

                      <h5 className="cartao-disciplina__nome">{item.nome}</h5>

                      {item.descricao && (
                        <p className="cartao-disciplina__descricao">{item.descricao}</p>
                      )}

                      <div className="cartao-disciplina__rodape">
                        <span className="cartao-disciplina__carga">
                          {item.cargaHoraria ? `${item.cargaHoraria} horas` : 'Carga a informar'}
                        </span>
                        <span className="cartao-disciplina__badge">Optativa</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="informacoes-academicas__vazio" style={{ margin: '20px 0' }}>
                  <p>Nenhuma disciplina optativa cadastrada nesta matriz até o momento.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="informacoes-academicas__vazio">
          <h3>A matriz curricular ainda não está disponível</h3>
          <p>
            As disciplinas, cargas horárias e semestres serão exibidos após o cadastro da matriz
            curricular do curso.
          </p>
          <a className="botao-secundario" href={`#curso/${curso.identificador}`}>
            Voltar à visão geral
          </a>
        </div>
      )}
    </section>
  )
}
