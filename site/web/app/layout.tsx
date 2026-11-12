import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'HOYO',description:'原神與絕區零的私人角色、配裝與成長紀錄。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
