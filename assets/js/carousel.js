/* ---------- Carrusel: cada foto entra como una puerta corrediza de vidrio; tocar la foto la quiebra y pasa a la siguiente ---------- */
(function(){
  const reduced=CV.reduced;
  document.querySelectorAll('.carousel-wrap').forEach(wrap=>{
    const slides=[...wrap.querySelectorAll('.slide')], tabs=[...wrap.querySelectorAll('.place')];
    const box=wrap.querySelector('[data-carousel]');
    let cur=-1, breaking=false;
    // dir 1: la puerta nueva entra desde la derecha; -1: desde la izquierda
    function go(n,dir){
      const next=(n+slides.length)%slides.length;
      if(dir===undefined) dir=n>cur?1:-1;
      if(next!==cur){
        box.style.setProperty('--dir',dir);
        slides.forEach(s=>s.classList.remove('leaving'));
        void box.offsetWidth; // la puerta nueva se acomoda a su lado antes de correrse
        if(cur>=0){ slides[cur].classList.remove('is-active'); slides[cur].classList.add('leaving'); }
        slides[next].classList.add('is-active');
        slides.forEach((s,i)=>s.setAttribute('aria-hidden',i!==next));
        if(cur>=0&&!box.classList.contains('snap')){ box.classList.remove('sliding'); void box.offsetWidth; box.classList.add('sliding'); }
        cur=next;
      }
      tabs.forEach((t,i)=>{
        t.setAttribute('aria-selected',i===cur);
        const f=t.querySelector('.fill'); f.style.animation='none'; void f.offsetWidth; f.style.animation='';
      });
    }
    // La barrita de la etiqueta activa marca el ritmo: cuando se llena, pasa a la siguiente foto
    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>go(i));
      t.querySelector('.fill').addEventListener('animationend',()=>{ if(i===cur) go(cur+1,1); });
    });
    wrap.querySelector('.prev').addEventListener('click',()=>go(cur-1,-1));
    wrap.querySelector('.next').addEventListener('click',()=>go(cur+1,1));
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')wrap.classList.add('paused')});
    wrap.addEventListener('pointerleave',()=>wrap.classList.remove('paused'));
    wrap.addEventListener('focusin',()=>wrap.classList.add('paused'));
    wrap.addEventListener('focusout',()=>wrap.classList.remove('paused'));
    box.addEventListener('animationend',e=>{ if(e.animationName==='shine') box.classList.remove('sliding'); });

    // El vidrio se quiebra sobre la foto actual, sin salirse de su marco; debajo ya está la siguiente
    function breakGlass(e){
      if(reduced){ go(cur+1,1); return; }
      if(breaking) return; breaking=true;
      const r=box.getBoundingClientRect(), s=box.offsetWidth/r.width;
      CV.shatter(box,slides[cur],(e.clientX-r.left)*s,(e.clientY-r.top)*s).then(()=>breaking=false);
      box.classList.add('snap'); go(cur+1,1); void box.offsetWidth; box.classList.remove('snap');
      wrap.classList.add('broke');
    }
    let sx=null, sy=null;
    box.addEventListener('pointerdown',e=>{sx=e.clientX; sy=e.clientY});
    box.addEventListener('pointerup',e=>{
      if(sx===null) return;
      const dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
      if(Math.abs(dx)>40) go(cur+(dx<0?1:-1),dx<0?1:-1);
      else if(Math.hypot(dx,dy)<10&&!e.target.closest('.car-btn')) breakGlass(e);
    });
    box.addEventListener('pointercancel',()=>sx=null);
    if('IntersectionObserver' in window) new IntersectionObserver(([e])=>wrap.classList.toggle('paused',!e.isIntersecting)).observe(box);
    go(0);
  });
})();
