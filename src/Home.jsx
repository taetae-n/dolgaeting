import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [userName, setUserName] = useState('')
  const [userMbti, setUserMbti] = useState('INFP')
  const navigate = useNavigate()

  function handleStart() {
    if (userName.trim() === '') {
      alert('이름을 입력해주세요!')
      return
    }
    navigate('/select', { state: { userName: userName, userMbti: userMbti } })
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>덕질가이드: 돌개팅</h1>
      <p>나도 몰랐던 최애를 찾아드려요!</p>

      <div style={{ marginBottom: '16px' }}>
        <label>이름: </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>MBTI: </label>
        <select value={userMbti} onChange={(e) => setUserMbti(e.target.value)}>
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

      <button onClick={handleStart}>시작하기</button>
    </div>
  )
}

export default Home