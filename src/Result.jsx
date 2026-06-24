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
    setProgress(10)

    const idolRes = await fetch('https://dolgaeting-backend.onrender.com/api/idols/gender/' + state.gender)
    const idols = await idolRes.json()

    setProgress(20)

    const tagPromises = idols.map((idol) =>
      fetch('https://dolgaeting-backend.onrender.com/api/idols/' + idol.id + '/tags')
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

    setProgress(80)

    const mbtiTable = {
        'INFP': {'INFP':0.85,'ENFP':0.85,'INFJ':0.85,'ENFJ':1.0,'INTJ':0.85,'ENTJ':1.0,'INTP':0.85,'ENTP':0.85,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.4,'ESFJ':0.4,'ISTJ':0.4,'ESTJ':0.4},
        'ENFP': {'INFP':0.85,'ENFP':0.85,'INFJ':1.0,'ENFJ':0.85,'INTJ':1.0,'ENTJ':0.85,'INTP':0.85,'ENTP':0.85,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.4,'ESFJ':0.4,'ISTJ':0.4,'ESTJ':0.4},
        'INFJ': {'INFP':0.85,'ENFP':1.0,'INFJ':0.85,'ENFJ':0.85,'INTJ':0.85,'ENTJ':0.85,'INTP':0.85,'ENTP':1.0,'ISFP':0.4,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.4,'ESFJ':0.4,'ISTJ':0.4,'ESTJ':0.4},
        'ENFJ': {'INFP':1.0,'ENFP':0.85,'INFJ':0.85,'ENFJ':0.85,'INTJ':0.85,'ENTJ':0.85,'INTP':0.85,'ENTP':0.85,'ISFP':1.0,'ESFP':0.4,'ISTP':0.4,'ESTP':0.4,'ISFJ':0.4,'ESFJ':0.4,'ISTJ':0.4,'ESTJ':0.4},
        'INTJ': {'INFP':0.85,'ENFP':1.0,'INFJ':0.85,'ENFJ':0.85,'INTJ':0.85,'ENTJ':0.85,'INTP':0.85,'ENTP':1.0,'ISFP':0.55,'ESFP':0.55,'ISTP':0.55,'ESTP':0.55,'ISFJ':0.7,'ESFJ':0.7,'ISTJ':0.7,'ESTJ':0.7},
        'ENTJ': {'INFP':1.0,'ENFP':0.85,'INFJ':0.85,'ENFJ':0.85,'INTJ':0.85,'ENTJ':0.85,'INTP':1.0,'ENTP':0.85,'ISFP':0.55,'ESFP':0.55,'ISTP':0.55,'ESTP':0.55,'ISFJ':0.55,'ESFJ':0.55,'ISTJ':0.55,'ESTJ':0.55},
        'INTP': {'INFP':0.85,'ENFP':0.85,'INFJ':0.85,'ENFJ':0.85,'INTJ':0.85,'ENTJ':1.0,'INTP':0.85,'ENTP':0.85,'ISFP':0.55,'ESFP':0.55,'ISTP':0.55,'ESTP':0.55,'ISFJ':0.7,'ESFJ':0.7,'ISTJ':0.7,'ESTJ':1.0},
        'ENTP': {'INFP':0.85,'ENFP':0.85,'INFJ':1.0,'ENFJ':0.85,'INTJ':1.0,'ENTJ':0.85,'INTP':0.85,'ENTP':0.85,'ISFP':0.55,'ESFP':0.55,'ISTP':0.55,'ESTP':0.55,'ISFJ':0.7,'ESFJ':0.7,'ISTJ':0.7,'ESTJ':0.7},
        'ISFP': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':1.0,'INTJ':0.55,'ENTJ':0.55,'INTP':0.55,'ENTP':0.55,'ISFP':0.7,'ESFP':0.7,'ISTP':0.7,'ESTP':0.7,'ISFJ':0.55,'ESFJ':1.0,'ISTJ':0.55,'ESTJ':1.0},
        'ESFP': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.55,'ENTJ':0.55,'INTP':0.55,'ENTP':0.55,'ISFP':0.7,'ESFP':0.7,'ISTP':0.7,'ESTP':0.7,'ISFJ':1.0,'ESFJ':0.55,'ISTJ':1.0,'ESTJ':0.55},
        'ISTP': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.55,'ENTJ':0.55,'INTP':0.55,'ENTP':0.55,'ISFP':0.7,'ESFP':0.7,'ISTP':0.7,'ESTP':0.7,'ISFJ':0.55,'ESFJ':1.0,'ISTJ':0.55,'ESTJ':1.0},
        'ESTP': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.55,'ENTJ':0.55,'INTP':0.55,'ENTP':0.55,'ISFP':0.7,'ESFP':0.7,'ISTP':0.7,'ESTP':0.7,'ISFJ':1.0,'ESFJ':0.55,'ISTJ':1.0,'ESTJ':0.55},
        'ISFJ': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.7,'ENTJ':0.55,'INTP':0.7,'ENTP':0.55,'ISFP':1.0,'ESFP':0.55,'ISTP':1.0,'ESTP':0.55,'ISFJ':0.85,'ESFJ':0.85,'ISTJ':0.85,'ESTJ':0.85},
        'ESFJ': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.7,'ENTJ':0.55,'INTP':0.7,'ENTP':0.7,'ISFP':1.0,'ESFP':0.55,'ISTP':1.0,'ESTP':0.55,'ISFJ':0.85,'ESFJ':0.85,'ISTJ':0.85,'ESTJ':0.85},
        'ISTJ': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.7,'ENTJ':0.55,'INTP':0.7,'ENTP':0.7,'ISFP':0.55,'ESFP':1.0,'ISTP':0.55,'ESTP':1.0,'ISFJ':0.85,'ESFJ':0.85,'ISTJ':0.85,'ESTJ':0.85},
        'ESTJ': {'INFP':0.4,'ENFP':0.4,'INFJ':0.4,'ENFJ':0.4,'INTJ':0.7,'ENTJ':0.55,'INTP':0.55,'ENTP':0.7,'ISFP':1.0,'ESFP':0.55,'ISTP':1.0,'ESTP':0.55,'ISFJ':0.85,'ESFJ':0.85,'ISTJ':0.85,'ESTJ':0.85}
      }

    const userMbti = state.userMbti || 'INFP'

    const scoredIdols = idols.map((idol) => {
      const idolTags = tagMap[idol.id] || []

      const animalTags = ['강아지상','고양이상','여우상','곰상','토끼상','늑대상','다람쥐상/햄스터상','호랑이상/맹수상','병아리상']
      const moodTags = ['청순/단아','큐트/러블리','섹시/퇴폐','시크/차가운','부드러운/따뜻한']
      const eyelidTags = ['쌍커풀','무쌍/속쌍']

      function categoryAvg(categoryList) {
        const matched = idolTags.filter((t) => categoryList.includes(t))
        if (matched.length === 0) return 0.5
        const total = matched.reduce((sum, t) => sum + (tagScores[t] || 0.5), 0)
        return total / matched.length
      }

      const animalScore = categoryAvg(animalTags)
      const moodScore = categoryAvg(moodTags)
      const eyelidScore = categoryAvg(eyelidTags)

      // 동물상 40% + 분위기 40% + 쌍꺼풀 20%
      const tagAvg = animalScore * 0.4 + moodScore * 0.4 + eyelidScore * 0.2
      const mbtiScore = mbtiTable[userMbti] ? (mbtiTable[userMbti][idol.mbti] || 0.5) : 0.5
      const finalScore = 0.88 * tagAvg + 0.12 * mbtiScore
      return { ...idol, finalScore, tagAvg, mbtiScore, idolTags }
    })

    const filtered = scoredIdols.filter((idol) => idol.mbtiScore > 0.4)
    setProgress(100)
    filtered.sort((a, b) => b.finalScore - a.finalScore)
    const top3 = filtered.slice(0, 3)
    const maxScore = top3[0]?.finalScore || 1
    const normalized = top3.map((idol) => ({
      ...idol,
      displayScore: (idol.finalScore / maxScore * 100).toFixed(1)
    }))
    setTopIdols(normalized)
    // 세션 저장
    fetch('https://dolgaeting-backend.onrender.com/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: state.userName,
        userMbti: state.userMbti,
        totalRounds: state.picks.length,
        recommendedIdol: normalized[0]?.name || ''
      })
    })
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
    if (animalTags.length > 0) comment += animalTags.join(', ') + ' 느낌에 '
    if (moodTags.length > 0) comment += moodTags.map((t) => t.split('/')[0]).join(', ') + '한 매력에 '
    comment += '끌리는 타입이에요! '
    if (top.mbtiScore >= 0.85) comment += '게다가 ' + top.name + '님과 MBTI 궁합도 최고예요! 💕'
    else if (top.mbtiScore >= 0.7) comment += top.name + '님과 MBTI 궁합도 좋은 편이에요! 😊'
    else comment += top.name + '님과는 성격은 좀 다르지만, 취향은 확실해요! ✨'
    return comment
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex flex-col items-center justify-center px-4">
        <h2 className="text-white text-3xl font-bold mb-8">💜 취향 분석 중...</h2>
        <div className="w-80 h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: progress + '%' }}
          />
        </div>
        <p className="text-purple-300 mt-4 text-sm">
          {progress < 30 && '아이돌 정보를 불러오는 중...'}
          {progress >= 30 && progress < 70 && '태그를 분석하는 중...'}
          {progress >= 70 && progress < 100 && '최적의 아이돌을 찾는 중...'}
          {progress >= 100 && '거의 다 됐어요!'}
        </p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']
  const sizes = ['w-56 h-72', 'w-48 h-64', 'w-48 h-64']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black px-4 py-12">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          {state.userName}님의 추천 아이돌!
        </h1>
        <p className="text-purple-300">취향 분석이 완료됐어요 ✨</p>
      </div>

      {/* 취향 분석 멘트 */}
      <div className="max-w-lg mx-auto mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center">
        <p className="text-purple-100 text-base leading-relaxed">💜 {analyzePreference()}</p>
      </div>

      {/* 결과 카드 3개 — 시상대 배치 */}
      <div className="flex justify-center items-end gap-6 max-w-4xl mx-auto">

        {/* 2등 — 왼쪽 */}
        {topIdols[1] && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl w-52 mb-0">
            <div className="relative">
              <img src={topIdols[1].photoUrl} alt={topIdols[1].name} className="w-52 h-64 object-cover rounded-t-3xl" />
              <div className="absolute top-3 left-3 text-3xl">🥈</div>
            </div>
            <div className="p-4 text-center">
              <h2 className="text-white font-bold text-base">{topIdols[1].name}</h2>
              <p className="text-purple-300 text-xs mb-1">{topIdols[1].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[1].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-1">{topIdols[1].idolTags.map((t) => '#' + t).join(' ')}</p>
                            
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[1].groupName + ' ' + topIdols[1].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >🎬 직캠 검색</a>
            </div>
          </div>
        )}

        {/* 1등 — 가운데, 제일 크게 */}
        {topIdols[0] && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl w-64 scale-105 gold-shimmer">
            <div className="relative">
                <img src={topIdols[0].photoUrl} alt={topIdols[0].name} className="w-64 h-80 object-cover rounded-t-3xl" />
                <div className="absolute top-3 left-3 text-4xl">🥇</div>
              </div>
            <div className="p-5 text-center">
              <h2 className="text-white font-bold text-xl">{topIdols[0].name}</h2>
              <p className="text-purple-300 text-sm mb-1">{topIdols[0].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[0].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-2">{topIdols[0].idolTags.map((t) => '#' + t).join(' ')}</p>
                            
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[0].groupName + ' ' + topIdols[0].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >🎬 직캠 검색</a>
            </div>
          </div>
        )}

        {/* 3등 — 오른쪽 */}
        {topIdols[2] && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl w-52">
            <div className="relative">
              <img src={topIdols[2].photoUrl} alt={topIdols[2].name} className="w-52 h-64 object-cover rounded-t-3xl" />
              <div className="absolute top-3 left-3 text-3xl">🥉</div>
            </div>
            <div className="p-4 text-center">
              <h2 className="text-white font-bold text-base">{topIdols[2].name}</h2>
              <p className="text-purple-300 text-xs mb-1">{topIdols[2].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[2].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-1">{topIdols[2].idolTags.map((t) => '#' + t).join(' ')}</p>
                            
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[2].groupName + ' ' + topIdols[2].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >🎬 직캠 검색</a>
            </div>
          </div>
        )}
      </div>

      {/* 다시하기 버튼 */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          다시 하기 🔄
        </button>
      </div>
    </div>
  )
}

export default Result