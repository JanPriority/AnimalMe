/* ============================================================
   POST /api/score   (animal-me.com)
   ------------------------------------------------------------
   Body (JSON):
     { answers: { qid: value | [values] | number, ... } }

   Returns:
     { animal: 'SOK', color: 'RUD' }

   The answer -> animal/colour mapping lives ONLY here, on the
   server, so it can't be read out of the page source. The
   browser sends the raw answers, gets back just the result;
   nothing is stored.
   ============================================================ */

const ANIMAL_SCORES = {
  q2:{'velmi citlivý':{PND:2,SOV:1,JEL:1},'středně':{LIS:1},'málo citlivý':{SOK:1,MED:1},'vyhledávající':{LEV:2,PAN:1,KOL:1,VYD:1,DEL:1}},
  q4:{'brzy ráno':{JEL:1,MED:1,SOK:1},'dopoledne':{LIS:1,TUC:1,LAB:1},'odpoledne':{VYD:1,PND:1},'večer':{SOV:2,PAN:1,KOL:1}},
  q5:{'vytrvalostní':{SOK:1,JEL:1},'silový':{MED:1,LEV:1},'flexibilita':{LAB:1,PND:1,SOV:1},'adrenalin':{PAN:2,LEV:1,KOL:1},'tanec':{DEL:1,VYD:1},'žádný':{SOV:1,PND:1}},
  q8:{'samota doma':{SOV:2,PND:1,LAB:1},'blízký člověk':{TUC:1,MED:1,JEL:1},'malá skupina':{LIS:1,TUC:1,DEL:1},'velká akce':{LEV:2,DEL:1,VYD:1},'příroda':{JEL:2,MED:1,PAN:1}},
  q9:{'přímý':{SOK:2,LEV:1,ORL:1},'diplomatický':{JEL:1,TUC:1,DEL:1},'nepřímo':{PND:1,LAB:1},'písemně':{SOV:1,LIS:1},'činy':{MED:1,PAN:1}},
  q10:{'lídr':{LEV:2,ORL:2},'stratég':{SOK:2,ORL:1,SOV:1},'spojovatel':{DEL:2,TUC:1},'nezávislý':{PAN:1,LIS:1,SOK:1},'pozorovatel':{SOV:1,PND:1,LAB:1,JEL:1}},
  q11:{'hned':{VYD:1,LEV:1,DEL:1},'středně':{LIS:1,TUC:1},'pomalu':{PND:2,LAB:1,SOV:1},'selektivně':{PAN:1,LAB:1,SOK:1}},
  q16:{'analyticky':{SOV:2,SOK:1,ORL:1},'intuitivně':{DEL:1,PND:1,JEL:1},'vizuálně':{LIS:1,KOL:1},'diskuzí':{DEL:1,LEV:1},'prakticky':{MED:1,VYD:1,SOK:1}},
  q17:{'generalista':{KOL:2,LIS:1,DEL:1},'specialista':{ORL:1,SOV:1,SOK:1},'T-shape':{LIS:1,JEL:1},'sériový':{KOL:1,VYD:1}},
  q19:{'krátce':{KOL:2,VYD:1,DEL:1},'střední':{LIS:1,TUC:1},'dlouho':{SOV:1,JEL:1,MED:1,LAB:1},'hyperfokus':{ORL:2,SOK:1,PAN:1},'záleží':{LIS:1,KOL:1}},
  q24:{'zvědavost':{LIS:2,KOL:1,SOV:1},'mistrovství':{ORL:2,SOK:1},'svoboda':{PAN:2,KOL:1,VYD:1,LAB:1},'dopad':{DEL:1,LEV:1,TUC:1},'bezpečí':{MED:2,JEL:1,TUC:1,PND:1},'uznání':{LEV:2,ORL:1}},
  q25:{'vzrušení':{KOL:1,VYD:1,LEV:1,PAN:1,DEL:1},'opatrný optimismus':{LIS:1,SOK:1,JEL:1},'úzkost':{PND:1,MED:1},'odpor':{JEL:1,MED:1,TUC:1},'záleží':{SOV:1,LAB:1}},
  q27:{'město':{LEV:1,KOL:1,DEL:1},'příroda':{JEL:2,MED:1,SOK:1,PAN:1},'předměstí':{TUC:1,PND:1},'u vody':{LAB:2,DEL:1,VYD:1},'kdekoliv':{LIS:1}},
  q28:{'hodně':{TUC:1,MED:1,SOK:1,ORL:1},'mírná':{JEL:1,SOV:1,TUC:1,LAB:1},'málo':{VYD:1,KOL:1,LIS:1},'žádná':{VYD:2,PAN:1,KOL:1}}
};
const COLOR_SCORES = {
  q7:{'fyzicky':{OLI:1},'emocionálně':{LOS:1,RUD:1},'kognitivně':{SAF:1},'útlum':{SAF:1,MAT:1},'akce':{RUD:1,JAN:1}},
  q13:{'úzkost':{SAF:1,LOS:1},'smutek':{SAF:2,SVE:1},'hněv':{RUD:2},'nadšení':{JAN:2,RUD:1},'klid':{OLI:2,MAT:1}},
  q14:{'mluvením':{LOS:2,JAN:1},'přemýšlením':{SAF:2,MAT:1},'tělem':{RUD:1,OLI:1},'kreativně':{SVE:2,JAN:1},'potlačením':{MAT:1,OLI:1}},
  q15:{'finanční stabilita':{OLI:1},'blízcí lidé':{LOS:2},'kontrola':{MAT:1,OLI:1},'smysl':{SAF:1,SVE:1},'zdraví':{OLI:1}},
  q18:{'aphantasia':{MAT:1,SAF:1},'slabá':{OLI:1},'průměrná':{},'silná':{SVE:1},'hyperphantasia':{SVE:2}},
  q20:{'fyzický vzhled':{RUD:1},'inteligence':{SAF:1,MAT:1},'humor':{JAN:2},'laskavost':{LOS:2},'ambice':{RUD:1},'tajemnost':{SVE:2}},
  q22:{'jistý':{OLI:2},'úzkostný':{LOS:1,SAF:1},'vyhýbavý':{MAT:2},'dezorganizovaný':{SVE:1,RUD:1},'nevím':{SAF:1}},
  q23:{'centrální':{RUD:2},'důležitá':{RUD:1,JAN:1},'kontextuální':{LOS:1,SVE:1},'okrajová':{MAT:1},'minimální':{SAF:1,MAT:1}},
  q30:{'tvorba':{SVE:2},'poznání':{SAF:1,MAT:1},'péče':{LOS:2},'krása':{SVE:1,JAN:1},'spojení':{LOS:1,JAN:1},'řád':{OLI:2}}
};
// slider buckets -> color points
function sliderColor(q,val){
  if(q==='q12'){ if(val>=8)return{RUD:2,LOS:1}; if(val>=6)return{JAN:1,LOS:1}; if(val>=4)return{OLI:1}; return{OLI:1,MAT:1,SAF:1}; }
  if(q==='q21'){ if(val>=8)return{LOS:2}; if(val>=6)return{LOS:1,JAN:1}; if(val>=4)return{OLI:1}; return{MAT:2}; }
  if(q==='q26'){ if(val<=3)return{SVE:1,JAN:1}; if(val>=8)return{RUD:1,OLI:1}; return{}; }
  return{};
}
const TIEBREAK_A=['PAN','SOK','ORL','LAB','PND','SOV','LIS','JEL','MED','TUC','VYD','KOL','DEL','LEV'];
const TIEBREAK_C=['SVE','SAF','MAT','RUD','OLI','LOS','JAN'];

function addPts(acc,map){ for(const k in map) acc[k]=(acc[k]||0)+map[k]; }
function pickTop(pts,order){
  let best=null,bestv=-1;
  for(const k of order){ const v=pts[k]||0; if(v>bestv){bestv=v;best=k;} }
  return bestv>0?best:order[0];
}
// answers: {qid: value | [values] | number}
function computeResult(answers){
  const a={},c={};
  for(const q in ANIMAL_SCORES){
    const ans=answers[q]; if(ans==null) continue;
    if(Array.isArray(ans)) ans.forEach(v=>{ if(ANIMAL_SCORES[q][v]) addPts(a,ANIMAL_SCORES[q][v]); });
    else if(ANIMAL_SCORES[q][ans]) addPts(a,ANIMAL_SCORES[q][ans]);
  }
  for(const q in COLOR_SCORES){
    const ans=answers[q]; if(ans==null) continue;
    if(Array.isArray(ans)) ans.forEach(v=>{ if(COLOR_SCORES[q][v]) addPts(c,COLOR_SCORES[q][v]); });
    else if(COLOR_SCORES[q][ans]) addPts(c,COLOR_SCORES[q][ans]);
  }
  ['q12','q21','q26'].forEach(q=>{ if(typeof answers[q]==='number') addPts(c,sliderColor(q,answers[q])); });
  return { animal: pickTop(a,TIEBREAK_A), color: pickTop(c,TIEBREAK_C) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch (_) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON.' }) }; }

  const answers = (payload && typeof payload.answers === 'object' && payload.answers) ? payload.answers : null;
  if (!answers) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing answers.' }) };
  }

  const result = computeResult(answers);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(result)
  };
};
