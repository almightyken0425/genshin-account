import type {CSSProperties} from 'react';

export type CharacterMetric={label:string,value:number|string|null,description?:string};
export type CharacterMetrics2=readonly [CharacterMetric,CharacterMetric];
export type CharacterMetrics3=readonly [CharacterMetric,CharacterMetric,CharacterMetric];
export type CharacterImage={
 src?:string;
 alt:string;
 eager?:boolean;
 fit?:'cover'|'contain';
 style?:CSSProperties;
};
