import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const TOTAL_ROUNDS = 20

function Play() {
  const [remaining, setRemaining] = useState([])
  const [idols, setIdols] = useState([])
  const [pair, setPair] = useState([])
  const [round, setRound] = useState(1)
  const navigate = useNavigate()
  const { gender } = useParams()
  const { state } = useLocation()
  const [picks, setPicks] = useState([])

  useEffect(() => {
    fetch('http://localhost:8080/api/idols/gender/' + gender)
      .then((res) => res.json())
      .then((data) => {
        setIdols(data)
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setPair([shuffled[0], shuffled[1]])
        setRemaining(shuffled.slice(2))
      })
  }, [])

 function handlePick(winner) {
    const loser = pair.find((idol) => idol.id !== winner.id)
    const newPicks = [...picks, { winner: winner, loser: loser }]
    setPicks(newPicks)

    if (round >= TOTAL_ROUNDS) {
      console.log('기록:', newPicks)
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

  if (pair.length < 2) {
    return <div style={{ padding: '40px' }}>불러오는 중...</div>
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>{round} / {TOTAL_ROUNDS}</h2>
      <p>둘 중 더 끌리는 쪽을 골라주세요</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px' }}>
        {pair.map((idol) => (
          <div
            key={idol.id}
            onClick={() => handlePick(idol)}
            style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '30px', borderRadius: '8px' }}
          >
            <img
              src={idol.photoUrl}
              alt={idol.name}
              style={{ width: '300px', height: '400px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSkip}
        style={{ marginTop: '20px', padding: '8px 20px', color: '#999' }}
      >
        둘 다 별로에요
      </button>
    </div>
  )
}

export default Play