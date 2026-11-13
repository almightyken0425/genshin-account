/** Reveal a saved control before focusing it after a page remount. */
export function revealAndFocus(element:HTMLElement|null|undefined):boolean{
 if(!element)return false;
 let ancestor=element.parentElement;
 while(ancestor){
  if(ancestor.tagName==='DETAILS')(ancestor as HTMLDetailsElement).open=true;
  ancestor=ancestor.parentElement;
 }
 element.focus({preventScroll:true});
 return true;
}
