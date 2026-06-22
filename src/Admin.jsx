import { useState, useEffect } from 'react'

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

  function loadIdols() {
    fetch('http://localhost:8080/api/idols')
      .then((response) => response.json())
      .then((data) => setIdols(data))
  }

  function loadTags() {
    fetch('http://localhost:8080/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data))
  }

  useEffect(() => {
    loadIdols()
    loadTags()
  }, [])

  function handleSubmit() {
    fetch('http://localhost:8080/api/idols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name, gender: gender, groupName: groupName, 
        mbti: mbti, fancamUrl: fancamUrl, introPoint: introPoint, 
        photoUrl: photoUrl })
    })
      .then((response) => response.json())
      .then((data) => {
        const newIdolId = data.id

        return Promise.all(
          selectedTagIds.map((tagId) =>
            fetch('http://localhost:8080/api/idols/' + newIdolId + '/tags/' + tagId, {
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
        fetch('http://localhost:8080/api/tags', {
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


  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>아이돌 등록</h1>

      <div style={{ marginBottom: '16px' }}>
        <label>이름: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>그룹: </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>성별: </label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="M">남자 (M)</option>
          <option value="F">여자 (F)</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>MBTI: </label>
        <select value={mbti} onChange={(e) => setMbti(e.target.value)}>
          <option value="INFP"> INFP </option>
          <option value="ENFP"> ENFP </option>
          <option value="INFJ"> INFJ </option>
          <option value="ENFJ"> ENFJ </option>
          <option value="INTJ"> INTJ </option>
          <option value="ENTJ"> ENTJ </option>
          <option value="INTP"> INTP </option>
          <option value="ENTP"> ENTP </option>
          <option value="ISFP"> ISFP </option>
          <option value="ESFP"> ESFP </option>
          <option value="ISTP"> ISTP </option>
          <option value="ESTP"> ESTP </option>
          <option value="ISFJ"> ISFJ </option>
          <option value="ESFJ"> ESFJ </option>
          <option value="ISTJ"> ISTJ </option>
          <option value="ESTJ"> ESTJ </option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>직캠 링크: </label>
        <input
          type="text"
          value={fancamUrl}
          onChange={(e) => setFancamUrl(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>사진 주소: </label>
        <input
          type="text"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>소개: </label>
        <textarea
          value={introPoint}
          onChange={(e) => setIntroPoint(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>태그 추가: </label>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
        />
        <button onClick={handleAddTag}>태그 추가</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>태그 (클릭해서 선택): </strong>
        {tags.map((tag) => (
          <span
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              fontWeight: selectedTagIds.includes(tag.id) ? 'bold' : 'normal',
              color: selectedTagIds.includes(tag.id) ? 'blue' : 'gray'
            }}
          >
            #{tag.name}
          </span>
        ))}
      </div>

      <button onClick={handleSubmit}>등록</button>
    </div>
  )
}

export default Admin