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
  const btns = document.querySelectorAll('.regime-toggle button');
  btns.forEach(b => b.addEventListener('click', () => {
    regime = b.dataset.regime;
    btns.forEach(x => x.classList.toggle('active', x === b));
    document.querySelector('.exemptions').hidden = (regime !== 'old');
    document.querySelector('.summary').hidden = true;
    document.querySelector('.breakdown').hidden = true;
    document.getElementById('toggleBreak').hidden = true;
  }));

  document.getElementById('calculate').onclick = () => {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const exemptions = parseFloat(document.getElementById('exemptions').value) || 0;
    const stdDed = (regime === 'old' ? 50000 : 75000);
    let taxable = Math.max(0, income - stdDed - (regime==='old'?exemptions:0));

    // Exemption up to 12L in new regime
    if (regime==='new' && taxable <= 1200000) taxable = 0;

    const slabs = regime==='new'? slabsNew : slabsOld;
    let rem = taxable, tax = 0, breakdownHTML = '', prev = 0;

    slabs.forEach(s => {
      if (rem > 0) {
        const amt = Math.min(rem, s.up - prev);
        const t = amt * (s.pct/100);
        if (amt>0) {
          breakdownHTML += 
            `<tr>
               <td>₹${prev.toLocaleString()}–₹${s.up===Infinity?'∞':s.up.toLocaleString()}</td>
               <td>₹${amt.toLocaleString()}</td>
               <td>${s.pct}%</td>
               <td>₹${Math.round(t).toLocaleString()}</td>
             </tr>`;
        }
        tax += t;
        rem -= amt;
        prev = s.up;
      }
    });

    const cess = tax*0.04;
    const total = Math.round(tax + cess);

    // Populate summary
    document.getElementById('sumIncome').textContent = '₹'+income.toLocaleString();
    document.getElementById('sumDeduction').textContent = '-₹'+stdDed.toLocaleString();
    document.getElementById('sumTaxable').textContent = '₹'+taxable.toLocaleString();
    document.getElementById('sumTax').textContent = '₹'+Math.round(tax).toLocaleString();
    document.getElementById('sumCess').textContent = '₹'+Math.round(cess).toLocaleString();
    document.getElementById('sumTotal').textContent = '₹'+total.toLocaleString();

    document.querySelector('.summary').hidden = false;
    const btn = document.getElementById('toggleBreak');
    btn.hidden = false;
    btn.textContent = 'Show Breakdown';
    document.querySelector('.breakdown').hidden = true;

    document.getElementById('breakBody').innerHTML = breakdownHTML +
      `<tr><td colspan="3"><strong>Tax</strong></td><td><strong>₹${Math.round(tax).toLocaleString()}</strong></td></tr>`+
      `<tr><td colspan="3">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;
  };

  document.getElementById('toggleBreak').onclick = () => {
    const bd = document.querySelector('.breakdown');
    const btn = document.getElementById('toggleBreak');
    bd.hidden = !bd.hidden;
    btn.textContent = bd.hidden? 'Show Breakdown' : 'Hide Breakdown';
  };

  document.getElementById('reset').onclick = () => {
    ['income','exemptions'].forEach(id=>document.getElementById(id).value='');
    document.querySelector('.summary').hidden = true;
    document.querySelector('.breakdown').hidden = true;
    document.getElementById('toggleBreak').hidden = true;
  };
})();
