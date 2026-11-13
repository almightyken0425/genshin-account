import {characterImage,characterName as lookupCharacterName} from '@/lib/game_assets';
import RotationAction from '@/components/teams/rotation_action';
export default function RotationCard({characterId,characterName='',moves}:{characterId:string,characterName?:string,moves:readonly string[]}){
 return <RotationAction name={characterName||lookupCharacterName(characterId)} src={characterImage(characterId,'icon')} moves={moves}/>;
}
