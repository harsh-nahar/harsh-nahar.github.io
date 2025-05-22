// script.js
(() => {
  const slabsNew = [
    { up: 400000, pct: 0 },
    { up: 800000, pct: 5 },
    { up: 1200000, pct: 10 },
    { up: 1600000, pct: 15 },
    { up: 2000000, pct: 20 },
    { up: 2400000, pct: 25 },
    { up: Infinity, pct: 30 }
  ];
  const slabsOld = [
    { up: 250000, pct: 0 },
    { up: 500000, pct: 5 },
    { up: 1000000, pct: 20 },
    { up: Infinity, pct: 30 }
  ];
  let regime = 'new';
  document.querySelectorAll('.regime-toggle button').forEach(b => b.onclick = () => {
    regime = b.dataset.regime;
    document.querySelectorAll('.regime-toggle button').forEach(x =>
      x.classList.toggle('active', x === b)
    );
    document.querySelector('.exemptions').hidden = (regime !== 'old');
    hideResults();
    validate();
  });

  const incomeI = document.getElementById('income');
  const exI     = document.getElementById('exemptions');
  const calcBtn = document.getElementById('calculate');
  const resetBtn= document.getElementById('reset');

  const validate = () => {
    const inc = parseFloat(incomeI.value);
    document.getElementById('incomeError').textContent = (inc > 0) ? '' : 'Enter a positive income';
    calcBtn.disabled = !(inc > 0);
  };
  incomeI.oninput = exI.oninput = validate;

  calcBtn.onclick = () => {
    const income = +incomeI.value;
    const exemptions = (regime === 'old') ? (+exI.value || 0) : 0;
    const stdDed = (regime === 'old') ? 50000 : 75000;
    let taxable = Math.max(0, income - stdDed - exemptions);
    if (regime === 'new' && taxable <= 1200000) taxable = 0;

    const slabs = (regime === 'new') ? slabsNew : slabsOld;
    let rem = taxable, tax = 0, prev = 0, html = '';

    slabs.forEach(s => {
      if (rem > 0) {
        const amt = Math.min(rem, s.up - prev);
        const t = amt * (s.pct/100);
        if (amt > 0) {
          html += `<tr><td>₹${prev.toLocaleString()}–₹${s.up===Infinity?'∞':s.up.toLocaleString()}</td>` +
                  `<td>₹${amt.toLocaleString()}</td><td>${s.pct}%</td><td>₹${Math.round(t).toLocaleString()}</td></tr>`;
        }
        tax += t;
        rem -= amt;
        prev = s.up;
      }
    });

    const cess = tax * 0.04;
    const total = Math.round(tax + cess);

    document.getElementById('sumIncome').textContent = '₹'+income.toLocaleString();
    document.getElementById('sumDeduction').textContent = '-₹'+stdDed.toLocaleString();
    document.getElementById('sumTaxable').textContent = '₹'+taxable.toLocaleString();
    document.getElementById('sumTax').textContent = '₹'+Math.round(tax).toLocaleString();
    document.getElementById('sumCess').textContent = '₹'+Math.round(cess).toLocaleString();
    document.getElementById('sumTotal').textContent = '₹'+total.toLocaleString();

    const sum = document.querySelector('.summary');
    sum.hidden = false;
    sum.classList.add('show');
    const btn = document.getElementById('toggleBreak');
    btn.hidden = false;
    document.querySelector('.breakdown').hidden = true;
    document.querySelector('.breakdown').classList.remove('show');
    document.getElementById('breakBody').innerHTML = html +
      `<tr><td colspan="3"><strong>Tax</strong></td><td><strong>₹${Math.round(tax).toLocaleString()}</strong></td></tr>` +
      `<tr><td colspan="3">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;

    document.getElementById('savePdf').hidden = false;
  };

  document.getElementById('toggleBreak').onclick = () => {
    const bd = document.querySelector('.breakdown');
    bd.hidden = !bd.hidden;
    bd.classList.toggle('show');
    document.getElementById('toggleBreak').textContent = bd.hidden ? 'Show Breakdown' : 'Hide Breakdown';
  };

  resetBtn.onclick = () => { incomeI.value = ''; exI.value = ''; hideResults(); validate(); };
  document.getElementById('savePdf').onclick = () => window.print();

  function hideResults() {
    document.querySelector('.summary').hidden = true;
    document.querySelector('.breakdown').hidden = true;
    document.getElementById('toggleBreak').hidden = true;
    document.getElementById('savePdf').hidden = true;
    document.querySelector('.summary').classList.remove('show');
    document.querySelector('.breakdown').classList.remove('show');
  }

  validate();
})();
