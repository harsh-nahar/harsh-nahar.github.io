(() => {
  // --- CONFIGURATION ---
  const slabsNew = [
    { up: 400000, pct: 0 },
    { up: 800000, pct: 5 },
    { up: 1200000, pct: 10 },
    { up: 1600000, pct: 15 },
    { up: 2000000, pct: 20 },
    { up: 2400000, pct: 25 },
    { up: Infinity, pct: 30 },
  ];
  const slabsOld = [
    { up: 250000, pct: 0 },
    { up: 500000, pct: 5 },
    { up: 1000000, pct: 20 },
    { up: Infinity, pct: 30 },
  ];

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

  // --- HELPER: Base Tax ---
  function getBaseTax(taxableIncome, currentSlabs) {
    let tax = 0;
    let prevLimit = 0;
    
    for (let slab of currentSlabs) {
      if (taxableIncome <= prevLimit) break;
      
      let slabIncome = 0;
      if (slab.up === Infinity) {
        slabIncome = taxableIncome - prevLimit;
      } else {
        slabIncome = Math.min(taxableIncome, slab.up) - prevLimit;
      }
      
      if (slabIncome > 0) {
        tax += slabIncome * (slab.pct / 100);
      }
      prevLimit = slab.up;
    }
    return tax;
  }

  // --- HELPER: Surcharge Rate ---
  function getSurchargeRate(taxableIncome, currentRegime) {
    if (taxableIncome <= 5000000) return 0;
    if (taxableIncome <= 10000000) return 10;
    if (taxableIncome <= 20000000) return 15;
    
    if (currentRegime === 'new') {
      return 25; // New Regime Cap
    } else {
      if (taxableIncome <= 50000000) return 25;
      else return 37; // Old Regime Max
    }
  }

  // --- CALCULATION ---
  function calculate() {
    const income = parseFloat(incomeI.value) || 0;
    
    if (income > 0) resultContainer.classList.remove('opacity-50');
    else resultContainer.classList.add('opacity-50');

    const nps = parseFloat(npsI.value) || 0;
    const otherExemptions = regime === 'old' ? (parseFloat(exI.value) || 0) : 0;
    const stdDed = regime === 'new' ? 75000 : 50000;

    const totalDeductions = stdDed + nps + otherExemptions;
    const taxable = Math.max(0, income - totalDeductions);
    const slabs = regime === 'new' ? slabsNew : slabsOld;

    // 1. Base Tax
    let baseTax = getBaseTax(taxable, slabs);

    // 2. 87A Rebate & Marginal Relief
    let rebate = 0;
    let rebateRelief = 0;

    if (regime === 'new') {
        if (taxable <= 1200000) {
            rebate = baseTax; 
        } else {
            // Marginal Relief check
            const excessIncome = taxable - 1200000;
            if (baseTax > excessIncome) {
                rebateRelief = baseTax - excessIncome;
            }
        }
    } else {
        if (taxable <= 500000) rebate = baseTax;
    }

    let taxAfterRebate = Math.max(0, baseTax - rebate - rebateRelief);

    // 3. Surcharge & Relief
    let surcharge = 0;
    let surchargeRelief = 0; // To visualize the reduction
    let rate = 0;
    let theoreticalSurcharge = 0; // Surcharge BEFORE relief
    
    if (taxAfterRebate > 0) {
        rate = getSurchargeRate(taxable, regime);
        
        if (rate > 0) {
            theoreticalSurcharge = taxAfterRebate * (rate / 100);
            surcharge = theoreticalSurcharge;

            // Check Surcharge Marginal Relief
            let threshold = 0;
            if (taxable > 50000000) threshold = 50000000;
            else if (taxable > 20000000) threshold = 20000000;
            else if (taxable > 10000000) threshold = 10000000;
            else if (taxable > 5000000) threshold = 5000000;

            if (threshold > 0) {
                const taxOnThreshold = getBaseTax(threshold, slabs);
                const rateOnThreshold = getSurchargeRate(threshold, regime); 
                const surOnThreshold = taxOnThreshold * (rateOnThreshold / 100);
                
                const incomeAboveThreshold = taxable - threshold;
                const maxTax = taxOnThreshold + surOnThreshold + incomeAboveThreshold;
                
                const currentTax = taxAfterRebate + surcharge;
                
                if (currentTax > maxTax) {
                    const relief = currentTax - maxTax;
                    // We reduce the surcharge by this relief amount
                    surchargeRelief = relief;
                    surcharge = Math.max(0, theoreticalSurcharge - surchargeRelief);
                }
            }
        }
    }

    // 4. Cess
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const total = Math.round(taxAfterRebate + surcharge + cess);

    // --- UI ---
    document.getElementById('sumIncome').textContent = `₹${fmt(income)}`;
    document.getElementById('sumDeduction').textContent = `-₹${fmt(totalDeductions)}`;
    document.getElementById('sumTaxable').textContent = `₹${fmt(taxable)}`;
    document.getElementById('sumTax').textContent = `₹${fmt(Math.round(taxAfterRebate))}`;
    
    surchargeLabel.textContent = `Surcharge (${rate}%)`;
    document.getElementById('sumSurcharge').textContent = `₹${fmt(Math.round(surcharge))}`;
    document.getElementById('sumCess').textContent = `₹${fmt(Math.round(cess))}`;
    document.getElementById('sumTotal').textContent = `₹${fmt(total)}`;

    // --- TABLE GENERATION ---
    let rows = '';
    if (income > 0) {
        let prevLimit = 0;
        for (let slab of slabs) {
            if (taxable <= prevLimit) break;
            
            let slabIncome = 0;
            let displayLimit = slab.up === Infinity ? '∞' : fmt(slab.up);
            
            if (slab.up === Infinity) slabIncome = taxable - prevLimit;
            else slabIncome = Math.min(taxable, slab.up) - prevLimit;
            
            if (slabIncome > 0) {
                let slabTax = slabIncome * (slab.pct / 100);
                rows += `<tr>
                        <td>₹${fmt(prevLimit)} - ₹${displayLimit}</td>
                        <td class="text-right">₹${fmt(Math.round(slabIncome))}</td>
                        <td class="text-right">${slab.pct}%</td>
                        <td class="text-right">₹${fmt(Math.round(slabTax))}</td>
                    </tr>`;
            }
            prevLimit = slab.up;
        }

        // Base Tax Row
        rows += `<tr class="font-semibold bg-gray-50 dark:bg-white/5"><td colspan="3">Base Tax</td><td class="text-right">₹${fmt(Math.round(baseTax))}</td></tr>`;

        // Rebates
        if (rebate > 0) {
            rows += `<tr class="text-green-600 dark:text-green-400"><td colspan="3">Less: 87A Rebate</td><td class="text-right">-₹${fmt(Math.round(rebate))}</td></tr>`;
        }
        if (rebateRelief > 0) {
            rows += `<tr class="text-green-600 dark:text-green-400"><td colspan="3">Less: 87A Marginal Relief</td><td class="text-right">-₹${fmt(Math.round(rebateRelief))}</td></tr>`;
        }
        
        // Surcharge
        if (rate > 0) {
            rows += `<tr><td colspan="3">Surcharge (${rate}%)</td><td class="text-right">₹${fmt(Math.round(theoreticalSurcharge))}</td></tr>`;
            if (surchargeRelief > 0) {
                rows += `<tr class="text-green-600 dark:text-green-400"><td colspan="3">Less: Surcharge Relief</td><td class="text-right">-₹${fmt(Math.round(surchargeRelief))}</td></tr>`;
            }
        }
        
        // Cess
        rows += `<tr><td colspan="3">Health & Education Cess (4%)</td><td class="text-right">₹${fmt(Math.round(cess))}</td></tr>`;
        
        breakBody.innerHTML = rows;
    } else {
        breakBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-[#86868b] opacity-60">Enter income to see breakdown</td></tr>`;
    }
  }

  // --- INIT ---
  inputs.forEach(el => el.addEventListener('input', calculate));
  document.querySelectorAll('.regime-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      regime = b.dataset.regime;
      toggle.setAttribute('data-active', regime);
      toggle.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      document.querySelector('.exemptions').hidden = (regime !== 'old');
      calculate();
    });
  });
  reset.onclick = () => { incomeI.value = ''; npsI.value = ''; exI.value = ''; calculate(); };
  calculate();
})();
