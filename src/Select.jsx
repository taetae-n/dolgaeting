import { useNavigate, useLocation } from 'react-router-dom'

function Select() {
  const navigate = useNavigate()
  const { state } = useLocation()

  function chooseGender(gender) {
    navigate('/play/' + gender, { state: state })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex flex-col items-center justify-center px-4">

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          누구를 찾아볼까요?
        </h1>
        <p className="text-purple-200 text-lg">
          성별을 선택하세요
        </p>
      </div>

      <div className="flex gap-6">
        {/* 남자 아이돌 */}
        <button
          onClick={() => chooseGender('M')}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-36 md:w-52 text-center hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-2xl group"
        >
          <div className="text-4xl md:text-6xl mb-4">🧑‍🎤</div>
          <div className="text-white font-bold text-base md:text-xl mb-1">남자 아이돌</div>
          <div className="text-purple-300 text-xs md:text-sm">Boys</div>
        </button>

        {/* 여자 아이돌 */}
        <button
          onClick={() => chooseGender('M')}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-36 md:w-52 text-center hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-2xl group"
        >
          <div className="text-4xl md:text-6xl mb-4">👩‍🎤</div>
          <div className="text-white font-bold text-base md:text-xl mb-1">여자 아이돌</div>
          <div className="text-purple-300 text-xs md:text-sm">Girls</div>
        </button>
      </div>

      <div className="mt-12 text-purple-300 text-sm">
        ✨ {state?.userName}님의 취향을 분석할게요 ✨
      </div>
    </div>
  )
}

export default Select