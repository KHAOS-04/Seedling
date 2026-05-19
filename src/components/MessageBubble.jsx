import Avatar from './Avatar'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Detects if the message text is a file URL posted by the upload button
function isFileUrl(text) {
  return typeof text === 'string' && text.startsWith('/uploads/')
}

function FileCard({ url, serverUrl }) {
  const filename = url.split('/').pop()
  const fullUrl  = `${serverUrl}${url}`
  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
      className="
        flex items-center gap-2 mt-1.5 px-3 py-2
        bg-white border border-purple-200 rounded-xl
        text-xs text-purple-600 font-medium
        hover:bg-purple-50 transition-colors
        max-w-[220px]
      "
    >
      <span className="text-base">📎</span>
      <span className="truncate">{filename}</span>
      <span className="text-purple-400 flex-shrink-0">↗</span>
    </a>
  )
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export default function MessageBubble({ message, isOwn }) {
  const { username, text, createdAt, type } = message

  if (type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-[10px] text-purple-400 bg-purple-50 px-3 py-1 rounded-full">{text}</span>
      </div>
    )
  }

  const fileMessage = isFileUrl(text)

  return (
    <div className={`flex items-start gap-2.5 msg-enter ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && <Avatar username={username} />}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="flex items-baseline gap-1.5 px-1 mb-0.5">
            <span className="text-xs font-bold text-purple-700">{username}</span>
            <span className="text-[10px] text-purple-300">{formatTime(createdAt)}</span>
          </div>
        )}

        {fileMessage ? (
          <FileCard url={text} serverUrl={SERVER_URL} />
        ) : (
          <div className={`
            px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
            ${isOwn
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'bg-purple-50 text-purple-900 border border-purple-100 rounded-tl-sm'}
          `}>
            {text}
          </div>
        )}

        {isOwn && (
          <span className="text-[10px] text-purple-300 px-1 mt-0.5">{formatTime(createdAt)}</span>
        )}
      </div>
    </div>
  )
}
