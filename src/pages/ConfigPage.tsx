import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../components/ConfigSection/ConfigSection'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAppHandlers } from '../hooks/useAppHandlers'

export function ConfigPage() {
  const navigate = useNavigate()
  const config = useGameStore((state) => state.config)
  const settings = useSettingsStore()
  const handlers = useAppHandlers()

  useEffect(() => {
    useGameStore.getState().setConfig({
      stringNotes: settings.stringNotes,
      measureCount: settings.measureCount,
      instrument: settings.instrument,
    })
  }, [settings.stringNotes, settings.measureCount, settings.instrument])

  const handleGenerate = () => {
    handlers.handleGenerate()
    navigate('/game')
  }

  return (
    <ConfigSection
      stringNotes={config.stringNotes}
      measureCount={config.measureCount}
      instrument={config.instrument}
      autoPlayOnGenerate={settings.autoPlayOnGenerate}
      onToggleStringNote={handlers.handleToggleStringNote}
      onChangeMeasure={handlers.handleChangeMeasure}
      onChangeInstrument={handlers.handleChangeInstrument}
      onChangeAutoPlay={settings.setAutoPlayOnGenerate}
      onGenerate={handleGenerate}
    />
  )
}
