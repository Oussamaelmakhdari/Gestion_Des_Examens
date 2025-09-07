import React, { useEffect, useState } from 'react'
import api from '../api'
import { FaEdit, FaTrash } from 'react-icons/fa'
import logo from '../public/logo.png'
export default function Users() {
  const [users, setUsers] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '', stream_id: '', code_apoge: '', cne: '' })
  const [streams, setStreams] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users')
        setUsers(res.data)
        const streamRes = await api.get('/streams') // Assume PATHS.streams is '/streams'
        setStreams(streamRes.data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const students = users.filter(u => u.role === 'student')
  const teachers = users.filter(u => u.role === 'teacher')

  const edit = (user) => {
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '', // Password optional for updates
      role: user.role || '',
      stream_id: user.stream_id || '',
      code_apoge: user.code_apoge || '',
      cne: user.cne || ''
    })
    setEditingId(user.id)
    setShowEdit(true)
  }

  const update = async () => {
    const payload = { ...form, stream_id: Number(form.stream_id) }
    try {
      await api.put(`/users/${editingId}`, payload)
      setShowEdit(false)
      setEditingId(null)
      setForm({ full_name: '', email: '', password: '', role: '', stream_id: '', code_apoge: '', cne: '' })
      // Reload users
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await api.delete(`/users/${id}`)
      // Reload users
      const res = await api.get('/users')
      setUsers(res.data)
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
          <h2 className="text-3xl font-extrabold text-gray-800 text-center tracking-tight">Utilisateurs</h2>
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Étudiants</h3>
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rôle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(u => (
                    <tr 
                      key={u.id} 
                      className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-gray-800">{u.email}</td>
                      <td className="px-4 py-3 text-gray-800 capitalize">{u.role}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => edit(u)}
                        >
                          <FaEdit /> Modifier
                        </button>
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => remove(u.id)}
                        >
                          <FaTrash /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Aucun étudiant trouvé.</p>
          )}
        </div>

        {/* Teachers Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Enseignants</h3>
          {teachers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rôle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(u => (
                    <tr 
                      key={u.id} 
                      className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-gray-800">{u.email}</td>
                      <td className="px-4 py-3 text-gray-800 capitalize">{u.role}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => edit(u)}
                        >
                          <FaEdit /> Modifier
                        </button>
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => remove(u.id)}
                        >
                          <FaTrash /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Aucun enseignant trouvé.</p>
          )}
        </div>

        {/* Modal for Editing User */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Modifier l'utilisateur</h3>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nom complet</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.full_name} 
                  onChange={e => setForm({ ...form, full_name: e.target.value })} 
                  placeholder="Entrez le nom complet"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  placeholder="Entrez l'email"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mot de passe (optionnel pour mise à jour)</label>
                <input 
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  placeholder="Entrez un nouveau mot de passe"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Rôle</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.role} 
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Étudiant</option>
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Admin</option>
                </select>
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
              {form.role === 'student' && (
                <>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Code Apogée</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                      value={form.code_apoge} 
                      onChange={e => setForm({ ...form, code_apoge: e.target.value })} 
                      placeholder="Entrez le code Apogée"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-gray-700">CNE</label>
                    <input 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 placeholder-gray-400" 
                      value={form.cne} 
                      onChange={e => setForm({ ...form, cne: e.target.value })} 
                      placeholder="Entrez le CNE"
                    />
                  </div>
                </>
              )}
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