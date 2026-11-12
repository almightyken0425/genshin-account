import catalog from './zzz_assets.json';
type CharacterArt={icon:string,splash:string};
export function zzzCharacterImage(id:string,kind:'icon'|'splash'){return (catalog.characters as Record<string,CharacterArt>)[id]?.[kind]}
export function zzzEngineImage(name:string|null|undefined){return name?(catalog.engines as Record<string,string>)[name]:undefined}
export function zzzDiscImage(name:string|null|undefined){return name?(catalog.discs as Record<string,string>)[name]:undefined}
