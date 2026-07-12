import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Shuffle, Clock } from 'lucide-react'
import { vocabulary as baseVocabulary } from '../data/vocabulary'
import type { VocabWord } from '../data/vocabulary'
import { FlashCard } from '../components/FlashCard'
import { SpeakButton } from '../components/SpeakButton'
import { useStore, initNewWord } from '../store/useStore'

export function VocabularyPage() {
  const [searchParams] = useSearchParams()
  const urlMode = searchParams.get('mode')
  const dueOnly = searchParams.get('due') === '1'

  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'list' | 'cards'>(urlMode === 'cards' ? 'cards' : 'list')
  const [cardIndex, setCardIndex] = useState(0)
  const updateSrsCard = useStore((s) => s.updateSrsCard)
  const addStudyTime = useStore((s) => s.addStudyTime)
  const srsCards = useStore((s) => s.progress.srsCards)
  const adaptiveWords = useStore((s) => s.progress.adaptiveWords)
  const getDueCards = useStore((s) => s.getDueCards)

  const dueIds = useMemo(() => new Set(getDueCards()), [getDueCards, srsCards])

  const vocabulary: VocabWord[] = useMemo(() => {
    const adaptive = adaptiveWords.map((w) => ({
      id: w.id,
      lv: w.lv,
      ru: w.ru,
      category: w.category,
      level: 'A1' as const,
    }))
    return [...baseVocabulary, ...adaptive]
  }, [adaptiveWords])

  const categories = useMemo(
    () => [...new Set(vocabulary.map((v) => v.category))],
    [vocabulary],
  )

  const [cardWords, setCardWords] = useState<typeof vocabulary>([])

  const filtered = useMemo(() => {
    return vocabulary.filter((w) => {
      const matchCat = category === 'all' || w.category === category
      const matchSearch =
        !search ||
        w.lv.toLowerCase().includes(search.toLowerCase()) ||
        w.ru.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [category, search, vocabulary])

  const dueFiltered = useMemo(() => {
    if (!dueOnly) return filtered
    return filtered.filter((w) => dueIds.has(w.id))
  }, [filtered, dueOnly, dueIds])

  useEffect(() => {
    if (urlMode === 'cards') setMode('cards')
  }, [urlMode])

  useEffect(() => {
    if (mode === 'cards') {
      const pool = dueOnly ? dueFiltered : filtered
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      shuffled.forEach((w) => initNewWord(w.id))
      setCardWords(shuffled)
      setCardIndex(0)
    }
  }, [mode, filtered, dueFiltered, dueOnly])

  const handleRate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const word = cardWords[cardIndex]
    if (word) updateSrsCard(word.id, quality, word.category)
    if ((cardIndex + 1) % 3 === 0) addStudyTime(1)
    if (cardIndex < cardWords.length - 1) {
      setCardIndex((i) => i + 1)
    } else {
      setMode('list')
      setCardIndex(0)
    }
  }

  const dueCount = dueIds.size

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">Словарь</h1>
      <p className="mb-4 text-muted">
        {vocabulary.length} слов с интервальным повторением (SRS)
      </p>

      {dueCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
          <Clock size={18} className="text-gold" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gold">
              На сегодня: {dueCount} {dueCount === 1 ? 'карточка' : dueCount < 5 ? 'карточки' : 'карточек'}
            </p>
            <p className="text-xs text-muted">Повторите слова, которые пора вспомнить</p>
          </div>
          <Link
            to="/vocabulary?mode=cards&due=1"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90"
          >
            Повторить
          </Link>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-10 pr-4 outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setMode('list'); setCardIndex(0) }}
            className={`rounded-xl px-4 py-2 text-sm ${mode === 'list' ? 'bg-accent text-white' : 'border border-border'}`}
          >
            Список
          </button>
          <button
            type="button"
            onClick={() => { setMode('cards'); setCardIndex(0) }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${mode === 'cards' ? 'bg-accent text-white' : 'border border-border'}`}
          >
            <Shuffle size={14} />
            Карточки
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full px-3 py-1 text-xs ${category === 'all' ? 'bg-accent text-white' : 'border border-border'}`}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs ${category === cat ? 'bg-accent text-white' : 'border border-border'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {mode === 'cards' ? (
        <div>
          {dueOnly && (
            <p className="mb-2 text-center text-sm text-gold">Режим: только слова на повторение</p>
          )}
          {cardWords.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
              <p className="text-muted">
                {dueOnly ? 'Нет карточек на повторение — отлично!' : 'Нет слов для показа'}
              </p>
              {dueOnly && (
                <Link to="/vocabulary?mode=cards" className="mt-4 inline-block text-accent">
                  Все карточки →
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-sm text-muted">
                Карточка {cardIndex + 1} из {cardWords.length}
              </p>
              {cardWords[cardIndex] && (
                <FlashCard word={cardWords[cardIndex]} onRate={handleRate} />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((word) => {
            const srs = srsCards[word.id]
            const isDue = dueIds.has(word.id)
            return (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
                  <span className="latvian-text font-medium text-accent sm:w-40">{word.lv}</span>
                  <span className="text-muted">{word.ru}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                    {word.category}
                  </span>
                  {isDue && (
                    <span className="text-xs text-gold">⏰ на повторение</span>
                  )}
                  {srs && srs.reps > 0 && !isDue && (
                    <span className="text-xs text-success">✓ {srs.reps}×</span>
                  )}
                </div>
                <SpeakButton text={word.lv} size="sm" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
