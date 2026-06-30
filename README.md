# 💜 덕질가이드: 돌개팅

> 아이돌 이상형 월드컵으로 **나도 몰랐던 최애**를 찾아주는 취향 분석 추천 서비스

129명의 아이돌 중 30라운드의 선택을 거쳐, 태그 선호도 · ELO 레이팅 · 조합 취향 · MBTI 궁합을 종합한 알고리즘으로 상위 3명을 추천합니다.

---

## 🔗 바로가기

| | 링크 |
|---|---|
| 🌐 서비스 (프론트) | [https://dolgaeting.vercel.app](https://dolgaeting.vercel.app) |
| ⚙️ API 서버 (백엔드) | [https://dolgaeting-backend.onrender.com](https://dolgaeting-backend.onrender.com) |
| 💻 프론트 저장소 | [github.com/taetae-n/dolgaeting](https://github.com/taetae-n/dolgaeting) |
| 💻 백엔드 저장소 | [github.com/taetae-n/dolgaeting-backend](https://github.com/taetae-n/dolgaeting-backend) |

> ⚠️ 백엔드는 무료 플랜(Render)을 사용하여, 일정 시간 미사용 시 슬립 모드에 들어갑니다. 첫 요청 시 30초~1분 정도 응답이 지연될 수 있습니다.

---

## 📸 스크린샷

> _(데모 화면 자리 — 추후 추가 예정)_

| 시작 화면 | 고르기 화면 | 결과 화면 |
|---|---|---|
| _이미지 추가 예정_ | _이미지 추가 예정_ | _이미지 추가 예정_ |

---

## 🛠️ 기술 스택

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS

**Backend**
- Spring Boot (Java 21)
- Spring Data JPA
- PostgreSQL (Neon)

**Infra / Deploy**
- Vercel (Frontend)
- Render — Docker 배포 (Backend)
- Git Push 기반 자동 배포 (Vercel CI, Render Auto-Deploy)

**External API**
- YouTube Data API v3 — 직캠 영상 검색 및 사이트 내 임베드 재생

---

## ✨ 주요 기능

### 1. 이상형 월드컵
- 선택한 성별의 아이돌 30라운드 토너먼트 (중복 없는 랜덤 매칭)
- "둘 다 별로에요" 스킵 기능 — 비선호 신호도 채점에 반영
- 이미지 Preload로 다음 라운드 전환 시 끊김 없는 UX

### 2. 추천 채점 엔진 ⭐
선택 데이터를 다각도로 분석해 종합 점수를 산출합니다.

```
appearanceScore = tagPreferenceScore × 0.55   (라플라스 스무딩 기반 선호도)
                + tagEloScore        × 0.25   (ELO 레이팅 기반 상대 우위)
                + comboScore          × 0.15   (태그 조합 선호도)
                + confidenceScore     × 0.05   (노출 횟수 기반 신뢰도)

finalScore = appearanceScore × 0.85 + mbtiScore × 0.15
```

| 요소 | 설명 |
|---|---|
| **태그 선호도** | 라플라스 스무딩으로 적은 표본의 극단값을 보정 |
| **ELO 레이팅** | 태그 간 1:1 대결로 보고 체스 레이팅 시스템 응용 — 단순 빈도가 아닌 상대적 우위 측정 |
| **조합 선호도** | "고양이상 + 시크" 같은 동물상×분위기 조합 자체의 선호도 |
| **신뢰도 보정** | 적게 노출된 태그의 판단을 보수적으로 조정 |
| **MBTI 궁합** | 16×16 실제 궁합표 기반 5단계 점수 — 필터가 아닌 가중치로 반영해 취향 1순위가 궁합 때문에 배제되지 않도록 설계 |

### 3. 직캠 모달 (YouTube Data API 연동)
- 결과 카드 호버 시 인터랙션, 클릭 시 모달에서 직캠 영상 검색
- 영상 클릭 시 사이트 이탈 없이 그 자리에서 재생 (iframe embed)
- 한 아이돌의 영상 3개를 다 보면 "입덕 인증 쿠폰" 팝업 (재미 요소, 실사용 불가 명시)
- API 일일 쿼터(10,000유닛, 검색 1회=100유닛)를 고려해 결과당 1회 검색으로 설계

### 4. 관리자 페이지
- 비밀번호 보호된 관리자 전용 라우트
- 아이돌 등록 / 검색 / 수정 / 삭제
- 카테고리별(동물상·분위기·쌍꺼풀) 태그 토글 편집
- 이용 기록(세션) 조회 — 선택 삭제 / 전체 초기화

### 5. 반응형 디자인
- 모바일 · 태블릿 · 데스크탑 대응
- 결과 화면은 데스크탑에서 시상대(1등 중앙) 배치, 모바일에서는 세로 배치로 전환

---

## 🗂️ 프로젝트 구조

```
dolgaeting/              (Frontend)
├── src/
│   ├── Home.jsx          # 시작 화면 (이름/MBTI 입력)
│   ├── Select.jsx        # 성별 선택
│   ├── Play.jsx          # 이상형 월드컵
│   ├── Result.jsx        # 채점 엔진 + 결과 화면 + 직캠 모달
│   ├── Admin.jsx         # 아이돌 등록
│   ├── Manage.jsx        # 아이돌 관리
│   ├── Sessions.jsx      # 이용 기록
│   └── AdminAuth.jsx     # 관리자 인증 래퍼

dolgaeting-backend/       (Backend)
├── src/main/java/com/example/demo/
│   ├── Idol.java / IdolController.java / IdolRepository.java
│   ├── Tag.java / TagController.java / TagRepository.java
│   ├── IdolTag.java / IdolTagRepository.java
│   ├── GameSession.java / GameSessionController.java
│   └── YoutubeController.java
└── Dockerfile
```

---

## 🧩 설계 의도 / 트러블슈팅

- **MBTI를 필터가 아닌 가중치로**: 초기엔 MBTI 궁합 0.4 이하를 완전히 제외했으나, "외모 취향 1위가 성격 궁합 때문에 후보에서 탈락하는 것"이 부자연스럽다고 판단해 감점 방식으로 전환
- **태그 점수의 한계 보완**: 단순 빈도 기반 선호도는 표본이 적을 때 극단적인 값이 나오는 문제가 있어, 라플라스 스무딩에 더해 ELO 레이팅(상대적 우위)과 신뢰도 보정을 추가로 도입
- **API 비용 구조 우선 파악**: YouTube Data API 연동 전 쿼터 정책(검색 1회=100유닛, 일일 10,000유닛)을 먼저 조사해 "결과당 1회 검색"으로 사용 패턴을 설계
- **시청 추적 로직 반복 개선**: 클릭 수 → 목록 복귀 횟수 → 시청한 영상 ID 집합(아이돌별 초기화) 순으로, "무엇을 측정해야 정확한지"를 따져가며 점진적으로 정교화

---

## 📝 향후 개선 계획

- [ ] AI 기반 취향 분석 멘트 생성 (Claude API 연동)
- [ ] 관리자 인증을 백엔드 기반(Spring Security)으로 강화
- [ ] 픽 데이터 DB 저장 → 전체 사용자 트렌드 분석 / 협업 필터링 추천으로 확장
- [ ] 이미지/성명 저작권 검토 후 공개 데이터셋 정비

---

## 👤 만든 사람

타에현 ([@taetae-n](https://github.com/taetae-n))
