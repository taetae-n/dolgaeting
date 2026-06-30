import { useState } from 'react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD  

function AdminAuth({ children }) {
  const [password, setPassword] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [error, setError] = useState(false)

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (isAuth) return children

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">🔒 관리자 전용</h1>
        <p className="text-purple-300 text-sm text-center mb-6">비밀번호를 입력하세요</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="비밀번호"
          className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-pink-400 mb-3"
        />

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">비밀번호가 틀렸어요!</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-200"
        >
          입장하기
        </button>
      </div>
    </div>
  )
}

export default AdminAuth