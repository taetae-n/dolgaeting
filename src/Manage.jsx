import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Manage() {
  const [idols, setIdols] = useState([])
  const [tags, setTags] = useState([])
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [selectedIdolTags, setSelectedIdolTags] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [searchText, setSearchText] = useState('')

  function loadIdols() {
    fetch('http://localhost:8080/api/idols')
      .then((res) => res.json())
      .then((data) => setIdols(data))
  }

  useEffect(() => {
    loadIdols()
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
                <div><label>직캠 링크: </label>
                  <input value={selectedIdol.fancamUrl || ''}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, fancamUrl: e.target.value })} />
                </div>
                <div><label>사진 주소: </label>
                  <input value={selectedIdol.photoUrl || ''}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, photoUrl: e.target.value })} />
                </div>
                <div><label>소개: </label>
                  <textarea value={selectedIdol.introPoint || ''}
                    onChange={(e) => setSelectedIdol({ ...selectedIdol, introPoint: e.target.value })} />
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
                <p>직캠: <a href={selectedIdol.fancamUrl} target="_blank" rel="noopener noreferrer">{selectedIdol.fancamUrl}</a></p>
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