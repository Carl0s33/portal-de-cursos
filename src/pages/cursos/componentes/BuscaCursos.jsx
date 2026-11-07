import Icone from '@/shared/componentes/Icone.jsx'
import './busca-cursos.css'

export default function BuscaCursos({ valor, alterar, bloqueado }) {
  return (
    <form className="busca-cursos" role="search" onSubmit={(evento) => evento.preventDefault()}>
      <label className="somente-leitores" htmlFor="busca-cursos">
        Buscar por nome ou sigla do curso
      </label>
      <Icone nome="buscar-cursos" />
      <input
        id="busca-cursos"
        type="search"
        value={valor}
        disabled={bloqueado}
        onChange={(evento) => alterar(evento.target.value)}
        placeholder="Buscar por nome ou sigla do curso..."
        autoComplete="off"
      />
      {valor && (
        <button
          type="button"
          disabled={bloqueado}
          onClick={() => alterar('')}
          aria-label="Limpar termo de busca"
        >
          <Icone nome="limpar-busca-cursos" />
        </button>
      )}
    </form>
  )
}
