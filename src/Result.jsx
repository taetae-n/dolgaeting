import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [topIdols, setTopIdols] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    scoring()
  }, [])

  async function scoring() {
    const idolRes = await fetch('http://localhost:8080/api/idols/gender/' + state.gender)
    const idols = await idolRes.json()

    setProgress(20)

    const tagPromises = idols.map((idol) =>
      fetch('http://localhost:8080/api/idols/' + idol.id + '/tags')
        .then((res) => res.json())
        .then((tags) => ({ idolId: idol.id, tags: tags.map((t) => t.name) }))
    )
    const tagResults = await Promise.all(tagPromises)

    const tagMap = {}
    for (const result of tagResults) {
      tagMap[result.idolId] = result.tags
    }

    setProgress(60)

    const tagWins = {}
    const tagAppears = {}

    for (const pick of state.picks) {
      if (pick.winner !== null) {
        const winnerTags = tagMap[pick.winner.id] || []
        const loserTags = tagMap[pick.loser.id] || []

        for (const tag of winnerTags) {
          tagWins[tag] = (tagWins[tag] || 0) + 1
          tagAppears[tag] = (tagAppears[tag] || 0) + 1
        }
        for (const tag of loserTags) {
          tagAppears[tag] = (tagAppears[tag] || 0) + 1
        }
      } else if (pick.pair) {
        for (const idol of pick.pair) {
          const skipTags = tagMap[idol.id] || []
          for (const tag of skipTags) {
            tagAppears[tag] = (tagAppears[tag] || 0) + 1
          }
        }
      }
    }

    const tagScores = {}
    for (const tag in tagAppears) {
      const wins = tagWins[tag] || 0
      const appears = tagAppears[tag]
      tagScores[tag] = (wins + 1) / (appears + 2)
    }

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

    const userMbti = state.userMbti || 'INFP'

    const scoredIdols = idols.map((idol) => {
      const idolTags = tagMap[idol.id] || []

      let tagTotal = 0
      for (const tag of idolTags) {
        tagTotal += tagScores[tag] || 0.5
      }
      const tagAvg = idolTags.length > 0 ? tagTotal / idolTags.length : 0.5

      const mbtiScore = mbtiTable[userMbti] ? (mbtiTable[userMbti][idol.mbti] || 0.5) : 0.5

      const finalScore = 0.88 * tagAvg + 0.12 * mbtiScore

      return { ...idol, finalScore, tagAvg, mbtiScore, idolTags }
    })

    setProgress(100)

    const filtered = scoredIdols.filter((idol) => idol.mbtiScore >= 0.4)
    filtered.sort((a, b) => b.finalScore - a.finalScore)
    setTopIdols(filtered.slice(0, 3))
    setLoading(false)
}
    

  function analyzePreference() {
    if (topIdols.length === 0) return ''

    const top = topIdols[0]
    const tags = top.idolTags || []

    const animalTags = tags.filter((t) =>
      ['강아지상','고양이상','여우상','곰상','토끼상','늑대상','다람쥐상/햄스터상','호랑이상/맹수상','병아리상'].includes(t)
    )
    const moodTags = tags.filter((t) =>
      ['청순/단아','큐트/러블리','섹시/퇴폐','시크/차가운','부드러운/따뜻한'].includes(t)
    )

    let comment = state.userName + '님은 '

    if (animalTags.length > 0) {
      comment += animalTags.join(', ') + ' 느낌에 '
    }
    if (moodTags.length > 0) {
      comment += moodTags.map((t) => t.split('/')[0]).join(', ') + '한 매력에 '
    }

    comment += '끌리는 타입이에요! '

    if (top.mbtiScore >= 0.8) {
      comment += '게다가 ' + top.name + '님과 MBTI 궁합도 최고예요!'
    } else if (top.mbtiScore >= 0.6) {
      comment += top.name + '님과 MBTI 궁합도 좋은 편이에요!'
    } else {
      comment += top.name + '님과는 성격은 좀 다르지만, 취향은 확실해요!'
    }

    return comment
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>취향 분석 중...</h2>
        <div style={{
          width: '300px',
          height: '20px',
          backgroundColor: '#eee',
          borderRadius: '10px',
          margin: '20px auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: progress + '%',
            height: '100%',
            backgroundColor: '#a855f7',
            borderRadius: '10px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <p style={{ color: '#888' }}>
          {progress < 30 && '아이돌 정보를 불러오는 중...'}
          {progress >= 30 && progress < 70 && '태그를 분석하는 중...'}
          {progress >= 70 && progress < 100 && '최적의 아이돌을 찾는 중...'}
          {progress >= 100 && '거의 다 됐어요!'}
        </p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>{state.userName}님의 추천 아이돌!</h1>

      <div style={{
        margin: '20px auto',
        padding: '16px 24px',
        backgroundColor: '#f8f0ff',
        borderRadius: '12px',
        maxWidth: '500px',
        fontSize: '16px',
        lineHeight: '1.6'
      }}>
        {analyzePreference()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px', flexWrap: 'wrap' }}>
        {topIdols.map((idol, index) => (
          <div
            key={idol.id}
            style={{
              border: index === 0 ? '3px solid gold' : '1px solid #ccc',
              borderRadius: '12px',
              padding: '20px',
              width: index === 0 ? '250px' : '200px',
              backgroundColor: index === 0 ? '#fffef0' : 'white'
            }}
          >
            <div style={{ fontSize: '32px' }}>{medals[index]}</div>

            {idol.photoUrl && (
              <img
                src={idol.photoUrl}
                alt={idol.name}
                style={{
                  width: index === 0 ? '150px' : '120px',
                  height: index === 0 ? '150px' : '120px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginTop: '8px'
                }}
              />
            )}

            <h2 style={{ marginBottom: '4px' }}>{idol.name}</h2>
            <p style={{ color: '#666', marginTop: '0' }}>{idol.groupName}</p>
            <p>MBTI: {idol.mbti}</p>

            <div style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
              <p>태그: {idol.idolTags.map((t) => '#' + t).join(' ')}</p>
              <p>태그 점수: {(idol.tagAvg * 100).toFixed(1)}</p>
              <p>MBTI 궁합: {(idol.mbtiScore * 100).toFixed(1)}</p>
              <p><strong>최종: {(idol.finalScore * 100).toFixed(1)}점</strong></p>
            </div>

            <a
              href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(idol.groupName + ' ' + idol.name + ' 직캠')}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '12px', color: '#e74c3c' }}
            >
              직캠 보러가기
            </a>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        style={{ marginTop: '40px', padding: '12px 24px' }}
      >
        다시 하기
      </button>
    </div>
  )
}

export default Result
