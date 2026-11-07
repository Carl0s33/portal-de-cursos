import { enderecoPrivado } from '../../../app/rotas.js'
import Icone from '@/shared/componentes/Icone.jsx'

const grupos = [
  {
    titulo: 'Visão geral',
    itens: [['painel', 'Painel', 'visao-detalhe', 'Resumo do portal']],
  },
  {
    titulo: 'Pessoas',
    itens: [
      ['usuarios', 'Usuários', 'usuario', 'Contas e permissões'],
      ['professores', 'Professores', 'docentes-detalhe', 'Equipe docente'],
    ],
  },
  {
    titulo: 'Estrutura acadêmica',
    itens: [
      ['cursos', 'Cursos', 'formacao-cursos', 'Cursos do portal'],
      ['disciplinas', 'Disciplinas', 'matriz-detalhe', 'Matrizes curriculares'],
      ['campus', 'Campus', 'localizacao', 'Unidades acadêmicas'],
      ['areas', 'Áreas', 'areas-detalhe', 'Áreas do conhecimento'],
      ['projetos', 'Projetos', 'projetos-detalhe', 'Acervo acadêmico'],
    ],
  },
  {
    titulo: 'Acompanhamento',
    itens: [['submissoes', 'Submissões', 'criterios-detalhe', 'Projetos em avaliação']],
  },
  {
    titulo: 'Conta',
    itens: [['perfil', 'Meu perfil', 'usuario', 'Dados de acesso']],
  },
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

export default function NavegacaoAdministracao({ rota, usuario }) {
  const papel = usuario?.tipoUsuario === 'ADMIN' ? 'Administrador' : 'Coordenação'
  return (
    <aside className="painel-navegacao">
      <span className="painel-navegacao__titulo">Administração do portal</span>
      <nav aria-label="Navegação administrativa">
        {grupos.map((grupo) => (
          <section className="painel-navegacao__grupo" key={grupo.titulo}>
            <h2>{grupo.titulo}</h2>
            {grupo.itens.map(([destino, titulo, icone, descricao]) => (
              <a
                key={destino}
                href={enderecoPrivado(`administracao/${destino}`)}
                aria-current={
                  rota === `administracao/${destino}` ||
                  (destino === 'campus' && rota.startsWith('administracao/campus/')) ||
                  (destino === 'painel' && rota === 'administracao')
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
      {usuario && (
        <div className="painel-navegacao__conta">
          <span className="painel-navegacao__avatar" aria-hidden="true">
            {iniciais(usuario.nome)}
          </span>
          <span>
            <strong>{usuario.nome}</strong>
            <small>{papel}</small>
          </span>
        </div>
      )}
    </aside>
  )
}
