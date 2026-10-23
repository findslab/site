#!/usr/bin/env python3
"""Google Scholar 인용 지표를 수동으로 갱신한다 (자동 갱신 없음).

사용법
  1) Google Scholar 프로필 페이지 전체를 복사해 텍스트 파일로 저장한다
     (Ctrl+A → Ctrl+C, 'Show more'로 모든 논문이 보이게 한 뒤).
  2) python3 scripts/update_scholar.py 붙여넣은파일.txt --date 2026-10-22
     --date 를 생략하면 오늘 날짜(KST)를 쓴다. 사이트에는 "YYYY-MM-DD 기준"으로 표시된다.

읽는 내용
  - 요약표: Citations / h-index / i10-index (All 열)
  - 논문 목록: 각 논문 끝의 "인용수<TAB>연도" 줄, 인용 0편은 "연도"만 있는 줄
  - "Articles 1–N" 이 있으면 논문 수가 맞는지 확인한다
계산: i5-index, g-index, e-index, m-quotient
고치는 파일: public/data/scholar.json, src/data/director-common.ts (fallback 값)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHOLAR_JSON = ROOT / "public" / "data" / "scholar.json"
COMMON_TS = ROOT / "src" / "data" / "director-common.ts"
TS_KEYS = ["totalCitations", "hIndex", "i10Index", "i5Index", "gIndex", "eIndex", "mQuotient"]


def g_index(c: list[int]) -> int:
    s, g = 0, 0
    for i, x in enumerate(sorted(c, reverse=True)):
        s += x
        if s >= (i + 1) ** 2:
            g = i + 1
    return g


def e_index(c: list[int], h: int) -> float:
    ex = sum(sorted(c, reverse=True)[:h]) - h * h
    return round(ex ** 0.5, 2) if ex > 0 else 0


def parse(text: str) -> dict:
    def row(label: str) -> tuple[int, int]:
        m = re.search(rf"^{re.escape(label)}\s+(\d+)\s+(\d+)\s*$", text, re.M)
        if not m:
            raise SystemExit(f"요약표에서 '{label}' 줄을 찾지 못했습니다.")
        return int(m.group(1)), int(m.group(2))

    total, total5 = row("Citations")
    h, h5 = row("h-index")
    i10, i105 = row("i10-index")

    papers: list[tuple[int, int]] = []
    for line in text.splitlines():
        line = line.strip()
        m = re.fullmatch(r"(\d+)\*?\s+((?:19|20)\d{2})", line)
        if m:
            papers.append((int(m.group(1)), int(m.group(2))))
            continue
        m = re.fullmatch(r"((?:19|20)\d{2})", line)
        if m:
            papers.append((0, int(m.group(1))))
    m = re.search(r"Articles\s+1\s*[–-]\s*(\d+)", text)
    if m and int(m.group(1)) != len(papers):
        raise SystemExit(f"논문 수가 맞지 않습니다: 페이지 {m.group(1)}편, 읽은 것 {len(papers)}편. "
                         "'Show more'로 전체 목록을 펼친 뒤 다시 복사해 주세요.")
    if not papers:
        raise SystemExit("논문 목록을 읽지 못했습니다.")

    cites = [c for c, _ in papers]
    first_year = min(y for _, y in papers)
    return {
        "metrics": {
            "totalCitations": total, "citations5y": total5,
            "hIndex": h, "hIndex5y": h5,
            "i10Index": i10, "i10Index5y": i105,
            "i5Index": sum(1 for x in cites if x >= 5),
            "gIndex": g_index(cites),
            "eIndex": e_index(cites, h),
            "mQuotient": None,  # 날짜가 정해진 뒤 계산
        },
        "firstYear": first_year,
        "paperCount": len(papers),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file", help="Google Scholar 프로필을 복사해 붙여넣은 텍스트 파일")
    ap.add_argument("--date", help="기준일 YYYY-MM-DD (기본: 오늘, KST)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    date = a.date or (datetime.now(timezone.utc) + timedelta(hours=9)).strftime("%Y-%m-%d")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise SystemExit("--date 는 YYYY-MM-DD 형식이어야 합니다.")

    got = parse(Path(a.file).read_text(encoding="utf-8"))
    m = got["metrics"]
    span = int(date[:4]) - got["firstYear"] + 1
    m["mQuotient"] = round(m["hIndex"] / span, 2) if span > 0 else 0

    data = json.loads(SCHOLAR_JSON.read_text(encoding="utf-8"))
    old = data.get("metrics", {})
    print(f"[scholar] 논문 {got['paperCount']}편, 첫 연도 {got['firstYear']}, 기준일 {date}")
    for k in TS_KEYS:
        mark = "" if old.get(k) == m[k] else f"  (이전 {old.get(k)})"
        print(f"  {k:15s} {m[k]}{mark}")
    if a.dry_run:
        return 0

    data["lastUpdated"] = date
    data["metrics"] = m
    data["note"] = ("metrics are updated manually from the public Google Scholar profile "
                    "(scripts/update_scholar.py); lastUpdated is the 'as of' date shown on the site. "
                    "citationsByYear is not refreshed by this script. pubStats is synced from pubs.json.")
    SCHOLAR_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    src = COMMON_TS.read_text(encoding="utf-8")
    new = src
    for k in TS_KEYS:
        new = re.sub(rf"(count:\s*)[\d.]+(\s*,\s*key:\s*'{k}')", lambda mm: f"{mm.group(1)}{m[k]}{mm.group(2)}", new)
    new = re.sub(r"(export const citationAsOf = ')[^']*(')", lambda mm: f"{mm.group(1)}{date}{mm.group(2)}", new)
    if new != src:
        COMMON_TS.write_text(new, encoding="utf-8")
    print("[scholar] scholar.json, director-common.ts 갱신 완료")
    return 0


if __name__ == "__main__":
    sys.exit(main())
