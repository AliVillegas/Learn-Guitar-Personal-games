import { useTranslation } from 'react-i18next'
import { getAllGuitarStrings, getNotesForString } from '../../utils/notes'
import { Checkbox } from '../ui/checkbox'
import type { GuitarString, SolfegeNote } from '../../types/music'

interface StringSelectorProps {
  stringNotes: Array<{ string: GuitarString; notes: SolfegeNote[] }>
  onToggleNote: (guitarString: GuitarString, note: SolfegeNote) => void
}

function getStringTitle(guitarString: GuitarString, t: (key: string) => string): string {
  const ordinal = t(`strings.ordinal.${guitarString}`)
  const stringLabel = t('strings.string')
  return `${ordinal} ${stringLabel}`
}

function renderStringNoteCheckbox(
  guitarString: GuitarString,
  noteDef: { solfege: SolfegeNote; octave: 3 | 4 | 5 },
  checked: boolean,
  onToggle: (guitarString: GuitarString, note: SolfegeNote) => void,
  t: (key: string) => string
) {
  return (
    <label
      key={`${guitarString}-${noteDef.solfege}`}
      className="flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded hover:bg-muted"
    >
      <Checkbox
        checked={checked}
        onChange={() => onToggle(guitarString, noteDef.solfege)}
        aria-label={`${getStringTitle(guitarString, t)} - ${t(`notes.${noteDef.solfege}`)}`}
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
    <div key={guitarString} className="border border-border rounded-lg p-2.5 space-y-1.5">
      <h4 className="font-medium text-foreground text-sm">{getStringTitle(guitarString, t)}</h4>
      <div className="flex flex-wrap gap-1.5">
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
      <div className="space-y-3">
        {allStrings.map((guitarString) => {
          const stringConfig = stringNotes.find((sn) => sn.string === guitarString)
          return renderStringSection(guitarString, stringConfig, onToggleNote, t)
        })}
      </div>
    </div>
  )
}
