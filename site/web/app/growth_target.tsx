'use client';

import {useState} from 'react';
import {characterImage,artifactImage} from '@/lib/game_assets';
import {selectedTeams} from '@/lib/selected_teams';
import GrowthPage from '@/components/pages/growth_page';
import type {GrowthTargetViewModel} from '@/components/growth/growth_target_card';

export default function GrowthTarget({teamId,onSelectTeam,onOpenCharacter}:{teamId?:string,onSelectTeam?:(id:string)=>void,onOpenCharacter?:(id:string)=>void}={}){
 const [localTeam,setLocalTeam]=useState('');
 const activeId=teamId??localTeam,team=selectedTeams.find(team=>team.id===activeId);
 const targets:GrowthTargetViewModel[]=team&&!team.members.some(id=>id==='escoffier')?[]:[{id:'escoffier-golden-troupe-sands',kind:'upgrade',character:{id:'escoffier',name:'愛可菲',src:characterImage('escoffier','icon')},title:'黃金劇團 · 時之沙',main:'攻擊力 %',tags:['暴擊率','暴擊傷害','元素充能效率'],artifact:{src:artifactImage('黃金劇團','sands'),name:'黃金劇團時之沙'},location:'楓丹 · 罪禍的終末',context:'替換生命沙，保留劇團四件套'}];
 return <GrowthPage teams={selectedTeams} teamId={team?.id||''} onSelectTeam={id=>{setLocalTeam(id);onSelectTeam?.(id)}} targets={targets} onOpenCharacter={onOpenCharacter}/>;
}
