"""Generate citation strings for conference entries in pubs.json from structured fields.

Usage: python scripts/conf_citations.py [--check] [--write] [--only TITLE_PREFIX ...]
"""
import json, re, sys, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBS = ROOT / 'public/data/pubs.json'
AUTH = ROOT / 'public/data/authors.json'

MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
MLA_MON = ['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.']
VAN_MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']


def split_name(full):
    parts = full.split()
    return ' '.join(parts[:-1]), parts[-1]


def initials(given, sep='. ', end='.'):
    out = []
    for g in given.split():
        sub = g.split('-')
        out.append('-'.join(s[0].upper() + '.' for s in sub))
    s = ' '.join(out)
    if sep == '.':
        s = s.replace('. ', '.')
    return s


def van_initials(given):
    return ''.join(s[0].upper() for g in given.split() for s in g.split('-'))


def join_list(items, last_sep, two_sep=None, oxford=True):
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return items[0] + (two_sep if two_sep is not None else last_sep) + items[1]
    return ', '.join(items[:-1]) + (',' if oxford else '') + last_sep + items[-1]


def venue_plain(v):
    return re.sub(r'\s*\((?:[A-Z][A-Za-z&\-]*)\)', '', v).strip()


STOP = {'a', 'an', 'the', 'on', 'of', 'for', 'in', 'to', 'and', 'with', 'via', 'from', 'by', 'at', 'is', 'are'}


def key_words(title):
    words = [re.sub(r'[^a-z0-9]', '', w.lower()) for w in re.split(r'[\s\-\u2011\u2013\u2014:]+', title)]
    return [w for w in words if w and w not in STOP] or ['paper']


def make_key(last, year, title, used):
    base = f"{re.sub(r'[^a-z]', '', last.lower())}{year}"
    kws = key_words(title)
    for n in range(1, len(kws) + 1):
        k = base + ''.join(kws[:n])
        if k not in used:
            used.add(k)
            return k
    i = 2
    while f'{base}{kws[0]}{i}' in used:
        i += 1
    used.add(f'{base}{kws[0]}{i}')
    return f'{base}{kws[0]}{i}'


def end_dot(s):
    return s if s.endswith(('.', '?', '!')) else s + '.'


def gen(p, authors, sentence_title, key=None):
    names = [authors[str(a)]['en'] for a in p['authors']]
    gl = [split_name(n) for n in names]
    y, m, d = (int(x) for x in p['published_date'].split('-'))
    venue = p['venue']
    vp = venue_plain(venue)
    title = p['title']
    st = sentence_title
    kind = 'Poster presentation' if p.get('presentation_type') == 'poster' else 'Paper presentation'

    apa_names = [f"{l}, {initials(g)}" for g, l in gl]
    apa_auth = apa_names[0] if len(apa_names) == 1 else ', '.join(apa_names[:-1]) + ', & ' + apa_names[-1]
    apa = f"{apa_auth} ({y}, {MONTHS[m-1]} {d}). {st} [{kind}]. {end_dot(vp)}"

    # MLA: First author inverted; 2 authors "A, and B"; 3+ "A, et al." is MLA9, but site uses full list
    first = f"{gl[0][1]}, {gl[0][0]}"
    rest = [f"{g} {l}" for g, l in gl[1:]]
    if not rest:
        mla_auth = first
    elif len(rest) == 1:
        mla_auth = f"{first}, and {rest[0]}"
    else:
        mla_auth = f"{first}, " + ', '.join(rest[:-1]) + f", and {rest[-1]}"
    chi_auth = mla_auth
    if len(gl) >= 3:
        mla_auth = f"{first}, et al"
    qt = title if title.endswith(('?', '!')) else title + '.'
    pres = 'Poster' if kind.startswith('Poster') else 'Paper'
    mla = f"{end_dot(mla_auth)} \"{qt}\" {vp}, {d} {MLA_MON[m-1]} {y}."
    chicago = f"{end_dot(chi_auth)} \"{qt}\" {pres} presented at the {vp}, {MONTHS[m-1]} {d}, {y}."

    hv_names = [f"{l}, {initials(g, sep='.')}" for g, l in gl]
    hv_auth = hv_names[0] if len(hv_names) == 1 else ', '.join(hv_names[:-1]) + ' & ' + hv_names[-1]
    harvard = f"{hv_auth} ({y}) '{st}', {pres.lower()} presented at the {vp}, {d} {MONTHS[m-1]}."

    van_auth = ', '.join(f"{l} {van_initials(g)}" for g, l in gl)
    vancouver = f"{van_auth}. {end_dot(st)} {pres} presented at: {vp}; {y} {VAN_MON[m-1]} {d}."

    bib_auth = ' and '.join(f"{l}, {initials(g)}" for g, l in gl)
    key_word = re.sub(r'[^a-z]', '', title.split()[0].lower()) or 'paper'
    bibkey = f"{re.sub(r'[^a-z]', '', gl[0][1].lower())}{y}{key_word}"
    bibkey = key or bibkey
    bibtex = ("@inproceedings{" + bibkey + ",\n"
              f"  title = {{{{{title}}}}},\n"
              f"  author = {{{bib_auth}}},\n"
              f"  booktitle = {{{venue}}},\n"
              f"  year = {{{y}}},\n}}")

    ko_names = ', '.join(authors[str(a)]['ko'] or authors[str(a)]['en'] for a in p['authors'])
    ko_title = p.get('title_ko') or title
    vko = p.get('venue_ko') or venue
    korean = f"{ko_names}. ({y}). {end_dot(ko_title)} {vko} 발표논문."
    out = dict(apa=apa, mla=mla, chicago=chicago, harvard=harvard, vancouver=vancouver, korean=korean, bibtex=bibtex)
    if p.get('language') != 'Korean' and not p.get('venue_ko'):
        out.pop('korean')
    return out


PROPER = {
    'korea', 'korean', "korea's", 'koreans', 'bitcoin', "bitcoin's", 'seoul', "seoul's", 'asia', 'asian', 'bayesian',
    'granger', 'kalman', "langton's", 'hangul', 'jamo', 'feldstein', 'horioka', 'kuznets', 'markov', 'gaussian',
    'kimchi', 'english', 'v-league', 'league', 'ethereum', 'shapley', 'pearson', 'spearman', 'kendall', 'monte',
    'carlo', 'hawkes', 'wasserstein', 'shannon', 'fourier', 'garch', 'china', 'chinese', 'japan', 'japanese', 'us',
    'u.s.', 'europe', 'european', 'america', 'american', 'covid-19', 'kospi', 'kosdaq', 'nasdaq', 'dow', 'jones',
    'g20', 'oecd', 'brics', 'south', 'north', 'republic', 'rényi', 'hilbert', 'gramian', 'germany', 'german', 'jensen', 'sharpe', 'black-litterman',
}
SMALL_AFTER_COLON = True


def _case_word(w, first):
    if not w:
        return w
    core = re.sub(r"^[\"'(\[]+|[\"'),.;:?!\]]+$", '', w)
    if first:
        parts = re.split(r'([-\u2011\u2013])', w)
        out = [parts[0]]
        for i, x in enumerate(parts[1:], start=1):
            out.append(x if i % 2 == 1 else _case_word(x, False))
        return ''.join(out)
    if core.lower() in PROPER:
        return w
    parts = re.split(r'([-\u2011\u2013])', w)
    if len(parts) == 1 and (sum(ch.isupper() for ch in core) >= 2 or any(ch.isdigit() for ch in core)):
        return w
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            out.append(part)
            continue
        c = re.sub(r"^[\"'(\[]+|[\"'),.;:?!\]]+$", '', part)
        keep = (c.lower() in PROPER or sum(ch.isupper() for ch in c) >= 2 or any(ch.isdigit() for ch in c)
                or (len(c) == 1 and c.isupper() and i == 0 and len(parts) > 1))
        out.append(part if keep else part.lower())
    return ''.join(out)


def sentence_case(title):
    words = title.split(' ')
    out = []
    first = True
    for w in words:
        out.append(_case_word(w, first))
        first = w.endswith((':', '?', '!')) or w in ('–', '—')
    return ' '.join(out)


def existing_sentence_title(p):
    c = p.get('citations') or {}
    m = re.search(r'\(\d{4}, [A-Z][a-z]+ \d+\)\. (.*?) \[(?:Paper|Poster) presentation\]', c.get('apa', ''))
    if m and m.group(1).lower() == p['title'].lower():
        return m.group(1)
    return None


def main():
    args = sys.argv[1:]
    pubs = json.loads(PUBS.read_text(encoding='utf-8'))
    authors = json.loads(AUTH.read_text(encoding='utf-8'))
    used = set()
    changed = 0
    for p in pubs:
        if p.get('type') != 'conference':
            continue
        st = existing_sentence_title(p) or sentence_case(p['title'])
        last = split_name(authors[str(p['authors'][0])]['en'])[1]
        key = make_key(last, p['year'], p['title'], used)
        new = gen(p, authors, st, key)
        if p.get('citations') != new:
            changed += 1
            p['citations'] = new
    print(f'conference citations changed: {changed}')
    if '--write' in args:
        PUBS.write_text(json.dumps(pubs, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if '--check' in args and changed:
        sys.exit(1)


if __name__ == '__main__':
    main()
