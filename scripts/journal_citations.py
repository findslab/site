"""Generate citation strings for journal entries in pubs.json from structured fields.

Korean-language papers with title_ko and venue_ko are cited in Korean script (KCI convention);
everything else in English. Usage: python scripts/journal_citations.py [--write] [--check]
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from conf_citations import split_name, initials, van_initials, sentence_case, end_dot, make_key  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBS = ROOT / 'public/data/pubs.json'
AUTH = ROOT / 'public/data/authors.json'


def van_pages(pg):
    m = re.fullmatch(r'(\d+)-(\d+)', pg)
    if not m:
        return pg
    a, b = m.groups()
    if len(a) == len(b):
        i = 0
        while i < len(a) - 1 and a[i] == b[i]:
            i += 1
        b = b[i:]
    return f'{a}-{b}'


def gen(p, A, st, key):
    names = [A[str(a)]['en'] for a in p['authors']]
    gl = [split_name(n) for n in names]
    ko_names = [A[str(a)].get('ko') or A[str(a)]['en'] for a in p['authors']]
    y = p['year']
    v = (p.get('volume') or '').strip()
    i = (p.get('issue') or '').strip()
    if i.lower().startswith('part'):
        i = ''
    pg = (p.get('pages') or '').strip()
    doi = (p.get('doi') or '').strip()
    rng = '-' in pg
    korean = p.get('language') == 'Korean' and p.get('title_ko') and p.get('venue_ko')
    J = p['venue']
    title = p['title']
    if korean:
        Jc, tc, stc = p['venue_ko'], p['title_ko'], p['title_ko']
    else:
        Jc, tc, stc = J, title, st
    doi_url = f' https://doi.org/{doi}' if doi else ''

    # ---- APA
    if korean:
        apa_auth = ', '.join(ko_names)
        apa_head = f'{apa_auth}. ({y}).'
    else:
        an = [f'{l}, {initials(g)}' for g, l in gl]
        apa_auth = an[0] if len(an) == 1 else ', '.join(an[:-1]) + ', & ' + an[-1]
        apa_head = f'{apa_auth} ({y}).'
    src = f'<em>{Jc}</em>'
    if v:
        src += f', <em>{v}</em>' + (f'({i})' if i else '')
    if pg:
        src += f', {pg}'
    apa = f'{apa_head} {end_dot(stc)} {src}.{doi_url}'

    # ---- MLA / Chicago
    if korean:
        mla_auth = chi_auth = ', '.join(ko_names)
    else:
        first = f'{gl[0][1]}, {gl[0][0]}'
        rest = [f'{g} {l}' for g, l in gl[1:]]
        if not rest:
            chi_auth = first
        elif len(rest) == 1:
            chi_auth = f'{first}, and {rest[0]}'
        else:
            chi_auth = f'{first}, ' + ', '.join(rest[:-1]) + f', and {rest[-1]}'
        mla_auth = f'{first}, et al' if len(gl) >= 3 else chi_auth
    qt = tc if tc.endswith(('?', '!')) else tc + '.'
    parts = [f'<em>{Jc}</em>']
    if v:
        parts.append(f'vol. {v}')
    if i:
        parts.append(f'no. {i}')
    parts.append(str(y))
    if pg:
        parts.append(('pp. ' if rng else 'p. ') + pg)
    mla = f'{end_dot(mla_auth)} "{qt}" ' + ', '.join(parts) + '.' + (f' https://doi.org/{doi}.' if doi else '')
    csrc = f'<em>{Jc}</em>' + (f' {v}' if v else '') + (f', no. {i}' if i else '') + f' ({y})' + (f': {pg}' if pg else '')
    chicago = f'{end_dot(chi_auth)} "{qt}" {csrc}.' + (f' https://doi.org/{doi}.' if doi else '')

    # ---- Harvard
    if korean:
        hv_auth = ko_names[0] if len(ko_names) == 1 else ', '.join(ko_names[:-1]) + ' & ' + ko_names[-1]
    else:
        hn = [f'{l}, {initials(g, sep=".")}' for g, l in gl]
        hv_auth = hn[0] if len(hn) == 1 else ', '.join(hn[:-1]) + ' & ' + hn[-1]
    hsrc = f'<em>{Jc}</em>' + (f', {v}' if v else '') + (f'({i})' if v and i else '') + (
        (', pp. ' if rng else ', p. ') + pg if pg else '')
    harvard = f"{hv_auth} ({y}) '{stc}', {hsrc}.{doi_url}"

    # ---- Vancouver (romanized names always)
    van_auth = ', '.join(f'{l} {van_initials(g)}' for g, l in gl)
    vsrc = f'{Jc}. {y}' + (f';{v}' if v else '') + (f'({i})' if v and i else '') + (f':{van_pages(pg)}' if pg else '')
    vancouver = f'{van_auth}. {end_dot(stc)} {vsrc}.'

    # ---- Korean
    ksrc = (p.get('venue_ko') or J) + (f', {v}' if v else '') + (f'({i})' if v and i else '') + (f', {pg}' if pg else '')
    kor = f"{', '.join(ko_names)}. ({y}). {end_dot(p.get('title_ko') or title)} {ksrc}."

    # ---- BibTeX
    lines = [f'  title = {{{{{title}}}}}', '  author = {' + ' and '.join(f'{l}, {initials(g)}' for g, l in gl) + '}',
             f'  journal = {{{J}}}']
    if v:
        lines.append(f'  volume = {{{v}}}')
    if i:
        lines.append(f'  number = {{{i}}}')
    if pg:
        lines.append(f"  pages = {{{pg.replace('-', '--')}}}")
    lines.append(f'  year = {{{y}}}')
    if doi:
        lines.append(f'  doi = {{{doi}}}')
    bibtex = '@article{' + key + ',\n' + ',\n'.join(lines) + ',\n}'
    out = dict(apa=apa, mla=mla, chicago=chicago, harvard=harvard, vancouver=vancouver, korean=kor, bibtex=bibtex)
    if p.get('language') != 'Korean':
        out.pop('korean')
    return out


def main():
    pubs = json.loads(PUBS.read_text(encoding='utf-8'))
    A = json.loads(AUTH.read_text(encoding='utf-8'))
    used = set()
    for p in pubs:  # keys of non-journal entries are taken first
        if p['type'] != 'journal':
            used.add(re.search(r'\{(.*?),', p['citations']['bibtex']).group(1))
    changed = 0
    for p in pubs:
        if p['type'] != 'journal':
            continue
        last = split_name(A[str(p['authors'][0])]['en'])[1]
        new = gen(p, A, sentence_case(p['title']), make_key(last, p['year'], p['title'], used))
        if p['citations'] != new:
            changed += 1
            p['citations'] = new
    print(f'journal citations changed: {changed}')
    if '--write' in sys.argv:
        PUBS.write_text(json.dumps(pubs, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if '--check' in sys.argv and changed:
        sys.exit(1)


if __name__ == '__main__':
    main()
