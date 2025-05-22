// script.js
(() => {
  const slabsNew = [
    { up:400000, pct:0 },
    { up:800000, pct:5 },
    { up:1200000, pct:10 },
    { up:1600000, pct:15 },
    { up:2000000, pct:20 },
    { up:2400000, pct:25 },
    { up:Infinity, pct:30 },
  ];
  const slabsOld = [
    { up:250000, pct:0 },
    { up:500000, pct:5 },
    { up:1000000, pct:20 },
    { up:Infinity, pct:30 },
  ];

  let regime='new';
  const container=document.querySelector('.regime-toggle');
  const incomeI=document.getElementById('income');
  const exI=document.getElementById('exemptions');
  const calcBtn=document.getElementById('calculate');
  const resetBtn=document.getElementById('reset');
  const saveBtn=document.getElementById('savePdf');
  const toggleBtn=document.getElementById('toggleBreak');
  const summary=document.querySelector('.summary');
  const breakdown=document.querySelector('.breakdown');
  const breakBody=document.getElementById('breakBody');

  document.querySelectorAll('.regime-toggle button').forEach(btn=>{
    btn.onclick=()=>{
      regime=btn.dataset.regime;
      container.setAttribute('data-active',regime);
      container.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
      document.querySelector('.exemptions').hidden=regime!=='old';
      hideResults(); validate();
    }
  });

  function validate(){
    const inc=parseFloat(incomeI.value);
    document.getElementById('incomeError').textContent=inc>0? '':'Enter valid income';
    calcBtn.disabled=!(inc>0);
  }
  incomeI.oninput=exI.oninput=validate;

  calcBtn.onclick=()=>{
    const income=+incomeI.value;
    const exem=regime==='old'? (+exI.value||0):0;
    const std=regime==='old'?50000:75000;
    let taxable=Math.max(0,income-std-exem);
    if(regime==='new'&&taxable<=1200000)taxable=0;

    const slabs=regime==='new'?slabsNew:slabsOld;
    let rem=taxable, tax=0, prev=0, rows='';
    slabs.forEach(s=>{
      if(rem<=0)return;
      const amt=Math.min(rem,s.up-prev);
      const t=amt*(s.pct/100);
      if(amt>0){
        rows+=`<tr>
                 <td>₹${prev.toLocaleString()}–₹${s.up===Infinity?'∞':s.up.toLocaleString()}</td>
                 <td>₹${amt.toLocaleString()}</td>
                 <td>${s.pct}%</td>
                 <td>₹${Math.round(t).toLocaleString()}</td>
               </tr>`;
      }
      tax+=t; rem-=amt; prev=s.up;
    });
    const cess=tax*0.04, total=Math.round(tax+cess);

    document.getElementById('sumIncome').textContent=`₹${income.toLocaleString()}`;
    document.getElementById('sumDeduction').textContent=`-₹${std.toLocaleString()}`;
    document.getElementById('sumTaxable').textContent=`₹${taxable.toLocaleString()}`;
    document.getElementById('sumTax').textContent=`₹${Math.round(tax).toLocaleString()}`;
    document.getElementById('sumCess').textContent=`₹${Math.round(cess).toLocaleString()}`;
    document.getElementById('sumTotal').textContent=`₹${total.toLocaleString()}`;

    breakBody.innerHTML=rows+ 
      `<tr><td colspan="3"><strong>Tax</strong></td><td><strong>₹${Math.round(tax).toLocaleString()}</strong></td></tr>`+
      `<tr><td colspan="3">Cess (4%)</td><td>₹${Math.round(cess).toLocaleString()}</td></tr>`;

    summary.hidden=false; toggleBtn.hidden=false; breakdown.hidden=true; saveBtn.hidden=false;
  };

  toggleBtn.onclick=()=>{
    const open=!breakdown.hidden;
    breakdown.hidden=open;
    toggleBtn.textContent=open?'Show Breakdown':'Hide Breakdown';
  };

  resetBtn.onclick=()=>{
    incomeI.value=''; exI.value=''; hideResults(); validate();
  };
  saveBtn.onclick=()=>window.print();

  function hideResults(){
    summary.hidden=true; breakdown.hidden=true; toggleBtn.hidden=true; saveBtn.hidden=true;
  }
  hideResults(); validate();
})();