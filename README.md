# FINDS Lab Website

Financial Data Intelligence & Solutions Laboratory 공식 웹사이트입니다.

## 설치 및 실행 방법

### 요구사항

- **Node.js** 20 이상
- **pnpm** 패키지 매니저

### 설치

1. Node.js 버전 확인 및 pnpm 설치

```bash
node -v  # v20 이상 확인
npm i -g pnpm
```

2. 의존성 설치

```bash
pnpm install
```

### 실행

개발 환경에서 실행:

```bash
pnpm run dev
```

브라우저에서 `http://localhost:5173` 접속

프로덕션 빌드:

```bash
pnpm run build
```

빌드 결과물 미리보기:

```bash
pnpm run preview
```

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS |
| 라우팅 | React Router |
| 호스팅 | GitHub Pages |
| CI/CD | GitHub Actions |

## 폴더 구조

```
├── public/
│   ├── data/                    # 데이터 파일 (JSON, Markdown)
│   │   ├── pubs.json           # 논문 목록
│   │   ├── projects.json       # 프로젝트 목록
│   │   ├── honors.json         # 수상 내역
│   │   ├── lectures.json       # 강의 목록
│   │   ├── alumni.json         # 졸업생/수료생 목록
│   │   ├── mentees.json        # 멘티 목록
│   │   ├── academicactivities.json  # 학술 활동
│   │   ├── authors.json        # 저자 정보
│   │   ├── members/            # 현재 멤버 개별 JSON
│   │   ├── news/               # 뉴스 (Markdown)
│   │   ├── notice/             # 공지사항 (Markdown)
│   │   ├── gallery/            # 갤러리
│   │   └── playlist/           # 플레이리스트
│   └── images/                  # 이미지 파일
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── templates/          # 페이지별 템플릿
│   │   ├── organisms/          # 레이아웃 컴포넌트
│   │   └── ui/                 # 공통 UI 컴포넌트
│   ├── pages/                  # 페이지 라우팅
│   ├── types/                  # TypeScript 타입 정의
│   ├── stores/                 # 상태 관리 (Zustand)
│   └── assets/                 # 정적 자산
├── .github/
│   └── workflows/
│       ├── deploy.yml          # 자동 배포
│       └── cleanup-runs.yml    # 워크플로우 기록 정리
└── package.json
```

## 데이터 관리

모든 콘텐츠는 `public/data/` 폴더의 JSON 또는 Markdown 파일로 관리됩니다.

### 주요 데이터 파일

#### `pubs.json` - 논문 목록

```json
{
  "type": "journal",           // journal, conference, book, report
  "indexing_group": "SSCI",    // SSCI, SCIE, Scopus, etc.
  "published_date": "2025-01-01",
  "year": 2025,
  "title": "논문 제목",
  "title_ko": "한글 제목",
  "authors": [1, 2, 3],        // authors.json의 ID 참조
  "venue": "저널명",
  "doi": "10.xxxx/xxxxx"
}
```

#### `projects.json` - 프로젝트 목록

```json
{
  "title": "프로젝트명",
  "title_ko": "한글 프로젝트명",
  "period": "2025-01-01 – 2025-12-31",
  "type": "government",        // government, industry, institution, research
  "organization": "기관명",
  "participants": ["참여자1", "참여자2"]
}
```

#### `honors.json` - 수상 내역 (연도별 그룹)

```json
{
  "2025": [
    {
      "type": "award",
      "title": "우수논문상",
      "event": "학회명",
      "date": "Dec 5",
      "winners": [{"name": "이름", "level": "phd"}]
    }
  ]
}
```

#### `members/*.json` - 현재 멤버

각 멤버별 개별 JSON 파일로 관리됩니다.

```json
{
  "id": "kbo1-undergrad",
  "name": {"ko": "강병오"},
  "degree": "undergrad",
  "status": "active",
  "period": {"start": "2025-12-22", "end": "2026-03-01"},
  "research": {
    "interests": ["Financial Data Science", "..."],
    "project": {"ko": "프로젝트명", "en": "Project Name"}
  },
  "education": [...]
}
```

### News / Notice 작성

`public/data/news/` 또는 `public/data/notice/` 폴더에 Markdown 파일 추가:

1. 파일명 형식: `YYYY-MM-DD-N.md` (예: `2025-09-01-1.md`)

2. 파일 내용:
```markdown
---
title: "제목"
date: 2025-09-01
author: "작성자"
---

본문 내용 (Markdown 문법 지원)
```

3. `index.json`에 파일명 추가:
```json
{
  "files": [
    "2025-09-01-1.md",
    "2025-06-14-1.md"
  ]
}
```

## 배포

### 자동 배포 (권장)

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 및 배포합니다.

```bash
git add .
git commit -m "Update content"
git push origin main
```

배포 상태는 GitHub repository → **Actions** 탭에서 확인할 수 있습니다.

### 수동 배포

1. 빌드
```bash
pnpm run build
```

2. `dist/` 폴더의 내용을 웹서버에 업로드

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/about/introduction` | 연구실 소개 |
| `/about/research` | 연구 분야 |
| `/about/honors` | 수상 내역 |
| `/members/director` | 지도교수 |
| `/members/current` | 현재 멤버 |
| `/members/alumni` | 졸업생/수료생 |
| `/publications` | 논문 목록 |
| `/projects` | 프로젝트 |
| `/lectures` | 강의 |
| `/mentoring` | 멘토링 |
| `/archives/news` | 뉴스 |
| `/archives/notice` | 공지사항 |
| `/archives/gallery` | 갤러리 |
| `/archives/playlist` | 플레이리스트 (PC 전용) |
| `/contact` | 연락처 |

## 색상 팔레트

| 이름 | 코드 | 용도 |
|------|------|------|
| FINDS Gold | `#D6B14D` | Primary 강조색 |
| FINDS Red | `#AC0E0E` | Secondary 강조색 |
| Honey | `#D6C360` | 골드 변형 |
| Cream | `#E8D688` | 연한 골드 |
| Coral | `#D6A076` | 따뜻한 톤 |
| Rose | `#E8889C` | 핑크 |
| Blossom | `#FFBAC4` | 연한 핑크 |

## 문의

웹사이트 관련 문의: [ischoi@gachon.ac.kr](mailto:ischoi@gachon.ac.kr)
