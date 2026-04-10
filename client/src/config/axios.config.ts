import axios from 'axios'


const DEFAULT_API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://random-prod-api.example.com/api'
    : 'http://localhost:5000/api'

const API_BASE_URL = DEFAULT_API_BASE_URL

export const axiosi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
