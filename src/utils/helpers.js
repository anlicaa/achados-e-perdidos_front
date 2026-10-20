// Converte a lista devolvida pela API em array, seja qual for o formato
export function paraLista(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.itens)) return data.itens
  if (data && Array.isArray(data.items)) return data.items
  return []
}

// Opções de <select>: aceita strings ou objetos com nome
export function paraOpcoes(data) {
  return paraLista(data).map((o) =>
    typeof o === "string" ? o : o.nome ?? o.name ?? String(o.id)
  )
}

export function formatarData(iso) {
  if (!iso) return "—"
  const [a, m, d] = String(iso).slice(0, 10).split("-")
  return `${d}/${m}/${a}`
}

// Traduz erros do Axios em mensagens para o usuário
export function mensagemDeErro(err) {
  if (err.response) {
    const { status, data } = err.response
    if (status === 401) return "Chave de acesso ausente ou inválida. Verifique o arquivo .env."
    if (status === 404) return "Item não encontrado."
    if (status === 422) {
      const d = data?.detail
      if (Array.isArray(d)) return d.map((e) => e.msg || JSON.stringify(e)).join(" · ")
      if (typeof d === "string") return d
      return "Dados inválidos."
    }
    return data?.detail && typeof data.detail === "string"
      ? data.detail
      : `Erro ${status} ao falar com a API.`
  }
  return "Não foi possível conectar à API. Verifique sua conexão."
}
