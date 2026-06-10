'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AboutSectionProps {
    description: string
}

export default function AboutSection({ description }: AboutSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!description) return null

    // Regex to detect terms & conditions or rules section
    const tcRegex = /(?:T&C|T\s*&\s*C|Terms\s*&\s*Conditions|Terms\s+and\s+Conditions|Rules)\s*:?/i
    const matchIndex = description.search(tcRegex)

    let mainText = description
    let tcText = ''

    if (matchIndex !== -1) {
        mainText = description.substring(0, matchIndex).trim()
        tcText = description.substring(matchIndex).trim()
    }

    // Determine if toggle is needed
    // We base this on character count (e.g. > 240 chars) or if there's a T&C section
    const showToggle = description.length > 240 || tcText.length > 0

    // Parse T&C items
    let tcHeader = 'Terms & Conditions'
    let tcItems: string[] = []

    if (tcText) {
        const headerMatch = tcText.match(tcRegex)
        let rawTcBody = tcText
        if (headerMatch) {
            const matchedHeader = headerMatch[0].trim()
            if (matchedHeader.toLowerCase().includes('t&c') || matchedHeader.toLowerCase().includes('t & c')) {
                tcHeader = 'Terms & Conditions'
            } else {
                tcHeader = matchedHeader.replace(/:$/, '') // strip trailing colon
            }
            rawTcBody = tcText.substring(headerMatch[0].length).trim()
        }

        // Split by bullets, asterisks, dashes or newlines
        tcItems = rawTcBody
            .split(/(?:[\n•\-\*]|\s{2,})/)
            .map(item => item.trim())
            .filter(item => item.length > 0)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
                position: 'relative',
                maxHeight: !showToggle || isExpanded ? 'none' : '120px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
            }}>
                <p style={{ 
                    fontSize: 14, 
                    color: 'var(--text)', 
                    lineHeight: 1.7, 
                    margin: 0, 
                    whiteSpace: 'pre-line',
                    letterSpacing: '-0.01em'
                }}>
                    {mainText}
                </p>

                {/* Fade overlay when collapsed */}
                {showToggle && !isExpanded && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 50,
                        background: 'linear-gradient(to bottom, transparent, var(--bg-card))',
                        pointerEvents: 'none',
                    }} />
                )}
            </div>

            {/* T&C Section (only visible when expanded) */}
            {isExpanded && tcItems.length > 0 && (
                <div style={{
                    marginTop: 8,
                    paddingTop: 16,
                    borderTop: '1px dashed var(--border)',
                }}>
                    <h3 style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--text-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 10,
                    }}>
                        {tcHeader}
                    </h3>
                    <ul style={{
                        margin: 0,
                        paddingLeft: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                    }}>
                        {tcItems.map((item, idx) => (
                            <li key={idx} style={{
                                fontSize: 13,
                                color: 'var(--text-2)',
                                lineHeight: 1.6,
                            }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Read More / Read Less Button */}
            {showToggle && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        padding: '4px 0',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FF8533' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent)' }}
                >
                    {isExpanded ? (
                        <>
                            Read Less <ChevronUp size={14} />
                        </>
                    ) : (
                        <>
                            Read More <ChevronDown size={14} />
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
