import { useTranslation } from 'react-i18next'
import { getAllGuitarStrings, getSolfegeFromString } from '../../utils/notes'
import { Checkbox } from '../ui/checkbox'
import type { GuitarString } from '../../types/music'

interface StringSelectorProps {
  selectedStrings: GuitarString[]
  onToggle: (guitarString: GuitarString) => void
}

function getStringSuffix(guitarString: GuitarString): string {
  if (guitarString === 1) return 'st'
  if (guitarString === 2) return 'nd'
  if (guitarString === 3) return 'rd'
  return 'th'
}

function getStringLabel(guitarString: GuitarString, solfege: string): string {
  return `${guitarString}${getStringSuffix(guitarString)} (${solfege})`
}

export function StringSelector({ selectedStrings, onToggle }: StringSelectorProps) {
  const { t } = useTranslation()
  const allStrings = getAllGuitarStrings()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t('config.selectStrings')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allStrings.map((guitarString) => {
          const solfege = getSolfegeFromString(guitarString)
          const checked = selectedStrings.includes(guitarString)
          return (
            <label
              key={guitarString}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted"
            >
              <Checkbox
                checked={checked}
                onChange={() => onToggle(guitarString)}
                aria-label={getStringLabel(guitarString, t(`notes.${solfege}`))}
              />
              <span className="text-sm font-medium">
                {getStringLabel(guitarString, t(`notes.${solfege}`))}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
