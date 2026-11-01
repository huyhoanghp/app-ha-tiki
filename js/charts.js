'use strict';

let chartWeek = null;
let chartMonth = null;
let chartYear = null;
let chartWeekR = null;
let chartMonthR = null;
let chartYearR = null;

function isDarkTheme() {
  return document.documentElement.dataset.theme === 'dark';
}

function barDatasetFor(entries) {
  return {
    labels: entries.map((e) => e.label),
    datasets: [{
      data: entries.map((e) => e.value),
      backgroundColor: (ctx) => (ctx.raw == null || ctx.raw >= 0
        ? (isDarkTheme() ? 'rgba(74,222,128,.72)' : 'rgba(22,163,74,.75)')
        : (isDarkTheme() ? 'rgba(248,113,113,.75)' : 'rgba(239,68,68,.8)')),
      borderColor: (ctx) => (ctx.raw == null || ctx.raw >= 0 ? (isDarkTheme() ? '#4ade80' : '#15803d') : '#dc2626'),
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
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkTheme() ? '#223045' : '#111827',
        titleColor: isDarkTheme() ? '#e6eef7' : '#ffffff',
        bodyColor: isDarkTheme() ? '#cdd9e5' : '#ffffff',
        callbacks: {
          label: (ctx) => ' ' + (ctx.raw >= 0 ? 'Tiết kiệm: ' : 'Rút nhiều hơn: ') + fmtVND(Math.abs(ctx.raw))
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: isDarkTheme() ? '#93a5b8' : '#4b5563' } },
      y: {
        beginAtZero: true,
        grid: { color: isDarkTheme() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)' },
        ticks: { callback: (v) => fmtCompact(v), font: { size: 11 }, color: isDarkTheme() ? '#93a5b8' : '#4b5563' }
      }
    }
  };
}

function weekEntries(n) {
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

function buildBar(canvasId, entries) {
  const el = $id(canvasId);
  if (!el) return null;
  return new Chart(el, {
    type: 'bar',
    data: barDatasetFor(entries),
    options: barOptions()
  });
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;
  if (chartWeek) chartWeek.destroy();
  if (chartMonth) chartMonth.destroy();
  if (chartYear) chartYear.destroy();
  chartWeek = buildBar('chart-week', weekEntries(12));
  chartMonth = buildBar('chart-month', monthEntries(12));
  chartYear = buildBar('chart-year', yearEntries());
}

function renderReportCharts() {
  if (typeof Chart === 'undefined') return;
  if (chartWeekR) chartWeekR.destroy();
  if (chartMonthR) chartMonthR.destroy();
  if (chartYearR) chartYearR.destroy();
  chartWeekR = buildBar('chart-week-r', weekEntries(12));
  chartMonthR = buildBar('chart-month-r', monthEntries(12));
  chartYearR = buildBar('chart-year-r', yearEntries());
}
