import React, { useState, useEffect } from 'react';
import { Download, CalendarRange, BarChart3, TrendingUp, Clock3, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Card from '../components/Card';
import { getRequestsSummary, getDepartmentPerformance, getMonthlyReport } from '../api/reports.api';
import { formatStatus } from '../utils/formatters';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [deptPerf, setDeptPerf] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const buildQueryParams = () => ({
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  });

  const setPresetRange = (preset) => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === '30d') {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      setStartDate(formatDate(start));
      setEndDate(formatDate(today));
      return;
    }

    if (preset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
      return;
    }

    if (preset === 'quarter') {
      const currentMonth = today.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const start = new Date(today.getFullYear(), quarterStartMonth, 1);
      const end = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  useEffect(() => {
    setLoading(true);
    const params = buildQueryParams();

    Promise.all([
      getRequestsSummary(params),
      getMonthlyReport(params),
      getDepartmentPerformance(params),
    ]).then(([sumRes, monRes, deptRes]) => {
      setSummary(sumRes.data.data || {});
      setMonthly(monRes.data.data || []);
      setDeptPerf(deptRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [startDate, endDate]);

  const stats = summary?.byStatus || {};
  const total = summary?.total || 0;
  const approved = stats['APPROVED'] || 0;
  const rejected = stats['REJECTED'] || 0;
  const pending = (stats['SUBMITTED'] || 0) + (stats['UNDER_REVIEW'] || 0) + (stats['PROCESSING'] || 0);
  const approvalRate = approved + rejected > 0
    ? Math.round((approved / (approved + rejected)) * 100)
    : 0;

  const maxMonthly = Math.max(...monthly.map((m) => m.submitted || 0), 1);
  const maxDept = Math.max(...deptPerf.map((d) => d.total || 0), 1);

  const statCards = [
    {
      title: 'Total Requests',
      value: total,
      hint: 'In the selected window',
      icon: BarChart3,
      gradient: 'from-sky-600 via-blue-600 to-indigo-600',
    },
    {
      title: 'Approved',
      value: approved,
      hint: 'Ready for action',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
    },
    {
      title: 'Rejected',
      value: rejected,
      hint: 'Closed with feedback',
      icon: XCircle,
      gradient: 'from-rose-500 via-red-500 to-orange-500',
    },
    {
      title: 'Pending',
      value: pending,
      hint: 'Awaiting review',
      icon: Clock3,
      gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    },
    {
      title: 'Approval Rate',
      value: `${approvalRate}%`,
      hint: 'Efficiency signal',
      icon: TrendingUp,
      gradient: 'from-violet-600 via-fuchsia-600 to-pink-600',
    },
  ];

  const buildExportData = () => {
    const statusRows = Object.entries(stats).map(([status, count]) => ({
      status: formatStatus(status),
      count,
    }));

    const monthlyRows = monthly.map((m) => ({
      month: new Date(`${m.month}-01`).toLocaleString('default', { month: 'short', year: 'numeric' }),
      submitted: m.submitted || 0,
      approved: m.approved || 0,
      rejected: m.rejected || 0,
      completed: m.completed || 0,
      total: m.total || 0,
    }));

    const departmentRows = deptPerf.map((d) => ({
      department: d.name,
      total: d.total || 0,
      completed: d.completed || 0,
      pending: d.pending || 0,
      rejected: d.rejected || 0,
      completionRate: `${d.completionRate || 0}%`,
    }));

    return { statusRows, monthlyRows, departmentRows };
  };

  const getFileName = (extension) => {
    const datePart = new Date().toISOString().slice(0, 10);
    return `request-reports-${datePart}.${extension}`;
  };

  const getRangeLabel = () => {
    if (!startDate && !endDate) return 'All dates';
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    return `Until ${endDate}`;
  };

  const prettyRangeLabel = getRangeLabel();

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const { statusRows, monthlyRows, departmentRows } = buildExportData();

    const rows = [
      ['Request Reports'],
      [`Generated At`, new Date().toLocaleString()],
      [],
      ['Summary'],
      ['Total Requests', total],
      ['Approved', approved],
      ['Rejected', rejected],
      ['Pending', pending],
      ['Approval Rate', `${approvalRate}%`],
      [],
      ['Status Breakdown'],
      ['Status', 'Count'],
      ...statusRows.map((row) => [row.status, row.count]),
      [],
      ['Monthly Trend'],
      ['Month', 'Submitted', 'Approved', 'Rejected', 'Completed', 'Total'],
      ...monthlyRows.map((row) => [row.month, row.submitted, row.approved, row.rejected, row.completed, row.total]),
      [],
      ['Department Performance'],
      ['Department', 'Total', 'Completed', 'Pending', 'Rejected', 'Completion Rate'],
      ...departmentRows.map((row) => [row.department, row.total, row.completed, row.pending, row.rejected, row.completionRate]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), getFileName('csv'));
  };

  const handleExportExcel = () => {
    const { statusRows, monthlyRows, departmentRows } = buildExportData();
    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      { metric: 'Total Requests', value: total },
      { metric: 'Approved', value: approved },
      { metric: 'Rejected', value: rejected },
      { metric: 'Pending', value: pending },
      { metric: 'Approval Rate', value: `${approvalRate}%` },
    ]);
    const statusSheet = XLSX.utils.json_to_sheet(statusRows);
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyRows);
    const departmentSheet = XLSX.utils.json_to_sheet(departmentRows);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Status');
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Trend');
    XLSX.utils.book_append_sheet(workbook, departmentSheet, 'Department');

    XLSX.writeFile(workbook, getFileName('xlsx'));
  };

  const handleExportPDF = () => {
    const { statusRows, monthlyRows, departmentRows } = buildExportData();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    doc.setFontSize(16);
    doc.text('Request Reports', 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    autoTable(doc, {
      startY: 78,
      head: [['Metric', 'Value']],
      body: [
        ['Total Requests', total],
        ['Approved', approved],
        ['Rejected', rejected],
        ['Pending', pending],
        ['Approval Rate', `${approvalRate}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Status', 'Count']],
      body: statusRows.map((row) => [row.status, row.count]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Month', 'Submitted', 'Approved', 'Rejected', 'Completed', 'Total']],
      body: monthlyRows.map((row) => [row.month, row.submitted, row.approved, row.rejected, row.completed, row.total]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 24, right: 24 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Department', 'Total', 'Completed', 'Pending', 'Rejected', 'Completion Rate']],
      body: departmentRows.map((row) => [row.department, row.total, row.completed, row.pending, row.rejected, row.completionRate]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 24, right: 24 },
    });

    doc.save(getFileName('pdf'));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-indigo-100 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">
              <Sparkles size={12} /> Premium analytics
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Reports</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
              A refined view of request health, monthly momentum, department performance, and export-ready insights.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600 sm:gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <CalendarRange size={14} /> {prettyRangeLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <BarChart3 size={14} /> {total} total requests
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none [color-scheme:light]"
              />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none [color-scheme:light]"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Clear filter
            </button>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPresetRange('all')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">All time</button>
          <button type="button" onClick={() => setPresetRange('30d')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Last 30 days</button>
          <button type="button" onClick={() => setPresetRange('month')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">This month</button>
          <button type="button" onClick={() => setPresetRange('quarter')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">This quarter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.gradient} text-white`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{card.title}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight">{card.value}</p>
                  <p className="mt-2 text-sm text-white/80">{card.hint}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3 shadow-lg backdrop-blur-md">
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active filter</p>
          <p className="mt-1 text-sm font-medium text-slate-800">Showing: {prettyRangeLabel}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white md:flex">
          <BarChart3 size={14} /> Live analytics
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="relative overflow-hidden border border-slate-200/70 bg-white/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Monthly Trend</h3>
              <p className="mt-1 text-sm text-slate-500">Submitted, approved, and rejected volumes across the selected window.</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {monthly.length} buckets
            </div>
          </div>

          {monthly.length > 0 ? (
            <div className="space-y-5">
              {monthly.map((m) => {
                const submittedWidth = (m.submitted || 0) / maxMonthly;
                const approvedWidth = (m.approved || 0) / maxMonthly;
                const rejectedWidth = (m.rejected || 0) / maxMonthly;

                return (
                  <div key={m.month} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-800">
                        {new Date(m.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">S {m.submitted || 0}</span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">A {m.approved || 0}</span>
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">R {m.rejected || 0}</span>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="flex h-full">
                        <div className="bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${submittedWidth * 100}%` }} title="Submitted" />
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${approvedWidth * 100}%` }} title="Approved" />
                        <div className="bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${rejectedWidth * 100}%` }} title="Rejected" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No monthly data available.
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden border border-slate-200/70 bg-white/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Status Breakdown</h3>
              <p className="mt-1 text-sm text-slate-500">Distribution of request status for the selected scope.</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {Object.keys(stats).length} statuses
            </div>
          </div>

          {Object.keys(stats).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats).map(([status, count]) => {
                const percent = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-800">{formatStatus(status)}</span>
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-500">{percent.toFixed(0)}% of total</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No status data available.
            </div>
          )}
        </Card>
      </div>

      {deptPerf.length > 0 && (
        <Card className="relative overflow-hidden border border-slate-200/70 bg-white/80">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-800 via-slate-700 to-blue-700" />
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Department Performance</h3>
              <p className="mt-1 text-sm text-slate-500">Department-level request volume within the selected filters.</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {deptPerf.length} departments
            </div>
          </div>

          <div className="space-y-4">
            {deptPerf.map((d) => {
              const percent = ((d.total || 0) / maxDept) * 100;
              return (
                <div key={d.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{d.name}</span>
                    <span className="text-sm font-bold text-slate-900">{d.total ?? 0} requests</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600 md:grid-cols-4">
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm"><span className="block font-semibold text-slate-900">{d.completed || 0}</span>Completed</div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm"><span className="block font-semibold text-slate-900">{d.pending || 0}</span>Pending</div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm"><span className="block font-semibold text-slate-900">{d.rejected || 0}</span>Rejected</div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm"><span className="block font-semibold text-slate-900">{d.completionRate || 0}%</span>Completion</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="relative overflow-hidden border border-slate-200/70 bg-white/80">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Export Data</h3>
            <p className="mt-1 text-sm text-slate-500">Create polished downloads with the current filtered dataset.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            onClick={handleExportPDF}
            className="group flex items-center justify-between rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                <Download size={18} /> Export as PDF
              </div>
              <p className="mt-1 text-xs text-slate-500">Formatted report deck</p>
            </div>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 group-hover:bg-rose-200">PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="group flex items-center justify-between rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Download size={18} /> Export as Excel
              </div>
              <p className="mt-1 text-xs text-slate-500">Multi-sheet workbook</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 group-hover:bg-emerald-200">XLSX</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="group flex items-center justify-between rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
                <Download size={18} /> Export as CSV
              </div>
              <p className="mt-1 text-xs text-slate-500">Spreadsheet-friendly raw data</p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 group-hover:bg-sky-200">CSV</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
