import {characterImage,characterName as lookupCharacterName} from '@/lib/game_assets';
import GameImage from './game_image';
export default function RotationCard({characterId,characterName='',moves}:{characterId:string,characterName?:string,moves:readonly string[]}){
 return <div className="minimal-flow-card"><GameImage src={characterImage(characterId,'icon')} alt={characterName||lookupCharacterName(characterId)}/><div className="minimal-flow-moves"><strong>{moves[0]}</strong>{moves.length>1&&<div className="minimal-flow-combos">{moves.slice(1).map((move,i)=><span key={i}>{move}</span>)}</div>}</div></div>
}
