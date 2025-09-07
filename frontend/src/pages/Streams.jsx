import React, { useEffect, useState } from 'react'
import api from '../api'
import { PATHS } from '../config'
import logo from '../public/logo.png' // Import logo from src/public

export default function Streams() {
  const [streams, setStreams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '' })
  const [editingId, setEditingId] = useState(null)

  const loadStreams = async () => {
    try {
      const res = await api.get(PATHS.streams)
      setStreams(res.data)
    } catch (err) {
      console.error('Erreur lors du chargement des filières :', err)
    }
  }

  useEffect(() => { loadStreams() }, [])

  const addStream = async () => {
    try {
      await api.post(PATHS.streams, form)
      setForm({ nom: '' })
      setShowForm(false)
      loadStreams()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la création')
    }
  }

  const updateStream = async () => {
    try {
      await api.put(`${PATHS.streams}${editingId}`, form)
      setForm({ nom: '' })
      setEditingId(null)
      setShowForm(false)
      loadStreams()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  const edit = (s) => { setForm({ nom: s.nom }); setEditingId(s.id); setShowForm(true) }

  const remove = async (id) => {
    if (!confirm('Supprimer cette filière ?')) return
    try { 
      await api.delete(`${PATHS.streams}${id}`); 
      loadStreams() 
    } catch (err) { 
      console.error(err); 
      alert(err.response?.data?.detail || 'Erreur') 
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-blue-200"/>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Filières</h2>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ nom: '' }) }}
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Streams List */}
        {streams.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Liste des filières</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map(s => (
                    <tr 
                      key={s.id} 
                      className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-800">{s.nom}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300" 
                          onClick={() => edit(s)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300" 
                          onClick={() => remove(s.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-gray-600">Aucune filière trouvée.</p>
          </div>
        )}

        {/* Modal for Adding/Editing Stream */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Modifier la filière' : 'Ajouter une filière'}
              </h3>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.nom} 
                  onChange={e => setForm({ nom: e.target.value })} 
                  placeholder="Entrez le nom de la filière"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={editingId ? updateStream : addStream}
                >
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}