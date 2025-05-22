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
  const body = document.getElementById('breakBody');

  document.querySelectorAll('.regime-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      regime = b.dataset.regime;
      toggle.setAttribute('data-active', regime);
      toggle.querySelectorAll('button').forEach(x => x.classList.toggle('active', x===b));
      document.querySelector('.exemptions').hidden = regime!=='old';
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
    const exem = regime==='old' ? (+exI.value||0) : 0;
    const std = regime==='old' ? 50000 : 75000;
    let taxbase = Math.max(0, income - std - exem);
    if (regime==='new' && taxbase <= 1200000) taxbase = 0;

    const slabs = regime==='new'? slabsNew: slabsOld;
    let rem=taxbase, sum=0, prev=0, rows='';
    slabs.forEach(s=>{
      if(rem<=0) return;
      const amt = Math.min(rem, s.up - prev);
      const t = amt*(s.pct/100);
      if(amt>0){
        rows+=`<tr>
                  <td>₹${prev.toLocaleString()}–₹${s.up===Infinity?'∞':s.up.toLocaleString()}</td>
                  <td>₹${amt.toLocaleString()}</td>
                  <td>${s.pct}%</td>
                  <td>₹${Math.round(t).toLocaleString()}</td>
               </tr>`;
      }
      sum+=t; rem-=amt; prev=s.up;
    });
    const cess = sum*0.04;
    const total = Math.round(sum+cess);

    document.getElementById('sumIncome').textContent = `₹${income.toLocaleString()}`;
    document.getElementById('sumDeduction').textContent = `-₹${std.toLocaleString()}`;
    document.getElementById('sumTaxable').textContent = `₹${taxbase.toLocaleString()}`;
    document.getElementById('sumTax').textContent = `₹${Math.round(sum).toLocaleString()}`;
    document.getElementById('sumCess').textContent = `₹${Math.round(cess).toLocaleString()}`;
    document.getElementById('sumTotal').textContent = `₹${total.toLocaleString()}`;

    body.innerHTML = rows +
      `<tr><td colspan="3"><strong>Tax</strong></td><td><strong>₹${Math.round(sum).toLocaleString()}</strong></td></tr>`+
      `<tr><td colspan="3">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;

    summary.hidden = false;
    toggleBreak.hidden = false;
    breakdown.hidden = true;
    save.hidden = false;
  };

  toggleBreak.onclick = () => {
    const open = !breakdown.hidden;
    breakdown.hidden = open;
    toggleBreak.textContent = open ? 'Show Breakdown' : 'Hide Breakdown';
  };

  reset.onclick = () => {
    incomeI.value = '';
    exI.value = '';
    hideAll(); validate();
  };
  save.onclick = () => window.print();

  function hideAll() {
    summary.hidden = true;
    breakdown.hidden = true;
    toggleBreak.hidden = true;
    save.hidden = true;
  }
  hideAll();
  validate();
})();
