import type {DriveDisc} from './zzz_types';
export function discSlots(discs:DriveDisc[]|null|undefined):{slot:number,disc:DriveDisc|null}[];
export function effectiveDiscCount(disc:DriveDisc|null|undefined):number|null;
export function effectiveDiscLoadout(discs:DriveDisc[]|null|undefined):number|null;
/** Observed positive union, not a complete character-guide profile. null means unknown or contradictory. */
export function discEffectiveKeys(discs:readonly (DriveDisc|null|undefined)[]|null|undefined):string[]|null;
export function maximumDiscCount(disc:DriveDisc|null|undefined,effectiveKeys?:readonly string[]|null):number|null;
export function maximumDiscLoadout(discs:(DriveDisc|null|undefined)[]|null|undefined,effectiveKeys?:readonly string[]|null):number|null;
