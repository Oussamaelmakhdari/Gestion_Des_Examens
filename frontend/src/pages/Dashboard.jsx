import React, { useEffect, useState } from 'react'
import api from '../api'
import { PATHS } from '../config'
import { FaUsers, FaBook, FaChalkboard, FaClipboardList } from 'react-icons/fa'

export default function Dashboard() {
  const role = localStorage.getItem('role') || ''
  const name = localStorage.getItem('name') || ''
  const streamId = Number(localStorage.getItem('stream_id') || 0)
  const userId = Number(localStorage.getItem('user_id') || 0)

  const [streamName, setStreamName] = useState('')
  const [examCount, setExamCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [subjectCount, setSubjectCount] = useState(0)
  const [roomCount, setRoomCount] = useState(0)

  useEffect(() => {
    const fetchStreamName = async () => {
      if (streamId) {
        try {
          const res = await api.get(`${PATHS.streams}${streamId}`)
          setStreamName(res.data.nom || res.data.name)
        } catch (err) { console.error(err) }
      }
    }
    fetchStreamName()
  }, [streamId])

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        let exams = (await api.get(PATHS.exams)).data
        if (role === 'student') exams = exams.filter(e => e.stream_id === streamId)
        if (role === 'teacher') exams = exams.filter(e => e.teacher_id === userId)
        setExamCount(exams.length)

        if (role === 'admin') {
          const [users, subjects, rooms] = await Promise.all([
            api.get('/users'), api.get('/subjects'), api.get('/rooms')
          ])
          setUserCount(users.data.length)
          setSubjectCount(subjects.data.length)
          setRoomCount(rooms.data.length)
        }
      } catch (err) { console.error(err) }
    }
    fetchCounts()
  }, [role, streamId, userId])

  const cardClass = 'card p-4 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col items-start'

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-blue-100 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-blue-800">Bienvenue👋</h2>
        <p className="text-gray-700">Vous êtes connecté en tant que <b>{role}</b>{streamName ? `, filière ${streamName}` : ''}.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {role==='admin' && <>
          <div className={cardClass}><FaUsers className="text-2xl mb-2 text-blue-700"/><h3 className="font-semibold">Utilisateurs</h3><p>{userCount} au total</p></div>
          <div className={cardClass}><FaBook className="text-2xl mb-2 text-green-700"/><h3 className="font-semibold">Matières</h3><p>{subjectCount} au total</p></div>
          <div className={cardClass}><FaChalkboard className="text-2xl mb-2 text-yellow-700"/><h3 className="font-semibold">Salles</h3><p>{roomCount} au total</p></div>
          <div className={cardClass + ' md:col-span-3'}><FaClipboardList className="text-2xl mb-2 text-red-700"/><h3 className="font-semibold">Examens</h3><p>{examCount} au total</p></div>
        </>}
        {role==='teacher' && <div className={cardClass}><h3 className="font-semibold">Examens supervisés</h3><p>{examCount}</p></div>}
        {role==='student' && <div className={cardClass}><h3 className="font-semibold">Vos examens</h3><p>{examCount}</p></div>}
      </div>
    </div>
  )
}
