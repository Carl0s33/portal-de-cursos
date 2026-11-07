import { enderecoPrivado } from '../../../app/rotas.js'
import Icone from '@/shared/componentes/Icone.jsx'

const grupos = [
  { titulo: 'Visão geral', itens: [['painel', 'Painel', 'visao-detalhe', 'Resumo do curso']] },
  {
    titulo: 'Meu curso',
    itens: [
      ['curso', 'Dados do curso', 'formacao-cursos', 'Informações e apresentação'],
      ['disciplinas', 'Disciplinas', 'matriz-detalhe', 'Matriz curricular'],
      ['professores', 'Professores', 'docentes-detalhe', 'Equipe docente'],
      ['projetos', 'Projetos', 'projetos-detalhe', 'Produção acadêmica'],
    ],
  },
  {
    titulo: 'Avaliação',
    itens: [['submissoes', 'Submissões', 'criterios-detalhe', 'Analisar projetos']],
  },
  { titulo: 'Conta', itens: [['perfil', 'Meu perfil', 'usuario', 'Dados de acesso']] },
]

function iniciais(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toLocaleUpperCase('pt-BR')
}

export default function NavegacaoCoordenacao({ rota, usuario }) {
  return (
    <aside className="painel-navegacao">
      <span className="painel-navegacao__titulo">Coordenação do curso</span>
      <nav aria-label="Navegação da coordenação">
        {grupos.map((grupo) => (
          <section className="painel-navegacao__grupo" key={grupo.titulo}>
            <h2>{grupo.titulo}</h2>
            {grupo.itens.map(([destino, titulo, icone, descricao]) => (
              <a
                key={destino}
                href={enderecoPrivado(`coordenacao/${destino}`)}
                aria-current={
                  rota === `coordenacao/${destino}` ||
                  (destino === 'painel' && rota === 'coordenacao')
                    ? 'page'
                    : undefined
                }
              >
                <span className="painel-navegacao__icone" aria-hidden="true">
                  <Icone nome={icone} />
                </span>
                <span className="painel-navegacao__texto">
                  <strong>{titulo}</strong>
                  <small>{descricao}</small>
                </span>
              </a>
            ))}
          </section>
        ))}
      </nav>
      {usuario ? (
        <div className="painel-navegacao__conta">
          <span className="painel-navegacao__avatar" aria-hidden="true">
            {iniciais(usuario.nome)}
          </span>
          <span>
            <strong>{usuario.nome}</strong>
            <small>Coordenação</small>
          </span>
        </div>
      ) : (
        <p className="painel-navegacao__nota">Gestão e avaliação do seu curso</p>
      )}
    </aside>
  )
}
