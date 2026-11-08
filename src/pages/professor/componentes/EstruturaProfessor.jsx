import Rodape from '@/shared/componentes/Rodape.jsx'
import './estrutura-professor.css'
import Cabecalho from '@/shared/componentes/Cabecalho.jsx'
import NavegacaoAdministracao from '@/pages/administracao/componentes/NavegacaoAdministracao.jsx'
import NavegacaoCoordenacao from '@/pages/coordenacao/componentes/NavegacaoCoordenacao.jsx'

export default function EstruturaProfessor({
  usuario,
  aoSair,
  tema,
  alternarTema,
  children,
  perfilAtivo = false,
  rota = 'professor',
  administrador = false,
  coordenador = false,
  aluno = false,
}) {
  const destinoArea = administrador
    ? 'administracao/painel'
    : coordenador
      ? 'coordenacao/painel'
      : aluno
        ? 'aluno/painel'
        : 'professor/feed'
  const destinoPerfil = administrador
    ? 'administracao/perfil'
    : coordenador
      ? 'coordenacao/perfil'
      : aluno
        ? 'aluno/perfil'
        : 'professor/perfil'
  return (
    <div
      className={`area-professor ${usuario ? 'area-professor--conectada' : 'area-professor--entrada'}`}
    >
      {usuario ? (
        <Cabecalho
          areaProfessor
          autenticado
          pagina={
            perfilAtivo
              ? 'perfil'
              : administrador
                ? 'administracao'
                : coordenador
                  ? 'coordenacao'
                  : aluno
                    ? 'aluno-painel'
                    : 'professor'
          }
          tipoUsuario={
            administrador ? 'ADMIN' : coordenador ? 'COORDENADOR' : aluno ? 'ALUNO' : 'PROFESSOR'
          }
          usuario={usuario}
          tema={tema}
          alternarTema={alternarTema}
          aoSair={aoSair}
          destinoArea={destinoArea}
          destinoPerfil={destinoPerfil}
        />
      ) : (
        <Cabecalho modoAcesso tema={tema} alternarTema={alternarTema} pagina="acesso" />
      )}
      {usuario && (administrador || coordenador) ? (
        <div
          className={
            coordenador ? 'painel-estrutura painel-estrutura--coordenacao' : 'painel-estrutura'
          }
        >
          {administrador ? (
            <NavegacaoAdministracao rota={rota} usuario={usuario} />
          ) : (
            <NavegacaoCoordenacao rota={rota} usuario={usuario} />
          )}
          <div className="painel-estrutura__conteudo">{children}</div>
        </div>
      ) : (
        children
      )}
      {!usuario && <Rodape pagina="acesso" />}
    </div>
  )
}
