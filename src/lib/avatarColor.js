// Returns a consistent Tailwind class pair for a given username.
// Same username always gets the same color across all components.

const PALETTES = [
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  { bg: 'bg-yellow-100', text: 'text-yellow-700'  },
  { bg: 'bg-blue-100',   text: 'text-blue-700'    },
]

export function getAvatarPalette(username = '') {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i)
  return PALETTES[hash % PALETTES.length]
}

export function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase()
}
