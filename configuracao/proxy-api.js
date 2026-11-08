export function criarProxyApi(ambiente) {
  const destinoGateway = ambiente.GATEWAY_API_URL || 'http://127.0.0.1:8765'
  return { '/api': { target: destinoGateway, changeOrigin: true } }
}
