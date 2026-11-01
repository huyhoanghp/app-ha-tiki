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
