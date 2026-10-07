#!/usr/bin/env python3
"""
Google Scholar Citation Fetcher
Fetches citation data and calculates various bibliometric indices.
Run daily via GitHub Actions at 3:00 PM KST (6:00 AM UTC).

Indices calculated:
- h-index: Author has h papers with at least h citations each
- g-index: Largest g where top g papers have ≥ g² total citations
- i10-index: Number of publications with 10+ citations
- i5-index: Number of publications with 5+ citations
- e-index: Excess citations beyond h² in h-core
- m-quotient: h-index / years since first publication

Proxy Support:
- Uses scholarly's built-in free proxy (FreeProxies)
- Retries with different proxies on failure
- Falls back to existing data if all attempts fail
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    from scholarly import scholarly, ProxyGenerator
except ImportError:
    print("scholarly not installed. Run: pip install scholarly")
    exit(1)

# Proxy setup for bypassing Google Scholar blocks
def setup_proxy():
    """Setup free proxy to bypass Google Scholar blocking."""
    pg = ProxyGenerator()
    
    # Try FreeProxies first (most reliable free option)
    try:
        print("Setting up free proxy...")
        success = pg.FreeProxies()
        if success:
            scholarly.use_proxy(pg)
            print("✓ Free proxy configured successfully")
            return True
    except Exception as e:
        print(f"Free proxy setup failed: {e}")
    
    # Try ScraperAPI if environment variable is set
    scraper_api_key = os.environ.get('SCRAPER_API_KEY')
    if scraper_api_key:
        try:
            print("Setting up ScraperAPI proxy...")
            success = pg.ScraperAPI(scraper_api_key)
            if success:
                scholarly.use_proxy(pg)
                print("✓ ScraperAPI proxy configured successfully")
                return True
        except Exception as e:
            print(f"ScraperAPI setup failed: {e}")
    
    print("⚠ No proxy configured, attempting direct connection...")
    return False

# Configuration
SCHOLAR_ID = "p9JwRLwAAAAJ"  # Google Scholar ID for Insu Choi
SCRIPT_DIR = Path(__file__).parent
OUTPUT_PATH = SCRIPT_DIR.parent / "public" / "data" / "scholar.json"
PUBS_PATH = SCRIPT_DIR.parent / "public" / "data" / "pubs.json"


def calculate_h_index(citations: list[int]) -> int:
    """Calculate h-index from list of citation counts."""
    sorted_citations = sorted(citations, reverse=True)
    h = 0
    for i, c in enumerate(sorted_citations):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h


def calculate_i10_index(citations: list[int]) -> int:
    """Calculate i10-index (number of publications with 10+ citations)."""
    return sum(1 for c in citations if c >= 10)


def calculate_i5_index(citations: list[int]) -> int:
    """Calculate i5-index (number of publications with 5+ citations)."""
    return sum(1 for c in citations if c >= 5)


def calculate_g_index(citations: list[int]) -> int:
    """Calculate g-index."""
    sorted_citations = sorted(citations, reverse=True)
    cumsum = 0
    g = 0
    for i, c in enumerate(sorted_citations):
        cumsum += c
        if cumsum >= (i + 1) ** 2:
            g = i + 1
    return g


def calculate_e_index(citations: list[int], h_index: int) -> float:
    """Calculate e-index (excess citations beyond h^2)."""
    sorted_citations = sorted(citations, reverse=True)
    excess = sum(sorted_citations[:h_index]) - h_index ** 2
    return round((excess ** 0.5), 2) if excess > 0 else 0


def calculate_m_quotient(h_index: int, first_pub_year: int) -> float:
    """Calculate m-quotient (h-index / years since first publication)."""
    current_year = datetime.now().year
    years = current_year - first_pub_year
    return round(h_index / years, 2) if years > 0 else 0


def calculate_pub_based_stats(pubs_path: Path) -> dict:
    """Calculate statistics from pubs.json data."""
    if not pubs_path.exists():
        return {}
    
    with open(pubs_path, 'r', encoding='utf-8') as f:
        pubs = json.load(f)
    
    # Count by type
    journals = [p for p in pubs if p.get('type') == 'journal']
    conferences = [p for p in pubs if p.get('type') == 'conference']
    books = [p for p in pubs if p.get('type') == 'book']
    
    # Count by indexing
    scie = sum(1 for p in pubs if p.get('indexing_group') == 'SCIE')
    ssci = sum(1 for p in pubs if p.get('indexing_group') == 'SSCI')
    ahci = sum(1 for p in pubs if p.get('indexing_group') == 'A&HCI')
    esci = sum(1 for p in pubs if p.get('indexing_group') == 'ESCI')
    scopus = sum(1 for p in pubs if p.get('indexing_group') == 'Scopus')
    kci = sum(1 for p in pubs if 'KCI' in (p.get('indexing_group') or ''))
    
    # Authorship stats
    first_author = sum(1 for p in pubs if p.get('authorship') in ['F', 'L', 'S'])
    corresponding = sum(1 for p in pubs if p.get('authorship') in ['C', 'L'])
    
    # Years
    years = [int(p.get('year', 0)) for p in pubs if p.get('year')]
    first_year = min(years) if years else datetime.now().year
    
    # Publications by year
    pub_per_year = {}
    for p in pubs:
        year = p.get('year')
        if year:
            pub_per_year[str(year)] = pub_per_year.get(str(year), 0) + 1
    
    return {
        'totalPublications': len(pubs),
        'journals': len(journals),
        'conferences': len(conferences),
        'books': len(books),
        'indexing': {
            'scie': scie,
            'ssci': ssci,
            'ahci': ahci,
            'esci': esci,
            'scopus': scopus,
            'kci': kci,
            'webOfScience': scie + ssci + ahci + esci,
        },
        'authorship': {
            'firstAuthor': first_author,
            'corresponding': corresponding,
        },
        'firstPubYear': first_year,
        'publicationsByYear': dict(sorted(pub_per_year.items(), reverse=True))
    }


def fetch_scholar_data() -> dict:
    """Fetch data from Google Scholar."""
    try:
        print(f"Fetching data for Scholar ID: {SCHOLAR_ID}")
        author = scholarly.search_author_id(SCHOLAR_ID)
        author = scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
        
        # Extract basic info
        name = author.get('name', 'Unknown')
        affiliation = author.get('affiliation', '')
        interests = author.get('interests', [])
        
        # Extract citation indices from Scholar
        citedby = author.get('citedby', 0)
        citedby5y = author.get('citedby5y', 0)
        h_index = author.get('hindex', 0)
        h_index5y = author.get('hindex5y', 0)
        i10_index = author.get('i10index', 0)
        i10_index5y = author.get('i10index5y', 0)
        
        # Get publication data for additional calculations
        publications = author.get('publications', [])
        citation_counts = []
        yearly_citations = {}
        first_year = datetime.now().year
        
        for pub in publications:
            num_citations = pub.get('num_citations', 0)
            citation_counts.append(num_citations)
            
            bib = pub.get('bib', {})
            year = bib.get('pub_year', None)
            if year:
                try:
                    year = int(year)
                    yearly_citations[year] = yearly_citations.get(year, 0) + num_citations
                    if year < first_year:
                        first_year = year
                except ValueError:
                    pass
        
        # Calculate additional indices
        g_index = calculate_g_index(citation_counts)
        i5_index = calculate_i5_index(citation_counts)
        e_index = calculate_e_index(citation_counts, h_index)
        m_quotient = calculate_m_quotient(h_index, first_year)
        
        return {
            'lastUpdated': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'scholarId': SCHOLAR_ID,
            'scholarUrl': f'https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en',
            'name': name,
            'affiliation': affiliation,
            'interests': interests,
            'metrics': {
                'totalCitations': citedby,
                'citations5y': citedby5y,
                'hIndex': h_index,
                'hIndex5y': h_index5y,
                'i10Index': i10_index,
                'i10Index5y': i10_index5y,
                'i5Index': i5_index,
                'gIndex': g_index,
                'eIndex': e_index,
                'mQuotient': m_quotient,
            },
            'citationsByYear': {
                str(year): count 
                for year, count in sorted(yearly_citations.items(), reverse=True)
            },
        }
        
    except Exception as e:
        print(f"Error fetching scholar data: {e}")
        return None


def main():
    print("=" * 50)
    print("Google Scholar Citation Fetcher")
    print("=" * 50)
    
    # Setup proxy before fetching
    MAX_RETRIES = 3
    scholar_data = None
    
    for attempt in range(MAX_RETRIES):
        print(f"\nAttempt {attempt + 1}/{MAX_RETRIES}")
        
        # Setup proxy (will try different proxies on each attempt)
        setup_proxy()
        
        # Add delay between attempts
        if attempt > 0:
            delay = 5 * attempt  # 5s, 10s
            print(f"Waiting {delay}s before retry...")
            time.sleep(delay)
        
        # Fetch Scholar data
        scholar_data = fetch_scholar_data()
        
        if scholar_data is not None:
            print("✓ Data fetched successfully!")
            break
        else:
            print(f"⚠ Attempt {attempt + 1} failed")
    
    # Load existing data if fetch failed
    if scholar_data is None and OUTPUT_PATH.exists():
        print("Using existing data due to fetch error")
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            scholar_data = json.load(f)
        scholar_data['fetchError'] = True
        scholar_data['lastAttempt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        # Keep original lastUpdated - don't overwrite with failed attempt
    elif scholar_data is None:
        print("No existing data and fetch failed")
        scholar_data = {
            'lastUpdated': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'scholarId': SCHOLAR_ID,
            'scholarUrl': f'https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en',
            'fetchError': True,
            'metrics': {
                'totalCitations': 0,
                'hIndex': 0,
                'gIndex': 0,
                'i10Index': 0,
            }
        }
    else:
        # Successful fetch - remove any fetchError flag
        scholar_data.pop('fetchError', None)
        scholar_data.pop('lastAttempt', None)
    
    # Calculate pub-based stats
    pub_stats = calculate_pub_based_stats(PUBS_PATH)
    if pub_stats:
        scholar_data['pubStats'] = pub_stats
        # Recalculate m-quotient with local pub data
        if scholar_data.get('metrics', {}).get('hIndex'):
            scholar_data['metrics']['mQuotient'] = calculate_m_quotient(
                scholar_data['metrics']['hIndex'],
                pub_stats['firstPubYear']
            )
    
    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Write to file
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(scholar_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print(f"\n✓ Data saved to {OUTPUT_PATH}")
    metrics = scholar_data.get('metrics', {})
    print(f"\nCitation Metrics:")
    print(f"  Total Citations: {metrics.get('totalCitations', 'N/A')}")
    print(f"  h-index: {metrics.get('hIndex', 'N/A')}")
    print(f"  g-index: {metrics.get('gIndex', 'N/A')}")
    print(f"  i10-index: {metrics.get('i10Index', 'N/A')}")
    print(f"  e-index: {metrics.get('eIndex', 'N/A')}")
    print(f"  m-quotient: {metrics.get('mQuotient', 'N/A')}")
    
    if pub_stats:
        print(f"\nPublication Stats:")
        print(f"  Total: {pub_stats.get('totalPublications', 'N/A')}")
        print(f"  Web of Science: {pub_stats.get('indexing', {}).get('webOfScience', 'N/A')}")


if __name__ == "__main__":
    main()
