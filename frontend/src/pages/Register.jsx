import React, { useState, useEffect } from 'react'
import api from '../api'
import { PATHS } from '../config'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../public/logo.png' // Import logo from src/public

export default function Register() {
  const [full_name, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [streamId, setStreamId] = useState('')
  const [streams, setStreams] = useState([])
  const [code_apoge, setCodeApoge] = useState('')
  const [cne, setCne] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(PATHS.streams)
        setStreams(res.data)
        if (res.data.length) setStreamId(res.data[0].id)
      } catch (err) {
        console.error('Erreur chargement filières', err)
      }
    })()
  }, [])

  useEffect(() => { if (role !== 'admin' && streams.length) setStreamId(streams[0].id) }, [role, streams])

  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (role === 'student') {
        await api.post(PATHS.register_student, { full_name, email, password, role, stream_id: Number(streamId), code_apoge, cne })
      } else {
        await api.post(PATHS.register_teacher, { full_name, email, password, role, stream_id: Number(streamId) })
      }
      navigate('/login')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Création du compte impossible.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all hover:shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-blue-200"/>
          <h2 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">Créer un compte</h2>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nom complet</label>
          <input 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
            value={full_name} 
            onChange={e => setFullName(e.target.value)} 
            required 
            placeholder="Entrez votre nom complet"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="Entrez votre email"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            placeholder="Entrez votre mot de passe"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">Rôle</label>
          <select 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
            value={role} 
            onChange={e => setRole(e.target.value)}
          >
            <option value="student">Étudiant</option>
            <option value="teacher">Enseignant</option>
          </select>
        </div>

        {role === 'student' && (
          <>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700">Code Apogée</label>
              <input 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                value={code_apoge} 
                onChange={e => setCodeApoge(e.target.value)} 
                required 
                placeholder="Entrez votre code Apogée"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700">CNE</label>
              <input 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                value={cne} 
                onChange={e => setCne(e.target.value)} 
                required 
                placeholder="Entrez votre CNE"
              />
            </div>
          </>
        )}

        {role !== 'admin' && (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700">Filière</label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
              value={streamId} 
              onChange={e => setStreamId(e.target.value)}
            >
              {streams.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
        
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
          type="submit"
        >
          Créer le compte
        </button>
        
        <p className="text-xs text-gray-600 text-center font-medium">
          Déjà un compte ? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}