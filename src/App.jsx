import React, { useState, useMemo, useEffect } from 'react'

const PALETTE = [
  '#4A7B9D',
  '#D95A53',
  '#82A67D',
  '#E5B25D',
  '#D98C64',
  '#6D5B87',
  '#3D8C8A',
  '#B85B7A',
]

const STOP_WORDS = new Set([
  'der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem',
  'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird',
  'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur',
  'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'pro', 'mein', 'dein', 'ihr',
  'unser', 'euer', 'ich', 'du', 'wir', 'ihnen', 'mir', 'mich', 'dir', 'dich', 'da', 'dann', 'doch', 'mal', 'ja',
  'nein', 'nun', 'schon', 'sehr', 'oft', 'hier', 'dort', 'welche', 'welcher', 'welches', 'dies', 'diese', 'dieser',
  'dieses',
])

const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export default function App() {
  const [inputText, setInputText] = useState(
    'Dies ist ein proportionaler Text.\nKeine künstliche Streckung mehr.\nJede Zeile im Textfeld ist exakt eine Zeile hier.\n\nDrücke die Leertaste um die Matrix zu entschlüsseln.\nDie Animation arbeitet sich als Welle durch das System.\n\nWenn du nochmal drückst, fallen die Wörter wieder in ihre abstrakte Form zurück.',
  )

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeWord, setActiveWord] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [dummyWordCount, setDummyWordCount] = useState(100)

  const generateDummyText = (count) => {
    const nouns = [
      'System', 'Matrix', 'Pixel', 'Farbe', 'Wort', 'Struktur', 'Zeile', 'Abstraktion', 'Raum', 'Licht', 'Schatten',
      'Maschine', 'Daten', 'Rhythmus', 'Klang', 'Raster', 'Code', 'Form',
    ]
    const verbs = [
      'fließt', 'steht', 'arbeitet', 'skaliert', 'verwandelt', 'leuchtet', 'bricht', 'fällt', 'beobachtet', 'zwingt',
      'entschlüsselt', 'pulsiert', 'webt', 'atmet',
    ]
    const adjs = [
      'brachial', 'proportional', 'dunkel', 'hell', 'schnell', 'langsam', 'abstrakt', 'konkret', 'visuell', 'endlos',
      'begrenzt', 'kalt', 'warm', 'scharf',
    ]
    const stops = [
      'der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'sich', 'auf', 'für', 'ist', 'im', 'nicht', 'ein',
      'eine', 'als', 'auch', 'aus', 'er', 'sie', 'es',
    ]

    const textArray = []
    let wordsSincePeriod = 0

    for (let i = 0; i < count; i++) {
      let word = ''
      const rand = Math.random()
      if (rand < 0.45) word = stops[Math.floor(Math.random() * stops.length)]
      else if (rand < 0.7) word = nouns[Math.floor(Math.random() * nouns.length)]
      else if (rand < 0.85) word = verbs[Math.floor(Math.random() * verbs.length)]
      else word = adjs[Math.floor(Math.random() * adjs.length)]

      if (wordsSincePeriod === 0 && word.length > 0) {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }

      let punctuation = ''
      wordsSincePeriod++
      if ((wordsSincePeriod > 5 && Math.random() > 0.8) || wordsSincePeriod > 12) {
        punctuation = '.'
        wordsSincePeriod = 0
      } else if (wordsSincePeriod > 3 && Math.random() > 0.9) {
        punctuation = ','
      }

      textArray.push(word + punctuation)
    }

    if (textArray.length > 0 && !textArray[textArray.length - 1].endsWith('.')) {
      textArray[textArray.length - 1] = textArray[textArray.length - 1].replace(/,$/, '') + '.'
    }

    let finalString = textArray.join(' ')
    finalString = finalString.replace(/(\w+\.)\s/g, (match) => (Math.random() > 0.8 ? match + '\n\n' : match))
    return finalString
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isDrawerOpen && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setIsRevealed((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  const { paragraphs, maxLineLetters, lineCount } = useMemo(() => {
    if (!inputText) return { paragraphs: [], maxLineLetters: 1, lineCount: 1 }

    const rawParagraphs = inputText.split('\n')
    let maxLetters = 0
    let globalWordIndex = 0

    const parsedParagraphs = rawParagraphs.map((paragraph) => {
      const rawWords = paragraph.split(/\s+/).filter((w) => w.length > 0)
      let paragraphLetterCount = 0

      const words = rawWords.map((rawWord) => {
        const cleanWord = rawWord.replace(/[.,!?;:()]/g, '')
        const lowerWord = cleanWord.toLowerCase()

        const hasPunctuation = rawWord !== cleanWord
        const isCapitalized =
          cleanWord.length > 0 && cleanWord[0] === cleanWord[0].toUpperCase() && isNaN(cleanWord[0])
        const isStopWord = STOP_WORDS.has(lowerWord) || cleanWord.length < 2

        const lettersArray = cleanWord.split('')
        const letterCount = Math.max(1, lettersArray.length)
        const vowelCount = lettersArray.filter((l) => /[aeiouyäöü]/i.test(l)).length
        const consonantCount = lettersArray.filter((l) => /[bcdfghjklmnpqrstvwxzß]/i.test(l)).length

        const syllableMatches = lowerWord.match(/[aeiouyäöü]+/g)
        const syllableCount = syllableMatches ? syllableMatches.length : letterCount > 0 ? 1 : 0

        let backgroundColor = '#3F3F46'
        if (!isStopWord && cleanWord.length > 0) {
          const colorIndex = hashCode(lowerWord) % PALETTE.length
          backgroundColor = PALETTE[colorIndex]
        }

        paragraphLetterCount += letterCount
        const currentGlobalIndex = globalWordIndex++

        return {
          raw: rawWord,
          clean: cleanWord,
          hasPunctuation,
          isCapitalized,
          isStopWord,
          backgroundColor,
          lettersArray,
          letterCount,
          vowelCount,
          consonantCount,
          syllableCount,
          globalIndex: currentGlobalIndex,
        }
      })

      maxLetters = Math.max(maxLetters, paragraphLetterCount)
      return { words, paragraphLetterCount }
    })

    return {
      paragraphs: parsedParagraphs,
      maxLineLetters: Math.max(1, maxLetters),
      lineCount: Math.max(1, parsedParagraphs.length),
    }
  }, [inputText])

  const handleBackgroundClick = () => {
    if (activeWord) setActiveWord(null)
  }

  const lineHeightEm = 1.5
  const scaleCSS = `min(100vw / ${maxLineLetters * 0.7}, 100vh / ${lineCount * lineHeightEm})`

  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden flex flex-col font-sans relative select-none justify-center items-start"
      onClick={handleBackgroundClick}
      style={{ fontSize: scaleCSS }}
    >
      <div className="w-full flex flex-col items-start">
        {paragraphs.map((paragraph, pIndex) => (
          <div
            key={pIndex}
            className="flex flex-row items-start"
            style={{ height: `${lineHeightEm}em` }}
          >
            {paragraph.words.map((wordData, wIndex) => (
              <div
                key={`${pIndex}-${wIndex}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveWord(wordData)
                }}
                className="relative cursor-crosshair group overflow-hidden"
                style={{ height: '100%' }}
              >
                <span
                  className="font-black uppercase opacity-0 pointer-events-none flex items-center h-full"
                  style={{
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontSize: '0.9em',
                    padding: '0 0.05em',
                  }}
                >
                  {wordData.clean}
                </span>

                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity z-30 pointer-events-none" />

                <div
                  className="absolute inset-0 transition-all duration-200 ease-out flex flex-col pointer-events-none"
                  style={{
                    backgroundColor: wordData.backgroundColor,
                    opacity: isRevealed ? 0 : 1,
                    transform: isRevealed ? 'scale(0.8)' : 'scale(1)',
                    transitionDelay: `${wordData.globalIndex * 5}ms`,
                    zIndex: isRevealed ? 0 : 20,
                  }}
                >
                  {wordData.isCapitalized && (
                    <div
                      className="absolute inset-0 bg-black mix-blend-multiply opacity-20"
                      style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
                    />
                  )}
                  {wordData.syllableCount > 0 && (
                    <div className="absolute top-0 right-0 flex">
                      {Array.from({ length: wordData.syllableCount }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white/80 border-[0.05em] border-black/20"
                          style={{ width: '0.25em', height: '0.25em' }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full flex h-[15%] min-h-[2px]">
                    {wordData.lettersArray.map((char, i) => {
                      const isVowel = /[aeiouyäöü]/i.test(char)
                      return (
                        <div
                          key={i}
                          className={`flex-1 ${isVowel ? 'bg-white/40' : 'bg-black/30'}`}
                        />
                      )
                    })}
                  </div>
                  {wordData.hasPunctuation && (
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-[0.1em]">
                      <div
                        className="bg-black/90"
                        style={{ width: '0.3em', height: '0.3em' }}
                      />
                    </div>
                  )}
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out pointer-events-none"
                  style={{
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? 'scale(1)' : 'scale(1.2)',
                    transitionDelay: `${wordData.globalIndex * 5}ms`,
                    zIndex: isRevealed ? 20 : 0,
                  }}
                >
                  <span
                    className="font-black uppercase"
                    style={{
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontSize: '0.9em',
                      color: wordData.isStopWord ? '#71717A' : wordData.backgroundColor,
                    }}
                  >
                    {wordData.clean}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {paragraphs.length === 0 && (
          <div
            className="h-full flex items-center justify-center text-zinc-800 text-4xl font-bold tracking-tighter w-full"
            style={{ fontSize: '2rem' }}
          >
            KEIN TEXT
          </div>
        )}
      </div>

      {activeWord && (
        <div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/95 text-white px-6 py-2.5 z-40 pointer-events-none flex items-baseline gap-5 border border-zinc-900 shadow-xl"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          <span className="text-lg tracking-widest uppercase font-light">
            {activeWord.raw}
          </span>
          <div className="flex gap-3 text-xs text-zinc-500 tracking-widest font-light uppercase">
            <span>L {activeWord.letterCount}</span>
            <span>S {activeWord.syllableCount}</span>
            <span>V {activeWord.vowelCount}</span>
            <span>C {activeWord.consonantCount}</span>
          </div>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsDrawerOpen(!isDrawerOpen)
        }}
        className="fixed top-6 right-6 z-50 bg-black p-3 text-white border-2 border-transparent hover:border-white transition-all flex items-center justify-center w-12 h-12 mix-blend-difference"
        aria-label="Toggle Menu"
      >
        {isDrawerOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-black text-white border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: '1rem' }}
      >
        <div className="p-6 pt-24 flex flex-col h-full gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex items-center gap-3 p-3 border border-zinc-800 bg-zinc-950">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={dummyWordCount}
                onChange={(e) => setDummyWordCount(Number(e.target.value))}
                className="flex-grow accent-white"
              />
              <button
                onClick={() => setInputText(generateDummyText(dummyWordCount))}
                className="whitespace-nowrap px-3 py-1.5 border border-zinc-700 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase tracking-widest"
              >
                {dummyWordCount}W. Gen
              </button>
            </div>

            <textarea
              className="w-full flex-grow min-h-[300px] p-4 border border-zinc-800 focus:outline-none focus:border-white bg-zinc-950 text-white resize-none font-mono text-sm leading-relaxed whitespace-pre"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Textmatrix..."
            />
          </div>

          <div className="bg-zinc-950 p-4 border border-zinc-800">
            <ul className="space-y-4 text-xs font-mono tracking-wider uppercase text-zinc-400">
              <li className="flex items-center gap-4">
                <div className="w-12 h-6 bg-[#3F3F46]" />
                <span>Strukturwort</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-12 h-6 bg-[#D95A53]" />
                <span>Inhaltswort</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-12 h-6 bg-[#82A67D] relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-black opacity-30"
                    style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
                  />
                </div>
                <span>Grossgeschrieben</span>
              </li>
              <li className="pt-4 border-t border-zinc-800 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-[2px]">
                    <div className="w-1.5 h-1.5 bg-white" />
                    <div className="w-1.5 h-1.5 bg-white" />
                  </div>
                  <span>Silben (Oben)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-2 flex">
                    <div className="flex-1 bg-zinc-300" />
                    <div className="flex-1 bg-zinc-700" />
                    <div className="flex-1 bg-zinc-300" />
                  </div>
                  <span>Vok/Kon (Unten)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-black ring-1 ring-zinc-700" />
                  <span>Satzzeichen</span>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-800 text-white">
                  <div className="w-12 h-6 border border-white flex items-center justify-center">
                    ␣
                  </div>
                  <span>SPACE: Text-Matrix an/aus</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
