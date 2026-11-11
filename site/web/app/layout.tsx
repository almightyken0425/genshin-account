import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'原神手帳',description:'記錄角色、配裝與成長。你的私人原神手帳。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
