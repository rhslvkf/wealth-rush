const ASSETS = [
  {id:'ai',name:'AI 반도체',code:'AI',base:100,vol:0.055},
  {id:'tech',name:'빅테크',code:'TECH',base:100,vol:0.035},
  {id:'energy',name:'에너지',code:'ENERGY',base:100,vol:0.028},
  {id:'gold',name:'금',code:'GOLD',base:100,vol:0.018},
  {id:'cash',name:'현금',code:'CASH',base:100,vol:0}
];
const EVENTS=[
  ['AI 수요 폭발','AI 데이터센터 투자가 예상치를 크게 웃돌았어.','ai',0.12],
  ['반도체 공급 차질','주요 생산라인에서 공급 차질이 발생했어.','ai',-0.11],
  ['빅테크 실적 서프라이즈','대형 기술기업들의 실적이 시장 기대를 상회했어.','tech',0.08],
  ['경기 둔화 우려','글로벌 경기 둔화 우려가 커지고 있어.','tech',-0.07],
  ['중동 긴장 고조','지정학적 불안으로 안전자산 선호가 높아졌어.','gold',0.07],
  ['원유 공급 감소','주요 산유국의 감산 소식이 전해졌어.','energy',0.09],
  ['인플레이션 진정','물가 지표가 예상보다 낮게 나왔어.','energy',-0.04],
  ['시장 안정','특별한 악재 없이 시장이 안정적으로 움직였어.',null,0]
];
let state;
const money=n=>new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(n);
const pct=n=>`${n>=0?'+':''}${n.toFixed(2)}%`;
function fresh(){return {day:1,cash:10000000,prices:Object.fromEntries(ASSETS.map(a=>[a.id,a.base])),holdings:Object.fromEntries(ASSETS.map(a=>[a.id,0])),history:[],event:null,started:false,ended:false};}
function seed(){state=fresh();renderStart()}
function portfolio(){return state.cash+ASSETS.reduce((total,a)=>total+state.holdings[a.id]*state.prices[a.id]*100000,0)}
function renderStart(){document.querySelector('#app').innerHTML=`<div class="start"><div class="modal"><div class="brand">WEALTH <span>RUSH</span></div><h1>30일 투자왕</h1><p>가상의 1,000만원으로 30일 동안 시장을 돌파해봐.<br>뉴스를 읽고, 자산을 사고팔고, 마지막 수익률로 승부해.</p><button class="primary" id="start">게임 시작</button></div></div>`;document.querySelector('#start').onclick=()=>{state.started=true;render()}}
function render(){
 const value=portfolio(), ret=(value/10000000-1)*100, dayPct=state.day/30*100;
 const assets=ASSETS.filter(a=>a.id!=='cash').map(a=>{const p=state.prices[a.id];const h=state.holdings[a.id];const ch=state.history.find(x=>x.day===state.day&&x.asset===a.id)?.change||0;return `<div class="asset"><div><div class="asset-name">${a.name}<span class="asset-code">${a.code}</span></div><div class="trade"><input id="qty-${a.id}" type="number" min="1" value="1"><button class="buy" onclick="trade('${a.id}',1)">매수</button><button class="sell" onclick="trade('${a.id}',-1)">매도</button><span class="hint">보유 ${h.toFixed(2)}주</span></div></div><div><div class="price">${money(p*100000)}</div><div class="change ${ch>=0?'up':'down'}">${pct(ch)}</div></div></div>`}).join('');
 const evt=state.event?`<div class="event"><b>⚡ ${state.event[0]}</b><p>${state.event[1]}</p></div>`:`<div class="event"><b>📈 오늘의 시장</b><p>아직 시장이 열리지 않았어. 투자 전략을 세우고 다음 날로 넘어가.</p></div>`;
 document.querySelector('#app').innerHTML=`<div class="app"><div class="shell"><div class="topbar"><div><div class="brand">WEALTH <span>RUSH</span></div><div class="subtitle">30일 투자 시뮬레이션</div></div><div class="pill">DAY ${state.day} / 30</div></div><div class="hero"><div class="card"><div class="label">총 자산</div><div class="money">${money(value)}</div><div class="stats"><div class="stat"><div class="label">수익률</div><strong class="${ret>=0?'up':'down'}">${pct(ret)}</strong></div><div class="stat"><div class="label">현금</div><strong>${money(state.cash)}</strong></div><div class="stat"><div class="label">보유자산</div><strong>${money(value-state.cash)}</strong></div></div><div class="progress"><i style="width:${dayPct}%"></i></div></div><div class="card">${evt}<button class="next" onclick="nextDay()" ${state.ended?'disabled':''}>${state.day>=30?'결과 보기':'하루 넘기기 →'}</button></div></div><div class="grid"><div class="card"><div class="section-title"><h2>시장</h2><span class="hint">1주 = 10만원</span></div>${assets}</div><div class="card"><div class="section-title"><h2>거래 기록</h2><span class="hint">최근순</span></div><div class="log">${state.history.slice().reverse().map(x=>`<div class="log-row">DAY ${x.day} · <b>${x.text}</b> · ${pct(x.change)}</div>`).join('')||'<div class="hint">아직 거래 기록이 없어.</div>'}</div></div></div></div></div>`;
}
window.trade=(id,dir)=>{const input=document.querySelector(`#qty-${id}`);const qty=Math.max(1,Number(input?.value||1));const cost=qty*state.prices[id]*100000;if(dir===1){if(state.cash<cost)return alert('현금이 부족해.');state.cash-=cost;state.holdings[id]+=qty;state.history.push({day:state.day,text:`${ASSETS.find(a=>a.id===id).name} ${qty}주 매수`,change:0})}else{if(state.holdings[id]<qty)return alert('보유 수량이 부족해.');state.cash+=cost;state.holdings[id]-=qty;state.history.push({day:state.day,text:`${ASSETS.find(a=>a.id===id).name} ${qty}주 매도`,change:0})}render()};
window.nextDay=()=>{if(state.day>=30){state.ended=true;renderResult();return} const event=EVENTS[Math.floor(Math.random()*EVENTS.length)];state.event=event;ASSETS.filter(a=>a.id!=='cash').forEach(a=>{let change=(Math.random()*2-1)*a.vol*100;if(event[2]===a.id)change+=event[3]*100;state.prices[a.id]*=(1+change/100);state.history.push({day:state.day,asset:a.id,text:`${a.name} 시장 변동`,change})});state.day++;render()};
function renderResult(){const v=portfolio(),r=(v/10000000-1)*100;const rank=r>=50?'상위 3%':r>=20?'상위 12%':r>=0?'상위 38%':'하위 42%';document.querySelector('#app').innerHTML=`<div class="result"><div class="result-box"><div class="brand">WEALTH <span>RUSH</span></div><div class="rank">🏆 ${rank}</div><div class="final">${money(v)}</div><p>30일간의 투자 결과야.</p><div class="result-grid"><div class="stat"><div class="label">최종 수익률</div><strong class="${r>=0?'up':'down'}">${pct(r)}</strong></div><div class="stat"><div class="label">초기 자산</div><strong>${money(10000000)}</strong></div></div><button class="primary" onclick="seed()">다시 도전</button></div></div>`}
seed();
