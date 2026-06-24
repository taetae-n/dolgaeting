import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const TOTAL_ROUNDS = 30

function Play() {
  const [idols, setIdols] = useState([])
  const [pair, setPair] = useState([])
  const [round, setRound] = useState(1)
  const [picks, setPicks] = useState([])
  const [remaining, setRemaining] = useState([])
  const navigate = useNavigate()
  const { gender } = useParams()
  const { state } = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('https://dolgaeting-backend.onrender.com/api/idols/gender/' + gender)
      .then((res) => res.json())
      .then((data) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setIdols(data)
        setRemaining(shuffled.slice(2))
        setPair([shuffled[0], shuffled[1]])
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (remaining.length > 0) {
      remaining.slice(0, 4).forEach((idol) => {
        const img = new Image()
        img.src = idol.photoUrl
      })
    }
  }, [pair])

  function handlePick(winner) {
    const loser = pair.find((idol) => idol.id !== winner.id)
    const newPicks = [...picks, { winner: winner, loser: loser }]
    setPicks(newPicks)

    if (round >= TOTAL_ROUNDS) {
      navigate('/result', { state: { ...state, picks: newPicks, gender: gender } })
      return
    }

    setPair([remaining[0], remaining[1]])
    setRemaining(remaining.slice(2))
    setRound(round + 1)
  }

  function handleSkip() {
    const newPicks = [...picks, { winner: null, loser: null, pair: pair }]
    setPicks(newPicks)

    if (round >= TOTAL_ROUNDS) {
      navigate('/result', { state: { ...state, picks: newPicks, gender: gender } })
      return
    }

    setPair([remaining[0], remaining[1]])
    setRemaining(remaining.slice(2))
    setRound(round + 1)
  }

  if (isLoading || pair.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex flex-col items-center justify-center px-4">
        <h2 className="text-white text-2xl font-bold mb-8">💜 아이돌 불러오는 중...</h2>
        <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
        <p className="text-purple-300 mt-4 text-sm">잠깐만 기다려주세요 ✨</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex flex-col items-center justify-center px-4">

      {/* 라운드 표시 */}
      <div className="mb-8 text-center">
        <p className="text-purple-300 text-sm mb-2">ROUND</p>
        <p className="text-white text-4xl font-bold">{round} <span className="text-purple-400 text-2xl">/ {TOTAL_ROUNDS}</span></p>

        {/* 진행바 */}
        <div className="w-64 h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: (round / TOTAL_ROUNDS * 100) + '%' }}
          />
        </div>
      </div>

      <p className="text-purple-200 mb-8 text-lg">더 끌리는 쪽을 선택하세요</p>

      {/* 아이돌 카드 2개 */}
      <div className="flex gap-6 items-center">
        {pair.map((idol) => (
          <div
            key={idol.id}
            onClick={() => handlePick(idol)}
            className="cursor-pointer group"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden hover:scale-105 hover:border-pink-400 border-2 transition-all duration-200 shadow-2xl">
              <img
                src={idol.photoUrl}
                alt={idol.name}
                className="w-36 h-48 md:w-56 md:h-72 object-cover object-top group-hover:brightness-110 transition-all duration-200"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 별로에요 버튼 */}
      <button
        onClick={handleSkip}
        className="mt-8 text-purple-400 hover:text-purple-200 text-sm transition-colors duration-200 underline underline-offset-4"
      >
        둘 다 별로에요
      </button>
    </div>
  )
}

export default Play