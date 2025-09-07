
import React, { useState } from 'react'
import api from '../api'
import { PATHS } from '../config'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../public/logo.png' // Import logo from src/public

export default function Login() {
  const [email, setEmail] = useState('') // Empty initial state
  const [password, setPassword] = useState('') // Empty initial state
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await api.post(PATHS.login, { email, password })
      const token = res.data?.access_token
      if (!token) throw new Error('Token missing')
      localStorage.setItem('token', token)

      try {
        const me = await api.get('/auth/me')
        localStorage.setItem('role', me.data.role)
        localStorage.setItem('stream_id', me.data.stream_id || '')
        localStorage.setItem('name', me.data.full_name || me.data.name || '')
        localStorage.setItem('user_id', me.data.id || '')
      } catch (err) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
          localStorage.setItem('role', payload.role || '')
          localStorage.setItem('name', payload.sub || '')
        } catch(e) {}
      }

      navigate('/')
    } catch (err) {
      setError('Identifiants invalides.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all hover:shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-blue-200"/>
          <h2 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">Gestion des Examens</h2>
        </div>
        <p className="text-sm text-gray-600 text-center font-medium">Connectez-vous pour accéder au portail.</p>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Entrez votre email"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
        
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
          type="submit"
        >
          Se connecter
        </button>
        
        <p className="text-xs text-gray-600 text-center font-medium">
          Pas de compte ? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">Créer un compte</Link>
        </p>
      </form>
    </div>
  )
}
