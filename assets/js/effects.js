/* ---------- Entradas al hacer scroll y brillo de vidrio líquido ---------- */
(function(){
  const reduced=CV.reduced;

  /* Entradas al hacer scroll */
  const staggered='.box,.steps li,.contact-grid > *';
  document.querySelectorAll('.page-head .stack, section:not([data-page="inicio"]) .band h2, .box, .steps li, .table-wrap, .ba, .combo, .contact-grid > *, .street').forEach(el=>{
    if(el.hasAttribute('data-reveal')) return;
    el.setAttribute('data-reveal','');
    const i=[...el.parentElement.children].filter(c=>c.matches(staggered)).indexOf(el);
    if(i>0) el.style.setProperty('--d',i*110+'ms');
  });
  if('IntersectionObserver' in window&&!reduced){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  } else document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));

  /* Vidrio líquido: brillo que sigue al puntero */
  document.querySelectorAll('[data-glass]').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse') return;
      const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',x*100+'%'); card.style.setProperty('--my',y*100+'%');
      if(!reduced){card.style.setProperty('--ry',(x-.5)*5+'deg'); card.style.setProperty('--rx',(.5-y)*4+'deg');}
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
  });
})();
