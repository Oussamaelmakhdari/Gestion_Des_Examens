import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/index.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Subjects from './pages/Subjects'
import Rooms from './pages/Rooms'
import Streams from './pages/Streams'
import Exams from './pages/Exams'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AuthRedirect({ children }) {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/" replace /> : children
}

function RoleRoute({ allowedRoles, children }) {
  const role = localStorage.getItem('role')
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />

          <Route path="utilisateurs" element={
            <RoleRoute allowedRoles={["admin"]}><Users /></RoleRoute>
          } />
          <Route path="matieres" element={
            <RoleRoute allowedRoles={["admin"]}><Subjects /></RoleRoute>
          } />
          <Route path="salles" element={
            <RoleRoute allowedRoles={["admin"]}><Rooms /></RoleRoute>
          } />
          <Route path="filieres" element={
            <RoleRoute allowedRoles={["admin"]}><Streams /></RoleRoute>
          } />

          <Route path="examens" element={
            <RoleRoute allowedRoles={["admin","teacher","student"]}><Exams /></RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
