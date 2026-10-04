/* eslint-disable no-console */
import { forecast } from '@/lib/forecast';
import { initialState } from '@/store';
let passed=0,failed=0; const check=(n:string,c:boolean)=>{if(c){passed++;console.log(`  \u2713 ${n}`);}else{failed++;console.error(`  \u2717 ${n}`);}};
const f = forecast(initialState, new Date('2026-09-13'));
console.log('forecast:', JSON.stringify({ pipeline: Math.round(f.pipelineValue/1e6)+'M', weighted: Math.round(f.weightedPipeline/1e6)+'M', won: Math.round(f.wonRevenue/1e6)+'M', winRate: Math.round(f.winRate*100)+'%', avg: Math.round(f.avgDealSize/1e6)+'M', cycle: f.salesCycleDays+'d' }));
check('pipeline value >= 0', f.pipelineValue >= 0);
check('weighted <= pipeline', f.weightedPipeline <= f.pipelineValue + 1);
check('win rate 0-1', f.winRate >= 0 && f.winRate <= 1);
check('has won revenue (example data has won opps)', f.wonRevenue > 0);
check('open + won + lost counts consistent', f.openCount + f.wonCount + f.lostCount === initialState.opportunities.length);
check('3 periods (month/quarter/year)', f.periods.length === 3);
check('year weighted >= quarter weighted', f.periods[2].weighted >= f.periods[1].weighted);
check('proposal conversion 0-1', f.proposalConversion >= 0 && f.proposalConversion <= 1);
console.log('   periods:', f.periods.map(p=>`${p.label}: exp ${Math.round(p.expected/1e6)}M + won ${Math.round(p.won/1e6)}M`).join(' | '));
console.log(`\n${failed===0?'ALL PASSED':'FAILURES'} — ${passed} passed, ${failed} failed\n`); if(failed>0)process.exit(1);
