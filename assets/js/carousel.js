/* ---------- Carruseles: cada etiqueta de lugar maneja una foto; tocar la foto la quiebra y pasa a la siguiente ---------- */
(function(){
  const reduced=CV.reduced;
  document.querySelectorAll('.carousel-wrap').forEach(wrap=>{
    const slides=[...wrap.querySelectorAll('.slide')], tabs=[...wrap.querySelectorAll('.place')];
    const box=wrap.querySelector('[data-carousel]');
    let cur=0, breaking=false;
    function go(n){
      cur=(n+slides.length)%slides.length;
      slides.forEach((s,i)=>{s.classList.toggle('is-active',i===cur); s.setAttribute('aria-hidden',i!==cur);});
      tabs.forEach((t,i)=>{
        t.setAttribute('aria-selected',i===cur);
        const f=t.querySelector('.fill'); f.style.animation='none'; void f.offsetWidth; f.style.animation='';
      });
    }
    // La barrita de la etiqueta activa marca el ritmo: cuando se llena, pasa a la siguiente foto
    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>go(i));
      t.querySelector('.fill').addEventListener('animationend',()=>{ if(i===cur) go(cur+1); });
    });
    wrap.querySelector('.prev').addEventListener('click',()=>go(cur-1));
    wrap.querySelector('.next').addEventListener('click',()=>go(cur+1));
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')wrap.classList.add('paused')});
    wrap.addEventListener('pointerleave',()=>wrap.classList.remove('paused'));
    wrap.addEventListener('focusin',()=>wrap.classList.add('paused'));
    wrap.addEventListener('focusout',()=>wrap.classList.remove('paused'));

    // El vidrio se quiebra sobre la foto actual; debajo ya está la siguiente, sin fundido
    function breakGlass(e){
      if(reduced){ go(cur+1); return; }
      if(breaking) return; breaking=true;
      const r=box.getBoundingClientRect(), s=box.offsetWidth/r.width;
      CV.shatter(box,slides[cur],(e.clientX-r.left)*s,(e.clientY-r.top)*s).then(()=>breaking=false);
      box.classList.add('snap'); go(cur+1); void box.offsetWidth; box.classList.remove('snap');
      wrap.classList.add('broke');
    }
    let sx=null, sy=null;
    box.addEventListener('pointerdown',e=>{sx=e.clientX; sy=e.clientY});
    box.addEventListener('pointerup',e=>{
      if(sx===null) return;
      const dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
      if(Math.abs(dx)>40) go(cur+(dx<0?1:-1));
      else if(Math.hypot(dx,dy)<10&&!e.target.closest('.car-btn')) breakGlass(e);
    });
    box.addEventListener('pointercancel',()=>sx=null);
    if('IntersectionObserver' in window) new IntersectionObserver(([e])=>wrap.classList.toggle('paused',!e.isIntersecting)).observe(box);

    // La foto rebota como gelatina cuando entra el mouse
    box.addEventListener('pointerenter',e=>{
      if(e.pointerType!=='mouse'||reduced) return;
      box.classList.remove('jelly'); void box.offsetWidth; box.classList.add('jelly');
    });
    box.addEventListener('animationend',e=>{ if(e.animationName==='jelly') box.classList.remove('jelly'); });
    go(0);
  });
})();
