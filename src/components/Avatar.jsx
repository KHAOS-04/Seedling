import { getAvatarPalette, getInitials } from '../lib/avatarColor'

export default function Avatar({ username, size = 'sm' }) {
  const { bg, text } = getAvatarPalette(username)
  const dim = size === 'lg' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'

  return (
    <div className={`${dim} ${bg} ${text} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none`}>
      {getInitials(username)}
    </div>
  )
}
