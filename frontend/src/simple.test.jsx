import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Simple component for testing
function TestComponent() {
  return <div data-testid="test">Hello World</div>
}

describe('TestComponent', () => {
  it('renders correctly', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('test')).toHaveTextContent('Hello World')
  })
})