import { Fragment } from 'react'

function prepararTrecho(texto, chave) {
  const partes = texto.split(/(\*\*.+?\*\*|\*.+?\*)/g)

  return partes.map((parte, indice) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={`${chave}-${indice}`}>{parte.slice(2, -2)}</strong>
    }
    if (parte.startsWith('*') && parte.endsWith('*')) {
      return <em key={`${chave}-${indice}`}>{parte.slice(1, -1)}</em>
    }
    return <Fragment key={`${chave}-${indice}`}>{parte}</Fragment>
  })
}

function identificarBloco(linha) {
  if (/^#{1,3}\s+/.test(linha)) return 'titulo'
  if (/^\s*(?:[-*•])\s+/.test(linha)) return 'marcadores'
  if (/^\s*\d+[.)]\s+/.test(linha)) return 'numeracao'
  if (/^\s*>\s?/.test(linha)) return 'citacao'
  return 'paragrafo'
}

function conteudoDoBloco(tipo, linhas, chave) {
  if (tipo === 'titulo') {
    const [, nivel, titulo] = linhas[0].match(/^(#{1,3})\s+(.+)$/)
    const Componente = nivel.length === 1 ? 'h3' : 'h4'
    return <Componente key={chave}>{prepararTrecho(titulo, chave)}</Componente>
  }

  if (tipo === 'marcadores' || tipo === 'numeracao') {
    const Componente = tipo === 'marcadores' ? 'ul' : 'ol'
    const padrao = tipo === 'marcadores' ? /^\s*(?:[-*•])\s+/ : /^\s*\d+[.)]\s+/
    return (
      <Componente key={chave}>
        {linhas.map((linha, indice) => (
          <li key={`${chave}-${indice}`}>
            {prepararTrecho(linha.replace(padrao, ''), `${chave}-${indice}`)}
          </li>
        ))}
      </Componente>
    )
  }

  if (tipo === 'citacao') {
    return (
      <blockquote key={chave}>
        {linhas.map((linha, indice) => (
          <p key={`${chave}-${indice}`}>
            {prepararTrecho(linha.replace(/^\s*>\s?/, ''), `${chave}-${indice}`)}
          </p>
        ))}
      </blockquote>
    )
  }

  return (
    <p key={chave}>
      {linhas.map((linha, indice) => (
        <Fragment key={`${chave}-${indice}`}>
          {prepararTrecho(linha, `${chave}-${indice}`)}
          {indice < linhas.length - 1 && <br />}
        </Fragment>
      ))}
    </p>
  )
}

export default function TextoFormatado({ texto = '', className = '' }) {
  const linhas = String(texto).split('\n')
  const blocos = []
  let linhasAtuais = []
  let tipoAtual = ''

  function guardarBloco() {
    if (!linhasAtuais.length) return
    blocos.push(conteudoDoBloco(tipoAtual, linhasAtuais, `bloco-${blocos.length}`))
    linhasAtuais = []
    tipoAtual = ''
  }

  for (const linha of linhas) {
    if (!linha.trim()) {
      guardarBloco()
      continue
    }

    const tipo = identificarBloco(linha)
    if (tipo === 'titulo') {
      guardarBloco()
      tipoAtual = tipo
      linhasAtuais.push(linha)
      guardarBloco()
      continue
    }

    if (tipo === 'marcadores' || tipo === 'numeracao' || tipo === 'citacao') {
      if (tipoAtual !== tipo) guardarBloco()
      tipoAtual = tipo
      linhasAtuais.push(linha)
      continue
    }

    if (tipoAtual !== 'paragrafo') guardarBloco()
    tipoAtual = 'paragrafo'
    linhasAtuais.push(linha)
  }
  guardarBloco()

  return <div className={className}>{blocos}</div>
}
