#!/usr/bin/env python3
"""
scholar.json 의 pubStats 를 pubs.json 기준으로 다시 계산한다.

Google Scholar 크롤링(fetch_scholar.py)과 달리 네트워크가 필요 없고
로컬 데이터만 읽으므로, 빌드 전에 항상 안전하게 실행할 수 있다.
citation 지표(metrics)는 건드리지 않는다.

사용:
    python scripts/sync_pubstats.py          # 갱신
    python scripts/sync_pubstats.py --check  # 차이만 확인 (CI 검증용)
"""

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBS = ROOT / "public" / "data" / "pubs.json"
SCHOLAR = ROOT / "public" / "data" / "scholar.json"


def build_pub_stats(pubs: list) -> dict:
    kinds = Counter(p.get("type") for p in pubs)
    journal_idx = Counter(
        p.get("indexing_group") for p in pubs if p.get("type") == "journal"
    )
    conf_idx = Counter(
        p.get("indexing_group") for p in pubs if p.get("type") == "conference"
    )
    by_year = Counter(str(p.get("year")) for p in pubs if p.get("year"))

    wos = sum(journal_idx.get(k, 0) for k in ("SCIE", "SSCI", "A&HCI", "ESCI"))

    return {
        "totalPublications": len(pubs),
        "journals": kinds.get("journal", 0),
        "conferences": kinds.get("conference", 0),
        "books": kinds.get("book", 0),
        "reports": kinds.get("report", 0),
        "indexing": {
            "scie": journal_idx.get("SCIE", 0),
            "ssci": journal_idx.get("SSCI", 0),
            "ahci": journal_idx.get("A&HCI", 0),
            "esci": journal_idx.get("ESCI", 0),
            "scopus": journal_idx.get("Scopus", 0) + conf_idx.get("Scopus", 0),
            "otherInternational": journal_idx.get("Other International", 0),
            "kci": journal_idx.get("KCI", 0),
            "webOfScience": wos,
        },
        "firstPubYear": min((p["year"] for p in pubs if p.get("year")), default=None),
        "publicationsByYear": {y: by_year[y] for y in sorted(by_year, reverse=True)},
    }


def main() -> int:
    check_only = "--check" in sys.argv

    if not PUBS.exists() or not SCHOLAR.exists():
        print("[sync_pubstats] 데이터 파일을 찾을 수 없습니다.", file=sys.stderr)
        return 1

    pubs = json.loads(PUBS.read_text(encoding="utf-8"))
    scholar = json.loads(SCHOLAR.read_text(encoding="utf-8"))

    current = scholar.get("pubStats", {})
    fresh = build_pub_stats(pubs)

    if current == fresh:
        print(f"[sync_pubstats] 이미 최신입니다 (논문 {fresh['totalPublications']}편).")
        return 0

    print("[sync_pubstats] 차이 발견:")
    for key in ("totalPublications", "journals", "conferences", "books"):
        before, after = current.get(key), fresh.get(key)
        if before != after:
            print(f"    {key}: {before} -> {after}")
    for key, after in fresh["indexing"].items():
        before = (current.get("indexing") or {}).get(key)
        if before != after:
            print(f"    indexing.{key}: {before} -> {after}")

    if check_only:
        print("[sync_pubstats] --check 모드: 파일을 수정하지 않았습니다.")
        return 1

    scholar["pubStats"] = fresh
    SCHOLAR.write_text(
        json.dumps(scholar, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print("[sync_pubstats] scholar.json 갱신 완료.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
