import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from './LanguageSwitcher'
import i18n from '../../i18n'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('renders language switcher button', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays English flag and Español text when language is English', () => {
    i18n.changeLanguage('en')
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🇲🇽')
    expect(button).toHaveTextContent('Español')
  })

  it('displays Mexican flag and English text when language is Spanish', () => {
    i18n.changeLanguage('es')
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🇺🇸')
    expect(button).toHaveTextContent('English')
  })

  it('toggles language when clicked', async () => {
    i18n.changeLanguage('en')
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(i18n.language).toBe('es')
  })

  it('toggles back to English when clicked again', async () => {
    i18n.changeLanguage('es')
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(i18n.language).toBe('en')
  })
})
