import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Find Things to Do in Chennai | Outsyd',
  description: 'Discover the best things to do in Chennai for every mood - date ideas, nightlife, gaming, sports, adventures, beaches, clubs, and calming escapes. Pick a plan, Go Outsyd & have fun',
  keywords: 'things to do in Chennai, Chennai activities, Chennai guide, places to visit Chennai',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "w8lagy6y0v");
          `}
        </Script>
      </head>
      <body>
        <Navbar />
        {children}
      </body>
      <GoogleAnalytics gaId="G-5KSY3BRLQH" />
    </html>
  )
}
