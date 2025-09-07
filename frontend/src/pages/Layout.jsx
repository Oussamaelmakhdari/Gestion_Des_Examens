import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../public/logo.png' // Import logo from src/public

export default function Layout() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role') || ''
  const name = localStorage.getItem('name') || ''
  const stream = localStorage.getItem('stream_id') || ''

  const logout = () => { localStorage.clear(); navigate('/login') }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl transition-colors duration-200 ${
      isActive ? 'bg-blue-700 text-white font-semibold' : 'text-gray-700 hover:bg-blue-100'
    }`

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-gray-50 font-inter">
      {/* Sidebar */}
      <aside className="border-r bg-white p-4 flex flex-col justify-between">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <img src={logo} alt="logo" className="w-12 h-12 rounded-full border-2 border-blue-700"/>
            <div>
              <h1 className="text-xl font-bold text-blue-800">Gestion des Examens</h1>
              <p className="text-xs text-gray-500">Portail universitaire</p>
            </div>
          </div>
          <div className="mb-3 text-sm">
            <span className="badge bg-blue-200 text-blue-800">{role}</span>
            {stream && <span className="badge bg-yellow-200 text-yellow-800 ml-2">{stream}</span>}
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={linkClass}>Tableau de bord</NavLink>
            <NavLink to="/examens" className={linkClass}>Examens</NavLink>
            {role === 'admin' && <NavLink to="/utilisateurs" className={linkClass}>Utilisateurs</NavLink>}
            {role === 'admin' && <NavLink to="/matieres" className={linkClass}>Matières</NavLink>}
            {role === 'admin' && <NavLink to="/salles" className={linkClass}>Salles</NavLink>}
            {role === 'admin' && <NavLink to="/filieres" className={linkClass}>Filières</NavLink>}
          </nav>
        </div>
        <button className="btn w-full bg-red-600 text-white hover:bg-red-700 transition" onClick={logout}>
          Se déconnecter
        </button>
      </aside>

      {/* Main Content */}
      <main className="p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}