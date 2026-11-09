/* Generated shared browser preview. WeChat loads the same source with require(). */
(function(){const modules={"engine/engine.js":function(require,module,exports){
// Generated from artifacts/commander-pve/engine.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
const { createSoldierAI }=require('./soldier-ai.js');
const { applyHeroes, castHero, DEFAULT_COMMANDER_STATS }=require('./heroes.js');
const WORLD = { width: 30, height: 18 };
const UNIT_TYPES = {
  // Campaign-facing merged infantry: one readable frontline role combining
  // the historical blade and shield jobs. The legacy shield/sword entries
  // remain for older isolated experiments and regression fixtures.
  bladeShield: { label: '刀盾兵', count: 6, hp: 120, damage: 16, interval: 1.2, speed: .85, range: .85, description: '正面近战，承受箭伤减少 30%；受到骑兵 1.5 倍伤害' },
  sword: { label: '刀兵', count: 6, hp: 120, damage: 18, interval: 1.1, speed: .85, range: .85, description: '近身伤害高，移动较慢，缺少远程与反骑能力' },
  shield: { label: '盾兵', count: 6, hp: 160, damage: 14, interval: 1.2, speed: .8, range: .8, description: '承受箭伤减少 35%，稳住正面' },
  spear: { label: '枪兵', count: 6, hp: 110, damage: 16, interval: 1.25, speed: 1, range: 1.3, description: '对骑兵造成 1.75 倍伤害' },
  archer: { label: '弓兵', count: 6, hp: 70, damage: 14, interval: 1.5, speed: .8, range: 5.5, description: '远程支援，优先攻击近敌' },
  cavalry: { label: '骑兵', count: 4, hp: 120, damage: 18, interval: 1.1, speed: 1.8, range: .9, description: '沿所在侧翼绕行；对刀盾兵造成 1.5 倍伤害，被枪兵克制' },
  commander: { label: '主将', count: 1, hp: 520, damage: 18, interval: 1.3, speed: 0, range: 1.2, description: '阵亡即败；蓝满自动为附近最多 8 名士兵加盾' }
};
// Fixed catalog for this experiment: deployment accepts coordinates only.
Object.values(UNIT_TYPES).forEach(Object.freeze);
Object.freeze(UNIT_TYPES);
// Older isolated experiments keep their calibrated rules. The campaign opts
// into this version explicitly; both teams always use the same combat rules.
const CAMPAIGN_COMBAT_VERSION = 'campaign-1.4';
const CAMPAIGN_UNIT_TYPES = Object.freeze({...UNIT_TYPES,
 bladeShield: Object.freeze({...UNIT_TYPES.bladeShield, arrowMultiplier:.10, description:'正面近战，盾面承受弓箭仅 10% 伤害；受到骑兵 1.5 倍伤害'}),
 shield: Object.freeze({...UNIT_TYPES.shield, arrowMultiplier:.10, description:'盾面承受弓箭仅 10% 伤害，稳住正面'}),
 commander: Object.freeze({...UNIT_TYPES.commander,...DEFAULT_COMMANDER_STATS})
});
const CAMPAIGN_IMPACT = Object.freeze({arrowTrace:.2,blockStop:.1,blockRecovery:.6});
const SCENARIOS = [
 {id:'flank',name:'一 · 正面协同',subtitle:'28 对 28 · 正面可胜',description:'敌军留枪兵守将，正面只有盾弓。用完整的盾、枪、弓战线争取正面优势。默认阵型可以通关。',hint:'不要只顾上路骑袭：敌骑走下路，主将需要正面部队的回援。'},
 {id:'guard',name:'二 · 拦截骑袭',subtitle:'28 对 28 · 一队枪兵的作用',description:'敌骑从上路绕后。沿用中路阵会先丢主将，试着把枪兵撤回主将上侧拦截。',hint:'主将位于（3,9）；枪兵队中心放在主将 2.5 格内，会整队留守。'},
 {id:'raid',name:'三 · 集中突破',subtitle:'28 对 30 · 小幅兵力压力',description:'敌军第一队盾兵多 2 人，主将有枪兵留守。需要兼顾上侧推进与自己的主将安全。',hint:'把盾兵与弓兵向上侧靠拢，骑兵走上路；也可尝试仅将骑兵改走上路，比较主将受伤与正面交换。'}
];
const PRESETS = [
 {id:'balanced',name:'中路阵',description:'完整正面战线'},
 {id:'north',name:'上路协同',description:'盾弓上侧集中，骑兵走上路'},
 {id:'south',name:'枪兵护主',description:'仅把中路阵的枪兵撤回主将上侧'}
];
function getFormation(id='balanced') {
 const points=id==='north'?[[10,5],[10,8],[8,10],[7,6.5],[10,2.5],[3,8]]
  :id==='south'?[[9.5,6.5],[9.5,11.5],[4.5,8],[6,9],[8,14.5],[3,9]]
  :[[9.5,6.5],[9.5,11.5],[8,9],[6,9],[8,14.5],[3,9]];
 const types=['shield','shield','spear','archer','cavalry','commander'];
 const ids=['b-shield-1','b-shield-2','b-spear','b-archer','b-cavalry','b-commander'];
 return points.map(([x,y],i)=>({id:ids[i],type:types[i],x,y}));
}
const PVE_SOLUTIONS=Object.freeze({flank:'balanced',guard:'south',raid:'north'});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const delta=(a,b)=>Math.round((a-b)*1e9)/1e9;
const dist=(a,b)=>Math.hypot(delta(a.x,b.x),delta(a.y,b.y));
function damageFor(s,u,target,spec){
 return spec.damage*(u.damageMultiplier??1)
  *(u.type==='spear'&&target.type==='cavalry'?1.75:1)
  *(u.type==='cavalry'&&target.type==='sword'?1.5:u.type==='cavalry'&&target.type==='bladeShield'?1.5:1)
  *(u.type==='archer'&&(target.type==='shield'||target.type==='bladeShield')?(spec.targetArrowMultiplier??s.unitTypes[target.type].arrowMultiplier??(target.type==='shield'?.65:.70)):1);
}
function enemyFormation(id) {
 // These exact rosters are covered by the reproducible balance suite.
 const points=id==='guard'?[[10,5],[10,8],[8,10],[7,6.5],[10,2.5],[3,8]]
  :id==='raid'?[[8,6.5],[8,11.5],[4.5,8],[6,9.5],[8,2.5],[3,10]]
  :[[10,11],[10,8],[4.5,8],[7,9.5],[10,15.5],[3,10]];
 const red=mirrorFormation(getFormation().map((s,i)=>({...s,x:points[i][0],y:points[i][1]})));
 if(id==='raid')red[0].count=8;
 return red;
}
function spawn(squad,side) {
 const spec=UNIT_TYPES[squad.type],sign=side==='blue'?1:-1;
 return Array.from({length:squad.count??spec.count},(_,i)=>{
   const commander=squad.type==='commander';
   const count=squad.count??spec.count,cols=2,rows=Math.ceil(count/cols);
   const ox=commander?0:(Math.floor(i/rows)-.5)*.62;
   const oy=commander?0:(i%rows-(rows-1)/2)*.65;
   return {id:`${squad.id}-${i}`,squadId:squad.id,side,type:squad.type,x:squad.x+ox*sign,y:squad.y+oy,
     hp:spec.hp,maxHp:spec.hp,shield:0,shieldUntil:0,hitStopUntil:0,nextBlockStopAt:0,mana:0,alive:true,facing:sign>0?0:Math.PI,
     radius:commander?.4:squad.type==='cavalry'?.3:.24,attackFlash:0,cooldown:.15+(i%3)*.08,
     targetId:null,flank:squad.y<9?1.15:16.85,stage:0,damageDone:0,commanderDamage:0,tieIndex:i,spawnY:squad.y+oy};
 });
}
function createBattle({scenarioId='flank',formation=getFormation(),commanderHpMultiplier=1,aiMode='legacy'}={}) {
 const expected=getFormation(), input=Array.isArray(formation)?formation:expected;
 const clean=expected.map(base=>{const f=input.find(x=>x.id===base.id)||base;return {...base,x:clamp(Number.isFinite(f.x)?f.x:base.x,1.5,11.5),y:clamp(Number.isFinite(f.y)?f.y:base.y,1.8,16.2)};});
 return createLabBattle({blue:clean,red:enemyFormation(scenarioId),scenarioId,commanderHpMultiplier,aiMode});
}
// Same simulation as the game; explicit rosters are only for reproducible balance experiments.
function createLabBattle({blue,red,scenarioId='lab',movement=null,commanderHpMultiplier=1,aiMode='legacy',heroes=null,combatVersion='classic'}) {
 const hpMultiplier=Number.isFinite(commanderHpMultiplier)&&commanderHpMultiplier>0?commanderHpMultiplier:1;
 const state={time:0,status:'ready',scenarioId,commanderHpMultiplier:hpMultiplier,formation:blue.map(s=>({...s})),units:[...blue.flatMap(s=>spawn(s,'blue')),...red.flatMap(s=>spawn(s,'red'))],events:[],effects:[],result:null,stats:{blue:{damage:0,casts:0},red:{damage:0,casts:0}},_accum:0,_eventId:0,_danger:{blue:false,red:false},_deadSquads:new Set(),_enemySoldierEverAlive:{blue:false,red:false},_enemySoldierCleared:{blue:false,red:false}};
 state.combatVersion=combatVersion===CAMPAIGN_COMBAT_VERSION?combatVersion:'classic';
 state.unitTypes=state.combatVersion===CAMPAIGN_COMBAT_VERSION?CAMPAIGN_UNIT_TYPES:UNIT_TYPES;
 state.impact=state.combatVersion===CAMPAIGN_COMBAT_VERSION?CAMPAIGN_IMPACT:null;
  for(const u of state.units) if(u.type==='commander'){u.hp*=hpMultiplier;u.maxHp*=hpMultiplier;}
 const personalStats=state.combatVersion===CAMPAIGN_COMBAT_VERSION;
 if(heroes||personalStats)applyHeroes(state,heroes||{},state.unitTypes,{personalStats});
 for(const u of state.units){
  const c=state.units.find(c=>c.side===u.side&&c.type==='commander');
  const roster=u.side==='blue'?blue:red,squad=roster.find(s=>s.id===u.squadId);
  u.tieIndex=roster.indexOf(squad)*32+u.tieIndex;
  u.guard=u.type!=='cavalry'&&u.type!=='commander'&&dist(squad,c)<=2.5;
  u.homeX=u.x;u.homeY=u.y;
 }
 state.aiMode=aiMode==='roles'?'roles':'legacy';
 if(movement)state.movement=movement;
 else if(state.aiMode==='roles'){state.units.forEach(u=>u.guard=false);state.movement=createSoldierAI(state,state.unitTypes);}
 updateAura(state); return state;
}
function mirrorFormation(formation,prefix='r') { return formation.map((s,i)=>({...s,id:`${prefix}-${i}`,x:WORLD.width-s.x})); }
function rosterSize(formation) {return formation.filter(s=>s.type!=='commander').reduce((n,s)=>n+(s.count??UNIT_TYPES[s.type].count),0);}

function event(s,type,text,side,u={}) {s.events.push({id:++s._eventId,time:s.time,type,text,side,x:u.x??15,y:u.y??9});if(s.events.length>120)s.events.shift();}
function updateAura(s){
 for(const u of s.units){if(!u.alive||u.type==='commander')continue;
  const cmd=s.units.find(c=>c.side===u.side&&c.type==='commander'&&c.alive);
  const baseHp=u.baseHp??(u.type==='commander'?UNIT_TYPES.commander.hp*(s.commanderHpMultiplier||1):UNIT_TYPES[u.type].hp);
  const max=baseHp*(cmd&&u.type!=='archer'&&dist(cmd,u)<=2.5?1.1:1);
  if(max!==u.maxHp){u.hp=u.hp/u.maxHp*max;u.maxHp=max;}
 }
}
function segmentDistance(p,a,b) {
 const dx=delta(b.x,a.x),dy=delta(b.y,a.y),l=dx*dx+dy*dy;
 const t=l?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l,0,1):0;
 return {d:Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy)),t};
}
function lineBlocked(u,target,alive) {
 return alive.some(e=>e.side!==u.side&&e.id!==target.id&&(()=>{const p=segmentDistance(e,u,target);return p.t>.05&&p.t<.96&&p.d<e.radius+.08;})());
}
function desiredTarget(s,u,alive) {
 const foes=alive.filter(e=>e.side!==u.side), general=foes.find(e=>e.type==='commander');
 const own=alive.find(e=>e.side===u.side&&e.type==='commander');
 const ranked=foes.map(e=>({e,d:dist(u,e)})).sort((a,b)=>Math.abs(a.d-b.d)>1e-7?a.d-b.d:a.e.tieIndex-b.e.tieIndex);
 if(!ranked.length)return null;
 if(u.guard&&own){
  // Guard is a stance, not a permanent leash: intercept a nearby threat first,
  // then fall through to the normal offensive target when the commander is safe.
  // This lets a surviving guard squad rejoin the attack after the raid is stopped.
  if(u.type==='archer'){const shot=ranked.find(({e,d})=>d<=UNIT_TYPES.archer.range&&!lineBlocked(u,e,alive));if(shot)return shot.e;}
  const intruder=ranked.find(({e})=>dist(e,own)<4.2);
  if(intruder)return intruder.e;
  // Once the enemy's soldiers are gone, a guard must rejoin the objective
  // and attack the opposing commander. Until then it remains on station.
  const enemySoldiers=ranked.filter(({e})=>e.type!=='commander');
  if(enemySoldiers.length===0&&s._enemySoldierCleared?.[own.side==='blue'?'red':'blue'])return ranked.find(({e})=>e.type==='commander')?.e||null;
  return null;
 }
 // Nearby units react to a threatened commander on either side.
 if(own&&dist(u,own)<4.1) {const intruder=ranked.find(({e,d})=>e.type!=='commander'&&dist(e,own)<3.2&&d<4.6);if(intruder)return intruder.e;}
 if(u.type==='commander')return ranked[0].e;
 if(u.type==='archer')return ranked.find(({e,d})=>d<=5.5&&!lineBlocked(u,e,alive))?.e||ranked[0].e;
 if(u.type==='cavalry') {
  const nearby=ranked.find(({d})=>d<1.65);
  if(nearby)return nearby.e;
  return general||ranked[0].e;
 }
 // Foot soldiers retain their advance lane until an enemy enters contact distance.
 return ranked[0].e;
}
function move(u,g,dt,alive,speedOverride) {
 let dx=delta(g.x,u.x),dy=delta(g.y,u.y),l=Math.hypot(dx,dy);if(l<.02)return;
 dx/=l;dy/=l;
 // Local separation keeps the two ranks visible and prevents walking through units.
 for(const o of alive){if(o.id===u.id)continue;const d=dist(u,o),r=u.radius+o.radius+.16;if(d<r&&d>.001){const force=(r-d)/r*(o.side===u.side?1.3:.7);dx+=delta(u.x,o.x)/d*force;dy+=delta(u.y,o.y)/d*force;}}
 l=Math.hypot(dx,dy);if(l<.001)return;dx/=l;dy/=l;
 const speed=(speedOverride??UNIT_TYPES[u.type].speed)*(u.speedMultiplier??1)*(u.chargeActive?1.2:1)*dt;
 let nx=clamp(u.x+dx*speed,.5,29.5),ny=clamp(u.y+dy*speed,.55,17.45);

 u.x=clamp(nx,.5,29.5);u.y=clamp(ny,.55,17.45);u.facing=Math.atan2(dy,dx);
}
function attack(s,hits,u,target,amount){
 const actualTarget=s.units.find(v=>v.id===target.id);
 const duration=u.type==='archer'?(s.impact?.arrowTrace??.23):u.type==='commander'?.26:.20;
 const effect={type:u.type==='archer'?'arrow':'hit',attackerType:u.type,targetType:target.type,sourceId:u.id,targetId:target.id,side:u.side,x:u.x,y:u.y,tx:target.x,ty:target.y,ttl:duration,duration};
 s.effects.push(effect);
 // The projectile is presentation only; resolve the hit now so adding a
 // longer visible flight cannot silently change a calibrated encounter.
 hits.push({u,target:actualTarget,amount});
}
function tick(s,dt) {
 s.time+=dt;
 s.movement?.beforeTick?.(s,dt);
 s.effects=s.effects.filter(e=>(e.ttl-=dt)>0);
 const alive=s.units.filter(u=>u.alive);
 for(const side of ['blue','red']) {
  const hasSoldiers=alive.some(u=>u.side===side&&u.type!=='commander');
  if(hasSoldiers) s._enemySoldierEverAlive[side]=true;
  else if(s._enemySoldierEverAlive[side]) s._enemySoldierCleared[side]=true;
 }
 updateAura(s);
 for(const u of alive){
  // Only this unit pauses; the battle clock and other soldiers keep moving.
  if(!(u.hitStopUntil>s.time))u.cooldown-=dt;
  u.attackFlash=Math.max(0,u.attackFlash-dt);u.chargeActive=u.chargeUntil>s.time;
  if(s.time>=u.shieldUntil)u.shield=0;
 }
 for(const c of alive.filter(u=>u.type==='commander')){
  const manaMax=c.manaMax??100;
  c.mana=Math.min(manaMax,c.mana+(c.manaRegen??6)*dt);
  if(c.mana+(s.combatVersion===CAMPAIGN_COMBAT_VERSION?1e-8:0)>=manaMax){c.mana=0;
   const heroSkill=castHero(s,c,alive);
   if(heroSkill){s.stats[c.side].casts++;s.effects.push({type:'shield',side:c.side,x:c.x,y:c.y,ttl:1.2,radius:heroSkill.radius});event(s,'skill',`${c.side==='blue'?'我方':'敌方'}主将释放${heroSkill.name} · ${heroSkill.count} 人受益`,c.side,c);continue;}
   const allies=alive.filter(u=>u.side===c.side&&u.type!=='commander'&&dist(u,c)<=2.4).sort((a,b)=>dist(a,c)-dist(b,c)).slice(0,8);
   for(const u of allies){u.shield=40;u.shieldUntil=s.time+4;}
   s.stats[c.side].casts++;s.effects.push({type:'shield',side:c.side,x:c.x,y:c.y,ttl:1.2,radius:2.4});
   event(s,'skill',`${c.side==='blue'?'我方':'敌方'}主将释放护阵 · ${allies.length} 人获得护盾`,c.side,c);
  }
 }
 const hits=[];
  // All target selection and movement read the same start-of-tick positions.
 const positions=alive.map(u=>({...u}));
 const destinations=[];
 for(const u of alive){
  if(u.hitStopUntil>s.time)continue;
  if(s.movement){
   const intent=s.movement.intent(s,u,positions),target=intent.target;
   u.targetId=target?.id??null;
   const spec=u.combatStats||s.unitTypes[u.type];
   const canHit=target&&!intent.movingOnly&&dist(u,target)<=spec.range+(target.type==='commander'?.15:0)&&(u.type!=='archer'||!lineBlocked(u,target,positions));
   if(canHit){
    u.facing=Math.atan2(target.y-u.y,target.x-u.x);
    if(u.cooldown<=0){u.cooldown=spec.interval/(u.hasteUntil>s.time?1.3:1);u.attackFlash=.22;
     const amount=damageFor(s,u,target,spec);
     attack(s,hits,u,target,amount);
    }
   }else if(intent.goal){const next={...u};move(next,intent.goal,dt,positions,intent.speed);destinations.push([u,next]);}
   continue;
  }
  const target=desiredTarget(s,u,positions);if(!target){if(u.guard){const next={...u};move(next,{x:u.homeX,y:u.homeY},dt,positions);destinations.push([u,next]);}continue;}u.targetId=target.id;
  const spec=u.combatStats||s.unitTypes[u.type],d=dist(u,target);
  const canHit=d<=spec.range+(target.type==='commander'?.15:0)&&(u.type!=='archer'||!lineBlocked(u,target,alive));
  if(canHit){u.facing=Math.atan2(target.y-u.y,target.x-u.x);if(u.cooldown<=0){u.cooldown=spec.interval;u.attackFlash=.22;
   const amount=damageFor(s,u,target,spec);
   attack(s,hits,u,target,amount);
  }} else if(spec.speed>0){
   let goal=target;
   if(u.type==='cavalry'&&target.type==='commander'){
    const sign=u.side==='blue'?1:-1, rear=target.x-sign*1.3;
    if(d<3.8)u.stage=2;
    if(u.stage===0&&Math.abs(u.y-u.flank)<.5)u.stage=1;
    if(u.stage===1&&(u.x-rear)*sign>=-.1)u.stage=2;
    if(u.stage===0)goal={x:u.x+sign*.5,y:u.flank};
    else if(u.stage===1)goal={x:rear,y:u.flank};
   } else if(u.type!=='cavalry'&&d>5.8){goal={x:target.x,y:u.spawnY};}
   const next={...u};move(next,goal,dt,positions);destinations.push([u,next]);
  }
 }
 for(const [u,next] of destinations){u.x=next.x;u.y=next.y;u.facing=next.facing;}
 // Accumulate simultaneous contact corrections so the array order gives neither side priority.
 for(let pass=0;pass<3;pass++){
  const shifts=alive.map(()=>({x:0,y:0}));
  for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){
   const a=alive[i],b=alive[j],dx=delta(b.x,a.x),dy=delta(b.y,a.y),d=Math.hypot(dx,dy),min=a.radius+b.radius;
   if(d<min&&d>1e-8){const nx=dx/d,ny=dy/d,over=min-d+.001;
    const aw=a.type==='commander'?0:b.type==='commander'?1:.5,bw=1-aw;
    shifts[i].x-=nx*over*aw;shifts[i].y-=ny*over*aw;
    if(b.type!=='commander'){shifts[j].x+=nx*over*bw;shifts[j].y+=ny*over*bw;}
   }
  }
  alive.forEach((u,i)=>{if(u.type!=='commander'){u.x=clamp(u.x+shifts[i].x,.5,29.5);u.y=clamp(u.y+shifts[i].y,.55,17.45);}});
 }

 const appliedHits=[];
 for(const {u,target,amount} of hits){
  const absorbed=Math.min(target.shield,amount);target.shield-=absorbed;
  const harm=Math.min(target.hp,amount-absorbed);target.hp=Math.max(0,target.hp-harm);
  u.damageDone+=harm;if(target.type==='commander')u.commanderDamage+=harm;s.stats[u.side].damage+=harm;
  const intrinsicArrowBlock=u.type==='archer'&&(target.type==='bladeShield'||target.type==='shield');
  const blocked=s.impact&&u.type==='archer'&&(absorbed>0||intrinsicArrowBlock);
  if(blocked){
   // Individual arrows show a block. Only the first may interrupt: no refresh
   // or stacking during the .6s recovery, so a volley cannot stun-lock a tank.
   if(target.type!=='commander'&&target.hp>0&&s.time+1e-8>=target.nextBlockStopAt){
    target.hitStopUntil=s.time+s.impact.blockStop;
    target.nextBlockStopAt=s.time+s.impact.blockRecovery;
    target.blockFacing=Math.atan2(u.y-target.y,u.x-target.x);
   }
   s.effects.push({type:'block',side:target.side,x:target.x,y:target.y,angle:Math.atan2(u.y-target.y,u.x-target.x),ttl:.2,duration:.2,absorbed,attackerType:u.type});
  }else if(s.impact){
   s.effects.push({type:'impact',attackerType:u.type,side:u.side,x:target.x,y:target.y,ttl:.18,duration:.18});
  }
  appliedHits.push({u,target,amount,absorbed,harm});
 }
 s.movement?.afterHits?.(s,appliedHits);
 for(const u of alive){if(u.hp<=1e-6){u.alive=false;u.hp=0;u.diedAt=s.time;s.effects.push({type:'death',side:u.side,x:u.x,y:u.y,ttl:.8});}}
 for(const u of s.units){u.x=15+Math.sign(u.x-15)*Math.round(Math.round(Math.abs(u.x-15)*1e9)/1e3)/1e6;u.y=Math.round(Math.round(u.y*1e9)/1e3)/1e6;if(u.type!=='commander')u.hp=Math.round(u.hp*1e6)/1e6;}
 for(const side of ['blue','red']){
  const c=s.units.find(u=>u.side===side&&u.type==='commander');
  const threatened=c.alive&&s.units.some(u=>u.alive&&u.side!==side&&dist(u,c)<3.3);
  if(threatened&&!s._danger[side]){event(s,'danger',`${side==='blue'?'我方':'敌方'}主将遭到突袭！`,side,c);}
  s._danger[side]=threatened;
 }
 const blue=s.units.find(u=>u.side==='blue'&&u.type==='commander'),red=s.units.find(u=>u.side==='red'&&u.type==='commander');
 if(!blue.alive||!red.alive){s.status=!blue.alive&&!red.alive?'draw':red.alive?'lost':'won';s.result={winner:s.status==='won'?'blue':s.status==='lost'?'red':null,reason:s.status==='draw'?'双方主将同时阵亡':'主将阵亡'};event(s,'finish',s.status==='won'?'斩将成功 · 敌军溃散':s.status==='lost'?'我方主将阵亡 · 战斗结束':'双方主将同时阵亡',s.result.winner||'blue');}
 else if(s.time>=90){s.status='draw';s.result={winner:null,reason:'90 秒内未能斩将'};event(s,'finish','战斗超时 · 调整阵型再试','blue');}
}
function stepBattle(s,dt) {
 if(s.status!=='running'||!Number.isFinite(dt)||dt<=0)return s;
 s._accum+=Math.min(dt,.5);
 while(s._accum>=1/30&&s.status==='running'){tick(s,1/30);s._accum-=1/30;s.observeTick?.();}
 return s;
}
function getSnapshot(s) {
 const team=side=>{const c=s.units.find(u=>u.side===side&&u.type==='commander');return {soldiers:s.units.filter(u=>u.side===side&&u.type!=='commander'&&u.alive).length,commanderHp:c.hp,commanderMaxHp:c.maxHp,mana:c.mana,manaMax:c.manaMax??100,shield:c.shield,danger:s._danger[side]};};
 return {blue:team('blue'),red:team('red'),time:s.time,status:s.status,result:s.result};
}

module.exports={WORLD,UNIT_TYPES,CAMPAIGN_COMBAT_VERSION,CAMPAIGN_UNIT_TYPES,CAMPAIGN_IMPACT,SCENARIOS,PRESETS,getFormation,PVE_SOLUTIONS,enemyFormation,createBattle,createLabBattle,mirrorFormation,rosterSize,stepBattle,getSnapshot};

},
"engine/soldier-ai.js":function(require,module,exports){
// Generated from artifacts/commander-pve/soldier-ai.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
// Opt-in, deterministic combat behaviour. Ordinary combat decisions use local
// contacts; strategic approach uses the fully revealed battlefield in this lab.
const delta = (a,b) => Math.round((a-b)*1e9)/1e9;
const distance = (a,b) => Math.hypot(delta(a.x,b.x),delta(a.y,b.y));
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const TYPES = ['bladeShield','shield','spear','archer','cavalry','commander','sword'];
const freshTeam = () => ({
  firstTargets:{}, targetSwitches:0, retargetAfterDeath:0,
  interceptions:0, spearVsCavalryDamage:0, shieldArrowDamage:0,
  shieldArrowMitigated:0, archerRetreats:0, cavalryRearDamage:0,
  rearDamage:0, firstCommanderDamageAt:null,
  damageByType:Object.fromEntries(TYPES.map(t=>[t,0])), idleSoldierSeconds:0,
});

function segment(p,a,b) {
 const dx=delta(b.x,a.x),dy=delta(b.y,a.y),l=dx*dx+dy*dy;
 const t=l?clamp((delta(p.x,a.x)*dx+delta(p.y,a.y)*dy)/l,0,1):0;
 return {t,d:Math.hypot(delta(p.x,a.x)-t*dx,delta(p.y,a.y)-t*dy)};
}
function clearShot(u,target,alive) {
 return !alive.some(e=>e.side!==u.side&&e.id!==target.id&&(()=>{const p=segment(e,u,target);return p.t>.05&&p.t<.96&&p.d<e.radius+.08;})());
}
function stableRank(entries) {
 return entries.sort((a,b)=>Math.abs(a.score-b.score)>1e-7?b.score-a.score:a.unit.tieIndex-b.unit.tieIndex);
}

/**
 * Public evidence on state.aiMetrics:
 * { blue, red, events }, with identical team fields from freshTeam().
 * firstTargets[type] is {unitId,targetId,targetType,time,reason}; events records
 * actual damage/interception/retarget/retreat observations, never predicted wins.
 */
function createSoldierAI(state,specs) {
 const metrics = state.aiMetrics = {blue:freshTeam(),red:freshTeam(),events:[]};
 const memory = new Map();
 const emit = (type,u,extra={}) => {
  metrics.events.push({type,time:state.time,side:u.side,unitId:u.id,unitType:u.type,...extra});
  if(metrics.events.length>400)metrics.events.shift();
 };
 function getMemory(u) {
  if(!memory.has(u.id))memory.set(u.id,{targetId:null,targetType:null,lockUntil:0,retreating:false,retreatUntil:0,retreatGoal:null,retreatSupportId:null,retreatUsed:false,safeSince:null,intercepted:new Set(),route:null,routeTargetId:null,routeDeadline:null,bypassed:new Set()});
  return memory.get(u.id);
 }
 function setTarget(u,target,reason,alive) {
  const m=getMemory(u),team=metrics[u.side];
  if(target?.id!==m.targetId) {
   if(target&&!team.firstTargets[u.type])team.firstTargets[u.type]={unitId:u.id,targetId:target.id,targetType:target.type,time:state.time,reason};
   if(m.targetId&&target){
    team.targetSwitches++;
    const previous=alive.find(e=>e.id===m.targetId);
    if(!previous){team.retargetAfterDeath++;emit('retarget',u,{targetId:target.id,targetType:target.type});}
   }
   if(target)m.lockUntil=state.time+.85;
   m.targetId=target?.id??null;m.targetType=target?.type??null;
  }
  u.aiRole=reason;
  return target;
 }
 function intent(s,u,alive) {
  const m=getMemory(u),team=metrics[u.side],sign=u.side==='blue'?1:-1;
  const own=alive.find(e=>e.side===u.side&&e.type==='commander');
  const allFoes=alive.filter(e=>e.side!==u.side);
  const local=allFoes.filter(e=>distance(u,e)<=8);
  const allies=alive.filter(e=>e.side===u.side&&e.id!==u.id&&distance(u,e)<=6);
  const vulnerable=allies.filter(e=>e.type==='archer'||e.type==='commander');
  const spec=specs[u.type];
  if(u.type==='commander')return commanderIntent(u,alive,allFoes,u.combatStats||spec,sign,m);
  if(u.type==='cavalry')return cavalryIntent(u,alive,allFoes,local,m,sign);
  // A guard can answer a threat near its commander even when its own nearest
  // enemy is elsewhere. Without a threat it participates in the normal advance.
  const closeThreat = local.filter(e=>e.type!=='commander'&&vulnerable.some(a=>distance(a,e)<4.8));
  const contact = local.filter(e=>distance(u,e)<1.55);
  const scored=local.map(e=>{
   const d=distance(u,e),fightsBack=contact.some(x=>x.id===e.id);
   let score=12-d*1.65,reason='接敌推进';
   if(e.type==='commander'&&local.some(x=>x.type!=='commander'&&distance(u,x)<4))score-=5;
   if(fightsBack){score+=8;reason='近身反击';}
   if(closeThreat.some(x=>x.id===e.id)){score+=5;reason='保护后排';}
   if(u.type==='spear'&&e.type==='cavalry'){
    score+=7+(closeThreat.some(x=>x.id===e.id)?7:0);reason='拦截骑兵';
   }
   if((u.type==='shield'||u.type==='bladeShield')&&e.type==='archer'){
    score+=5;
    if(vulnerable.some(a=>distance(a,e)<=specs.archer.range+1))score+=4;
    reason='压制弓兵';
   }
   if(u.type==='archer'){
    if(clearShot(u,e,alive))score+=6;else score-=12;
    if(d<=spec.range)score+=4;
    if(e.type==='cavalry'&&closeThreat.some(x=>x.id===e.id))score+=3;
    reason='远程支援';
   }
   if(u.type==='cavalry'){
    if(e.type==='archer'){score+=7;reason='侧翼切弓';}
    if(e.type==='spear'&&!fightsBack)score-=6;
    if(e.type==='commander'&&!local.some(x=>x.type==='archer')){score+=3;reason='侧翼夺帅';}
   }
   return {unit:e,score,reason};
  });
  stableRank(scored);
  let selected=scored[0];
  const current=scored.find(e=>e.unit.id===m.targetId);
  // Hysteresis prevents tiny distance changes from making a whole line switch.
  // A much more urgent local threat can still interrupt the lock.
  if(current&&selected&&current.unit.id!==selected.unit.id&&
    (state.time<m.lockUntil?selected.score<current.score+9:selected.score<current.score+3))selected=current;
  const target=setTarget(u,selected?.unit??null,selected?.reason??'接敌推进',alive);
  if(u.type==='archer'){
   // One short reposition per continuous threat, toward real infantry cover.
   // The destination is captured once; it cannot drift with a moving escort.
   const threats=stableRank(local.filter(e=>e.type!=='archer').map(unit=>({unit,score:-distance(u,unit)})));
   const threat=threats[0]?.unit, threatened=threat&&distance(u,threat)<3.2;
   if(threatened)m.safeSince=null;
   else {m.safeSince??=state.time;if(state.time-m.safeSince>=2)m.retreatUsed=false;}
   const inContact=threat&&distance(u,threat)<=specs[threat.type].range+.15;
   if(m.retreating&&(!threatened||inContact||state.time>=m.retreatUntil||distance(u,m.retreatGoal)<=.25||!alive.some(a=>a.id===m.retreatSupportId))){
    m.retreating=false;m.retreatGoal=null;
   }
   if(!m.retreating&&!m.retreatUsed&&threat&&distance(u,threat)<2&&!inContact){
    const covers=stableRank(allies.filter(a=>(a.type==='shield'||a.type==='bladeShield'||a.type==='spear')&&distance(u,a)<4).map(unit=>({unit,score:-distance(u,unit)})));
    for(const {unit:support} of covers){
     const dx=support.x-sign*1.15-u.x,dy=support.y-u.y,length=Math.hypot(dx,dy);
     if(length<.25)continue;
     const travel=Math.min(1.2,length);
     const goal={x:clamp(u.x+dx/length*travel,.6,29.4),y:clamp(u.y+dy/length*travel,.6,17.4)};
     // A nominal rear slot on the threat's side is not shelter.
     if(distance(goal,threat)<=distance(u,threat)+.15||distance(goal,support)>=distance(goal,threat))continue;
     m.retreatGoal=goal;m.retreatSupportId=support.id;m.retreatUntil=state.time+1.8;
     m.retreating=true;m.retreatUsed=true;team.archerRetreats++;
     emit('retreat',u,{targetId:threat.id,goal:{...goal}});break;
    }
   }
   if(m.retreating){u.aiRole='短移寻掩护';return {target,goal:m.retreatGoal,movingOnly:true};}
  }
  if(!target){
   // This slice has a fully revealed battlefield. With no local engagement,
   // rally toward the nearest visible enemy; never park at a map edge. A future
   // fog slice must supply known contacts here, not invisible enemy positions.
   const next=stableRank(allFoes.map(unit=>({unit,score:-distance(u,unit)})))[0]?.unit;
   if(!next)return {target:null,goal:null};
   u.aiRole='重新接敌';
   return {target:null,goal:{x:next.x,y:next.y}};
  }
  let goal={x:target.x,y:target.y};
  if((u.type==='shield'||u.type==='bladeShield')&&target.type==='archer'){
   // Direct pressure puts the shield between the firing archer and our rear.
   // Existing projectile occlusion makes the blocker the legal shot target.
   u.aiRole='挡箭推进';
  }
  return {target,goal};
 }
 function commanderIntent(u,alive,foes,spec,sign,m) {
  const ranked=stableRank(foes.map(unit=>({unit,score:-distance(u,unit)})));
  const nearest=ranked[0]?.unit;
  if(!nearest){setTarget(u,null,'战斗结束',alive);return {target:null,goal:null};}
  const reach=e=>spec.range+(e.type==='commander'?.15:0);
  const current=foes.find(e=>e.id===m.targetId);
  // Stay with an engaged opponent instead of following the nearest-enemy
  // Voronoi boundary every frame. Contact can interrupt a distant pursuit;
  // a target already within weapon reach is never abandoned for another one.
  const contact=ranked.find(({unit})=>distance(u,unit)<=reach(unit))?.unit;
  const locked=current&&m.commanderEngaged&&distance(u,current)<=4.8;
  let engaged=locked?current:null;
  if(contact&&(!engaged||distance(u,engaged)>reach(engaged)+.35))engaged=contact;
  if(!engaged&&distance(u,nearest)<=3.2)engaged=nearest;
  if(engaged){
   m.commanderEngaged=true;
   const target=setTarget(u,engaged,distance(u,engaged)<=reach(engaged)?'主将交战':'主将追击',alive);
   return {target,goal:{x:target.x,y:target.y},speed:spec.speed||.9};
  }
  m.commanderEngaged=false;
  const objective=foes.find(e=>e.type==='commander')||nearest;
  // Start by charging down the deployment lane, independent of allied
  // casualties or drifting infantry centroids. Near the opposing line, close
  // on the real objective so off-axis endgames cannot stall indefinitely.
  const aligned=(objective.x-u.x)*sign>3.2;
  const target=setTarget(u,objective,'主将推进',alive);
  return {target,goal:{x:objective.x,y:aligned?u.homeY:objective.y},speed:spec.speed||.9};
 }
  function cavalryIntent(u,alive,foes,local,m,sign) {
  // Rear targets remain known beyond local combat range. Losing the commander
  // just outside that radius used to send cavalry toward a spear at the edge.
  const contact=stableRank(local.filter(e=>distance(u,e)<=1.65).map(unit=>({unit,score:-distance(u,unit)})))[0]?.unit;
  const rear=foes.filter(e=>e.type==='archer'||e.type==='commander');
  let ranked=stableRank((rear.length?rear:foes).map(unit=>({unit,score:(unit.type==='archer'?2:0)-distance(u,unit)})));
  const current=ranked.find(e=>e.unit.id===m.targetId);
  if(current&&ranked[0]&&ranked[0].score<current.score+2)ranked=[current];
  const objective=ranked[0]?.unit;
  if(objective?.id!==m.routeTargetId){m.routeTargetId=objective?.id;m.route=null;m.routeDeadline=null;m.bypassed.clear();}
  const target=setTarget(u,contact||objective||null,contact?'骑兵迎击拦截':objective?.type==='archer'?'侧翼切弓':'侧翼夺帅',alive);
  if(!target)return {target:null,goal:null};
  if(contact){m.route=null;return {target,goal:{x:target.x,y:target.y}};}
  if(m.route&&(state.time>=m.route.until||distance(u,m.route.goal)<.5||distance(u,target)<2.4))m.route=null;
  if(!m.route&&distance(u,target)>2.4&&(m.routeDeadline===null||state.time<m.routeDeadline)){
    const blockers=stableRank(foes.filter(e=>(e.type==='spear'||e.type==='shield'||e.type==='bladeShield'||e.type==='sword')&&!m.bypassed.has(e.id)).filter(e=>{
    const p=segment(e,u,target);return p.t>.05&&p.t<.95&&p.d<1.2;
   }).map(unit=>({unit,score:-distance(u,unit)})));
   const blocker=blockers[0]?.unit;
   if(blocker){
    const flank=u.spawnY<9?-1:1;
    // Fixed waypoint beside the blocker, never a point that drifts ahead of
    // the rider forever. One bounded attempt per blocker, then commit to the
    // target or fight the actual intercepting soldier.
    m.routeDeadline??=state.time+6;
    m.route={goal:{x:clamp(blocker.x+sign*1.6,.6,29.4),y:clamp(blocker.y+flank*2.2,.6,17.4)},until:Math.min(state.time+4,m.routeDeadline)};
    m.bypassed.add(blocker.id);
   }
  }
  if(m.route){u.aiRole='绕开正面';return {target,goal:m.route.goal};}
  return {target,goal:{x:target.x,y:target.y}};
 }
 return {
  intent,
  afterHits(s,hits){
   for(const {u,target,harm,absorbed,amount} of hits){
    const team=metrics[u.side],victim=metrics[target.side];
    team.damageByType[u.type]+=harm;
    if(target.type==='commander'&&harm>0&&victim.firstCommanderDamageAt===null)victim.firstCommanderDamageAt=s.time;
    if(target.type==='archer'||target.type==='commander')victim.rearDamage+=harm;
    if(u.type==='spear'&&target.type==='cavalry'&&harm>0){
     team.spearVsCavalryDamage+=harm;
     const m=getMemory(u);
     if(!m.intercepted.has(target.id)){
      m.intercepted.add(target.id);team.interceptions++;emit('intercept',u,{targetId:target.id,damage:harm});
     }
    }
    if(u.type==='archer'&&(target.type==='shield'||target.type==='bladeShield')){
     victim.shieldArrowDamage+=harm;
     const multiplier=specs.archer.targetArrowMultiplier??specs[target.type].arrowMultiplier??(target.type==='bladeShield'?.70:.65);
     victim.shieldArrowMitigated+=amount/multiplier-amount;
    }
    if(u.type==='cavalry'&&(target.type==='archer'||target.type==='commander'))team.cavalryRearDamage+=harm;
   }
  }
 };
}

module.exports={createSoldierAI};

},
"engine/heroes.js":function(require,module,exports){
// Generated from artifacts/commander-pve/heroes.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
const DEFAULT_COMMANDER_STATS=Object.freeze({hp:2600,damage:72,interval:1,manaMax:100,manaRegen:6,speed:1.35});
const personal={
 // Support trades some personal DPS for an earlier, stronger skill cycle.
 liubei:{hp:2000,damage:64,interval:1,manaMax:75,manaRegen:6},
 // Archer support retains a martial personal attack; this is still a melee hit.
 huangzhong:{hp:2100,damage:80,interval:1,manaMax:100,manaRegen:6},
 // Martial commander is the best duelist and has the largest health pool.
 zhaoyun:{hp:2200,damage:96,interval:1,manaMax:100,manaRegen:6}
};
const HEROES=Object.freeze([
 {id:'liubei',name:'刘备',role:'步阵支援',description:'刀盾、枪兵生命 +15%。满蓝为 3.5 格内最多 10 名士兵恢复 30 生命，加 40 护盾，持续 4 秒。',skill:'仁德护阵',color:'#9dc89b'},
 {id:'huangzhong',name:'黄忠',role:'弓阵压制',description:'弓兵伤害 +20%。满蓝为 5 格内最多 12 名弓兵提升 30% 攻速，持续 5 秒。',skill:'齐射',color:'#e5c687'},
 {id:'zhaoyun',name:'赵云',role:'骑兵突击',description:'骑兵移速 +25%、伤害 +15%。满蓝为 6 格内最多 12 名骑兵加 35 护盾，提升 20% 移速，持续 4 秒。',skill:'龙胆突阵',color:'#9fbfe5'},
].map(hero=>Object.freeze({...hero,stats:Object.freeze({...personal[hero.id],speed:DEFAULT_COMMANDER_STATS.speed})})));
const heroFor=id=>HEROES.find(h=>h.id===id)||null;
function applyHeroes(state,choices,specs,{personalStats=false}={}){
 state.heroes={blue:heroFor(choices.blue)?.id||null,red:heroFor(choices.red)?.id||null};
 state.heroMetrics={blue:{casts:0,healing:0,shieldGranted:0,buffed:0},red:{casts:0,healing:0,shieldGranted:0,buffed:0}};
 for(const u of state.units){
  const id=state.heroes[u.side];
  if(personalStats&&u.type==='commander'){
   const stats=heroFor(id)?.stats||DEFAULT_COMMANDER_STATS;
   u.combatStats=Object.freeze({...specs.commander,...stats});
   u.hp=u.maxHp=stats.hp*state.commanderHpMultiplier;
   u.manaMax=stats.manaMax;u.manaRegen=stats.manaRegen;
  }
  if(!id)continue;
  u.heroId=id;u.damageMultiplier=1;u.speedMultiplier=1;
  if(id==='liubei'&&['bladeShield','shield','spear','sword'].includes(u.type)){u.baseHp=specs[u.type].hp*1.15;u.hp=u.maxHp=u.baseHp;}
  if(id==='huangzhong'&&u.type==='archer')u.damageMultiplier=1.2;
  if(id==='zhaoyun'&&u.type==='cavalry'){u.damageMultiplier=1.15;u.speedMultiplier=1.25;}
 }
}
function castHero(state,c,alive){
 const id=state.heroes?.[c.side],hero=heroFor(id);if(!hero)return null;
 const radius=id==='huangzhong'?5:id==='zhaoyun'?6:3.5;
 const allies=alive.filter(u=>u.side===c.side&&u.type!=='commander'&&Math.hypot(u.x-c.x,u.y-c.y)<=radius&&(id==='huangzhong'?u.type==='archer':id==='zhaoyun'?u.type==='cavalry':true)).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y)||a.tieIndex-b.tieIndex).slice(0,id==='liubei'?10:12);
 const metrics=state.heroMetrics[c.side];metrics.casts++;
 for(const u of allies){
  if(id==='liubei'){const heal=Math.min(30,u.maxHp-u.hp);u.hp+=heal;metrics.healing+=heal;}
  if(id==='huangzhong'){u.hasteUntil=state.time+5;metrics.buffed++;}
  else{const shield=id==='liubei'?40:35;metrics.shieldGranted+=Math.max(0,shield-u.shield);u.shield=Math.max(u.shield,shield);u.shieldUntil=state.time+4;if(id==='zhaoyun'){u.chargeUntil=state.time+4;metrics.buffed++;}}
 }
 return {name:hero.skill,count:allies.length,radius};
}

module.exports={DEFAULT_COMMANDER_STATS,HEROES,heroFor,applyHeroes,castHero};

},
"engine/campaign.js":function(require,module,exports){
// Generated from artifacts/commander-pve/campaign.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
const {createLabBattle,stepBattle,CAMPAIGN_COMBAT_VERSION}=require('./engine.js');
const {heroFor}=require('./heroes.js');

const CAMPAIGN_VERSION='1.9.2';
const CAMPAIGN_PROGRESS_VERSIONS=Object.freeze(['1.9',CAMPAIGN_VERSION]);
const TROOP_TYPES=Object.freeze(['bladeShield','spear','archer','cavalry']);
const PLAYER_SLOTS=Object.freeze(Array.from({length:5},(_,i)=>({id:`c-slot-${i+1}`,count:6,label:`第${i+1}队`})));
const DEFAULT_CONFIG=Object.freeze({heroId:'liubei',troops:Object.freeze(['bladeShield','spear','bladeShield','archer','cavalry']),preset:'balanced'});
// Presets are strategic opening plans. Their coordinates are generated from the
// selected troop roles when explicitly selected; replacing a troop keeps its slot.
const FORMATION_PRESETS=Object.freeze([
 {id:'balanced',name:'均衡阵',tag:'展开',description:'近战铺开正面，弓兵置后，兼顾上下接敌。',weakness:'兵力分散，单路不容易形成优势。'},
 {id:'shieldWall',name:'盾墙阵',tag:'护弓',description:'刀盾、长枪收紧中路，弓兵集中在前排身后。',weakness:'两侧空旷，缺少近战时无法保护弓兵。'},
 {id:'spearhead',name:'锋矢阵',tag:'突破',description:'骑兵居尖端，枪兵与刀盾梯次跟进，集中中路。',weakness:'两翼薄，尖端容易被集火。'},
 {id:'wings',name:'鹤翼阵',tag:'两翼',description:'骑兵优先分赴上下翼，弓兵靠后居中。',weakness:'中路薄，敌军直冲会威胁主将。'}
]);
const normalizeTroop=(type,i)=>['sword','shield'].includes(type)?'bladeShield':TROOP_TYPES.includes(type)?type:DEFAULT_CONFIG.troops[i];
const enemy=(types,counts,points=null,chief=[25,9])=>[...types.map((type,i)=>({id:`e-slot-${i+1}`,type,count:counts[i],x:points?.[i]?.[0]??(type==='archer'?23:20),y:points?.[i]?.[1]??[3,6,9,12,15][i]})),{id:'e-commander',type:'commander',count:1,x:chief[0],y:chief[1]}];
const CAMPAIGN_LEVELS=[
 {id:'first',heroId:'liubei',enemyFormationName:'步阵中军',enemyPlan:'刘备随中路步兵推进，刀盾枪承担正面，弓骑分守侧翼。',weakness:'各路兵力有限，可以用克制或局部集中突破。',number:1,name:'初阵交锋',theme:'混编练兵',description:'敌军 24 人，刀盾枪正面、弓骑侧翼。先用熟悉的阵容找回接敌节奏。',hint:'保持前排连贯，别让弓兵和主将单独面对骑兵。本关给多种组合留下试阵空间。',enemy:enemy(['bladeShield','spear','bladeShield','archer','cavalry'],[5,4,5,6,4],null,[24,9])},
 {id:'charge',heroId:'liubei',enemyFormationName:'枪阵双骑',enemyPlan:'刘备随上路枪阵推进，骑兵独立袭扰中下路。',weakness:'长枪挡不住箭雨，分出的骑兵缺少持续支援。',number:2,name:'枪阵双骑',theme:'保护输出',description:'敌军 30 人：上半场长枪密集，两队骑兵从中路与下翼出击，弓兵留在下半场。',hint:'长枪防骑却挡不住箭雨；但只顾射击，骑兵就会碰到你的后排。近战续战也是一条路。',enemy:enemy(['spear','spear','cavalry','cavalry','archer'],[8,8,4,4,6],[[20,3],[20,6],[20,9],[20,15],[23,12]],[24,5.5])},
 {id:'arrows',heroId:'huangzhong',enemyFormationName:'双翼护弓阵',enemyPlan:'黄忠随上翼弓兵推进，中央长枪与下翼刀盾分别掩护。',weakness:'黄忠无法同时覆盖两翼，可以集中攻击另一侧。',number:3,name:'双翼箭雨',theme:'选择突破口',description:'敌军 34 人：16 名弓兵分居上下两翼，中路枪兵、上路骑兵、下路刀盾各自掩护。',hint:'两翼弓阵相距很远，护卫无法同时支援。试着集中攻破一侧，同时用另一队承受箭雨。',enemy:enemy(['archer','archer','spear','cavalry','bladeShield'],[8,8,6,4,8],[[23,3],[23,15],[20,9],[20,6],[20,12]],[25,6])},
 {id:'wall',heroId:'liubei',enemyFormationName:'上翼重兵阵',enemyPlan:'刘备沿上路随刀盾枪主力进攻，下翼骑兵牵制。',weakness:'中下路兵力薄，主力集中也会放大绕开的空间。',number:4,name:'偏锋夹击',theme:'集中破阵',description:'敌军 36 人：刀盾与枪兵集中上翼，下翼骑兵独立突进，中路连接较薄。',hint:'展开的前排会分别遭遇上翼重兵与下翼骑兵。尝试集中兵力打穿连接处；弓阵仍会被厚盾拖住。',enemy:enemy(['bladeShield','bladeShield','cavalry','spear','spear'],[10,10,6,5,5],[[20,3],[20,6],[20,15],[22,4.5],[22,7.5]],[25,5.5])},
 {id:'encircle',heroId:'liubei',enemyFormationName:'刀盾护将阵',enemyPlan:'刘备随中央刀盾推进，上翼少量长枪防骑。',weakness:'缺少远程火力，长枪无法覆盖整条战线。',number:5,name:'藏枪刀盾阵',theme:'避实击虚',description:'敌军 38 人：32 名刀盾层层护将，上翼两队各 3 名枪兵掩护。中下路没有长枪，仍有突击空间。',hint:'骑兵依然能克制刀盾，但一股脑集中或分翼可能撞上枪阵。观察反骑部队的覆盖，比较展开与集中的接敌顺序。',enemy:[{"id":"e-slot-1","type":"spear","count":3,"x":21,"y":3},{"id":"e-slot-2","type":"spear","count":3,"x":21,"y":6},{"id":"e-slot-3","type":"bladeShield","count":4,"x":21,"y":9},{"id":"e-slot-4","type":"bladeShield","count":4,"x":21,"y":12},{"id":"e-slot-5","type":"bladeShield","count":4,"x":21,"y":15},{"id":"e-slot-6","type":"bladeShield","count":4,"x":24,"y":3},{"id":"e-slot-7","type":"bladeShield","count":4,"x":24,"y":6},{"id":"e-slot-8","type":"bladeShield","count":4,"x":24,"y":12},{"id":"e-slot-9","type":"bladeShield","count":4,"x":24,"y":15},{"id":"e-slot-10","type":"bladeShield","count":4,"x":27,"y":16},{"id":"e-commander","type":"commander","count":1,"x":25,"y":9}]}
];
function formationFor(preset='line',troops=DEFAULT_CONFIG.troops){
 if(['balanced','shieldWall','spearhead','wings'].includes(preset)){
  const slots=PLAYER_SLOTS.map((slot,i)=>({...slot,type:TROOP_TYPES.includes(troops[i])?troops[i]:DEFAULT_CONFIG.troops[i]}));
  const priority=preset==='spearhead'||preset==='wings'?['cavalry','spear','bladeShield']:['bladeShield','spear','cavalry'];
  const archers=slots.filter(s=>s.type==='archer'),front=slots.filter(s=>s.type!=='archer').sort((a,b)=>priority.indexOf(a.type)-priority.indexOf(b.type));
  const centered=(n,spacing)=>Array.from({length:n},(_,i)=>9+(i-(n-1)/2)*spacing);
  const put=(s,x,y)=>({...s,x,y});
  let placed;
  if(preset==='balanced'){
   const lanes=n=>centered(n,n>1?12/(n-1):0);
   placed=[...front.map((s,i)=>put(s,9.5,lanes(front.length)[i])),...archers.map((s,i)=>put(s,6.5,lanes(archers.length)[i]))];
  }else if(preset==='shieldWall'){
   placed=[...front.map((s,i)=>put(s,10.4,centered(front.length,2.6)[i])),...archers.map((s,i)=>put(s,6.2,centered(archers.length,2.4)[i]))];
  }else if(preset==='spearhead'){
   const tip=[[11.2,9],[9.6,6.7],[9.6,11.3],[8,4.4],[8,13.6]];
   placed=[...front.map((s,i)=>put(s,...tip[i])),...archers.map((s,i)=>put(s,5.8,centered(archers.length,2.6)[i]))];
  }else{
   const wings=[[10.8,3],[10.8,15],[8.7,5.4],[8.7,12.6],[7,9]];
   placed=[...front.map((s,i)=>put(s,...wings[i])),...archers.map((s,i)=>put(s,5.5,centered(archers.length,2.6)[i]))];

  }
  return [...PLAYER_SLOTS.map(s=>placed.find(p=>p.id===s.id)),{id:'c-commander',type:'commander',count:1,x:3,y:9}];
 }
 const ys=preset==='north'?[2,4,6,8,10]:preset==='south'?[8,10,12,14,16]:[3,6,9,12,15];
 return [...PLAYER_SLOTS.map((slot,i)=>({...slot,type:TROOP_TYPES.includes(troops[i])?troops[i]:DEFAULT_CONFIG.troops[i],x:troops[i]==='archer'?(preset==='line'?6.5:7):(preset==='line'?9.5:10),y:ys[i]})),{id:'c-commander',type:'commander',count:1,x:3,y:preset==='north'?5:preset==='south'?13:9}];
}
function sanitizeCampaignConfig(input={}){
 input=input&&typeof input==='object'?input:{};
 const heroId=heroFor(input.heroId)?.id||DEFAULT_CONFIG.heroId;
 const troops=PLAYER_SLOTS.map((_,i)=>normalizeTroop(input.troops?.[i],i));
 const preset=['line','north','south',...FORMATION_PRESETS.map(p=>p.id)].includes(input.preset)?input.preset:'line';
 const base=formationFor(preset,troops),given=Array.isArray(input.formation)?input.formation:[];
 const formation=base.map(b=>{const p=given.find(p=>p?.id===b.id);return {...b,x:Math.max(1.5,Math.min(11.5,Number.isFinite(p?.x)?p.x:b.x)),y:Math.max(1.8,Math.min(16.2,Number.isFinite(p?.y)?p.y:b.y))};});
 // Reject overlapping squad centers as a complete formation, preserving the selected troops.
 if(formation.some((a,i)=>formation.some((b,j)=>i<j&&Math.hypot(a.x-b.x,a.y-b.y)<1.4)))return {heroId,troops,preset,formation:base};
 return {heroId,troops,preset,formation};
}
function campaignLevel(id){return CAMPAIGN_LEVELS.find(l=>l.id===id)||CAMPAIGN_LEVELS[0];}
function createCampaignBattle(input={}){
 input=input&&typeof input==='object'?input:{};
 const config=sanitizeCampaignConfig(input),level=campaignLevel(input.levelId);
 const battle=createLabBattle({blue:config.formation,red:level.enemy,scenarioId:`campaign-${level.id}`,aiMode:'roles',combatVersion:CAMPAIGN_COMBAT_VERSION,heroes:{blue:config.heroId,red:level.heroId}});
 battle.campaign={levelId:level.id,config};return battle;
}
function campaignSummary(battle){
 const units=battle.units,commander=side=>units.find(u=>u.type==='commander'&&u.side===side);
 const soldiers=units.filter(u=>u.type!=='commander');
 const duelStart=soldiers.length&&soldiers.every(u=>!u.alive)?Math.max(...soldiers.map(u=>u.diedAt)):null;
 return {levelId:battle.campaign?.levelId,status:battle.status,time:+battle.time.toFixed(2),duelSeconds:duelStart===null?null:+(battle.time-duelStart).toFixed(2),blueHp:+Math.max(0,commander('blue').hp).toFixed(1),redHp:+Math.max(0,commander('red').hp).toFixed(1),blueSurvivors:units.filter(u=>u.side==='blue'&&u.type!=='commander'&&u.alive).length,redSurvivors:units.filter(u=>u.side==='red'&&u.type!=='commander'&&u.alive).length,hero:{...battle.heroMetrics.blue},enemyHero:{...battle.heroMetrics.red},damageByType:Object.fromEntries(TROOP_TYPES.map(type=>[type,+units.filter(u=>u.side==='blue'&&u.type===type).reduce((v,u)=>v+u.damageDone,0).toFixed(1)]))};
}
function runCampaignTrial(input={},step=.5){const b=createCampaignBattle(input);b.status='running';while(b.status==='running')stepBattle(b,step);return campaignSummary(b);}
// Examples verified by the real battle engine, never runtime victory bonuses.
const CAMPAIGN_SOLUTIONS={
 first:{heroId:'liubei',troops:['bladeShield','spear','bladeShield','archer','cavalry'],preset:'balanced'},
 charge:{heroId:'huangzhong',troops:['bladeShield','bladeShield','archer','archer','archer'],preset:'shieldWall'},
 arrows:{heroId:'liubei',troops:Array(5).fill('bladeShield'),preset:'balanced'},
 wall:{heroId:'liubei',troops:Array(5).fill('spear'),preset:'spearhead'},
 encircle:{heroId:'zhaoyun',troops:Array(5).fill('cavalry'),preset:'balanced'}
};
// Second composition per level, sharing the same four visible formation cards.
const CAMPAIGN_ALTERNATIVES={
 first:{heroId:'liubei',troops:Array(5).fill('spear'),preset:'balanced'},
 charge:{heroId:'liubei',troops:Array(5).fill('spear'),preset:'balanced'},
 arrows:{heroId:'zhaoyun',troops:['spear','spear','spear','spear','bladeShield'],preset:'balanced'},
 wall:{heroId:'liubei',troops:['spear','spear','spear','bladeShield','bladeShield'],preset:'spearhead'},
 encircle:{heroId:'zhaoyun',troops:['cavalry','cavalry','cavalry','cavalry','spear'],preset:'balanced'}
};
const CAMPAIGN_FORMATION_SOLUTIONS=CAMPAIGN_SOLUTIONS;
const CAMPAIGN_FORMATION_ALTERNATIVES=CAMPAIGN_ALTERNATIVES;

module.exports={CAMPAIGN_VERSION,CAMPAIGN_PROGRESS_VERSIONS,TROOP_TYPES,PLAYER_SLOTS,DEFAULT_CONFIG,FORMATION_PRESETS,CAMPAIGN_LEVELS,formationFor,sanitizeCampaignConfig,campaignLevel,createCampaignBattle,campaignSummary,runCampaignTrial,CAMPAIGN_SOLUTIONS,CAMPAIGN_ALTERNATIVES,CAMPAIGN_FORMATION_SOLUTIONS,CAMPAIGN_FORMATION_ALTERNATIVES};

},
"engine/journey.js":function(require,module,exports){
// Generated from artifacts/commander-pve/journey.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
const {createLabBattle,stepBattle,CAMPAIGN_COMBAT_VERSION}=require('./engine.js');
const {TROOP_TYPES,PLAYER_SLOTS,sanitizeCampaignConfig,campaignSummary}=require('./campaign.js');
const {JOURNEY_LEVELS}=require('./journey-data.js');
const {cleanMissionLedger,missionMerit}=require('./mission-progress.js');

const JOURNEY_VERSION='2.1';
const STORAGE_KEY='commander-journey-v1';
const CHAPTERS=['初出茅庐','破阵求生','将星试炼','终局夺帅'].map((name,i)=>({number:i+1,name,levels:JOURNEY_LEVELS.slice(i*5,i*5+5).map(l=>l.id)}));
const STARTER={heroId:'liubei',troops:['bladeShield','spear','bladeShield','spear','bladeShield'],preset:'balanced'};
const UNLOCKS=[
 {after:'first',label:'黄忠 · 弓兵',heroes:['huangzhong'],troops:['archer']},
 {after:'charge',label:'盾墙阵',formations:['shieldWall']},
 {after:'arrows',label:'赵云 · 骑兵',heroes:['zhaoyun'],troops:['cavalry']},
 {after:'horseGate',label:'锋矢阵',formations:['spearhead']},
 {after:'encircle',label:'鹤翼阵 · 第二章',formations:['wings']}
];
const int=(v,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.floor(Number(v)))):min;
const record=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const levelFor=id=>JOURNEY_LEVELS.find(l=>l.id===id)||JOURNEY_LEVELS[0];
function firstReward(id){return levelFor(id).number%5===0?6:3;}
function completedOf(profile){return JOURNEY_LEVELS.filter(l=>(profile.wins?.[l.id]||0)>0).map(l=>l.id);}
function availableLevels(profile){
 const d=new Set(completedOf(profile)),available=new Set();
 for(let i=0;i<5;i++){const l=JOURNEY_LEVELS[i];if(i===0||d.has(JOURNEY_LEVELS[i-1].id))available.add(l.id);}
 for(let c=1;c<4;c++){
  const ids=CHAPTERS[c].levels;
  if(!d.has(CHAPTERS[c-1].levels[4]))continue;
  ids.slice(0,3).forEach(id=>available.add(id));
  if(ids.slice(0,3).filter(id=>d.has(id)).length>=2)available.add(ids[3]);
  if(d.has(ids[3]))available.add(ids[4]);
 }
 return available;
}
function unlocksFor(profile){
 const done=new Set(completedOf(profile)),heroes=['liubei'],troops=['bladeShield','spear'],formations=['balanced'];
 for(const u of UNLOCKS)if(done.has(u.after)){heroes.push(...u.heroes||[]);troops.push(...u.troops||[]);formations.push(...u.formations||[]);}
 return {heroes,troops,formations};
}
function chapterReached(profile){let chapter=1;for(let c=0;c<3;c++)if(profile.wins?.[CHAPTERS[c].levels[4]])chapter=c+2;return chapter;}
function capsFor(profile){const c=chapterReached(profile);return {heroLevel:Math.min(5,c+1),troopRank:c<3?1:c===3?2:3};}
const heroMultiplier=level=>1+(level-1)*.05;
const troopMultiplier=rank=>1+rank*.06;
const troopCost=rank=>[0,4,10,18][rank]??0;
function trainingCost(training){return (training.heroLevel-1)*5+TROOP_TYPES.reduce((n,t)=>n+troopCost(training.troopRanks[t]||0),0);}
function earnedMerit(profile){return missionMerit(profile.missions)+JOURNEY_LEVELS.reduce((n,l)=>{const wins=profile.wins?.[l.id]||0;return n+(wins?firstReward(l.id)+Math.min(2,wins-1):0);},0);}
const balance=profile=>earnedMerit(profile)-trainingCost(profile.training);
function cleanTraining(input,profile){
 const x=record(input),caps=capsFor(profile),unlocked=unlocksFor(profile);
 return {heroLevel:int(x.heroLevel,1,caps.heroLevel),troopRanks:Object.fromEntries(TROOP_TYPES.map(t=>[t,unlocked.troops.includes(t)?int(x.troopRanks?.[t],0,caps.troopRank):0]))};
}
function cleanConfig(input,profile){
 const x=record(input),unlocked=unlocksFor(profile);
 const troops=PLAYER_SLOTS.map((_,i)=>unlocked.troops.includes(x.troops?.[i])?x.troops[i]:STARTER.troops[i]);
 const preset=unlocked.formations.includes(x.preset)?x.preset:'balanced';
 return sanitizeCampaignConfig({...x,heroId:unlocked.heroes.includes(x.heroId)?x.heroId:'liubei',troops,preset,formation:preset===x.preset?x.formation:undefined});
}
function sanitizeProfile(input={}){
 const x=record(input),p={schema:1,wins:{},training:{},config:{},levelId:'first',attempts:{}};
 // Validate clears in encounter order: stale or corrupted future badges cannot
 // grant access to later tools or rewards without their prerequisites.
 for(const l of JOURNEY_LEVELS){const w=int(x.wins?.[l.id],0,3);if(w&&availableLevels(p).has(l.id))p.wins[l.id]=w;}
 p.missions=p.wins.charge?cleanMissionLedger(x.missions):{};
 p.training=cleanTraining(x.training,p);
 if(trainingCost(p.training)>earnedMerit(p))p.training=cleanTraining({},p);
 p.config=cleanConfig(x.config||STARTER,p);
 p.levelId=availableLevels(p).has(x.levelId)?x.levelId:'first';
 p.attempts=Object.fromEntries(JOURNEY_LEVELS.map(l=>[l.id,int(x.attempts?.[l.id],0,9999)]));
 return p;
}
function allocateTraining(profile,training){
 const p=sanitizeProfile(profile),t=cleanTraining(training,p);
 if(trainingCost(t)>earnedMerit(p))return {ok:false,profile:p,reason:'军功不足，可换阵、挑战其他已开放关卡，或重配已有训练。'};
 p.training=t;return {ok:true,profile:p};
}
function upgrade(profile,target){
 const p=sanitizeProfile(profile),caps=capsFor(p),t=cloneData(p.training);
 if(target==='hero'){if(t.heroLevel>=caps.heroLevel)return {ok:false,profile:p,reason:'已达本章英雄等级上限。'};t.heroLevel++;}
 else {if(!unlocksFor(p).troops.includes(target)||t.troopRanks[target]>=caps.troopRank)return {ok:false,profile:p,reason:'该兵种尚未解锁，或已达本章训练上限。'};t.troopRanks[target]++;}
 return allocateTraining(p,t);
}
function nextLevel(profile,from=profile.levelId){
 const available=availableLevels(profile),ids=JOURNEY_LEVELS.map(l=>l.id),at=ids.indexOf(from);
 return [...ids.slice(at+1),...ids.slice(0,at+1)].find(id=>available.has(id)&&!profile.wins[id])||from;
}
function createJourneyBattle(profileInput,overrides={}){
 const profile=sanitizeProfile(profileInput),levelId=overrides.levelId||profile.levelId;
 if(!availableLevels(profile).has(levelId))throw new Error('关卡尚未解锁');
 const config=cleanConfig(overrides.config||profile.config,profile),l=levelFor(levelId);
 const b=createLabBattle({blue:config.formation,red:l.enemy,scenarioId:`journey-${l.id}`,aiMode:'roles',combatVersion:CAMPAIGN_COMBAT_VERSION,heroes:{blue:config.heroId,red:l.heroId}});
 const training=profile.training;
 for(const u of b.units.filter(u=>u.side==='blue')){
  if(u.type==='commander'){
   const mult=heroMultiplier(training.heroLevel);u.hp*=mult;u.maxHp*=mult;
   u.combatStats=Object.freeze({...u.combatStats,damage:u.combatStats.damage*mult});
  }else{
   const mult=troopMultiplier(training.troopRanks[u.type]);
   // Preserve the already-applied proximity aura separately from base health.
   u.baseHp=(u.baseHp??b.unitTypes[u.type].hp)*mult;u.hp*=mult;u.maxHp*=mult;u.damageMultiplier=(u.damageMultiplier??1)*mult;
  }
 }
 b.campaign={levelId,config};b.journey={levelId,training:cloneData(training),settled:false};return b;
}
function settleBattle(profileInput,battle){
 const p=sanitizeProfile(profileInput),j=battle.journey;
 if(!j||j.settled||!['won','lost','draw'].includes(battle.status)||!availableLevels(p).has(j.levelId))return {profile:p,reward:0,first:false};
 j.settled=true;p.attempts[j.levelId]++;const first=!p.wins[j.levelId];let reward=0;
 if(battle.status==='won'){
  const previous=p.wins[j.levelId]||0;reward=first?firstReward(j.levelId):previous<3?1:0;
  p.wins[j.levelId]=Math.min(3,previous+1);
 }
 return {profile:p,reward,first:first&&battle.status==='won'};
}
function runJourneyTrial(profile,overrides={},step=.5){
 const battle=createJourneyBattle(profile,overrides);battle.status='running';
 while(battle.status==='running')stepBattle(battle,step);
 return {summary:campaignSummary(battle),...settleBattle(profile,battle)};
}
function lockReason(level,profile){
 if(availableLevels(profile).has(level.id))return profile.wins[level.id]?'已通关':'可出战';
 if(level.chapter===1)return `先通关第 ${level.number-1} 战`;
 const c=CHAPTERS[level.chapter-1];
 if(!profile.wins[CHAPTERS[level.chapter-2].levels[4]])return `先击破第 ${level.chapter-1} 章主将`;
 return level.id===c.levels[3]?'本章前三战任选两战获胜':'先通关本章前哨';
}

module.exports={JOURNEY_LEVELS,JOURNEY_VERSION,STORAGE_KEY,CHAPTERS,STARTER,UNLOCKS,levelFor,firstReward,completedOf,availableLevels,unlocksFor,chapterReached,capsFor,heroMultiplier,troopMultiplier,troopCost,trainingCost,earnedMerit,balance,cleanTraining,cleanConfig,sanitizeProfile,allocateTraining,upgrade,nextLevel,createJourneyBattle,settleBattle,runJourneyTrial,lockReason};

},
"engine/journey-data.js":function(require,module,exports){
// Generated from artifacts/commander-pve/journey-data.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
// Fixed enemy rosters. No adaptation to the selected player army.
const JOURNEY_LEVELS = [
 {
  "id": "first",
  "heroId": "liubei",
  "enemyFormationName": "初阵交锋",
  "enemyPlan": "",
  "weakness": "",
  "number": 1,
  "name": "初阵交锋",
  "theme": "近战协同",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "以刀盾和长枪组成连贯的正面。敌方上下路的弓骑兵力较少，先比较两种步兵的配比。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 5,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 4,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 5,
    "x": 20,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "archer",
    "count": 6,
    "x": 23,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "cavalry",
    "count": 4,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 24,
    "y": 9
   }
  ],
  "chapter": 1
 },
 {
  "id": "charge",
  "heroId": "liubei",
  "enemyFormationName": "枪阵双骑",
  "enemyPlan": "",
  "weakness": "",
  "number": 2,
  "name": "枪阵双骑",
  "theme": "保护输出",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "长枪反骑，但没有盾面挡箭。弓兵需要前排保护，步阵续航也是一条可尝试的路。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "spear",
    "count": 8,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 8,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 4,
    "x": 20,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "cavalry",
    "count": 4,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-5",
    "type": "archer",
    "count": 6,
    "x": 23,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 24,
    "y": 5.5
   }
  ],
  "chapter": 1
 },
 {
  "id": "arrows",
  "heroId": "huangzhong",
  "enemyFormationName": "双翼箭雨",
  "enemyPlan": "",
  "weakness": "",
  "number": 3,
  "name": "双翼箭雨",
  "theme": "刀盾抗箭",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "弓阵相距较远，先用刀盾承受箭线，再观察谁能先接近敌将。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "archer",
    "count": 8,
    "x": 23,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "archer",
    "count": 8,
    "x": 23,
    "y": 15
   },
   {
    "id": "e-slot-3",
    "type": "spear",
    "count": 6,
    "x": 20,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "cavalry",
    "count": 4,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 8,
    "x": 20,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 6
   }
  ],
  "chapter": 1
 },
 {
  "id": "horseGate",
  "heroId": "zhaoyun",
  "enemyFormationName": "双骑逼阵",
  "enemyPlan": "",
  "weakness": "",
  "number": 4,
  "name": "双骑逼阵",
  "theme": "反骑与换将",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "两翼骑兵会迅速进入战线。长枪的反骑能力和刘备的步兵支援可以配合。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 8,
    "x": 23,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 6,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 6,
    "x": 23,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 1
 },
 {
  "id": "encircle",
  "heroId": "liubei",
  "enemyFormationName": "藏枪刀盾阵",
  "enemyPlan": "",
  "weakness": "",
  "number": 5,
  "name": "藏枪刀盾阵",
  "theme": "首章夺帅",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "多数敌兵是刀盾，上翼仅少量长枪。试试赵云和骑兵，注意冲锋时是否撞上枪尖。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "spear",
    "count": 3,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 3,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 4,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "bladeShield",
    "count": 4,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 4,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-slot-6",
    "type": "bladeShield",
    "count": 4,
    "x": 24,
    "y": 3
   },
   {
    "id": "e-slot-7",
    "type": "bladeShield",
    "count": 4,
    "x": 24,
    "y": 6
   },
   {
    "id": "e-slot-8",
    "type": "bladeShield",
    "count": 4,
    "x": 24,
    "y": 12
   },
   {
    "id": "e-slot-9",
    "type": "bladeShield",
    "count": 4,
    "x": 24,
    "y": 15
   },
   {
    "id": "e-slot-10",
    "type": "bladeShield",
    "count": 4,
    "x": 27,
    "y": 16
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 1
 },
 {
  "id": "arrowGap",
  "heroId": "huangzhong",
  "enemyFormationName": "弓阵裂隙",
  "enemyPlan": "",
  "weakness": "",
  "number": 6,
  "name": "弓阵裂隙",
  "theme": "突破远程",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "敌方弓兵分列上路与中路，刀盾偏下。比较分翼和集中推进时，谁先碰到弓阵。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "archer",
    "count": 7,
    "x": 23,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "archer",
    "count": 7,
    "x": 23,
    "y": 9
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 6,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 5,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 5,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 6
   }
  ],
  "chapter": 2
 },
 {
  "id": "guardReturn",
  "heroId": "liubei",
  "enemyFormationName": "中军回援",
  "enemyPlan": "",
  "weakness": "",
  "number": 7,
  "name": "中军回援",
  "theme": "混编协同",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "中路刀盾护将，下路骑兵抢先接敌。给远程留前排，也给主将留支援。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 8,
    "x": 22,
    "y": 9
   },
   {
    "id": "e-slot-2",
    "type": "archer",
    "count": 6,
    "x": 23,
    "y": 3
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 5,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "archer",
    "count": 6,
    "x": 23,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 2
 },
 {
  "id": "spearTrial",
  "heroId": "zhaoyun",
  "enemyFormationName": "长枪试锋",
  "enemyPlan": "",
  "weakness": "",
  "number": 8,
  "name": "长枪试锋",
  "theme": "分路作战",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "上下两翼长枪、中路刀盾、后排弓兵。骑兵直走两翼未必合算，步阵也可与赵云争夺中路。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "spear",
    "count": 7,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 7,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 6
   },
   {
    "id": "e-slot-4",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 6,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 2
 },
 {
  "id": "wall",
  "heroId": "liubei",
  "enemyFormationName": "偏锋夹击",
  "enemyPlan": "",
  "weakness": "",
  "number": 9,
  "name": "偏锋夹击",
  "theme": "集中破阵",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "敌军刀盾与枪集中上翼，下翼骑兵独立。比较锋矢集中与均衡展开的接敌顺序。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 10,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "bladeShield",
    "count": 10,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 5,
    "x": 22,
    "y": 4.5
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 5,
    "x": 22,
    "y": 7.5
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 5.5
   }
  ],
  "chapter": 2
 },
 {
  "id": "threeRoads",
  "heroId": "liubei",
  "enemyFormationName": "三路合围",
  "enemyPlan": "",
  "weakness": "",
  "number": 10,
  "name": "三路合围",
  "theme": "第二章夺帅",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "三路各有主力。尝试两翼先接敌，或让前排集中争取输出时间。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 7,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 4,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "archer",
    "count": 7,
    "x": 24,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 7,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 2
 },
 {
  "id": "huangzhongWall",
  "heroId": "huangzhong",
  "enemyFormationName": "箭垒压境",
  "enemyPlan": "",
  "weakness": "",
  "number": 11,
  "name": "箭垒压境",
  "theme": "攻守选择",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "三队弓兵、两队刀盾。刀盾能拖住箭线，骑兵则更擅长击破盾面。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 9
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 3
 },
 {
  "id": "chargeLine",
  "heroId": "zhaoyun",
  "enemyFormationName": "骑阵突贯",
  "enemyPlan": "",
  "weakness": "",
  "number": 12,
  "name": "骑阵突贯",
  "theme": "反骑进阶",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "三队骑兵从上中下同时进攻。长枪要能接到冲锋，远程需要足够的保护。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 9
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 8,
    "x": 22,
    "y": 6
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 8,
    "x": 22,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 3
 },
 {
  "id": "bladeMaze",
  "heroId": "zhaoyun",
  "enemyFormationName": "刀盾迷宫",
  "enemyPlan": "",
  "weakness": "",
  "number": 13,
  "name": "刀盾迷宫",
  "theme": "突破与绕行",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "四队刀盾分布在两翼，中路一队长枪。让骑兵发挥克制，同时比较阵型带来的接敌次序。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "bladeShield",
    "count": 8,
    "x": 23,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 8,
    "x": 23,
    "y": 12
   },
   {
    "id": "e-slot-4",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 6,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 3
 },
 {
  "id": "longFight",
  "heroId": "liubei",
  "enemyFormationName": "长线消耗",
  "enemyPlan": "",
  "weakness": "",
  "number": 14,
  "name": "长线消耗",
  "theme": "训练与续航",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "刘备带刀盾、枪、弓形成完整战线。试着把训练集中在本局主力兵种，或改换更集中的阵型。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 8,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 7,
    "x": 24,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "bladeShield",
    "count": 7,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 6,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 3
 },
 {
  "id": "sideRaid",
  "heroId": "zhaoyun",
  "enemyFormationName": "锋骑侧击",
  "enemyPlan": "",
  "weakness": "",
  "number": 15,
  "name": "锋骑侧击",
  "theme": "第三章夺帅",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "两队骑兵、两队弓兵，中路长枪。挡住骑兵只是第一步，还需要处理后排。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "archer",
    "count": 8,
    "x": 24,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "archer",
    "count": 8,
    "x": 24,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "spear",
    "count": 8,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 3
 },
 {
  "id": "arrowCavalry",
  "heroId": "huangzhong",
  "enemyFormationName": "弓骑夹道",
  "enemyPlan": "",
  "weakness": "",
  "number": 16,
  "name": "弓骑夹道",
  "theme": "双威胁",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "上下弓骑夹击，中路厚盾。纯弓或纯骑都要付出代价，试着利用不同接敌速度。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 6,
    "x": 24,
    "y": 15
   },
   {
    "id": "e-slot-4",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 12,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 4
 },
 {
  "id": "spearDoor",
  "heroId": "liubei",
  "enemyFormationName": "枪门死守",
  "enemyPlan": "",
  "weakness": "",
  "number": 17,
  "name": "枪门死守",
  "theme": "攻破枪阵",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "四队长枪分列前线，后排一队弓兵。不要仅凭人数堆骑兵，尝试远程输出与前排配合。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-slot-5",
    "type": "archer",
    "count": 8,
    "x": 24,
    "y": 9
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 4
 },
 {
  "id": "fiveRoads",
  "heroId": "liubei",
  "enemyFormationName": "五路混战",
  "enemyPlan": "",
  "weakness": "",
  "number": 18,
  "name": "五路混战",
  "theme": "综合试炼",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "刀盾、枪、弓、骑混编。观察最先崩溃的一路，再决定换兵还是集中训练。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 7,
    "x": 24,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "cavalry",
    "count": 6,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 4
 },
 {
  "id": "starPass",
  "heroId": "huangzhong",
  "enemyFormationName": "将星难渡",
  "enemyPlan": "",
  "weakness": "",
  "number": 19,
  "name": "将星难渡",
  "theme": "终章前哨",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "上翼弓骑相邻，中下路刀盾与长枪。不同阵型会改变保护后排与攻击敌将的时机。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "archer",
    "count": 8,
    "x": 24,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "cavalry",
    "count": 8,
    "x": 20,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "bladeShield",
    "count": 9,
    "x": 21,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "spear",
    "count": 7,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 15
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 4
 },
 {
  "id": "finalDuel",
  "heroId": "zhaoyun",
  "enemyFormationName": "终局夺帅",
  "enemyPlan": "",
  "weakness": "",
  "number": 20,
  "name": "终局夺帅",
  "theme": "终章夺帅",
  "description": "敌军部署开局公开，双方使用同一套基础兵种与英雄规则。",
  "hint": "赵云配合四兵种混编。带上训练后的主力，比较阵型和英雄的组合。",
  "enemy": [
   {
    "id": "e-slot-1",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 3
   },
   {
    "id": "e-slot-2",
    "type": "spear",
    "count": 8,
    "x": 21,
    "y": 6
   },
   {
    "id": "e-slot-3",
    "type": "archer",
    "count": 8,
    "x": 24,
    "y": 9
   },
   {
    "id": "e-slot-4",
    "type": "cavalry",
    "count": 8,
    "x": 20,
    "y": 15
   },
   {
    "id": "e-slot-5",
    "type": "bladeShield",
    "count": 8,
    "x": 21,
    "y": 12
   },
   {
    "id": "e-commander",
    "type": "commander",
    "count": 1,
    "x": 25,
    "y": 9
   }
  ],
  "chapter": 4
 }
];

module.exports={JOURNEY_LEVELS};

},
"engine/mission-progress.js":function(require,module,exports){
// Generated from artifacts/commander-pve/mission-progress.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
// One shared daily reward ladder per objective, independent of retries/chapter.
const MISSION_IDS=['raid','guard','relay'];
const missionDay=(now=new Date())=>`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
function cleanMissionLedger(input={}){
 const out={};
 if(!input||typeof input!=='object')return out;
 for(const [day,value] of Object.entries(input)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||day>missionDay()||!value||typeof value!=='object')continue;
  const parsed=new Date(`${day}T12:00:00`);if(!Number.isFinite(+parsed)||missionDay(parsed)!==day)continue;
  const row={};
  for(const id of MISSION_IDS){const n=Number(value[id]);if(Number.isFinite(n)&&n>0)row[id]=Math.min(3,Math.floor(n));}
  if(Object.keys(row).length)out[day]=row;
 }
 return out;
}
const missionMerit=ledger=>Object.values(ledger||{}).reduce((sum,row)=>sum+MISSION_IDS.reduce((n,id)=>n+(row[id]||0),0),0);
function creditMission(profile,id,tier,day=missionDay()){
 if(!MISSION_IDS.includes(id))throw new Error('未知委托');
 const p=cloneData(profile),previous=p.missions?.[day]?.[id]||0;
 const score=Math.max(previous,Math.max(0,Math.min(3,Math.floor(tier))));
 p.missions??={};p.missions[day]={...p.missions[day],[id]:score};
 return {profile:p,reward:score-previous,tier};
}

module.exports={MISSION_IDS,missionDay,cleanMissionLedger,missionMerit,creditMission};

},
"engine/missions.js":function(require,module,exports){
// Generated from artifacts/commander-pve/missions.mjs; run npm run build:minigame.
const cloneData=x=>JSON.parse(JSON.stringify(x));
const {createLabBattle,mirrorFormation,stepBattle,CAMPAIGN_COMBAT_VERSION}=require('./engine.js');
const {sanitizeCampaignConfig}=require('./campaign.js');
const {sanitizeProfile,cleanConfig,heroMultiplier,troopMultiplier,chapterReached}=require('./journey.js');
const {creditMission,missionDay}=require('./mission-progress.js');

const MISSIONS=[
 {id:'raid',name:'剿匪夺粮',objective:'60 秒内歼灭敌兵。击杀 8 / 16 / 24 人各得一档奖励；不必斩将。',unlock:'charge'},
 {id:'guard',name:'守营待援',objective:'保护主将坚持 20 / 35 / 50 秒各得一档奖励。提前斩将直接完成三档。',unlock:'charge'},
 {id:'relay',name:'三军接力',objective:'双方各 3 军，逐军接战。每击溃一军获得一档奖励。胜军保留残血、残兵与蓝量。',unlock:'arrows'}
];
const missionOpen=(p,id)=>!!p.wins?.[MISSIONS.find(m=>m.id===id)?.unlock];
const plan=(heroId,troops,preset='balanced')=>({heroId,troops,preset});
const DEFAULT_ARMIES=[
 plan('liubei',['bladeShield','spear','bladeShield','spear','bladeShield'],'balanced'),
 plan('huangzhong',['bladeShield','bladeShield','archer','archer','archer'],'shieldWall'),
 plan('zhaoyun',Array(5).fill('cavalry'),'balanced')
];
function cleanArmies(input,profile){
 const used=new Set(),heroes=['liubei','huangzhong','zhaoyun'];
 return DEFAULT_ARMIES.map((fallback,i)=>{
  const cfg=cleanConfig(input?.[i]||fallback,profile);
  if(used.has(cfg.heroId))cfg.heroId=heroes.find(id=>!used.has(id));
  used.add(cfg.heroId);return cfg;
 });
}
function enemyArmies(id){
 if(id==='raid')return [plan('huangzhong',['spear','archer','spear','archer','spear'])];
 if(id==='guard')return [plan('zhaoyun',['cavalry','bladeShield','cavalry','bladeShield','cavalry'])];
 return [plan('zhaoyun',Array(5).fill('cavalry'),'balanced'),plan('huangzhong',['bladeShield','bladeShield','archer','archer','archer'],'shieldWall'),plan('liubei',['spear','bladeShield','spear','bladeShield','spear'],'balanced')];
}
function trainArmy(battle,side,training){
 for(const u of battle.units.filter(u=>u.side===side)){
  const mult=u.type==='commander'?heroMultiplier(training.heroLevel):troopMultiplier(training.troopRanks[u.type]||0);
  u.hp*=mult;u.maxHp*=mult;
  if(u.type==='commander')u.combatStats=Object.freeze({...u.combatStats,damage:u.combatStats.damage*mult});
  else {u.baseHp=(u.baseHp??battle.unitTypes[u.type].hp)*mult;u.damageMultiplier=(u.damageMultiplier??1)*mult;}
 }
}
function captureSurvivors(battle,side){
 return battle.units.filter(u=>u.side===side).map(u=>({id:u.id,alive:u.alive,hpRatio:Math.max(0,u.hp)/u.maxHp,mana:u.mana,cooldown:Math.max(0,u.cooldown)}));
}
function restoreSurvivors(battle,side,saved){
 if(!saved)return;
 const byId=new Map(saved.map(u=>[u.id,u]));
 for(const u of battle.units.filter(u=>u.side===side)){
  const prev=byId.get(u.id);u.alive=!!prev?.alive;u.hp=u.alive?u.maxHp*prev.hpRatio:0;
  if(prev){u.mana=prev.mana;u.cooldown=prev.cooldown;}
 }
}
function createRound(session){
 const {blue,red}=session.indices,a=session.armies[blue],e=sanitizeCampaignConfig(session.enemies[red]);
 const enemy=mirrorFormation(e.formation,'m-red');
 if(session.id!=='relay')for(const squad of enemy)if(squad.type!=='commander')squad.count=session.id==='raid'?6:8;
 const b=createLabBattle({blue:a.formation,red:enemy,scenarioId:`mission-${session.id}`,aiMode:'roles',combatVersion:CAMPAIGN_COMBAT_VERSION,heroes:{blue:a.heroId,red:e.heroId}});
 trainArmy(b,'blue',session.training);
 // The chapter tier is fixed at entry; changing one's army/training never
 // causes the opponent to scale. Early difficulty always remains available.
 const rank=session.tier-1;
 trainArmy(b,'red',{heroLevel:session.tier,troopRanks:{bladeShield:rank,spear:rank,archer:rank,cavalry:rank}});
 for(const side of ['blue','red'])restoreSurvivors(b,side,session.carry[side]);
 b.campaign={levelId:`mission-${session.id}`};
 session.battle=b;session.roundStart={blue:captureSurvivors(b,'blue'),red:captureSurvivors(b,'red')};
 if(session.id!=='relay')b.observeTick=()=>{
  if(b.status!=='running')return;
  const target=session.id==='guard'?50:60;
  if(b.time>=target){b.status='draw';b.result={winner:null,reason:'委托计时结束'};}
 };
}
function createMission(profileInput,id,{armies,tier=1}={}){
 const p=sanitizeProfile(profileInput);
 if(!missionOpen(p,id))throw new Error('委托尚未解锁');
 const configs=id==='relay'?cleanArmies(armies,p):[cleanConfig(armies?.[0]||p.config,p)];
 const s={id,status:'ready',armies:configs,enemies:enemyArmies(id),training:cloneData(p.training),tier:Math.max(1,Math.min(chapterReached(p),Math.floor(tier)||1)),indices:{blue:0,red:0},carry:{blue:null,red:null},rounds:[],settled:false,day:missionDay(),totalTime:0};
 createRound(s);return s;
}
function startMission(session){
 if(!['ready','between'].includes(session.status))return false;
 session.status='running';session.battle.status='running';return true;
}
function resolveRound(s){
 const b=s.battle;if(s.status!=='running'||b.status==='running')return false;
 const current={...s.indices},outcome=b.status;
 const units=side=>b.units.filter(u=>u.side===side),chief=side=>units(side).find(u=>u.type==='commander');
 const record={number:s.rounds.length+1,blue:current.blue,red:current.red,outcome,time:+b.time.toFixed(2),blueHp:Math.max(0,chief('blue').hp),redHp:Math.max(0,chief('red').hp),blueSoldiers:units('blue').filter(u=>u.alive&&u.type!=='commander').length,redSoldiers:units('red').filter(u=>u.alive&&u.type!=='commander').length,start:s.roundStart,end:{blue:captureSurvivors(b,'blue'),red:captureSurvivors(b,'red')}};
 s.rounds.push(record);s.totalTime+=b.time;
 if(s.id!=='relay'){
  const value=s.id==='raid'?units('red').filter(u=>!u.alive&&u.type!=='commander').length:b.status==='won'?50:b.time;
  const thresholds=s.id==='raid'?[8,16,24]:[20,35,50];
  s.score=value;s.rewardTier=thresholds.filter(n=>value+1e-6>=n).length;s.status='finished';return true;
 }
 for(const side of ['blue','red']){
  const won=outcome===(side==='blue'?'won':'lost');
  if(won)s.carry[side]=captureSurvivors(b,side);
  else {s.indices[side]++;s.carry[side]=null;}
 }
 if(s.indices.blue>=3||s.indices.red>=3){
  s.status='finished';s.outcome=s.indices.blue>=3&&s.indices.red>=3?'draw':s.indices.red>=3?'won':'lost';s.rewardTier=s.indices.red;s.score=s.indices.red;
 }else s.status='between';
 return true;
}
function nextRound(s){if(s.status!=='between')return false;createRound(s);return startMission(s);}
function stepMission(s,dt){if(s.status!=='running')return;stepBattle(s.battle,dt);if(s.battle.status!=='running')resolveRound(s);}
function settleMission(profileInput,s){
 const p=sanitizeProfile(profileInput);
 if(s.status!=='finished'||s.settled||!missionOpen(p,s.id))return {profile:p,reward:0};
 s.settled=true;return creditMission(p,s.id,s.rewardTier,s.day);
}
function runMission(profile,id,options={}){
 const s=createMission(profile,id,options);startMission(s);
 while(s.status!=='finished'){if(s.status==='between')nextRound(s);else stepMission(s,.5);}
 return s;
}

module.exports={MISSIONS,missionOpen,DEFAULT_ARMIES,cleanArmies,enemyArmies,trainArmy,captureSurvivors,restoreSurvivors,createMission,startMission,resolveRound,nextRound,stepMission,settleMission,runMission};

},
"engine/renderer.js":function(require,module,exports){
const TYPES = { bladeShield: '刀盾', sword: '刀', shield: '盾', spear: '枪', archer: '弓', cavalry: '骑', commander: '帅' };
const P = {
  ally: { main: '#518b82', light: '#aad3ba', dark: '#254e45', flag: '#79b6a7', trim: '#d7d7ad' },
  enemy: { main: '#ad6553', light: '#e7b197', dark: '#683d32', flag: '#c9876b', trim: '#e4c999' },
};
const friendly = unit => ['player', 'ally', 'blue', 'a', 0].includes(unit.team ?? unit.side);
const living = unit => unit.alive !== false && (unit.hp == null || unit.hp > 0);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }

/** Canvas presentation only. Coordinates and combat state remain owned by the simulation. */
class BattleRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = options.width || 30;
    this.height = options.height || 18;
    this.frame = 0;
    this.previous = new Map();
    this.visualHits = [];
    this.deaths = [];
    this.lastTime = 0;
    this.flash = 0;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(300, Math.round(rect.width || 900));
    const h = Math.max(180, Math.round(rect.height || 540));
    if (this.canvas.width !== Math.round(w * this.pixelRatio) || this.canvas.height !== Math.round(h * this.pixelRatio)) {
      this.canvas.width = Math.round(w * this.pixelRatio);
      this.canvas.height = Math.round(h * this.pixelRatio);
      this.cw = w; this.ch = h;
      this.terrain = null;
    }
    this.cw = w; this.ch = h;
    this.scale = Math.min((w - 30) / this.width, (h - 30) / this.height);
    this.ox = (w - this.width * this.scale) / 2;
    this.oy = (h - this.height * this.scale) / 2;
  }

  point(x, y) { return { x: this.ox + x * this.scale, y: this.oy + y * this.scale }; }

  worldPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (clientX - rect.left - this.ox) / this.scale, y: (clientY - rect.top - this.oy) / this.scale };
  }

  pickSquad(clientX, clientY, units) {
    const rect=this.canvas.getBoundingClientRect(),px=clientX-rect.left,py=clientY-rect.top;
    const label=(this.squadLabelHits||[]).find(h=>h.friendly&&px>=h.x&&px<=h.x+h.w&&py>=h.y&&py<=h.y+h.h);
    if(label)return label.id;
    const point=this.worldPoint(clientX,clientY);
    const nearest=units.filter(u=>friendly(u)&&living(u)&&u.type!=='commander').map(u=>({u,d:Math.hypot(u.x-point.x,u.y-point.y)})).sort((a,b)=>a.d-b.d)[0];
    return nearest&&nearest.d<=Math.max(.65,14/this.scale)?nearest.u.squadId:null;
  }

  reset() { this.previous.clear(); this.visualHits = []; this.deaths = []; this.lastTime = 0; this.flash = 0; }

  draw(state, ui = {}) {
    this.resize();
    this.squadLabelHits=[];
    const now = state.time || 0;
    if (now < this.lastTime) this.reset();
    this.lastTime = now;
    const ctx = this.ctx;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    if (!this.terrain) this.buildTerrain();
    ctx.drawImage(this.terrain, 0, 0, this.cw, this.ch);
    const phase = state.phase || state.status || 'deployment';
    const setup = ['setup', 'deploy', 'deployment', 'ready', 'planning'].includes(phase);
    if (setup) this.drawDeployment(ui, state);
    this.readDamage(state.units || [], now);
    for (const corpse of this.deaths) this.drawCorpse(corpse, now);
    for (const unit of state.units || []) {
      if (!living(unit)) continue;
      const selected = ui.selectedId && [unit.id, unit.squadId, unit.squad].includes(ui.selectedId);
      if (selected && setup) this.drawSelected(unit);
      if (unit.type === 'commander' && setup) this.drawAura(unit, ui);
    }
    const units = (state.units || []).filter(living).slice().sort((a,b) => a.y - b.y);
    for (const unit of units) this.drawUnit(unit, now, setup, ui);
    this.drawProjectiles(state.projectiles || [], now);
    this.drawEffects(state.effects || [], now);
    this.drawHitEffects(now);
    if (setup) this.drawSquadLabels(units, ui);
    if (ui.hoverPoint && setup) this.drawGhost(ui.hoverPoint, ui);
    this.frame++;
  }

  buildTerrain() {
    const canvas = document.createElement('canvas'); canvas.width = this.cw; canvas.height = this.ch;
    const c = canvas.getContext('2d');
    const bg = c.createLinearGradient(0,0,0,this.ch); bg.addColorStop(0,'#77876a'); bg.addColorStop(.55,'#9b9c75'); bg.addColorStop(1,'#84916c'); c.fillStyle=bg; c.fillRect(0,0,this.cw,this.ch);
    for(let i=0;i<130;i++) {
      const x=hash(i*3)*this.cw,y=hash(i*3+1)*this.ch,r=10+hash(i*3+2)*65;
      c.fillStyle=i%3===0?'#506d4d08':'#dfcf9b09';c.beginPath();c.ellipse(x,y,r,r*.4,hash(i),0,Math.PI*2);c.fill();
    }
    // Worn ground gives the battle line a readable centre without forcing a lane.
    c.fillStyle='#c5b88e16'; c.beginPath(); c.moveTo(this.cw*.38,0);c.bezierCurveTo(this.cw*.46,this.ch*.3,this.cw*.55,this.ch*.6,this.cw*.61,this.ch);c.lineTo(this.cw*.47,this.ch);c.bezierCurveTo(this.cw*.5,this.ch*.65,this.cw*.35,this.ch*.2,this.cw*.32,0);c.fill();
    for(let i=0;i<240;i++) {
      const x=hash(i+782)*this.cw,y=hash(i+1640)*this.ch;
      c.strokeStyle=i%4===0?'#d5ce9c33':'#425c3c22';c.lineWidth=.7;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y-2);c.moveTo(x+3,y);c.lineTo(x+4,y-3);c.stroke();
    }
    for(let i=0;i<30;i++) {
      const x=hash(i+124)*this.cw,y=hash(i+986)*this.ch;
      c.fillStyle='#465b3d29';c.beginPath();c.ellipse(x,y,1.5+hash(i)*2,.7+hash(i)*1.5,0,0,Math.PI*2);c.fill();
    }
    const vignette=c.createRadialGradient(this.cw*.5,this.ch*.5,this.ch*.2,this.cw*.5,this.ch*.5,this.cw*.65);vignette.addColorStop(0,'#283d2900');vignette.addColorStop(1,'#233d2c62');c.fillStyle=vignette;c.fillRect(0,0,this.cw,this.ch);
    c.strokeStyle='#d1cba34d';c.lineWidth=1;c.strokeRect(8.5,8.5,this.cw-17,this.ch-17);
    for (const [x,y,sx,sy] of [[8,8,1,1],[this.cw-8,8,-1,1],[8,this.ch-8,1,-1],[this.cw-8,this.ch-8,-1,-1]]) { c.strokeStyle='#ddd3a5a3';c.beginPath();c.moveTo(x+sx*14,y);c.lineTo(x,y);c.lineTo(x,y+sy*14);c.stroke(); }
    this.terrain=canvas;
  }

  drawDeployment(ui, state) {
    const c=this.ctx; const area=ui.deploymentArea||{x:1,y:1,width:10.5,height:16};
    const a=this.point(area.x,area.y),b=this.point(area.x+area.width,area.y+area.height);
    c.fillStyle='#2c7c6a18';c.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);
    c.strokeStyle='#d7e8b950';c.lineWidth=1;c.setLineDash([4,5]);c.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);c.setLineDash([]);
    c.fillStyle='#dae4bda0';c.font=`${Math.max(8,this.scale*.30)}px sans-serif`;c.textAlign='center';c.fillText('我 方 布 阵 区',a.x+(b.x-a.x)/2,b.y-7);
    c.strokeStyle='#d9e0bb12';c.lineWidth=.7;
    for(let x=Math.ceil(area.x);x<area.x+area.width;x++) { const p=this.point(x,area.y);c.beginPath();c.moveTo(p.x,a.y);c.lineTo(p.x,b.y);c.stroke(); }
    for(let y=Math.ceil(area.y);y<area.y+area.height;y++) { const p=this.point(area.x,y);c.beginPath();c.moveTo(a.x,p.y);c.lineTo(b.x,p.y);c.stroke(); }
    const mid=this.point(this.width/2,1);c.strokeStyle='#ece4c026';c.setLineDash([3,7]);c.beginPath();c.moveTo(mid.x,mid.y);c.lineTo(mid.x,this.ch-this.oy-this.scale);c.stroke();c.setLineDash([]);
    if(ui.showPaths) for(const unit of state.units||[]) if(unit.type==='cavalry'&&unit.id.endsWith('-0')) {
      const target=(state.units||[]).find(u=>u.type==='commander'&&u.side!==unit.side);
      if(target)this.drawRoute(unit,target);
    }
  }

  drawRoute(unit,target) {
    const c=this.ctx,ally=friendly(unit),sign=ally?1:-1,lane=unit.flank;
    const a=this.point(unit.x,unit.y),b=this.point(unit.x+sign*.5,lane),d=this.point(target.x-sign*1.3,lane),end=this.point(target.x,target.y);
    c.strokeStyle=ally?'#ffedacb0':'#ffb192a0';c.lineWidth=1.5;c.setLineDash([5,5]);
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d.x,d.y);c.lineTo(end.x,end.y);c.stroke();c.setLineDash([]);
    const angle=Math.atan2(end.y-d.y,end.x-d.x);
    c.beginPath();c.moveTo(end.x-7*Math.cos(angle-.45),end.y-7*Math.sin(angle-.45));c.lineTo(end.x,end.y);c.lineTo(end.x-7*Math.cos(angle+.45),end.y-7*Math.sin(angle+.45));c.stroke();
    const p=this.point(ally?9:21,lane);
    c.font=`${Math.max(8,this.scale*.32)}px sans-serif`;c.textAlign='center';
    const label=`${ally?'我方':'敌方'}骑兵 · ${lane<9?'上路':'下路'}`;
    const y=p.y+(lane<9?14:-7),w=c.measureText(label).width;
    c.fillStyle='#22372cdd';c.fillRect(p.x-w/2-4,y-10,w+8,14);
    c.fillStyle=ally?'#ffedac':'#ffc8af';c.fillText(label,p.x,y);
  }

  drawAura(unit) {
    const c=this.ctx,p=this.point(unit.x,unit.y),r=2.5*this.scale;
    c.strokeStyle=friendly(unit)?'#e3dc9c43':'#f1b38f29';c.fillStyle=friendly(unit)?'#f0d88708':'#d4756306';c.lineWidth=1;c.setLineDash([3,5]);c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);
  }

  drawSelected(unit) {
    const c=this.ctx,p=this.point(unit.x,unit.y);c.strokeStyle='#f3dc84';c.lineWidth=1.5;c.fillStyle='#fbe7a226';c.beginPath();c.ellipse(p.x,p.y+2,this.scale*.40,this.scale*.28,0,0,Math.PI*2);c.fill();c.stroke();
  }

  drawUnit(unit, time, setup) {
    const c=this.ctx,p=this.point(unit.x,unit.y),pal=friendly(unit)?P.ally:P.enemy;
    const size=this.unitSize(unit),dir=Math.cos(unit.facing??(friendly(unit)?0:Math.PI))>=0?1:-1;
    const seed=String(unit.id).split('').reduce((a,b)=>a+b.charCodeAt(0),0);
    const braced=unit.hitStopUntil>time;
    const walk=!setup&&!braced&&unit.type!=='commander'&&unit.cooldown<0?Math.sin(time*14+seed)*.65:0;
    const thrust=!braced&&unit.attackFlash>0?Math.sin((.22-unit.attackFlash)/.22*Math.PI)*2:0;
    const recoil=braced?Math.cos(unit.blockFacing??0)*1.5:0;
    c.save();c.translate(p.x+dir*thrust-recoil,p.y+walk);c.scale(size/10,size/10);
    c.fillStyle='#1d382547';c.beginPath();c.ellipse(0,4,6.5,2.8,0,0,Math.PI*2);c.fill();
    if(unit.type==='commander') {
      if(unit.combatStats?.speed>0){c.save();c.translate(0,4);this.drawHorse(unit,time,pal,dir,false);c.restore();c.translate(0,-4);}
      this.drawCommander(unit,time,pal,dir);
    }
    else if(unit.type==='cavalry') this.drawHorse(unit,time,pal,dir);
    else {
      c.strokeStyle='#293e30';c.lineWidth=2;c.beginPath();c.moveTo(-1,2);c.lineTo(-2,5);c.moveTo(2,2);c.lineTo(3,5);c.stroke();
      c.fillStyle=pal.dark;c.beginPath();c.moveTo(-4,-3);c.lineTo(3,-3);c.lineTo(5,3);c.lineTo(-4,3);c.closePath();c.fill();
      c.fillStyle=pal.main;c.fillRect(-3,-4,6,6);c.fillStyle=pal.light;c.fillRect(-3,-4,6,1.5);
      c.fillStyle='#d7c19b';c.beginPath();c.arc(0,-6,2.4,0,Math.PI*2);c.fill();
      c.fillStyle=pal.dark;c.beginPath();c.arc(-.2,-6.7,3,Math.PI,Math.PI*2);c.lineTo(3,-5.5);c.lineTo(-3,-5.5);c.closePath();c.fill();
      c.fillStyle=pal.trim;c.fillRect(-.7,-9,1.4,2.5);
      if(unit.type==='shield'||unit.type==='bladeShield') {c.fillStyle=pal.dark;c.strokeStyle=pal.trim;c.lineWidth=.65;c.beginPath();c.moveTo(dir*2,-3);c.lineTo(dir*7,-4);c.lineTo(dir*7,2);c.lineTo(dir*4,5);c.lineTo(dir*2,2);c.closePath();c.fill();c.stroke();c.strokeStyle=pal.main;c.beginPath();c.moveTo(dir*4.5,-2);c.lineTo(dir*4.5,2.5);c.stroke();}
      else if(unit.type==='spear') {c.strokeStyle='#554b32';c.lineWidth=1.3;c.beginPath();c.moveTo(-dir*2,4);c.lineTo(dir*9,-7);c.stroke();c.fillStyle='#e3dfbc';c.beginPath();c.moveTo(dir*8,-6);c.lineTo(dir*12,-10);c.lineTo(dir*10,-5);c.closePath();c.fill();}
      else if(unit.type==='archer') {c.strokeStyle='#d2b67e';c.lineWidth=1.2;c.beginPath();c.arc(dir*3,-1,5,-Math.PI*.42,Math.PI*.42,dir<0);c.stroke();c.strokeStyle='#e5ddbb88';c.lineWidth=.5;c.beginPath();c.moveTo(dir*4,-6);c.lineTo(dir*4,4);c.stroke();c.strokeStyle='#6d5434';c.lineWidth=2;c.beginPath();c.moveTo(-dir*3,-5);c.lineTo(-dir*5,1);c.stroke();}
      else if(unit.type==='sword') {c.strokeStyle='#856844';c.lineWidth=1.5;c.beginPath();c.moveTo(dir*3,2);c.lineTo(dir*5,-1);c.stroke();c.fillStyle='#e4e4cf';c.beginPath();c.moveTo(dir*4,-1);c.lineTo(dir*9,-9);c.lineTo(dir*11,-10);c.lineTo(dir*7,-1);c.closePath();c.fill();c.strokeStyle=pal.trim;c.lineWidth=1.2;c.beginPath();c.moveTo(dir*3,-2);c.lineTo(dir*7,0);c.stroke();}
    }
    // The merged infantry carries both a blade and a shield.
    if(unit.type==='bladeShield') {c.strokeStyle='#eee6c8';c.lineWidth=1.8;c.beginPath();c.moveTo(-dir*3,1);c.lineTo(-dir*7,-8);c.stroke();c.strokeStyle='#c7ae70';c.lineWidth=1;c.beginPath();c.moveTo(-dir*1,-1);c.lineTo(-dir*5,1);c.stroke();}
    if(braced){c.strokeStyle='#dafaff';c.lineWidth=2;c.beginPath();c.arc(0,-2,9,(unit.blockFacing??0)-.8,(unit.blockFacing??0)+.8);c.stroke();}
    if((unit.shield||unit.shieldHp||0)>0) {c.strokeStyle='#b1deeb';c.lineWidth=1;c.fillStyle='#c8edff11';c.beginPath();c.ellipse(0,-2,unit.type==='cavalry'?12:8,11,0,0,Math.PI*2);c.fill();c.stroke();}
    c.restore();
    const isCommander=unit.type==='commander', damaged=unit.hp<unit.maxHp*.99;
    if(damaged||isCommander) {
      const w=isCommander?Math.max(22,size*2.8):size*1.2,h=isCommander?(this.unitScale>1?4:3):2,y=p.y-size*(isCommander?(unit.combatStats?.speed>0?2.65:2.2):1.25);
      c.fillStyle='#172e25bb';c.fillRect(p.x-w/2-1,y-1,w+2,h+2);c.fillStyle=friendly(unit)?'#a1d3b5':'#e4a580';c.fillRect(p.x-w/2,y,w*clamp(unit.hp/unit.maxHp,0,1),h);
      if(isCommander) {c.fillStyle='#869fcb';c.fillRect(p.x-w/2,y+h+2,w*clamp((unit.mana||0)/(unit.manaMax||100),0,1),1.5);}
    }
    if(isCommander && !setup && unit.hp/unit.maxHp<.35) {c.strokeStyle=`rgba(231,178,115,${.3+Math.sin(time*6)*.2})`;c.lineWidth=1.3;c.beginPath();c.ellipse(p.x,p.y+3,size*1.6,size*.85,0,0,Math.PI*2);c.stroke();}
  }

  // Presentation scale only: battle coordinates, reach and collision stay in
  // the simulation. Legacy desktop renderers keep the original scale.
  unitSize(unit) {
    return clamp(this.scale*.48,5.3,15)*(this.unitScale||1)*(unit.type==='commander'?(this.commanderScale||1):1);
  }

  drawCommander(unit,time,pal,dir) {
    const c=this.ctx;
    c.strokeStyle='#54452e';c.lineWidth=1.5;c.beginPath();c.moveTo(-dir*7,5);c.lineTo(-dir*7,-23);c.stroke();
    c.fillStyle=pal.flag;c.beginPath();c.moveTo(-dir*7,-22);c.lineTo(-dir*18,-21+Math.sin(time*3)*.6);c.lineTo(-dir*16,-15);c.lineTo(-dir*7,-16);c.closePath();c.fill();
    c.fillStyle=pal.dark;c.font='6px serif';c.textAlign='center';c.fillText('帅',-dir*11.5,-17.2);
    c.fillStyle=pal.dark;c.beginPath();c.moveTo(-4,-7);c.lineTo(4,-7);c.lineTo(8,6);c.lineTo(-8,6);c.closePath();c.fill();
    c.fillStyle=pal.main;c.fillRect(-4,-7,8,10);c.strokeStyle=pal.trim;c.lineWidth=1;c.strokeRect(-4,-7,8,10);c.fillStyle=pal.trim;c.fillRect(-4,-1,8,1.6);
    c.fillStyle='#d9c6a0';c.beginPath();c.arc(0,-10,3,0,Math.PI*2);c.fill();c.fillStyle=pal.dark;c.beginPath();c.arc(0,-11,4,Math.PI,Math.PI*2);c.lineTo(4,-9);c.lineTo(-4,-9);c.fill();c.fillStyle='#d7c791';c.fillRect(-1,-17,2,5);
    c.strokeStyle='#e0dfc4';c.lineWidth=1.8;c.beginPath();c.moveTo(dir*4,-3);c.lineTo(dir*9,-10);c.stroke();c.strokeStyle=pal.trim;c.beginPath();c.moveTo(dir*3,-5);c.lineTo(dir*7,-2);c.stroke();
  }

  drawHorse(unit,time,pal,dir,rider=true) {
    const c=this.ctx;const brown=friendly(unit)?'#6c5740':'#645344';
    c.fillStyle='#273d2833';c.beginPath();c.ellipse(0,4,10,3.5,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#423d2e';c.lineWidth=2;c.beginPath();c.moveTo(-5,2);c.lineTo(-6,7);c.moveTo(5,2);c.lineTo(6,7);c.stroke();
    c.fillStyle=brown;c.beginPath();c.ellipse(0,0,9,4.5,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(dir*5,-1);c.lineTo(dir*7,-9);c.lineTo(dir*11,-8);c.lineTo(dir*12,-4);c.lineTo(dir*8,-1);c.fill();
    c.fillStyle='#423d2e';c.beginPath();c.moveTo(dir*7,-9);c.lineTo(dir*6,-4);c.lineTo(dir*4,-4);c.lineTo(dir*5,-9);c.fill();c.fillRect(dir*8,-11,1,3);
    if(!rider)return;
    c.fillStyle=pal.dark;c.fillRect(-4,-3,7,6);c.fillStyle=pal.main;c.fillRect(-3,-7,6,7);c.fillStyle=pal.light;c.fillRect(-3,-7,6,1.2);c.fillStyle='#d5bd94';c.beginPath();c.arc(0,-9,2.4,0,Math.PI*2);c.fill();c.fillStyle=pal.dark;c.beginPath();c.arc(0,-10,3,Math.PI,Math.PI*2);c.lineTo(3,-8);c.lineTo(-3,-8);c.fill();
    c.strokeStyle='#e0d6ac';c.lineWidth=1.2;c.beginPath();c.moveTo(dir*1,-5);c.lineTo(dir*13,-11);c.stroke();
  }

  drawSquadLabels(units, ui) {
    const groups=new Map();
    for(const unit of units) { const id=unit.squadId||unit.squad||(unit.type==='commander'?unit.id:null); if(!id) continue; if(!groups.has(id))groups.set(id,[]);groups.get(id).push(unit); }
    for(const [id,list] of groups) {
      const first=list[0],x=list.reduce((s,u)=>s+u.x,0)/list.length,y=Math.max(...list.map(u=>u.y))+.6,p=this.point(x,y);
      const selected=ui.selectedId===id||ui.selectedId===first.id;
      const guards=list.filter(u=>u.guard).length;
      const number=ui.squadNumbers?.[id];
      const text=first.type==='commander'?'主将':`${number?number+'队 · ':''}${TYPES[first.type]||first.type} · ${list.length}${guards?' / 守':''}`;
      const c=this.ctx,fs=clamp(this.scale*.32,number?10:7,11);c.font=`${fs}px sans-serif`;const w=c.measureText(text).width+10;
      if(first.type!=='commander')(this.squadLabelHits??=[]).push({id,friendly:friendly(first),x:p.x-w/2,y:p.y,w,h:fs+5});
      c.fillStyle=selected?'#394b2ed9':friendly(first)?'#214c40c9':'#623f32c9';c.fillRect(p.x-w/2,p.y,w,fs+5);c.fillStyle=selected?'#f1dda4':friendly(first)?'#c0dbc0':'#efd0aa';c.textAlign='center';c.fillText(text,p.x,p.y+fs+1);
      if(selected){c.strokeStyle='#dfc57d';c.lineWidth=.8;c.strokeRect(p.x-w/2-.5,p.y-.5,w+1,fs+6);}
    }
  }

  drawGhost(point, ui) {
    const c=this.ctx,p=this.point(point.x,point.y),r=this.scale*.5;
    c.strokeStyle='#f0d793b0';c.fillStyle='#eee0a722';c.lineWidth=1;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(p.x-r-3,p.y);c.lineTo(p.x+r+3,p.y);c.moveTo(p.x,p.y-r-3);c.lineTo(p.x,p.y+r+3);c.stroke();
  }

  readDamage(units,time) {
    for(const u of units) {
      const prev=this.previous.get(u.id);
      if(prev&&u.hp<prev.hp&&living(u)) this.visualHits.push({x:u.x,y:u.y,time,type:'hit',commander:u.type==='commander'});
      if(prev&&prev.hp>0&&!living(u)) this.deaths.push({x:u.x,y:u.y,time,team:u.team??u.side,type:u.type,id:u.id});
      this.previous.set(u.id,{hp:u.hp,x:u.x,y:u.y});
    }
    this.visualHits=this.visualHits.filter(h=>time-h.time<.5);
  }

  drawCorpse(unit,time) {
    const c=this.ctx,p=this.point(unit.x,unit.y),age=time-unit.time,size=clamp(this.scale*.35,3,9);
    c.save();c.globalAlpha=Math.max(.13,.34-age*.014);c.translate(p.x,p.y);c.rotate(hash(String(unit.id).length)*3);c.fillStyle=friendly(unit)?'#254e45':'#683d32';c.beginPath();c.ellipse(0,0,size*.9,size*.5,0,0,Math.PI*2);c.fill();c.strokeStyle='#d1c99c';c.lineWidth=.8;c.beginPath();c.moveTo(-size,-size*.5);c.lineTo(size,size*.5);c.stroke();c.restore();
  }

  drawHitEffects(time) {
    const c=this.ctx;
    for(const hit of this.visualHits) {
      const age=(time-hit.time)/.5,p=this.point(hit.x,hit.y),r=(.15+age*.4)*this.scale;
      c.globalAlpha=(1-age)*.75;c.strokeStyle=hit.commander?'#f6db91':'#f0e5b7';c.lineWidth=1.2;c.beginPath();c.moveTo(p.x-r,p.y-r);c.lineTo(p.x+r,p.y+r);c.moveTo(p.x+r,p.y-r);c.lineTo(p.x-r,p.y+r);c.stroke();
    }c.globalAlpha=1;
  }

  drawProjectiles(projectiles,time) {
    const c=this.ctx;c.lineWidth=1;
    for(const p of projectiles) {
      if(p.x==null||p.y==null)continue;const a=this.point(p.x,p.y),dx=p.vx||1,dy=p.vy||0,l=Math.hypot(dx,dy)||1;
      c.strokeStyle='#f2dfaa';c.beginPath();c.moveTo(a.x-dx/l*6,a.y-dy/l*6);c.lineTo(a.x,a.y);c.stroke();c.fillStyle='#fff1bf';c.beginPath();c.arc(a.x,a.y,1,0,Math.PI*2);c.fill();
    }
  }

  drawEffects(effects,time) {
    const c=this.ctx;
    for(const effect of effects) {
      const duration=effect.duration||(effect.type==='shield'?1.2:effect.type==='block'?.12:effect.type==='arrow'?.23:.15);
      const age=effect.ttl!=null?duration-effect.ttl:time-(effect.time??effect.startTime??time);if(age<0||age>duration)continue;
      if(['shield','cast','shieldCast'].includes(effect.type)) {
        const p=this.point(effect.x,effect.y),t=age/duration,r=(effect.radius||2.4)*this.scale;
        c.strokeStyle=`rgba(195,229,234,${(1-t)*.7})`;c.fillStyle=`rgba(185,230,230,${(1-t)*.08})`;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,r*(.6+t*.4),0,Math.PI*2);c.fill();c.stroke();
      } else if(effect.type==='arrow'||effect.type==='attack'||effect.type==='hit') {
        const from=this.point(effect.x,effect.y),to=this.point(effect.tx??effect.targetX??effect.x,effect.ty??effect.targetY??effect.y);
        const t=clamp(age/duration,0,1),dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx);
        const isArrow=effect.type==='arrow',isHero=effect.attackerType==='commander',isBlade=['bladeShield','sword'].includes(effect.attackerType);
        const color=isHero?'#ffdb72':friendly(effect)?'#d1ffe7':'#ffc6a6';
        c.save();c.lineCap='round';c.globalAlpha=1-t;
        if(isArrow){
          // Hits resolve instantly. Show the impact and a fading full tracer
          // together, rather than flying an arrow after the victim is hurt.
          const nx=dx/len,ny=dy/len;
          c.globalAlpha=(1-t)*.45;c.strokeStyle='#fff0bb';c.lineWidth=1;
          c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);c.stroke();
          c.globalAlpha=1-t;c.strokeStyle='#344536';c.lineWidth=3.4;
          c.beginPath();c.moveTo(to.x-nx*10,to.y-ny*10);c.lineTo(to.x,to.y);c.stroke();
          c.strokeStyle='#fff0bb';c.lineWidth=1.5;c.stroke();
          c.fillStyle='#fff8db';c.beginPath();c.moveTo(to.x+nx*2,to.y+ny*2);c.lineTo(to.x-nx*4-ny*2.5,to.y-ny*4+nx*2.5);c.lineTo(to.x-nx*4+ny*2.5,to.y-ny*4-nx*2.5);c.closePath();c.fill();
        } else if(isHero||isBlade){
          const r=Math.max(isHero?14:10,len),spread=isHero?.9:.7;
          const finish=angle+spread*t,start=angle-spread+spread*t;
          c.fillStyle=color;c.globalAlpha=(1-t)*.18;
          c.beginPath();c.moveTo(from.x,from.y);c.arc(from.x,from.y,r,start,finish);c.closePath();c.fill();
          c.globalAlpha=(1-t)*.95;c.strokeStyle='#364732';c.lineWidth=isHero?7:5;
          c.beginPath();c.arc(from.x,from.y,r,start,finish);c.stroke();
          c.strokeStyle=color;c.lineWidth=isHero?4:2.6;c.stroke();
          c.strokeStyle='#fff9da';c.lineWidth=1;c.stroke();
          c.translate(to.x,to.y);c.rotate(angle+.7);c.strokeStyle=color;c.lineWidth=isHero?2.5:1.5;
          c.beginPath();c.moveTo(0,isHero?-9:-5);c.lineTo(0,isHero?9:5);c.stroke();
        } else {
          c.strokeStyle=color;c.lineWidth=1.8;c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);c.stroke();
        }
        c.restore();
      } else if(effect.type==='block') {
        const p=this.point(effect.x,effect.y),t=clamp(age/duration,0,1),r=Math.max(7,this.scale*.35);
        c.save();c.translate(p.x,p.y);c.rotate(effect.angle||0);c.globalAlpha=1-t;
        c.strokeStyle='#2b4a49';c.lineWidth=5;c.beginPath();c.arc(0,0,r,-.85,.85);c.stroke();
        c.strokeStyle='#d8faff';c.lineWidth=2.5;c.stroke();
        c.strokeStyle='#fff3b7';c.lineWidth=1.5;
        for(const offset of [-.7,0,.7]){c.beginPath();c.moveTo(Math.cos(offset)*(r+2),Math.sin(offset)*(r+2));c.lineTo(Math.cos(offset)*(r+5+5*t),Math.sin(offset)*(r+5+5*t));c.stroke();}
        c.restore();
      } else if(effect.type==='impact') {
        const p=this.point(effect.x,effect.y),t=clamp(age/duration,0,1),r=(effect.attackerType==='commander'?7:4)*(1+t);
        c.save();c.globalAlpha=1-t;c.strokeStyle=effect.attackerType==='commander'?'#ffe189':'#fff2cd';c.lineWidth=1.5;
        c.beginPath();c.moveTo(p.x-r,p.y-r);c.lineTo(p.x+r,p.y+r);c.moveTo(p.x+r,p.y-r);c.lineTo(p.x-r,p.y+r);c.stroke();c.restore();
      }
    }
  }
}



module.exports={BattleRenderer};

},
"src/onboarding.js":function(require,module,exports){
const C = require('../engine/campaign.js');
const E = require('../engine/engine.js');
const J = require('../engine/journey.js');

const enemy = (type, count) => [
  ...Array.from({length: 5}, (_, i) => ({id: `drill-${i}`, type, count, x: 20, y: 3 + i * 3})),
  {id: 'drill-general', type: 'commander', count: 1, x: 25, y: 9}
];
const LESSONS = [
  {id: 'victory', name: '擒贼先擒王', short: '认识胜负', icon: '帅',
    lines: ['击败敌方主将，就能赢下战斗。', '这一战先观察，不需要操作士兵。'],
    config: {heroId: 'liubei', troops: ['bladeShield', 'spear', 'bladeShield', 'spear', 'bladeShield'], preset: 'balanced'},
    enemy: enemy('bladeShield', 3), heroId: 'liubei',
    takeaway: ['斩将即可获胜，不必清空所有士兵。', '主将与士兵自动交战，满蓝自动施法。']},
  {id: 'counter', name: '以枪止骑', short: '亲手换兵', icon: '枪',
    lines: ['敌人全是骑兵，刀盾会吃亏。', '换两队长枪，试试克制的力量。'],
    config: {heroId: 'liubei', troops: Array(5).fill('bladeShield'), preset: 'balanced'},
    enemy: enemy('cavalry', 5), heroId: 'liubei',
    takeaway: ['同样三十兵，换兵就能改变战局。', '长枪拦骑兵；刀盾挡箭；弓兵怕近身。']},
  {id: 'formation', name: '将兵成阵', short: '换将与布阵', icon: '阵',
    lines: ['借来黄忠与弓兵，练一场护弓战。', '选对主将，再让前排护住弓阵。'],
    config: {heroId: 'liubei', troops: ['bladeShield', 'bladeShield', 'archer', 'archer', 'archer'], preset: 'balanced'},
    enemy: enemy('spear', 6), heroId: 'liubei',
    takeaway: ['黄忠增强弓兵，盾墙把前后排收拢。', '借用的将与阵，会在主线中正式解锁。']}
];

const HELP = {
  map: {name: '出征', icon: '旗', lines: ['胜利解锁新将、兵种和阵型。', '先看敌军，再决定自己的搭配。'], extra: ['第一章逐关推进，后续章节有可选路线。', '失败不扣兵力，可以立刻调整再战。']},
  prepare: {name: '排兵布阵', icon: '阵', lines: ['点编号编队换兵，点主将换人。', '换阵型调整站位，准备好再出战。'], extra: ['每军一名主将，五队士兵，每队六人。', '只换兵种不会移动原来的编队。']},
  heroes: {name: '武将与技能', icon: '将', lines: ['升级统帅，提升属性并获得技能点。', '点亮节点强化武将；重配免费。'], extra: ['统帅等级共享，三名武将分别加点。', '蓝条蓄满后自动施法，不需要手动点技能。']},
  barracks: {name: '兵营训练', icon: '兵', lines: ['军功用于训练兵种，增强生命与伤害。', '训练对所有编队中的同类士兵生效。'], extra: ['每级生命、伤害 +6%，不会增加人数。', '换路线时可以退还训练军功，重新分配。']},
  missions: {name: '支线与补给', icon: '粮', lines: ['卡关时可以先剿匪、守营赚军功。', '没有全胜，也能按完成度领取奖励。'], extra: ['每项支线每日最多 3 军功，按最佳成绩补差额。', '营地每 20 分钟积存 1 军功，最多积存 12。']},
  relay: {name: '三军接力', icon: '叁', lines: ['三支军队依次出战，胜军带伤迎战。', '先军即使败了，也能为后军消耗敌人。'], extra: ['残兵、生命与蓝量保留到下一次接战。', '先排好三军，再调整出场顺序。']}
};

function clean(raw, returning) {
  const x = raw && typeof raw === 'object' ? raw : {};
  const passed = [];
  for (const l of LESSONS) {if (x.passed?.includes(l.id)) passed.push(l.id); else break;}
  const status = ['new', 'learning', 'camp', 'done', 'skipped'].includes(x.status) ? x.status : returning ? 'skipped' : 'new';
  const seen = Object.fromEntries(Object.entries(x.seen || {}).filter(([k, v]) => typeof k === 'string' && k.length < 80 && v === true));
  return {status, passed, rewarded: passed.length === 3 && x.rewarded === true,
    camp: {troop: x.camp?.troop === true, hero: x.camp?.hero === true, talent: x.camp?.talent === true}, seen};
}
function createRun(index, config) {
  const lesson = LESSONS[index], c = C.sanitizeCampaignConfig(config || lesson.config);
  const battle = E.createLabBattle({blue: c.formation, red: lesson.enemy, scenarioId: `academy-${lesson.id}`,
    aiMode: 'roles', combatVersion: E.CAMPAIGN_COMBAT_VERSION, heroes: {blue: c.heroId, red: lesson.heroId}});
  battle.status = 'running';
  return {mode: 'academy', lesson: index, levelId: lesson.id, battle, mission: null, settled: false};
}
function settle(p, run) {
  const g = p.guide, won = run.battle.status === 'won', id = LESSONS[run.lesson].id;
  if (won && !g.passed.includes(id) && g.passed.length === run.lesson) g.passed.push(id);
  let reward = 0;
  if (g.passed.length === 3 && !g.rewarded) {reward = 9; p.reserve += reward; g.rewarded = true;}
  if (won && run.lesson === 2 && g.status !== 'done') g.status = 'camp';
  return {won, reward, first: reward > 0, unlocked: [], time: run.battle.time, rounds: 1, lesson: run.lesson};
}
function tools(a) {
  return a.lesson === 2 ? {heroes: ['liubei', 'huangzhong'], troops: ['bladeShield', 'spear', 'archer'], formations: ['balanced', 'shieldWall']} :
    {heroes: ['liubei'], troops: ['bladeShield', 'spear'], formations: ['balanced']};
}
function info(id, title, lines, rect, label = '明白了') {return {id, title, lines, rect, label, action: 'guide:ack'};}
function action(id, title, lines, target) {return {id, title, lines, target};}

// Derive each instruction from real state, so closing/reopening a picker or
// resuming an interrupted lesson cannot advance a task that was never performed.
function coach(a) {
  if(a.flow === 'expedition' && a.mode !== 'academy') return null;
  const p = a.p, g = p.guide, seen = g.seen;
  if (a.sheet?.type === 'help' || a.screen === 'welcome' || a.screen === 'academy' || a.screen === 'manual') return null;
  if (a.mode === 'academy') {
    const l = LESSONS[a.lesson], c = a.practiceConfig;
    if (a.screen === 'prepare') {
      const id = `lesson-${l.id}`;
      if (!seen[id]) return info(id, l.name, l.lines, {x: 200, y: 168, w: 170, h: 270}, '开始练习');
      if (a.lesson === 1) {
        const slot = [0, 4].find(i => c.troops[i] !== 'spear');
        if (slot !== undefined) {
          if (a.sheet?.type === 'troop') return action('counter-pick', '长枪迎敌', ['长枪对骑兵有优势。', '点长枪，替换这队刀盾。'], 'troop:spear');
          return action('counter-slot', slot === 0 ? '先换上路这一队' : '再守住下路', ['点亮起的编队，换成长枪。', '队伍编号与站位不会改变。'], `slot:c-slot-${slot + 1}`);
        }
      }
      if (a.lesson === 2) {
        if (c.heroId !== 'huangzhong') return a.sheet?.type === 'hero' ?
          action('hero-pick', '黄忠统领弓阵', ['黄忠让弓兵伤害提升 20%。', '主将要与带领的士兵配合。'], 'pickhero:huangzhong') :
          action('hero-open', '先换一位主将', ['这里借用黄忠，不消耗你的资源。', '点「换将」，让他带领弓兵。'], 'edit:hero');
        if (c.preset !== 'shieldWall') return a.sheet?.type === 'formation' ?
          action('form-pick', '盾墙护弓', ['前排收紧，弓兵集中在后。', '点盾墙阵，观察站位变化。'], 'form:shieldWall') :
          action('form-open', '再选阵型', ['阵型会改变接敌顺序。', '让刀盾站到弓兵前面。'], 'edit:formation');
      }
      return action('academy-start', '准备就绪', [a.lesson === 0 ? '士兵和主将都会主动寻找敌人。' : '保持兵力不变，看看调整后的结果。', '点击出战，战斗会自动进行。'], 'start');
    }
    if (a.screen === 'battle' && a.run.battle.status === 'running') {
      if (a.lesson === 0 && !seen['battle-goal']) return {...info('battle-goal', '盯住敌方主将', ['上方是主将生命与蓝量。', '击败敌将即获胜，也要保护自己的主将。'], {x: 210, y: 82, w: 157, h: 62}, '开始观战'), freeze: true};
      if (a.lesson === 0 && !seen['battle-skill'] && a.run.battle.events.some(e => e.type === 'skill' && e.side === 'blue')) return {...info('battle-skill', '满蓝，自动施法', ['刘备刚刚为附近士兵回血、加盾。', '无需操作，技能会随蓝量循环释放。'], {x: 20, y: 82, w: 160, h: 62}, '继续观战'), freeze: true};
    }
    return null;
  }
  if (g.status === 'camp' && ['camp', 'heroes', 'barracks'].includes(a.screen)) {
    const cost = !g.camp.troop ? 4 : !g.camp.hero ? 5 : 0;
    if (cost > J.earnedMerit(p.journey) + p.reserve - J.trainingCost(p.journey.training))
      return {...info('camp-funds', '先去获得一些军功', ['军功已用于其他训练，不必重置。', '先出征或领取补给，回营后可继续学习。'], null, '先去出征'), action: 'guide:defer'};
    if (!g.camp.troop) {
      if (a.screen !== 'barracks') return action('camp-barracks', '把战功变成战力', ['演武首通获得 9 军功。', '先去兵营，训练刚刚用过的长枪。'], 'nav:barracks');
      return action('camp-train', '训练一次长枪兵', ['花费 4 军功，生命与伤害 +6%。', '所有长枪编队都会受益。'], 'train:spear');
    }
    if (!g.camp.hero) {
      if (a.screen !== 'heroes') return action('camp-heroes', '再培养统帅', ['剩余军功可以用于统帅升级。', '点武将，看看另一种成长。'], 'nav:heroes');
      return action('camp-upgrade', '统帅升到 2 级', ['花费 5 军功，提升属性并增加技能点。', '统帅等级由所有已招募武将共享。'], 'train:hero');
    }
    if (!g.camp.talent) {
      if (a.screen !== 'heroes') return action('camp-tree', '还有技能点可用', ['技能点由升级与主线进度获得。', '去武将页，完成第一次加点。'], 'nav:heroes');
      if (a.hero !== 'liubei') return action('camp-liubei', '先培养刘备', ['每位武将都有独立的技能树。', '先选已经招募的刘备。'], 'hero:liubei');
      if (a.sheet?.type === 'talent') return action('camp-learn', '点亮武艺', ['消耗 1 技能点，主将伤害 +8%。', '之后可以免费重配，不怕选错。'], 'learn:valor');
      return action('camp-talent', '试一次技能加点', ['点武艺节点，查看它的效果。', '之后还可以选择回蓝与统军方向。'], 'talent:valor');
    }
    return {...info('graduate', '可以独当一面了', ['出征解锁新兵种，遇到强敌先换阵。', '卡关还能做支线，或回营领取补给。'], null, '正式出征'), action: 'guide:finish'};
  }
  if (a.screen === 'prepare' && !a.sheet && ['raid', 'guard'].includes(a.mode) && !seen[`module-${a.mode}`]) {
    return a.mode === 'raid' ? info('module-raid', '剿匪：按歼敌数领奖', ['击杀 8 / 16 / 24 名士兵，逐档获军功。', '不必斩将；完成一档就有收获。'], null, '准备剿匪') :
      info('module-guard', '守营：让主将活下来', ['坚持 20 / 35 / 50 秒，逐档获军功。', '护住主将，别急着冲进敌阵。'], null, '准备守营');
  }
  const key = a.screen === 'prepare' && a.mode === 'relay' ? 'relay' : a.screen;
  if (!a.sheet && HELP[key] && !seen[`module-${key}`]) {
    const h = HELP[key];
    return info(`module-${key}`, h.name, h.lines, key === 'relay' ? {x: 20, y: 82, w: 350, h: 42} : null, '开始尝试');
  }
  if (a.screen === 'result' && !a.result.won && !seen['first-defeat']) return info('first-defeat', '失败后，有三条路', ['换兵换阵再试；去练兵提升战力；', '或做支线赚军功，失败不会扣兵。'], null, '重整旗鼓');
  return null;
}
module.exports = {LESSONS, HELP, clean, createRun, settle, tools, coach};

},
"src/expedition.js":function(require,module,exports){
// The first chapter is a continuous expedition. All encounters use the shared
// combat engine; choices change actual troops, formations or disclosed bonuses.
const E = require('../engine/engine.js');
const C = require('../engine/campaign.js');
const J = require('../engine/journey.js');
const clone = x => JSON.parse(JSON.stringify(x));
const NAMES = {bladeShield:'刀盾', spear:'长枪', archer:'弓兵', cavalry:'骑兵'};
const HERO_NAMES = {liubei:'刘备', huangzhong:'黄忠', zhaoyun:'赵云'};
const SPECIALISTS = {liubei:'bladeShield', huangzhong:'archer', zhaoyun:'cavalry'};
const PHASES = ['ready','recruit','hero','route','formation','defeat','complete'];
const ENCOUNTERS = [
  {name:'山道前哨', short:'前哨', story:'带上这十二名士兵，夺下青石关。', hint:'击败敌方主将即可获胜', troops:['spear','spear'], count:4, heroId:'liubei', preset:'balanced'},
  {name:'林间伏兵', short:'林口', story:'援军已到。带上新兵，继续向关隘推进。', hint:'刀盾在前，掩护身后的新兵', troops:['bladeShield','spear','spear'], count:3, heroId:'liubei', preset:'balanced'},
  {name:'敌骑拦路', short:'骑哨', story:'选定的主将，将带着自己的亲兵同行。', hint:'长枪克骑兵；集中兵力也能破阵', troops:['cavalry','cavalry','bladeShield'], count:5, heroId:'liubei', preset:'wings'},
  {name:'关外营垒', short:'营垒', story:'前面就是青石关，先拔掉关外的营垒。', hint:'每次交战前会补齐本次出征的部队', troops:['bladeShield','archer','spear','archer'], count:5, heroId:'huangzhong', preset:'shieldWall'},
  {name:'夺下青石关', short:'夺关', story:'最后一战。用你一路组建的军队，夺帅破关。', hint:'盾墙聚兵，鹤翼从两侧展开', troops:['bladeShield','spear','archer','archer','bladeShield'], count:5, heroId:'huangzhong', preset:'shieldWall'}
];
function fresh() {return {version:1, stage:0, phase:'ready', recruit:null, heroId:'liubei', heroPicked:false, route:null, preset:'balanced', cleared:[], losses:0, totalTime:0, lastTime:0, reward:0, adopted:false};}
function clean(raw) {
  if (!raw || raw.version !== 1) return fresh();
  const e=fresh();
  e.adopted=raw.adopted===true;
  e.recruit=['archer','spear'].includes(raw.recruit)?raw.recruit:null;
  e.heroId=HERO_NAMES[raw.heroId]?raw.heroId:'liubei'; e.heroPicked=raw.heroPicked===true;
  e.route=['reinforce','forge'].includes(raw.route)?raw.route:null;
  e.preset=['balanced','shieldWall','wings'].includes(raw.preset)?raw.preset:'balanced';
  const count=Math.max(0,Math.min(5,Math.floor(Number(raw.cleared?.length)||0)));
  e.cleared=Array.from({length:count},(_,i)=>i);
  e.stage=Math.min(4,count); e.phase=count===5?'complete':PHASES.includes(raw.phase)&&raw.phase!=='complete'?raw.phase:'ready';
  // Recover a closed tab at any reward boundary without skipping a choice.
  if(count>0&&!e.recruit){e.stage=1;e.cleared=[0];e.phase='recruit';}
  else if(count>1&&!e.heroPicked){e.stage=2;e.cleared=[0,1];e.phase='hero';}
  else if(count>2&&!e.route){e.stage=3;e.cleared=[0,1,2];e.phase='route';}
  else if(count===4&&e.preset==='balanced')e.phase='formation';
  else if(count<4&&['recruit','hero','route','formation'].includes(e.phase))e.phase='ready';
  for(const key of ['losses','totalTime','lastTime','reward'])e[key]=Math.max(0,Math.min(100000,Number(raw[key])||0));
  return e;
}
function troopList(e) {
  const list=['bladeShield','bladeShield'];
  if(e.recruit)list.push(e.recruit);
  if(e.heroPicked)list.push(SPECIALISTS[e.heroId]);
  if(e.route==='reinforce')list.push(SPECIALISTS[e.heroId]);
  return list;
}
function roster(troops,preset='balanced',count=6) {
  const filled=[...troops];while(filled.length<5)filled.push('bladeShield');
  return C.formationFor(preset,filled).filter(s=>s.type==='commander'||C.PLAYER_SLOTS.findIndex(p=>p.id===s.id)<troops.length).map(s=>({...s,count:s.type==='commander'?1:count}));
}
const enemy=e=>E.mirrorFormation(roster(ENCOUNTERS[e.stage].troops,ENCOUNTERS[e.stage].preset,ENCOUNTERS[e.stage].count),'exp-enemy');
function options(e) {
  if(e.phase==='recruit')return [
    {id:'archer',name:'弓兵',tag:'后排输出',detail:'招募 6 名弓兵',type:'archer'},
    {id:'spear',name:'长枪',tag:'拦截骑兵',detail:'招募 6 名长枪兵',type:'spear'}];
  if(e.phase==='hero')return [
    {id:'liubei',name:'刘备',tag:'护阵回血',detail:'刀盾与枪兵生命 +15%',type:'bladeShield'},
    {id:'huangzhong',name:'黄忠',tag:'弓阵齐射',detail:'弓兵伤害 +20%',type:'archer'},
    {id:'zhaoyun',name:'赵云',tag:'骑兵突击',detail:'骑兵伤害 +15% · 移速 +25%',type:'cavalry'}];
  if(e.phase==='route')return [
    {id:'reinforce',name:'义军营',tag:'增加兵力',detail:`再招 6 名${NAMES[SPECIALISTS[e.heroId]]}`,type:SPECIALISTS[e.heroId]},
    {id:'forge',name:'军械营',tag:'强化现有部队',detail:'士兵生命 +25% · 伤害 +20%',type:'bladeShield'}];
  if(e.phase==='formation'||e.phase==='defeat')return [
    {id:'shieldWall',name:'盾墙阵',tag:'前排护住后排',detail:'收拢队伍，集中迎敌',type:'bladeShield'},
    {id:'wings',name:'鹤翼阵',tag:'两翼展开',detail:'拉开两侧，分兵进攻',type:'cavalry'}];
  return [];
}
function choose(e,id) {
  if(!options(e).some(o=>o.id===id))return false;
  if(e.phase==='recruit')e.recruit=id;
  else if(e.phase==='hero'){e.heroId=id;e.heroPicked=true;}
  else if(e.phase==='route')e.route=id;
  else e.preset=id;
  e.phase='ready'; return true;
}
function preview(e,id) {const copy=clone(e);if(id)choose(copy,id);return copy;}
function createRun(e) {
  const l=ENCOUNTERS[e.stage];
  const battle=E.createLabBattle({blue:roster(troopList(e),e.preset),red:enemy(e),scenarioId:`expedition-${e.stage}`,aiMode:'roles',combatVersion:E.CAMPAIGN_COMBAT_VERSION,heroes:{blue:e.heroId,red:l.heroId}});
  if(e.route==='forge')for(const u of battle.units.filter(u=>u.side==='blue'&&u.type!=='commander')){
    u.baseHp*=1.25;u.hp*=1.25;u.maxHp*=1.25;u.damageMultiplier=(u.damageMultiplier||1)*1.2;
  }
  battle.status='running';
  return {mode:'expedition',stage:e.stage,levelId:`expedition-${e.stage}`,battle,mission:null,settled:false};
}
function settle(p,run) {
  const e=p.expedition,won=run.battle.status==='won';
  e.lastTime=run.battle.time;
  if(!won){e.losses++;e.phase='defeat';}
  else if(run.stage===e.cleared.length){
    e.cleared.push(run.stage);e.totalTime+=run.battle.time;
    e.stage=Math.min(4,run.stage+1);e.phase=['recruit','hero','route','formation','complete'][run.stage];
  }
  let reward=0;
  if(e.phase==='complete'&&won){
    // This expedition replaces the introductory chapter for new players. Award
    // only missing first clears; never farm replay rewards or overwrite veterans.
    const hadChapter=Boolean(p.journey.wins[J.CHAPTERS[0].levels[4]]);
    e.adopted=!hadChapter;
    for(const id of J.CHAPTERS[0].levels)if(!p.journey.wins[id]){p.journey.wins[id]=1;reward+=J.firstReward(id);}
    if(!hadChapter){
      const troops=troopList(e);while(troops.length<5)troops.push(SPECIALISTS[e.heroId]);
      p.journey.config=J.cleanConfig({heroId:e.heroId,troops,preset:e.preset},p.journey);
      p.journey.levelId=J.nextLevel(p.journey,J.CHAPTERS[0].levels[4]);
    }
    e.reward=reward;p.guide.status='done';
  }
  return {won,reward,unlocked:[],time:run.battle.time,rounds:1,cleared:e.cleared.length};
}
module.exports={NAMES,HERO_NAMES,SPECIALISTS,ENCOUNTERS,fresh,clean,troopList,roster,enemy,options,choose,preview,createRun,settle};

},
"src/core.js":function(require,module,exports){
const J=require('../engine/journey.js');
const M=require('../engine/missions.js');
const C=require('../engine/campaign.js');
const E=require('../engine/engine.js');
const H=require('../engine/heroes.js');
const O=require('./onboarding.js');
const X=require('./expedition.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const KEY='commander-camp-v3';
const HERO_IDS=H.HEROES.map(h=>h.id);
const TALENTS=[
 {id:'valor',name:'武艺',detail:'主将伤害 +8%',max:2,x:112,y:334},
 {id:'wisdom',name:'韬略',detail:'回蓝速度 +12%',max:2,x:278,y:334},
 {id:'command',name:'统军',detail:'专属兵种伤害 +4%',max:2,parent:'valor',need:1,x:112,y:448},
 {id:'march',name:'疾行',detail:'专属兵种移速 +4%',max:2,parent:'wisdom',need:1,x:278,y:448},
 {id:'vigor',name:'坚毅',detail:'主将生命 +8%',max:1,parent:'command',need:2,x:112,y:562},
 {id:'initiative',name:'先机',detail:'开战获得 20 蓝量',max:1,parent:'march',need:2,x:278,y:562}
];
const int=(n,min,max)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Math.floor(Number(n)))):min;
function points(p){return Math.min(10,1+Math.floor(J.completedOf(p.journey).length/3)+p.journey.training.heroLevel-1);}
function spent(tree){return TALENTS.reduce((n,t)=>n+(tree?.[t.id]||0),0);}
function clean(input={},legacy=null,now=Date.now()){
 const raw=input&&typeof input==='object'?input:{};
 const journey=J.sanitizeProfile(raw.journey||legacy||{});
 // Camp income is a separate local ledger. Journey's legacy sanitizer only
 // understands campaign merit, so validate training against the combined budget.
 const reserve=int(raw.reserve,0,1000000),training=J.cleanTraining(raw.journey?.training||journey.training,journey);
 if(J.trainingCost(training)<=J.earnedMerit(journey)+reserve)journey.training=training;
 const p={schema:3,journey,reserve,lastClaim:Number.isFinite(raw.lastClaim)?int(raw.lastClaim,now-86400000,now):now,talents:{},armies:[],sound:raw.sound!==false,guide:O.clean(raw.guide,Boolean(raw.journey||legacy))};
 for(const hero of HERO_IDS){const tree={};for(const t of TALENTS){tree[t.id]=int(raw.talents?.[hero]?.[t.id],0,t.max);if(t.parent&&(tree[t.parent]||0)<t.need)tree[t.id]=0;}p.talents[hero]=spent(tree)<=points(p)?tree:{};}
 p.expedition=X.clean(raw.expedition);
 p.armies=M.cleanArmies(raw.armies,p.journey);return p;
}
const money=p=>J.earnedMerit(p.journey)+p.reserve-J.trainingCost(p.journey.training);
const supply=(p,now=Date.now())=>Math.max(0,Math.min(12,Math.floor((now-p.lastClaim)/1200000)));
function claim(p,now=Date.now()){
 const n=supply(p,now);if(!n)return 0;p.reserve+=n;
 p.lastClaim=now-p.lastClaim>=12*1200000?now:p.lastClaim+n*1200000;return n;
}
function upgrade(p,target){
 const cap=J.capsFor(p.journey),t=clone(p.journey.training);
 if(target==='hero'){if(t.heroLevel>=cap.heroLevel)return '通关本章后提升上限';t.heroLevel++;}
 else {if(!J.unlocksFor(p.journey).troops.includes(target))return '兵种尚未解锁';if(t.troopRanks[target]>=cap.troopRank)return '通关后续章节提升上限';t.troopRanks[target]++;}
 const cost=J.trainingCost(t)-J.trainingCost(p.journey.training);if(cost>money(p))return '军功不足，去支线或领取营地产出';
 p.journey.training=t;return null;
}
function learn(p,hero,id){
 const t=TALENTS.find(t=>t.id===id);if(!t||!J.unlocksFor(p.journey).heroes.includes(hero))return '武将尚未解锁';
 const tree=p.talents[hero];if((tree[id]||0)>=t.max)return '已点满';
 if(t.parent&&(tree[t.parent]||0)<t.need)return '先学习上方节点';
 if(spent(tree)>=points(p))return '升级主将或推进主线获得技能点';
 tree[id]=(tree[id]||0)+1;return null;
}
function resetTraining(p){p.journey.training=J.cleanTraining({},p.journey);for(const hero of HERO_IDS)if(spent(p.talents[hero])>points(p))p.talents[hero]={};}
function applyTalents(b,p){
 if(b.campTalents)return;b.campTalents=true;
 const id=b.heroes.blue,t=p.talents[id]||{},c=b.units.find(u=>u.side==='blue'&&u.type==='commander');
 c.combatStats=Object.freeze({...c.combatStats,damage:c.combatStats.damage*(1+.08*(t.valor||0))});
 c.hp*=1+.08*(t.vigor||0);c.maxHp*=1+.08*(t.vigor||0);c.manaRegen*=1+.12*(t.wisdom||0);c.mana=Math.min(c.manaMax,c.mana+20*(t.initiative||0));
 const types=id==='liubei'?['bladeShield','spear']:id==='huangzhong'?['archer']:['cavalry'];
 for(const u of b.units.filter(u=>u.side==='blue'&&types.includes(u.type))){u.damageMultiplier=(u.damageMultiplier||1)*(1+.04*(t.command||0));u.speedMultiplier=(u.speedMultiplier||1)*(1+.04*(t.march||0));}
}
function start(p,mode='main',levelId=p.journey.levelId,config){
 if(mode==='expedition')return X.createRun(p.expedition);
 if(mode==='academy')return O.createRun(levelId,config);
 const training=clone(p.journey.training);let battle,mission=null;
 if(mode==='main'){
  // Apply camp training once, including training funded by offline income.
  const base=J.cleanTraining({},p.journey);const clean=clone(p.journey);clean.training=base;
  battle=J.createJourneyBattle(clean,{levelId});M.trainArmy(battle,'blue',training);battle.journey.training=training;applyTalents(battle,p);battle.status='running';
 }else{
  const base=clone(p.journey);base.training=J.cleanTraining({},base);
  mission=M.createMission(base,mode,{armies:mode==='relay'?p.armies:[p.journey.config]});mission.training=training;
  M.trainArmy(mission.battle,'blue',training);applyTalents(mission.battle,p);M.startMission(mission);battle=mission.battle;
 }
 return {mode,levelId,battle,mission,settled:false};
}
function advance(run,p){
 if(!run.mission||run.mission.status!=='between')return false;
 M.nextRound(run.mission);run.battle=run.mission.battle;
 // Apply talent bonuses before restoring carried HP ratios and mana, so a
 // survivor never receives another start-of-battle mana grant.
 applyTalents(run.battle,p);M.restoreSurvivors(run.battle,'blue',run.mission.carry.blue);
 return true;
}
function step(run,dt){if(run.mission)M.stepMission(run.mission,dt);else E.stepBattle(run.battle,dt);}
function finish(p,run){
 if(run.settled)return null;
 if(run.mission?run.mission.status!=='finished':['ready','running'].includes(run.battle.status))return null;
 run.settled=true;
 if(run.mode==='expedition')return X.settle(p,run);
 if(run.mode==='academy')return O.settle(p,run);
 const training=clone(p.journey.training),before=J.unlocksFor(p.journey);
 const out=run.mission?M.settleMission(p.journey,run.mission):J.settleBattle(p.journey,run.battle);
 p.journey=out.profile;p.journey.training=training;
 const after=J.unlocksFor(p.journey),unlocked=['heroes','troops','formations'].flatMap(k=>after[k].filter(id=>!before[k].includes(id)));
 const won=run.mission?run.mission.id==='relay'?run.mission.outcome==='won':run.mission.rewardTier===3:run.battle.status==='won';
 const summary={won,reward:out.reward,first:out.first||false,unlocked,time:run.mission?run.mission.totalTime:run.battle.time,rounds:run.mission?.rounds.length||1,cleared:J.completedOf(p.journey).length};
 if(won&&run.mode==='main')p.journey.levelId=J.nextLevel(p.journey,run.levelId);
 return summary;
}
module.exports={KEY,J,M,C,E,H,TALENTS,HERO_IDS,clone,clean,money,supply,claim,points,spent,learn,upgrade,resetTraining,applyTalents,start,advance,step,finish};

},
"src/expedition-view.js":function(require,module,exports){
const X = require('./expedition.js');
const G = require('./core.js');
const P = {ink:'#f5ebd1',muted:'#b0bcaa',gold:'#efd095',jade:'#99cfb1',red:'#efad91',panel:'#182d28'};

function poly(v,points,color) {
  const c=v.c;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function flag(v,x,y,color,label,scale=1) {
  const c=v.c;c.save();c.translate(x,y);c.scale(scale,scale);
  v.line(0,0,0,64,'#ccbc8f',2);
  const sway=Math.sin(v.a.now*1.8+x)*2;
  poly(v,[[1,1],[29,5+sway],[25,18],[29,30+sway],[1,28]],color);
  v.text(label,13,15,12,'#fff0c9','center','600');c.restore();
}
function scenery(v,stage,won=false) {
  const c=v.c;
  const sky=c.createLinearGradient(0,162,0,533);sky.addColorStop(0,'#233e35');sky.addColorStop(.48,'#6e8060');sky.addColorStop(1,'#364c36');
  c.fillStyle=sky;c.fillRect(0,162,390,371);
  v.circle(286,204,30,'#e5cc8b44');v.circle(286,204,22,'#f4dca455');
  poly(v,[[0,230],[49,184],[98,211],[154,174],[220,233],[278,183],[340,202],[390,171],[390,313],[0,313]],'#345444');
  poly(v,[[0,255],[58,220],[122,263],[173,208],[235,264],[295,225],[350,247],[390,223],[390,330],[0,330]],'#49634d');
  // A road and a distant gate remain visible throughout recruiting and fighting.
  poly(v,[[239,263],[280,263],[343,533],[82,533]],'#a3a17b35');
  if(stage>=3||won){
    v.box(224,224,113,64,'#536450',2);v.box(262,251,34,38,'#243d31',10);
    for(let i=0;i<8;i++)v.box(220+i*16,219,11,13,'#63745d',1);
    for(let row=0;row<3;row++)for(let col=0;col<5;col++)v.line(230+col*21,240+row*13,242+col*21,240+row*13,'#a4a78333');
    poly(v,[[246,223],[280,202],[313,223]],'#283f35');
    flag(v,280,207,won?'#4a8c71':'#a25c4a',won?'我':'关',.64);
  }
  for(let i=0;i<38;i++){
    const x=(i*97+13)%390,y=291+(i*43)%226;
    v.line(x,y,x+3,y-4,'#bdc19325');v.line(x+3,y,x+7,y-2,'#bdc19325');
  }
  // Frame the play space without a separate dashboard-like battlefield card.
  poly(v,[[0,435],[11,403],[27,432],[19,476],[36,533],[0,533]],'#233d30');
  poly(v,[[390,398],[377,381],[365,419],[376,467],[350,533],[390,533]],'#233d30');
  flag(v,23,280,'#487e68','军',.7);
  if(!won)flag(v,359,278,'#a26350','敌',.7);
  const fade=c.createLinearGradient(0,483,0,539);fade.addColorStop(0,'#10241c00');fade.addColorStop(1,P.panel);c.fillStyle=fade;c.fillRect(0,483,390,56);
}
function primary(v,id,label) {
  v.box(18,705,354,59,P.gold,13,'#fff0bb');
  v.text(label,195,734,18,'#25392d','center','600');
  v.text('›',348,734,26,'#596044');v.hit(id,18,705,354,59);
}
function progress(v,e) {
  const y=147;v.line(36,y,354,y,'#68826b66',2);
  X.ENCOUNTERS.forEach((l,i)=>{
    const x=39+i*78,done=e.cleared.includes(i),active=e.stage===i;
    v.circle(x,y,done||active?10:6,done?P.gold:active?'#728e6b':'#3a5144');
    if(done)v.text('✓',x,y,10,'#253c2d','center','600');
    else if(active)v.circle(x,y,4,P.gold);
    v.text(l.short,x,169,11,done||active?P.gold:'#82917d','center');
  });
}
function renderArmy(v,b,isBattle) {
  const c=v.c,alive=b.units.filter(u=>u.alive);
  if(!alive.length)return;
  const minX=Math.min(...alive.map(u=>u.x)),maxX=Math.max(...alive.map(u=>u.x));
  const minY=Math.min(...alive.map(u=>u.y)),maxY=Math.max(...alive.map(u=>u.y));
  const target=Math.min(19,298/Math.max(10,maxX-minX),198/Math.max(8,maxY-minY));
  const previous=isBattle?v.expeditionCamera:null,dt=previous?Math.max(0,b.time-previous.time):0;
  const scale=previous?Math.min(target,previous.scale+(target-previous.scale)*(1-Math.exp(-dt*1.8))):target;
  v.expeditionCamera={scale,time:b.time};
  // Keep the commander readable without turning him into a wall over the
  // troops. Soldiers are the tactical object the player needs to read first.
  Object.assign(v.r,{scale,ox:195-(minX+maxX)/2*scale,oy:399-(minY+maxY)/2*scale,unitScale:1.55,commanderScale:.82});
  c.save();c.beginPath();c.rect(5,278,380,238);c.clip();
  if(isBattle){v.r.readDamage(b.units,b.time);for(const u of v.r.deaths)v.r.drawCorpse(u,b.time);}
  const sorted=alive.slice().sort((a,b)=>a.y-b.y);
  // Draw the mounted commander first; a nearby soldier remains visible in
  // front when formations compress during an engagement.
  for(const u of sorted.filter(u=>u.type==='commander'))v.r.drawUnit(u,isBattle?b.time:v.a.now,false);
  for(const u of sorted.filter(u=>u.type!=='commander'))v.r.drawUnit(u,isBattle?b.time:v.a.now,false);
  if(isBattle){v.r.drawEffects(b.effects,b.time);v.r.drawHitEffects(b.time);}
  c.restore();
}
function armyHeader(v,b,isBattle) {
  for(const [side,x,color] of [['blue',18,P.jade],['red',218,P.red]]){
    const u=b.units.find(u=>u.side===side&&u.type==='commander');
    const count=b.units.filter(u=>u.side===side&&u.type!=='commander'&&u.alive).length;
    v.box(x,188,154,75,'#142b24e8',10);
    v.portrait(b.heroes[side],x+27,219,18,side==='red');
    v.text(`${side==='blue'?'我':'敌'}·${X.HERO_NAMES[b.heroes[side]]}`,x+55,207,14,color,'left','600');
    v.text(`${count} 兵`,x+55,230,13,P.ink);
    if(isBattle){
      v.box(x+55,244,84,4,'#3e5144',2);v.box(x+55,244,Math.max(1,84*Math.max(0,u.hp)/u.maxHp),4,color,2);
      v.box(x+55,252,84*Math.min(1,u.mana/u.manaMax),3,'#90b8d5',1);
    } else v.text('待命',x+137,231,11,P.muted,'right');
  }
  v.text('对',195,220,12,'#e3d8b9','center');
}
function draw(v) {
  const a=v.a,e=a.p.expedition,l=X.ENCOUNTERS[e.stage],isBattle=a.screen==='battle';
  const opts=X.options(e),choice=opts.find(o=>o.id===a.expeditionChoice)||opts[0];
  const selected=X.preview(e,choice?.id),key=JSON.stringify(selected);
  if(!isBattle&&v.expeditionPreviewKey!==key){v.expeditionPreviewKey=key;v.expeditionPreview=X.createRun(selected).battle;}
  const b=isBattle?a.run.battle:v.expeditionPreview;
  const c=v.c;c.fillStyle=P.panel;c.fillRect(0,0,390,780);
  v.text('夺 帅',21,30,15,P.gold,'left','600');v.text('首征 · 青石关',195,30,12,P.muted,'center');
  if(isBattle){v.text('撤回',349,30,12,P.muted,'center');v.hit('retreatAsk',321,8,57,44);}
  else {v.text('营地',349,30,12,P.muted,'center');v.hit('trip:menu',321,8,57,44);}
  const title=e.phase==='complete'?'青石关，拿下了！':isBattle?l.name:e.stage===0?'十二名士兵，一座关':l.name;
  v.text(title,195,78,27,P.ink,'center','600');
  const sub=isBattle?`自动交战 · ${Math.floor(b.time)} / 90 秒`:e.phase==='complete'?'你的第一支军队，就这样打出来了。':l.story;
  v.text(sub,195,113,12,P.muted,'center');progress(v,e);
  scenery(v,e.stage,e.phase==='complete');
  // Progress sits above the scene; re-paint labels after the mountain background.
  X.ENCOUNTERS.forEach((l,i)=>v.text(l.short,39+i*78,169,11,e.cleared.includes(i)||e.stage===i?P.gold:'#82917d','center'));
  if(e.phase==='complete'&&!isBattle){
    v.box(64,190,262,55,'#142b24e8',12);v.text('青石关易帜 · 全军入城',195,217,18,P.gold,'center','600');
    renderArmy(v,{...b,units:b.units.filter(u=>u.side==='blue')},false);
  }else{armyHeader(v,b,isBattle);renderArmy(v,b,isBattle);}
  if(e.phase==='complete'&&!isBattle){complete(v,e);return;}
  if(isBattle){
    const h=G.H.heroFor(e.heroId),skill=b.events.filter(x=>x.type==='skill'&&x.side==='blue').slice(-1)[0];
    v.text(a.paused?'暂歇片刻':'两军交锋',195,549,23,P.ink,'center','600');
    v.text(skill&&b.time-skill.time<4?`${h.name} · ${h.skill}`:`${h.name} · 满蓝自动释放「${h.skill}」`,195,585,14,P.gold,'center');
    const dead=b.units.filter(u=>!u.alive&&u.type!=='commander');
    v.text(`我军折损 ${dead.filter(u=>u.side==='blue').length}     敌军折损 ${dead.filter(u=>u.side==='red').length}`,195,628,13,P.muted,'center');
    v.text('击败敌将，即可夺取这一战',195,668,12,P.muted,'center');
    v.button('pause',a.paused?'继续战斗':'暂停',18,708,228,56,a.paused);
    v.button('speed',`${a.speed} 倍速`,258,708,114,56);
    return;
  }
  if(opts.length){
    const headings={recruit:'首战告捷 · 招募援军',hero:'有人愿意与你并肩作战',route:'岔路口 · 选一处整备',formation:'关隘在前 · 选一个阵型',defeat:'这一战，换个阵型再试'};
    v.text(headings[e.phase],195,546,20,P.ink,'center','600');
    let detail=choice.detail;
    if(e.phase==='hero')detail+=` · 带来 6 名${X.NAMES[choice.type]}`;
    if(e.phase==='route'&&choice.id==='forge')detail+='（本次出征）';
    if(e.phase==='defeat')detail='部队已补齐 · 可立即再战，不扣资源';
    v.text(detail,195,575,e.phase==='hero'||e.phase==='route'?11:13,P.muted,'center');
    const gap=10,w=(354-gap*(opts.length-1))/opts.length;
    opts.forEach((o,i)=>{
      const x=18+i*(w+gap),on=choice.id===o.id;
      v.box(x,594,w,96,on?'#365340':'#20382d',12,on?P.gold:'#465c48');
      if(e.phase==='hero')v.portrait(o.id,x+w/2,617,16);
      else if(e.phase==='formation'||e.phase==='defeat'){
        const points=o.id==='shieldWall'?[[0,0],[0,8],[0,16],[-10,4],[-10,12]]:[[-10,0],[0,5],[-5,10],[0,15],[-10,20]];
        for(const [dx,dy] of points)v.circle(x+w/2+dx+3,608+dy,2.7,P.gold);
      }else v.weapon(o.type,x+w/2,616,.9,P.gold);
      v.text(o.name,x+w/2,647,16,P.ink,'center','600');v.text(o.tag,x+w/2,674,11,P.muted,'center');
      if(on)v.text('✓',x+w-14,608,12,P.gold,'center');v.hit(`trip:pick:${o.id}`,x,594,w,96);
    });
    const labels={recruit:`招募${choice.name} · +6 兵`,hero:`${choice.name}领军 · 带上亲兵`,route:`前往${choice.name}`,formation:`采用${choice.name}`,defeat:`改用${choice.name}`};
    primary(v,'trip:confirm',labels[e.phase]);
    v.text('选择预览',195,508,11,'#dfdfbf','center');
  }else{
    const list=X.troopList(e);
    v.text(e.stage===0?'军队已集结，等你下令':'整备完成，出发吧',195,548,22,P.ink,'center','600');
    v.text(l.hint,195,579,13,P.muted,'center');
    const counts=Object.entries(list.reduce((m,t)=>(m[t]=(m[t]||0)+6,m),{}));
    const w=counts.length<=2?145:105,gap=8,start=(390-counts.length*w-(counts.length-1)*gap)/2;
    counts.forEach(([t,n],i)=>{const x=start+i*(w+gap);v.box(x,607,w,57,'#253e30',10);v.weapon(t,x+24,633,.7,P.gold);v.text(`${X.NAMES[t]} ${n}`,x+44,634,13,P.ink);});
    v.text(e.route==='forge'?'军械营：本次出征士兵生命 +25% · 伤害 +20%':`${X.HERO_NAMES[e.heroId]}统军 · ${list.length*6} 名士兵`,195,683,11,P.muted,'center');
    primary(v,'trip:start',e.stage===0?'开拔 · 攻下前哨':e.stage===4?'出战 · 夺下青石关':'出战 · '+l.short);
  }
}
function complete(v,e) {
  v.text('第一章 · 五战告捷',195,546,23,P.gold,'center','600');
  v.text(e.reward?`军功 +${e.reward}`:'此章奖励已领取',195,583,21,P.ink,'center','600');
  v.text('武将、兵营、军中委托现已开放',195,620,14,P.muted,'center');
  v.text(e.adopted?'主将与编队带回营地，兵员补满三十人。':'原有主将、编队与征途进度已保留。',195,652,12,P.muted,'center');
  v.text(e.route==='forge'?'军械营强化仅在本次出征生效':'回营后可用军功升级武将与士兵',195,678,11,'#8f9f8d','center');
  primary(v,'trip:camp','回营整备 · 下一段征途');
}
function menu(v) {
  const e=v.a.p.expedition,c=v.c;c.fillStyle='#07130fe0';c.fillRect(0,0,390,780);v.a.hits=[];
  v.box(24,250,342,292,P.panel,18,'#6d8163');v.text('行军暂歇',195,289,23,P.gold,'center','600');
  v.text('已自动保存，回来可以接着走。',195,327,14,P.muted,'center');
  v.button('close','继续出征',44,365,302,50,true);v.button('trip:camp','返回营地 · 保留原有进度',44,433,302,48);
  if(e.phase==='complete')v.text('已完成首征',195,510,12,P.muted,'center');
}
function camp(v) {
  const p=v.a.p,e=p.expedition,l=G.J.levelFor(p.journey.levelId),finished=e.phase==='complete';
  v.text('夺 帅',24,34,23,P.gold,'left','600');v.text(`军功 ${G.money(p)}`,366,34,14,P.gold,'right');
  v.text('下一程，兵锋所指。',24,80,25,P.ink,'left','600');
  v.text(finished?`已破 ${G.J.completedOf(p.journey).length} 战 · 整备后继续出征`:'青石关首征进行中 · 原有进度已保留',24,114,12,P.muted);
  scenery(v,4,true);
  for(const [x,y,s] of [[86,301,.8],[289,315,.7],[187,368,1.1]]){
    const c=v.c;c.save();c.translate(x,y);c.scale(s,s);
    c.fillStyle='#173326';c.beginPath();c.ellipse(0,23,51,11,0,0,Math.PI*2);c.fill();
    poly(v,[[-43,18],[0,-34],[43,18]],'#c4b17d');poly(v,[[0,-34],[43,18],[12,13]],'#87916b');
    v.box(-9,-2,18,23,'#344d36',1);flag(v,0,-61,'#52846b','军',.6);c.restore();
  }
  v.box(20,407,350,88,'#172f26ee',14,'#637650');v.portrait(p.journey.config.heroId,56,447,25);
  v.text(`${X.HERO_NAMES[p.journey.config.heroId]} · 统帅 ${p.journey.training.heroLevel} 级`,99,433,19,P.ink,'left','600');
  v.text(finished?'下一战 · '+l.name:'首征 · '+X.ENCOUNTERS[e.stage].name,99,464,13,P.gold);
  [['heroes','武将','升级 · 加点','将'],['barracks','兵营','强化士兵','兵'],['missions','委托','赚取军功','旗']].forEach(([id,name,sub,icon],i)=>{
    const x=20+i*119;v.box(x,524,112,110,'#253c2f',12,'#4b6149');v.text(icon,x+56,552,24,P.gold,'center','600');
    v.text(name,x+56,588,17,P.ink,'center');v.text(sub,x+56,616,11,P.muted,'center');v.hit(`nav:${id}`,x,524,112,110);
  });
  const ready=G.supply(p,v.a.clock());v.text(ready?`营地补给 +${ready} · 点击领取`:'营地补给积存中',24,668,12,P.muted);v.hit('claim',20,646,235,43);
  v.text('战图 ›',347,668,13,P.gold,'right');v.hit('go',281,646,89,43);
  primary(v,finished?'trip:continue':'trip:open',finished?'出征 · '+l.name:'继续首征 · '+X.ENCOUNTERS[e.stage].short);
}
module.exports={draw,menu,camp};

},
"src/view.js":function(require,module,exports){
const G=require('./core.js');
const O=require('./onboarding.js');
const ExpeditionView=require('./expedition-view.js');
const {BattleRenderer}=require('../engine/renderer.js');
const COLORS={bg:'#101f20',panel:'#1a3031',line:'#36504b',ink:'#f1e8ce',muted:'#98aaa0',gold:'#e2c181',green:'#9acbb0',red:'#df947f'};
const NAMES={bladeShield:'刀盾',spear:'长枪',archer:'弓兵',cavalry:'骑兵',liubei:'刘备',huangzhong:'黄忠',zhaoyun:'赵云',balanced:'均衡阵',shieldWall:'盾墙阵',spearhead:'锋矢阵',wings:'鹤翼阵'};
const ROLES={bladeShield:'挡箭 · 前排',spear:'反骑 · 拦截',archer:'远程 · 输出',cavalry:'突击 · 破盾'};
const SHORT={bladeShield:'盾',spear:'枪',archer:'弓',cavalry:'骑'};
class View{
 constructor(c,a){this.c=c;this.a=a;this.r=Object.create(BattleRenderer.prototype);Object.assign(this.r,{ctx:c,previous:new Map(),deaths:[],visualHits:[],lastTime:0,frame:0});}
 resetBattle(){this.r.reset();this.battleCamera=null;this.expeditionCamera=null;}
 guideSnapshot(){return O.coach(this.a);}
 battleViewport(units,time){
  const alive=units.filter(u=>u.alive);if(!alive.length)return;
  const xs=alive.map(u=>u.x),ys=alive.map(u=>u.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  // Keep every living soldier and both commanders in view. As the battle
  // closes, use the unused ground for a closer view without changing positions.
  const target=Math.min(21,282/Math.max(4,maxX-minX),323/Math.max(4,maxY-minY));
  const prev=this.battleCamera,dt=prev?Math.max(0,time-prev.time):0;
  const scale=prev?Math.min(target,prev.scale+(target-prev.scale)*(1-Math.exp(-dt*1.8))):target;
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  this.battleCamera={scale,time};
  Object.assign(this.r,{scale,ox:195-cx*scale,oy:394-cy*scale,unitScale:1.65,commanderScale:1.2});
 }
 commanderLabels(units){
  const labels=[];
  for(const u of units.filter(u=>u.alive&&u.type==='commander')){
   const p=this.r.point(u.x,u.y),size=this.r.unitSize(u);
   const x=Math.max(43,Math.min(347,p.x));let y=Math.max(207,p.y-size*3.25-17);
   if(labels.some(l=>Math.abs(l.x-x)<62&&Math.abs(l.y-y)<23))y-=25;
   labels.push({x,y});const color=u.side==='blue'?COLORS.green:COLORS.red;
   this.line(x,y+11,p.x,p.y-size*2.7,color);
   this.box(x-29,y-11,58,22,'#102724ed',6,color);
   this.text(`${u.side==='blue'?'我':'敌'}·${NAMES[this.a.run.battle.heroes[u.side]]}`,x,y,11,color,'center','600');
  }
 }
 welcome(){
  this.title('夺帅','你，是这支军队的新统领。');this.campArt();
  this.text('接过军旗，从第一战开始',195,437,23,COLORS.ink,'center','600');
  this.text('看清敌人，排好队伍，夺下主将。',195,478,15,COLORS.muted,'center');
  this.text('三场短战，亲手学会如何赢。',195,507,14,COLORS.muted,'center');
  this.button('academy:start','开始新兵演武',20,551,350,60,true);
  this.button('academy:skip','我已熟悉，直接入营',20,633,350,48);
  this.text('可以随时离开，也可以回营继续练习',195,725,12,COLORS.muted,'center');
 }
 academy(){
  const g=this.a.p.guide;this.back('新兵演武');
  this.text('三场实战 → 练兵与加点 → 正式出征',195,99,13,COLORS.muted,'center');
  O.LESSONS.forEach((l,i)=>{const y=135+i*145,done=g.passed.includes(l.id),open=i<=g.passed.length;
   this.box(20,y,350,126);this.badge(done?'✓':l.icon,54,y+38,done?COLORS.green:COLORS.gold);
   this.text(`${i+1} · ${l.name}`,90,y+32,20);this.text(l.short,90,y+61,13,COLORS.muted);
   this.text(done?'已掌握':open?'待演练':'先完成上一场',38,y+100,12,COLORS.muted);
   if(open)this.button(`academy:${i}`,done?'重练':'开始',255,y+78,98,36,!done);
  });
  this.text(g.rewarded?'演武奖励已领取 · 重练不会重复发放':'三场首通获 9 军功，用于练兵与升级',195,601,13,COLORS.gold,'center');
  this.button('academy:start',g.passed.length===3&&g.status!=='done'?'继续营地养成引导':g.passed.length===3?'从第一场重练':'继续学习',20,642,350,54,true);
  this.button('nav:manual','翻阅兵书',20,715,350,42);
 }
 manual(){
  this.back('兵书');this.text('想了解哪里，就点哪里',195,100,14,COLORS.muted,'center');
  Object.entries(O.HELP).forEach(([id,h],i)=>{const x=20+i%2*180,y=139+Math.floor(i/2)*164;
   this.box(x,y,170,142);this.badge(h.icon,x+85,y+39);this.text(h.name,x+85,y+89,17,COLORS.ink,'center','600');
   this.text('查看 ›',x+85,y+119,12,COLORS.muted,'center');this.hit(`help:${id}`,x,y,170,142);
  });
  this.button('nav:academy','实际练一遍 ›',20,675,350,54,true);
 }
 academyResult(){
  const a=this.a,r=a.result,l=O.LESSONS[a.lesson];
  this.title(r.won?'这一招，学会了':'再调整一次',`演武 ${a.lesson+1} / 3 · ${l.name}`);
  for(let i=0;i<3;i++){const x=111+i*84;this.circle(x,149,18,i<=a.lesson&&r.won?'#647c50':'#294137');this.text(i+1,x,149,15,COLORS.gold,'center');if(i<2)this.line(x+23,149,x+61,149);}
  this.circle(195,274,65,'#304f3e');this.text(r.won?l.icon:'再',195,270,60,COLORS.gold,'center','600');
  this.text(r.won?l.short:'先检查编队，再出战',195,382,22,COLORS.ink,'center','600');
  const lines=r.won?l.takeaway:l.lines;lines.forEach((v,i)=>this.text(v,195,428+i*30,14,COLORS.muted,'center'));
  if(r.reward)this.text(`首通奖励  +${r.reward} 军功`,195,509,20,COLORS.gold,'center');
  else this.text('演武不消耗兵力，也不改动主线进度',195,509,12,COLORS.muted,'center');
  this.button(r.won?'academy:next':'retry',r.won?a.lesson===2?a.p.guide.status==='done'?'返回营地':'回营练兵与加点':'下一场演武':'调整后再试',20,570,350,58,true);
  this.button('nav:academy','返回演武场',20,656,350,48);
 }
 coach(){
  const a=this.a,h=O.coach(a);if(!h)return;
  const source=[...a.hits].reverse().find(x=>x.id===h.target);
  // Never leave a blocking instruction on a screen without its real target.
  if(h.target&&!source)return;
  const r=source||h.rect,c=this.c;
  c.fillStyle='#071513d9';
  if(r){const x=Math.max(0,r.x-5),y=Math.max(0,r.y-5),w=Math.min(390-x,r.w+10),height=r.h+10;
   c.fillRect(0,0,390,y);c.fillRect(0,y,x,height);c.fillRect(x+w,y,390-x-w,height);c.fillRect(0,y+height,390,780-y-height);
   this.box(x,y,w,height,'#ffffff00',12,COLORS.gold);
  }else c.fillRect(0,0,390,780);
  a.hits=source?[source]:[];
  const guided=a.mode==='academy'||a.p.guide.status==='camp';
  this.box(12,12,366,44,COLORS.bg,12);
  this.text(guided?a.mode==='academy'?`新兵演武 ${a.lesson+1} / 3`:'营地养成':'军师提示',24,34,13,COLORS.gold);
  this.text(guided?'稍后再学':'关闭',360,34,12,COLORS.muted,'right');this.hit('guide:exit',276,12,100,44);
  const height=source?126:162;
  const choices=source?[r.y>450?Math.max(96,r.y-height-30):r.y+r.h+24,490,84,300]:[r&&r.y>200?76:342,478,90];
  const y=choices.find(v=>v>=72&&v+height<=768&&(!r||v+height<r.y-8||v>r.y+r.h+8))??478;
  this.box(20,y,350,height,'#213d34',18,COLORS.gold);
  this.text(h.title,38,y+29,20,COLORS.gold,'left','600');
  h.lines.forEach((v,i)=>this.text(v,38,y+61+i*25,13,COLORS.ink));
  if(source){this.text('点亮起的位置继续',352,y+108,11,COLORS.muted,'right');}
  else this.button(h.action,h.label||'明白了',38,y+106,314,42,true);
 }
 box(x,y,w,h,fill=COLORS.panel,r=14,stroke=null){const c=this.c;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 text(s,x,y,size=15,color=COLORS.ink,align='left',weight='normal'){const c=this.c;c.font=`${weight} ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(String(s),x,y);}
 hit(id,x,y,w,h){this.a.hits.push({id,x,y,w,h});}
 button(id,label,x,y,w,h=48,primary=false,disabled=false){this.box(x,y,w,h,disabled?'#233636':primary?COLORS.gold:'#28403d',12,primary?null:COLORS.line);this.text(label,x+w/2,y+h/2,15,disabled?'#6f8279':primary?'#172b27':COLORS.ink,'center','600');this.hit(id,x,y,w,h);}
 badge(s,x,y,color=COLORS.gold){this.box(x-20,y-13,40,26,'#243b37',8);this.text(s,x,y,12,color,'center','600');}
 line(x,y,xx,yy,color=COLORS.line,width=1){const c=this.c;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
 circle(x,y,r,color){const c=this.c;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 title(name,sub=''){this.text(name,24,44,27,COLORS.ink,'left','600');if(sub)this.text(sub,24,78,12,COLORS.muted);this.text(`军功 ${G.money(this.a.p)}`,366,44,13,COLORS.gold,'right');}
 back(title,target='camp'){this.button(`nav:${target}`,'‹',20,22,42,42);this.text(title,78,43,21,COLORS.ink,'left','600');}
 tabs(){const a=this.a;this.box(16,704,358,62,'#172c2b',18,COLORS.line);[['camp','营地'],['map','出征'],['heroes','武将'],['barracks','兵营']].forEach(([id,label],i)=>{const x=24+i*87;const on=a.screen===id;this.text(label,x+40,735,15,on?COLORS.gold:COLORS.muted,'center',on?'600':'normal');if(on)this.box(x+31,752,18,3,COLORS.gold,1);this.hit(`nav:${id}`,x,710,81,50);});}
 portrait(id,x,y,r=32,enemy=false){const c=this.c,h=G.H.heroFor(id);this.circle(x,y,r+3,'#354e47');this.circle(x,y,r,'#223a35');c.save();c.translate(x,y+12);const pal={main:enemy?'#b77d66':id==='liubei'?'#659f81':id==='huangzhong'?'#c3a05e':'#6d98b6',dark:'#223735',flag:h?.color||'#aaa',trim:'#e0c789'};c.scale(r/18,r/18);this.r.drawCommander({side:enemy?'red':'blue'},this.a.now,pal,enemy?-1:1);c.restore();}
 weapon(type,x,y,s=1,color=COLORS.gold){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;c.strokeStyle=color;c.fillStyle=color;c.beginPath();if(type==='bladeShield'){c.moveTo(-9,-11);c.lineTo(9,-11);c.lineTo(8,5);c.lineTo(0,12);c.lineTo(-8,5);c.closePath();c.stroke();this.line(0,-7,0,6,color,2);}else if(type==='spear'){this.line(-8,11,8,-11,color,2);c.moveTo(4,-11);c.lineTo(12,-15);c.lineTo(8,-7);c.closePath();c.fill();}else if(type==='archer'){c.arc(-4,0,13,-1.15,1.15);c.stroke();this.line(1,-12,1,12,color,1);this.line(-8,0,15,0,color,1.5);this.line(11,-4,15,0,color,1.5);}else{c.moveTo(-10,10);c.lineTo(-6,-1);c.lineTo(3,-12);c.lineTo(8,-8);c.lineTo(13,-3);c.lineTo(9,2);c.lineTo(3,0);c.lineTo(4,10);c.closePath();c.stroke();}c.restore();}
 campArt(){const c=this.c;this.box(20,112,350,285,'#253e35',20);c.save();c.beginPath();c.rect(21,113,348,283);c.clip();const grad=c.createLinearGradient(0,113,0,397);grad.addColorStop(0,'#374e46');grad.addColorStop(1,'#192e2b');c.fillStyle=grad;c.fillRect(20,113,350,284);this.circle(294,164,27,'#d3b97b');for(let layer=0;layer<3;layer++){c.fillStyle=['#314c43','#29453b','#203d32'][layer];c.beginPath();c.moveTo(20,260+layer*34);for(let i=0;i<9;i++)c.lineTo(20+i*46,194+layer*38+Math.sin(i*2+layer)*30);c.lineTo(370,397);c.lineTo(20,397);c.fill();}for(const [x,y,s] of [[94,273,1],[281,284,.8],[191,338,1.2]]){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#0f2625';c.beginPath();c.ellipse(0,25,48,10,0,0,7);c.fill();c.fillStyle='#b0a078';c.beginPath();c.moveTo(-41,21);c.lineTo(0,-28);c.lineTo(41,21);c.closePath();c.fill();c.fillStyle='#637967';c.beginPath();c.moveTo(0,-28);c.lineTo(41,21);c.lineTo(12,16);c.closePath();c.fill();c.fillStyle='#273e34';c.fillRect(-9,1,18,21);this.line(0,-29,0,-58,'#d3b97e',2);c.fillStyle='#b87862';c.beginPath();c.moveTo(0,-58);c.lineTo(25,-54);c.lineTo(19,-40);c.lineTo(0,-44);c.fill();c.restore();}this.text('整军，待发。',43,151,17,COLORS.ink);this.text('三十兵，一将，破万阵。',43,176,11,'#c5cdb5');c.restore();}
 camp(){const p=this.a.p;this.title('夺帅','三军 · 战役');this.campArt();const completed=G.J.completedOf(p.journey).length;this.text(`已破 ${completed} / 20 战`,38,374,13,COLORS.gold);const ready=G.supply(p,this.a.clock());this.box(20,413,350,62);this.text('营地补给',38,436,16);this.text(ready?`待领取 ${ready} 军功`:'20 分钟 +1 · 最多积存 12',38,459,11,COLORS.muted);this.button('claim',ready?`领取 +${ready}`:'积存中',260,424,96,40,ready>0);const next=G.J.levelFor(p.journey.levelId);this.button('go',completed===20?'再战沙场':`出征 · ${next.number}  ${next.name}`,20,495,350,60,true);this.button('nav:missions','支线委托',20,573,170,64);this.button('nav:academy',p.guide.status==='done'?'新兵演武':'新手引导',200,573,170,64);this.text('兵书 · 玩法与模块说明 ›',195,667,13,COLORS.muted,'center');this.hit('nav:manual',60,645,270,43);}
 map(){const a=this.a,p=a.p;this.title('征途',`第 ${a.chapter+1} 章 · ${G.J.CHAPTERS[a.chapter].name}`);for(let i=0;i<4;i++)this.button(`chapter:${i}`,`第 ${i+1} 章`,20+i*90,102,80,42,i===a.chapter);const available=G.J.availableLevels(p.journey);G.J.JOURNEY_LEVELS.slice(a.chapter*5,a.chapter*5+5).forEach((l,i)=>{const y=168+i*94,done=p.journey.wins[l.id],open=available.has(l.id);this.box(20,y,350,80,open?'#1f3733':'#182b29',14,done?'#52634a':open?COLORS.line:null);this.badge(done?'✓':l.number,49,y+39,open?COLORS.gold:COLORS.muted);this.text(l.name,83,y+27,18,open?COLORS.ink:COLORS.muted,'left','600');this.text(open?l.theme:G.J.lockReason(l,p.journey),83,y+55,12,COLORS.muted);this.text(done?'已破':open?'出阵 ›':'未开放',350,y+40,12,done?COLORS.green:COLORS.gold,'right');this.hit(`level:${l.id}`,20,y,350,80);});this.button('nav:missions','卡关了？去做支线',20,648,350,40);}
 missions(){this.back('军中委托');[['raid','剿匪夺粮','歼灭敌兵 · 逐档领军功','刀'],['guard','守营待援','保护主将 · 坚持到援军','守'],['relay','三军接力','残兵接战 · 排好出场顺序','叁']].forEach(([id,name,sub,icon],i)=>{const open=G.M.missionOpen(this.a.p.journey,id),y=118+i*158;this.box(20,y,350,138);this.badge(icon,55,y+38);this.text(name,91,y+33,21);this.text(sub,91,y+61,12,COLORS.muted);const today=G.M.missionOpen(this.a.p.journey,id)?this.a.p.journey.missions?.[localDay()]?.[id]||0:0;this.text(open?`今日 ${today} / 3 军功`:id==='relay'?'第 3 战后解锁':'第 2 战后解锁',38,y+106,12,COLORS.muted);this.button(`mission:${id}`,open?'整军 ›':'未开放',253,y+88,99,36,open);});this.text('未斩将也能按完成度拿奖励',195,636,13,COLORS.muted,'center');}
 currentConfig(){return this.a.mode==='academy'?this.a.practiceConfig:this.a.mode==='relay'?this.a.p.armies[this.a.army]:this.a.p.journey.config;}
 field(roster,x,y,w,h,enemy=false,clickable=false){const c=this.c;this.box(x,y,w,h,'#253f34',12,'#49634e');c.save();c.beginPath();c.rect(x+1,y+1,w-2,h-2);c.clip();for(let n=1;n<6;n++)this.line(x,y+n*h/6,x+w,y+n*h/6,'#354e3c');const soldiers=roster.filter(s=>s.type!=='commander').slice().sort((a,b)=>a.y-b.y||a.x-b.x);for(const s of roster){const px=x+24+(enemy?s.x-17:s.x)/13*(w-48),py=y+22+s.y/18*(h-44);if(s.type==='commander'){this.portrait(enemy?this.enemyHero():this.currentConfig().heroId,px,py,15,enemy);if(clickable)this.hit('edit:hero',px-21,py-21,42,42);continue;}this.circle(px,py,17,enemy?'#714d3b':'#355f4d');this.weapon(s.type,px,py,.65,enemy?'#e4af94':COLORS.gold);this.text(enemy?s.count:soldiers.indexOf(s)+1,px+16,py-14,10,COLORS.ink,'center','600');if(clickable)this.hit(`slot:${s.id}`,px-21,py-21,42,42);}c.restore();}
 enemyHero(){if(this.a.mode==='academy')return O.LESSONS[this.a.lesson].heroId;if(this.a.mode==='main')return G.J.levelFor(this.a.p.journey.levelId).heroId;return G.M.enemyArmies(this.a.mode)[this.a.enemyArmy].heroId;}
 enemyRoster(){if(this.a.mode==='academy')return O.LESSONS[this.a.lesson].enemy;if(this.a.mode==='main')return G.J.levelFor(this.a.p.journey.levelId).enemy;const config=G.C.sanitizeCampaignConfig(G.M.enemyArmies(this.a.mode)[this.a.enemyArmy]);return G.E.mirrorFormation(config.formation);}
 prepare(){const a=this.a,p=a.p,c=this.currentConfig(),l=G.J.levelFor(p.journey.levelId);this.back(a.mode==='academy'?`演武 ${a.lesson+1} · ${O.LESSONS[a.lesson].name}`:a.mode==='main'?`${l.number} · ${l.name}`:G.M.MISSIONS.find(m=>m.id===a.mode).name,a.mode==='academy'?'academy':a.mode==='main'?'map':'missions');if(a.mode==='relay'){for(let i=0;i<3;i++)this.button(`army:${i}`,`${i+1}军 · ${NAMES[p.armies[i].heroId]}`,20+i*118,82,112,42,i===a.army);}else this.text(a.mode==='academy'?'演武借用 · 不改变主线阵容':'点编队换兵，点主将换人',195,102,12,COLORS.muted,'center');this.text('我军 · 30',32,148,12,COLORS.green);this.text(`敌 · ${NAMES[this.enemyHero()]} · ${this.enemyRoster().reduce((n,s)=>n+(s.type==='commander'?0:s.count||6),0)}兵${a.mode==='relay'?' ›':''}`,205,148,12,COLORS.red);this.field(c.formation,20,168,170,270,false,true);this.field(this.enemyRoster(),200,168,170,270,true);this.box(20,455,350,65);this.portrait(c.heroId,52,488,21);this.text(NAMES[c.heroId],86,479,18);this.text(G.H.heroFor(c.heroId).role,86,503,11,COLORS.muted);this.button('edit:hero','换将',283,468,73,40);const numbered=c.formation.filter(s=>s.type!=='commander').sort((a,b)=>a.y-b.y||a.x-b.x);numbered.forEach((s,i)=>{const x=20+i*71;this.box(x,536,65,72);this.weapon(s.type,x+32,562,.7);this.text(`${i+1} ${SHORT[s.type]}`,x+32,592,12,COLORS.ink,'center');this.hit(`slot:${s.id}`,x,536,65,72);});this.button('edit:formation',`${NAMES[c.preset]} ›`,20,624,a.mode==='relay'?168:350,42);if(a.mode==='relay')this.button('edit:order','出场顺序 ›',200,624,170,42);this.button('start','出战',20,700,350,60,true);if(a.mode==='relay')this.hit('edit:enemy',200,132,170,306);}
 heroes(){const a=this.a,p=a.p,u=G.J.unlocksFor(p.journey),h=G.H.heroFor(a.hero),tree=p.talents[a.hero];this.title('武将',`统帅等级 ${p.journey.training.heroLevel} · 所有已招募武将共享`);G.H.HEROES.forEach((hero,i)=>this.button(`hero:${hero.id}`,u.heroes.includes(hero.id)?hero.name:`${hero.name} · 锁`,20+i*118,100,112,42,hero.id===a.hero));this.portrait(h.id,65,202,35);this.text(h.name,117,180,24);this.text(h.role,117,208,13,COLORS.gold);this.text(h.skill+' · 满蓝自动释放',117,234,12,COLORS.muted);this.hit('edit:heroInfo',24,156,342,92);this.text(`可用技能点 ${G.points(p)-G.spent(tree)}`,24,276,13,COLORS.gold);this.button('respec','重配',290,256,76,36);for(const t of G.TALENTS){if(t.parent){const par=G.TALENTS.find(x=>x.id===t.parent);this.line(t.x,par.y+60,t.x,t.y-26,(tree[t.parent]||0)>=t.need?'#aa9e6c':COLORS.line,2);}this.circle(t.x,t.y,26,tree[t.id]?'#607557':'#263d37');this.circle(t.x,t.y,21,'#213b34');this.text(t.name[0],t.x,t.y,19,tree[t.id]?COLORS.gold:COLORS.muted,'center','600');this.text(`${t.name} ${tree[t.id]||0}/${t.max}`,t.x,t.y+41,13,COLORS.ink,'center');this.hit(`talent:${t.id}`,t.x-55,t.y-29,110,84);}this.button('train:hero',`统帅升级 · ${p.journey.training.heroLevel>=G.J.capsFor(p.journey).heroLevel?'本章已满':'5 军功'}`,20,637,350,48,true);}
 barracks(){const p=this.a.p,u=G.J.unlocksFor(p.journey);this.title('兵营','训练提升生命与伤害，编队人数不变');G.C.TROOP_TYPES.forEach((type,i)=>{const y=113+i*125,r=p.journey.training.troopRanks[type],cap=G.J.capsFor(p.journey).troopRank,open=u.troops.includes(type);this.box(20,y,350,110);this.weapon(type,53,y+40,1.2);this.text(NAMES[type],91,y+28,20);this.text(open?`训练 ${r} 级 · 生命 / 伤害 +${r*6}%`:'推进主线解锁',91,y+54,12,COLORS.muted);this.text(ROLES[type],37,y+86,12,COLORS.gold);const cost=G.J.troopCost(r+1)-G.J.troopCost(r);this.button(`train:${type}`,!open?'未开放':r>=cap?'本章已满':`升级 · ${cost}`,252,y+67,104,32,open&&r<cap,!open||r>=cap);});this.button('resetAsk','重新分配训练军功',20,636,350,45);}
 drawBattle(){const a=this.a,b=a.run.battle,c=this.c;const snap=G.E.getSnapshot(b);this.back(a.mode==='academy'?O.LESSONS[a.lesson].name:a.mode==='main'?G.J.levelFor(a.run.levelId).name:'军中委托','camp');this.a.hits=this.a.hits.filter(h=>h.id!=='nav:camp');this.hit('retreatAsk',20,22,42,42);this.text(`${Math.floor(b.time)} / 90 秒`,364,43,12,COLORS.muted,'right');for(const [side,x,col] of [['blue',24,COLORS.green],['red',213,COLORS.red]]){const v=snap[side];this.text(NAMES[b.heroes[side]],x,98,19,col);this.text(`${v.soldiers} 兵`,x+150,98,13,col,'right');this.box(x,117,150,8,'#233b36',4);this.box(x,117,Math.max(1,150*v.commanderHp/v.commanderMaxHp),8,col,4);this.box(x,131,150,4,'#233b36',2);this.box(x,131,Math.max(1,150*v.mana/v.manaMax),4,'#85abc7',2);}
 this.box(12,160,366,433,'#637c57',18);c.save();c.beginPath();c.rect(14,162,362,429);c.clip();const grad=c.createLinearGradient(0,160,0,593);grad.addColorStop(0,'#536c51');grad.addColorStop(.5,'#92966c');grad.addColorStop(1,'#546e50');c.fillStyle=grad;c.fillRect(14,162,362,429);for(let i=0;i<70;i++){const x=17+(i*73%355),y=170+(i*131%410);this.line(x,y,x+5,y-2,'#b3b58b22');}this.battleViewport(b.units,b.time);this.r.readDamage(b.units,b.time);for(const u of this.r.deaths)this.r.drawCorpse(u,b.time);const living=b.units.filter(u=>u.alive).sort((u,v)=>u.y-v.y);for(const u of living.filter(u=>u.type!=='commander'))this.r.drawUnit(u,b.time,false);for(const u of living.filter(u=>u.type==='commander'))this.r.drawUnit(u,b.time,false);this.r.drawEffects(b.effects,b.time);this.r.drawHitEffects(b.time);this.commanderLabels(b.units);c.restore();this.text('我军',32,184,12,'#d6ead3');this.text('敌军',354,184,12,'#f3d0b5','right');const latest=b.events.filter(e=>e.type==='skill').slice(-1)[0];if(latest&&b.time-latest.time<3)this.text(latest.text.replace(/ ·.*/,''),195,564,12,COLORS.ink,'center');
 if(a.run.mission){const m=a.run.mission;this.text(m.id==='relay'?`我军 ${Math.min(3,m.indices.blue+1)} / 3     对阵     敌军 ${Math.min(3,m.indices.red+1)} / 3`:m.id==='raid'?'歼敌 8 / 16 / 24 人逐档获奖':'坚守 20 / 35 / 50 秒逐档获奖',195,621,13,COLORS.muted,'center');}
 this.button('pause',a.paused?'继续':'暂停',20,696,169,54);this.button('speed',`${a.speed} 倍速`,201,696,169,54,true);
 if(a.run.mission?.status==='between'){this.box(40,315,310,140,'#142b27',18,COLORS.gold);const m=a.run.mission,last=m.rounds[m.rounds.length-1];this.text(last.outcome==='won'?'敌军溃败 · 我军继续迎战':'先军退场 · 后军接战',195,350,17,COLORS.gold,'center');this.text(`存活士兵  我 ${last.blueSoldiers} : 敌 ${last.redSoldiers}`,195,378,13,COLORS.muted,'center');this.button('nextRound','下一军',63,401,264,38,true);}
 else if(a.paused&&!a.sheet){this.box(143,170,104,30,'#112a25');this.text('已暂停',195,185,14,COLORS.gold,'center');}}
 result(){const a=this.a,r=a.result;if(a.mode==='academy'){this.academyResult();return;}this.title(r.won?'旗开得胜':'重整旗鼓',a.mode==='main'?G.J.levelFor(a.run.levelId).name:G.M.MISSIONS.find(m=>m.id===a.mode).name);this.circle(195,227,77,'#233f34');this.circle(195,227,65,'#304f3e');this.text(r.won?'胜':'战',195,223,72,COLORS.gold,'center','600');this.text(`军功 +${r.reward}`,195,342,29,COLORS.gold,'center','600');this.text(`${Math.round(r.time)} 秒${r.rounds>1?` · ${r.rounds} 次交战`:''}`,195,387,14,COLORS.muted,'center');if(r.unlocked.length){this.box(20,424,350,74);this.text('新解锁',195,447,12,COLORS.muted,'center');this.text(r.unlocked.map(id=>NAMES[id]).join(' · '),195,476,19,COLORS.gold,'center');}else if(!r.won){this.text('换个阵容，或回营练兵再来。',195,459,15,COLORS.ink,'center');}else if(r.cleared===20)this.text('二十战功成，三军仍待出征。',195,459,16,COLORS.gold,'center');if(a.run.mission)this.button('edit:report','交战记录 ›',110,502,170,30);this.button(r.won&&a.mode==='main'?'next':'retry',r.won&&a.mode==='main'?r.cleared===20?'重返征途':'下一战':'调整阵容',20,545,350,56,true);this.button('nav:barracks','练兵',20,619,169,48);this.button('nav:missions','支线',201,619,169,48);this.button('nav:camp','返回营地',20,700,350,48);}
 sheet(){const a=this.a,s=a.sheet,p=a.p,c=this.c;c.fillStyle='#071313c9';c.fillRect(0,0,390,780);a.hits=[];this.box(14,179,362,587,'#1c3330',22,COLORS.line);this.button('close','×',316,196,42,38);const config=this.currentConfig(),u=a.mode==='academy'?O.tools(a):G.J.unlocksFor(p.journey);if(s.type==='troop'){const list=config.formation.filter(s=>s.type!=='commander').sort((a,b)=>a.y-b.y||a.x-b.x);this.text(`第 ${list.findIndex(x=>x.id===s.slot)+1} 队 · 更换兵种`,32,220,20);G.C.TROOP_TYPES.forEach((t,i)=>{const y=270+i*105;this.box(30,y,330,90,config.formation.find(x=>x.id===s.slot)?.type===t?'#355243':'#243f37');this.weapon(t,65,y+41,1.2);this.text(NAMES[t],104,y+28,19);this.text(u.troops.includes(t)?ROLES[t]:'推进主线解锁',104,y+58,12,COLORS.muted);this.text(u.troops.includes(t)?'选择 ›':'锁',338,y+44,13,COLORS.gold,'right');this.hit(`troop:${t}`,30,y,330,90);});}
 if(s.type==='help'){const h=O.HELP[s.id];this.text(h.name,32,220,22);this.circle(195,328,43,'#304f3e');this.text(h.icon,195,328,38,COLORS.gold,'center');h.lines.forEach((t,i)=>this.text(t,195,420+i*32,15,COLORS.ink,'center'));h.extra.forEach((t,i)=>this.text(t,195,531+i*30,12,COLORS.muted,'center'));this.button('close','记住了',32,682,326,48,true);}
 if(s.type==='heroInfo'){const h=G.H.heroFor(a.hero),lv=p.journey.training.heroLevel,tree=p.talents[a.hero];this.text(h.name,32,220,23);this.portrait(h.id,195,316,43);this.text(h.role,195,390,19,COLORS.gold,'center');const stats=[`生命 ${Math.round(h.stats.hp*G.J.heroMultiplier(lv)*(1+.08*(tree.vigor||0)))}`,`普攻 ${Math.round(h.stats.damage*G.J.heroMultiplier(lv)*(1+.08*(tree.valor||0)))}`,`蓝量 ${h.stats.manaMax}`];stats.forEach((t,i)=>this.text(t,80+i*116,436,14,COLORS.ink,'center'));const passive=a.hero==='liubei'?'刀盾、长枪生命 +15%':a.hero==='huangzhong'?'弓兵伤害 +20%':'骑兵移速 +25% · 伤害 +15%';this.text(passive,195,489,16,COLORS.gold,'center');this.text(h.skill+' · 满蓝自动释放',195,542,17,COLORS.ink,'center');const lines=a.hero==='liubei'?['附近 10 名士兵回血 30、加盾 40','范围 3.5 格 · 护盾持续 4 秒']:a.hero==='huangzhong'?['附近 12 名弓兵攻速 +30%','范围 5 格 · 持续 5 秒']:['附近 12 名骑兵加盾 35、移速 +20%','范围 6 格 · 持续 4 秒'];lines.forEach((t,i)=>this.text(t,195,583+i*32,13,COLORS.muted,'center'));this.button('close','知道了',32,682,326,48,true);}
 if(s.type==='report'){this.text('交战记录',32,220,22);const m=a.run.mission;m.rounds.forEach((r,i)=>{const y=268+i*88;this.box(30,y,330,76);this.text(`${r.blue+1}军 ${NAMES[m.armies[r.blue].heroId]}  对  ${r.red+1}军 ${NAMES[m.enemies[r.red].heroId]}`,44,y+20,14);this.text(r.outcome==='won'?'胜':r.outcome==='lost'?'负':'平',337,y+20,15,r.outcome==='won'?COLORS.gold:COLORS.red,'right');this.text(`剩余士兵  我 ${r.blueSoldiers} : 敌 ${r.redSoldiers}`,44,y+52,12,COLORS.muted);this.text(`${Math.round(r.time)} 秒`,337,y+52,12,COLORS.muted,'right');});}
 if(s.type==='hero'){this.text('选择主将',32,220,20);G.H.HEROES.forEach((h,i)=>{const y=280+i*126;this.box(30,y,330,108);this.portrait(h.id,73,y+56,28);this.text(h.name,120,y+32,22);this.text(h.role,120,y+61,13,COLORS.gold);this.text(u.heroes.includes(h.id)?h.skill:'推进主线解锁',120,y+85,12,COLORS.muted);this.hit(`pickhero:${h.id}`,30,y,330,108);});}
 if(s.type==='formation'){this.text('选择阵型',32,220,20);G.C.FORMATION_PRESETS.forEach((f,i)=>{const y=268+i*109;this.box(30,y,330,94);const sample=G.C.formationFor(f.id,config.troops);sample.filter(x=>x.type!=='commander').forEach(q=>this.circle(40+q.x*4.2,y+12+q.y*4,3.8,COLORS.gold));this.text(f.name,120,y+30,20);this.text(u.formations.includes(f.id)?f.tag:'推进主线解锁',120,y+61,13,COLORS.muted);this.hit(`form:${f.id}`,30,y,330,94);});}
 if(s.type==='talent'){const t=G.TALENTS.find(t=>t.id===s.id),tree=p.talents[a.hero],current=tree[t.id]||0;this.text(t.name,32,220,22);this.circle(195,332,45,'#304f3e');this.text(t.name[0],195,332,36,COLORS.gold,'center');this.text(t.detail+' / 级',195,414,19,COLORS.ink,'center');this.text(`当前 ${current} / ${t.max} 级`,195,454,14,COLORS.muted,'center');if(t.id==='command'||t.id==='march')this.text(a.hero==='liubei'?'刘备：刀盾与长枪':a.hero==='huangzhong'?'黄忠：弓兵':'赵云：骑兵',195,491,13,COLORS.gold,'center');if(t.parent)this.text(`需要 ${G.TALENTS.find(x=>x.id===t.parent).name} ${t.need} 级`,195,533,13,COLORS.muted,'center');this.button(`learn:${t.id}`,current===t.max?'已点满':'学习 · 1 技能点',32,642,326,52,true);}
 if(s.type==='order'){this.text('三军出场顺序',32,220,20);p.armies.forEach((army,i)=>{const y=283+i*116;this.portrait(army.heroId,69,y+31,27);this.text(`${i+1}军 · ${NAMES[army.heroId]}`,115,y+15,20);this.text(army.troops.map(t=>SHORT[t]).join(' · '),115,y+45,13,COLORS.muted);if(i<2)this.button(`swap:${i}`,'与下一军交换',116,y+66,220,34);});}
 if(s.type==='enemy'){this.text('敌军出场顺序',32,220,20);G.M.enemyArmies(a.mode).forEach((army,i)=>{const y=286+i*116;this.portrait(army.heroId,70,y+28,27);this.text(`${i+1}军 · ${NAMES[army.heroId]}`,115,y+10,20);this.text(army.troops.map(t=>SHORT[t]).join(' · '),115,y+38,13,COLORS.muted);this.button(`enemy:${i}`,a.enemyArmy===i?'正在查看':'查看阵型',115,y+60,220,35,a.enemyArmy===i);});}
 if(s.type==='reset'){this.text('重新训练',32,220,20);this.text('返还全部训练军功',195,350,21,COLORS.gold,'center');this.text('统帅与兵营回到初始等级',195,402,15,COLORS.muted,'center');this.text('超出等级额度的技能点会一起返还',195,437,12,COLORS.muted,'center');this.button('resetTraining','确认重配',32,641,326,54,true);}
 if(s.type==='retreat'){this.text('撤回整军',32,220,20);this.text('本场不结算奖励',195,370,20,COLORS.ink,'center');this.button('resume','继续战斗',32,556,326,52,true);this.button('retreat','撤回布阵',32,625,326,52);}
 }
 draw(){const a=this.a,c=this.c;a.hits=[];c.fillStyle=COLORS.bg;c.fillRect(0,0,390,780);for(let i=0;i<16;i++)this.line(0,i*55,390,i*55-100,'#bfd1a504');({welcome:()=>this.welcome(),academy:()=>this.academy(),manual:()=>this.manual(),expedition:()=>ExpeditionView.draw(this),camp:()=>a.flow==='expedition'?ExpeditionView.camp(this):this.camp(),map:()=>this.map(),missions:()=>this.missions(),prepare:()=>this.prepare(),heroes:()=>this.heroes(),barracks:()=>this.barracks(),battle:()=>a.mode==='expedition'?ExpeditionView.draw(this):this.drawBattle(),result:()=>this.result()}[a.screen]||(()=>this.camp()))();if(['camp','map','heroes','barracks'].includes(a.screen)&&!(a.flow==='expedition'&&a.screen==='camp'))this.tabs();if(a.sheet){if(a.sheet.type==='expeditionMenu')ExpeditionView.menu(this);else this.sheet();}this.coach();if(a.toast&&a.toast.until>a.now&&!O.coach(a)){this.box(18,16,354,42,'#e2c181');this.text(a.toast.text,195,37,12,'#17322b','center');}if(a.saveError)this.text('存档不可用',195,775,10,COLORS.red,'center');}
}
function localDay(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
module.exports={View};

},
"src/app.js":function(require,module,exports){
const G = require('./core.js');
const O = require('./onboarding.js');
const X = require('./expedition.js');
const {View} = require('./view.js');
function createGame({canvas, load = () => null, save = () => {}, legacy = null, onSound = () => {}, now = () => Date.now(), entry = 'expedition'}) {
  let saved;
  try {saved = load(G.KEY);} catch (_) {}
  const p = G.clean(saved, legacy, now());
  const opening = entry !== 'legacy' && p.expedition.phase !== 'complete';
  const a = {p, flow: entry, screen: opening ? 'expedition' : entry === 'legacy' && p.guide.status === 'new' ? 'welcome' : 'camp', sheet: null, tab: 0,
    chapter: G.J.chapterReached(p.journey) - 1, hero: p.journey.config.heroId,
    mode: opening ? 'expedition' : 'main', expeditionChoice: null, army: 0, enemyArmy: 0, lesson: 0, practiceConfig: null,
    run: null, result: null, speed: 1, paused: false, toast: null, now: 0, hits: [], saveError: false, clock: now};
  const view = new View(canvas.getContext('2d'), a);
  function persist() {try {save(G.KEY, p); a.saveError = false;} catch (_) {a.saveError = true; toast('存档不可用，请勿关闭此页');}}
  function toast(text) {a.toast = {text, until: a.now + 3};}
  const config = () => a.mode === 'academy' ? a.practiceConfig : a.mode === 'relay' ? p.armies[a.army] : p.journey.config;
  const available = () => a.mode === 'academy' ? O.tools(a) : G.J.unlocksFor(p.journey);
  const cleanConfig = c => a.mode === 'academy' ? G.C.sanitizeCampaignConfig(c) : G.J.cleanConfig(c, p.journey);
  function saveConfig(c) {
    if (a.mode === 'academy') a.practiceConfig = c;
    else if (a.mode === 'relay') p.armies[a.army] = c;
    else p.journey.config = c;
    persist();
  }
  function enter(screen) {
    a.screen = screen; a.sheet = null; a.toast = null; a.tab = 0;
    if (screen === 'map') a.chapter = G.J.levelFor(p.journey.levelId).chapter - 1;
  }
  function prepare(mode = 'main', id = p.journey.levelId) {
    a.mode = mode; a.army = 0; a.enemyArmy = 0;
    if (mode === 'main') p.journey.levelId = id;
    p.armies = G.M.cleanArmies(p.armies, p.journey); a.run = null; enter('prepare'); persist();
  }
  function academy(index) {
    const next = Math.max(0, Math.min(2, Number(index) || 0));
    if (next > p.guide.passed.length) {toast('先完成上一场演武'); return;}
    a.lesson = next; a.mode = 'academy';
    a.practiceConfig = G.C.sanitizeCampaignConfig(O.LESSONS[a.lesson].config);
    a.run = null; a.result = null;
    if (p.guide.status !== 'done') p.guide.status = 'learning';
    enter('prepare'); persist();
  }
  function syncGuide() {
    if (p.guide.status !== 'camp') return;
    const g = p.guide;
    if (p.journey.training.troopRanks.spear > 0) g.camp.troop = true;
    if (p.journey.training.heroLevel >= 2) g.camp.hero = true;
    if (G.spent(p.talents.liubei) > 0) g.camp.talent = true;
  }
  function dispatch(id) {
    if (p.sound) onSound(id);
    const [kind, val] = id.split(':');
    if (kind === 'trip') {
      if (val === 'continue') {prepare('main', p.journey.levelId); return;}
      if (val === 'open') {a.mode = 'expedition'; a.run = null; a.expeditionChoice = null; enter('expedition'); persist(); return;}
      if (val === 'menu') {a.sheet = {type:'expeditionMenu'}; return;}
      if (val === 'camp') {a.mode = 'main'; enter('camp'); persist(); return;}
      if (val === 'replay') {p.expedition = X.fresh(); a.mode = 'expedition'; a.run = null; a.expeditionChoice = null; enter('expedition'); persist(); return;}
      if (a.screen !== 'expedition') return;
      if (val === 'pick') {if (X.options(p.expedition).some(o => o.id === id.split(':')[2])) a.expeditionChoice = id.split(':')[2]; return;}
      if (val === 'confirm') {
        if (X.choose(p.expedition, a.expeditionChoice || X.options(p.expedition)[0]?.id)) {a.expeditionChoice = null; a.run = null; persist();}
        return;
      }
      if (val === 'start' && p.expedition.phase === 'ready') {
        a.run = G.start(p, 'expedition'); a.result = null; a.speed = 2; a.paused = false; a.mode = 'expedition';
        enter('battle'); view.resetBattle(); persist();
      }
      return;
    }
    if (kind === 'guide') {
      const cue = O.coach(a);
      if (val === 'ack' && cue) {p.guide.seen[cue.id] = true; persist();}
      if (val === 'finish') {p.guide.status = 'done'; a.mode = 'main'; enter('map'); persist();}
      if (val === 'defer') {p.guide.status = 'skipped'; a.mode = 'main'; enter('map'); persist();}
      if (val === 'exit') {
        if (a.mode === 'academy' || p.guide.status === 'camp') {
          if (p.guide.status !== 'done') p.guide.status = 'skipped';
          a.mode = 'main'; a.run = null; enter('camp'); persist();
        } else if (cue) {p.guide.seen[cue.id] = true; persist();}
      }
      return;
    }
    if (kind === 'academy') {
      if (val === 'skip') {p.guide.status = 'skipped'; a.mode = 'main'; enter('camp'); persist(); return;}
      if (val === 'start') {
        if (p.guide.passed.length === 3 && p.guide.status !== 'done') {p.guide.status = 'camp'; a.mode = 'main'; enter('camp'); syncGuide(); persist();}
        else academy(p.guide.passed.length < 3 ? p.guide.passed.length : 0);
        return;
      }
      if (val === 'next') {
        if (a.lesson < 2) academy(a.lesson + 1);
        else {a.mode = 'main'; enter('camp'); syncGuide(); persist();}
        return;
      }
      if (/^[0-2]$/.test(val)) academy(Number(val));
      return;
    }
    if (kind === 'help') {a.sheet = {type: 'help', id: O.HELP[val] ? val : 'prepare'}; return;}
    if (kind === 'nav') {enter(val); if (val === 'heroes') a.hero = p.journey.config.heroId; if (['camp', 'map', 'academy', 'manual'].includes(val)) a.mode = 'main'; return;}
    if (kind === 'close') {a.sheet = null; return;}
    if (kind === 'claim') {const n = G.claim(p, now()); toast(n ? `军功 +${n}` : '每 20 分钟产出 1 军功'); persist(); return;}
    if (kind === 'chapter') {a.chapter = Math.max(0, Math.min(3, Number(val))); return;}
    if (kind === 'level') {if (!G.J.availableLevels(p.journey).has(val)) {toast(G.J.lockReason(G.J.levelFor(val), p.journey)); return;} prepare('main', val); return;}
    if (kind === 'mission') {if (!G.M.missionOpen(p.journey, val)) {toast(val === 'relay' ? '通关第 3 战解锁' : '通关第 2 战解锁'); return;} prepare(val); return;}
    if (kind === 'go') {a.mode = 'main'; enter('map'); return;}
    if (kind === 'edit') {a.sheet = {type: val}; return;}
    if (kind === 'army') {a.army = Number(val); return;}
    if (kind === 'enemy') {a.enemyArmy = Number(val); return;}
    if (kind === 'swap') {const i = Number(val); [p.armies[i], p.armies[i + 1]] = [p.armies[i + 1], p.armies[i]]; persist(); return;}
    if (kind === 'slot') {a.sheet = {type: 'troop', slot: val}; return;}
    if (kind === 'troop') {
      const c = G.clone(config()), i = G.C.PLAYER_SLOTS.findIndex(s => s.id === a.sheet?.slot);
      if (i < 0) return;
      if (!available().troops.includes(val)) {toast('推进主线解锁'); return;}
      c.troops[i] = val; saveConfig(cleanConfig(c)); a.sheet = null; return;
    }
    if (kind === 'form') {
      if (!available().formations.includes(val)) {toast('推进主线解锁'); return;}
      saveConfig(cleanConfig({...config(), preset: val, formation: undefined})); a.sheet = null; return;
    }
    if (kind === 'pickhero') {
      if (!available().heroes.includes(val)) {toast('推进主线解锁'); return;}
      if (a.mode === 'relay') {const other = p.armies.findIndex(c => c.heroId === val); if (other !== a.army && other >= 0) p.armies[other].heroId = config().heroId;}
      saveConfig({...config(), heroId: val}); a.sheet = null; return;
    }
    if (kind === 'hero') {a.hero = val; return;}
    if (kind === 'talent') {a.sheet = {type: 'talent', id: val}; return;}
    if (kind === 'learn') {const err = G.learn(p, a.hero, val); toast(err || '已学习'); syncGuide(); persist(); a.sheet = null; return;}
    if (kind === 'respec') {p.talents[a.hero] = {}; persist(); toast('技能点已全部返还'); a.sheet = null; return;}
    if (kind === 'train') {toast(G.upgrade(p, val) || '升级成功'); syncGuide(); persist(); return;}
    if (kind === 'resetTraining') {G.resetTraining(p); persist(); toast('军功已返还 · 技能点同步校正'); a.sheet = null; return;}
    if (kind === 'resetAsk') {a.sheet = {type: 'reset'}; return;}
    if (kind === 'start') {
      if (a.screen !== 'prepare') return;
      a.run = G.start(p, a.mode, a.mode === 'academy' ? a.lesson : p.journey.levelId, a.practiceConfig);
      a.result = null; a.speed = a.mode === 'academy' ? 2 : 1; a.paused = false; enter('battle'); view.resetBattle(); return;
    }
    if (kind === 'speed') {a.speed = a.speed === 1 ? 2 : a.speed === 2 ? 4 : 1; return;}
    if (kind === 'pause') {a.paused = !a.paused; return;}
    if (kind === 'retreatAsk') {a.paused = true; a.sheet = {type: 'retreat'}; return;}
    if (kind === 'retreat') {a.run = null; enter(a.mode === 'expedition' ? 'expedition' : 'prepare'); return;}
    if (kind === 'resume') {a.sheet = null; a.paused = false; return;}
    if (kind === 'nextRound') {G.advance(a.run, p); view.resetBattle(); a.paused = false; return;}
    if (kind === 'retry') {if (a.mode === 'academy') {a.run = null; enter('prepare');} else prepare(a.mode, a.run.levelId); return;}
    if (kind === 'next') {if (a.result?.cleared === 20) {enter('map'); return;} prepare('main', p.journey.levelId); return;}
    if (kind === 'sound') {p.sound = !p.sound; persist();}
  }
  function tick(dt) {
    a.now += dt;
    if (a.screen === 'battle' && a.run && !a.paused && !O.coach(a)?.freeze) {
      const r = a.run;
      if (!r.mission || r.mission.status !== 'between') G.step(r, Math.min(.12, dt) * a.speed);
      const result = G.finish(p, r);
      if (result) {a.result = result; a.expeditionChoice = null; persist(); enter(r.mode === 'expedition' ? 'expedition' : 'result');}
    }
  }
  function draw() {syncGuide(); view.draw();}
  function touch(x, y) {
    // Rebuild hits after each action so two fast taps cannot activate a button
    // from the previous screen or bypass a new instruction.
    view.draw();
    for (let i = a.hits.length - 1; i >= 0; i--) {const h = a.hits[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {dispatch(h.id); return h.id;}}
    return null;
  }
  function hide() {if (a.screen === 'battle') a.paused = true; persist();}
  syncGuide();
  return {state: a, draw, tick, touch, hide, dispatch, view, persist};
}
module.exports = {createGame};

}},cache={};function load(id){if(cache[id])return cache[id].exports;const m={exports:{}};cache[id]=m;modules[id](relative=>{const parts=id.split('/');parts.pop();for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/'));},m,m.exports);return m.exports;}globalThis.CommanderGame=load('src/app.js');})();
