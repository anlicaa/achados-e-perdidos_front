import { Link } from "react-router-dom"

export function Carregando({ texto = "Carregando itens..." }) {
  return (
    <div className="aviso" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  )
}

export function Vazio({ texto = "Nenhum item encontrado." }) {
  return (
    <div className="aviso">
      <p>{texto}</p>
      <Link className="btn" to="/novo">Cadastrar um item</Link>
    </div>
  )
}

export function Erro({ texto, onTentar }) {
  return (
    <div className="aviso erro" role="alert">
      <p>{texto}</p>
      {onTentar && (
        <button className="btn" onClick={onTentar}>Tentar de novo</button>
      )}
    </div>
  )
}
