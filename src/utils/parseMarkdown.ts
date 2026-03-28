export interface ParsedMarkdown {
  data: Record<string, string | string[]>
  content: string
}

export const parseMarkdown = (text: string): ParsedMarkdown => {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = text.match(frontMatterRegex)
  if (!match) return { data: {}, content: text }

  const yaml = match[1]
  const content = match[2]
  const data: Record<string, string | string[]> = {}

  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()

      // 배열 처리 [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(t => t.trim())
      } else {
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        data[key] = value
      }
    }
  })

  return { data, content }
}

// Jekyll 날짜 포맷 변환
const formatDate = (dateStr: string, format: string): string => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // 일반적인 Jekyll 날짜 포맷 처리
  return format
    .replace('%Y', String(year))
    .replace('%m', month)
    .replace('%d', day)
    .replace('%B', date.toLocaleString('en', { month: 'long' }))
    .replace('%b', date.toLocaleString('en', { month: 'short' }))
}

// 마크다운을 HTML로 변환하는 함수
export const markdownToHtml = (markdown: string, options?: { basePath?: string }): string => {
  const basePath = options?.basePath || ''
  let html = markdown

  // 1. 코드 블록 먼저 보호 (다른 변환에 영향받지 않도록)
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : ''
    const placeholder = `___CODEBLOCK_${codeBlocks.length}___`
    codeBlocks.push(`<pre><code${langClass}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`)
    return placeholder
  })

  // 2. 인라인 코드 보호
  const inlineCodes: string[] = []
  html = html.replace(/`([^`]+)`/g, (_match, code) => {
    const placeholder = `___INLINECODE_${inlineCodes.length}___`
    inlineCodes.push(`<code>${code}</code>`)
    return placeholder
  })

  // 3. 이미지 처리 - ![alt](url) or ![alt](url "title")
  html = html.replace(/!\[([^\]]*)\]\(([^)"]+)(?:\s+"([^"]*)")?\)/g, (_match, alt, url, title) => {
    let imgUrl = url
    // 절대 URL이 아닌 경우 basePath 추가
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      if (url.startsWith('/') && basePath) {
        imgUrl = basePath + url
      } else if (url.startsWith('../') || url.startsWith('./')) {
        imgUrl = basePath + '/' + url.replace(/^\.\//, '')
      } else {
        // 단순 파일명인 경우 (logo-finds.png 등)
        imgUrl = basePath + '/' + url
      }
    }
    const titleAttr = title ? ` title="${title}"` : ''
    return `<img src="${imgUrl}" alt="${alt}"${titleAttr} />`
  })

  // 4. 링크 처리 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // 5. 헤더 처리 (줄 단위로)
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 6. 수평선 --- or *** (단독 줄에만)
  html = html.replace(/^[-*]{3,}\s*$/gm, '<hr />')

  // 7. 줄 단위로 목록 처리 (굵은 글씨 처리 전에 먼저 수행)
  const lines = html.split('\n')
  const result: string[] = []
  let inUl = false
  let inOl = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 순서 없는 목록 (- item 형태)
    const ulMatch = line.match(/^- (.+)$/)
    if (ulMatch) {
      if (!inUl) {
        result.push('<ul>')
        inUl = true
      }
      result.push(`<li>${ulMatch[1]}</li>`)
      continue
    } else if (inUl && !line.match(/^- /)) {
      result.push('</ul>')
      inUl = false
    }

    // 순서 있는 목록
    const olMatch = line.match(/^\d+\. (.+)$/)
    if (olMatch) {
      if (!inOl) {
        result.push('<ol>')
        inOl = true
      }
      result.push(`<li>${olMatch[1]}</li>`)
      continue
    } else if (inOl && !line.match(/^\d+\. /)) {
      result.push('</ol>')
      inOl = false
    }

    result.push(line)
  }

  // 목록 닫기
  if (inUl) result.push('</ul>')
  if (inOl) result.push('</ol>')

  html = result.join('\n')

  // 8. 굵은 글씨 **text** (리스트 처리 후)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // 9. 기울임 *text* (굵은 글씨 처리 후이므로 남은 단일 *만 처리)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/\b_(.+?)_\b/g, '<em>$1</em>')

  // 10. 인용문 > text
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br />')

  // 11. 단락 처리 (빈 줄로 구분)
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs.map(p => {
    p = p.trim()
    if (!p) return ''
    // 이미 블록 요소로 감싸진 경우 건너뛰기
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || 
        p.startsWith('<blockquote') || p.startsWith('<pre') || p.startsWith('<hr') ||
        p.startsWith('<img') || p.startsWith('<p') || p.startsWith('___CODEBLOCK') ||
        p.startsWith('<li')) {
      return p
    }
    // 단일 줄바꿈은 <br>로
    return `<p>${p.replace(/\n/g, '<br />')}</p>`
  }).join('\n')

  // 12. 코드 블록 복원
  codeBlocks.forEach((block, i) => {
    html = html.replace(`___CODEBLOCK_${i}___`, block)
  })

  // 13. 인라인 코드 복원
  inlineCodes.forEach((code, i) => {
    html = html.replace(`___INLINECODE_${i}___`, code)
  })

  return html
}

// Jekyll 필터 처리하여 콘텐츠 변환
export const processJekyllContent = (
  content: string, 
  data: Record<string, string | string[]>,
  options?: { basePath?: string }
): string => {
  let processed = content
  const basePath = options?.basePath || ''

  // {{ page.key | filter: "arg" }} 패턴 처리
  const templateRegex = /\{\{\s*page\.(\w+)(?:\s*\|\s*([^}]+))?\s*\}\}/g
  
  processed = processed.replace(templateRegex, (_match: string, key: string, filters: string | undefined) => {
    let value: string | string[] | undefined = data[key]
    
    // 값이 배열이면 join
    if (Array.isArray(value)) {
      value = value.join(', ')
    }
    
    // 필터가 없으면 값만 반환
    if (!filters) {
      return value || ''
    }
    
    // 필터 파싱 및 적용
    const filterParts = filters.split('|').map((f: string) => f.trim())
    
    for (const filterPart of filterParts) {
      // date: "%Y.%m.%d"
      const dateMatch = filterPart.match(/^date:\s*"([^"]+)"/)
      if (dateMatch) {
        value = formatDate(value || '', dateMatch[1])
        continue
      }
      
      // default: "value"
      const defaultMatch = filterPart.match(/^default:\s*"([^"]*)"/)
      if (defaultMatch) {
        if (!value || value === '') {
          value = defaultMatch[1]
        }
        continue
      }
      
      // relative_url (경로 처리)
      if (filterPart === 'relative_url') {
        if (value && typeof value === 'string') {
          value = basePath + value
        }
        continue
      }
    }
    
    return value || ''
  })

  // {{ site.* }} 패턴 제거
  processed = processed.replace(/\{\{\s*site\.[^}]*\}\}/g, '')

  // 마크다운을 HTML로 변환
  processed = markdownToHtml(processed, { basePath })

  return processed
}
