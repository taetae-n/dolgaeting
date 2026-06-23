import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [userName, setUserName] = useState('')
  const [userMbti, setUserMbti] = useState('INFP')
  const navigate = useNavigate()

  function handleStart() {
    if (userName.trim() === '') {
      alert('이름을 입력해주세요!')
      return
    }
    navigate('/select', { state: { userName: userName, userMbti: userMbti } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex flex-col items-center justify-center px-4">

      {/* 타이틀 */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">
          💜 돌개팅 💜
        </h1>
        <h3 className="text-3xl font-semibold text-pink-300 mb-2">
          입덕가이드
        </h3>
        <p className="text-purple-200 text-lg">
          당신의 아이돌을 찾아드려요🪄
        </p>
      </div>

      {/* 입력 카드 */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">

        <div className="mb-6">
          <label className="block text-purple-200 text-sm font-medium mb-2">이름</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30"
          />
        </div>

        <div className="mb-8">
          <label className="block text-purple-200 text-sm font-medium mb-2">MBTI</label>
          <select
            value={userMbti}
            onChange={(e) => setUserMbti(e.target.value)}
            className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400"
          >
            {['INFP','ENFP','INFJ','ENFJ','INTJ','ENTJ','INTP','ENTP',
              'ISFP','ESFP','ISTP','ESTP','ISFJ','ESFJ','ISTJ','ESTJ'].map((type) => (
              <option key={type} value={type} className="bg-purple-900">{type}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-pink-500/30 hover:scale-105"
        >
          시작하기 ✨
        </button>
      </div>

      {/* 별 장식 */}
      <div className="mt-8 text-purple-300 text-sm">
        ⭐ 취향 분석으로 찾는 나만의 최애 ⭐
      </div>
    </div>
  )
}

export default Home