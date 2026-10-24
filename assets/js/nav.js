/* ---------- Navegación entre vistas ---------- */
CV.show=(function(){
  const pages=[...document.querySelectorAll('[data-page]')];
  const links=[...document.querySelectorAll('.menu a:not([data-scroll])')];
  const menu=document.getElementById('menu'), burger=document.getElementById('burger');
  function show(id){
    if(!pages.some(p=>p.dataset.page===id)) id='inicio';
    pages.forEach(p=>p.hidden=p.dataset.page!==id);
    links.forEach(a=>a.dataset.go===id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
    menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'instant'});
    if(id==='inicio'){ CV.hero.initDirt(); if(CV.opened) CV.hero.blow(); }
    CV.cleaner.kick();
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-go]'); if(!a) return;
    e.preventDefault();
    const target=a.dataset.scroll&&document.getElementById(a.dataset.scroll);
    if(target&&!pages.find(p=>p.dataset.page===a.dataset.go).hidden){
      menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    } else show(a.dataset.go);
    if(target) requestAnimationFrame(()=>target.scrollIntoView({behavior:CV.reduced?'auto':'smooth'}));
    try{history.replaceState(null,'','#'+(a.dataset.scroll||a.dataset.go))}catch(_){}
  });
  burger.addEventListener('click',()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

  /* Barra que se compacta al bajar */
  const header=document.querySelector('header');
  const onScroll=()=>header.classList.toggle('scrolled',scrollY>12);
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  return show;
})();
