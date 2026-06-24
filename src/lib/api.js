const BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const KEY = import.meta.env.VITE_API_KEY || ''

function headers() {
  const h = { 'Content-Type': 'application/json' }
  if (KEY) h['X-API-Key'] = KEY
  return h
}

async function get(path) {
  const res = await fetch(BASE + path, { headers: headers() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function post(path, data) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function del(path) {
  const res = await fetch(BASE + path, { method: 'DELETE', headers: headers() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function put(path, data) {
  const res = await fetch(BASE + path, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = { get, post, put, del }
