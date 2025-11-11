
// WebAudio DTMF tone generator (dual-sine per digit)
const F = {
  "1":[697,1209],"2":[697,1336],"3":[697,1477],
  "4":[770,1209],"5":[770,1336],"6":[770,1477],
  "7":[852,1209],"8":[852,1336],"9":[852,1477],
  "*":[941,1209],"0":[941,1336],"#":[941,1477]
};
export function dtmf(context, digit, dur=0.12, gain=0.2){
  const pair = F[String(digit)]; if(!pair) return;
  const t = context.currentTime;
  const g = context.createGain(); g.gain.value = 0.0001;
  const o1 = context.createOscillator(); o1.type="sine"; o1.frequency.value = pair[0];
  const o2 = context.createOscillator(); o2.type="sine"; o2.frequency.value = pair[1];
  o1.connect(g); o2.connect(g); g.connect(context.destination);
  o1.start(t); o2.start(t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o1.stop(t + dur + 0.01); o2.stop(t + dur + 0.01);
}
