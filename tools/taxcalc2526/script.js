(() => {
  const slabsNew = [
    { up: 400_000, pct: 0 },
    { up: 800_000, pct: 5 },
    { up: 1_200_000, pct: 10 },
    { up: 1_600_000, pct: 15 },
    { up: 2_000_000, pct: 20 },
    { up: 2_400_000, pct: 25 },
    { up: Infinity, pct: 30 },
  ];
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

  document.querySelectorAll('.regime-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      regime = btn.dataset.regime;
      container.setAttribute('data-active', regime);
      container.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelector('.exemptions').hidden = regime !== 'old';
      hideResults();
      validate();
    });
  });

  function validate() {
    const inc = parseFloat(incomeInput.value);
    document.getElementById('incomeError').textContent = inc > 0 ? '' : 'Enter valid income';
    calcBtn.disabled = !(inc > 0);
  }
  incomeInput.oninput = exInput.oninput = validate;

  calcBtn.onclick = () => {
    const income = +incomeInput.value;
    const exemptions = regime === 'old' ? (+exInput.value || 0) : 0;
    const stdDeduction = regime === 'old' ? 50_000 : 75_000;
    let taxable = Math.max(0, income - stdDeduction - exemptions);
    if (regime === 'new' && taxable <= 1_200_000) taxable = 0;

    const slabs = regime === 'new' ? slabsNew : slabsOld;
    let remaining = taxable, totalTax = 0, prev = 0, rows = '';

    for (const s of slabs) {
      if (!remaining) break;
      const amt = Math.min(remaining, s.up - prev);
      const tax = amt * (s.pct / 100);
      if (amt) {
        rows += `
          <tr>
            <td>₹${prev.toLocaleString()}–₹${s.up===Infinity?'∞':s.up.toLocaleString()}</td>
            <td>₹${amt.toLocaleString()}</td>
            <td>${s.pct}%</td>
            <td>₹${Math.round(tax).toLocaleString()}</td>
          </tr>`;
      }
      totalTax += tax;
      remaining -= amt;
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
      `<tr><td colspan="3"><strong>Tax</strong></td><td><strong>₹${Math.round(totalTax).toLocaleString()}</strong></td></tr>` +
      `<tr><td colspan="3">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;

    summary.hidden = false;
    toggleBreakBtn.hidden = false;
    breakdown.hidden = true;
    saveBtn.hidden = false;
  };

  toggleBreakBtn.onclick = () => {
    const open = !breakdown.hidden;
    breakdown.hidden = open;
    toggleBreakBtn.textContent = open ? 'Show Breakdown' : 'Hide Breakdown';
  };

  resetBtn.onclick = () => {
    incomeInput.value = '';
    exInput.value = '';
    hideResults();
    validate();
  };

  saveBtn.onclick = () => window.print();

  function hideResults() {
    summary.hidden = true;
    breakdown.hidden = true;
    toggleBreakBtn.hidden = true;
    saveBtn.hidden = true;
  }

  hideResults();
  validate();
})();