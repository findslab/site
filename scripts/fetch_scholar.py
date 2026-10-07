#!/usr/bin/env python3
"""
Google Scholar 프로필 페이지를 직접 읽어 인용 지표를 갱신한다 (Google API·scholarly 미사용, 표준 라이브러리만 사용).

  https://scholar.google.com/citations?user=p9JwRLwAAAAJ&hl=en

가져오는 값
  - 프로필 우측 표(#gsc_rsb_st): 총 인용수, h-index, i10-index (전체 / 최근 5년)
  - 논문 목록(.gsc_a_ac): 논문별 인용수 → i5, g, e 계산
  - 연도별 인용 막대(.gsc_g_a): citationsByYear
  - m-quotient = h / (올해 − Scholar 첫 논문 연도 + 1)

갱신 대상
  - public/data/scholar.json  (metrics, citationsByYear, lastUpdated)
  - src/data/director-common.ts 의 citationStats  (페이지 fallback 값)

안전장치
  - 주소 4곳(.com/.co.kr/.co.jp/.com.sg)을 돌아가며 시도. --patient 면 4분·10분 쉬고 다시 시도.
  - 저장소 Secret 에 SCRAPER_API_KEY 가 있으면 직접 접속이 다 막혔을 때 대체 경로로도 시도(선택).
  - 끝내 막히면 아무 파일도 건드리지 않음(기존 값 유지). --strict 를 주면 실패 시 종료 코드 1.
  - 총 인용수가 20% 넘게 줄면 2분 뒤 다시 받아 같은 값일 때만 반영.
  - 값이 바뀌지 않았으면 파일을 다시 쓰지 않음 → 불필요한 커밋·배포가 생기지 않음.

사용법
  python scripts/fetch_scholar.py            # 갱신
  python scripts/fetch_scholar.py --dry-run  # 가져온 값만 출력
  python scripts/fetch_scholar.py --html saved.html   # 저장된 HTML로 테스트
"""

from __future__ import annotations

import argparse
import html as htmllib
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCHOLAR_ID = "p9JwRLwAAAAJ"
PROFILE_URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"
ROOT = Path(__file__).resolve().parent.parent
SCHOLAR_JSON = ROOT / "public" / "data" / "scholar.json"
COMMON_TS = ROOT / "src" / "data" / "director-common.ts"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
]
MAX_DROP_RATIO = 0.20  # 총 인용수가 이보다 많이 줄면 이상값으로 간주


class FetchError(Exception):
    pass


# ---------------------------------------------------------------- 네트워크
# 같은 프로필을 여러 경로로 시도한다. 한 경로가 막혀도 다른 경로가 열려 있는 경우가 많다.
HOSTS = ["scholar.google.com", "scholar.google.co.kr", "scholar.google.co.jp", "scholar.google.com.sg"]
LANGS = ["en", "en-US"]
PATIENT = False  # --patient: 막히면 몇 분씩 쉬어 가며 끈질기게 재시도 (GitHub Actions용)


def _get(url: str) -> str:
    key = os.environ.get("SCRAPER_API_KEY", "").strip()
    if key and os.environ.get("_SCHOLAR_VIA_PROXY") == "1":
        url = "https://api.scraperapi.com/?" + urllib.parse.urlencode({"api_key": key, "url": url})
    req = urllib.request.Request(url, headers={
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.6",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")


def fetch_page(cstart: int) -> str:
    routes = [(h, l) for h in HOSTS for l in LANGS]
    random.shuffle(routes)
    routes.sort(key=lambda r: r[0] != "scholar.google.com")  # 기본 주소를 먼저
    rounds = 3 if PATIENT else 1
    waits = [0, 240, 600] if PATIENT else [0]  # 라운드 사이 대기(초): 즉시 → 4분 → 10분
    last = None
    use_proxy_too = bool(os.environ.get("SCRAPER_API_KEY", "").strip())
    for rnd in range(rounds):
        if waits[rnd]:
            print(f"[scholar] 모든 경로가 막힘 — {waits[rnd] // 60}분 쉬고 다시 시도 ({rnd + 1}/{rounds})")
            time.sleep(waits[rnd] + random.random() * 30)
        modes = ["0", "1"] if use_proxy_too else ["0"]
        for mode in modes:
            os.environ["_SCHOLAR_VIA_PROXY"] = mode
            for host, hl in routes:
                url = f"https://{host}/citations?user={SCHOLAR_ID}&hl={hl}&cstart={cstart}&pagesize=100"
                try:
                    body = _get(url)
                    if is_blocked(body):
                        raise FetchError(f"{host}: CAPTCHA/차단 페이지")
                    if mode == "1":
                        print("[scholar] 대체 경로(SCRAPER_API_KEY)로 가져옴")
                    return body
                except urllib.error.HTTPError as e:
                    last = FetchError(f"{host}: HTTP {e.code}")
                except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                    last = FetchError(f"{host}: 네트워크 오류 {e}")
                except FetchError as e:
                    last = e
                print(f"[scholar]   실패: {last}")
                time.sleep(3 + random.random() * 4)
    raise last or FetchError("알 수 없는 오류")


def is_blocked(body: str) -> bool:
    low = body.lower()
    return ("gs_captcha" in low or "unusual traffic" in low or "recaptcha" in low
            or 'id="gsc_rsb_st"' not in body)


# ---------------------------------------------------------------- 파싱
def parse_summary(body: str) -> dict:
    m = re.search(r'<table id="gsc_rsb_st".*?</table>', body, re.S)
    if not m:
        raise FetchError("지표 표(gsc_rsb_st)를 찾지 못함")
    nums = re.findall(r'class="gsc_rsb_std">(\d*)<', m.group(0))
    if len(nums) < 6:
        raise FetchError(f"지표 표 셀 개수 이상: {nums}")
    v = [int(x or 0) for x in nums[:6]]
    return {"totalCitations": v[0], "citations5y": v[1], "hIndex": v[2],
            "hIndex5y": v[3], "i10Index": v[4], "i10Index5y": v[5]}


def parse_papers(body: str) -> list[tuple[int, int | None]]:
    out = []
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', body, re.S):
        c = re.search(r'class="gsc_a_ac gs_ibl"[^>]*>(\d*)<', row)
        y = re.search(r'class="gsc_a_h gsc_a_hc gs_ibl">(\d*)<', row)
        out.append((int(c.group(1)) if c and c.group(1) else 0,
                    int(y.group(1)) if y and y.group(1) else None))
    return out


def parse_by_year(body: str) -> dict[str, int]:
    years = [int(y) for y in re.findall(r'<span class="gsc_g_t"[^>]*>(\d{4})</span>', body)]
    if not years:
        return {}
    last = max(years)
    out = {str(y): 0 for y in years}
    for z, n in re.findall(r'class="gsc_g_a"[^>]*z-index:(\d+)[^>]*><span class="gsc_g_al">(\d+)</span>', body):
        out[str(last - int(z) + 1)] = int(n)
    return dict(sorted(out.items(), reverse=True))


def name_of(body: str) -> str:
    m = re.search(r'<div id="gsc_prf_in">(.*?)</div>', body, re.S)
    return htmllib.unescape(re.sub(r"<.*?>", "", m.group(1))).strip() if m else ""


# ---------------------------------------------------------------- 지표 계산
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


def collect(html_file: str | None = None) -> dict:
    if html_file:
        pages = [Path(html_file).read_text(encoding="utf-8")]
        if is_blocked(pages[0]):
            raise FetchError("저장된 HTML이 차단 페이지임")
    else:
        pages, cstart = [], 0
        while True:
            body = fetch_page(cstart)
            pages.append(body)
            n = len(parse_papers(body))
            more_disabled = re.search(r'id="gsc_bpf_more"[^>]*disabled', body) is not None
            if n < 100 or more_disabled or cstart >= 1000:
                break
            cstart += 100
            time.sleep(2 + random.random() * 2)

    summary = parse_summary(pages[0])
    papers = [p for b in pages for p in parse_papers(b)]
    cites = [c for c, _ in papers]
    years = [y for _, y in papers if y]
    if summary["totalCitations"] <= 0 or not papers:
        raise FetchError("총 인용수 0 또는 논문 목록 없음 — 파싱 실패로 간주")

    h = summary["hIndex"]
    this_year = datetime.now(timezone.utc).year
    first_year = min(years) if years else this_year
    span = this_year - first_year + 1
    metrics = {
        **summary,
        "i5Index": sum(1 for x in cites if x >= 5),
        "gIndex": g_index(cites),
        "eIndex": e_index(cites, h),
        "mQuotient": round(h / span, 2) if span > 0 else 0,
    }
    return {"metrics": metrics, "citationsByYear": parse_by_year(pages[0]),
            "name": name_of(pages[0]), "paperCount": len(papers), "firstYear": first_year}


# ---------------------------------------------------------------- 파일 갱신
TS_KEYS = ["totalCitations", "hIndex", "i10Index", "i5Index", "gIndex", "eIndex", "mQuotient"]


def update_common_ts(metrics: dict) -> bool:
    if not COMMON_TS.exists():
        return False
    src = COMMON_TS.read_text(encoding="utf-8")
    new = src
    for k in TS_KEYS:
        new = re.sub(rf"(count:\s*)[\d.]+(\s*,\s*key:\s*'{k}')", lambda m: f"{m.group(1)}{metrics[k]}{m.group(2)}", new)
    if new != src:
        COMMON_TS.write_text(new, encoding="utf-8")
        return True
    return False


def set_status(status: str) -> None:
    """GitHub Actions 에서 다음 단계가 결과(ok/blocked)를 알 수 있게 남긴다."""
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"status={status}\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strict", action="store_true", help="실패 시 종료 코드 1")
    ap.add_argument("--html", help="저장된 프로필 HTML로 테스트")
    ap.add_argument("--patient", action="store_true", help="막히면 쉬어 가며 여러 경로로 끈질기게 재시도")
    args = ap.parse_args()
    global PATIENT
    PATIENT = args.patient

    try:
        got = collect(args.html)
    except FetchError as e:
        print(f"[scholar] 가져오기 실패 — 기존 값 유지: {e}")
        set_status("blocked")
        return 1 if args.strict else 0

    m = got["metrics"]
    print(f"[scholar] {got['name'] or SCHOLAR_ID}: 논문 {got['paperCount']}편, Scholar 첫 연도 {got['firstYear']}")
    print("[scholar] " + ", ".join(f"{k}={m[k]}" for k in TS_KEYS))

    data = json.loads(SCHOLAR_JSON.read_text(encoding="utf-8")) if SCHOLAR_JSON.exists() else {}
    old = data.get("metrics", {})
    old_total = int(old.get("totalCitations") or 0)
    if old_total and m["totalCitations"] < old_total * (1 - MAX_DROP_RATIO) and not args.html:
        # 급감은 대개 일시적 오류다. 잠시 뒤 다른 경로로 한 번 더 받아서 같은 값이면 실제 변화로 인정한다.
        print(f"[scholar] 총 인용수 {old_total} → {m['totalCitations']} 급감 — 2분 뒤 다시 확인")
        time.sleep(120)
        try:
            again = collect()["metrics"]
        except FetchError as e:
            print(f"[scholar] 재확인 실패 — 이번에는 반영 안 함: {e}")
            set_status("blocked")
            return 1 if args.strict else 0
        if again["totalCitations"] != m["totalCitations"]:
            print(f"[scholar] 재확인 값이 다름({again['totalCitations']}) — 이상값으로 보고 반영 안 함")
            set_status("blocked")
            return 1 if args.strict else 0
        print("[scholar] 재확인 결과 같음 — 실제 변화로 보고 반영")

    if args.dry_run:
        print(json.dumps(got["citationsByYear"], ensure_ascii=False))
        return 0

    changed_json = (old != m) or (data.get("citationsByYear") != got["citationsByYear"])
    if changed_json:
        data.update({
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "scholarId": SCHOLAR_ID,
            "scholarUrl": PROFILE_URL,
            "metrics": m,
            "citationsByYear": got["citationsByYear"],
            "note": "metrics/citationsByYear are scraped from the public Google Scholar profile page "
                    "(scripts/fetch_scholar.py, scheduled GitHub Action). pubStats is reference-only; "
                    "the site computes publication statistics live from pubs.json.",
        })
        if got["name"]:
            data["name"] = got["name"]
        data.pop("fetchError", None)
        SCHOLAR_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    changed_ts = update_common_ts(m)

    set_status("ok")
    if changed_json or changed_ts:
        diff = ", ".join(f"{k} {old.get(k)}→{m[k]}" for k in TS_KEYS if old.get(k) != m[k])
        print(f"[scholar] 갱신됨: {diff or '연도별 인용만 변경'}")
    else:
        print("[scholar] 변경 없음")
    return 0


if __name__ == "__main__":
    sys.exit(main())
