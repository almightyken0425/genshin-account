import catalog from './game_assets.json';
type CharacterArt={name:string,gameId:number,rarity:number,icon:string,splash:string};
type ItemArt={gameId:number,icon:string};
type ArtifactArt={gameId:number,slots:Record<string,string>};
export function characterImage(id:string,kind:'icon'|'splash'){
 return (catalog.characters as Record<string,CharacterArt>)[id]?.[kind];
}
export function characterRarity(id:string){
 return (catalog.characters as Record<string,CharacterArt>)[id]?.rarity??null;
}
export function weaponImage(name:string){
 return (catalog.weapons as Record<string,ItemArt>)[name]?.icon;
}
export function artifactImage(setName:string,slot:string){
 return (catalog.artifacts as Record<string,ArtifactArt>)[setName]?.slots[slot];
}
