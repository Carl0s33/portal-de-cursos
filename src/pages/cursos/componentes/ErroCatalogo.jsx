import EstadoErro from '@/shared/componentes/EstadoErro.jsx'

export default function ErroCatalogo({ tentarNovamente }) {
  return (
    <EstadoErro
      titulo="Não foi possível carregar os cursos"
      mensagem="Confira sua conexão e tente novamente. Seus filtros serão mantidos."
      aoTentarNovamente={tentarNovamente}
    />
  )
}
