import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadCurrentGenshin} from './helpers/current_accounts.mjs';
import {validateAccount,validateEvidence,panelStates} from '../lib/account.mjs';
import {artifactEffectiveKeys,effectiveLoadoutCount,maximumArtifactLoadout} from '../lib/artifact_rolls.mjs';

const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const {raw,account,metadata,manifests}=loadCurrentGenshin();
const equipped=id=>Object.values(account.equipment[id].artifacts).map(aid=>account.artifacts.find(a=>a.id===aid));

test('formal Genshin corrections retain validated provenance and exact fixture content identity',()=>{
 assert.deepEqual(validateAccount(account),[]);
 assert.deepEqual(validateEvidence(account,manifests),[]);
 assert.equal(metadata.accountSha256,createHash('sha256').update(raw).digest('hex'));
 assert.equal(metadata.sourceReviewIds.length,3);
 assert.ok(metadata.sourceReviewIds.every(id=>account.source_ids.includes(id)));
});
test('Arosha original goblet keeps its identity and zero upgrades while correcting the effective marker',()=>{
 const goblet=account.artifacts.find(a=>a.id==='artifact_video_5684_20261111_arosha_goblet');
 assert.deepEqual(goblet.substat_rolls.values.find(r=>r.key==='crit_dmg'),{key:'crit_dmg',enhancements:0,effective:true});
 assert.equal(goblet.main_stat.value,46.6);
 const artifacts=equipped('arosha');
 assert.equal(effectiveLoadoutCount(artifacts,'arosha'),22);
 assert.equal(maximumArtifactLoadout(artifacts,artifactEffectiveKeys(artifacts,'arosha')),42);
});
test('Mavuika same plume is directly confirmed and does not become another inventory object',()=>{
 const plume=account.artifacts.find(a=>a.id==='artifact_image_mavuika_plume_20261111');
 assert.equal(account.equipment.mavuika.artifacts.plume,plume.id);
 assert.equal(account.artifacts.length,236);
 assert.equal(plume.rarity,5);assert.equal(plume.level,20);
 assert.deepEqual(plume.substats.map(s=>s.value),[16.3,3.1,9.9,22.5]);
 assert.deepEqual(plume.substat_rolls.values.map(r=>r.enhancements),[2,0,1,2]);
 assert.deepEqual(plume.substat_rolls.values.map(r=>r.effective),[true,true,false,true]);
 const artifacts=equipped('mavuika');
 assert.equal(effectiveLoadoutCount(artifacts,'mavuika'),30);
 assert.equal(maximumArtifactLoadout(artifacts,artifactEffectiveKeys(artifacts,'mavuika')),43);
 assert.equal(panelStates(account).mavuika,'stale');
});
test('corrections remain behind the authenticated API and do not add review presentation',()=>{
 const route=file('../app/api/account/route.ts');
 assert.match(route,/run\(request,false/);
 assert.match(route,/publicAccount\(await client\.read\(\)\)/);
 assert.doesNotMatch(route,/withGenshinReview|fixtures|review\//);
 assert.doesNotMatch(file('../app/dashboard.tsx'),/genshin_review|review-badge/);
 assert.doesNotMatch(file('../app/zzz_dashboard.tsx'),/review-badge/);
});
