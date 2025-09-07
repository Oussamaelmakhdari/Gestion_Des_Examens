import React, { useEffect, useState } from 'react'
import api from '../api'
import { PATHS } from '../config'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import logo from '../public/logo.png' // Import logo from src/public

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [streams, setStreams] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', stream_id: '' })

  useEffect(() => {
    (async () => {
      try {
        const subjectRes = await api.get('/subjects')
        setSubjects(subjectRes.data)
        const streamRes = await api.get(PATHS.streams)
        setStreams(streamRes.data)
      } catch (e) {
        console.error('Erreur lors du chargement des données :', e)
      }
    })()
  }, [])

  const groupedSubjects = streams.reduce((acc, stream) => {
    acc[stream.id] = subjects.filter(s => s.stream_id === stream.id)
    return acc
  }, {})

  const add = async () => {
    try {
      await api.post('/subjects', { ...form, stream_id: Number(form.stream_id) })
      setShowAdd(false)
      setForm({ name: '', stream_id: '' })
      // Reload subjects
      const res = await api.get('/subjects')
      setSubjects(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la création')
    }
  }

  const update = async () => {
    try {
      await api.put(`/subjects/${editingId}`, { ...form, stream_id: Number(form.stream_id) })
      setShowEdit(false)
      setEditingId(null)
      setForm({ name: '', stream_id: '' })
      // Reload subjects
      const res = await api.get('/subjects')
      setSubjects(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  const edit = (subject) => {
    setForm({ name: subject.name || '', stream_id: subject.stream_id || '' })
    setEditingId(subject.id)
    setShowEdit(true)
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return
    try {
      await api.delete(`/subjects/${id}`)
      // Reload subjects
      const res = await api.get('/subjects')
      setSubjects(res.data)
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
          <div className="flex justify-between items-center w-full">
            <h2 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">Matières</h2>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" 
              onClick={() => setShowAdd(true)}
            >
              <FaPlus /> Ajouter
            </button>
          </div>
        </div>

        {/* Streams and Subjects */}
        {streams.length > 0 && Object.keys(groupedSubjects).length > 0 ? (
          streams.map(stream => (
            groupedSubjects[stream.id]?.length > 0 && (
              <div key={stream.id} className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {stream.nom}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedSubjects[stream.id].map(subject => (
                        <tr 
                          key={subject.id} 
                          className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-gray-800">{subject.name}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                              onClick={() => edit(subject)}
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                              onClick={() => remove(subject.id)}
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
            )
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-gray-600">Aucune matière ou filière trouvée.</p>
          </div>
        )}

        {/* Modal for Adding Subject */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Ajouter une matière</h3>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Entrez le nom de la matière"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Filière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.stream_id} 
                  onChange={e => setForm({ ...form, stream_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={() => setShowAdd(false)}
                >
                  Annuler
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300" 
                  onClick={add}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Subject */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Modifier la matière</h3>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Entrez le nom de la matière"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Filière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.stream_id} 
                  onChange={e => setForm({ ...form, stream_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
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