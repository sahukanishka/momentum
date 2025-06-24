import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Search,
  Filter,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllEmployeesTimeSummary } from "@/api/endpoints/timeTracking";
import { getOrganizationProjects as getProjects } from "@/api/endpoints/project";
import { getOrganizationTasks as getTasks } from "@/api/endpoints/task";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { format } from "date-fns";

interface TimeLogEntry {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  total_entries: number;
  total_hours: number;
  total_minutes: number;
  date: string;
  clock_in_count: number;
  clock_out_count: number;
  active_sessions: number;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Task {
  id: string;
  name: string;
  code: string;
}

export function TimeTrackingPage() {
  const { state } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    project_id: "",
    task_id: "",
    search: "",
  });

  useEffect(() => {
    if (state.organizationId) {
      fetchTimeLogs();
      fetchProjects();
      fetchTasks();
    }
  }, [state.organizationId]);

  const fetchTimeLogs = () => {
    setIsLoading(true);

    const params: Record<string, string | number> = {
      page: 1,
      size: 50,
    };

    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.project_id && filters.project_id !== "all")
      params.project_id = filters.project_id;
    if (filters.task_id && filters.task_id !== "all")
      params.task_id = filters.task_id;

    utils.fetchData(
      getAllEmployeesTimeSummary,
      (data) => {
        const transformedLogs =
          data.employees?.map((log: any) => ({
            employee_id: log.employee_id,
            employee_name: log.employee_name,
            employee_email: log.employee_email,
            total_entries: log.total_entries,
            total_hours: log.total_hours,
            total_minutes: log.total_minutes,
            date: log.date,
            clock_in_count: log.clock_in_count,
            clock_out_count: log.clock_out_count,
            active_sessions: log.active_sessions,
          })) || [];

        setTimeLogs(transformedLogs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch time logs:", err);
        toast.error(err?.message || "Failed to fetch time logs");
        setIsLoading(false);
      },
      params
    );
  };

  const fetchProjects = () => {
    utils.fetchData(
      getProjects,
      (data) => {
        const transformedProjects =
          data.projects?.map((project: any) => ({
            id: project.id,
            name: project.name,
            code: project.code,
          })) || [];
        setProjects(transformedProjects);
      },
      (err) => {
        console.error("Failed to fetch projects:", err);
      },
      state.organizationId,
      1,
      100
    );
  };

  const fetchTasks = () => {
    utils.fetchData(
      getTasks,
      (data) => {
        const transformedTasks =
          data.tasks?.map((task: any) => ({
            id: task.id,
            name: task.name,
            code: task.code,
          })) || [];
        setTasks(transformedTasks);
      },
      (err) => {
        console.error("Failed to fetch tasks:", err);
      },
      state.organizationId,
      1,
      100
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchTimeLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      project_id: "",
      task_id: "",
      search: "",
    });
    // Fetch logs without filters
    setTimeout(() => fetchTimeLogs(), 100);
  };

  const filteredLogs = timeLogs.filter((log) => {
    const matchesSearch =
      log.employee_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.employee_email.toLowerCase().includes(filters.search.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && log.active_sessions > 0;
    if (activeTab === "completed")
      return matchesSearch && log.active_sessions === 0;

    return matchesSearch;
  });

  const getStatusBadge = (log: TimeLogEntry) => {
    if (log.active_sessions > 0) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      );
    }
    return <Badge variant="secondary">Completed</Badge>;
  };

  const formatDuration = (hours: number, minutes: number) => {
    const totalHours = hours + minutes / 60;
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Clock className="h-8 w-8" />
              Time Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor employee time logs and productivity
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading time logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Clock className="h-8 w-8" />
            Time Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor employee time logs and productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select
                value={filters.project_id}
                onValueChange={(value) =>
                  handleFilterChange("project_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Task</label>
              <Select
                value={filters.task_id}
                onValueChange={(value) => handleFilterChange("task_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Time Logs</span>
            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Clock In/Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Clock className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {filters.search ||
                              filters.start_date ||
                              filters.end_date ||
                              filters.project_id ||
                              filters.task_id
                                ? "No time logs found matching your filters"
                                : "No time logs available"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={`${log.employee_id}-${log.date}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.employee_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.employee_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(log.date), "MMM dd, yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatDuration(
                                  log.total_hours,
                                  log.total_minutes
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.total_entries}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>In: {log.clock_in_count}</div>
                              <div>Out: {log.clock_out_count}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/employees/${log.employee_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
