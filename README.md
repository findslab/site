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
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 7 |
| 스타일링 | Tailwind CSS v4 (`src/assets/css/theme.css`) |
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
│   │   ├── atoms/              # 작은 공통 컴포넌트 (EmptyNote 등)
│   │   └── common/             # 공통 모달 등
│   ├── pages/                  # 페이지 라우팅 (라우트 정의: pages/app/index.tsx)
│   ├── data/                   # 코드 내 고정 데이터 (director-common.ts: 인용 지표 기본값 등)
│   ├── store/                  # 상태 관리 (Zustand)
│   ├── hooks/ · utils/ · libs/ · constants/
│   ├── types/                  # TypeScript 타입 정의
│   └── assets/                 # 정적 자산 (css/theme.css: 디자인 원칙 구현)
├── scripts/
│   ├── design_audit.mjs        # 디자인 원칙 자동 점검 (pnpm run audit:design)
│   └── *.py                    # 인용문·통계 생성 스크립트
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
  "type": "conference",            // journal, conference, book, report
  "indexing_group": "Domestic Conference", // SCIE, SSCI, A&HCI, ESCI, Scopus, KCI, International Conference ...
  "presentation_type": "oral",     // 학회 발표만: oral, poster
  "published_date": "2026-11-21",
  "year": 2026,
  "title": "Title in Title Case",
  "title_ko": "국문 제목",
  "authors": [1, 2],               // authors.json의 ID
  "author_marks": ["1", "*"],     // 1·2·3 = 제1~3저자, * = 교신, "1,*" 가능, P·L·R·A = 프로젝트 역할
  "venue": "English venue",
  "venue_ko": "국문 학회·학술지명",
  "language": "Korean",            // 저서는 번호 아래 언어 배지로 표시
  "doi": "10.xxxx/xxxxx",
  "awards": 1, "award_details": { "prize_ko": "우수논문상", "...": "..." },
  "citations": { }                 // 비워 두면 scripts/*_citations.py --write 가 생성
}
```

학회 인용문은 `python3 scripts/conf_citations.py --write`, 학술지 인용문은 `python3 scripts/journal_citations.py --write`로 만듭니다. `--check`로 바뀔 항목만 미리 볼 수 있습니다.

#### `projects.json` - 프로젝트 목록

```json
{
  "titleKo": "국문 과제명",
  "titleEn": "English Title",
  "period": "2026-09-01 – 2029-08-31",
  "type": "government",            // government, industry, institution, academic
  "fundingAgency": "National Research Foundation of Korea",
  "fundingAgencyKo": "한국연구재단",
  "programName": "사업명", "programNameEn": "Program Name",
  "roles": {
    "principalInvestigator": "최인수",
    "leadResearcher": [{"name": "최인수", "lab": true}],
    "visitingResearcher": "",
    "researchers": [{"name": "이름", "lab": true}]
  },
  "language": "ko"
}
```

#### `honors.json` - 수상 내역 (연도별 그룹)

```json
{
  "2026": [
    {
      "type": "award",              // award, honor
      "icon": "🏆",
      "title": "우수논문상",
      "title_en": "Best Paper Award",
      "event": "2026 학회명 학술대회",
      "organization": "학회명",
      "date": "Jul 10",
      "winners": [{"name": "최인수", "level": "phd"}]
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

### 인용 지표 (Google Scholar) 갱신

자동 갱신은 없습니다. 필요할 때 손으로 갱신하고, 사이트의 Research Overview 아래에 **"Google Scholar · YYYY-MM-DD 기준"**으로 그 날짜가 표시됩니다.

1. Google Scholar 프로필에서 **Show more**로 논문을 모두 펼친 뒤 페이지 전체를 복사해 텍스트 파일로 저장합니다 (채팅에 붙여넣어 요청해도 됩니다).
2. 아래 명령을 실행합니다. `--date`는 기준일이며, 생략하면 오늘 날짜입니다.
```bash
python3 scripts/update_scholar.py 붙여넣은파일.txt --date 2026-10-22
```
3. Citations·h-index·i10-index는 요약표 값을 그대로 쓰고, i5·g·e-index와 m-quotient는 논문별 인용수로 계산합니다. `scholar.json`과 `director-common.ts`(기본값, 기준일)가 함께 바뀝니다.

### News / Notice 작성

`public/data/news/` 또는 `public/data/notice/` 폴더에 Markdown 파일 추가:

1. 파일명 형식: `YYYY-MM-DD-N.md` (예: `2025-09-01-1.md`)

2. 파일 내용:
```markdown
---
title: "제목"
date: 2025-09-01
author: "FINDS Lab"
excerpt: "목록에 보이는 한두 문장 요약"
tag: "Awards"        # 뉴스: Honors · Awards · Events · General / 공지: Announcements · Recruitment · General
attachments:          # 공지 첨부파일 (선택, 파일은 같은 폴더에)
  - name: "이력서 양식"
    file: "이력서양식.docx"
---

본문 내용 (Markdown 문법 지원: 굵게, 목록·중첩 목록, 인용, `코드`, 링크)
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
| `/about/honors` | 수상 내역 (연구실 출범 2025-06-14 이후) |
| `/about/location` | 오시는 길 |
| `/members/director` | 지도교수 (Profile) |
| `/members/director/academic` | 지도교수 (Academics: 논문·프로젝트·학술활동·강의) |
| `/members/director/activities` | 지도교수 (Activities: 수상·대외활동) |
| `/members/director/portfolio/*` | 지도교수 포트폴리오 (profile · academic · activities) |
| `/members/current` | 현재 구성원 |
| `/members/alumni` | 졸업생·수료생 |
| `/members/detail/:id` | 구성원 상세 (`public/data/members/<id>.json`) |
| `/publications` | 논문 목록 |
| `/projects` | 프로젝트 (연구실 출범 이후) |
| `/archives/news` | 뉴스 |
| `/archives/notice` | 공지사항 |
| `/archives/gallery` | 갤러리 |
| `/archives/playlist` | 플레이리스트 (PC 전용) |

등록되지 않은 주소는 홈으로 이동합니다. `src/pages/lectures`는 남아 있지만 라우터에 연결돼 있지 않으며, 강의 정보는 지도교수 페이지의 Teaching에서 보여 줍니다.

## 디자인 원칙

사이트 전체 스타일 규칙은 `src/assets/css/theme.css` 한 곳에 모여 있습니다. 새 페이지나 컴포넌트를 만들 때 아래 원칙을 따르면 자동으로 같은 톤이 적용됩니다.

### 1. 색상: 공식 팔레트 14색만 사용

갤러리의 "FINDS Lab Color Palette"가 기준입니다. 이 14색과 무채색(흰색·회색·검정) 외의 색은 쓰지 않습니다.

| 계열 | 색 (밝은 → 진한) |
|------|------|
| 금색 | Sunlight `#FFEB99` · Vanilla `#FFF3CC` · Buttercream `#FFF9E6` · Cream `#E8D688` · Honey `#D6C360` · **FINDS Gold `#D6B14D`** · Amber `#B8962D` · Oak `#9A7D1F` |
| 빨강 | Blush `#FFE4E9` · Blossom `#FFBAC4` · Rose `#E8889C` · Ruby `#C41E3A` · **FINDS Red `#AC0E0E`** |
| 단독 | Coral `#D6A076` |

- **그라데이션은 같은 계열 안에서만.** 금색 면은 Gold→Amber, Conference 면은 Ruby→Red처럼 이어지고, 금색과 빨강은 절대 섞지 않습니다. Coral은 그라데이션 없이 단색으로만 씁니다.
- **흰 배경 위 글자색:** 금색 계열(Gold·Honey·Cream·Amber·Coral)은 **Oak**, 분홍 계열(Rose·Blossom)은 **Ruby**, 빨강은 **FINDS Red**로 표시됩니다. 연한 색을 글자색으로 지정해도 CSS가 자동으로 바꿔 줍니다.
- **색 면 위 글자색:** 밝은 면(Gold·Honey·Cream·Coral·Rose·Blossom)에는 진회색 `#1F2937`, 어두운 면(Red·Ruby·Oak)에는 흰색을 씁니다.
- **예외:** 로고 워드마크와 사진·어두운 배경 위 글자는 `ink-keep` 클래스로 원래 색을 유지합니다.
- **한계:** 팔레트에서 가장 진한 금색인 Oak의 흰 배경 대비는 3.9:1입니다. 큰 글씨 기준(3:1)은 넘지만 작은 글씨 권장치(4.5:1)에는 조금 못 미칩니다.

### 2. 글자 크기: 정해진 단계만 사용

임의 크기(`text-[14px]`, `text-[22px]` 등)는 쓰지 않습니다. 아래 단계 중 하나를 고릅니다.

| 단계 | 크기 | Tailwind | 역할 |
|------|------|------|------|
| caption | 10px | `text-[10px]` | **모바일 전용** 배지·칩 (기수, Cite, Domestic 등) |
| xs | 11px | `text-xs`, `text-[11px]` | 메타 정보 (날짜, DOI, 라벨), 태블릿·PC 배지 |
| sm | 13px | `text-sm` | 보조 본문 (영문 제목, 저자, 학회명, 설명) |
| base | 15px | `text-base` | 본문 기본값, 모바일 주 제목 |
| md | 17px | `text-md` | PC 주 제목 (논문·프로젝트 국문 제목) |
| lg / xl | 19 / 21px | `text-lg`, `text-xl` | 소제목, 섹션 제목 |
| 2xl–4xl | 25 / 29 / 33px | `text-2xl` ~ `text-4xl` | 통계 숫자, 큰 섹션 제목 |
| display | 40 / 48 / 60px | `text-[40px]`, `text-5xl`, `text-6xl` | 배너·히어로 제목 |

**최소 크기**
- 모바일에서는 10px 미만, 태블릿·PC에서는 11px 미만을 쓰지 않습니다.
- 유일한 예외는 지름 10px 원 안에 들어가는 이니셜 아이콘("IC")입니다.

**읽는 글과 메타 정보의 구분**
- 사용자가 실제로 읽는 글(제목, 영문 제목, 저자, 설명)은 모바일에서도 13px 이상, 제목은 15px 이상으로 씁니다.
- 11px은 날짜·DOI·라벨 같은 메타 정보에, 10px은 배지에만 씁니다.

**반응형 조합**
- 기본 패턴은 `text-base md:text-md`(제목), `text-sm`(보조 본문), `text-[10px] md:text-[11px]`(배지)입니다.
- 모바일 크기를 PC보다 두 단계 이상 작게 두지 않습니다.

**본문 기본값과 한국어 줄바꿈**
- `body`의 기본 크기는 15px입니다. 크기를 지정하지 않은 글자도 단계 안에 들어갑니다.
- 한국어는 어절 단위로 줄을 바꿉니다(`word-break: keep-all`). 단어 중간에서 끊기지 않습니다.

**줄 간격 (단계별 기본값, `theme.css`의 `--text-*--line-height`)**
- 11px 1.5배, 13px 1.6배, 15px 1.65배, 17px 1.6배, 19px 1.5배, 21px 1.45배, 25px 이상 1.35배에서 1.25배까지 줄어듭니다.
- 받침이 있는 한국어 본문은 1.6배 안팎에서 가장 편하게 읽힙니다. 13px 이하 여러 줄 글에 `leading-tight`·`leading-snug`를 쓰지 않습니다.

**한 줄 길이**
- 영문은 한 줄 90자, 국문은 45자 안팎을 넘기지 않습니다. 넓은 PC 화면에서도 다음 줄 첫머리를 쉽게 찾게 하기 위해서입니다.
- 논문·프로젝트 목록의 영문 제목과 설명에는 `max-w-[80ch]`를, 국문 제목에는 `max-w-[72ch]`를 겁니다.

**기사(뉴스·공지·갤러리) 본문**
- 본문과 목록은 15px, 소제목(h3)은 17px, 제목(h2)은 19px, 인용·코드는 13px입니다.

### 3. 반응형 기준 폭과 레이아웃 규칙

| 구간 | 폭 | 점검 폭 |
|------|------|------|
| 모바일 | < 768px | 360 · 390 · 430 |
| 태블릿 | 768–1023px | 768 · 820 |
| PC | ≥ 1024px | 1024 · 1280 · 1440 |

- **연도 바:** 배지는 어느 폭에서도 한 줄입니다. 모바일에서는 연도·화살표가 첫 줄, 배지가 둘째 줄로 내려갑니다.
- **통계 카드:** 카드가 많은 행(9개)은 1280px 이상에서만 한 줄로 놓고, 그보다 좁으면 5열·3열로 나눕니다.
- **넓은 표:** 졸업생 표처럼 최소 폭이 있는 표는 1024px 이상에서만 표로 보여 주고, 그보다 좁으면 카드 목록으로 바꿉니다.
- **배지와 짧은 라벨:** `whitespace-nowrap`을 걸어 두 줄로 꺾이지 않게 합니다.
- **상단 메뉴:** 메뉴 7개와 Contact Us 버튼이 한 줄에 들어가는 1024px 이상에서만 펼치고, 그보다 좁으면(태블릿 포함) 햄버거 메뉴를 씁니다.
- **나란한 칸(flex):** 글이 길어질 수 있는 칸에는 `min-w-0`을 넣어 옆 칸을 밀어내거나 화면 밖으로 나가지 않게 합니다. 비율로 나눈 두 칸(60%/40%)에 간격을 더하면 100%를 넘기 때문에, 한쪽은 `flex-1`로 남은 폭을 쓰게 합니다.
- **누르는 영역:** 모바일·태블릿에서 버튼과 아이콘 링크는 최소 28×28px입니다. 작은 아이콘(홈, 복사, 슬라이드 점)은 겉모양은 그대로 두고 여백으로 누르는 영역만 넓힙니다.
- **점검 폭:** 위 표의 폭에 320 · 600 · 1100 · 1920px까지 더해, 화면 밖으로 나가는 요소·겹치는 글자·잘린 글자·찌그러진 이미지·작은 누름 영역을 확인합니다.

### 4. 회색 글자 단계

| 용도 | 클래스 | 흰 배경 대비 |
|------|------|------|
| 제목·강조 | `text-gray-900` / `text-gray-800` | 17:1 / 15:1 |
| 본문 | `text-gray-700` / `text-gray-600` | 10:1 / 7.6:1 |
| 메타 정보(날짜·라벨·보조 설명) | `text-gray-500` | 4.8:1 (최소) |
| 장식(구분점 `·`, 구분선 `—`)·어두운 배경 위 글자 | `text-gray-300` / `text-gray-400` | 글자 정보에는 사용 금지 |

### 5. 공통 컴포넌트 규칙

새 화면을 만들 때 아래 컴포넌트와 클래스를 재사용합니다. 직접 비슷한 것을 새로 만들지 않습니다.

| 요소 | 사용법 | 규칙 |
|------|------|------|
| 연도·섹션 접이식 바 | 버튼에 `fbar fbar-current`(올해) / `fbar fbar-past`(지난 연도) / `fbar fbar-section`(카드 제목) | 개수 배지는 `bg-white shadow-sm` 알약 하나에 넣고, 색 점이 구분자 역할을 합니다. |
| 통계 카드 | `group relative bg-white border rounded-2xl` 안에 큰 숫자(`text-2xl` 이상) | 숫자 색과 같은 계열의 빛이 자동으로 깔립니다. Total 카드는 `bg-[#FFF9E6]`입니다. |
| 빈 상태 | `src/components/atoms/empty-note` 의 `<EmptyNote ko en tone action />` | 사과문 대신 다음 상태를 알려 주는 문장을 씁니다(예: "첫 졸업생을 준비하고 있습니다"). 비어 있는 그룹이 여러 개면 카드 하나로 묶습니다. |
| 날짜 배지 | 날짜·기간은 모두 `date-badge` 클래스 하나로 표시합니다 (PC는 `hidden md:inline-flex date-badge`, 모바일은 `md:hidden inline-flex self-start date-badge`). | 높이·글자·테두리가 사이트 전체에서 같습니다. 월 단위 날짜는 모두 같은 폭(최소 76px)이고, 기간만 내용만큼 넓어집니다. 개별 `min-w-[…]`를 주지 않습니다. |
| 배지·칩 | `rounded-full` + `whitespace-nowrap` | 두 줄로 꺾이지 않게 합니다. 모바일은 짧은 표기(Conf., Gov.)를 씁니다. |
| 사진·어두운 배경 위 글자 | 감싸는 요소에 `ink-keep` | 팔레트 원색(밝은 금색 등)을 그대로 유지합니다. |

**마우스 오버 원칙: 자기 색에서 한 단계만 진하게**
- 마우스를 올리면 그 요소의 평소 색 계열 안에서 한 단계만 진해집니다. 다른 색 계열로 바뀌지 않습니다.
  - 흰 바탕은 `gray-50`, `gray-50` 바탕은 `gray-100`이 됩니다. 회색 테두리는 `gray-300`, 회색 글자는 `gray-800`이나 `gray-900`이 됩니다.
  - 금색 면은 Gold→Amber, 빨강 면은 Ruby→Red처럼 같은 계열의 더 진한 색이 됩니다.
- 회색·흰 요소가 마우스를 올렸을 때 금색이나 빨강으로 물드는 일은 없게 합니다. 예를 들어 지난 연도 바는 회색 그대로 한 단계 진해지고, 금색 세로선은 올해 바에만 있습니다.
- **예외:** 통계 카드는 평소에도 숫자 색의 빛을 띠고 있어서, 마우스를 올리면 그 빛과 테두리가 같은 색으로 진해집니다. 필터 버튼도 선택 시 쓰는 자기 색이 테두리에 살짝 비칩니다.
- **화면 확인 시 주의:** 모니터의 야간 모드나 블루라이트 필터가 켜져 있으면 흰색과 연회색이 노랗게 보입니다. 색을 확인할 때는 필터를 끄고 봅니다.

### 6. 아이콘 (파비콘)

로고(`public/images/brand/logo-finds.png`)로 만든 정사각형 아이콘 세트를 `public/`에 두고, `index.html`과 `public/site.webmanifest`로 연결합니다.

| 파일 | 크기 | 쓰이는 곳 |
|------|------|------|
| `favicon.ico` | 16 · 32 · 48 | 브라우저 탭 |
| `favicon-32x32.png`, `favicon-48x48.png` | 32, 48 | 브라우저 탭(고해상도) |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | 192, 512 | 안드로이드 크롬 최근 탭·홈 화면 |
| `apple-touch-icon.png` | 180 | 아이폰 홈 화면 |

- 모든 아이콘은 흰 바탕 정사각형 위에 로고를 놓아, 밝은 탭과 다크 모드 탭 양쪽에서 보이게 합니다.
- 16·32px은 선을 살짝 굵게 해 형태가 남게 합니다. 로고를 바꾸면 이 세트도 함께 다시 만들어야 합니다.

### 7. 자동 점검

위 원칙은 `scripts/design_audit.mjs`로 자동 검사합니다. 디자인을 고친 뒤에는 반드시 이 검사를 돌립니다.

```bash
pnpm run build
npx vite preview --port 8899          # http://localhost:8899/site/ 로 확인
npm i -D playwright                   # 처음 한 번
pnpm run audit:design                 # 또는 node scripts/design_audit.mjs <주소>
```

19개 페이지와 구성원 상세 페이지 2개를 360 · 390 · 768 · 1024 · 1440px에서 렌더링하고 13개 항목을 확인합니다. 모두 통과하면 `ALL CHECKS PASSED`가 나오고 종료 코드 0을 돌려줍니다.

| 항목 | 확인 내용 |
|------|------|
| `static-colour` | 소스 코드의 팔레트 밖 색 코드, Tailwind 기본 색(red-500 등) |
| `static-type` | 소스 코드의 단계 밖 글자 크기(`text-[14px]` 등) |
| `static-hover` | 회색·흰 요소에 금색·빨강 마우스 오버를 지정했는지 (통계 카드 제외) |
| `colour-off-palette` | 화면에 실제로 그려진 글자·배경·테두리 색이 팔레트 또는 무채색인지 |
| `gradient-mixed-family` | 그라데이션 하나에 금색 계열과 빨강 계열이 섞였는지 |
| `type-off-scale` | 렌더링된 글자 크기가 단계 밖인지 |
| `type-below-min` | 모바일 10px, 태블릿·PC 11px 미만 글자 |
| `contrast-light-text` | 연한 팔레트 색을 흰 배경 위 글자색으로 그대로 썼는지 |
| `contrast-below-3` | 배경 대비 3:1 미만 글자(장식 기호 제외) |
| `layout-spill` | 글자가 카드 밖으로 넘치는지 |
| `layout-word-break` | 짧은 단어·라벨이 중간에서 끊기는지 |
| `layout-h-overflow` | 페이지 가로 스크롤이 생기는지 |
| `icons` | 파비콘·매니페스트 파일이 연결되고 실제로 열리는지 |

### 8. 최종 점검 결과 (2026-10-16)

19개 페이지와 구성원 상세 페이지를 위 점검 폭에서 실제로 렌더링해 측정했습니다. `scripts/design_audit.mjs`로 세 차례 점검했습니다.

| 차수 | 내용 | 결과 |
|------|------|------|
| 1차 | 렌더링 검사 10개 항목 | 실제 문제 2건 수정 후 전 항목 통과 |
| 2차 | 소스 코드 정적 검사 추가(12개 항목), 일부러 넣은 위반 3건을 잡아내는지 검증, 화면 육안 확인 | 전 항목 통과 |
| 3차 | 처음부터 다시 빌드, 타입 검사, 12개 항목 재검사, 전체 페이지 오류 검사(PC 82개·모바일 19개 경로) | 전 항목 통과 |

이후 추가 점검(마우스 오버·가독성)에서 고친 것:
- 회색·흰 요소가 마우스를 올리면 금색·빨강으로 바뀌던 247곳을 같은 계열 한 단계 진하게로 바꿨습니다. 메뉴 금빛 번짐, 푸터 링크, 카드 금빛 그림자도 포함합니다. `static-hover` 검사를 추가해 13개 항목이 모두 통과합니다.
- 13px 읽는 글의 줄 간격을 1.43배에서 1.6배로 올리고 단계별 줄 간격을 정했습니다. PC 목록의 영문 제목·설명은 한 줄 110~155자에서 90자 안팎으로 줄였습니다.

1차에서 고친 문제 2건은 다음과 같습니다.
- 모바일 논문 띠의 번호·색인(`J66 | KCI`)이 금색 면 위 흰 글씨(대비 2.6:1)였습니다. 지금은 진회색입니다.
- 메타 정보에 쓰던 `text-gray-400`(대비 2.5:1)을 `text-gray-500`(4.8:1)으로 올렸습니다. 24개 파일입니다.

| 항목 | 결과 |
|------|------|
| 단계 밖 글자 크기 | 0건 |
| 최소 크기 미만 글자 | 0건 (예외: 10px 원 안의 이니셜 아이콘) |
| 가로 스크롤 발생 페이지 | 0건 |
| 카드 밖으로 넘치는 글자 | 0건 |
| 두 줄로 꺾인 배지 | 0건 |
| 단어 중간 끊김 | 0건 ("인공지능(XAI)"처럼 괄호 앞 줄바꿈은 한국어 조판상 허용) |
| 연도 바 배지 한 줄 유지 | 360–1440px 전 구간 통과 |

**화면 폭별 글자 크기 분포 (글자 수 기준)**

```
mobile (390px)
   10px ███                    8.6%
   11px ████████              20.3%
   13px ████████████████████  48.8%
   15px ████████              19.9%
   19px █                      1.7%
   21px ▏                      0.3%
   25px ▏                      0.1%
   29px ▏                      0.3%

tablet (768px)
   11px ███████████           27.8%
   13px █████████████████     43.6%
   15px ██                     4.1%
   17px ███████               18.1%
   19px █                      3.5%
   21px █                      2.0%
   25px ▏                      0.3%
   29px ▏                      0.1%
   48px ▏                      0.2%

desktop (1440px)
   11px ██████████            25.3%
   13px ███████████████████   47.4%
   15px ██                     4.1%
   17px ███████               17.4%
   19px █                      3.3%
   21px █                      1.7%
   25px ▏                      0.2%
   29px ▏                      0.3%
   60px ▏                      0.3%
```

- 모바일에서 13–15px(읽는 글) 비율은 정리 전 24.5%에서 정리 후 68.7%로 올랐습니다. 11px 비율은 61.0%에서 20.3%로 내려갔습니다.
- 태블릿·PC는 13px(보조 본문)과 17px(주 제목)이 중심이고, 11px은 메타 정보와 배지입니다.

### 9. 내용 점검

데이터나 글을 고친 뒤에는 아래를 확인합니다.

| 확인 | 방법 |
|------|------|
| 인용문이 데이터와 맞는지 | `python3 scripts/conf_citations.py --check`, `python3 scripts/journal_citations.py --check` → 둘 다 `changed: 0` |
| 논문 통계 | `python3 scripts/sync_pubstats.py` → "이미 최신입니다" |
| 화면 숫자 일관성 | Publications 카드 합계 = 연도 바 합계 = 디렉터 Research Overview 합계, 프로젝트·수상·구성원도 같은 방식 |
| 같은 내용 여러 곳 | 디렉터 프로필 카드(이름·연구실·전화·이메일)는 `src/data/director-common.ts`의 `directorInfo` 한 곳에서만 고치면 6개 디렉터 페이지에 함께 반영됩니다(`director-card.tsx`). Resume 창의 논문 수·리뷰 학술지 수는 데이터에서 자동 계산합니다. Activities 페이지의 단체 카드는 `director-activities.tsx`의 `onCampusActivities`(교내, 예: DAM)와 `activities`(교외)에 있고, `director-portfolio-activities.tsx`에도 같이 고칩니다. 경력(employment)은 `director.tsx`와 `director-portfolio-profile.tsx` 두 곳에 있으니 함께 고칩니다 |
| 뉴스·공지 | `index.json` 목록과 파일 일치, `tag`가 허용 값인지, 첨부파일이 같은 폴더에 있는지, 날짜 옆 요일 표기가 맞는지 |

2026-10-16 기준 세 차례 점검 결과 (숫자는 2026-10-19 갱신):
- **데이터:** 인용문 변경 0건, 오탈자 검사와 인용 검사는 알려진 오탐(국문 제목만 있는 저서·보고서)만 남았습니다.
- **화면 숫자:** 논문 344편(학술지 73·학회 265·저서 4·보고서 2), 프로젝트 21건(연구실 출범 후 7건), 디렉터 수상 85건(연구실 출범 후 14건), 학술 활동 107건(학술지 리뷰 76곳), 강의 강사 12학기·조교 12학기, 인용 지표 330/h 11(2026-10-22 기준)이 모든 페이지와 데이터에서 일치합니다.
- **중복 내용 (2026-10-21):** 디렉터 카드 6곳 통일(이름·국문 표기·사무실 국문 주소·전화번호·버튼 이름), Resume 창의 "20+ journal articles"를 실제 수(67편)로, 데이터에 없는 리뷰 학술지 2곳을 실제 리뷰 기록으로 교체, 포트폴리오 경력에 빠진 KAIST 전문연구요원 추가, `directorInfo` 이메일 오기 수정.
- **글:** 영문 철자 오류 0건, 학회명 표기 흔들림 0건, 깨진 링크·이미지 0건, 요일 표기 10곳 모두 정확합니다.

## 문의

웹사이트 관련 문의: [ischoi@gachon.ac.kr](mailto:ischoi@gachon.ac.kr)
