/* ---------- Esponjas: al apretarlas sueltan burbujas con la información ---------- */
(function(){
  const {reduced,rnd}=CV;
  document.querySelectorAll('.sponge').forEach(sp=>{
    const wrap=sp.parentElement;
    sp.addEventListener('click',()=>{
      const open=!wrap.classList.contains('open');
      wrap.classList.toggle('open',open);
      sp.setAttribute('aria-expanded',open);
      sp.classList.remove('squish'); void sp.offsetWidth; sp.classList.add('squish');
      if(reduced) return;
      for(let i=0;i<(open?14:6);i++){
        const b=document.createElement('span'); b.className='sp-bubble';
        b.style.left=rnd(10,85)+'%'; b.style.top=rnd(18,50)+'%';
        b.style.setProperty('--s',rnd(8,24)+'px');
        b.style.setProperty('--bx',rnd(-60,60)+'px');
        b.style.setProperty('--by',-rnd(80,200)+'px');
        b.style.setProperty('--t',rnd(1,1.9)+'s');
        b.style.animationDelay=rnd(0,.25)+'s';
        b.addEventListener('animationend',()=>b.remove());
        wrap.appendChild(b);
      }
    });
    sp.addEventListener('animationend',e=>{ if(e.animationName==='squish') sp.classList.remove('squish'); });
  });
})();
