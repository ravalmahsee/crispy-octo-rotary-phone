
import {settings, saveAll, addLog} from "./state.js";
import {applyTheme, mountSettings, listContacts, addContact, listLog, mountKeypad, vibrate} from "./ui.js";

const $ = (s, el=document)=> el.querySelector(s);

const el = {
  dial: $("#dial"),
  holes: $("#holes"),
  digits: $("#digits"),
  status: $("#status"),
  btnBack: $("#btnBack"),
  btnClear: $("#btnClear"),
  btnCall: $("#btnCall"),
  btnEnd: $("#btnEnd"),
  btnDemo: $("#btnDemo"),
  click: $("#snd-click"),
  ring: $("#snd-ring"),
  busy: $("#snd-busy"),
  modal: $("#helpModal"),
};

const state = {
  number: "",
  calling: false,
  currentRot: 0,
  dragging: false,
  startAngle: 0,
  stopperAngle: 58,
};

function status(msg){ el.status.textContent = msg; }
function pretty(s){
  if(s.length <= 3) return s;
  if(s.length <= 7) return s.replace(/(\d{3})(\d+)/,'$1-$2');
  return s.replace(/(\d{3})(\d{3})(\d+)/,'($1) $2-$3');
}
function render(){ el.digits.textContent = state.number.length ? pretty(state.number) : "—"; }

function play(aud, vol=1){ try{ if(!settings.sound) return; aud.pause(); aud.currentTime=0; aud.volume = vol; aud.play(); }catch{} }

function angleFromEvent(e){
  const rect = el.dial.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const p = (e.touches && e.touches[0]) ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : {x:e.clientX,y:e.clientY};
  const dx = p.x - cx, dy = p.y - cy;
  let deg = (Math.atan2(dy, dx) * 180/Math.PI);
  deg = (deg + 360 + 90) % 360;
  return deg;
}

function pulse(n){
  const pulses = (n === 0)? 10 : n;
  let c = 0;
  status("Dialing " + n + "…");
  const tick = () => {
    c++; play(el.click, .75);
    if(c < pulses) setTimeout(tick, 38);
    else { appendDigit(String(n)); status("Ready"); }
  };
  tick();
}

function setNumber(num){ state.number = String(num || ""); render(); }
function appendDigit(d){ state.number += d; render(); }
function backspace(){ state.number = state.number.slice(0,-1); render(); }

function initHoles(){
  const layout = [1,2,3,4,5,6,7,8,9,0];
  const radius = 110;
  const center = {x: 150, y: 150};

  layout.forEach((n,i)=>{
    const a = (i * 30) - 60;
    const rad = a * Math.PI/180;
    const x = center.x + radius * Math.cos(rad) - 30;
    const y = center.y + radius * Math.sin(rad) - 30;

    const hole = document.createElement('div');
    hole.className = "hole"; hole.style.left = x + "px"; hole.style.top  = y + "px";
    hole.innerHTML = `<span>${n}</span>`;

    const onStart = (e)=>{ e.preventDefault(); state.dragging = true; state.startAngle = angleFromEvent(e); vibrate(10); };
    const onMove = (e)=>{
      if(!state.dragging) return;
      const a = angleFromEvent(e);
      let diff = a - state.startAngle;
      diff = Math.max(0, Math.min(state.stopperAngle, diff));
      el.holes.style.setProperty('--rot', diff + 'deg');
      state.currentRot = diff;
    };
    const onEnd = ()=>{
      if(!state.dragging) return;
      state.dragging = false;
      if(state.currentRot > 12) pulse(n);
      el.holes.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)';
      el.holes.style.setProperty('--rot','0deg');
      setTimeout(()=> el.holes.style.transition='', 360);
    };

    hole.addEventListener('mousedown', onStart);
    hole.addEventListener('touchstart', onStart, {passive:false});
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    el.holes.appendChild(hole);
  });
}

let ringTimer = null;
function endCall(userEnded){
  if(ringTimer) clearInterval(ringTimer);
  state.calling = false;
  el.btnEnd.disabled = true;
  el.btnCall.disabled = false;
  status(userEnded ? "Call ended" : "Call failed");
  if(state.number) addLog({number: state.number, status: userEnded ? "Ended" : "Failed"});
}

function startCall(){
  if(!state.number){ status("Enter a number first"); return; }
  if(state.calling) return;
  state.calling = true;
  el.btnEnd.disabled = false;
  el.btnCall.disabled = true;
  status("Calling " + pretty(state.number) + " …");
  let rings = 0;
  ringTimer = setInterval(()=>{
    rings++; play(el.ring, .95);
    if(rings === 4){
      clearInterval(ringTimer);
      play(el.busy, .8);
      status("Line busy");
      endCall(false);
    }
  }, 1600);
}

function bindUI(){
  el.btnBack.addEventListener('click', ()=>{ backspace(); });
  el.btnClear.addEventListener('click', ()=>{ setNumber(""); status("Cleared"); });
  el.btnDemo.addEventListener('click', ()=>{ setNumber("1234567"); status("Demo number typed"); });
  el.btnCall.addEventListener('click', startCall);
  el.btnEnd.addEventListener('click', ()=> endCall(true));

  // keypad / number events
  document.addEventListener("rp:append-digit", e=> appendDigit(e.detail));
  document.addEventListener("rp:set-number", e=> setNumber(e.detail));

  window.addEventListener('keydown', (e)=>{
    if(/\d|\*|#/.test(e.key)){ appendDigit(e.key); status("Key " + e.key); }
    else if(e.key === 'Backspace'){ backspace(); }
    else if(e.key === 'Enter'){ startCall(); }
    else if(e.key.toLowerCase() === 'c'){ setNumber(""); status("Cleared"); }
  });

  // Help modal
  $("#btnHelp").addEventListener("click", ()=> el.modal.classList.add("show"));
  $("#btnCloseHelp").addEventListener("click", ()=> el.modal.classList.remove("show"));

  // Contacts
  $("#btnAddContact").addEventListener("click", ()=>{
    const name = prompt("Contact name?");
    const number = prompt("Number?");
    if(name && number){ addContact(name, number); }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme();
  mountSettings();
  initHoles();
  bindUI();
  listContacts();
  listLog();
  render();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }
});
