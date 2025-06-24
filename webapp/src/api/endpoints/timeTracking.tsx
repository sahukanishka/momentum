import { GET, POST, PUT, DELETE } from "../https";

interface ClockInData {
  project_id: string;
  task_id: string;
  notes: string;
}

export const clockInEmployee = (employeeId: string, data: ClockInData) =>
  POST({
    url: `/api/v1/time-tracking/clock-in/${employeeId}`,
    data,
  });

interface ClockOutData {
  notes: string;
}

export const clockOutEmployee = (employeeId: string, data: ClockOutData) =>
  POST({
    url: `/api/v1/time-tracking/clock-out/${employeeId}`,
    data,
  });

interface EmployeeLogsParams {
  start_date?: string;
  end_date?: string;
  project_id?: string;
  task_id?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  size?: number;
}

export const getEmployeeTimeLogs = (
  employeeId: string,
  params?: EmployeeLogsParams
) =>
  GET({
    url: `/api/v1/time-tracking/employee/${employeeId}/logs`,
    data: params,
  });

interface EmployeesSummaryParams {
  start_date?: string;
  end_date?: string;
  project_id?: string;
  task_id?: string;
  is_active?: boolean;
  page?: number;
  size?: number;
}

export const getAllEmployeesTimeSummary = (params?: EmployeesSummaryParams) =>
  GET({
    url: `/api/v1/time-tracking/employees/summary?${new URLSearchParams(
      params as Record<string, string>
    ).toString()}`,
    data: {},
  });

export const getCurrentSession = (employeeId: string) =>
  GET({
    url: `/api/v1/time-tracking/employee/${employeeId}/current-session`,
    data: {},
  });

interface BreakData {
  notes: string;
}

export const startBreak = (employeeId: string, data: BreakData) =>
  POST({
    url: `/api/v1/time-tracking/employee/${employeeId}/break/start`,
    data,
  });

interface EndBreakData {
  break_end: string;
}

export const endBreak = (employeeId: string, data: EndBreakData) =>
  POST({
    url: `/api/v1/time-tracking/employee/${employeeId}/break/end`,
    data,
  });

interface UpdateTimeEntryData {
  clock_in: string;
  clock_out: string;
  notes: string;
  break_start: string;
  break_end: string;
}

export const updateTimeEntry = (entryId: string, data: UpdateTimeEntryData) =>
  PUT({
    url: `/api/v1/time-tracking/entry/${entryId}`,
    data,
  });

export const deleteTimeEntry = (entryId: string) =>
  DELETE({
    url: `/api/v1/time-tracking/entry/${entryId}`,
    data: {},
  });

interface GenerateReportData {
  employee_ids: string[];
  start_date: string;
  end_date: string;
  project_id: string;
  task_id: string;
  report_type: string;
}

export const generateTimeReport = (data: GenerateReportData) =>
  POST({
    url: "/api/v1/time-tracking/report",
    data,
  });
