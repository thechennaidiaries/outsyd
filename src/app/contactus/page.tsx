import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Building, ShieldAlert, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Outsyd',
  description: 'Get in touch with Outsyd. Find our registered business address, operational address, phone number, and email details.',
}

export default function ContactUsPage() {
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
        background: 'rgba(255, 107, 0, 0.04)', 
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
        background: 'rgba(99, 102, 241, 0.05)', 
        filter: 'blur(100px)', 
        borderRadius: '50%', 
        pointerEvents: 'none' 
      }} className="orb-2" />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }} className="animate-fade-up">
          <h1 className="section-gradient-text" style={{ 
            fontSize: 'calc(2rem + 1.5vw)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            marginBottom: 12 
          }}>
            Contact Us
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
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: 20
          }}>
            <Calendar size={13} color="var(--accent)" />
            <span>Last Updated: 2 June 2026</span>
          </div>
          <p style={{ 
            fontSize: 16, 
            color: 'var(--text-2)', 
            lineHeight: 1.6, 
            maxWidth: 600, 
            margin: '0 auto' 
          }}>
            If you have any questions, concerns, or require assistance regarding bookings, payments, refunds, or any of our services, please feel free to get in touch with us.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Contact Details & Info Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 24 
          }}>
            {/* Direct Contact Card */}
            <div className="glass-panel animate-fade-up" style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: 32, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 24 
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--accent)' }}>📞</span> Direct Contact
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <a 
                  href="tel:+918096813884" 
                  id="contact-phone-link"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16, 
                    textDecoration: 'none', 
                    color: 'var(--text-2)',
                    transition: 'all 0.2s ease',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 107, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ 
                    background: 'rgba(255, 107, 0, 0.1)', 
                    padding: 10, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Phone size={20} color="var(--accent)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Call Us</p>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>+91 80968 13884</p>
                  </div>
                </a>

                <a 
                  href="mailto:thechennaidiaries@gmail.com" 
                  id="contact-email-link"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16, 
                    textDecoration: 'none', 
                    color: 'var(--text-2)',
                    transition: 'all 0.2s ease',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 107, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ 
                    background: 'rgba(255, 107, 0, 0.1)', 
                    padding: 10, 
                    borderRadius: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Mail size={20} color="var(--accent)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Email Us</p>
                    <p style={{ fontSize: 15, fontWeight: 600, wordBreak: 'break-all' }}>thechennaidiaries@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Corporate Info Card */}
            <div className="glass-panel animate-fade-up" style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: 32, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 24 
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--accent)' }}>🏢</span> Business Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Building size={18} color="var(--accent-2)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Brand Name</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Outsyd</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <ShieldAlert size={18} color="var(--accent-2)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Legal Entity Name</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>JAWAHAR RAVINDRAN NITHIN</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Columns */}
          <div className="glass-panel animate-fade-up" style={{ 
            borderRadius: 'var(--radius-lg)', 
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 28
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--accent)' }}>📍</span> Office Addresses
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 32 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: 'var(--accent-2)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <MapPin size={15} /> Registered Address
                </h3>
                <p style={{ 
                  fontSize: 15, 
                  color: 'var(--text-2)', 
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line' 
                }}>
                  4/139A, Lake Area 2nd Street,{"\n"}
                  Uthangudi, Near Mattuthavani Bus Stand,{"\n"}
                  Madurai, Tamil Nadu – 625107, India
                </p>
              </div>

              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 12 }}>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: 'var(--accent-2)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <MapPin size={15} /> Operational Address
                </h3>
                <p style={{ 
                  fontSize: 15, 
                  color: 'var(--text-2)', 
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line' 
                }}>
                  4/139A, Lake Area 2nd Street,{"\n"}
                  Uthangudi, Near Mattuthavani Bus Stand,{"\n"}
                  Madurai, Tamil Nadu – 625107, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
