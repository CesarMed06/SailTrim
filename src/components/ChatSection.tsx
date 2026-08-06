import { useState } from 'react'
import { useChatHistory } from '../hooks/useChatHistory'
import ChatSidebar from './ChatSidebar'
import ChatPanel from './ChatPanel'

export default function ChatSection() {
  const {
    chats: sortedChats,
    activeChat,
    activeId,
    hasAnyChats,
    createChat,
    updateMessages,
    deleteChat,
    clearChat,
    updateSettings,
    pinChat,
    renameChat,
    exportChat,
    setActiveId,
  } = useChatHistory()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={sortedChats}
        activeId={activeId}
        hasAnyChats={hasAnyChats}
        onCreate={createChat}
        onSelect={setActiveId}
        onDelete={deleteChat}
        onPin={pinChat}
        onRename={renameChat}
        onExport={exportChat}
      />

      <ChatPanel
        activeChat={activeChat}
        activeId={activeId}
        onCreateChat={createChat}
        onUpdateMessages={updateMessages}
        onUpdateSettings={(id, settings) => updateSettings(id, settings)}
        onClearChat={() => {
          if (activeId) {
            clearChat(activeId)
          }
        }}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
    </>
  )
}
