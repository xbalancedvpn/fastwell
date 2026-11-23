(()=>{
'use strict';
const B=window.FastWellBridge;if(!B)return;
const $=id=>document.getElementById(id);
const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const flags=[['pregnant','Pregnant, trying to conceive, or breastfeeding'],['diabetes','Diabetes or medicine that lowers blood sugar (e.g. insulin)'],['eating','Current or past eating disorder or restrictive eating'],['medical','Condition or medicine affected by meal timing, or advised to eat regularly'],['underweight','Unintentional weight loss or undernutrition']];
const fields=['name','age','heightCm','weightKg','sleepAt','wakeAt','breakfastAt','lunchAt','dinnerAt','snackAt','work','exercise','breakfastFood','lunchFood','dinnerFood','snackFood','diet','allergies','goal','experience','health'];
let page=0,p={};
function field(name,label,type='text',placeholder='',extra=''){return '<label class="fw-assess-field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" placeholder="'+placeholder+'" value="'+escapeText(p[name]||'')+'" '+extra+'></label>';}
function select(name,label,options){return '<label class="fw-assess-field"><span>'+label+'</span><select name="'+name+'">'+options.map(o=>'<option value="'+o[0]+'"'+(p[name]===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>';}
function textarea(name,label,placeholder){return '<label class="fw-assess-field"><span>'+label+'</span><textarea name="'+name+'" maxlength="200" placeholder="'+placeholder+'">'+escapeText(p[name]||'')+'</textarea></label>';}
function bmi(){return Number(p.weightKg)/(Number(p.heightCm)/100)**2;}
function description(){let b=bmi();return Number(p.age)<20?'Age-specific BMI assessment needed':b<18.5?'Below standard adult BMI range':b<25?'Within standard adult BMI range':b<30?'Above standard adult BMI range':'Higher than standard adult BMI range';}
function canStart(){return Number(p.age)>=20&&Number(p.age)<=70&&bmi()>=18.5&&p.health==='clear'&&(!p.flags||p.flags.length===0);}
function timeString(val){if(!/^\d{2}:\d{2}$/.test(val||''))return 'not specified';let a=val.split(':').map(Number);return (a[0]%12||12)+':'+String(a[1]).padStart(2,'0')+(a[0]>=12?' PM':' AM');}
function timePlus(v,h){if(!v||!/^\d{2}:\d{2}$/.test(v))return null;let a=v.split(':').map(Number);let n=(a[0]*60+a[1]+h*60)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function renderPage(){
 const headings=['Your starting point','Your health comes first','Your daily routine','Your usual meals','Your personal starting plan'];
 $('fw-assess-step').textContent='Step '+(page+1)+' of 5';
 $('fw-assess-progress-value').style.width=((page+1)*20)+'%';
 let html='<div class="fw-assess-eyebrow">FASTWELL PERSONAL ASSESSMENT</div><h1>'+headings[page]+'</h1>';
 if(page===0)html+='<p>Tell us a little about you. We will calculate an adult BMI screening value, not diagnose your health.</p><div class="fw-assess-grid">'+field('name','Name (optional)','text','What should we call you?','maxlength="40"')+field('age','Age (years)','number','e.g. 29','min="1" max="110"')+field('heightCm','Height (cm)','number','e.g. 165','min="80" max="250" step="0.1"')+field('weightKg','Weight (kg)','number','e.g. 72','min="20" max="400" step="0.1"')+'</div><div class="fw-assess-note">Your information stays on this phone and is included in local backups.</div>';
 if(page===1)html+='<p>Fasting is not appropriate for everybody. Tick any that apply. We will not recommend a schedule if medical review may be needed.</p>'+flags.map(([id,label])=>'<label class="fw-assess-flag"><input type="checkbox" data-flag="'+id+'" '+((p.flags||[]).includes(id)?'checked':'')+'><span>'+label+'</span></label>').join('')+select('health','Please confirm your situation',[['unsure','I am unsure / would like medical guidance'],['clear','None of these apply to me'],['review','My health or medicines need review']])+'<div class="fw-assess-inline">Under 20, pregnancy, diabetes medications, eating disorder history or underweight status require individualized guidance rather than automated fasting suggestions.</div>';
 if(page===2)html+='<p>Our suggested meal timing should respect your sleep and work. You can adjust all times later.</p><div class="fw-assess-grid">'+field('sleepAt','Usually asleep by','time')+field('wakeAt','Usually wake up','time')+field('breakfastAt','Breakfast time','time')+field('lunchAt','Lunch time','time')+field('dinnerAt','Dinner time','time')+field('snackAt','Snack time (optional)','time')+select('work','Daily schedule',[['day','Daytime'],['night','Night shift'],['variable','Rotating / variable'],['home','Flexible / home']])+select('exercise','Activity level',[['light','Light'],['moderate','Moderate'],['heavy','Heavy training / physical work']])+'</div>';
 if(page===3)html+='<p>What do you usually eat? We will build on familiar foods and avoid restrictive meal rules.</p><div class="fw-assess-grid">'+textarea('breakfastFood','Usual breakfast','eggs and pandesal')+textarea('lunchFood','Usual lunch','rice and chicken')+textarea('dinnerFood','Usual dinner','rice, fish and vegetables')+textarea('snackFood','Usual snacks','banana')+textarea('diet','Food preferences / restrictions','Budget, vegetarian, etc.')+textarea('allergies','Food allergies','Optional')+select('goal','Primary goal',[['wellness','General wellness'],['weight','Weight management'],['energy','Energy / routine'],['sleep','Better meal and sleep timing']])+select('experience','Fasting experience',[['new','I am new'],['occasional','Tried it before'],['regular','Already familiar']])+'</div>';
 if(page===4){
 const b=bmi(),ok=canStart();
 html+='<p>Your answers shape a gentle routine. BMI alone does not determine fasting suitability.</p><div class="fw-assess-metrics"><div class="fw-assess-metric"><span>Height</span><strong>'+escapeText(p.heightCm)+' cm</strong></div><div class="fw-assess-metric"><span>Weight</span><strong>'+escapeText(p.weightKg)+' kg</strong></div><div class="fw-assess-metric"><span>BMI</span><strong>'+b.toFixed(1)+'</strong></div></div><div class="fw-assess-note">BMI category: '+description()+'. BMI is a screening measure only.</div>';
 html+='<div class="fw-assess-summary"><span>'+(ok?'BEGINNER SUGGESTION':'HEALTH-FIRST RECOMMENDATION')+'</span><strong>'+(ok?'12:12 fasting':'Regular meals first')+'</strong><small>'+(ok?'Begin with 12 fasting hours overnight and a 12-hour eating window for at least 2 weeks. There is no obligation to progress to longer fasts.':'Personalized fasting guidance is paused. Please consult your clinician if you want to consider fasting. You can still use the meal, water and weight trackers.')+'</small></div>';
 if(ok)html+='<div class="fw-assess-note"><strong>Weeks 1–2:</strong> Try 12:12 only if comfortable. <strong>Weeks 3–4:</strong> Continue 12:12, or consider 13:11 and at most 14:10 if appropriate and well tolerated—never increase automatically. <strong>Example window:</strong> Finish dinner at '+timeString(p.dinnerAt)+'; the earliest next meal for a 12-hour window would be '+timeString(timePlus(p.dinnerAt,12))+'. Keep sufficient meals and do not sacrifice sleep.</div>';
 html+='<h2 style="margin:20px 0 8px">Meal and sleep suggestions</h2><ul class="fw-assess-bullet"><li>Keep familiar meals such as '+escapeText([p.breakfastFood,p.lunchFood,p.dinnerFood].filter(Boolean).join(', ')||'rice, vegetables, fruit and protein foods')+'. Add protein, vegetables and adequate carbohydrates according to your needs.</li><li>Usual bedtime: '+timeString(p.sleepAt)+'; wake time: '+timeString(p.wakeAt)+'. Aim for adequate sleep and a consistent daily routine.</li><li>Do not skip essential meals. Stop if you feel dizzy, weak or unwell. This educational plan is not medical advice.</li></ul>';
 }
 $('fw-assess-form').innerHTML=html;
 $('fw-assess-prev').hidden=page===0;
 $('fw-assess-next').textContent=page===4?'Save assessment & open FastWell':'Continue';
 $('fw-assess-error').textContent='';
 $('fw-assess-layer').scrollTop=0;
}
function collect(){
 for(const el of $('fw-assess-form').querySelectorAll('[name]'))p[el.name]=el.value;
 if(page===1)p.flags=Array.from($('fw-assess-form').querySelectorAll('[data-flag]:checked')).map(x=>x.dataset.flag);
}
function valid(){
 if(page!==0)return true;
 for(const [name,min,max] of [['age',1,110],['heightCm',80,250],['weightKg',20,400]]){
 const n=Number(p[name]);if(p[name]===''||!Number.isFinite(n)||n<min||n>max){$('fw-assess-error').textContent='Please enter a valid '+name+' between '+min+' and '+max+'.';return false;}
 }
 return true;
}
function open(force=false){
 if(!force&&B.getProfile())return;
 p=Object.assign({name:'',age:'',heightCm:'',weightKg:'',health:'unsure',flags:[],work:'day',exercise:'light',goal:'wellness',experience:'new',sleepAt:'22:00',wakeAt:'06:00',breakfastAt:'07:00',lunchAt:'12:00',dinnerAt:'19:00',snackAt:'15:00'},B.getProfile()||{});
 page=0;$('fw-assess-layer').hidden=false;document.body.style.overflow='hidden';renderPage();
}
function close(){$('fw-assess-layer').hidden=true;document.body.style.overflow='';}
function renderSummary(){
 const prof=B.getProfile();if(!prof){const box=$('fw-assess-today');if(box)box.innerHTML='';return;}
 const b=Number(prof.weightKg)/(Number(prof.heightCm)/100)**2;
 const box=$('fw-assess-today');if(!box)return;
 box.innerHTML='<div class="fw-assess-status">YOUR ASSESSMENT</div><h2>'+(B.canRecommendFast()?'Suggested starter: 12:12':'Regular-meal guidance; fasting paused')+'</h2><p>Height '+escapeText(prof.heightCm)+' cm · Weight '+escapeText(prof.weightKg)+' kg · BMI '+b.toFixed(1)+'</p><p>'+(B.canRecommendFast()?'Begin with 2 weeks at 12:12, if comfortable. No forced increase.':'Review suitability with a clinician before fasting. Other trackers remain available.')+'</p><button type="button" data-fw-retake>Edit / review assessment</button>';
}
const overlay=document.createElement('div');overlay.id='fw-assess-layer';overlay.className='fw-assess-layer';overlay.hidden=true;
overlay.innerHTML='<div class="fw-assess-container"><div class="fw-assess-head"><span class="fw-assess-brand">fast<span>well</span></span><span id="fw-assess-step" class="fw-assess-stepnum"></span></div><div class="fw-assess-progress"><span id="fw-assess-progress-value"></span></div><section class="fw-assess-card"><form id="fw-assess-form"></form><div id="fw-assess-error" class="fw-assess-error" role="alert"></div><div class="fw-assess-actions"><button type="button" id="fw-assess-prev" class="fw-assess-btn">Back</button><button type="button" id="fw-assess-next" class="fw-assess-btn fw-assess-btn-primary">Continue</button></div></section></div>';
document.body.appendChild(overlay);
const summary=document.createElement('div');summary.id='fw-assess-today';summary.className='fw-assess-today';const dash=$('view-today')?.querySelector('.dashboard-grid');if(dash)dash.before(summary);
const settings=$('settingsForm');if(settings){const panel=document.createElement('section');panel.className='white-card fw-assess-settings';panel.innerHTML='<div class="panel-title"><div><div class="mini-label">YOUR ASSESSMENT</div><h2>Personal health and routine</h2></div></div><p class="card-copy">Review height, weight, health screening, meal choices and sleep schedule.</p><button type="button" class="outline-btn" data-fw-retake>Review / update assessment</button>';settings.closest('.content-grid')?.after(panel);}
$('fw-assess-next').addEventListener('click',()=>{collect();if(!valid())return;if(page<4){page++;renderPage();return;}const saved=Object.assign({},p,{version:1,age:Number(p.age),heightCm:Number(p.heightCm),weightKg:Number(p.weightKg),completedAt:new Date().toISOString()});try{B.applyProfile(saved);close();renderSummary();}catch(e){$('fw-assess-error').textContent='Unable to save assessment. Please review your details.';}});
$('fw-assess-prev').addEventListener('click',()=>{collect();if(page>0){page--;renderPage();}});
document.addEventListener('click',e=>{if(e.target.closest('[data-fw-retake]'))open(true);});
window.FastWellAssess={openIfNeeded:()=>open(false),render:renderSummary,close};renderSummary();open(false);
})();