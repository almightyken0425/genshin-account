import type {CSSProperties} from 'react';

export type CharacterMetric={label:string,value:number|null};
export type CharacterMetrics3=readonly [CharacterMetric,CharacterMetric,CharacterMetric];
export type CharacterImage={
 src?:string;
 alt:string;
 eager?:boolean;
 fit?:'cover'|'contain';
 style?:CSSProperties;
};
