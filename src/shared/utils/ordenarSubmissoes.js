const prioridades = {
  'Aguardando Orientador': 0,
  EM_ANALISE: 0,
  'Em análise': 1,
  ANALISE_PUBLICACAO: 1,
  Aceito: 2,
  Aprovado: 2,
  Publicado: 2,
  APROVADO: 2,
  PUBLICADO: 2,
  Recusado: 3,
  RECUSADO: 3,
  RECUSADO_PUBLICACAO: 3,
}

function dataDeChegada(item) {
  const data = item.dataEnvio || item.dataCriacao || item.criadoEm || item.dataInicio
  if (data) {
    const instante = Date.parse(data)
    if (Number.isFinite(instante)) return instante
  }
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(item.enviadoEm || '')
  return partes ? Date.UTC(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])) : Infinity
}

// Cria uma nova lista: prioridade, chegada e posição original como desempate.
export function ordenarSubmissoes(itens = []) {
  return itens
    .map((item, indice) => ({ item, indice, data: dataDeChegada(item) }))
    .sort((a, b) => {
      const prioridade = (prioridades[a.item.status] ?? 1) - (prioridades[b.item.status] ?? 1)
      if (prioridade) return prioridade
      if (a.data !== b.data) return a.data < b.data ? -1 : 1
      return a.indice - b.indice
    })
    .map(({ item }) => item)
}
