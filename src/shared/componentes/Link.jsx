import Icone from './Icone.jsx'

export default function Link({ destino, children, classe = '', icone = 'seta' }) {
  return (
    <a className={`ligacao ${classe}`} href={destino}>
      {children}
      {icone && <Icone nome={icone} />}
    </a>
  )
}
