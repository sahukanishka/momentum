import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  Code,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ProjectListProps {
  projects: Project[];
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function ProjectList({ projects, onProjectUpdate }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = false;
      if (activeTab === "active") {
        matchesStatus = project.is_active && !project.is_archived;
      } else if (activeTab === "archived") {
        matchesStatus = project.is_archived;
      } else if (activeTab === "inactive") {
        matchesStatus = !project.is_active && !project.is_archived;
      }

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, activeTab]);

  const getStatusCount = (status: string) => {
    if (status === "active") {
      return projects.filter(
        (project) => project.is_active && !project.is_archived
      ).length;
    } else if (status === "archived") {
      return projects.filter((project) => project.is_archived).length;
    } else if (status === "inactive") {
      return projects.filter(
        (project) => !project.is_active && !project.is_archived
      ).length;
    }
    return 0;
  };

  const handleStatusChange = (
    projectId: string,
    newStatus: "active" | "archived" | "inactive"
  ) => {
    const updates: Partial<Project> = {};
    if (newStatus === "active") {
      updates.is_active = true;
      updates.is_archived = false;
    } else if (newStatus === "archived") {
      updates.is_archived = true;
    } else if (newStatus === "inactive") {
      updates.is_active = false;
      updates.is_archived = false;
    }
    onProjectUpdate(projectId, updates);
  };

  const handleProjectClick = (projectId: string) => {
    // Navigate to project detail page
    window.location.href = `/admin/projects/${projectId}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const ProjectTable = ({ projects }: { projects: Project[] }) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/80"
                onClick={() => handleProjectClick(project.id)}
              >
                <TableCell>
                  <div className="font-medium">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-muted-foreground">
                      {project.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{project.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.employees.length} members</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      project.is_archived
                        ? statusColors.archived
                        : project.is_active
                        ? statusColors.active
                        : statusColors.inactive
                    }
                  >
                    {project.is_archived
                      ? "Archived"
                      : project.is_active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!project.is_active && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, "active");
                          }}
                        >
                          Activate
                        </DropdownMenuItem>
                      )}
                      {!project.is_archived && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, "archived");
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}
                      {project.is_archived && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, "active");
                          }}
                        >
                          Unarchive
                        </DropdownMenuItem>
                      )}
                      {project.is_active && !project.is_archived && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, "inactive");
                          }}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs for Project Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            <Badge variant="secondary" className="ml-1">
              {getStatusCount("active")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            Archived
            <Badge variant="secondary" className="ml-1">
              {getStatusCount("archived")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            Inactive
            <Badge variant="secondary" className="ml-1">
              {getStatusCount("inactive")}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <ProjectTable projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <ProjectTable projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <ProjectTable projects={filteredProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
