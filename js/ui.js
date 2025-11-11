
import {settings, contacts, callLog, saveAll, addLog} from "./state.js";
import {dtmf} from "./dtmf.js";

const $ = (s, el=document)=> el.querySelector(s);
const $$ = (s, el=document)=> [...el.querySelectorAll(s)];

export function applyTheme(){
  const root = document.documentElement;
  root.classList.remove("theme-light");
  if(settings.theme === "light") root.classList.add("theme-light");
  if(settings.theme === "system"){
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    if(prefersLight) root.classList.add("theme-light");
  }
}

export function mountSettings(){
  applyTheme();
  $("#selTheme").value = settings.theme;
  $("#chkSound").checked = settings.sound;
  $("#chkHaptics").checked = settings.haptics;
  $("#selMode").value = settings.mode;

  $("#selTheme").addEventListener("change", e=>{ settings.theme = e.target.value; saveAll(); applyTheme(); });
  $("#chkSound").addEventListener("change", e=>{ settings.sound = e.target.checked; saveAll(); });
  $("#chkHaptics").addEventListener("change", e=>{ settings.haptics = e.target.checked; saveAll(); });
  $("#selMode").addEventListener("change", e=>{
    settings.mode = e.target.value; saveAll();
    document.body.dataset.mode = settings.mode;
    $("#tab-rotary").classList.toggle("active", settings.mode==="rotary");
    $("#tab-keypad").classList.toggle("active", settings.mode==="keypad");
    $("#panel-rotary").style.display = settings.mode==="rotary" ? "" : "none";
    $("#panel-keypad").style.display = settings.mode==="keypad" ? "" : "none";
  });

  document.body.dataset.mode = settings.mode;
  $("#tab-rotary").classList.toggle("active", settings.mode==="rotary");
  $("#tab-keypad").classList.toggle("active", settings.mode==="keypad");
  $("#panel-rotary").style.display = settings.mode==="rotary" ? "" : "none";
  $("#panel-keypad").style.display = settings.mode==="keypad" ? "" : "none";
}

export function vibrate(pat){ try{ if(settings.haptics && navigator.vibrate) navigator.vibrate(pat) }catch{} }

export function listContacts(){
  const wrap = $("#contacts");
  wrap.innerHTML = "";
  contacts.forEach((c, idx)=>{
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<div class="name">${c.name}</div><div class="num">${c.number}</div><div class="spacer"></div>
      <button data-dial="${idx}" class="btn good">Call</button>
      <button data-del="${idx}" class="btn danger">Delete</button>`;
    wrap.appendChild(div);
  });
  wrap.addEventListener("click", (e)=>{
    const d = e.target.dataset;
    if("dial" in d){
      const i = +d.dial; const c = contacts[i];
      $("#digits").textContent = c.number;
      document.dispatchEvent(new CustomEvent("rp:set-number", {detail: c.number}));
      $("#btnCall").click();
    }else if("del" in d){
      contacts.splice(+d.del, 1); saveAll(); listContacts();
    }
  }, {once:true});
}

export function addContact(name, number){
  if(!name || !number) return;
  contacts.push({name, number});
  saveAll(); listContacts();
}

export function listLog(){
  const wrap = $("#calllog");
  wrap.innerHTML = "";
  callLog.forEach((l, idx)=>{
    const d = new Date(l.ts);
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<div class="name">${l.status}</div>
      <div class="num">${l.number}</div>
      <div class="spacer"></div>
      <div class="pill">${d.toLocaleString()}</div>`;
    wrap.appendChild(div);
  });
}

export function mountKeypad(){
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  $$("#keypad .btn").forEach(b=>{
    b.addEventListener("click", ()=>{
      const digit = b.dataset.key;
      document.dispatchEvent(new CustomEvent("rp:append-digit", {detail: String(digit)}));
      if(settings.sound) dtmf(ctx, String(digit), 0.11, 0.2);
      vibrate(15);
    });
  });
}
