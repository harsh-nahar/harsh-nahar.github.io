(() => {
  // Tax slabs for FY 2025–26 (new regime)
  const slabsNew = [
    { up: 400_000, pct: 0 },
    { up: 800_000, pct: 5 },
    { up: 1_200_000, pct: 10 },
    { up: 1_600_000, pct: 15 },
    { up: 2_000_000, pct: 20 },
    { up: 2_400_000, pct: 25 },
    { up: Infinity, pct: 30 },
  ];

  // Old regime slabs
  const slabsOld = [
    { up: 250_000, pct: 0 },
    { up: 500_000, pct: 5 },
    { up: 1_000_000, pct: 20 },
    { up: Infinity, pct: 30 },
  ];

  let regime = 'new';

  const container = document.querySelector('.regime-toggle');
  const incomeInput = document.getElementById('income');
  const exInput = document.getElementById('exemptions');
  const calcBtn = document.getElementById('calculate');
  const resetBtn = document.getElementById('reset');
  const saveBtn = document.getElementById('savePdf');
  const toggleBreakBtn = document.getElementById('toggleBreak');
  const summary = document.querySelector('.summary');
  const breakdown = document.querySelector('.breakdown');
  const breakBody = document.getElementById('breakBody');

  // Switch regime and toggle UI
  document.querySelectorAll('.regime-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      regime = btn.dataset.regime;
      container.setAttribute('data-active', regime);
      container.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelector('.exemptions').hidden = (regime !== 'old');
      hideResults();
      validate();
    });
  });

  // Input validation
  function validate() {
    const income = parseFloat(incomeInput.value);
    document.getElementById('incomeError').textContent = income > 0 ? '' : 'Enter valid income';
    calcBtn.disabled = !(income > 0);
  }

  incomeInput.oninput = exInput.oninput = validate;

  // Main calculation
  calcBtn.onclick = () => {
    const income = +incomeInput.value;
    const exemptions = regime === 'old' ? (+exInput.value || 0) : 0;
    const stdDeduction = regime === 'old' ? 50_000 : 75_000;
    let taxable = Math.max(0, income - stdDeduction - exemptions);

    if (regime === 'new' && taxable <= 1_200_000) taxable = 0;

    const slabs = regime === 'new' ? slabsNew : slabsOld;
    let remaining = taxable;
    let totalTax = 0;
    let prev = 0;
    let rows = '';

    for (const s of slabs) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, s.up - prev);
      const tax = amount * (s.pct / 100);
      rows += `
        <tr>
          <td>₹${prev.toLocaleString()}–₹${s.up === Infinity ? '∞' : s.up.toLocaleString()}</td>
          <td>₹${amount.toLocaleString()}</td>
          <td>${s.pct}%</td>
          <td>₹${Math.round(tax).toLocaleString()}</td>
        </tr>`;
      totalTax += tax;
      remaining -= amount;
      prev = s.up;
    }

    const cess = totalTax * 0.04;
    const final = Math.round(totalTax + cess);

    document.getElementById('sumIncome').textContent = `₹${income.toLocaleString()}`;
    document.getElementById('sumDeduction').textContent = `-₹${stdDeduction.toLocaleString()}`;
    document.getElementById('sumTaxable').textContent = `₹${taxable.toLocaleString()}`;
    document.getElementById('sumTax').textContent = `₹${Math.round(totalTax).toLocaleString()}`;
    document.getElementById('sumCess').textContent = `₹${Math.round(cess).toLocaleString()}`;
    document.getElementById('sumTotal').textContent = `₹${final.toLocaleString()}`;

    breakBody.innerHTML = rows +
      `<tr><td colspan=\"3\"><strong>Tax</strong></td><td><strong>₹${Math.round(totalTax).toLocaleString()}</strong></td></tr>` +
      `<tr><td colspan=\"3\">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;

    summary.hidden = false;
    summary.classList.add('show');
    toggleBreakBtn.hidden = false;
    breakdown.hidden = true;
    breakdown.classList.remove('show');
    saveBtn.hidden = false;
  };

  toggleBreakBtn.onclick = () => {
    const isOpen = !breakdown.hidden;
    breakdown.hidden = isOpen;
    toggleBreakBtn.textContent = isOpen ? 'Show Breakdown' : 'Hide Breakdown';
  };

  resetBtn.onclick = () => {
    incomeInput.value = '';
    exInput.value = '';
    hideResults();
    validate();
  };

  saveBtn.onclick = () => {
    window.print();
  };

  function hideResults() {
    summary.hidden = true;
    breakdown.hidden = true;
    toggleBreakBtn.hidden = true;
    saveBtn.hidden = true;
    summary.classList.remove('show');
    breakdown.classList.remove('show');
  }

  hideResults();
  validate();
})();
