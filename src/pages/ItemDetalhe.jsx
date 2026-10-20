import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../services/api.js"
import { Carregando, Erro } from "../components/Estado.jsx"
import StatusSelo from "../components/StatusSelo.jsx"
import { formatarData, mensagemDeErro } from "../utils/helpers.js"

export default function ItemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [devolvidoPara, setDevolvidoPara] = useState("")
  const [acaoErro, setAcaoErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      const { data } = await api.get(`/itens/${id}`)
      setItem(data)
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function devolver(e) {
    e.preventDefault()
    setAcaoErro("")
    if (!devolvidoPara.trim()) {
      setAcaoErro("Informe o nome de quem recebeu o item.")
      return
    }
    setEnviando(true)
    try {
      await api.patch(`/itens/${id}/devolver`, { devolvido_para: devolvidoPara.trim() })
      setDevolvidoPara("")
      await carregar()
    } catch (err) {
      setAcaoErro(mensagemDeErro(err))
    } finally {
      setEnviando(false)
    }
  }

  async function excluir() {
    setAcaoErro("")
    setEnviando(true)
    try {
      await api.delete(`/itens/${id}`)
      navigate("/")
    } catch (err) {
      setAcaoErro(mensagemDeErro(err))
      setConfirmandoExclusao(false)
      setEnviando(false)
    }
  }

  if (carregando) return <Carregando texto="Carregando item..." />
  if (erro) {
    return (
      <>
        <Link to="/" className="voltar">← Voltar</Link>
        <Erro texto={erro} onTentar={carregar} />
      </>
    )
  }

  return (
    <section>
      <Link to="/" className="voltar">← Voltar</Link>

      <article className={`ficha ${item.status}`}>
        <span className="furo" aria-hidden="true" />
        <div className="ficha-topo">
          <h1>{item.nome}</h1>
          <StatusSelo status={item.status} />
        </div>

        <dl className="campos">
          <dt>Descrição</dt>
          <dd>{item.descricao || "—"}</dd>
          <dt>Categoria</dt>
          <dd>{item.categoria}</dd>
          <dt>Local</dt>
          <dd>{item.local}</dd>
          <dt>Encontrado em</dt>
          <dd>{formatarData(item.data_encontrado)}</dd>
          {item.status === "devolvido" && (
            <>
              <dt>Devolvido para</dt>
              <dd>{item.devolvido_para}</dd>
              <dt>Devolvido em</dt>
              <dd>{formatarData(item.data_devolucao)}</dd>
            </>
          )}
        </dl>

        <div className="acoes">
          <Link to={`/editar/${item.id}`} className="btn">Editar</Link>
          {!confirmandoExclusao && (
            <button className="btn perigo" onClick={() => setConfirmandoExclusao(true)}>
              Excluir
            </button>
          )}
        </div>

        {confirmandoExclusao && (
          <div className="confirmacao" role="alertdialog" aria-label="Confirmar exclusão">
            <p>Tem certeza que deseja excluir?</p>
            <div className="acoes">
              <button className="btn perigo cheio" onClick={excluir} disabled={enviando}>
                Excluir
              </button>
              <button className="btn" onClick={() => setConfirmandoExclusao(false)} disabled={enviando}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {item.status === "aguardando" && (
          <form className="devolver" onSubmit={devolver}>
            <label htmlFor="recebeu">Marcar como devolvido</label>
            <div className="devolver-linha">
              <input
                id="recebeu"
                type="text"
                placeholder="Nome de quem recebeu"
                value={devolvidoPara}
                onChange={(e) => setDevolvidoPara(e.target.value)}
              />
              <button className="btn primario" type="submit" disabled={enviando}>
                Confirmar
              </button>
            </div>
          </form>
        )}

        {acaoErro && <p className="msg erro" role="alert">{acaoErro}</p>}
      </article>
    </section>
  )
}
