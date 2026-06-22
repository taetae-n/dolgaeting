const fs = require('fs')

const API = 'http://localhost:8080'

async function main() {
  // 1. JSON 파일 읽기
  const idols = JSON.parse(fs.readFileSync('idol_data.json', 'utf-8'))
  console.log(`총 ${idols.length}명 로딩 시작...\n`)

  // 2. 모든 고유 태그 모으기
  const tagSet = new Set()
  for (const idol of idols) {
    for (const tag of idol.tags) {
      tagSet.add(tag)
    }
  }
  const uniqueTags = [...tagSet]
  console.log(`태그 ${uniqueTags.length}개 등록 중...`)

  // 3. 태그 등록
  for (const tagName of uniqueTags) {
    await fetch(`${API}/api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tagName })
    })
  }
  console.log(`태그 등록 완료!\n`)

  // 4. 태그 목록 가져오기 (ID 확인용)
  const tagRes = await fetch(`${API}/api/tags`)
  const allTags = await tagRes.json()
  
  // 태그 이름 → ID 매핑
  const tagMap = {}
  for (const tag of allTags) {
    tagMap[tag.name] = tag.id
  }
  console.log(`태그 ID 매핑 완료 (${Object.keys(tagMap).length}개)\n`)

  // 5. 아이돌 등록 + 태그 연결
  let count = 0
  for (const idol of idols) {
    // 아이돌 등록
    const idolRes = await fetch(`${API}/api/idols`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: idol.name,
        groupName: idol.groupName,
        gender: idol.gender,
        mbti: idol.mbti,
        photoUrl: idol.photoUrl,
        introPoint: ''
      })
    })
    const savedIdol = await idolRes.json()

    // 태그 연결
    for (const tagName of idol.tags) {
      const tagId = tagMap[tagName]
      if (tagId) {
        await fetch(`${API}/api/idols/${savedIdol.id}/tags/${tagId}`, {
          method: 'POST'
        })
      }
    }

    count++
    if (count % 10 === 0) {
      console.log(`${count} / ${idols.length} 완료...`)
    }
  }

  console.log(`\n전체 완료! ${count}명 등록됨`)
}

main().catch(err => console.error('에러:', err))
