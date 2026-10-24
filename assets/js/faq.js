/* ---------- Preguntas frecuentes: filtro por tema ---------- */
(function(){
  const faqBtns=[...document.querySelectorAll('.faq-filter button')];
  faqBtns.forEach(b=>b.addEventListener('click',()=>{
    faqBtns.forEach(x=>x.setAttribute('aria-pressed',x===b));
    document.querySelectorAll('.faq-item').forEach(it=>{
      it.hidden=b.dataset.cat!=='all'&&it.dataset.cat!==b.dataset.cat;
      it.classList.add('in');
    });
  }));
})();
