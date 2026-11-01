'use strict';

function periodLabel(type, key) {
  if (type === 'week') {
    return fmtDateVN(key).slice(0, 5);
  }
  if (type === 'month') {
    const [y, m] = key.split('-');
    return m + '/' + y;
  }
  return key;
}

function reportPeriodCards() {
  const s = computeStats();
  const thisWeek = sumPeriod('week', dateToStr(weekStartOf(todayStr())));
  const thisMonth = sumPeriod('month', todayStr().slice(0, 7));
  const thisYear = sumPeriod('year', todayStr().slice(0, 4));
  const items = [
    { icon: '📅', title: 'Tuần này', data: thisWeek, cls: '' },
    { icon: '🗓️', title: 'Tháng này', data: thisMonth, cls: 'gold' },
    { icon: '📈', title: 'Năm nay', data: thisYear, cls: 'red' }
  ];
  return items.map((it) => `
    <div class="stat-card ${it.cls}">
      <div class="stat-icon">${it.icon} <b>${it.title}</b></div>
      <div class="stat-value">${fmtVND(it.data.net)}</div>
      <div class="stat-label">Nạp ${fmtCompact(it.data.nap)} · Rút ${fmtCompact(it.data.rut)} · ${it.data.count} GD</div>
    </div>
  `).join('');
}

function reportTable(type) {
  const map = groupBy(type);
  const keys = sortedKeys(map, true);
  let html = '<thead><tr><th>Kỳ</th><th class="num">Số GD</th><th class="num">Nạp</th><th class="num">Rút</th><th class="num">Ròng</th></tr></thead><tbody>';
  if (!keys.length) {
    html += '<tr><td colspan="5" class="empty-note">Chưa có dữ liệu</td></tr>';
  }
  let tNap = 0, tRut = 0, tCount = 0;
  for (const k of keys) {
    const g = map[k];
    tNap += g.nap; tRut += g.rut; tCount += g.count;
    const net = g.nap - g.rut;
    html += `<tr><td><b>${periodLabel(type, k)}</b></td>
      <td class="num">${g.count}</td>
      <td class="num tx-plus">${fmtVND(g.nap)}</td>
      <td class="num tx-minus">${fmtVND(g.rut)}</td>
      <td class="num ${net >= 0 ? 'tx-plus' : 'tx-minus'}"><b>${fmtVND(net)}</b></td></tr>`;
  }
  html += `</tbody><tfoot><tr>
    <th>Tổng</th><th class="num">${tCount}</th>
    <th class="num">${fmtVND(tNap)}</th><th class="num">${fmtVND(tRut)}</th>
    <th class="num">${fmtVND(tNap - tRut)}</th></tr></tfoot>`;
  return html;
}

function renderReport() {
  $id('report-period-cards').innerHTML = reportPeriodCards();
  $id('table-week').innerHTML = reportTable('week');
  $id('table-month').innerHTML = reportTable('month');
  $id('table-year').innerHTML = reportTable('year');
  if ($id('tab-baocao').classList.contains('active') && typeof renderReportCharts === 'function') renderReportCharts();
}

function fillPrintMeta() {
  const s = computeStats();
  const now = new Date();
  const gen = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  $id('print-meta').innerHTML =
    '<div>Chủ sở hữu: <b>' + escHtml(state.settings.owner) + '</b></div>' +
    '<div>Ngày xuất: ' + gen + '</div>' +
    '<div>Tổng tiền tiết kiệm: <b>' + fmtVND(s.total) + '</b> (' + s.totalQty + ' tờ)</div>';
}

function buildReportText() {
  const s = computeStats();
  const now = new Date();
  const gen = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const thisWeek = sumPeriod('week', dateToStr(weekStartOf(todayStr())));
  const thisMonth = sumPeriod('month', todayStr().slice(0, 7));
  const recent = state.transactions.slice(0, 5).map((t) => {
    const sign = t.type === 'nap' ? '+' : '-';
    const cat = t.type === 'nap' ? t.source : t.purpose;
    return `[${fmtDateVN(t.date)}] ${sign}${fmtVND(t.amount)} (${fmtDenom(t.denom)} x${t.qty}) - ${cat || ''}`;
  });
  return [
    '📊 BÁO CÁO TIẾT KIỆM',
    'Chủ sở hữu: ' + state.settings.owner,
    'Ngày báo cáo: ' + gen,
    '------------------------------',
    '💰 Tổng tiền: ' + fmtVND(s.total) + ' (' + s.totalQty + ' tờ)',
    '📆 Số ngày đã tiết kiệm: ' + s.activeDays + ' ngày',
    '📈 TB mỗi tuần: ' + fmtVND(s.avgWeek),
    '📈 TB mỗi tháng: ' + fmtVND(s.avgMonth),
    '📈 TB mỗi năm: ' + fmtVND(s.avgYear),
    '🔁 Tuần hiện tại: ' + s.weekInCycle + ' / chu kỳ ' + s.cycleWeeks + ' tuần',
    '------------------------------',
    'Tuần này: Nạp ' + fmtVND(thisWeek.nap) + ' | Rút ' + fmtVND(thisWeek.rut) + ' | Ròng ' + fmtVND(thisWeek.net),
    'Tháng này: Nạp ' + fmtVND(thisMonth.nap) + ' | Rút ' + fmtVND(thisMonth.rut) + ' | Ròng ' + fmtVND(thisMonth.net),
    '------------------------------',
    'Giao dịch gần nhất:',
    ...recent,
    '------------------------------',
    'Gửi từ App Tiết Kiệm 💚'
  ].join('\n');
}

function sendEmailReport() {
  const to = (state.user && state.user.email) || ALLOWED_EMAIL;
  const subject = '📊 Báo cáo tiết kiệm - ' + state.settings.owner;
  const body = buildReportText();
  const url = 'mailto:' + encodeURIComponent(to)
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body);
  window.location.href = url;
  toast('📧 Đang mở trình soạn thảo email...');
}

async function copyReport() {
  const text = buildReportText();
  try {
    await navigator.clipboard.writeText(text);
    toast('📋 Đã sao chép báo cáo vào clipboard');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('📋 Đã sao chép báo cáo');
  }
}

function exportCSV() {
  const rows = [['Ngày', 'Loại', 'Mệnh giá', 'Số lượng', 'Thành tiền', 'Nguồn/Mục đích', 'Ghi chú']];
  const sorted = state.transactions.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  for (const t of sorted) {
    rows.push([
      t.date,
      t.type === 'nap' ? 'Nạp' : 'Rút',
      t.denom,
      t.qty,
      t.amount,
      t.type === 'nap' ? (t.source || '') : (t.purpose || ''),
      t.note || ''
    ]);
  }
  const csv = '\uFEFF' + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tietkiem_' + todayStr() + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast('⬇️ Đã xuất file CSV');
}

/* ================= XLSX ================= */

let exceljsLoading = null;

function loadExcelJS() {
  if (window.ExcelJS) return Promise.resolve();
  if (exceljsLoading) return exceljsLoading;
  exceljsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
    s.onload = () => resolve();
    s.onerror = () => {
      exceljsLoading = null;
      reject(new Error('Không tải được thư viện ExcelJS — kiểm tra kết nối mạng'));
    };
    document.head.appendChild(s);
  });
  return exceljsLoading;
}

function thinBorder() {
  return {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };
}

function xlsxPeriods(type, n) {
  return lastNPeriods(type, n).map((p) => {
    const s = sumPeriod(type, p.key);
    return {
      label: periodLabel(type, p.key),
      nap: s.nap,
      rut: s.rut,
      net: s.net,
      count: s.count
    };
  });
}

function xlsxSection(ws, row, title, periods) {
  ws.mergeCells('A' + row + ':E' + row);
  const t = ws.getCell('A' + row);
  t.value = title;
  t.font = { bold: true, size: 12, color: { argb: 'FF15803D' } };
  row++;
  const header = ['Kỳ', 'Số GD', 'Nạp', 'Rút', 'Ròng'];
  header.forEach((h, i) => {
    const c = ws.getCell(row, i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    c.alignment = { horizontal: 'center' };
    c.border = thinBorder();
  });
  row++;
  let tN = 0, tR = 0, tC = 0;
  periods.forEach((p, idx) => {
    tN += p.nap; tR += p.rut; tC += p.count;
    const vals = [p.label, p.count, p.nap, p.rut, p.net];
    vals.forEach((v, i) => {
      const c = ws.getCell(row, i + 1);
      c.value = v;
      c.border = thinBorder();
      if (i >= 1) c.alignment = { horizontal: 'right' };
      if (i >= 2) c.numFmt = '#,##0 "₫"';
      if (i === 4) c.font = { bold: true, color: { argb: v >= 0 ? 'FF166534' : 'FFB91C1C' } };
      else if (idx % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    });
    row++;
  });
  const tot = ['Tổng', tC, tN, tR, tN - tR];
  tot.forEach((v, i) => {
    const c = ws.getCell(row, i + 1);
    c.value = v;
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
    c.border = thinBorder();
    if (i >= 1) c.alignment = { horizontal: 'right' };
    if (i >= 2) c.numFmt = '#,##0 "₫"';
  });
  return row + 1;
}

function xlsxAddChart(wb, ws, row, chart) {
  if (!chart || !chart.canvas) return row;
  try {
    const canvas = chart.canvas;
    if (!canvas.width || !canvas.height) return row;
    const ratio = canvas.height / canvas.width;
    const imgId = wb.addImage({ base64: chart.toBase64Image('image/png', 1), extension: 'png' });
    const width = 620;
    const height = Math.round(width * ratio);
    ws.addImage(imgId, { tl: { col: 0, row: row }, ext: { width: width, height: height } });
    return row + Math.ceil(height / 19) + 2;
  } catch (e) {
    return row;
  }
}

async function exportXLSX() {
  if (!$id('tab-baocao').classList.contains('active')) switchTab('baocao');
  const btn = $id('btn-xlsx');
  btn.disabled = true;
  btn.textContent = '⏳ Đang tạo file...';
  try {
    await loadExcelJS();
    await new Promise((r) => setTimeout(r, 400));
    const wb = new ExcelJS.Workbook();
    wb.creator = 'App Tiet Kiem';
    const ws = wb.addWorksheet('Bao cao', {
      pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
      views: [{ showGridLines: false }]
    });
    ws.columns = [{ width: 16 }, { width: 10 }, { width: 17 }, { width: 17 }, { width: 17 }];
    const s = computeStats();
    const now = new Date();
    const gen = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    ws.mergeCells('A1:E1');
    const title = ws.getCell('A1');
    title.value = '📊 BÁO CÁO TIẾT KIỆM';
    title.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    ws.getRow(1).height = 34;

    ws.mergeCells('A2:E2');
    ws.getCell('A2').value = 'Chủ sở hữu: ' + state.settings.owner;
    ws.mergeCells('A3:E3');
    ws.getCell('A3').value = 'Ngày xuất báo cáo: ' + gen;
    ws.mergeCells('A4:E4');
    const totCell = ws.getCell('A4');
    totCell.value = '💰 Tổng tiền tiết kiệm: ' + fmtVND(s.total) + '  (' + s.totalQty + ' tờ)';
    totCell.font = { bold: true, size: 13, color: { argb: 'FF166534' } };

    let row = 6;
    ws.mergeCells('A' + row + ':E' + row);
    const trendTitle = ws.getCell('A' + row);
    trendTitle.value = '📈 XU HƯỚNG GẦN ĐÂY';
    trendTitle.font = { bold: true, size: 12 };
    trendTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
    row++;
    const trend = [];
    for (const type of ['week', 'month', 'year']) {
      const ps = xlsxPeriods(type, 2);
      trend.push(Object.assign({}, ps[1], { label: (type === 'week' ? 'Tuần này' : type === 'month' ? 'Tháng này' : 'Năm nay') + ' (' + ps[1].label + ')' }));
      trend.push(Object.assign({}, ps[0], { label: (type === 'week' ? 'Tuần trước' : type === 'month' ? 'Tháng trước' : 'Năm trước') + ' (' + ps[0].label + ')' }));
    }
    row = xlsxSection(ws, row, '', trend);

    row = xlsxSection(ws, row, '📅 THEO TUẦN (12 tuần gần nhất)', xlsxPeriods('week', 12));
    row = xlsxAddChart(wb, ws, row, chartWeekR);
    row = xlsxSection(ws, row, '🗓️ THEO THÁNG (12 tháng gần nhất)', xlsxPeriods('month', 12));
    row = xlsxAddChart(wb, ws, row, chartMonthR);
    row = xlsxSection(ws, row, '📈 THEO NĂM', xlsxPeriods('year', 6));
    row = xlsxAddChart(wb, ws, row, chartYearR);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bao-cao-tiet-kiem_' + todayStr() + '.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast('📊 Đã xuất file XLSX đẹp');
  } catch (err) {
    toast('❌ ' + (err.message || 'Lỗi tạo file XLSX'));
  } finally {
    btn.disabled = false;
    btn.textContent = '📊 Xuất XLSX (báo cáo đẹp)';
  }
}
