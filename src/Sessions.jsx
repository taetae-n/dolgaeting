import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('https://dolgaeting-backend.onrender.com/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data.reverse())
        else setSessions([])
        setLoading(false)
      })
      .catch(() => {
        setSessions([])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">📊 이용 기록</h1>
            <p className="text-purple-300 text-sm mt-1">총 {sessions.length}명이 이용했어요</p>
          </div>
          <button
            onClick={() => navigate('/manage')}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-3 py-2 rounded-xl text-sm hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            ← 관리 페이지
          </button>
        </div>

        {loading ? (
          <div className="text-center text-purple-300 mt-20">불러오는 중...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-purple-300 mt-20">아직 기록이 없어요.</div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={`flex items-center justify-between px-5 py-4
                  ${index !== sessions.length - 1 ? 'border-b border-white/10' : ''}`}
              >
                <div>
                  <span className="text-white font-medium">{session.userName}</span>
                  <span className="text-purple-300 text-sm ml-2">({session.userMbti})</span>
                  <p className="text-purple-400 text-xs mt-0.5">{session.totalRounds}라운드</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-300 text-sm font-medium">💜 {session.recommendedIdol}</p>
                  <p className="text-purple-400 text-xs mt-0.5">
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString('ko-KR') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sessions