#!/usr/bin/env python3
"""학부연구생 Alumni·멤버 데이터 무결성 검사 (읽기 전용). 문제가 있으면 종료 코드 1.

python3 scripts/check_members.py

검사 항목
  - alumni.json 학부 동문: 과제(projects) 비어 있음, "[수료 시 표기]" 같은 자리표시 남음
  - avatar 지정 여부와 public/images/members/<avatar>.webp 존재
    (avatar 가 없으면 영문 이름 이니셜로 사진을 찾으므로 다른 사람 사진이 뜰 수 있다)
  - 영문 이름(nameEn)이 authors.json 의 영문 표기와 같은지
  - 멤버 파일(members/*.json)과 상태 일치: alumni.json 에 있는데 active/removed 이거나, 그 반대
  - 같은 avatar 를 두 사람이 쓰는지
"""
import glob, json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "public" / "data"
alumni = json.loads((D / "alumni.json").read_text(encoding="utf-8"))["undergradAlumni"]
authors = json.loads((D / "authors.json").read_text(encoding="utf-8"))
en = {}
for v in authors.values():
    en.setdefault(v["ko"], set()).add(v["en"])
members = {}
for f in glob.glob(str(D / "members" / "*.json")):
    m = json.loads(Path(f).read_text(encoding="utf-8"))
    members.setdefault(m["name"]["ko"], []).append(m)

errs = []
seen = {}
for a in alumni:
    n = a["name"]
    pr = a.get("projects") or []
    if not pr:
        errs.append(f"{n}: 과제 없음 (행이 펼쳐지지 않음)")
    if any("수료 시" in (p if isinstance(p, str) else p.get("en", "")) for p in pr):
        errs.append(f"{n}: 자리표시 과제가 남아 있음")
    av = a.get("avatar")
    if not av:
        errs.append(f"{n}: avatar 없음")
    elif not (ROOT / "public" / "images" / "members" / f"{av}.webp").exists():
        errs.append(f"{n}: 사진 파일 없음 {av}.webp")
    elif av in seen:
        errs.append(f"{n}: {seen[av]}와 같은 사진 {av}")
    else:
        seen[av] = n
    if n in en and a.get("nameEn") not in en[n]:
        errs.append(f"{n}: 영문 이름 {a.get('nameEn')} ≠ authors.json {sorted(en[n])}")
    st = {m["status"] for m in members.get(n, [])}
    if st & {"active", "removed"}:
        errs.append(f"{n}: alumni.json 에 있는데 멤버 상태 {sorted(st)}")
names = {a["name"] for a in alumni}
for n, ms in members.items():
    if any(m["status"] == "alumni" for m in ms) and n not in names:
        errs.append(f"{n}: 멤버 상태 alumni 인데 alumni.json 에 없음")

print("\n".join(errs) if errs else f"[check_members] 학부 동문 {len(alumni)}명 이상 없음")
sys.exit(1 if errs else 0)
