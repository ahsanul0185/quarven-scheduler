import Papa from 'papaparse'
import type { Assignment, Conflict, Employee, ScheduleResult } from '../types'
import { DAY_LABELS } from './constants'

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportScheduleCsv(assignments: Assignment[], employees: Employee[]): void {
  const employeeMap = new Map(employees.map((e) => [e.employee_id, e]))

  const rows = assignments.map((a) => ({
    assignment_id: a.assignment_id,
    employee_id: a.employee_id,
    employee_name: employeeMap.get(a.employee_id)?.employee_name || a.employee_id,
    day: a.day,
    shift_id: a.shift_id,
    start_time: a.start_time,
    end_time: a.end_time,
    duration_hours: a.duration_hours,
    break_minutes: a.break_minutes,
    task_id: a.task_id,
    task_name: a.task_name,
    floor: a.floor,
  }))

  const csv = Papa.unparse(rows)
  const date = new Date().toISOString().split('T')[0]
  triggerDownload(csv, `QUARVEN_schedule_v2_${date}.csv`, 'text/csv;charset=utf-8')
}

export function exportProblemsCsv(conflicts: Conflict[]): void {
  const rows = conflicts.map((c) => ({
    conflict_type: c.conflict_type,
    shift_id: c.shift_id,
    site: c.site,
    role: c.role,
    day: c.day,
    detail: c.detail,
  }))

  const csv = Papa.unparse(rows)
  const date = new Date().toISOString().split('T')[0]
  triggerDownload(csv, `QUARVEN_problems_v2_${date}.csv`, 'text/csv;charset=utf-8')
}

export function exportReportHtml(result: ScheduleResult, employees: Employee[]): void {
  const employeeMap = new Map(employees.map((e) => [e.employee_id, e]))
  const date = new Date().toISOString().split('T')[0]
  const generatedAt = new Date(result.generated_at).toLocaleString()

  // Group assignments by employee
  const byEmployee = new Map<string, Assignment[]>()
  for (const a of result.assignments) {
    const list = byEmployee.get(a.employee_id) || []
    list.push(a)
    byEmployee.set(a.employee_id, list)
  }

  const sortedEmployeeIds = Array.from(byEmployee.keys()).sort()

  const rows = sortedEmployeeIds
    .map((empId) => {
      const emp = employeeMap.get(empId)
      const empAssignments = byEmployee.get(empId)!
      return empAssignments
        .sort((a, b) => {
          const dayDiff = (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).indexOf(a.day) -
            (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).indexOf(b.day)
          if (dayDiff !== 0) return dayDiff
          return a.start_time.localeCompare(b.start_time)
        })
        .map(
          (a, index) => `
    <tr class="${index % 2 === 1 ? 'even' : 'odd'}">
      <td>${index === 0 ? (emp?.employee_name || empId) : ''}</td>
      <td class="capitalize">${DAY_LABELS[a.day]}</td>
      <td>${a.shift_id}</td>
      <td>${a.start_time}–${a.end_time}</td>
      <td>${a.duration_hours}h</td>
      <td>${a.break_minutes > 0 ? a.break_minutes + 'min' : '-'}</td>
      <td>${a.task_name}</td>
      <td>${a.floor}</td>
    </tr>
  `
        )
        .join('')
    })
    .join('')

  const conflictRows = result.conflicts
    .map(
      (c, index) => `
    <tr class="${index % 2 === 1 ? 'even' : 'odd'}">
      <td class="capitalize">${c.conflict_type.replace(/_/g, ' ')}</td>
      <td>${c.shift_id}</td>
      <td>${c.site}</td>
      <td class="capitalize">${c.role}</td>
      <td class="capitalize">${DAY_LABELS[c.day]}</td>
      <td>${c.detail}</td>
    </tr>
  `
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Roster Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #fff;
    }
    .header {
      background: #2C3E50;
      color: #FFFFFF;
      padding: 24px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .header h1 { margin: 0 0 8px; font-size: 28px; }
    .header p { margin: 0; opacity: 0.9; font-size: 14px; }
    .summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #F2F2F2;
      padding: 16px;
      border-radius: 6px;
      min-width: 140px;
      flex: 1;
    }
    .summary-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .summary-card .value { font-size: 22px; font-weight: bold; margin-top: 4px; }
    h2 { color: #2C3E50; font-size: 20px; margin: 24px 0 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 10px 12px; text-align: left; font-size: 13px; }
    thead th { background: #2C3E50; color: #FFFFFF; font-weight: 600; }
    tbody tr.odd { background: #FFFFFF; }
    tbody tr.even { background: #F2F2F2; }
    .print-button {
      display: inline-block;
      margin-bottom: 24px;
      padding: 10px 18px;
      background: #2C3E50;
      color: #FFFFFF;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      .print-button { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Weekly Roster Report</h1>
    <p>Generated by Quarven Scheduler • ${generatedAt}</p>
  </div>

  <button class="print-button" onclick="window.print()">Print / Save as PDF</button>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Shifts</div>
      <div class="value">${result.stats.total_shifts}</div>
    </div>
    <div class="summary-card">
      <div class="label">Staffed</div>
      <div class="value">${result.stats.staffed_shifts}</div>
    </div>
    <div class="summary-card">
      <div class="label">Understaffed</div>
      <div class="value">${result.stats.understaffed_shifts}</div>
    </div>
    <div class="summary-card">
      <div class="label">Coverage</div>
      <div class="value">${result.stats.coverage_percent}%</div>
    </div>
    <div class="summary-card">
      <div class="label">Conflicts</div>
      <div class="value">${result.stats.total_conflicts}</div>
    </div>
  </div>

  <h2>Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Day</th>
        <th>Shift</th>
        <th>Time</th>
        <th>Duration</th>
        <th>Break</th>
        <th>Task</th>
        <th>Floor</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="8" style="text-align:center">No assignments</td></tr>'}
    </tbody>
  </table>

  <h2>Problems</h2>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Shift</th>
        <th>Site</th>
        <th>Role</th>
        <th>Day</th>
        <th>Detail</th>
      </tr>
    </thead>
    <tbody>
      ${conflictRows || '<tr><td colspan="6" style="text-align:center">No problems</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Generated by Quarven Scheduler • ${date}
  </div>
</body>
</html>`

  triggerDownload(html, `QUARVEN_report_v2_${date}.html`, 'text/html;charset=utf-8')
}
