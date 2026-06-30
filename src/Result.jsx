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
    const tagConfidence = {}
    for (const tag in tagAppears) {
      const wins = tagWins[tag] || 0
      const appears = tagAppears[tag]
      tagScores[tag] = (wins + 1) / (appears + 2)
      // 신뢰도: 많이 나올수록 1에 가까워짐 (최대 10번 기준)
      tagConfidence[tag] = Math.min(appears / 10, 1)
    }
    
    // 조합 선호도 계산 (동물상 + 분위기 조합)
    const animalTagList = ['강아지상','고양이상','여우상','곰상','토끼상','늑대상','다람쥐상/햄스터상','호랑이상/맹수상','병아리상']
    const moodTagList = ['청순/단아','큐트/러블리','섹시/퇴폐','시크/차가운','부드러운/따뜻한']

    const comboWins = {}
    const comboAppears = {}

    function getCombos(tags) {
      const animals = tags.filter((t) => animalTagList.includes(t))
      const moods = tags.filter((t) => moodTagList.includes(t))
      const combos = []
      for (const a of animals) {
        for (const m of moods) {
          combos.push(a + '+' + m)
        }
      }
      return combos
    }

    for (const pick of state.picks) {
      if (pick.winner !== null) {
        const winnerTags = tagMap[pick.winner.id] || []
        const loserTags = tagMap[pick.loser.id] || []

        for (const combo of getCombos(winnerTags)) {
          comboWins[combo] = (comboWins[combo] || 0) + 1
          comboAppears[combo] = (comboAppears[combo] || 0) + 1
        }
        for (const combo of getCombos(loserTags)) {
          comboAppears[combo] = (comboAppears[combo] || 0) + 1
        }
      }
    }

    const comboScores = {}
    for (const combo in comboAppears) {
      const wins = comboWins[combo] || 0
      const appears = comboAppears[combo]
      comboScores[combo] = (wins + 1) / (appears + 2)
    }

    // 태그 ELO 계산
    const tagElo = {}
    const allTagNames = Object.keys(tagAppears)
    allTagNames.forEach((tag) => { tagElo[tag] = 1000 })  // 초기값 1000

    function updateElo(winnerTag, loserTag) {
      const K = 32
      const ratingWinner = tagElo[winnerTag]
      const ratingLoser = tagElo[loserTag]
      const expectedWinner = 1 / (1 + Math.pow(10, (ratingLoser - ratingWinner) / 400))
      const expectedLoser = 1 / (1 + Math.pow(10, (ratingWinner - ratingLoser) / 400))
      tagElo[winnerTag] = ratingWinner + K * (1 - expectedWinner)
      tagElo[loserTag] = ratingLoser + K * (0 - expectedLoser)
    }

    for (const pick of state.picks) {
      if (pick.winner !== null) {
        const winnerTags = tagMap[pick.winner.id] || []
        const loserTags = tagMap[pick.loser.id] || []

        for (const wTag of winnerTags) {
          for (const lTag of loserTags) {
            if (wTag !== lTag) {
              updateElo(wTag, lTag)
            }
          }
        }
      }
    }

    // ELO를 0~1 점수로 정규화
    const eloValues = Object.values(tagElo)
    const minElo = Math.min(...eloValues, 1000)
    const maxElo = Math.max(...eloValues, 1000)
    const eloRange = maxElo - minElo || 1

    const tagEloScore = {}
    for (const tag in tagElo) {
      tagEloScore[tag] = (tagElo[tag] - minElo) / eloRange
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
        if (matched.length === 0) return { score: 0.5, confidence: 0, elo: 0.5 }
        const total = matched.reduce((sum, t) => sum + (tagScores[t] || 0.5), 0)
        const confTotal = matched.reduce((sum, t) => sum + (tagConfidence[t] || 0), 0)
        const eloTotal = matched.reduce((sum, t) => sum + (tagEloScore[t] || 0.5), 0)
        return {
          score: total / matched.length,
          confidence: confTotal / matched.length,
          elo: eloTotal / matched.length
        }
      }

      const animal = categoryAvg(animalTags)
      const mood = categoryAvg(moodTags)
      const eyelid = categoryAvg(eyelidTags)

      // 콤보 점수 계산
      const idolCombos = getCombos(idolTags)
      let comboScore = 0.5
      if (idolCombos.length > 0) {
        const comboTotal = idolCombos.reduce((sum, c) => sum + (comboScores[c] || 0.5), 0)
        comboScore = comboTotal / idolCombos.length
      }

      const tagPreferenceScore = animal.score * 0.4 + mood.score * 0.4 + eyelid.score * 0.2
      const tagEloScoreFinal = animal.elo * 0.4 + mood.elo * 0.4 + eyelid.elo * 0.2
      const confidenceScore = animal.confidence * 0.4 + mood.confidence * 0.4 + eyelid.confidence * 0.2
      const mbtiScore = mbtiTable[userMbti] ? (mbtiTable[userMbti][idol.mbti] || 0.5) : 0.5
      const appearanceScore = tagPreferenceScore * 0.55 + tagEloScoreFinal * 0.25 + comboScore * 0.15 + confidenceScore * 0.05
      const finalScore = appearanceScore * 0.85 + mbtiScore * 0.15

      return { ...idol, finalScore, tagAvg: appearanceScore, mbtiScore, idolTags }
    })
    const filtered = scoredIdols
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
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          {state.userName}님의 추천 아이돌!
        </h1>
        <p className="text-purple-300">취향 분석이 완료됐어요 ✨</p>
      </div>

      {/* 취향 분석 멘트 */}
      <div className="max-w-lg mx-auto mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center">
        <p className="text-purple-100 text-base leading-relaxed">💜 {analyzePreference()}</p>
      </div>

        {/* 모바일: 세로 배치 / 데스크탑: 시상대 배치 */}
      <div className="flex flex-col md:flex-row md:justify-center md:items-end gap-4 md:gap-6 max-w-4xl mx-auto">

        {/* 모바일에서 1등 먼저 */}
        <div className="md:hidden">
          {topIdols[0] && (
            <div className="bg-white/10 backdrop-blur-md border border-yellow-300/80 ring-4 ring-yellow-300/40 rounded-3xl overflow-hidden shadow-2xl gold-shimmer">
              <div className="relative">
                <img src={topIdols[0].photoUrl} alt={topIdols[0].name} className="w-full h-96 object-cover object-top rounded-t-3xl" />
                <div className="absolute top-3 left-3 text-4xl">🥇</div>
              </div>
              <div className="p-4 text-center">
                <h2 className="text-white font-bold text-xl">{topIdols[0].name}</h2>
                <p className="text-purple-300 text-sm mb-1">{topIdols[0].groupName}</p>
                <p className="text-purple-400 text-xs">MBTI: {topIdols[0].mbti}</p>
                <p className="text-xs text-purple-300/70 mt-2">{topIdols[0].idolTags.map((t) => '#' + t).join(' ')}</p>
                <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[0].groupName + ' ' + topIdols[0].name + ' 직캠')}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-200">
                  🎬 직캠 검색
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 2등 — 모바일: 세로 / 데스크탑: 왼쪽 */}
        {topIdols[1] && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl md:w-52">
            <div className="relative">
              <img src={topIdols[1].photoUrl} alt={topIdols[1].name} className="w-full md:w-52 h-[400px] md:h-64 object-cover object-top rounded-t-3xl" />
              <div className="absolute top-3 left-3 text-3xl">🥈</div>
            </div>
            <div className="p-4 text-center">
              <h2 className="text-white font-bold text-base">{topIdols[1].name}</h2>
              <p className="text-purple-300 text-xs mb-1">{topIdols[1].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[1].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-1">{topIdols[1].idolTags.map((t) => '#' + t).join(' ')}</p>
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[1].groupName + ' ' + topIdols[1].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-200">
                🎬 직캠 검색
              </a>
            </div>
          </div>
        )}

        {/* 1등 — 데스크탑에서만 가운데 */}
        {topIdols[0] && (
          <div className="hidden md:block bg-white/10 backdrop-blur-md border border-yellow-300/80 ring-4 ring-yellow-300/40 rounded-3xl overflow-hidden shadow-2xl w-64 scale-105 gold-shimmer">
            <div className="relative">
              <img src={topIdols[0].photoUrl} alt={topIdols[0].name} className="w-full h-80 object-cover object-top rounded-t-3xl" />
              <div className="absolute top-3 left-3 text-4xl">🥇</div>
            </div>
            <div className="p-5 text-center">
              <h2 className="text-white font-bold text-xl">{topIdols[0].name}</h2>
              <p className="text-purple-300 text-sm mb-1">{topIdols[0].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[0].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-2">{topIdols[0].idolTags.map((t) => '#' + t).join(' ')}</p>
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[0].groupName + ' ' + topIdols[0].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-200">
                🎬 직캠 검색
              </a>
            </div>
          </div>
        )}

        {/* 3등 — 모바일: 세로 / 데스크탑: 오른쪽 */}
        {topIdols[2] && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl md:w-52">
            <div className="relative">
              <img src={topIdols[2].photoUrl} alt={topIdols[2].name} className="w-full md:w-52 h-[400px] md:h-64 object-cover object-top rounded-t-3xl" />
              <div className="absolute top-3 left-3 text-3xl">🥉</div>
            </div>
            <div className="p-4 text-center">
              <h2 className="text-white font-bold text-base">{topIdols[2].name}</h2>
              <p className="text-purple-300 text-xs mb-1">{topIdols[2].groupName}</p>
              <p className="text-purple-400 text-xs">MBTI: {topIdols[2].mbti}</p>
              <p className="text-xs text-purple-300/70 mt-1">{topIdols[2].idolTags.map((t) => '#' + t).join(' ')}</p>
              <a href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(topIdols[2].groupName + ' ' + topIdols[2].name + ' 직캠')}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-200">
                🎬 직캠 검색
              </a>
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