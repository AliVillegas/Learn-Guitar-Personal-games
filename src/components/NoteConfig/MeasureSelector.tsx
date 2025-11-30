import { useTranslation } from 'react-i18next'
import { Select } from '../ui/select'
import type { MeasureCount } from '../../types/music'

interface MeasureSelectorProps {
  measureCount: MeasureCount
  onChange: (count: MeasureCount) => void
}

export function MeasureSelector({ measureCount, onChange }: MeasureSelectorProps) {
  const { t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value) as MeasureCount
    onChange(value)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">{t('config.measures')}:</label>
      <Select value={measureCount} onChange={handleChange} className="w-24">
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
      </Select>
    </div>
  )
}
