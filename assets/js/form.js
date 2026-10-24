/* ---------- Formulario de cotización ---------- */
document.getElementById('quote').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('f-name').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  const ok=document.getElementById('ok');
  if(!name||!phone){ok.textContent='Falta tu nombre o teléfono para poder contactarte.';ok.hidden=false;return;}
  const svc=document.querySelector('input[name="svc"]:checked').value;
  ok.textContent='Listo, '+name+'. Recibimos tu solicitud de '+svc.toLowerCase()+' (demo: en el sitio real esto se enviaría por correo o WhatsApp).';
  ok.hidden=false; e.target.reset();
});
