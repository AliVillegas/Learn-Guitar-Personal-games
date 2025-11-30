import { BrowserRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

export function RouterWrapper({ children }: { children: ReactElement }) {
  return <BrowserRouter>{children}</BrowserRouter>
}
