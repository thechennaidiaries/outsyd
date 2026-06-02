import type { Metadata } from 'next'
import { Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Outsyd',
  description: 'Read the Terms and Conditions for using the Outsyd website, booking platform, cancellation policies, and related services.',
}

export default function TermsAndConditionsPage() {
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }} className="animate-fade-up">
          <h1 id="terms-title" className="section-gradient-text" style={{ 
            fontSize: 'calc(2rem + 1.2vw)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            marginBottom: 12 
          }}>
            Terms & Conditions
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
          {/* Introductory Paragraphs */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              These Terms and Conditions, along with our Privacy Policy and other applicable policies (&ldquo;Terms&rdquo;), constitute a binding agreement between <strong style={{ color: 'var(--text)' }}>JAWAHAR RAVINDRAN NITHIN</strong>, operating under the brand name <strong style={{ color: 'var(--text)' }}>Outsyd</strong> (&ldquo;Website Owner&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), and you (&ldquo;you&rdquo; or &ldquo;your&rdquo;), and govern your use of the Outsyd website, platform, and related services (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              By using our website and availing of our Services, you acknowledge that you have read, understood, and agreed to these Terms, including our Privacy Policy. We reserve the right to modify these Terms at any time without prior notice. It is your responsibility to periodically review these Terms to stay informed of any updates.
            </p>
          </section>

          {/* About Section */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
            <h2 id="about-outsyd-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
              About Outsyd
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>
              Outsyd is an event discovery and booking platform that helps users discover, book, and participate in social events, activities, workshops, meetups, and experiences organized by Outsyd and third-party event organizers.
            </p>

            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>
              The use of this website and our Services is subject to the following terms:
            </p>

            {/* Styled ordered list */}
            <ol style={{ 
              listStyleType: 'none', 
              paddingLeft: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20 
            }}>
              {[
                "To access and use the Services, you agree to provide true, accurate, and complete information during registration and thereafter. You shall be responsible for all activities conducted through your registered account.",
                "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials offered on this website or through the Services for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
                "Your use of the Website and Services is solely at your own risk and discretion. You are responsible for independently evaluating whether the Services meet your requirements.",
                "The content of the Website and Services is proprietary to us. You shall not acquire any intellectual property rights, title, or interest in the content by virtue of using the Website or Services.",
                "You acknowledge that unauthorized use of the Website or Services may result in legal action against you under these Terms and applicable laws.",
                "You agree to pay all applicable charges associated with availing the Services.",
                "You agree not to use the Website or Services for any purpose that is unlawful, illegal, prohibited by these Terms, or in violation of any applicable laws or regulations.",
                "The Website and Services may contain links to third-party websites. Upon accessing such websites, you will be governed by their respective terms of use, privacy policies, and other applicable policies. We shall not be responsible for the content or practices of such third-party websites.",
                "You acknowledge that upon initiating a transaction for availing the Services, you are entering into a legally binding and enforceable agreement with us for the provision of the Services."
              ].map((text, idx) => (
                <li key={idx} style={{ 
                  display: 'flex', 
                  gap: 14, 
                  fontSize: 15, 
                  color: 'var(--text-2)', 
                  lineHeight: 1.75 
                }}>
                  <span style={{ 
                    color: 'var(--accent-2)', 
                    fontWeight: 700, 
                    fontSize: 14, 
                    minWidth: 20, 
                    textAlign: 'right',
                    marginTop: 2
                  }}>
                    {idx + 1}.
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Event Discovery Section */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 id="event-discovery-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Event Discovery and Booking Platform
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Outsyd is an event discovery and booking platform that enables users to discover, register for, and participate in events organized either by Outsyd or by third-party event organizers. Admission to events is subject to the rules, requirements, and policies of the respective event organizer.
            </p>
          </section>

          {/* Event Cancellation Section */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 id="cancellation-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: -6 }}>
              Event Cancellation, Postponement, or Rescheduling
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Event cancellations, postponements, or rescheduling may occur due to circumstances beyond our control. In such cases, refunds or alternative arrangements will be provided in accordance with the refund and cancellation policy of the respective event organizer.
            </p>

            <ol style={{ 
              listStyleType: 'none', 
              paddingLeft: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20 
            }} start={10}>
              {[
                "You shall be entitled to claim a refund of payments made by you if we are unable to provide the Services. Refund timelines and eligibility shall be governed by the specific Service availed and our applicable refund policies. Failure to raise a refund request within the stipulated period may render you ineligible for a refund.",
                "Notwithstanding anything contained in these Terms, neither party shall be liable for any failure or delay in performing its obligations where such failure or delay is caused by a force majeure event.",
                "These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of India.",
                "All disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in Madurai, Tamil Nadu.",
                "All concerns, complaints, or communications relating to these Terms must be communicated to us using the contact details provided on this website."
              ].map((text, idx) => (
                <li key={idx} style={{ 
                  display: 'flex', 
                  gap: 14, 
                  fontSize: 15, 
                  color: 'var(--text-2)', 
                  lineHeight: 1.75 
                }}>
                  <span style={{ 
                    color: 'var(--accent-2)', 
                    fontWeight: 700, 
                    fontSize: 14, 
                    minWidth: 20, 
                    textAlign: 'right',
                    marginTop: 2
                  }}>
                    {idx + 10}.
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  )
}
