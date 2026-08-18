# 미사용 파일 보관함

빌드·배포에 포함되지 않는 폴더입니다. 코드와 데이터 전체를 검색해 **어디서도 참조되지 않는 것**만 모아두었습니다.
필요해지면 원래 위치로 되돌리면 그대로 동작합니다.

최종 정리: 2026-08-18

---

## replaced-originals/ (8개)
새 3D 일러스트로 교체하기 전의 배너·아이콘 원본입니다.

- `1~5.webp` — About / Members / Publications / Projects / Archives 배너
- `fds.webp`, `ba.webp`, `dim.webp` — Introduction 연구분야 아이콘

원래 위치: `src/assets/images/banner/`, `src/assets/images/icons/`

## member-photos-legacy/ (22개)
대시 없는 구버전 파일명의 멤버 사진입니다. 현재는 모두 대시 버전(`CJY-2.webp` 형식)을 사용합니다.

`CJY2, CSM1, CYH1, HJY1, HTW1, KDH2, KDW1, KDW2, KHE1, KHS2, KJJ1, KMG1, KSY2, KYS1, LEK1, LYS2, PSY2, PSY3, SHJ1, SKS2, SYS1, YSB1`

원래 위치: `public/images/members/`

## icons/ (5개)
`ba_intro, dim_intro, fds_intro, philosophy, solution` — About 페이지용으로 제작되었으나 현재 어느 컴포넌트에서도 import하지 않습니다.

원래 위치: `src/assets/images/icons/`

## misc/ (3개)
- `iris.webp` — 원래 위치 `public/images/`
- `logo_fix_public.html`, `logo_fix_src.html` — 내용이 비어 있는 파일

---

## 되돌리는 방법

```bash
mv _unused/replaced-originals/3.webp src/assets/images/banner/
```

## 완전히 지우려면

```bash
rm -rf _unused
```
