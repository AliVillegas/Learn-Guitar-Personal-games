import { useTranslation } from 'react-i18next'
import { Select } from '../ui/select'
import type { InstrumentType } from '../../types/audio'

interface InstrumentSelectorProps {
  instrument: InstrumentType
  onChange: (instrument: InstrumentType) => void
}

export function InstrumentSelector({ instrument, onChange }: InstrumentSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{t('config.instrument')}</label>
      <Select value={instrument} onChange={(e) => onChange(e.target.value as InstrumentType)}>
        <option value="midi">{t('config.instruments.midi')}</option>
        <option value="guitar-synth">{t('config.instruments.guitarSynth')}</option>
        <option value="guitar-classical">{t('config.instruments.guitarClassical')}</option>
      </Select>
    </div>
  )
}
