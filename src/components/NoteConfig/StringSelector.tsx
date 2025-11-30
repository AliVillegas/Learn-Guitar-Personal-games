import { useTranslation } from 'react-i18next'
import { getAllGuitarStrings, getNotesForString } from '../../utils/notes'
import { Checkbox } from '../ui/checkbox'
import type { GuitarString, SolfegeNote } from '../../types/music'

interface StringSelectorProps {
  stringNotes: Array<{ string: GuitarString; notes: SolfegeNote[] }>
  onToggleNote: (guitarString: GuitarString, note: SolfegeNote) => void
}

function getStringSuffix(guitarString: GuitarString): string {
  if (guitarString === 1) return 'st'
  if (guitarString === 2) return 'nd'
  if (guitarString === 3) return 'rd'
  return 'th'
}

function getStringTitle(guitarString: GuitarString): string {
  return `${guitarString}${getStringSuffix(guitarString)} String`
}

function renderStringNoteCheckbox(
  guitarString: GuitarString,
  noteDef: { solfege: SolfegeNote; octave: 3 | 4 },
  checked: boolean,
  onToggle: (guitarString: GuitarString, note: SolfegeNote) => void,
  t: (key: string) => string
) {
  return (
    <label
      key={`${guitarString}-${noteDef.solfege}`}
      className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded hover:bg-muted"
    >
      <Checkbox
        checked={checked}
        onChange={() => onToggle(guitarString, noteDef.solfege)}
        aria-label={`${getStringTitle(guitarString)} - ${t(`notes.${noteDef.solfege}`)}`}
      />
      <span className="text-sm">{t(`notes.${noteDef.solfege}`)}</span>
    </label>
  )
}

function renderStringSection(
  guitarString: GuitarString,
  stringConfig: { string: GuitarString; notes: SolfegeNote[] } | undefined,
  onToggleNote: (guitarString: GuitarString, note: SolfegeNote) => void,
  t: (key: string) => string
) {
  const availableNotes = getNotesForString(guitarString)
  const selectedNotes = stringConfig?.notes || []

  return (
    <div key={guitarString} className="border border-border rounded-lg p-4 space-y-2">
      <h4 className="font-medium text-foreground">{getStringTitle(guitarString)}</h4>
      <div className="flex flex-wrap gap-2">
        {availableNotes.map((noteDef) =>
          renderStringNoteCheckbox(
            guitarString,
            noteDef,
            selectedNotes.includes(noteDef.solfege),
            onToggleNote,
            t
          )
        )}
      </div>
    </div>
  )
}

export function StringSelector({ stringNotes, onToggleNote }: StringSelectorProps) {
  const { t } = useTranslation()
  const allStrings = getAllGuitarStrings()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">{t('config.selectStringNotes')}</h3>
      <div className="space-y-4">
        {allStrings.map((guitarString) => {
          const stringConfig = stringNotes.find((sn) => sn.string === guitarString)
          return renderStringSection(guitarString, stringConfig, onToggleNote, t)
        })}
      </div>
    </div>
  )
}
