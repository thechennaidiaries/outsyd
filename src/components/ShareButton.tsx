'use client'
import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

interface Props {
    title: string
    text?: string
    label?: string
    iconOnly?: boolean
}

export default function ShareButton({ title, text, label = 'Share', iconOnly = false }: Props) {
    const [state, setState] = useState<'idle' | 'copied'>('idle')

    async function handleShare() {
        const url = window.location.href

        // Native share sheet (works great on mobile)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text: text ?? title, url })
                return
            } catch (_) {
                // User cancelled or API failed — fall through to clipboard
            }
        }

        // Clipboard fallback (desktop browsers)
        try {
            await navigator.clipboard.writeText(url)
            setState('copied')
            setTimeout(() => setState('idle'), 2200)
        } catch (_) {
            // Last resort — select a temp input
            const inp = document.createElement('input')
            inp.value = url
            document.body.appendChild(inp)
            inp.select()
            document.execCommand('copy')
            document.body.removeChild(inp)
            setState('copied')
            setTimeout(() => setState('idle'), 2200)
        }
    }

    const isCopied = state === 'copied'

    return (
        <button
            onClick={handleShare}
            aria-label="Share this activity"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: iconOnly ? 0 : 9,
                width: iconOnly ? 54 : '100%',
                height: iconOnly ? 54 : 'auto',
                padding: iconOnly ? 0 : '18px 24px',
                borderRadius: 'var(--radius)',
                background: isCopied ? 'rgba(255,107,0,0.08)' : 'transparent',
                color: isCopied ? 'var(--accent)' : 'var(--accent)',
                fontSize: 16,
                fontWeight: 700,
                border: `2px solid ${isCopied ? 'var(--accent)' : 'rgba(255,107,0,0.55)'}`,
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
            }}
        >
            {isCopied
                ? <Check size={18} strokeWidth={2.5} />
                : <Share2 size={18} strokeWidth={2} />
            }
            {!iconOnly && (isCopied ? 'Link Copied!' : label)}
        </button>
    )
}
