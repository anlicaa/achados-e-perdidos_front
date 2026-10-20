import { Routes, Route, Link } from "react-router-dom"
import Header from "./components/Header.jsx"
import Home from "./pages/Home.jsx"
import ItemDetalhe from "./pages/ItemDetalhe.jsx"
import ItemFormulario from "./pages/ItemFormulario.jsx"

export default function App() {
  return (
    <>
      <Header />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetalhe />} />
          <Route path="/novo" element={<ItemFormulario />} />
          <Route path="/editar/:id" element={<ItemFormulario />} />
          <Route
            path="*"
            element={
              <div className="aviso">
                <p>Página não encontrada.</p>
                <Link className="btn" to="/">Ir para a lista</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  )
}
