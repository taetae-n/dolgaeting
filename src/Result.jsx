import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Result() {
  const { state } = useLocation()
  const [allIdols, setAllIdols] = useState([])
  const [allIdolTags, setAllIdolTags] = useState({})
  const [bestIdol, setBestIdol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    scoring()
  }, [])

  async function scoring() {
    // 1단계: 전체 아이돌 불러오기
    const idolRes = await fetch('http://localhost:8080/api/idols')
    const idols = await idolRes.json()
    setAllIdols(idols)

    // 2단계: 각 아이돌의 태그 불러오기
    const tagMap = {}
    for (const idol of idols) {
      const tagRes = await fetch('http://localhost:8080/api/idols/' + idol.id + '/tags')
      const tags = await tagRes.json()
      tagMap[idol.id] = tags.map((t) => t.name)
    }
    setAllIdolTags(tagMap)

    // 3단계: picks에서 태그별 선호도 계산 (라플라스 스무딩)
    const tagWins = {}
    const tagAppears = {}

    for (const pick of state.picks) {
      const winnerTags = tagMap[pick.winner.id] || []
      const loserTags = tagMap[pick.loser.id] || []

      for (const tag of winnerTags) {
        tagWins[tag] = (tagWins[tag] || 0) + 1
        tagAppears[tag] = (tagAppears[tag] || 0) + 1
      }
      for (const tag of loserTags) {
        tagAppears[tag] = (tagAppears[tag] || 0) + 1
      }
    }

    // 태그별 선호도 = (이긴횟수 + 1) / (나온횟수 + 2)
    const tagScores = {}
    for (const tag in tagAppears) {
      const wins = tagWins[tag] || 0
      const appears = tagAppears[tag]
      tagScores[tag] = (wins + 1) / (appears + 2)
    }

    console.log('태그 선호도:', tagScores)

    // 4단계: 각 아이돌의 최종 점수 계산
    let topIdol = null
    let topScore = -1

    for (const idol of idols) {
      const idolTags = tagMap[idol.id] || []

      // 태그 점수: 가진 태그들의 선호도 평균
      let tagTotal = 0
      for (const tag of idolTags) {
        tagTotal += tagScores[tag] || 0.5
      }
      const tagAvg = idolTags.length > 0 ? tagTotal / idolTags.length : 0.5

      // MBTI 궁합 (5단계 궁합표)
      const userMbti = state.userMbti || 'INFP'

      const mbtiTable = {
        'INFP': {'INFP':0.8,'ENFP':0.8,'INFJ':0.8,'ENFJ':1.0,'INTJ':0.8,'ENTJ':1.0,'INTP':0.8,'ENTP':0.8,'ISFP':0.2,'ESFP':0.2,'ISTP':0.2,'ESTP':0.2,'ISFJ':0.2,'ESFJ':0.2,'ISTJ':0.2,'ESTJ':0.2},
        'ENFP': {'INFP':0.8,'ENFP':0.8,'INFJ':1.0,'ENFJ':0.8,'INTJ':1.0,'ENTJ':0.8,'INTP':0.8,'ENTP':0.8,'ISFP':0.2,'ESFP':0.2,'ISTP':0.2,'ESTP':0.2,'ISFJ':0.2,'ESFJ':0.2,'ISTJ':0.2,'ESTJ':0.2},
        'INFJ': {'INFP':0.8,'ENFP':1.0,'INFJ':0.8,'ENFJ':0.8,'INTJ':0.8,'ENTJ':0.8,'INTP':0.8,'ENTP':1.0,'ISFP':0.2,'ESFP':0.2,'ISTP':0.2,'ESTP':0.2,'ISFJ':0.2,'ESFJ':0.2,'ISTJ':0.2,'ESTJ':0.2},
        'ENFJ': {'INFP':1.0,'ENFP':0.8,'INFJ':0.8,'ENFJ':0.8,'INTJ':0.8,'ENTJ':0.8,'INTP':0.8,'ENTP':0.8,'ISFP':1.0,'ESFP':0.2,'ISTP':0.2,'ESTP':0.2,'ISFJ':0.2,'ESFJ':0.2,'ISTJ':0.2,'ESTJ':0.2},
        'INTJ': {'INFP':0.8,'ENFP':1.0,'INFJ':0.8,'ENFJ':0.8,'INTJ':0.8,'ENTJ':0.8,'INTP':0.8,'ENTP':1.0,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.6,'ESFJ':0.6,'ISTJ':0.6,'ESTJ':0.6},
        'ENTJ': {'INFP':1.0,'ENFP':0.8,'INFJ':0.8,'ENFJ':0.8,'INTJ':0.8,'ENTJ':0.8,'INTP':1.0,'ENTP':0.8,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.4,'ESFJ':0.4,'ISTJ':0.4,'ESTJ':0.4},
        'INTP': {'INFP':0.8,'ENFP':0.8,'INFJ':0.8,'ENFJ':0.8,'INTJ':0.8,'ENTJ':1.0,'INTP':0.8,'ENTP':0.8,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.6,'ESFJ':0.6,'ISTJ':0.6,'ESTJ':1.0},
        'ENTP': {'INFP':0.8,'ENFP':0.8,'INFJ':1.0,'ENFJ':0.8,'INTJ':1.0,'ENTJ':0.8,'INTP':0.8,'ENTP':0.8,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.6,'ESFJ':0.6,'ISTJ':0.6,'ESTJ':0.6},
        'ISFP': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':1.0,'INTJ':0.4,'ENTJ':0.4,'INTP':0.4,'ENTP':0.4,'ISFP':0.6,'ESFP':0.6,'ISTP':0.6,'ESTP':0.6,'ISFJ':0.4,'ESFJ':1.0,'ISTJ':0.4,'ESTJ':1.0},
        'ESFP': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.4,'ENTJ':0.4,'INTP':0.4,'ENTP':0.4,'ISFP':0.6,'ESFP':0.6,'ISTP':0.6,'ESTP':0.6,'ISFJ':1.0,'ESFJ':0.4,'ISTJ':1.0,'ESTJ':0.4},
        'ISTP': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.4,'ENTJ':0.4,'INTP':0.4,'ENTP':0.4,'ISFP':0.6,'ESFP':0.6,'ISTP':0.6,'ESTP':0.6,'ISFJ':0.4,'ESFJ':1.0,'ISTJ':0.4,'ESTJ':1.0},
        'ESTP': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.4,'ENTJ':0.4,'INTP':0.4,'ENTP':0.4,'ISFP':0.6,'ESFP':0.6,'ISTP':0.6,'ESTP':0.6,'ISFJ':1.0,'ESFJ':0.4,'ISTJ':1.0,'ESTJ':0.4},
        'ISFJ': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.6,'ENTJ':0.4,'INTP':0.6,'ENTP':0.4,'ISFP':1.0,'ESFP':0.4,'ISTP':1.0,'ESTP':0.4,'ISFJ':0.8,'ESFJ':0.8,'ISTJ':0.8,'ESTJ':0.8},
        'ESFJ': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.6,'ENTJ':0.4,'INTP':0.6,'ENTP':0.6,'ISFP':1.0,'ESFP':0.4,'ISTP':1.0,'ESTP':0.4,'ISFJ':0.8,'ESFJ':0.8,'ISTJ':0.8,'ESTJ':0.8},
        'ISTJ': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.6,'ENTJ':0.4,'INTP':0.6,'ENTP':0.6,'ISFP':0.4,'ESFP':1.0,'ISTP':0.4,'ESTP':1.0,'ISFJ':0.8,'ESFJ':0.8,'ISTJ':0.8,'ESTJ':0.8},
        'ESTJ': {'INFP':0.2,'ENFP':0.2,'INFJ':0.2,'ENFJ':0.2,'INTJ':0.6,'ENTJ':0.4,'INTP':0.4,'ENTP':0.6,'ISFP':1.0,'ESFP':0.4,'ISTP':1.0,'ESTP':0.4,'ISFJ':0.8,'ESFJ':0.8,'ISTJ':0.8,'ESTJ':0.8}
      }

      const mbtiScore = mbtiTable[userMbti] ? (mbtiTable[userMbti][idol.mbti] || 0.5) : 0.5
      // 최종 점수 = 태그 70% + MBTI 30%
      const finalScore = 0.7 * tagAvg + 0.3 * mbtiScore

      if (finalScore > topScore) {
        topScore = finalScore
        topIdol = { ...idol, finalScore, tagAvg, mbtiScore }
      }
    }

    console.log('1등:', topIdol)
    setBestIdol(topIdol)
    setLoading(false)
  }

  if (loading) {
    return <div style={{ padding: '40px' }}>채점 중...</div>
  }

  if (!bestIdol) {
    return <div style={{ padding: '40px' }}>결과를 계산할 수 없어요.</div>
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>{state.userName}님의 최애 아이돌은!</h1>

      {bestIdol.photoUrl && (
        <img
          src={bestIdol.photoUrl}
          alt={bestIdol.name}
          style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '50%' }}
        />
      )}

      <h2>{bestIdol.name}</h2>
      <p>{bestIdol.groupName}</p>
      <p>MBTI: {bestIdol.mbti}</p>

      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'inline-block' }}>
        <p>태그 점수: {(bestIdol.tagAvg * 100).toFixed(1)}점</p>
        <p>MBTI 궁합: {(bestIdol.mbtiScore * 100).toFixed(1)}점</p>
        <p><strong>최종 점수: {(bestIdol.finalScore * 100).toFixed(1)}점</strong></p>
      </div>

      {bestIdol.fancamUrl && (
        <p style={{ marginTop: '20px' }}>
          <a href={bestIdol.fancamUrl} target="_blank" rel="noopener noreferrer">
            직캠 보러가기
          </a>
        </p>
      )}
    </div>
  )
}

export default Result