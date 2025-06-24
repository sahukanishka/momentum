import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckSquare,
  Users,
  Calendar,
  Clock,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getTaskById,
  deleteTask,
  removeEmployeesFromTask,
} from "@/api/endpoints/task";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { format } from "date-fns";
import { AssignTaskForm } from "@/components/AssignTaskForm";

interface Task {
  id: string;
  name: string;
  description: string | null;
  code: string;
  max_hours_per_week: number | null;
  max_hours_per_day: number | null;
  start_date: string | null;
  end_date: string | null;
  is_default: boolean;
  project_id: string;
  project_name: string | null;
  organization_id: string | null;
  organization_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employees: Array<{
    id: string;
    name: string;
    email: string;
    assigned_at: string;
    is_active: boolean;
  }>;
}

export function TaskDetailsPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = () => {
    setIsLoading(true);
    setError(null);

    utils.fetchData(
      getTaskById,
      (data) => {
        const taskData: Task = {
          id: data.id,
          name: data.name,
          description: data.description,
          code: data.code,
          max_hours_per_week: data.max_hours_per_week,
          max_hours_per_day: data.max_hours_per_day,
          start_date: data.start_date,
          end_date: data.end_date,
          is_default: data.is_default,
          project_id: data.project_id,
          project_name: data.project_name,
          organization_id: data.organization_id,
          organization_name: data.organization_name,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
          employees: data.employees || [],
        };

        setTask(taskData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch task details:", err);
        setError(err?.message || "Failed to fetch task details");
        setIsLoading(false);
      },
      taskId!
    );
  };

  const handleDelete = async () => {
    if (!task) return;

    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    utils.fetchData(
      deleteTask,
      () => {
        toast.success("Task deleted successfully");
        // Redirect to tasks page
        window.location.href = "/admin/tasks";
      },
      (err) => {
        console.error("Failed to delete task:", err);
        toast.error(err?.message || "Failed to delete task");
        setIsDeleting(false);
      },
      task.id
    );
  };

  const handleTaskUpdate = (updates: Partial<Task>) => {
    setTask((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const getStatusBadge = (task: Task) => {
    if (task.is_default) {
      return <Badge variant="secondary">Default Task</Badge>;
    }
    if (!task.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Task</h3>
            <p className="text-muted-foreground">{error || "Task not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CheckSquare className="h-8 w-8" />
              {task.name}
            </h1>
            <p className="text-muted-foreground mt-1">Task Code: {task.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(task)}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {task.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Project</h3>
                  <p className="text-muted-foreground">
                    {task.project_name || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Organization</h3>
                  <p className="text-muted-foreground">
                    {task.organization_name || "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Max Hours per Week</h3>
                  <p className="text-muted-foreground">
                    {task.max_hours_per_week || "No limit"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Max Hours per Day</h3>
                  <p className="text-muted-foreground">
                    {task.max_hours_per_day || "No limit"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Start Date</h3>
                  <p className="text-muted-foreground">
                    {task.start_date
                      ? format(new Date(task.start_date), "MMM dd, yyyy")
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">End Date</h3>
                  <p className="text-muted-foreground">
                    {task.end_date
                      ? format(new Date(task.end_date), "MMM dd, yyyy")
                      : "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Employees ({task.employees.length})
                </span>
                <AssignTaskForm
                  taskId={task.id}
                  onEmployeesAssigned={(newEmployees) => {
                    handleTaskUpdate({
                      employees: [...task.employees, ...newEmployees],
                    });
                  }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No employees assigned to this task
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {task.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assigned:{" "}
                          {format(
                            new Date(employee.assigned_at),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!employee.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Handle remove employee
                            utils.fetchData(
                              removeEmployeesFromTask,
                              () => {
                                handleTaskUpdate({
                                  employees: task.employees.filter(
                                    (emp) => emp.id !== employee.id
                                  ),
                                });
                                toast.success("Employee removed from task");
                              },
                              (err) => {
                                toast.error(
                                  err?.message || "Failed to remove employee"
                                );
                              },
                              task.id,
                              { employee_ids: [employee.id] }
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(task.created_at),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(task.updated_at),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="h-4 w-4 mr-2" />
                Archive Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Assignments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
