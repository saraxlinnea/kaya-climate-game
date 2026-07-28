/**
 * Every dataset file / URL cited in DATA_SOURCES.md must appear somewhere in
 * app/src, src/, or Methods (Methodology.tsx). Node built-in test runner.
 */

const { readFileSync, readdirSync, statSync } = require('node:fs')
const { join, relative } = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = join(__dirname, '..')
const DATA_SOURCES = join(ROOT, 'DATA_SOURCES.md')

const SEARCH_ROOTS = [
  join(ROOT, 'app', 'src'),
  join(ROOT, 'src'),
]

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walkFiles(full, acc)
    } else if (/\.(tsx?|jsx?|py|md|css)$/.test(name)) {
      acc.push(full)
    }
  }
  return acc
}

function corpusText() {
  const files = SEARCH_ROOTS.flatMap((d) => walkFiles(d))
  return files.map((f) => readFileSync(f, 'utf8')).join('\n')
}

function citationsFromDataSources(md) {
  const citations = []
  // Table rows: | `file.csv` | https://... | ... |
  const rowRe =
    /\|\s*`([^`]+)`\s*\|\s*(https?:\/\/[^\s|]+)\s*\|/g
  let m
  while ((m = rowRe.exec(md)) !== null) {
    citations.push({ file: m[1], url: m[2].replace(/\/$/, '') })
  }
  // Provider homepage links in the intro
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  while ((m = linkRe.exec(md)) !== null) {
    citations.push({ file: null, url: m[2].replace(/\/$/, ''), label: m[1] })
  }
  return citations
}

test('DATA_SOURCES.md cites at least the three download datasets', () => {
  const md = readFileSync(DATA_SOURCES, 'utf8')
  const cited = citationsFromDataSources(md)
  const files = new Set(cited.map((c) => c.file).filter(Boolean))
  assert.ok(files.has('owid-co2-data.csv'), 'missing owid-co2-data.csv')
  assert.ok(files.has('owid-energy-data.csv'), 'missing owid-energy-data.csv')
  assert.ok(
    files.has('ember_yearly_electricity.csv'),
    'missing ember_yearly_electricity.csv',
  )
})

test('every dataset URL and filename in DATA_SOURCES.md is referenced in app/src or src/', () => {
  const md = readFileSync(DATA_SOURCES, 'utf8')
  const cited = citationsFromDataSources(md)
  const corpus = corpusText()
  const missing = []

  for (const c of cited) {
    if (c.file && !corpus.includes(c.file)) {
      missing.push(`filename ${c.file}`)
    }
    // Allow either full URL or a stable host path fragment
    if (c.url) {
      const urlHit = corpus.includes(c.url) || corpus.includes(c.url.replace(/^https?:\/\//, ''))
      const host = new URL(c.url).hostname
      const hostHit = corpus.includes(host)
      if (!urlHit && !hostHit) {
        missing.push(`url ${c.url}`)
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    `Unreferenced DATA_SOURCES citations:\n${missing.join('\n')}\n(searched ${relative(ROOT, SEARCH_ROOTS[0])} and ${relative(ROOT, SEARCH_ROOTS[1])})`,
  )
})

test('Methods states OWID, Ember, and Champion weights 30 / 25 / 20 / 25', () => {
  const methods = readFileSync(
    join(ROOT, 'app', 'src', 'components', 'Methodology.tsx'),
    'utf8',
  )
  const scoring = readFileSync(join(ROOT, 'SCORING.md'), 'utf8')

  assert.match(methods, /Our World in Data/)
  assert.match(methods, /ourworldindata\.org/)
  assert.match(methods, /Ember/)
  assert.match(methods, /ember-energy\.org/)
  assert.match(methods, /30\s*\/\s*25\s*\/\s*20\s*\/\s*25/)
  assert.match(methods, /research\/claims\.md/)
  assert.match(methods, /How we check ourselves/)

  assert.match(scoring, /\*\*30%\*\*/)
  assert.match(scoring, /\*\*25%\*\*/)
  assert.match(scoring, /\*\*20%\*\*/)
  // Scoring formula uses the same weights
  assert.match(scoring, /0\.30/)
  assert.match(scoring, /0\.25/)
  assert.match(scoring, /0\.20/)
})

test('shared Champion disclaimer exists and is used on score surfaces', () => {
  const cred = readFileSync(join(ROOT, 'app', 'src', 'lib', 'credibility.ts'), 'utf8')
  const scorePanel = readFileSync(
    join(ROOT, 'app', 'src', 'components', 'ScorePanel.tsx'),
    'utf8',
  )
  const leaderboard = readFileSync(
    join(ROOT, 'app', 'src', 'components', 'Leaderboard.tsx'),
    'utf8',
  )
  const worldMap = readFileSync(join(ROOT, 'app', 'src', 'components', 'WorldMap.tsx'), 'utf8')
  const methods = readFileSync(
    join(ROOT, 'app', 'src', 'components', 'Methodology.tsx'),
    'utf8',
  )

  assert.match(cred, /CHAMPION_DISCLAIMER/)
  assert.match(cred, /trajectory score/)
  assert.match(cred, /not an official IPCC/)
  assert.match(scorePanel, /CHAMPION_DISCLAIMER/)
  assert.match(leaderboard, /CHAMPION_DISCLAIMER/)
  assert.match(worldMap, /CHAMPION_DISCLAIMER/)
  assert.match(methods, /CHAMPION_DISCLAIMER/)
})

test('research/claims.md inventories core claim IDs', () => {
  const claims = readFileSync(join(ROOT, 'research', 'claims.md'), 'utf8')
  for (const id of ['C-L03', 'C-M09', 'C-S01', 'C-N01', 'C-G01']) {
    assert.match(claims, new RegExp(id))
  }
})
