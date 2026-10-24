/* ---------- Limpiador colgado de una cuerda que sigue el scroll ---------- */
CV.cleaner=(function(){
  const {reduced,rnd}=CV;
  const el=document.getElementById('cleaner');
  const worker=el.querySelector('.worker');
  let y=-190, vy=0, sway=0, vs=0, x=0, running=false, lastBubble=0, pin=null, glide=null;
  const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  function target(){
    const h=worker.offsetHeight||130;
    if(pin) return Math.min(innerHeight-h-20,Math.max(90,pin()));
    const max=document.documentElement.scrollHeight-innerHeight;
    const p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
    const top=90, bottom=innerHeight-h-28;
    return top+p*Math.max(0,bottom-top);
  }
  function bubble(){
    const b=document.createElement('span'); b.className='bubble';
    const s=worker.offsetWidth/110; // escala del SVG
    b.style.left=(4*s)+'px'; b.style.top=(y+46*s)+'px';
    b.style.setProperty('--s',rnd(5,11)+'px');
    b.style.setProperty('--bx',rnd(-46,-12)+'px');
    b.style.setProperty('--by',rnd(-36,30)+'px');
    b.addEventListener('animationend',()=>b.remove());
    el.appendChild(b);
  }
  function frame(now){
    const t=target();
    vy=(vy+(t-y)*.05)*.84; y+=vy;
    // El cuerpo se queda atrás cuando baja o sube rápido: péndulo amortiguado
    vs=(vs+(Math.max(-9,Math.min(9,-vy*.45))-sway)*.07)*.9; sway+=vs;
    if(glide){
      const p=Math.min(1,(now-glide.t0)/glide.dur);
      x=glide.from+(glide.to-glide.from)*ease(p);
      el.style.setProperty('--x',x.toFixed(1)+'px');
      if(glide.onStep) glide.onStep();
      if(p>=1){const g=glide; glide=null; g.done();}
    }
    el.style.setProperty('--y',y.toFixed(1)+'px');
    el.style.setProperty('--sway',sway.toFixed(2)+'deg');
    const moving=Math.abs(vy)>.35||!!glide;
    el.classList.toggle('moving',moving);
    el.classList.toggle('down',vy>.8);
    el.classList.toggle('up',vy<-.8);
    if(moving&&now-lastBubble>110){lastBubble=now;bubble();}
    if(!glide&&Math.abs(t-y)<.3&&Math.abs(vy)<.02&&Math.abs(sway)<.05&&Math.abs(vs)<.01){running=false;el.classList.remove('moving','up','down');return;}
    requestAnimationFrame(frame);
  }
  function kick(){
    if(document.body.classList.contains('locked')) return;
    if(reduced){ y=target(); el.style.setProperty('--y',y+'px'); return; }
    if(!running){running=true;requestAnimationFrame(frame);}
  }
  // Desliza al limpiador en horizontal; onStep corre en cada cuadro para sincronizar otras cosas con él
  function slide(to,dur,onStep){
    if(reduced){ x=to; el.style.setProperty('--x',to+'px'); if(onStep) onStep(); return Promise.resolve(); }
    return new Promise(done=>{ glide={from:x,to,dur,t0:performance.now(),onStep,done}; kick(); });
  }
  let scareTimer;
  worker.querySelector('svg').addEventListener('click',()=>{
    el.classList.remove('scared'); void el.offsetWidth; el.classList.add('scared');
    vs+=(Math.random()<.5?-1:1)*rnd(4,5.5); // empujón: se columpia
    clearTimeout(scareTimer); scareTimer=setTimeout(()=>el.classList.remove('scared'),1700);
    kick();
  });
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',kick);
  return {
    kick, slide,
    pinTo(fn){ pin=fn; kick(); },
    // Borde izquierdo de la escobilla, en coordenadas de pantalla
    squeegeeX(){ return worker.getBoundingClientRect().left+worker.offsetWidth*.02; },
    left(){ return worker.getBoundingClientRect().left; }
  };
})();
