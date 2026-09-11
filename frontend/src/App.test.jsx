import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: vi.fn(), logout: vi.fn(), loading: false })
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // App should render without throwing
    expect(screen.getByText('Mentor Portal')).toBeInTheDocument()
  })
})