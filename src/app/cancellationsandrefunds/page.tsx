import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Outsyd',
  description: 'Read the Cancellation and Refund Policy for Outsyd event bookings, cancellation conditions, and processed refund timelines.',
}

export default function CancellationAndRefundPolicyPage() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)', 
      paddingTop: 120, 
      paddingBottom: 80, 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Ambient background glows */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        left: '-10%', 
        width: '40vw', 
        height: '40vw', 
        background: 'rgba(255, 107, 0, 0.03)', 
        filter: 'blur(120px)', 
        borderRadius: '50%', 
        pointerEvents: 'none' 
      }} className="orb-1" />
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        right: '-10%', 
        width: '30vw', 
        height: '30vw', 
        background: 'rgba(99, 102, 241, 0.04)', 
        filter: 'blur(100px)', 
        borderRadius: '50%', 
        pointerEvents: 'none' 
      }} className="orb-2" />

      <style>{`
        .policy-link {
          color: var(--accent-2);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .policy-link:hover {
          color: var(--accent);
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }} className="animate-fade-up">
          <h1 id="policy-title" className="section-gradient-text" style={{ 
            fontSize: 'calc(2rem + 1.2vw)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            marginBottom: 12 
          }}>
            Cancellation & Refund Policy
          </h1>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'var(--bg-elevated)', 
            padding: '6px 12px', 
            borderRadius: 20, 
            fontSize: 12, 
            color: 'var(--text-2)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Calendar size={13} color="var(--accent)" />
            <span>Last updated on 02-06-2026</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass-panel animate-fade-up" style={{ 
          borderRadius: 'var(--radius-lg)', 
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32
        }}>
          {/* Introductory Paragraph */}
          <section>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              At Outsyd, we strive to provide a seamless event booking experience. This Cancellation & Refund Policy outlines the terms applicable to bookings made through our platform.
            </p>
          </section>

          {/* Ticket Cancellations */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
            <h2 id="ticket-cancellation-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Ticket Cancellations
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Unless otherwise specified on the event page, bookings made through Outsyd are non-cancellable and non-transferable. Users are advised to carefully review event details before completing a booking.
            </p>
          </section>

          {/* Event Cancellation */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
            <h2 id="event-cancellation-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Event Cancellation
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              If an event is cancelled, ticket holders will receive a full refund of the ticket amount paid.
            </p>
          </section>

          {/* Refund Processing */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 id="refund-processing-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Refund Processing
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Approved refunds will be processed to the original payment method used for the booking.
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Refunds are typically processed within <strong style={{ color: 'var(--text)' }}>3–5 business days</strong>, although the actual credit timeline may vary depending on the customer&apos;s bank or payment provider.
            </p>
          </section>

          {/* Contact Us */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
            <h2 id="contact-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Contact Us
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              For any questions regarding cancellations or refunds, please contact us using the details provided on our{' '}
              <Link href="/contactus" id="policy-contact-link" className="policy-link">
                Contact Us page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
