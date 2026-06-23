import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Manage() {
  const [idols, setIdols] = useState([])
  const [tags, setTags] = useState([])
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [selectedIdolTags, setSelectedIdolTags] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [allTags, setAllTags] = useState([])

  function loadIdols() {
    fetch('http://localhost:8080/api/idols')
      .then((res) => res.json())
      .then((data) => setIdols(data))
  }

  useEffect(() => {
    loadIdols()
    fetch('http://localhost:8080/api/tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data))
  }, [])

  function handleDelete(idolId) {
    fetch('http://localhost:8080/api/idols/' + idolId, {
      method: 'DELETE'
    }).then(() => loadIdols())
  }

  function handleUpdate() {
    fetch('http://localhost:8080/api/idols/' + selectedIdol.id, {
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
    fetch('http://localhost:8080/api/idols/' + idol.id + '/tags')
      .then((res) => res.json())
      .then((data) => setSelectedIdolTags(data))
  }

  function toggleIdolTag(tagId) {
    const hasTag = selectedIdolTags.some((t) => t.id === tagId)

    if (hasTag) {
      fetch('http://localhost:8080/api/idols/' + selectedIdol.id + '/tags/' + tagId, {
        method: 'DELETE'
      }).then(() => {
        setSelectedIdolTags(selectedIdolTags.filter((t) => t.id !== tagId))
      })
    } else {
      fetch('http://localhost:8080/api/idols/' + selectedIdol.id + '/tags/' + tagId, {
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
    idol.name.includes(searchText) ||
    idol.groupName.includes(searchText)
  )

  const navigate = useNavigate()

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>아이돌 관리
        <button
          onClick={() => navigate('/admin')}
          style={{ marginLeft: '16px', fontSize: '14px' }}
        >
          + 새 아이돌 등록
        </button>
      </h1>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="이름 또는 그룹으로 검색..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <span style={{ marginLeft: '12px' }}>
          {filteredIdols.length} / {idols.length}명
        </span>
      </div>

      <ul>
        {filteredIdols.map((idol) => (
          <li
            key={idol.id}
            onClick={() => openIdol(idol)}
            style={{ cursor: 'pointer', marginBottom: '4px' }}
          >
            {idol.name} ({idol.gender}) - {idol.groupName}
          </li>
        ))}
      </ul>

      {selectedIdol && (
        <div style={{
          position: 'fixed',
          top: '0', left: '0', right: '0', bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            minWidth: '300px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {isEditing ? (
              <div>
                <h2>아이돌 수정</h2>
                <div><label>이름: </label>
                  <input value={selectedIdol.name}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, name: e.target.value })} />
                </div>
                <div><label>그룹: </label>
                  <input value={selectedIdol.groupName}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, groupName: e.target.value })} />
                </div>
                <div><label>성별: </label>
                  <select value={selectedIdol.gender}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, gender: e.target.value })}>
                    <option value="M">남자 (M)</option>
                    <option value="F">여자 (F)</option>
                  </select>
                </div>
                <div><label>MBTI: </label>
                  <select value={selectedIdol.mbti}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, mbti: e.target.value })}>
                    <option value="INFP">INFP</option>
                    <option value="ENFP">ENFP</option>
                    <option value="INFJ">INFJ</option>
                    <option value="ENFJ">ENFJ</option>
                    <option value="INTJ">INTJ</option>
                    <option value="ENTJ">ENTJ</option>
                    <option value="INTP">INTP</option>
                    <option value="ENTP">ENTP</option>
                    <option value="ISFP">ISFP</option>
                    <option value="ESFP">ESFP</option>
                    <option value="ISTP">ISTP</option>
                    <option value="ESTP">ESTP</option>
                    <option value="ISFJ">ISFJ</option>
                    <option value="ESFJ">ESFJ</option>
                    <option value="ISTJ">ISTJ</option>
                    <option value="ESTJ">ESTJ</option>
                  </select>
                </div>
                <div><label>사진 주소: </label>
                  <input value={selectedIdol.photoUrl || ''}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, photoUrl: e.target.value })} />
                </div>
                <div><label>소개: </label>
                  <textarea value={selectedIdol.introPoint || ''}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, introPoint: e.target.value })} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong>태그 편집:</strong>
                  {Object.keys(tagCategories).map((category) => (
                    <div key={category} style={{ marginTop: '8px' }}>
                      <em>{category}: </em>
                      {allTags
                        .filter((tag) => tagCategories[category].includes(tag.name))
                        .map((tag) => (
                          <span
                            key={tag.id}
                            onClick={() => toggleIdolTag(tag.id)}
                            style={{
                              marginRight: '8px',
                              cursor: 'pointer',
                              fontWeight: selectedIdolTags.some((t) => t.id === tag.id) ? 'bold' : 'normal',
                              color: selectedIdolTags.some((t) => t.id === tag.id) ? 'blue' : 'gray'
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
                <button onClick={handleUpdate}>수정 완료</button>
                <button onClick={() => setIsEditing(false)} style={{ marginLeft: '8px' }}>취소</button>
              </div>
            ) : (
              <div>
                <h2>{selectedIdol.name}</h2>
                {selectedIdol.photoUrl && (
                  <img src={selectedIdol.photoUrl} alt={selectedIdol.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                )}
                <p>그룹: {selectedIdol.groupName}</p>
                <p>성별: {selectedIdol.gender}</p>
                <p>MBTI: {selectedIdol.mbti}</p>
                <p>소개: {selectedIdol.introPoint}</p>
                <p>태그: {selectedIdolTags.map((tag) => '#' + tag.name).join(' ')}</p>
                <button onClick={() => setSelectedIdol(null)}>닫기</button>
                <button onClick={() => setIsEditing(true)} style={{ marginLeft: '8px' }}>수정</button>
                <button onClick={() => { handleDelete(selectedIdol.id); setSelectedIdol(null) }} style={{ marginLeft: '8px' }}>삭제</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Manage