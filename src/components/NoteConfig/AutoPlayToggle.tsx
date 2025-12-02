import { useTranslation } from 'react-i18next'
import { Checkbox } from '../ui/checkbox'

interface AutoPlayToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function AutoPlayToggle({ checked, onChange }: AutoPlayToggleProps) {
  const { t } = useTranslation()

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm">{t('config.autoPlayOnGenerate')}</span>
    </label>
  )
}
