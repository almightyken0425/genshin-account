'use client';
import type {ReactNode,RefObject} from 'react';
import {Download,Save,LoaderCircle,X,ChevronUp} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetClose,SheetTrigger} from '@/components/ui/sheet';

type Props={
 preview:boolean;diff:string[];busy:boolean;pending:boolean;blocked:boolean;
 open:boolean;onOpenChange:(open:boolean)=>void;note:string;onNote:(note:string)=>void;
 noteRef:RefObject<HTMLTextAreaElement|null>;feedback:ReactNode;
 onDiscard:()=>void;onDownload:()=>void;onSave:()=>void;onCheck:()=>void;
};

export default function SaveControls({preview,diff,busy,pending,blocked,open,onOpenChange,note,onNote,noteRef,feedback,onDiscard,onDownload,onSave,onCheck}:Props){
 const dirty=diff.length>0;
 return <Sheet open={open} onOpenChange={next=>{if(!busy)onOpenChange(next)}}>
  <div className="edit-dock" role="region" aria-label="保存編輯">
   <div className="edit-dock-status"><span>{preview?'本機預覽 · 僅下載草稿':'編輯現況'}</span><SheetTrigger asChild><button className="edit-dock-review">{dirty?diff.length+' 項未保存修改':'尚未修改'}<ChevronUp size={14}/></button></SheetTrigger></div>
   <div className="edit-dock-actions"><button className="text-button" disabled={busy||pending} onClick={onDiscard}>取消編輯</button>
    {pending?<button className="primary" disabled={busy} onClick={onCheck}>{busy?<LoaderCircle className="spin" size={17}/>:<Save size={17}/>}確認保存結果</button>
    :preview?<button className="primary" disabled={!dirty||busy} onClick={onDownload}><Download size={17}/>下載草稿</button>
    :<button className="primary" disabled={!dirty||busy} onClick={()=>onOpenChange(true)}>{busy?<LoaderCircle className="spin" size={17}/>:<Save size={17}/>}保存修改</button>}
   </div>
  </div>
  <SheetContent side="bottom" className="roster-sheet save-sheet" showCloseButton={false}>
   <div className="roster-sheet-header"><SheetTitle>{preview?'下載編輯草稿':'保存修改'}</SheetTitle><SheetClose asChild><button className="icon-button" disabled={busy} aria-label="關閉保存面板"><X size={20}/></button></SheetClose></div>
   <SheetDescription className="roster-sheet-description">{preview?'下載 JSON 檔保留這次修改。本機預覽不會寫回角色資料或 GitHub，重新整理後也不會自動載入草稿。':'核對修改並填寫備註，再保存到 GitHub。'}</SheetDescription>
   <div className="roster-sheet-body save-sheet-body">
    {feedback}
    {dirty?<ul className="save-changes" aria-label="尚未保存的修改">{diff.map((item,index)=><li key={index}>{item}</li>)}</ul>:<p className="footnote">修改欄位後，變更會列在這裡。</p>}
    {!preview&&<label className="field"><span>修改備註 <small>必填</small></span><textarea ref={noteRef} maxLength={500} value={note} disabled={busy||pending} placeholder="例如：依遊戲畫面修正聖遺物副詞條" onChange={event=>onNote(event.target.value)}/></label>}
   </div>
   <div className="roster-sheet-footer save-sheet-footer"><SheetClose asChild><button className="text-button" disabled={busy}>繼續編輯</button></SheetClose>
    {!preview&&dirty&&<button className="text-button" onClick={onDownload}><Download size={16}/>下載草稿</button>}
    {pending?<button className="primary" disabled={busy} onClick={onCheck}>確認保存結果</button>
    :<button className="primary" disabled={!dirty||busy||(!preview&&(blocked||!note.trim()))} onClick={preview?onDownload:onSave}>{busy?<LoaderCircle className="spin" size={17}/>:preview?<Download size={17}/>:<Save size={17}/>} {preview?'下載草稿':'保存到 GitHub'}</button>}
   </div>
  </SheetContent>
 </Sheet>;
}
