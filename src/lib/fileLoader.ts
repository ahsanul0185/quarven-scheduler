import type { Employee, Shift, Task, SchedulerConfig } from '../types'
import { parseEmployeesCsv, parseShiftsCsv, parseTasksCsv, detectAndParseConfig } from './parser'

export interface LoadedFiles {
  employees: Employee[]
  shifts: Shift[]
  tasks: Task[]
  config: SchedulerConfig
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

export async function fetchSampleFile(path: string): Promise<string> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load sample file: ${path}`)
  }
  return response.text()
}

export async function loadFromFiles(inputs: {
  employees?: File
  shifts?: File
  tasks?: File
  config?: File
}): Promise<LoadedFiles> {
  if (!inputs.employees || !inputs.shifts || !inputs.tasks) {
    throw new Error('Employees, shifts, and tasks files are required')
  }

  const [employeesText, shiftsText, tasksText] = await Promise.all([
    readFileAsText(inputs.employees),
    readFileAsText(inputs.shifts),
    readFileAsText(inputs.tasks),
  ])

  const configText = inputs.config ? await readFileAsText(inputs.config) : '{}'

  return {
    employees: parseEmployeesCsv(employeesText),
    shifts: parseShiftsCsv(shiftsText),
    tasks: parseTasksCsv(tasksText),
    config: detectAndParseConfig(configText),
  }
}

export async function loadSampleFiles(): Promise<LoadedFiles> {
  const [employeesText, shiftsText, tasksText, configText] = await Promise.all([
    fetchSampleFile('/sample/employees.csv'),
    fetchSampleFile('/sample/shifts.csv'),
    fetchSampleFile('/sample/tasks.csv'),
    fetchSampleFile('/sample/config.json'),
  ])

  return {
    employees: parseEmployeesCsv(employeesText),
    shifts: parseShiftsCsv(shiftsText),
    tasks: parseTasksCsv(tasksText),
    config: detectAndParseConfig(configText),
  }
}
