import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const [name, setName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [mbti, setMbti] = useState('INFP')
  const [gender, setGender] = useState('M')
  const [fancamUrl, setFancamUrl] = useState('')
  const [introPoint, setIntroPoint] = useState('')
  const [idols, setIdols] = useState([])
  const [tagName, setTagName] = useState('')
  const [tags, setTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [photoUrl, setPhotoUrl] = useState('')
  const navigate = useNavigate()

  function loadIdols() {
    fetch('https://dolgaeting-backend.onrender.com/api/idols')
      .then((response) => response.json())
      .then((data) => setIdols(data))
  }

  function loadTags() {
    fetch('https://dolgaeting-backend.onrender.com/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data))
  }

  useEffect(() => {
    loadIdols()
    loadTags()
  }, [])

  function handleSubmit() {
    fetch('https://dolgaeting-backend.onrender.com/api/idols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, gender, groupName, mbti, fancamUrl, introPoint, photoUrl
      })
    })
      .then((response) => response.json())
      .then((data) => {
        const newIdolId = data.id
        return Promise.all(
          selectedTagIds.map((tagId) =>
            fetch('https://dolgaeting-backend.onrender.com/api/idols/' + newIdolId + '/tags/' + tagId, {
              method: 'POST'
            })
          )
        )
      })
      .then(() => {
        setName('')
        setGroupName('')
        setFancamUrl('')
        setPhotoUrl('')
        setIntroPoint('')
        setTagName('')
        setSelectedTagIds([])
        loadIdols()
      })
  }

  function handleAddTag() {
    const tagNames = tagName
      .split('#')
      .map((t) => t.trim())
      .filter((t) => t !== '')

    Promise.all(
      tagNames.map((oneTag) =>
        fetch('https://dolgaeting-backend.onrender.com/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: oneTag })
        })
      )
    ).then(() => {
      setTagName('')
      loadTags()
    })
  }

  function toggleTag(tagId) {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  const inputClass = "w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30"
  const selectClass = "w-full bg-purple-950 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400"
  const labelClass = "block text-purple-200 text-sm font-medium mb-2"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">아이돌 등록</h1>
          <p className="text-purple-300 text-sm">새로운 아이돌을 추가해요</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl space-y-5">

          <div>
            <label className={labelClass}>이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>그룹</label>
            <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹명 입력" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>성별</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
              <option value="M">남자 (M)</option>
              <option value="F">여자 (F)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>MBTI</label>
            <select value={mbti} onChange={(e) => setMbti(e.target.value)} className={selectClass}>
              {['INFP','ENFP','INFJ','ENFJ','INTJ','ENTJ','INTP','ENTP',
                'ISFP','ESFP','ISTP','ESTP','ISFJ','ESFJ','ISTJ','ESTJ'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>사진 주소</label>
            <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="이미지 URL" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>소개</label>
            <textarea value={introPoint} onChange={(e) => setIntroPoint(e.target.value)}
              placeholder="매력 포인트" className={inputClass + " resize-none h-24"} />
          </div>

          {/* 태그 추가 */}
          <div>
            <label className={labelClass}>태그 추가</label>
            <div className="flex gap-2">
              <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)}
                placeholder="#강아지상 #큐트" className={inputClass} />
              <button onClick={handleAddTag}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 rounded-xl font-medium transition-colors whitespace-nowrap">
                추가
              </button>
            </div>
          </div>

         {/* 태그 선택 — 카테고리별 */}
          <div>
            <label className={labelClass}>태그 선택</label>
            <div className="space-y-3">
              {[
                { name: '동물상', tags: ['강아지상','고양이상','여우상','곰상','토끼상','늑대상','다람쥐상/햄스터상','호랑이상/맹수상','병아리상'] },
                { name: '분위기', tags: ['청순/단아','큐트/러블리','섹시/퇴폐','시크/차가운','부드러운/따뜻한'] },
                { name: '쌍꺼풀', tags: ['쌍커풀','무쌍/속쌍'] }
              ].map((category) => (
                <div key={category.name}>
                  <p className="text-purple-400 text-xs mb-2">{category.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter((tag) => category.tags.includes(tag.name))
                      .map((tag) => (
                        <span
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                            ${selectedTagIds.includes(tag.id)
                              ? 'bg-pink-500/80 text-white border border-pink-400'
                              : 'bg-white/10 text-purple-300 border border-white/20 hover:bg-white/20'
                            }`}
                        >
                          #{tag.name}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-105">
              등록 ✨
            </button>
            <button onClick={() => navigate('/manage')}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3 rounded-xl transition-all duration-200">
              목록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin