import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const TOTAL_ROUNDS = 5

function Play() {
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
        setPair(pickTwo(data))
      })
  }, [])

  function pickTwo(list) {
    const shuffled = [...list].sort(() => Math.random() - 0.5)
    return [shuffled[0], shuffled[1]]
  }

 function handlePick(winner) {
    const loser = pair.find((idol) => idol.id !== winner.id)
    const newPicks = [...picks, { winner: winner, loser: loser }]
    setPicks(newPicks)

    if (round >= TOTAL_ROUNDS) {
      console.log('기록:', newPicks)
      navigate('/result', { state: { ...state, picks: newPicks } })
      return
    }
    setRound(round + 1)
    setPair(pickTwo(idols))
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
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Play