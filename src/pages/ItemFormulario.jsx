import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../services/api.js"
import { Carregando, Erro } from "../components/Estado.jsx"
import { paraOpcoes, mensagemDeErro } from "../utils/helpers.js"

const vazio = { nome: "", descricao: "", categoria: "", local: "", data_encontrado: "" }

export default function ItemFormulario() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const timer = useRef(null)

  const [form, setForm] = useState(vazio)
  const [categorias, setCategorias] = useState([])
  const [locais, setLocais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState("")
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setErroCarga("")
      try {
        const [c, l] = await Promise.all([api.get("/categorias"), api.get("/locais")])
        setCategorias(paraOpcoes(c.data))
        setLocais(paraOpcoes(l.data))
        if (editando) {
          const { data } = await api.get(`/itens/${id}`)
          setForm({
            nome: data.nome ?? "",
            descricao: data.descricao ?? "",
            categoria: data.categoria ?? "",
            local: data.local ?? "",
            data_encontrado: (data.data_encontrado ?? "").slice(0, 10)
          })
        } else {
          setForm(vazio)
        }
      } catch (err) {
        setErroCarga(mensagemDeErro(err))
      } finally {
        setCarregando(false)
      }
    }
    carregar()
    return () => clearTimeout(timer.current)
  }, [id, editando])

  function alterar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function salvar(e) {
    e.preventDefault()
    setErro("")
    setSucesso("")

    if (!form.nome.trim() || !form.categoria || !form.local || !form.data_encontrado) {
      setErro("Preencha nome, categoria, local e a data em que foi encontrado.")
      return
    }

    const corpo = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      local: form.local,
      data_encontrado: form.data_encontrado
    }

    setEnviando(true)
    try {
      const resposta = editando
        ? await api.put(`/itens/${id}`, corpo)
        : await api.post("/itens", corpo)
      setSucesso(editando ? "Item atualizado com sucesso." : "Item cadastrado com sucesso.")
      const destino = resposta.data?.id ? `/item/${resposta.data.id}` : "/"
      timer.current = setTimeout(() => navigate(destino), 900)
    } catch (err) {
      setErro(mensagemDeErro(err))
      setEnviando(false)
    }
  }

  if (carregando) return <Carregando texto="Carregando formulário..." />
  if (erroCarga) return <Erro texto={erroCarga} />

  return (
    <section>
      <h1>{editando ? "Editar item" : "Novo item"}</h1>

      <form className="formulario" onSubmit={salvar}>
        <label>
          Nome
          <input name="nome" value={form.nome} onChange={alterar} />
        </label>

        <label>
          Descrição
          <textarea name="descricao" rows="4" value={form.descricao} onChange={alterar} />
        </label>

        <div className="duas-colunas">
          <label>
            Categoria
            <select name="categoria" value={form.categoria} onChange={alterar}>
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label>
            Local
            <select name="local" value={form.local} onChange={alterar}>
              <option value="">Selecione...</option>
              {locais.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <label>
          Data em que foi encontrado
          <input type="date" name="data_encontrado" value={form.data_encontrado} onChange={alterar} />
        </label>

        {erro && <p className="msg erro" role="alert">{erro}</p>}
        {sucesso && <p className="msg ok" role="status">{sucesso}</p>}

        <div className="acoes">
          <button className="btn primario" type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Salvar"}
          </button>
          <Link className="btn" to={editando ? `/item/${id}` : "/"}>Cancelar</Link>
        </div>
      </form>
    </section>
  )
}
