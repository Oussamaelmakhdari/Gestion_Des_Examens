import React, { useEffect, useState } from 'react'
import api from '../api'
import { PATHS } from '../config'
import { FaTrash, FaFilePdf, FaPlus, FaEdit } from 'react-icons/fa'
import logo from '../public/logo.png' // Import logo from src/public

export default function Exams() {
  const role = localStorage.getItem('role') || ''
  const streamId = Number(localStorage.getItem('stream_id') || 0)
  const userId = Number(localStorage.getItem('user_id') || 0)
  const [items, setItems] = useState([])
  const [subjects, setSubjects] = useState([])
  const [rooms, setRooms] = useState([])
  const [teachers, setTeachers] = useState([])
  const [streams, setStreams] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ subject_id: '', room_id: '', teacher_id: '', date: '', time: '', stream_id: streamId })

  const load = async () => {
    try {
      let res = await api.get(PATHS.exams)
      let exams = res.data
      if (role === 'student') exams = exams.filter(e => e.stream_id === streamId)
      if (role === 'teacher') exams = exams.filter(e => e.teacher_id === userId)
      setItems(exams)

      if (role === 'admin') {
        const [rr, uu, st] = await Promise.all([api.get(PATHS.rooms), api.get('/users'), api.get(PATHS.streams)])
        setRooms(rr.data)
        setTeachers(uu.data.filter(u => u.role === 'teacher'))
        setStreams(st.data)

        if (form.stream_id) {
          const ss = await api.get(`${PATHS.exams}/subjects?stream_id=${form.stream_id}`)
          setSubjects(ss.data)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { load() }, [])

  const handleStreamChange = async (stream_id) => {
    setForm({ ...form, stream_id, subject_id: '' })
    if (stream_id) {
      const res = await api.get(`${PATHS.exams}/subjects?stream_id=${stream_id}`)
      setSubjects(res.data)
    } else setSubjects([])
  }

  const add = async () => {
    const payload = { 
      ...form, 
      subject_id: Number(form.subject_id), 
      room_id: Number(form.room_id), 
      teacher_id: Number(form.teacher_id), 
      stream_id: Number(form.stream_id) 
    }
    await api.post(PATHS.exams, payload)
    setShowAdd(false)
    setForm({ subject_id: '', room_id: '', teacher_id: '', date: '', time: '', stream_id: streamId })
    load()
  }

  const update = async () => {
    const payload = { 
      ...form, 
      subject_id: Number(form.subject_id), 
      room_id: Number(form.room_id), 
      teacher_id: Number(form.teacher_id), 
      stream_id: Number(form.stream_id) 
    }
    await api.put(`${PATHS.exams}/${editingId}`, payload)
    setShowEdit(false)
    setEditingId(null)
    setForm({ subject_id: '', room_id: '', teacher_id: '', date: '', time: '', stream_id: streamId })
    load()
  }

  const edit = (exam) => {
    setForm({
      subject_id: exam.subject_id || '',
      room_id: exam.room_id || '',
      teacher_id: exam.teacher_id || '',
      date: exam.date || '',
      time: exam.time || '',
      stream_id: exam.stream_id || streamId
    })
    setEditingId(exam.id)
    setShowEdit(true)
    handleStreamChange(exam.stream_id) // Load subjects for the stream
  }

  const del = async id => {
    if (!confirm('Supprimer cet examen ?')) return
    await api.delete(`${PATHS.exams}/${id}`)
    load()
  }

  const download = async id => {
    const token = localStorage.getItem('token')
    const url = `${PATHS.exams}/${id}/convocation?student_id=${localStorage.getItem('user_id')}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `convocation_${id}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-blue-200"/>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Examens</h2>
            {role === 'admin' && (
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" 
                onClick={() => setShowAdd(true)}
              >
                <FaPlus /> Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Exams Table */}
        {items.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Liste des examens</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Matière</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Filière</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Heure</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(e => (
                    <tr 
                      key={e.id} 
                      className="border-t border-gray-200 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-800">{e.subject_name || e.subject_id || '-'}</td>
                      <td className="px-4 py-3 text-gray-800">
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium">
                          {e.stream_name || e.stream_id || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{e.date || '-'}</td>
                      <td className="px-4 py-3 text-gray-800">{e.time || '-'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button 
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                          onClick={() => download(e.id)}
                        >
                          <FaFilePdf /> PDF
                        </button>
                        {role === 'admin' && (
                          <>
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                              onClick={() => edit(e)}
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1" 
                              onClick={() => del(e.id)}
                            >
                              <FaTrash /> Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-gray-600">Aucun examen trouvé.</p>
          </div>
        )}

        {/* Modal for Adding Exam */}
        {showAdd && role === 'admin' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Ajouter un examen</h3>
              {/* Form fields same as before */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Filière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.stream_id} 
                  onChange={e => handleStreamChange(Number(e.target.value))}
                >
                  <option value="">Choisir...</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Matière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.subject_id} 
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salle</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.room_id} 
                  onChange={e => setForm({ ...form, room_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Enseignant (surveillance)</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.teacher_id} 
                  onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date</label>
                  <input 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800" 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Heure</label>
                  <input 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800" 
                    type="time" 
                    value={form.time} 
                    onChange={e => setForm({ ...form, time: e.target.value })}
                  />
                </div>
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
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Exam */}
        {showEdit && role === 'admin' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6 transform transition-all">
              <h3 className="text-xl font-semibold text-gray-800">Modifier l'examen</h3>
              {/* Same form fields as add modal */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Filière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.stream_id} 
                  onChange={e => handleStreamChange(Number(e.target.value))}
                >
                  <option value="">Choisir...</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Matière</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.subject_id} 
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salle</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.room_id} 
                  onChange={e => setForm({ ...form, room_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Enseignant (surveillance)</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800 bg-white" 
                  value={form.teacher_id} 
                  onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                >
                  <option value="">Choisir...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date</label>
                  <input 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800" 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Heure</label>
                  <input 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-800" 
                    type="time" 
                    value={form.time} 
                    onChange={e => setForm({ ...form, time: e.target.value })}
                  />
                </div>
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