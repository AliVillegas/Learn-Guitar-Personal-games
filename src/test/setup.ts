import '@testing-library/jest-dom'
import i18n from '../i18n'

i18n.changeLanguage('en')

function isToneAudioParamError(reason: unknown): boolean {
  return (
    typeof reason === 'object' &&
    reason !== null &&
    'message' in reason &&
    typeof reason.message === 'string' &&
    reason.message.includes('param must be an AudioParam')
  )
}

process.on('unhandledRejection', (reason) => {
  if (isToneAudioParamError(reason)) {
    return
  }
  throw reason
})
