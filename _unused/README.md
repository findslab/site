# 미사용 파일 보관함

빌드·배포에 포함되지 않는 폴더입니다. 코드와 데이터 전체를 검색해 **어디서도 참조되지 않는 것**만 모아두었습니다.
필요해지면 원래 위치로 되돌리면 그대로 동작합니다.

정리 일자: 2026-08-18

---

## member-photos-legacy/ (22개)

대시 없는 구버전 파일명의 멤버 사진입니다. 현재는 모두 대시 버전(`CJY-2.webp` 형식)을 쓰고 있어
중복으로 남아 있던 것들입니다.

`CJY2, CSM1, CYH1, HJY1, HTW1, KDH2, KDW1, KDW2, KHE1, KHS2, KJJ1, KMG1, KSY2, KYS1, LEK1, LYS2, PSY2, PSY3, SHJ1, SKS2, SYS1, YSB1`

- 원래 위치: `public/images/members/`
- 삭제해도 안전한 이유: 각 파일마다 대시 버전이 이미 존재하고, `members/*.json`과 `alumni.json`의
  avatar 경로는 전부 대시 버전을 가리킵니다.

## icons/ (5개)

`ba_intro, dim_intro, fds_intro, philosophy, solution`

- 원래 위치: `src/assets/images/icons/`
- About 페이지용으로 제작된 것으로 보이나 현재 어느 컴포넌트에서도 import하지 않습니다.
- 나중에 소개 페이지를 개편할 때 다시 쓸 수 있어 남겨두었습니다.

## misc/

`iris.webp` — 원래 위치 `public/images/`. 참조 없음.

---

## 되돌리는 방법

```bash
# 예: 아이콘을 다시 사용하려면
mv _unused/icons/philosophy.webp src/assets/images/icons/
```

## 완전히 지우려면

```bash
rm -rf _unused
```
