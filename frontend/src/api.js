import axios from 'axios'
import { API_BASE } from './config'

const api = axios.create({ baseURL: API_BASE })
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
export default api
