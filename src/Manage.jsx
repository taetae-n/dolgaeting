import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Manage() {
  const [idols, setIdols] = useState([])
  const [allTags, setAllTags] = useState([])
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [selectedIdolTags, setSelectedIdolTags] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  function loadIdols() {
    fetch('https://dolgaeting-backend.onrender.com/api/idols')
      .then((res) => res.json())
      .then((data) => setIdols(data))
  }

  useEffect(() => {
    loadIdols()
    fetch('https://dolgaeting-backend.onrender.com/api/tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data))
  }, [])

  function handleDelete(idolId) {
    fetch('https://dolgaeting-backend.onrender.com/api/idols/' + idolId, {
      method: 'DELETE'
    }).then(() => loadIdols())
  }

  function handleUpdate() {
    fetch('https://dolgaeting-backend.onrender.com/api/idols/' + selectedIdol.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedIdol)
    })
      .then((res) => res.json())
      .then(() => {
        setIsEditing(false)
        setSelectedIdol(null)
        loadIdols()
      })
  }

  function openIdol(idol) {
    setSelectedIdol(idol)
    setIsEditing(false)
    fetch('https://dolgaeting-backend.onrender.com/api/idols/' + idol.id + '/tags')
      .then((res) => res.json())
      .then((data) => setSelectedIdolTags(data))
  }

  function toggleIdolTag(tagId) {
    const hasTag = selectedIdolTags.some((t) => t.id === tagId)
    if (hasTag) {
      fetch('https://dolgaeting-backend.onrender.com/api/idols/' + selectedIdol.id + '/tags/' + tagId, {
        method: 'DELETE'
      }).then(() => {
        setSelectedIdolTags(selectedIdolTags.filter((t) => t.id !== tagId))
      })
    } else {
      fetch('https://dolgaeting-backend.onrender.com/api/idols/' + selectedIdol.id + '/tags/' + tagId, {
        method: 'POST'
      }).then(() => {
        const addedTag = allTags.find((t) => t.id === tagId)
        setSelectedIdolTags([...selectedIdolTags, addedTag])
      })
    }
  }

  const tagCategories = {
    '동물상': ['강아지상','고양이상','여우상','곰상','토끼상','늑대상','다람쥐상/햄스터상','호랑이상/맹수상','병아리상'],
    '분위기': ['청순/단아','큐트/러블리','섹시/퇴폐','시크/차가운','부드러운/따뜻한'],
    '쌍꺼풀': ['쌍커풀','무쌍/속쌍']
  }

  const filteredIdols = idols.filter((idol) =>
    idol.name.toLowerCase().includes(searchText.toLowerCase()) ||
    idol.groupName.toLowerCase().includes(searchText.toLowerCase())
  )

  const inputClass = "w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-pink-400"
  const selectClass = "w-full bg-purple-950 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-400"
  const labelClass = "block text-purple-300 text-xs font-medium mb-1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">아이돌 관리</h1>
            <p className="text-purple-300 text-sm mt-1">총 {idols.length}명
              <span className="text-blue-300 ml-2">(남: {idols.filter((i) => i.gender === 'M').length}명</span>
              <span className="text-pink-300"> / 여: {idols.filter((i) => i.gender === 'F').length}명)</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition-all duration-200"
          >
            + 새 아이돌
          </button>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="이름 또는 그룹으로 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-purple-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30"
          />
          {searchText && (
            <p className="text-purple-400 text-sm mt-2 ml-1">
              {filteredIdols.length}명 검색됨
            </p>
          )}
        </div>

        {/* 아이돌 목록 */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          {filteredIdols.map((idol, index) => (
            <div
              key={idol.id}
              onClick={() => openIdol(idol)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/10 transition-colors duration-200
                ${index !== filteredIdols.length - 1 ? 'border-b border-white/10' : ''}`}
            >
              {idol.photoUrl && (
                <img
                  src={idol.photoUrl}
                  alt={idol.name}
                  className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{idol.name}</p>
                <p className="text-purple-300 text-sm truncate">{idol.groupName}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${idol.gender === 'M' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}>
                  {idol.gender === 'M' ? '남' : '여'}
                </span>
                <span className="text-purple-400 text-xs">{idol.mbti}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 팝업 */}
      {selectedIdol && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-purple-950/90 border border-white/20 rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">

            {isEditing ? (
              <div className="p-6 space-y-4">
                <h2 className="text-white font-bold text-xl mb-4">아이돌 수정</h2>

                <div>
                  <label className={labelClass}>이름</label>
                  <input value={selectedIdol.name} onChange={(e) => setSelectedIdol({ ...selectedIdol, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>그룹</label>
                  <input value={selectedIdol.groupName} onChange={(e) => setSelectedIdol({ ...selectedIdol, groupName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>성별</label>
                  <select value={selectedIdol.gender} onChange={(e) => setSelectedIdol({ ...selectedIdol, gender: e.target.value })} className={selectClass}>
                    <option value="M">남자 (M)</option>
                    <option value="F">여자 (F)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>MBTI</label>
                  <select value={selectedIdol.mbti} onChange={(e) => setSelectedIdol({ ...selectedIdol, mbti: e.target.value })} className={selectClass}>
                    {['INFP','ENFP','INFJ','ENFJ','INTJ','ENTJ','INTP','ENTP',
                      'ISFP','ESFP','ISTP','ESTP','ISFJ','ESFJ','ISTJ','ESTJ'].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>사진 주소</label>
                  <input value={selectedIdol.photoUrl || ''} onChange={(e) => setSelectedIdol({ ...selectedIdol, photoUrl: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>소개</label>
                  <textarea value={selectedIdol.introPoint || ''} onChange={(e) => setSelectedIdol({ ...selectedIdol, introPoint: e.target.value })} className={inputClass + " resize-none h-20"} />
                </div>

                {/* 태그 편집 */}
                <div>
                  <label className={labelClass}>태그 편집</label>
                  <div className="space-y-2">
                    {Object.keys(tagCategories).map((category) => (
                      <div key={category}>
                        <p className="text-purple-400 text-xs mb-1">{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {allTags
                            .filter((tag) => tagCategories[category].includes(tag.name))
                            .map((tag) => (
                              <span
                                key={tag.id}
                                onClick={() => toggleIdolTag(tag.id)}
                                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                                  ${selectedIdolTags.some((t) => t.id === tag.id)
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

                <div className="flex gap-3 pt-2">
                  <button onClick={handleUpdate} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-200">
                    수정 완료
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 border border-white/30 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all duration-200">
                    취소
                  </button>
                </div>
              </div>

            ) : (
              <div className="p-6">
                {/* 사진 + 기본 정보 */}
                <div className="flex items-center gap-4 mb-6">
                  {selectedIdol.photoUrl && (
                    <img src={selectedIdol.photoUrl} alt={selectedIdol.name}
                      className="w-20 h-20 object-cover rounded-2xl flex-shrink-0" />
                  )}
                  <div>
                    <h2 className="text-white font-bold text-2xl">{selectedIdol.name}</h2>
                    <p className="text-purple-300">{selectedIdol.groupName}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${selectedIdol.gender === 'M' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}>
                        {selectedIdol.gender === 'M' ? '남자' : '여자'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/30 text-purple-300 font-medium">
                        {selectedIdol.mbti}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 태그 */}
                <div className="mb-4">
                  <p className="text-purple-400 text-xs mb-2">태그</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdolTags.map((tag) => (
                      <span key={tag.id} className="bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs px-3 py-1 rounded-full">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 소개 */}
                {selectedIdol.introPoint && (
                  <div className="mb-6">
                    <p className="text-purple-400 text-xs mb-1">소개</p>
                    <p className="text-white/80 text-sm">{selectedIdol.introPoint}</p>
                  </div>
                )}

                {/* 버튼들 */}
                <div className="flex gap-3">
                  <button onClick={() => setSelectedIdol(null)} className="flex-1 bg-white/10 border border-white/30 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all duration-200">
                    닫기
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-200">
                    수정
                  </button>
                  <button onClick={() => { handleDelete(selectedIdol.id); setSelectedIdol(null) }} className="flex-1 bg-red-500/20 border border-red-400/30 text-red-300 font-bold py-3 rounded-xl hover:bg-red-500/30 transition-all duration-200">
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Manage