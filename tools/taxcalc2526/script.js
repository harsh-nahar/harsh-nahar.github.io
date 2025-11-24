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

  // --- DOM ELEMENTS ---
  const incomeI = document.getElementById('income');
  const npsI = document.getElementById('nps');
  const exI = document.getElementById('exemptions');
  const reset = document.getElementById('reset');
  const toggle = document.querySelector('.regime-toggle');
  const resultContainer = document.getElementById('resultContainer');
  const breakBody = document.getElementById('breakBody');
  const surchargeLabel = document.getElementById('surchargeLabel');

  // --- STATE ---
  let regime = 'new';

  // --- HELPERS ---
  const fmt = (n) => n.toLocaleString('en-IN');

  // Core Logic: Calculate Base Tax for ANY income amount
  // We separate this so we can call it for Thresholds (50L, 1Cr) to calculate relief
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

  // Core Logic: Get Surcharge Rate
  function getSurchargeRate(taxableIncome, currentRegime) {
    if (taxableIncome <= 5000000) return 0;
    if (taxableIncome <= 10000000) return 10;
    if (taxableIncome <= 20000000) return 15;
    
    // Above 2Cr
    if (currentRegime === 'new') {
      return 25; // New Regime capped at 25%
    } else {
      // Old Regime
      if (taxableIncome <= 50000000) return 25;
      else return 37; // Old Regime goes up to 37%
    }
  }

  // --- MAIN CALCULATOR ---
  function calculate() {
    const income = parseFloat(incomeI.value) || 0;
    
    // Fade UI
    if (income > 0) resultContainer.classList.remove('opacity-50');
    else resultContainer.classList.add('opacity-50');

    const nps = parseFloat(npsI.value) || 0;
    const otherExemptions = regime === 'old' ? (parseFloat(exI.value) || 0) : 0;
    const stdDed = regime === 'new' ? 75000 : 50000;

    const totalDeductions = stdDed + nps + otherExemptions;
    const taxable = Math.max(0, income - totalDeductions);
    const slabs = regime === 'new' ? slabsNew : slabsOld;

    // 1. BASE TAX
    let baseTax = getBaseTax(taxable, slabs);

    // 2. REBATE (87A) & MARGINAL RELIEF (New Regime Cliff)
    let rebate = 0;
    let rebateRelief = 0; // Logic for 12L - 12.7L zone

    if (regime === 'new') {
        if (taxable <= 1200000) {
            rebate = baseTax; // Full rebate
        } else {
            // New Regime Marginal Relief for 87A
            // If Taxable > 12L, Tax Payable cannot exceed (Taxable - 12L)
            const excessIncome = taxable - 1200000;
            // Check if calculating normally is more expensive than just paying the excess
            if (baseTax > excessIncome) {
                // We cap tax at excessIncome.
                // The difference is "Relief"
                // However, visually it's cleaner to just say: Tax = ExcessIncome
                // But to fit the standard tax flow, we treat it as a relief deduction
                // New Base Tax effectively becomes `excessIncome`
                rebateRelief = baseTax - excessIncome;
            }
        }
    } else {
        // Old Regime Rebate
        if (taxable <= 500000) rebate = baseTax;
    }

    let taxAfterRebate = Math.max(0, baseTax - rebate - rebateRelief);

    // 3. SURCHARGE & MARGINAL RELIEF
    let surcharge = 0;
    let rate = 0;
    
    if (taxAfterRebate > 0) {
        rate = getSurchargeRate(taxable, regime);
        
        if (rate > 0) {
            surcharge = taxAfterRebate * (rate / 100);

            // Check Surcharge Marginal Relief
            // Rule: Total Tax cannot exceed (Tax on Threshold + Income over Threshold)
            
            // Find the relevant threshold
            let threshold = 0;
            if (taxable > 50000000) threshold = 50000000;
            else if (taxable > 20000000) threshold = 20000000;
            else if (taxable > 10000000) threshold = 10000000;
            else if (taxable > 5000000) threshold = 5000000;

            if (threshold > 0) {
                // A. Calculate Tax at Threshold
                const taxOnThreshold = getBaseTax(threshold, slabs);
                
                // B. Calculate Surcharge at Threshold
                // (We use the rate that applies exactly AT the threshold)
                const rateOnThreshold = getSurchargeRate(threshold, regime); 
                const surOnThreshold = taxOnThreshold * (rateOnThreshold / 100);
                
                // C. Max Allowed Tax = (Tax+Sur at threshold) + (Income earned above threshold)
                const incomeAboveThreshold = taxable - threshold;
                const maxTax = taxOnThreshold + surOnThreshold + incomeAboveThreshold;
                
                // D. Current Calculated Tax
                const currentTax = taxAfterRebate + surcharge;
                
                if (currentTax > maxTax) {
                    const relief = currentTax - maxTax;
                    surcharge = Math.max(0, surcharge - relief);
                }
            }
        }
    }

    // 4. CESS (4%)
    const cess = (taxAfterRebate + surcharge) * 0.04;

    // 5. TOTAL
    const totalLiability = Math.round(taxAfterRebate + surcharge + cess);

    // --- UPDATE UI ---
    document.getElementById('sumIncome').textContent = `₹${fmt(income)}`;
    document.getElementById('sumDeduction').textContent = `-₹${fmt(totalDeductions)}`;
    document.getElementById('sumTaxable').textContent = `₹${fmt(taxable)}`;
    document.getElementById('sumTax').textContent = `₹${fmt(Math.round(taxAfterRebate))}`;
    
    surchargeLabel.textContent = `Surcharge (${rate}%)`;
    document.getElementById('sumSurcharge').textContent = `₹${fmt(Math.round(surcharge))}`;
    document.getElementById('sumCess').textContent = `₹${fmt(Math.round(cess))}`;
    document.getElementById('sumTotal').textContent = `₹${fmt(totalLiability)}`;

    // --- GENERATE TABLE ROWS (Visual Breakdown) ---
    let rowsHTML = '';
    if (income > 0) {
        let prevLimit = 0;
        for (let slab of slabs) {
            if (taxable <= prevLimit) break;
            
            let slabIncome = 0;
            let displayLimit = slab.up === Infinity ? '∞' : fmt(slab.up);
            
            if (slab.up === Infinity) {
                slabIncome = taxable - prevLimit;
            } else {
                slabIncome = Math.min(taxable, slab.up) - prevLimit;
            }
            
            if (slabIncome > 0) {
                let slabTax = slabIncome * (slab.pct / 100);
                rowsHTML += `
                    <tr>
                        <td>₹${fmt(prevLimit)} - ₹${displayLimit}</td>
                        <td class="text-right">₹${fmt(Math.round(slabIncome))}</td>
                        <td class="text-right">${slab.pct}%</td>
                        <td class="text-right">₹${fmt(Math.round(slabTax))}</td>
                    </tr>
                `;
            }
            prevLimit = slab.up;
        }

        // Add Specials (Rebate, Surcharge, etc) to table
        if (rebate > 0) {
            rowsHTML += `<tr class="text-green-600 dark:text-green-400"><td colspan="3">Less: 87A Rebate</td><td class="text-right">-₹${fmt(Math.round(rebate))}</td></tr>`;
        }
        if (rebateRelief > 0) {
            rowsHTML += `<tr class="text-green-600 dark:text-green-400"><td colspan="3">Less: 87A Marginal Relief</td><td class="text-right">-₹${fmt(Math.round(rebateRelief))}</td></tr>`;
        }
        
        rowsHTML += `<tr class="font-semibold"><td colspan="3">Tax Payable</td><td class="text-right">₹${fmt(Math.round(taxAfterRebate))}</td></tr>`;
        
        if (surcharge > 0 || rate > 0) {
            // Check if surcharge was reduced by marginal relief for display note? 
            // (Optional, but we just show final amount)
            rowsHTML += `<tr><td colspan="3">Surcharge (${rate}%)</td><td class="text-right">₹${fmt(Math.round(surcharge))}</td></tr>`;
        }
        
        rowsHTML += `<tr><td colspan="3">Health & Education Cess (4%)</td><td class="text-right">₹${fmt(Math.round(cess))}</td></tr>`;
        
        breakBody.innerHTML = rowsHTML;
    } else {
        breakBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-[#86868b] opacity-60">Enter income to see breakdown</td></tr>`;
    }
  }

  // --- INITIALIZATION ---
  
  // Event: Input Changes
  inputs.forEach(el => el.addEventListener('input', calculate));

  // Event: Regime Toggle
  document.querySelectorAll('.regime-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      regime = b.dataset.regime;
      toggle.setAttribute('data-active', regime);
      toggle.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      // Toggle Visibility of Exemptions
      document.querySelector('.exemptions').hidden = (regime !== 'old');
      calculate();
    });
  });

  // Event: Reset
  reset.onclick = () => {
    incomeI.value = '';
    npsI.value = '';
    exI.value = '';
    calculate();
  };

  // Run on load
  calculate();

})();
