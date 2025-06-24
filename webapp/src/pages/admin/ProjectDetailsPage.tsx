import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  Code,
  Building,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Archive,
  ArchiveRestore,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import {
  getProjectById,
  archiveProject,
  unarchiveProject,
  removeEmployeesFromProject,
} from "@/api/endpoints/project";
import { AssignProjectForm } from "@/components/AssignProjectForm";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface ProjectEmployee {
  id: string;
  name: string;
  email: string;
  assigned_at: string;
  is_active: boolean;
}

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
  employees: ProjectEmployee[];
}

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRemovingEmployee, setIsRemovingEmployee] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = () => {
    if (!projectId) return;

    setIsLoading(true);
    utils.fetchData(
      getProjectById,
      (data) => {
        setProject(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch project details:", err);
        toast.error(err?.message || "Failed to fetch project details");
        setIsLoading(false);
      },
      projectId
    );
  };

  const handleArchiveToggle = async () => {
    if (!project) return;

    setIsUpdatingStatus(true);
    try {
      const apiCall = project.is_archived ? unarchiveProject : archiveProject;
      utils.postData(
        apiCall,
        (data) => {
          setProject((prev) =>
            prev ? { ...prev, is_archived: !prev.is_archived } : null
          );
          toast.success(
            `Project ${
              project.is_archived ? "unarchived" : "archived"
            } successfully!`
          );
        },
        (err) => {
          console.error("Failed to update project status:", err);
          toast.error(err?.message || "Failed to update project status");
        },
        project.id
      );
    } catch (error) {
      console.error("Update project status error:", error);
      toast.error("Failed to update project status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRemoveEmployee = async (
    employeeId: string,
    employeeName: string
  ) => {
    if (!project) return;

    setIsRemovingEmployee(employeeId);
    try {
      utils.postData(
        removeEmployeesFromProject,
        (data) => {
          setProject((prev) =>
            prev
              ? {
                  ...prev,
                  employees: prev.employees.filter(
                    (emp) => emp.id !== employeeId
                  ),
                }
              : null
          );
          toast.success(`${employeeName} removed from project successfully!`);
        },
        (err) => {
          console.error("Failed to remove employee:", err);
          toast.error(err?.message || "Failed to remove employee from project");
        },
        project.id,
        {
          employee_ids: [employeeId],
        }
      );
    } catch (error) {
      console.error("Remove employee error:", error);
      toast.error("Failed to remove employee from project");
    } finally {
      setIsRemovingEmployee(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return "Not set";
    return `${hours} hours`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Project Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/admin/projects")}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/projects")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="h-8 w-8" />
              Project Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage project information
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleArchiveToggle}
          disabled={isUpdatingStatus}
          className="flex items-center gap-2"
        >
          {isUpdatingStatus ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : project.is_archived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {project.is_archived ? "Unarchive" : "Archive"} Project
        </Button>
      </div>

      {/* Project Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-foreground font-medium">
                {project.name}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Code
              </span>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-mono">
                  {project.code}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Description
              </span>
              <span className="text-foreground">
                {project.description || "No description"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <Badge
                className={
                  project.is_archived
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    : project.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {project.is_archived
                  ? "Archived"
                  : project.is_active
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Organization
              </span>
              <span className="text-foreground font-medium">
                {project.organization_name}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Project ID
              </span>
              <span className="text-foreground font-mono text-sm">
                {project.id}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Organization ID
              </span>
              <span className="text-foreground font-mono text-sm">
                {project.organization_id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Max Hours/Week
              </span>
              <span className="text-foreground">
                {formatHours(project.max_hours_per_week)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Max Hours/Day
              </span>
              <span className="text-foreground">
                {formatHours(project.max_hours_per_day)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Start Date
              </span>
              <span className="text-foreground text-sm">
                {formatDate(project.start_date)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                End Date
              </span>
              <span className="text-foreground text-sm">
                {formatDate(project.end_date)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Created At
              </span>
              <span className="text-foreground text-sm">
                {formatDate(project.created_at)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Last Updated
              </span>
              <span className="text-foreground text-sm">
                {formatDate(project.updated_at)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({project.employees.length})
            </CardTitle>
            <AssignProjectForm
              projectId={project.id}
              projectName={project.name}
              currentEmployees={project.employees}
              onEmployeesUpdated={fetchProjectDetails}
            />
          </div>
        </CardHeader>
        <CardContent>
          {project.employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No team members assigned to this project
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {employee.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {employee.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(employee.assigned_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveEmployee(employee.id, employee.name)
                              }
                              disabled={isRemovingEmployee === employee.id}
                              className="text-red-600 focus:text-red-600"
                            >
                              {isRemovingEmployee === employee.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              ) : (
                                <UserMinus className="h-4 w-4 mr-2" />
                              )}
                              Remove from Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate(`/admin/projects/${project.id}/tasks`)}
          >
            <Clock className="h-4 w-4 mr-2" />
            View Tasks
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              navigate(`/admin/projects/${project.id}/time-tracking`)
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Time Tracking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
