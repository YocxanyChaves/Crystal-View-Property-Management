/* ---------- Intro: abrir la ventana y entrar al sitio ---------- */
(function(){
  const reduced=CV.reduced;
  const intro=document.getElementById('intro'), openBtn=document.getElementById('openWin');
  const room=document.getElementById('room'), opening=intro.querySelector('.opening');
  function openWindow(){
    if(CV.opened) return; CV.opened=true;
    intro.classList.add('opening');
    if(!reduced){
      // Acercamos la sala hasta que el hueco de la ventana llene la pantalla
      const r=opening.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const s=Math.max(innerWidth/r.width,innerHeight/r.height)*1.12;
      room.style.transformOrigin=cx+'px '+cy+'px';
      setTimeout(()=>{room.style.transform=`translate(${innerWidth/2-cx}px,${innerHeight/2-cy}px) scale(${s})`},650);
    }
    setTimeout(()=>{ intro.classList.add('gone'); if(!CV.hero.el.closest('[data-page]').hidden) CV.hero.blow(); }, reduced?0:1850);
    setTimeout(()=>{ intro.remove(); document.body.classList.remove('locked'); CV.cleaner.kick(); CV.why.watch(); }, reduced?50:2500);
  }
  openBtn.addEventListener('click',openWindow);
  openBtn.focus({preventScroll:true});
})();
