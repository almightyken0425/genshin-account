'use client';
import CenteredHeader from '@/components/navigation/centered_header';
import {CloudDownload,ExternalLink} from 'lucide-react';
import './sync.css';
export default function SyncPage(){return <main className="sync-shell">
 <CenteredHeader title="資料同步" backLabel="返回角色列表" onBack={()=>{window.location.href='/'}}/>
 <section className="sync-intro"><CloudDownload size={32} aria-hidden="true"/><h1>從 HoYoLAB 更新紀錄</h1><p>原神與絕區零共用同一個同步工具。先讀取角色與裝備、確認差異，再更新網站，不需要錄影。</p></section>
 <section className="sync-panel"><h2>在電腦開啟同步工具</h2><ol><li>在專案的 <code>tools/hoyolab_sync</code> 資料夾，開啟 Mac 的啟動同步.command，或 Windows 的啟動同步.cmd。</li><li>第一次使用時，依本機頁面說明完成 HoYoLAB 登入。可以使用 Apple，並選擇將登入保存在這台電腦的系統安全儲存區。</li><li>確認差異後按更新網站資料。正式紀錄會保存到 GitHub，網站重新整理後即可看到。</li></ol><a className="sync-open" href="http://127.0.0.1:59672" target="_blank" rel="noreferrer">開啟本機同步頁 <ExternalLink size={16} aria-hidden="true"/></a><p className="sync-small">這個連結會連到目前這台電腦。請先啟動工具，並保留啟動視窗。</p></section>
 <section className="sync-panel"><h2>數值怎麼處理</h2><p>技能保留 HoYoLAB 戰績頁的顯示等級，另列依已核對加成推導的基礎等級。詞條區分遊戲觀測與目前配裝用途的規則判定，推導的強化次數會有標示。無法確認的項目保留未知。</p><p>舊影片、截圖與面板觀測會保留。登入憑證只在本機使用，不會送到網站或 GitHub。</p></section>
 </main>}
