
export const storage = {
  get(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback }
  },
  set(key, val){
    localStorage.setItem(key, JSON.stringify(val));
  }
};

export const settings = storage.get("rp_settings", {
  theme: "dark", // dark | light | system
  sound: true,
  haptics: true,
  mode: "rotary", // rotary | keypad
});

export const contacts = storage.get("rp_contacts", [
  {name:"Operator", number:"123"},
  {name:"Pizza", number:"5551234"}
]);

export const callLog = storage.get("rp_log", []);

export function saveAll(){
  storage.set("rp_settings", settings);
  storage.set("rp_contacts", contacts);
  storage.set("rp_log", callLog);
}

export function addLog(entry){
  callLog.unshift({...entry, ts: Date.now()});
  saveAll();
}
