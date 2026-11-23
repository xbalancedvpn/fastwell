/* FastWell account beta — data is local first. Cloud sync requires explicit consent. */
(()=>{
'use strict';
const B=window.FastWellBridge;if(!B)return;
const SUPABASE_URL='https://rgdkkswwlglkqeepgear.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_Pb2FonKDfNGMNsOHAnzeQw_wJEP5FEo';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let client=null,user=null,initialized=false,ready=false,cloudRev=null,busy=false,flushTimer=0,suppress=false,offlinePending=false,changeCounter=0;
const appUrl=location.origin+location.pathname;
function metaKey(uid){return 'fastwell-sync-meta-'+uid;}
function localMeta(){try{return JSON.parse(localStorage.getItem(metaKey(user.id))||'{}')}catch{return {};}}
function setMeta(data){if(user)localStorage.setItem(metaKey(user.id),JSON.stringify({...localMeta(),...data}));}
function hasLocalData(s){
 return !!(s?.profile||s?.activeFast||s?.fasts?.length||s?.meals?.length||s?.weights?.length||Object.keys(s?.water||{}).length||Object.keys(s?.mealPlan||{}).length);
}
function dialog(html,locked=false){
 $('fw-cloud-dialog').innerHTML=html;
 $('fw-cloud-mask').hidden=false;
 $('fw-cloud-mask').dataset.locked=locked?'yes':'no';
}
function close(){if($('fw-cloud-mask').dataset.locked==='yes')return;$('fw-cloud-mask').hidden=true;}
function error(message){const e=$('fw-cloud-error');if(e)e.textContent=message||'';}
function setBusy(v){busy=v;document.querySelectorAll('#fw-cloud-dialog button').forEach(x=>x.disabled=v);}
function status(message){const el=$('fw-account-state');if(el)el.textContent=message;}
function setUI(){
 const name=$('fw-account-title'),actions=$('fw-account-actions');
 if(!name)return;
 if(!user){name.textContent='Guest mode';status('Saved on this device only · Offline-ready');actions.innerHTML='<button type="button" data-cloud="open">Sign in / Create account</button>';return;}
 name.textContent='Signed in: '+(user.email||'FastWell account');
 const m=localMeta();
 status(ready?(m.dirty?'Not synced yet · Changes on this device':navigator.onLine?'Cloud sync enabled · Last synced '+(m.syncedAt?new Date(m.syncedAt).toLocaleString('en-PH'):'recently'):'Offline · Changes saved on device'):'Your account data is being prepared');
 actions.innerHTML='<button type="button" data-cloud="sync">Sync now</button><button type="button" data-cloud="signout">Sign out</button>';
}
const intro='<h2>FastWell Account</h2><p>Create an account for multi-device access and optional cloud backups. Guest data stays on this device until you choose to upload it.</p>';
function openAuth(mode='login'){
 if(!client){dialog(intro+'<p class="fw-cloud-error">Account service requires an internet connection on first sign in. You can continue as guest.</p><div class="fw-cloud-actions"><button data-cloud="close">Continue as Guest</button></div>');return;}
 const isSignup=mode==='signup',isReset=mode==='reset';
 dialog(intro+'<div class="fw-cloud-notice">Private wellness records are stored with Supabase only after you approve cloud sync. Continue as Guest to use FastWell without an account.</div><form id="fw-auth-form"><label>Email<input id="fw-auth-email" type="email" required autocomplete="email"></label>'+(isReset?'':'<label>Password<input id="fw-auth-password" type="password" required minlength="8" autocomplete="'+(isSignup?'new-password':'current-password')+'"></label>')+
 '<div id="fw-cloud-error" class="fw-cloud-error" role="alert"></div><div class="fw-cloud-actions"><button type="submit" class="primary">'+(isReset?'Send recovery link':isSignup?'Create account':'Sign in')+'</button><button type="button" data-cloud="close">Continue as Guest</button></div></form><div class="fw-cloud-actions">'+(isSignup?'<button data-cloud="login">Already have an account?</button>':'<button data-cloud="signup">Create an account</button>')+(!isSignup&&!isReset?'<button data-cloud="reset">Forgot password?</button>':'')+'</div><p class="smallprint">Do not reuse passwords. We never ask you to share your password in chat.</p>');
 $('fw-auth-form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;setBusy(true);error('');
 const email=$('fw-auth-email').value.trim(),password=$('fw-auth-password')?.value;
 try{
 if(isReset){const {error:err}=await client.auth.resetPasswordForEmail(email,{redirectTo:appUrl});if(err)throw err;dialog('<h2>Check your email</h2><p>If this email has an account, a recovery link has been requested.</p><button data-cloud="close">Continue as Guest</button>');return;}
 const result=isSignup?await client.auth.signUp({email,password,options:{emailRedirectTo:appUrl}}):await client.auth.signInWithPassword({email,password});
 if(result.error)throw result.error;
 if(isSignup&&!result.data.session){dialog('<h2>Verify your email</h2><p>We sent a confirmation email if your address is eligible. Open the confirmation link, then return to FastWell to sign in.</p><button data-cloud="close">Continue as Guest</button>');return;}
 $('fw-cloud-mask').hidden=true;
 }catch(err){error(err.message||'Unable to authenticate right now.');}finally{setBusy(false);}
 });
}
function decision(cloud){
 const local=B.getSnapshot(),localExists=hasLocalData(local),cloudExists=cloud&&hasLocalData(cloud.snapshot);

 let html='<h2>Choose your FastWell data</h2><p>We found '+(localExists?'records on this device':'no local records')+' and '+(cloudExists?'a cloud backup':'no cloud backup')+'. We will never silently overwrite your personal history.</p>';
 html+='<div class="fw-cloud-notice fw-cloud-warn">Cloud syncing means your fasting, weight, meals and assessment answers are stored in your private account on Supabase. Only approve uploading if you consent.</div>';
 if(cloud)html+='<div class="fw-cloud-actions"><button class="primary" data-cloud="usecloud">Use cloud records'+(localExists?' (replace this device)':'')+'</button></div>';
 if(localExists||!cloud)html+='<div class="fw-cloud-actions"><button data-cloud="upload">'+(localExists?'Upload this device':'Enable cloud sync for new records')+(cloud?' (replace cloud snapshot)':'')+'</button></div>';
 html+='<div class="fw-cloud-actions"><button data-cloud="localonly">Keep using this device offline (no cloud sync)</button><button data-cloud="signout">Sign out</button></div><p id="fw-cloud-error" class="fw-cloud-error"></p>';
 dialog(html,true);
 $('fw-cloud-mask').dataset.hasCloud=cloud?'yes':'no';
 $('fw-cloud-mask').dataset.cloudRevision=cloud?String(cloud.revision):'';
 window.__fastwellCloudChoice=cloud?{snapshot:cloud.snapshot,revision:cloud.revision}:null;
}
async function findCloud(){
 const {data,error:err}=await client.from('fastwell_user_data').select('snapshot,revision').eq('user_id',user.id).maybeSingle();
 if(err)throw err;return data;
}
async function activateAccount(nextUser){
 if(!nextUser||!nextUser.id)return;
 if(user?.id===nextUser.id&&initialized)return;
 user=nextUser;initialized=true;ready=false;cloudRev=null;
 B.switchStorage(user.id);setUI();
 try{
 const cloud=await findCloud();if(!user||user.id!==nextUser.id)return;
 const m=localMeta();
 if(m.consent===true&&m.dirty!==true&&cloud&&Number(m.revision)===Number(cloud.revision)){
 cloudRev=Number(cloud.revision);ready=true;setUI();return;
 }
 decision(cloud);
 }catch(err){dialog('<h2>Account connected</h2><p>Cloud records cannot be checked right now. Your existing data stays on this device. Try Sync later when online.</p><p class="fw-cloud-error">'+esc(err.message||'Connection error')+'</p><button data-cloud="localonly">Continue locally</button>',true);}
}
async function approveCloud(){
 const cloud=window.__fastwellCloudChoice;
 if(!user)return;
 const local=B.getSnapshot();
 const hasCloud=!!cloud;
 if(hasCloud&&!confirm('This will replace the CLOUD backup with records on THIS DEVICE. Save a backup first if you need the old data. Continue?'))return;
 setBusy(true);error('');
 try{
 let res;
 if(hasCloud){
 res=await client.from('fastwell_user_data').update({snapshot:local,revision:Number(cloud.revision)+1,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('revision',cloud.revision).select('revision');
 }else{
 res=await client.from('fastwell_user_data').insert({user_id:user.id,snapshot:local,revision:1}).select('revision');
 }
 if(res.error)throw res.error;
 if(!res.data?.length)throw Error('Cloud data changed on another device. Sign in again and review it before replacing.');
 cloudRev=Number(res.data[0].revision);setMeta({revision:cloudRev,consent:true,dirty:false,syncedAt:Date.now()});
 ready=true;$('fw-cloud-mask').dataset.locked='no';close();setUI();window.FastWellAssess?.openIfNeeded();window.FastWellAssess?.openIfNeeded();
 }catch(err){error(err.message||'Could not upload your records.');}finally{setBusy(false);}
}
function useCloud(){
 const cloud=window.__fastwellCloudChoice;if(!cloud){error('No cloud backup found');return;}
 if(hasLocalData(B.getSnapshot())&&!confirm('Replace records on this device with the cloud backup? Export your local backup first if necessary.'))return;
 suppress=true;try{B.replaceSnapshot(cloud.snapshot);}finally{suppress=false;}
 cloudRev=Number(cloud.revision);setMeta({revision:cloudRev,consent:true,dirty:false,syncedAt:Date.now()});
 ready=true;$('fw-cloud-mask').dataset.locked='no';close();setUI();
}
async function sync(){
 if(!user||!ready||busy||!navigator.onLine)return;
 const meta=localMeta();
 if(meta.consent!==true)return;
 busy=true;
 try{
 const snapshotCounter=changeCounter;const snap=B.getSnapshot();
 if(!meta.dirty){status('Cloud sync ready · No pending updates');return;}
 let query;
 if(cloudRev===null){
 const row=await findCloud();
 if(row){ready=false;decision(row);return;}
 query=await client.from('fastwell_user_data').insert({user_id:user.id,snapshot:snap,revision:1}).select('revision');
 }else{
 query=await client.from('fastwell_user_data').update({snapshot:snap,revision:cloudRev+1,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('revision',cloudRev).select('revision');
 }
 if(query.error)throw query.error;
 if(!query.data?.length)throw Error('The cloud has changed on another device. Please review before syncing.');
 cloudRev=Number(query.data[0].revision);const changedAgain=changeCounter!==snapshotCounter;setMeta({revision:cloudRev,dirty:changedAgain,consent:true,syncedAt:Date.now()});
 setUI();if(changedAgain)setTimeout(sync,1600);
 }catch(e){status('Sync paused: '+(e.message||'connection error')+'. Your data stays on device.');}finally{busy=false;}
}
function changed(){
 if(suppress||!ready||!user)return;
 changeCounter++;setMeta({dirty:true});setUI();
 clearTimeout(flushTimer);flushTimer=setTimeout(sync,1800);
}
async function signedOut(){
 if(client)await client.auth.signOut();
}
function setGuest(){
 clearTimeout(flushTimer);user=null;initialized=false;ready=false;cloudRev=null;
 B.switchStorage(null);setUI();
}
document.addEventListener('click',async e=>{
 const c=e.target.closest('[data-cloud]');if(!c)return;
 const act=c.dataset.cloud;
 if(act==='open'||act==='login'||act==='signup'||act==='reset'){openAuth(act==='open'?'login':act);return;}
 if(act==='close'){close();return;}
 if(act==='localonly'){$('fw-cloud-mask').dataset.locked='no';close();ready=false;setMeta({consent:false});setUI();window.FastWellAssess?.openIfNeeded();return;}
 if(act==='usecloud'){useCloud();return;}
 if(act==='upload'){await approveCloud();return;}
 if(act==='sync'){if(!ready){try{decision(await findCloud());}catch(err){status('Cannot reach cloud. Your local data is safe.');}}else await sync();return;}
 if(act==='signout'){await signedOut();setGuest();$('fw-cloud-mask').dataset.locked='no';close();return;}
});
window.addEventListener('fastwell:datachange',changed);
window.addEventListener('online',()=>{if(user&&ready&&localMeta().dirty)sync();else setUI();});
window.addEventListener('offline',setUI);
const bar=document.createElement('section');bar.className='fw-account-bar';bar.innerHTML='<div><strong id="fw-account-title">Guest mode</strong><p id="fw-account-state">Saved on this device only</p></div><div id="fw-account-actions" class="fw-account-actions"></div>';
const dash=$('view-today')?.querySelector('.dashboard-grid');if(dash)dash.before(bar);
const mask=document.createElement('div');mask.id='fw-cloud-mask';mask.className='fw-cloud-mask';mask.hidden=true;mask.innerHTML='<div id="fw-cloud-dialog" class="fw-cloud-dialog" role="dialog" aria-modal="true" aria-label="FastWell account"></div>';document.body.appendChild(mask);
const sdk=window.supabase;
if(sdk?.createClient){
 client=sdk.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'){if(user)setGuest();return;}
  if(session?.user&&!initialized)Promise.resolve().then(()=>activateAccount(session.user));
 });
 client.auth.getSession().then(({data,error})=>{if(error){status('Account service unavailable · Guest mode works');return;}if(data?.session?.user&&!initialized)activateAccount(data.session.user);}).catch(()=>{});
}else{status('Account service unavailable offline · Guest mode works');}
setUI();
})();