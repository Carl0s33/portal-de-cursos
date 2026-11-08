import Icone from '@/shared/componentes/Icone.jsx'
import './filtros-ativos.css'

const rotulos = {
  busca: 'Termo',
  grau: 'Grau',
  modalidade: 'Modalidade',
  campus: 'Campus',
  areas: 'Área',
  turnos: 'Turno',
  duracoes: 'Duração',
}

export default function FiltrosAtivos({ filtros, alterar, limpar }) {
  const ativos = Object.entries(filtros).flatMap(([campo, valor]) =>
    (Array.isArray(valor) ? valor : valor ? [valor] : []).map((item) => ({ campo, valor: item })),
  )
  if (!ativos.length) return null
  return (
    <div className="filtros-ativos">
      <span>
        <Icone nome="filtros-ativos-cursos" />
        Filtros ativos:
      </span>
      {ativos.map(({ campo, valor }) => (
        <button
          key={`${campo}-${valor}`}
          onClick={() =>
            alterar(
              campo,
              Array.isArray(filtros[campo]) ? filtros[campo].filter((item) => item !== valor) : '',
            )
          }
          aria-label={`Remover filtro ${rotulos[campo]}: ${valor}`}
        >
          {rotulos[campo]}: {valor}
          <Icone nome={campo === 'busca' ? 'remover-termo-cursos' : 'remover-filtro-cursos'} />
        </button>
      ))}
      <button className="filtros-ativos__redefinir" onClick={limpar}>
        <Icone nome="redefinir-cursos" />
        Redefinir busca
      </button>
    </div>
  )
}
