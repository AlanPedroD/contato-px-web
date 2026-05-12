document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('form');
  const steps = document.querySelectorAll('.step');
  const progress = document.querySelector('.progress');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const telefoneInput = document.getElementById('telefone');
  const telefoneErro = document.getElementById('telefoneErro');
  const nomeErro = document.getElementById('nomeErro');
  const motivoErro = document.getElementById('motivoErro');

  let current = 0;
  const total = steps.length;

  /* ─── DOTS ───────────────────────────────────── */

  // Inject step indicator dots after the progress bar
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'step-dots';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(dot);
  }
  form.parentElement.insertBefore(dotsContainer, form);

  // Inject step labels inside each step heading area
  const labels = ['Passo 01', 'Passo 02', 'Passo 03', 'Passo 04'];
  steps.forEach((step, i) => {
    const h2 = step.querySelector('h2');
    if (h2) {
      const label = document.createElement('span');
      label.className = 'step-label';
      label.textContent = labels[i] || `Passo 0${i + 1}`;
      step.insertBefore(label, h2);
    }
  });

  /* ─── NAVIGATION ─────────────────────────────── */

  function updateUI() {
    const dots = dotsContainer.querySelectorAll('.step-dot');
    const pct = ((current + 1) / total) * 100;
    progress.style.width = pct + '%';

    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i === current) dot.classList.add('active');
      else if (i < current) dot.classList.add('done');
    });
  }

  function goTo(index) {
    steps[current].classList.remove('active');
    current = index;
    steps[current].classList.add('active');
    updateUI();
    // Focus first input in new step
    const firstInput = steps[current].querySelector('input, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 400);
  }

  /* ─── VALIDATION ─────────────────────────────── */

  function triggerError(el) {
    el.classList.remove('input-error');
    void el.offsetWidth;
    el.classList.add('input-error');
    el.addEventListener('input', () => el.classList.remove('input-error'), { once: true });
  }

  function validateStep(index) {
    if (index === 0) {
      const nome = document.getElementById('nome');
      if (!nome.value.trim()) {
        nomeErro.textContent = 'Por favor, informe o seu nome.';
        triggerError(nome);
        nome.addEventListener('input', () => { nomeErro.textContent = ''; }, { once: true });
        nome.focus();
        return false;
      }
      nomeErro.textContent = '';
    }

    if (index === 1) {
      const tel = telefoneInput.value.trim();
      const regex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
      if (!regex.test(tel)) {
        telefoneErro.textContent = 'Informe um número de WhatsApp válido.';
        triggerError(telefoneInput);
        telefoneInput.focus();
        return false;
      }
      telefoneErro.textContent = '';
    }

    if (index === 2) {
      const selected = form.querySelector('input[name="motivo"]:checked');
      if (!selected) {
        motivoErro.textContent = 'Selecione um motivo para continuar.';
        const optionsEl = form.querySelector('.options');
        optionsEl.classList.remove('options-error');
        void optionsEl.offsetWidth;
        optionsEl.classList.add('options-error');
        setTimeout(() => optionsEl.classList.remove('options-error'), 600);
        return false;
      }
      motivoErro.textContent = '';
    }

    return true;
  }

  /* ─── PHONE MASK ─────────────────────────────── */

  telefoneInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
    this.value = v;
    if (telefoneErro.textContent) telefoneErro.textContent = '';
  });

  /* ─── NEXT BUTTONS ───────────────────────────── */

  document.querySelectorAll('.next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < total - 1) goTo(current + 1);
    });
  });

  /* ─── PREV BUTTONS ───────────────────────────── */

  document.querySelectorAll('.prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current > 0) goTo(current - 1);
    });
  });

  /* ─── RADIO VISUAL FEEDBACK ──────────────────── */

  document.querySelectorAll('.options label').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.options label').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      motivoErro.textContent = '';
    });
  });

  /* ─── KEYBOARD SUPPORT ───────────────────────── */

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeNext = steps[current].querySelector('.next');
      const activeSubmit = steps[current].querySelector('[type="submit"]');
      if (activeNext) activeNext.click();
      else if (activeSubmit) activeSubmit.click();
    }
  });

  /* ─── FORM SUBMIT ────────────────────────────── */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showModal();
        form.reset();
      } else {
        submitBtn.textContent = 'Tentar novamente';
        submitBtn.disabled = false;
        alert('Erro ao enviar. Verifique sua conexão e tente novamente.');
      }
    } catch {
      submitBtn.textContent = 'Tentar novamente';
      submitBtn.disabled = false;
      alert('Erro de rede. Tente novamente.');
    }
  });

  /* ─── MODAL ──────────────────────────────────── */

  function showModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Reset form to step 1
    steps[current].classList.remove('active');
    current = 0;
    steps[0].classList.add('active');
    updateUI();
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Enviar';
      submitBtn.disabled = false;
    }
  }

  closeModal.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) hideModal();
  });

  /* ─── INIT ───────────────────────────────────── */
  updateUI();

});
