import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import { listarProjetos } from '@/api/projetos.js'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import Ligacao from '@/shared/components/Ligacao.jsx'

export default function ProjetosEmDestaque() {
  const [projetos, definirProjetos] = useState([])
  const [estado, definirEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    Promise.all([
      listarProjetos(null, controle.signal),
      listarCursos(controle.signal).catch(() => []),
    ])
      .then(([dados, cursos]) => {
        if (controle.signal.aborted) return
        const mapaCursos = new Map(
          (Array.isArray(cursos) ? cursos : []).map((c) => [
            String(c.id),
            c.sigla || c.acronimo || c.nome,
          ]),
        )
        const publicados = (Array.isArray(dados) ? dados : [])
          .filter((p) => !p.statusProjeto || p.statusProjeto === 'PUBLICADO')
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            identificador: String(p.id),
            nome: p.nome,
            descricao: p.descricao || p.resumo,
            tipo:
              p.tipoProjeto === 'TCC'
                ? 'TCC'
                : p.tipoProjeto === 'PROJETO_INTEGRADOR'
                  ? 'Projeto Integrador'
                  : p.tipoProjeto === 'PROJETO_PESQUISA'
                    ? 'Pesquisa'
                    : p.tipoProjeto === 'PROJETO_EXTENSAO'
                      ? 'Extensão'
                      : p.tipoProjeto || 'Projeto',
            curso: mapaCursos.get(String(p.cursoId)) || (p.cursoId ? `#${p.cursoId}` : ''),
            orientador: (() => {
              if (p.orientador) return p.orientador
              const orientador = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
              if (orientador?.nome) return orientador.nome
              if (orientador?.professorId) return `Prof. #${orientador.professorId}`
              return 'Orientação acadêmica'
            })(),
          }))
        definirProjetos(publicados)
        definirEstado('pronto')
      })
      .catch(() => {
        if (!controle.signal.aborted) definirEstado('pronto')
      })
    return () => controle.abort()
  }, [])

  return (
    <section id="projetos" className="secao" aria-labelledby="titulo-projetos">
      <div className="secao__cabecalho">
        <div>
          <h2 id="titulo-projetos">O conhecimento ganha forma aqui</h2>
          <p>Conheça trabalhos aprovados e desenvolvidos ao longo da formação.</p>
        </div>
        <Ligacao destino="#projetos">Explorar biblioteca de projetos</Ligacao>
      </div>
      {estado === 'carregando' ? (
        <div className="painel-vazio painel-vazio--caixa">
          <p role="status">Carregando produções acadêmicas…</p>
        </div>
      ) : projetos.length > 0 ? (
        <div className="lista-projetos">
          {projetos.map((projeto) => (
            <ItemProjeto key={projeto.identificador} projeto={projeto} />
          ))}
        </div>
      ) : (
        <div className="painel-vazio painel-vazio--caixa">
          <p>Os trabalhos aprovados pela coordenação aparecerão aqui assim que forem publicados.</p>
          <a className="botao-secundario botao--pequeno" href="#submeter">
            Submeter produção acadêmica
          </a>
        </div>
      )}
    </section>
  )
}
