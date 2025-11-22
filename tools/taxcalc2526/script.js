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

  // Helper for Indian Number Formatting
  const fmt = (n) => n.toLocaleString('en-IN');

  let regime = 'new';
  const toggle = document.querySelector('.regime-toggle');
  const incomeI = document.getElementById('income');
  const npsI = document.getElementById('nps');
  const exI = document.getElementById('exemptions');
  const reset = document.getElementById('reset');
  const resultContainer = document.getElementById('resultContainer');
  
  const breakBody = document.getElementById('breakBody');
  const surchargeLabel = document.getElementById('surchargeLabel');

  // Event Listeners for Live Calculation
  const inputs = [incomeI, npsI, exI];
  inputs.forEach(el => {
    el.addEventListener('input', calculate);
  });

  document.querySelectorAll('.regime-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      regime = b.dataset.regime;
      toggle.setAttribute('data-active', regime);
      toggle.querySelectorAll('button')
        .forEach(x => x.classList.toggle('active', x===b));
      document.querySelector('.exemptions').hidden = (regime!=='old');
      calculate();
    });
  });

  function calculate() {
    const income = parseFloat(incomeI.value) || 0;
    
    // Visual: Fade in results if income > 0
    if (income > 0) {
        resultContainer.classList.remove('opacity-50');
    } else {
        resultContainer.classList.add('opacity-50');
    }

    const nps = parseFloat(npsI.value) || 0;
    const otherExemptions = regime==='old' ? (parseFloat(exI.value)||0) : 0;
    const stdDed = regime==='old' ? 50000 : 75000;
    
    // Total Deductions = Standard Deduction + NPS (Both Regimes) + Other (Old only)
    const totalDeductions = stdDed + nps + otherExemptions;
    
    let taxable = Math.max(0, income - totalDeductions);

    // Calculate Gross Tax based on Slabs
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

    // Apply Rebate (Section 87A)
    let rebate = 0;
    if (regime === 'new' && taxable <= 1200000 && taxable > 0) {
        rebate = tax;
    } else if (regime === 'old' && taxable <= 500000 && taxable > 0) {
        rebate = tax; 
    }

    const taxAfterRebate = Math.max(0, tax - rebate);

    // Calculate Surcharge
    let surcharge = 0, rate = 0;
    if (taxAfterRebate > 0) {
        if (taxable > 50000000) rate = 25;
        else if (taxable > 20000000) rate = 25;
        else if (taxable > 10000000) rate = 15;
        else if (taxable >  5000000) rate = 10;
        surcharge = taxAfterRebate * (rate/100);
    }

    // Calculate Cess
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const total = Math.round(taxAfterRebate + surcharge + cess);

    // --- Populate UI ---
    document.getElementById('sumIncome').textContent     = `₹${fmt(income)}`;
    document.getElementById('sumDeduction').textContent  = `-₹${fmt(totalDeductions)}`; 
    document.getElementById('sumTaxable').textContent    = `₹${fmt(taxable)}`;
    document.getElementById('sumTax').textContent        = `₹${fmt(Math.round(taxAfterRebate))}`;
    
    surchargeLabel.textContent                           = `Surcharge (${rate}%)`;
    document.getElementById('sumSurcharge').textContent  = `₹${fmt(Math.round(surcharge))}`;
    document.getElementById('sumCess').textContent       = `₹${fmt(Math.round(cess))}`;
    document.getElementById('sumTotal').textContent      = `₹${fmt(total)}`;

    // Breakdown Table
    let rebateRow = '';
    if (rebate > 0) {
        rebateRow = `<tr class="text-green-600 dark:text-green-400">
                        <td colspan="3"><strong>Less: Tax Rebate u/s 87A</strong></td>
                        <td><strong>-₹${fmt(Math.round(rebate))}</strong></td>
                     </tr>`;
    }

    const grossRow = `<tr><td colspan="3" class="pt-4"><strong>Gross Tax</strong></td><td class="pt-4"><strong>₹${fmt(Math.round(tax))}</strong></td></tr>`;
    
    const finalRows = rows + grossRow + rebateRow + 
      (rebate > 0 ? `<tr><td colspan="3"><strong>Net Tax</strong></td><td><strong>₹${fmt(Math.round(taxAfterRebate))}</strong></td></tr>` : '') +
      `<tr><td colspan="3">Surcharge (${rate}%)</td><td>₹${fmt(Math.round(surcharge))}</td></tr>` +
      `<tr><td colspan="3">Cess (4%)</td><td>₹${fmt(Math.round(cess))}</td></tr>`;

    // If income is 0, keep table empty but neat
    if(income > 0) {
        breakBody.innerHTML = finalRows;
    } else {
        breakBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-[#86868b] opacity-60">Enter income to see breakdown</td></tr>`;
    }
  };

  reset.onclick = () => {
    incomeI.value = '';
    npsI.value = '';
    exI.value = '';
    calculate();
  };

  // Run once on load to set initial state
  calculate();
})();
