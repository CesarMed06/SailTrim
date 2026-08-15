import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { TrimProvider } from '../../context/TrimContext'
import { sendChatMessage, type ChatEntry } from '../../lib/chat'
import ChatPanel from '../ChatPanel'

vi.mock('../../lib/chat', () => ({
  sendChatMessage: vi.fn(),
}))

const mockedSend = vi.mocked(sendChatMessage)

function Harness() {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const id = 'chat-test-1'
  return (
    <ChatPanel
      activeChat={{ id, title: '', messages, tone: 'casual', diagnostic: false, createdAt: 0, updatedAt: 0, pinned: false }}
      activeId={id}
      onCreateChat={() => id}
      onUpdateMessages={(_id, msgs) => setMessages(msgs)}
      onUpdateSettings={() => {}}
      onClearChat={() => setMessages([])}
      onToggleSidebar={() => {}}
    />
  )
}

function renderPanel() {
  return render(
    <TrimProvider>
      <Harness />
    </TrimProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  mockedSend.mockReset()
})

describe('ChatPanel', () => {
  it('renders the message input and send button', () => {
    renderPanel()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument()
  })

  it('shows an error when sending without an API key', () => {
    renderPanel()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '¿cómo trimo en ceñida?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText(/Configura tu clave de Gemini/i)).toBeInTheDocument()
  })

  it('switches to diagnostic mode and shows its banner', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: /¿Qué está pasando\?/ }))
    expect(screen.getByText(/Modo diagnóstico activo/i)).toBeInTheDocument()
  })

  it('sends a message and renders the user and assistant messages', async () => {
    localStorage.setItem('sailtrim-gemini-key', 'test-key')
    mockedSend.mockResolvedValue({ content: 'Respuesta del patrón', suggestions: [] })

    renderPanel()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '¿cómo trimo?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(await screen.findByText('¿cómo trimo?')).toBeInTheDocument()
    const assistantNodes = await screen.findAllByText(
      (_, el) => el?.textContent?.replace(/\s+/g, ' ').trim() === 'Respuesta del patrón',
    )
    expect(assistantNodes.length).toBeGreaterThan(0)
  })
})
