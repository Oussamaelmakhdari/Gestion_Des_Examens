import React, { useEffect, useState } from 'react'
import api from '../api'
import { FaEdit, FaTrash } from 'react-icons/fa'
import logo from '../public/logo.png' // Import logo from src/public

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', capacity: '' })

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/rooms')
        setRooms(res.data)
      } catch (e) {
        console.error('Erreur lors du chargement des salles :', e)
      }
    })()
  }, [])

  const update = async () => {
    try {
      const payload = { ...form, capacity: Number(form.capacity) }
      await api.put(`/rooms/${editingId}`, payload)
      setShowEdit(false)
      setEditingId(null)
      setForm({ name: '', capacity: '' })
      // Reload rooms
      const res = await api.get('/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  const edit = (room) => {
    setForm({ name: room.name || '', capacity: room.capacity || '' })
    setEditingId(room.id)
    setShowEdit(true)
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette salle ?')) return
    try {
      await api.delete(`/rooms/${id}`)
      // Reload rooms
      const res = await api.get('/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-blue-200"/>
          <h2 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">Salles</h2>
        </div>

        {/* Rooms Table */}
        {rooms.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Liste des salles</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Capacité</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <tr 
                      key={r.id} 
                      className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-800">{r.name}</td>
                      <td className="px-4 py-3 text-gray-800">{r.capacity}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => edit(r)}
                        >
                          <FaEdit /> Modifier
                        </button>
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => remove(r.id)}
                        >
                          <FaTrash /> Supprimer
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
            <p className="text-gray-600">Aucune salle trouvée.</p>
          </div>
        )}

        {/* Modal for Editing Room */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Modifier la salle</h3>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Entrez le nom de la salle"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Capacité</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.capacity} 
                  onChange={e => setForm({ ...form, capacity: e.target.value })} 
                  placeholder="Entrez la capacité"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={() => setShowEdit(false)}
                >
                  Annuler
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={update}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}