import { useState, useEffect } from "react";
import { TaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import { CheckSquare } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getOrganizationTasks } from "@/api/endpoints/task";
import { toast } from "sonner";
import { utils } from "@/utils/const";

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

export function TasksPage() {
  const { state } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    if (state.organizationId) {
      fetchTasks();
    }
  }, [state.organizationId]);

  const fetchTasks = () => {
    setIsLoading(true);
    utils.fetchData(
      getOrganizationTasks,
      (data) => {
        // Transform API response to match our Task interface
        const transformedTasks =
          data.tasks?.map((task: any) => ({
            id: task.id,
            name: task.name,
            description: task.description,
            code: task.code,
            max_hours_per_week: task.max_hours_per_week,
            max_hours_per_day: task.max_hours_per_day,
            start_date: task.start_date,
            end_date: task.end_date,
            is_default: task.is_default,
            project_id: task.project_id,
            project_name: task.project_name,
            organization_id: task.organization_id,
            organization_name: task.organization_name,
            is_active: task.is_active,
            created_at: task.created_at,
            updated_at: task.updated_at,
            employees: task.employees || [],
          })) || [];

        setTasks(transformedTasks);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch tasks:", err);
        toast.error(err?.message || "Failed to fetch tasks");
        setIsLoading(false);
      },
      state.organizationId,
      1, // page
      50 // size
    );
  };

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CheckSquare className="h-8 w-8" />
              Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's tasks and assignments
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
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
            <CheckSquare className="h-8 w-8" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's tasks and assignments
          </p>
        </div>
        <TaskForm onTaskAdded={handleTaskAdded} />
      </div>

      {/* Task List */}
      <TaskList tasks={tasks} onTaskUpdate={handleTaskUpdate} />
    </div>
  );
}
