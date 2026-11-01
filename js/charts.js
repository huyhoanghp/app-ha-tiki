'use strict';

let chartWeek = null;
let chartMonth = null;
let chartYear = null;

function barDatasetFor(entries) {
  return {
    labels: entries.map((e) => e.label),
    datasets: [{
      data: entries.map((e) => e.value),
      backgroundColor: (ctx) => (ctx.raw == null || ctx.raw >= 0 ? 'rgba(22,163,74,.75)' : 'rgba(239,68,68,.8)'),
      borderColor: (ctx) => (ctx.raw == null || ctx.raw >= 0 ? '#15803d' : '#dc2626'),
      borderWidth: 1,
      borderRadius: 6,
      maxBarThickness: 46
    }]
  };
}

function barOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ' ' + (ctx.raw >= 0 ? 'Tiết kiệm: ' : 'Rút nhiều hơn: ') + fmtVND(Math.abs(ctx.raw))
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,.05)' },
        ticks: { callback: (v) => fmtCompact(v), font: { size: 11 } }
      }
    }
  };
}

function weekEntries(n) {
  const map = groupBy('week');
  return lastNPeriods('week', n).map((p) => ({
    label: fmtDateVN(p.from).slice(0, 5),
    value: sumPeriod('week', p.key).net
  }));
}

function monthEntries(n) {
  return lastNPeriods('month', n).map((p) => {
    const [y, m] = p.key.split('-');
    return { label: m + '/' + y, value: sumPeriod('month', p.key).net };
  });
}

function yearEntries() {
  const map = groupBy('year');
  if (!Object.keys(map).length) map[String(new Date().getFullYear())] = { nap: 0, rut: 0, count: 0 };
  return sortedKeys(map, false).map((k) => ({ label: k, value: map[k].nap - map[k].rut }));
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const destroy = (c) => { if (c) c.destroy(); };

  destroy(chartWeek);
  chartWeek = new Chart($id('chart-week'), {
    type: 'bar',
    data: barDatasetFor(weekEntries(12)),
    options: barOptions()
  });

  destroy(chartMonth);
  chartMonth = new Chart($id('chart-month'), {
    type: 'bar',
    data: barDatasetFor(monthEntries(12)),
    options: barOptions()
  });

  destroy(chartYear);
  chartYear = new Chart($id('chart-year'), {
    type: 'bar',
    data: barDatasetFor(yearEntries()),
    options: barOptions()
  });
}
