import type {DriveDisc} from './zzz_types';
export function discSlots(discs:DriveDisc[]|null|undefined):{slot:number,disc:DriveDisc|null}[];
export function effectiveDiscCount(disc:DriveDisc|null|undefined):number|null;
export function effectiveDiscLoadout(discs:DriveDisc[]|null|undefined):number|null;
