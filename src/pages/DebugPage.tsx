import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Staff } from '../components/Staff/Staff'
import { Button } from '../components/ui/button'
import {
  createNoteDefinition,
  getNotesForString,
  getAllGuitarStrings,
  getGuitarSoundingFrequency,
} from '../utils/notes'
import { getAudioEngine, preloadGuitarSampler } from '../utils/audioEngines'
import { useGameStore } from '../store/gameStore'
import type { GameNote, GuitarString } from '../types/music'
import type { InstrumentType } from '../types/audio'

function generateAllNotes(): GameNote[] {
  const allStrings = getAllGuitarStrings()
  const notes: GameNote[] = []

  allStrings.forEach((string) => {
    const stringNotes = getNotesForString(string)
    stringNotes.forEach((noteDef) => {
      const note = createNoteDefinition(noteDef.solfege, noteDef.octave)
      notes.push({
        id: `${string}-${noteDef.solfege}-${noteDef.octave}`,
        note,
        status: 'pending',
      })
    })
  })

  return notes
}

function isGuitarInstrument(instrument: string): boolean {
  return instrument === 'guitar-synth' || instrument === 'guitar-classical'
}

function getNoteNameForInstrument(note: GameNote['note'], instrument: string): string {
  if (isGuitarInstrument(instrument)) {
    const soundingOctave = (note.octave - 1) as 2 | 3 | 4
    return `${note.letter}${soundingOctave}`
  }
  return `${note.letter}${note.octave}`
}

function getFrequencyForInstrument(note: GameNote['note'], instrument: string): number {
  if (isGuitarInstrument(instrument)) {
    return getGuitarSoundingFrequency(note.solfege, note.octave)
  }
  return note.frequency
}

async function playNote(note: GameNote['note'], instrument: string): Promise<void> {
  const engine = getAudioEngine(instrument as InstrumentType)
  const ctx = new AudioContext()

  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  if (isGuitarInstrument(instrument)) {
    await preloadGuitarSampler()
  }

  const noteName = getNoteNameForInstrument(note, instrument)
  const frequency = getFrequencyForInstrument(note, instrument)

  await engine.playNote({ frequency, noteName }, ctx.currentTime + 0.1, ctx)
}

function getDisplayFrequency(note: GameNote, instrument: string): number {
  if (isGuitarInstrument(instrument)) {
    return getGuitarSoundingFrequency(note.note.solfege, note.note.octave)
  }
  return note.note.frequency
}

function NoteCardHeader({
  note,
  string,
  onPlay,
}: {
  note: GameNote
  string: GuitarString
  onPlay: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <span className="font-semibold text-sm">
          {t(`notes.${note.note.solfege}`)} ({note.note.letter}
          {note.note.octave})
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          {t('strings.ordinal.' + string)} {t('strings.string')}
        </span>
      </div>
      <Button onClick={onPlay} size="sm" variant="outline">
        {t('debug.play')}
      </Button>
    </div>
  )
}

function NoteCardFrequency({
  displayFreq,
  soundingFreq,
  showSoundingFreq,
}: {
  displayFreq: number
  soundingFreq: number
  showSoundingFreq: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="text-xs text-muted-foreground">
      {t('debug.frequency')}: {displayFreq.toFixed(2)} Hz
      {showSoundingFreq && (
        <span className="ml-2">
          ({t('debug.sounding')}: {soundingFreq.toFixed(2)} Hz)
        </span>
      )}
    </div>
  )
}

function NoteCard({
  note,
  string,
  instrument,
}: {
  note: GameNote
  string: GuitarString
  instrument: string
}) {
  const displayFreq = getDisplayFrequency(note, instrument)
  const soundingFreq = getGuitarSoundingFrequency(note.note.solfege, note.note.octave)
  const showSoundingFreq = isGuitarInstrument(instrument)

  const handlePlay = async () => {
    try {
      await playNote(note.note, instrument)
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <NoteCardHeader note={note} string={string} onPlay={handlePlay} />
      <NoteCardFrequency
        displayFreq={displayFreq}
        soundingFreq={soundingFreq}
        showSoundingFreq={showSoundingFreq}
      />
    </div>
  )
}

function StringSection({
  string,
  notes,
  instrument,
}: {
  string: GuitarString
  notes: GameNote[]
  instrument: string
}) {
  const { t } = useTranslation()
  const stringNotes = notes.filter((n) => n.id.startsWith(`${string}-`))

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        {t('strings.ordinal.' + string)} {t('strings.string')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stringNotes.map((note) => (
          <NoteCard key={note.id} note={note} string={string} instrument={instrument} />
        ))}
      </div>
    </div>
  )
}

function OctaveSection({
  octave,
  notes,
  instrument,
}: {
  octave: 3 | 4 | 5
  notes: GameNote[]
  instrument: string
}) {
  const { t } = useTranslation()
  const octaveNotes = notes.filter((n) => n.note.octave === octave)
  const measureCount = Math.ceil(octaveNotes.length / 4) as 1 | 2 | 3 | 4

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">
        {t('debug.octave')} {octave} ({t('debug.written')})
      </h3>
      <Staff notes={octaveNotes} measureCount={measureCount} currentIndex={-1} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {octaveNotes.map((note) => {
          const stringMatch = note.id.match(/^(\d+)-/)
          const string = stringMatch ? (parseInt(stringMatch[1]) as GuitarString) : 6
          return <NoteCard key={note.id} note={note} string={string} instrument={instrument} />
        })}
      </div>
    </div>
  )
}

function getInstrumentTranslationKey(instrument: string): string {
  if (instrument === 'guitar-classical') {
    return 'guitarClassical'
  }
  if (instrument === 'guitar-synth') {
    return 'guitarSynth'
  }
  return 'midi'
}

function DebugPageHeader({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{t('debug.title')}</h2>
      <Button onClick={onBack} variant="ghost">
        {t('debug.backToConfig')}
      </Button>
    </div>
  )
}

function OctaveDisplaySection({ notes, instrument }: { notes: GameNote[]; instrument: string }) {
  const { t } = useTranslation()
  const instrumentKey = getInstrumentTranslationKey(instrument)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{t('debug.octaveDisplay')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('debug.instrument')}: {t(`config.instruments.${instrumentKey}`)}
        </p>
      </div>

      {([3, 4, 5] as const).map((octave) => (
        <OctaveSection key={octave} octave={octave} notes={notes} instrument={instrument} />
      ))}
    </div>
  )
}

export function DebugPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = useGameStore((state) => state.config)
  const allNotes = generateAllNotes()
  const allStrings = getAllGuitarStrings()

  return (
    <div className="space-y-6">
      <DebugPageHeader onBack={() => navigate('/config')} />

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('debug.allNotesDisplay')}</h3>
        <Staff notes={allNotes} measureCount={4} currentIndex={-1} />
      </div>

      <OctaveDisplaySection notes={allNotes} instrument={config.instrument} />

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">{t('debug.noteTesting')}</h3>

        {allStrings.map((string) => (
          <StringSection
            key={string}
            string={string}
            notes={allNotes}
            instrument={config.instrument}
          />
        ))}
      </div>
    </div>
  )
}
