import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/ping')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Erro ao conectar com o backend:', err))
  }, [])

  return (
    <div>
      <h1>Frontend React</h1>
      <p>Mensagem do backend: {message}</p>
    </div>
  )
}

export default App
