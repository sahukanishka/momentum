import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { createProject } from "@/api/endpoints/project";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { FolderPlus } from "lucide-react";

interface ProjectFormProps {
  onProjectAdded: (project: any) => void;
}

export function ProjectForm({ onProjectAdded }: ProjectFormProps) {
  const { state } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    max_hours_per_week: "",
    max_hours_per_day: "",
    start_date: "",
    end_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Please fill in at least name and code fields");
      return;
    }

    if (!state.organizationId) {
      toast.error("Organization not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      utils.postData(
        createProject,
        (data) => {
          // Transform API response to match our Project interface
          const newProject = {
            id: data.id,
            name: data.name,
            description: data.description,
            code: data.code,
            max_hours_per_week: data.max_hours_per_week,
            max_hours_per_day: data.max_hours_per_day,
            start_date: data.start_date,
            end_date: data.end_date,
            organization_id: data.organization_id,
            organization_name: data.organization_name,
            is_active: data.is_active,
            is_archived: data.is_archived,
            created_at: data.created_at,
            updated_at: data.updated_at,
            employees: data.employees || [],
          };

          onProjectAdded(newProject);

          toast.success(`Project "${formData.name}" created successfully!`);

          // Reset form
          setFormData({
            name: "",
            description: "",
            code: "",
            max_hours_per_week: "",
            max_hours_per_day: "",
            start_date: "",
            end_date: "",
          });
          setOpen(false);
        },
        (err) => {
          console.error("Failed to create project:", err);
          toast.error(
            err?.message || "Failed to create project. Please try again."
          );
        },
        {
          name: formData.name,
          description: formData.description || null,
          code: formData.code,
          organization_id: state.organizationId,
          max_hours_per_week: formData.max_hours_per_week
            ? parseInt(formData.max_hours_per_week)
            : null,
          max_hours_per_day: formData.max_hours_per_day
            ? parseInt(formData.max_hours_per_day)
            : null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }
      );
    } catch (error) {
      console.error("Create project error:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Project Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Enter project code (e.g., PRJ-001)"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_hours_per_week">Max Hours/Week</Label>
              <Input
                id="max_hours_per_week"
                type="number"
                value={formData.max_hours_per_week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_hours_per_week: e.target.value,
                  })
                }
                placeholder="40"
                min="1"
                max="168"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_hours_per_day">Max Hours/Day</Label>
              <Input
                id="max_hours_per_day"
                type="number"
                value={formData.max_hours_per_day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_hours_per_day: e.target.value,
                  })
                }
                placeholder="8"
                min="1"
                max="24"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
