import { useNavigate, useLocation } from 'react-router-dom'

function Select() {
  const navigate = useNavigate()
  const { state } = useLocation()

  function chooseGender(gender) {
    navigate('/play/' + gender, { state: state })
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>누구를 찾아볼까요?</h1>
      <p>보고 싶은 아이돌을 선택하세요</p>

      <button
        onClick={() => chooseGender('M')}
        style={{ marginRight: '12px', padding: '12px 24px' }}
      >
        남자 아이돌
      </button>

      <button
        onClick={() => chooseGender('F')}
        style={{ padding: '12px 24px' }}
      >
        여자 아이돌
      </button>
    </div>
  )
}

export default Select