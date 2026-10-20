import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api.js"
import { Carregando, Vazio, Erro } from "../components/Estado.jsx"
import StatusSelo from "../components/StatusSelo.jsx"
import { paraLista, paraOpcoes, formatarData, mensagemDeErro } from "../utils/helpers.js"

export default function Home() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  const [busca, setBusca] = useState("")
  const [buscaAplicada, setBuscaAplicada] = useState("")
  const [status, setStatus] = useState("")
  const [categoria, setCategoria] = useState("")
  const [local, setLocal] = useState("")

  const [categorias, setCategorias] = useState([])
  const [locais, setLocais] = useState([])

  // opções dos filtros
  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [c, l] = await Promise.all([api.get("/categorias"), api.get("/locais")])
        setCategorias(paraOpcoes(c.data))
        setLocais(paraOpcoes(l.data))
      } catch (err) {
        // os filtros ficam vazios; o erro principal aparece ao listar
      }
    }
    carregarOpcoes()
  }, [])

  // espera o usuário parar de digitar antes de buscar
  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca.trim()), 350)
    return () => clearTimeout(t)
  }, [busca])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      const params = {}
      if (buscaAplicada) params.busca = buscaAplicada
      if (status) params.status = status
      if (categoria) params.categoria = categoria
      if (local) params.local = local
      const { data } = await api.get("/itens", { params })
      setItens(paraLista(data))
    } catch (err) {
      setErro(mensagemDeErro(err))
      setItens([])
    } finally {
      setCarregando(false)
    }
  }, [buscaAplicada, status, categoria, local])

  useEffect(() => {
    carregar()
  }, [carregar])

  const temFiltro = busca || status || categoria || local

  function limpar() {
    setBusca("")
    setBuscaAplicada("")
    setStatus("")
    setCategoria("")
    setLocal("")
  }

  return (
    <section>
      <div className="titulo-linha">
        <h1>Itens encontrados</h1>
        <Link to="/novo" className="btn primario">+ Novo item</Link>
      </div>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por nome ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar por nome ou descrição"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Todos os status</option>
          <option value="aguardando">Aguardando</option>
          <option value="devolvido">Devolvido</option>
        </select>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={local} onChange={(e) => setLocal(e.target.value)} aria-label="Local">
          <option value="">Todos os locais</option>
          {locais.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {temFiltro && <button className="btn" onClick={limpar}>Limpar filtros</button>}
      </div>

      {carregando ? (
        <Carregando />
      ) : erro ? (
        <Erro texto={erro} onTentar={carregar} />
      ) : itens.length === 0 ? (
        <Vazio />
      ) : (
        <ul className="lista">
          {itens.map((item) => (
            <li key={item.id}>
              <Link to={`/item/${item.id}`} className={`etiqueta ${item.status}`}>
                <span className="furo" aria-hidden="true" />
                <div className="etiqueta-corpo">
                  <h2>{item.nome}</h2>
                  <p className="meta">{item.categoria} · {item.local}</p>
                  <p className="meta">Encontrado em {formatarData(item.data_encontrado)}</p>
                </div>
                <StatusSelo status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
