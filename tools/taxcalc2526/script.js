(() => {
  const slabsNew = [
    { up: 400000, pct: 0 },
    { up: 800000, pct: 5 },
    { up:1200000, pct:10 },
    { up:1600000, pct:15 },
    { up:2000000, pct:20 },
    { up:2400000, pct:25 },
    { up: Infinity, pct:30 },
  ];
  const slabsOld = [
    { up:250000, pct:0 },
    { up:500000, pct:5 },
    { up:1000000, pct:20 },
    { up: Infinity, pct:30 },
  ];

  // 1. Helper for Indian Number Formatting (e.g., 1,20,000)
  const fmt = (n) => n.toLocaleString('en-IN');

  let regime = 'new';
  const toggle = document.querySelector('.regime-toggle');
  const incomeI = document.getElementById('income');
  const exI = document.getElementById('exemptions');
  const calc = document.getElementById('calculate');
  const reset = document.getElementById('reset');
  const save = document.getElementById('savePdf');
  const toggleBreak = document.getElementById('toggleBreak');
  const summary = document.querySelector('.summary');
  const breakdown = document.querySelector('.breakdown');
  const breakBody = document.getElementById('breakBody');
  const surchargeLabel = document.getElementById('surchargeLabel');

  document.querySelectorAll('.regime-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      regime = b.dataset.regime;
      toggle.setAttribute('data-active', regime);
      toggle.querySelectorAll('button')
        .forEach(x => x.classList.toggle('active', x===b));
      document.querySelector('.exemptions').hidden = (regime!=='old');
      hideAll(); validate();
    });
  });

  function validate() {
    const inc = parseFloat(incomeI.value);
    document.getElementById('incomeError').textContent = inc>0 ? '' : 'Enter valid income';
    calc.disabled = !(inc>0);
  }
  incomeI.oninput = exI.oninput = validate;

  calc.onclick = () => {
    const income = +incomeI.value;
    const exemptions = regime==='old' ? (+exI.value||0) : 0;
    const stdDed = regime==='old' ? 50000 : 75000;
    
    // 2. Calculate Taxable Income
    // "Deduction" in summary refers to this Standard Deduction step
    let taxable = Math.max(0, income - stdDed - exemptions);

    // REMOVED: The "Force 0" logic. We now calculate gross tax for everyone.

    // 3. Calculate Gross Tax based on Slabs
    const slabs = regime==='new' ? slabsNew : slabsOld;
    let rem = taxable, tax = 0, prev = 0, rows = '';
    
    slabs.forEach(s => {
      if (rem <= 0) return;
      const amt = Math.min(rem, s.up - prev);
      const t = amt * (s.pct / 100);
      if (amt > 0) {
        rows += `<tr>
                   <td>₹${fmt(prev)}–₹${s.up===Infinity?'∞':fmt(s.up)}</td>
                   <td>₹${fmt(amt)}</td>
                   <td>${s.pct}%</td>
                   <td>₹${fmt(Math.round(t))}</td>
                 </tr>`;
      }
      tax += t;
      rem -= amt;
      prev = s.up;
    });

    // 4. Apply Rebate (Section 87A)
    // This is what turns the calculated tax into Zero
    let rebate = 0;
    // New Regime: Rebate if taxable income <= 12L
    if (regime === 'new' && taxable <= 1200000 && taxable > 0) {
        rebate = tax;
    } 
    // Old Regime: Rebate if taxable income <= 5L
    else if (regime === 'old' && taxable <= 500000 && taxable > 0) {
        rebate = tax; 
    }

    const taxAfterRebate = Math.max(0, tax - rebate);

    // 5. Calculate Surcharge (on Net Tax)
    let surcharge = 0, rate = 0;
    if (taxAfterRebate > 0) {
        if (taxable > 50000000) rate = 25;
        else if (taxable > 20000000) rate = 25;
        else if (taxable > 10000000) rate = 15;
        else if (taxable >  5000000) rate = 10;
        surcharge = taxAfterRebate * (rate/100);
    }

    // 6. Calculate Cess
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const total = Math.round(taxAfterRebate + surcharge + cess);

    // --- Populate UI ---

    document.getElementById('sumIncome').textContent     = `₹${fmt(income)}`;
    document.getElementById('sumDeduction').textContent  = `-₹${fmt(stdDed)}`; // This is Standard Deduction
    document.getElementById('sumTaxable').textContent    = `₹${fmt(taxable)}`;
    document.getElementById('sumTax').textContent        = `₹${fmt(Math.round(taxAfterRebate))}`; // This shows Net Tax
    
    surchargeLabel.textContent                           = `Surcharge (${rate}%)`;
    document.getElementById('sumSurcharge').textContent  = `₹${fmt(Math.round(surcharge))}`;
    document.getElementById('sumCess').textContent       = `₹${fmt(Math.round(cess))}`;
    document.getElementById('sumTotal').textContent      = `₹${fmt(total)}`;

    // Breakdown Table Logic
    let rebateRow = '';
    // If we applied a rebate, we MUST show this row so the math adds up
    if (rebate > 0) {
        rebateRow = `<tr class="text-green-600 dark:text-green-400">
                        <td colspan="3"><strong>Less: Tax Rebate u/s 87A</strong></td>
                        <td><strong>-₹${fmt(Math.round(rebate))}</strong></td>
                     </tr>`;
    }

    breakBody.innerHTML = rows +
      `<tr><td colspan="3" class="pt-4"><strong>Gross Tax</strong></td><td class="pt-4"><strong>₹${fmt(Math.round(tax))}</strong></td></tr>` +
      rebateRow + 
      (rebate > 0 ? `<tr><td colspan="3"><strong>Net Tax</strong></td><td><strong>₹${fmt(Math.round(taxAfterRebate))}</strong></td></tr>` : '') +
      `<tr><td colspan="3">Surcharge (${rate}%)</td><td>₹${fmt(Math.round(surcharge))}</td></tr>` +
      `<tr><td colspan="3">Cess (4%)</td><td>₹${fmt(Math.round(cess))}</td></tr>`;

    summary.hidden     = false;
    toggleBreak.hidden = false;
    breakdown.hidden   = true;
    save.hidden        = false;
  };

  toggleBreak.onclick = () => {
    const open = !breakdown.hidden;
    breakdown.hidden   = open;
    toggleBreak.textContent = open ? 'Show Breakdown' : 'Hide Breakdown';
  };

  reset.onclick = () => {
    incomeI.value = '';
    exI.value     = '';
    hideAll(); validate();
  };

  save.onclick = () => window.print();

  function hideAll() {
    summary.hidden     = true;
    breakdown.hidden   = true;
    toggleBreak.hidden = true;
    save.hidden        = true;
  }
  hideAll(); validate();
})();
