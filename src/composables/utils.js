

const base_url = import.meta.env.VITE_BASE_URL

const getAbsoluteUrl = (path) => {
  return `${base_url}${path}`
}

export default { 
  getAbsoluteUrl 
}