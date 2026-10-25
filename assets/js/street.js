/* ---------- Lo que dicen: la calle de clientes pasa lenta y sin parar, como una tira infinita ---------- */
(function(){
  const street=document.getElementById('street'); if(!street) return;
  const track=street.querySelector('.homes');
  const homes=[...track.children], N=homes.length;
  // Una segunda cuadra idéntica detrás de la primera para que la vuelta no se note
  homes.forEach(h=>{ const c=h.cloneNode(true); c.setAttribute('aria-hidden','true'); track.appendChild(c); });
  const all=[...track.children];
  const SPEED=26; // px por segundo
  let x=0, v=0, kick=0, hold=false, seen=true, drag=null, last=performance.now();

  (function tick(now){
    const dt=Math.min(.05,(now-last)/1000); last=now;
    const loop=all[N].offsetLeft;
    if(loop>0){
      // Frena suave cuando alguien la mira de cerca y vuelve a arrancar igual de suave
      const want=CV.reduced||hold||drag||!seen||document.hidden?0:SPEED;
      v+=(want-v)*Math.min(1,dt*3);
      const step=kick*Math.min(1,dt*5); kick-=step;
      x=(((x+v*dt+step)%loop)+loop)%loop;
      track.style.transform=`translateX(${-x.toFixed(2)}px)`;
    }
    requestAnimationFrame(tick);
  })(last);

  street.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') hold=true; });
  street.addEventListener('pointerleave',()=>hold=false);
  street.addEventListener('focusin',()=>hold=true);
  street.addEventListener('focusout',()=>hold=false);
  if('IntersectionObserver' in window) new IntersectionObserver(([e])=>seen=e.isIntersecting).observe(street);

  // Las flechas corren la calle una casa hacia cada lado
  document.querySelectorAll('.street-btn').forEach(b=>b.addEventListener('click',()=>{
    kick+=+b.dataset.dir*(all[1].offsetLeft-all[0].offsetLeft);
  }));
  // Arrastrar con el dedo
  street.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') drag=e.clientX; });
  street.addEventListener('pointermove',e=>{ if(drag===null) return; x-=e.clientX-drag; drag=e.clientX; });
  ['pointerup','pointercancel'].forEach(t=>street.addEventListener(t,()=>drag=null));
})();
