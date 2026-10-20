import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api.js"

export default function Header() {
  const [dono, setDono] = useState(null)
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await api.get("/eu")
        setDono(data)
      } catch (err) {
        setFalhou(true)
      }
    }
    carregar()
  }, [])

  return (
    <header className="topo">
      <Link to="/" className="marca">
        <span className="furo" aria-hidden="true" />
        Etiqueta
      </Link>
      <p className="saudacao">
        {dono ? (
          <>Olá, <strong>{dono.nome}</strong></>
        ) : falhou ? (
          "Chave não reconhecida"
        ) : (
          "Carregando..."
        )}
      </p>
    </header>
  )
}
