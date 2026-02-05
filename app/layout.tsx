import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepSeek Chat App",
  description: "A simple chat application powered by DeepSeek AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(doc) {
                function setRem() {
                  var docEl = doc.documentElement;
                  var width = docEl.clientWidth;
                  if (width > 750) width = 750;
                  if (width < 320) width = 320;
                  docEl.style.fontSize = (width / 10) + 'px';
                }
                setRem();
              })(document);
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script id="rem-resize" strategy="afterInteractive">
          {`
            (function(win, doc) {
              function setRem() {
                var docEl = doc.documentElement;
                var width = docEl.clientWidth;
                if (width > 750) width = 750;
                if (width < 320) width = 320;
                docEl.style.fontSize = (width / 10) + 'px';
              }
              win.addEventListener('resize', setRem);
              win.addEventListener('pageshow', function(e) {
                if (e.persisted) setRem();
              });
            })(window, document);
          `}
        </Script>
      </body>
    </html>
  );
}
