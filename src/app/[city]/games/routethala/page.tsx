'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MapPin, Camera, Share2, PlayCircle } from 'lucide-react'

const HOW_TO_PLAY = [
  { icon: <Camera size={18} />, text: 'Guess the spot in chennai from hard to guess pictures' },
  { icon: <MapPin size={18} />, text: 'Try to identify the area or landmark with as few tries as possible' },
  { icon: <Share2 size={18} />, text: 'Share your results with friends' },
]

export default function RouteThalaLandingPage() {
  const params = useParams()
  const city = params?.city ?? 'chennai'

  return (
    <>
      <style>{`
        @keyframes rt-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rt-pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(255,107,0,0.45); }
          70%  { box-shadow: 0 0 0 14px rgba(255,107,0,0);   }
          100% { box-shadow: 0 0 0 0   rgba(255,107,0,0);    }
        }
        @keyframes rt-pin-bob {
          0%,100% { transform: translateY(0);   }
          50%      { transform: translateY(-6px); }
        }
        .rt-fade-1 { animation: rt-fade-up 0.55s ease both; }
        .rt-fade-2 { animation: rt-fade-up 0.55s ease 0.10s both; }
        .rt-fade-3 { animation: rt-fade-up 0.55s ease 0.20s both; }
        .rt-fade-4 { animation: rt-fade-up 0.55s ease 0.30s both; }
        .rt-fade-5 { animation: rt-fade-up 0.55s ease 0.40s both; }
        .rt-title {
          font-size: 44px;
          font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ff6b00 0%, #ff9a3c 60%, #ffb870 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .rt-play-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .rt-play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(255,107,0,0.4) !important;
        }
        .rt-play-btn:active { transform: translateY(0); }
        .rt-pin { animation: rt-pin-bob 2.8s ease-in-out infinite; }
        .rt-step-card {
          transition: background 0.2s, border-color 0.2s;
        }
        .rt-step-card:hover {
          background: var(--bg-elevated) !important;
          border-color: var(--accent-border) !important;
        }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingBottom: 60,
      }}>
        <div style={{ maxWidth: 520, width: '100%', padding: '0 20px' }}>

          {/* ── Title ── */}
          <div className="rt-fade-2" style={{ textAlign: 'center', marginBottom: 10 }}>
            <h1 className="rt-title">
              Route Thala
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--text-2)',
              fontWeight: 500,
              lineHeight: 1.5,
            }}>
              Guess today&apos;s mystery Chennai spot in&nbsp;<strong style={{ color: 'var(--text)' }}>3 tries</strong>
            </p>
          </div>

          {/* ── Daily badge ── */}
          <div className="rt-fade-3" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '4px 12px',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              borderRadius: 20,
              border: '1px solid var(--accent-border)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              📍 New puzzle every day
            </span>
          </div>

          {/* ── How to play ── */}
          <div className="rt-fade-4" style={{ marginBottom: 36 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: 14, textAlign: 'center',
            }}>
              How to play
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HOW_TO_PLAY.map((step, i) => (
                <div key={i} className="rt-step-card" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 16px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)',
                  }}>
                    {step.icon}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Play Now CTA ── */}
          <div className="rt-fade-5">
            <Link
              href={`/${city}/games/routethala/play`}
              className="rt-play-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '17px 24px',
                background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c38 100%)',
                borderRadius: 16, border: 'none',
                color: '#fff', fontSize: 16, fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(255,107,0,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              <PlayCircle size={20} strokeWidth={2.2} />
              Play Route Thala
            </Link>
            <p style={{
              textAlign: 'center', fontSize: 12,
              color: 'var(--text-3)', marginTop: 12, fontWeight: 500,
            }}>
              Free · No signup required · Resets daily at midnight IST
            </p>
          </div>

        </div>
      </main>
    </>
  )
}
