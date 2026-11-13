import type {Artifact,SubstatRoll} from './types';
export function substatRoll(artifact:Artifact|null|undefined,key:string,characterId:string):SubstatRoll;
export function effectiveSubstatCount(artifact:Artifact|null|undefined,characterId:string):number|null;
export function effectiveLoadoutCount(artifacts:readonly (Artifact|null|undefined)[]|null|undefined,characterId:string):number|null;
/** Positive observed union for the matching character, not a complete character-guide profile. */
export function artifactEffectiveKeys(artifacts:readonly (Artifact|null|undefined)[]|null|undefined,characterId:string|null|undefined):string[]|null;
export function maximumArtifactCount(artifact:Artifact|null|undefined,effectiveKeys?:readonly string[]|null):number|null;
export function maximumArtifactLoadout(artifacts:readonly (Artifact|null|undefined)[]|null|undefined,effectiveKeys?:readonly string[]|null):number|null;
export function editSubstatRoll(artifact:Artifact,characterId:string,key:string,patch:Partial<SubstatRoll>):void;
