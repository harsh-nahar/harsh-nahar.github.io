// script.js
(() => {
  // New regime slabs
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

  // Regime toggle buttons
  document.querySelectorAll('.regime-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      regime = btn.dataset.regime;
      container.setAttribute('data-active', regime);
      container.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      document.querySelector('.exemptions').hidden = (regime !== 'old');
      hideResults();
      validate();
    });
  });

  const incomeI = document.getElementById('income');
  const exI = document.getElementById('exemptions');
  const calcBtn = document.getElementById('calculate');
  const resetBtn = document.getElementById('reset');
  const saveBtn = document.getElementById('savePdf');
  const toggleBreakBtn = document.getElementById('toggleBreak');
  const summarySection = document.querySelector('.summary');
  const breakdownSection = document.querySelector('.breakdown');
  const breakBody = document.getElementById('breakBody');

  // Input validation
  const validate = () => {
    const inc = parseFloat(incomeI.value);
    document.getElementById('incomeError').textContent =
      inc > 0 ? '' : 'Enter a positive income';
    calcBtn.disabled = !(inc > 0);
  };
  incomeI.oninput = exI.oninput = validate;

  // Calculation handler
  calcBtn.onclick = () => {
    const income = +incomeI.value;
    const exemptions = regime === 'old' ? (+exI.value || 0) : 0;
    const stdDed = regime === 'old' ? 50_000 : 75_000;

    let taxable = Math.max(0, income - stdDed - exemptions);
    if (regime === 'new' && taxable <= 1_200_000) taxable = 0;

    const slabs = regime === 'new' ? slabsNew : slabsOld;
    let rem = taxable, tax = 0, prev = 0, html = '';

    slabs.forEach(s => {
      if (rem <= 0) return;
      const amt = Math.min(rem, s.up - prev);
      const t = amt * (s.pct / 100);
      if (amt > 0) {
        html += `<tr>
                   <td>₹${prev.toLocaleString()}–₹${s.up === Infinity ? '∞' : s.up.toLocaleString()}</td>
                   <td>₹${amt.toLocaleString()}</td>
                   <td>${s.pct}%</td>
                   <td>₹${Math.round(t).toLocaleString()}</td>
                 </tr>`;
      }
      tax += t;
      rem -= amt;
      prev = s.up;
    });

    const cess = tax * 0.04;
    const total = Math.round(tax + cess);

    // Populate summary
    document.getElementById('sumIncome').textContent = `₹${income.toLocaleString()}`;
    document.getElementById('sumDeduction').textContent = `-₹${stdDed.toLocaleString()}`;
    document.getElementById('sumTaxable').textContent = `₹${taxable.toLocaleString()}`;
    document.getElementById('sumTax').textContent = `₹${Math.round(tax).toLocaleString()}`;
    document.getElementById('sumCess').textContent = `₹${Math.round(cess).toLocaleString()}`;
    document.getElementById('sumTotal').textContent = `₹${total.toLocaleString()}`;

    // Show summary and breakdown toggle
    summarySection.hidden = false;
    summarySection.classList.add('show');
    toggleBreakBtn.hidden = false;
    breakdownSection.hidden = true;
    breakdownSection.classList.remove('show');

    breakBody.innerHTML =
      html +
      `<tr>
         <td colspan="3"><strong>Tax</strong></td>
         <td><strong>₹${Math.round(tax).toLocaleString()}</strong></td>
       </tr>` +
      `<tr>
         <td colspan="3">Cess (4%)</td>
         <td>₹${Math.round(cess).toLocaleString()}</td>
       </tr>`;

    saveBtn.hidden = false;
  };

  // Toggle breakdown visibility
  toggleBreakBtn.onclick = () => {
    const isHidden = breakdownSection.hidden;
    breakdownSection.hidden = !isHidden;
    breakdownSection.classList.toggle('show');
    toggleBreakBtn.textContent = isHidden ? 'Hide Breakdown' : 'Show Breakdown';
  };

  // Reset form
  resetBtn.onclick = () => {
    incomeI.value = '';
    exI.value = '';
    hideResults();
    validate();
  };

  // Print / Save PDF
  saveBtn.onclick = () => window.print();

  // Hide results helper
  function hideResults() {
    summarySection.hidden = true;
    breakdownSection.hidden = true;
    toggleBreakBtn.hidden = true;
    saveBtn.hidden = true;
    summarySection.classList.remove('show');
    breakdownSection.classList.remove('show');
  }

  // Initialize
  hideResults();
  validate();
})();