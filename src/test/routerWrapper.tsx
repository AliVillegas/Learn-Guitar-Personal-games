import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

export function RouterWrapper({
  children,
  initialEntries,
}: {
  children: ReactElement
  initialEntries?: string[]
}) {
  if (initialEntries) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  }
  return <BrowserRouter>{children}</BrowserRouter>
}
