import { useNavigate } from 'react-router-dom'
import { ConfigSection } from '../components/ConfigSection/ConfigSection'
import { useGameStore } from '../store/gameStore'
import { useAppHandlers } from '../hooks/useAppHandlers'

export function ConfigPage() {
  const navigate = useNavigate()
  const config = useGameStore((state) => state.config)
  const handlers = useAppHandlers()

  const handleGenerate = () => {
    handlers.handleGenerate()
    navigate('/game')
  }

  return (
    <ConfigSection
      stringNotes={config.stringNotes}
      measureCount={config.measureCount}
      instrument={config.instrument}
      onToggleStringNote={handlers.handleToggleStringNote}
      onChangeMeasure={handlers.handleChangeMeasure}
      onChangeInstrument={handlers.handleChangeInstrument}
      onGenerate={handleGenerate}
    />
  )
}
