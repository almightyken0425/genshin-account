import MediaImage from '@/components/media/media_image';

export default function RotationAction({name,src,moves}:{name:string,src?:string,moves:readonly string[]}){
 return <div className={'minimal-flow-card'+(moves.some(move=>move.length>36)?' minimal-flow-card--prose':'')}><MediaImage src={src} alt={name}/><div className="minimal-flow-moves"><strong>{moves[0]}</strong>{moves.length>1&&<div className="minimal-flow-combos">{moves.slice(1).map((move,index)=><span key={index}>{move}</span>)}</div>}</div></div>;
}
