import { useState, useEffect } from "react";
import { ProjectForm } from "../../components/AddProjectForm";
import { ProjectList } from "../../components/ProjectList";
import { FolderOpen } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getOrganizationProjects } from "@/api/endpoints/project";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface Project {
  id: string;
  name: string;
  description: string | null;
  code: string;
  max_hours_per_week: number | null;
  max_hours_per_day: number | null;
  start_date: string | null;
  end_date: string | null;
  organization_id: string;
  organization_name: string;
  is_active: boolean;
  is_archived: boolean;
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

export function ProjectsPage() {
  const { state } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    if (state.organizationId) {
      fetchProjects();
    }
  }, [state.organizationId]);

  const fetchProjects = () => {
    setIsLoading(true);
    utils.fetchData(
      getOrganizationProjects,
      (data) => {
        // Transform API response to match our Project interface
        const transformedProjects =
          data.projects?.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            code: project.code,
            max_hours_per_week: project.max_hours_per_week,
            max_hours_per_day: project.max_hours_per_day,
            start_date: project.start_date,
            end_date: project.end_date,
            organization_id: project.organization_id,
            organization_name: project.organization_name,
            is_active: project.is_active,
            is_archived: project.is_archived,
            created_at: project.created_at,
            updated_at: project.updated_at,
            employees: project.employees || [],
          })) || [];

        setProjects(transformedProjects);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch projects:", err);
        toast.error(err?.message || "Failed to fetch projects");
        setIsLoading(false);
      },
      state.organizationId,
      1, // page
      50 // size
    );
  };

  const handleProjectAdded = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const handleProjectUpdate = (
    projectId: string,
    updates: Partial<Project>
  ) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="h-8 w-8" />
              Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's projects and teams
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
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
            <FolderOpen className="h-8 w-8" />
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's projects and teams
          </p>
        </div>
        <ProjectForm onProjectAdded={handleProjectAdded} />
      </div>

      {/* Project List */}
      <ProjectList projects={projects} onProjectUpdate={handleProjectUpdate} />
    </div>
  );
}
