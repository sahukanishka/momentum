import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createTask } from "@/api/endpoints/task";
import { getOrganizationProjects } from "@/api/endpoints/project";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface Project {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

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

interface TaskFormProps {
  onTaskAdded: (task: Task) => void;
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const { state } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    project_id: "",
    start_date: "",
    end_date: "",
  });

  // Fetch projects when dialog opens
  useEffect(() => {
    if (open && state.organizationId) {
      fetchProjects();
    }
  }, [open, state.organizationId]);

  const fetchProjects = () => {
    utils.fetchData(
      getOrganizationProjects,
      (data) => {
        const transformedProjects =
          data.projects?.map((project: any) => ({
            id: project.id,
            name: project.name,
            code: project.code,
            is_active: project.is_active,
          })) || [];
        setProjects(transformedProjects);
      },
      (err) => {
        console.error("Failed to fetch projects:", err);
        toast.error(err?.message || "Failed to fetch projects");
      },
      state.organizationId,
      1, // page
      100 // size
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.code.trim() ||
      !formData.project_id
    ) {
      toast.error("Name, code, and project are required");
      return;
    }

    setIsLoading(true);

    const taskData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      code: formData.code.trim(),
      project_id: formData.project_id,
      max_hours_per_week: null,
      max_hours_per_day: null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    utils.fetchData(
      createTask,
      (data) => {
        const newTask: Task = {
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

        onTaskAdded(newTask);
        toast.success("Task created successfully");
        setOpen(false);
        resetForm();
      },
      (err) => {
        console.error("Failed to create task:", err);
        toast.error(err?.message || "Failed to create task");
      },
      taskData
    );

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      project_id: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, project_id: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your organization. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter task name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Task Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., TASK-001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No projects available. Please create a project first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
