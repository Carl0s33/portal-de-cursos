import EstadoVazio from '@/shared/components/EstadoVazio.jsx'
import CartaoCatalogo from './CartaoCatalogo.jsx'
import './estados-catalogo.css'

export default function CatalogoVazio({ limpar, cursos }) {
  return (
    <>
      <EstadoVazio
        titulo="Nenhum curso encontrado"
        descricao="Confira o nome pesquisado ou limpe os filtros para consultar todas as formações disponíveis."
        acao="Limpar filtros"
        aoAcionar={limpar}
      />
      {cursos.length > 0 && (
        <section className="sugestoes-catalogo" aria-labelledby="titulo-sugestoes">
          <h2 id="titulo-sugestoes">Cursos em destaque</h2>
          <p>Conheça outras possibilidades de formação.</p>
          <div className="grade-catalogo">
            {cursos.slice(0, 2).map((curso) => (
              <CartaoCatalogo key={curso.identificador} curso={curso} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
