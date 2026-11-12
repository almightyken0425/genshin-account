import drafts from './artwork_edits.json';

type SavedArtwork={renderedPath:string};
export function editedArtwork(game:'genshin'|'zzz',role:'roster'|'portrait',id:string){
 const entry=(drafts.entries as Record<string,SavedArtwork>)[`${game}/${role}/${id}`];
 const path=entry?.renderedPath;
 return typeof path==='string'&&path.startsWith('/assets/artwork_edits/')?path:undefined;
}
