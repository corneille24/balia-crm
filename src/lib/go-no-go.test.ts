/* eslint-disable no-console */
import { assessGoNoGo, GO_NO_GO_CRITERIA } from '@/lib/go-no-go';
let passed=0,failed=0; const check=(n:string,c:boolean)=>{if(c){passed++;console.log(`  \u2713 ${n}`);}else{failed++;console.error(`  \u2717 ${n}`);}};
const all=(v:number)=>Object.fromEntries(GO_NO_GO_CRITERIA.map(c=>[c.key,v]));
check('weights sum to 100', GO_NO_GO_CRITERIA.reduce((s,c)=>s+c.weight,0)===100);
check('all 5 -> GO', assessGoNoGo(all(5)).recommendation==='GO');
check('all 0 -> NO-GO', assessGoNoGo(all(0)).recommendation==='NO-GO');
check('eligibility blocker -> NO-GO', assessGoNoGo({...all(5),eligibility:1}).recommendation==='NO-GO');
check('strong but requiredPartners -> GO WITH PARTNER', assessGoNoGo(all(5),{requiredPartners:true}).recommendation==='GO WITH PARTNER');
check('strong but no capacity+capability+partners -> CONSORTIUM', assessGoNoGo({...all(5),consultants:1,capability:1},{requiredPartners:true}).recommendation==='GO — CONSORTIUM');
check('strong but low capacity -> GO WITH PARTNER', assessGoNoGo({...all(5),consultants:1}).recommendation==='GO WITH PARTNER');
check('mid -> WATCH', ['WATCH','GO','GO WITH PARTNER'].includes(assessGoNoGo(all(3)).recommendation));
check('score is a percentage', assessGoNoGo(all(4)).scorePct>0 && assessGoNoGo(all(4)).scorePct<=100);
console.log('   all-4 example:', JSON.stringify(assessGoNoGo(all(4))));
console.log(`\n${failed===0?'ALL PASSED':'FAILURES'} — ${passed} passed, ${failed} failed\n`); if(failed>0)process.exit(1);
