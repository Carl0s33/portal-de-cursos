import './skeleton.css'

export default function Skeleton({ largura = '100%', altura = '20px', raio = '10px', estilo = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width: largura,
        height: altura,
        borderRadius: raio,
        ...estilo,
      }}
      aria-hidden="true"
    />
  )
}
