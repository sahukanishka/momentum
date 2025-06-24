import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Monitor,
  Search,
  Filter,
  Calendar,
  MapPin,
  Globe,
  Eye,
  Download,
  Shield,
  ShieldOff,
  Monitor as MonitorIcon,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getOrganizationScreenshots } from "@/api/endpoints/screenshot";
import { getOrganizationEmployees } from "@/api/endpoints/employee";
import { getOrganizationProjects } from "@/api/endpoints/project";
import { getOrganizationTasks } from "@/api/endpoints/task";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { format } from "date-fns";

interface Screenshot {
  id: string;
  employee_id: string;
  employee_name: string | null;
  employee_email: string | null;
  organization_id: string;
  organization_name: string | null;
  tracking_id: string;
  project_id: string;
  project_name: string | null;
  task_id: string;
  task_name: string | null;
  path: string;
  permission: boolean;
  os: string;
  geo_location: string;
  ip_address: string;
  app: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
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

export function ScreenshotPage() {
  const { state } = useAuth();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    employee_id: "all",
    project_id: "all",
    task_id: "all",
    permission: "all",
    app: "all",
    os: "all",
    search: "",
  });

  useEffect(() => {
    if (state.organizationId) {
      fetchScreenshots();
      fetchEmployees();
      fetchProjects();
      fetchTasks();
    }
  }, [state.organizationId]);

  const fetchScreenshots = () => {
    setIsLoading(true);

    const params: Record<string, string | number> = {
      page: 1,
      size: 50,
    };

    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.employee_id && filters.employee_id !== "all")
      params.employee_id = filters.employee_id;
    if (filters.project_id && filters.project_id !== "all")
      params.project_id = filters.project_id;
    if (filters.task_id && filters.task_id !== "all")
      params.task_id = filters.task_id;
    if (filters.permission && filters.permission !== "all")
      params.permission = filters.permission === "true";
    if (filters.app && filters.app !== "all") params.app = filters.app;
    if (filters.os && filters.os !== "all") params.os = filters.os;

    utils.fetchData(
      getOrganizationScreenshots,
      (data) => {
        console.log(data);
        const transformedScreenshots =
          data.screenshots?.map((screenshot: any) => ({
            id: screenshot.id,
            employee_id: screenshot.employee_id,
            employee_name: screenshot.employee_name,
            employee_email: screenshot.employee_email,
            organization_id: screenshot.organization_id,
            organization_name: screenshot.organization_name,
            tracking_id: screenshot.tracking_id,
            project_id: screenshot.project_id,
            project_name: screenshot.project_name,
            task_id: screenshot.task_id,
            task_name: screenshot.task_name,
            path: screenshot.path,
            permission: screenshot.permission,
            os: screenshot.os,
            geo_location: screenshot.geo_location,
            ip_address: screenshot.ip_address,
            app: screenshot.app,
            created_at: screenshot.created_at,
            updated_at: screenshot.updated_at,
          })) || [];

        setScreenshots(transformedScreenshots);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch screenshots:", err);
        toast.error(err?.message || "Failed to fetch screenshots");
        setIsLoading(false);
      },
      state.organizationId,
      params
    );
  };

  const fetchEmployees = () => {
    utils.fetchData(
      getOrganizationEmployees,
      (data) => {
        const transformedEmployees =
          data.employees?.map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
          })) || [];
        setEmployees(transformedEmployees);
      },
      (err) => {
        console.error("Failed to fetch employees:", err);
      },
      state.organizationId,
      1,
      100
    );
  };

  const fetchProjects = () => {
    utils.fetchData(
      getOrganizationProjects,
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
      getOrganizationTasks,
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
    fetchScreenshots();
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      employee_id: "all",
      project_id: "all",
      task_id: "all",
      permission: "all",
      app: "all",
      os: "all",
      search: "",
    });
    setTimeout(() => fetchScreenshots(), 100);
  };

  const filteredScreenshots = screenshots.filter((screenshot) => {
    const matchesSearch =
      (screenshot.employee_name &&
        screenshot.employee_name
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (screenshot.employee_email &&
        screenshot.employee_email
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (screenshot.project_name &&
        screenshot.project_name
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (screenshot.task_name &&
        screenshot.task_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "permitted")
      return matchesSearch && screenshot.permission;
    if (activeTab === "not-permitted")
      return matchesSearch && !screenshot.permission;

    return matchesSearch;
  });

  const getPermissionBadge = (permission: boolean) => {
    if (permission) {
      return (
        <Badge variant="default" className="bg-green-500">
          Permitted
        </Badge>
      );
    }
    return <Badge variant="destructive">Not Permitted</Badge>;
  };

  const getOSIcon = (os: string) => {
    if (os.toLowerCase().includes("mac"))
      return <MonitorIcon className="h-4 w-4" />;
    if (os.toLowerCase().includes("windows"))
      return <MonitorIcon className="h-4 w-4" />;
    if (
      os.toLowerCase().includes("android") ||
      os.toLowerCase().includes("ios")
    )
      return <Smartphone className="h-4 w-4" />;
    return <MonitorIcon className="h-4 w-4" />;
  };

  const getImageUrl = (path: string) => {
    // This would typically be your backend URL + path
    // For now, using a placeholder
    return `https://via.placeholder.com/300x200/666666/FFFFFF?text=Screenshot`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Monitor className="h-8 w-8" />
              Screenshots
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor employee activity through captured screenshots
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading screenshots...</p>
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
            <Monitor className="h-8 w-8" />
            Screenshots
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor employee activity through captured screenshots
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium">Employee</label>
              <Select
                value={filters.employee_id}
                onValueChange={(value) =>
                  handleFilterChange("employee_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium">Permission</label>
              <Select
                value={filters.permission}
                onValueChange={(value) =>
                  handleFilterChange("permission", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Permitted</SelectItem>
                  <SelectItem value="false">Not Permitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application</label>
              <Select
                value={filters.app}
                onValueChange={(value) => handleFilterChange("app", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Apps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="Google Chrome">Google Chrome</SelectItem>
                  <SelectItem value="Mozilla Firefox">
                    Mozilla Firefox
                  </SelectItem>
                  <SelectItem value="Safari">Safari</SelectItem>
                  <SelectItem value="Microsoft Edge">Microsoft Edge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Operating System</label>
              <Select
                value={filters.os}
                onValueChange={(value) => handleFilterChange("os", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operating Systems</SelectItem>
                  <SelectItem value="macOS">macOS</SelectItem>
                  <SelectItem value="Windows">Windows</SelectItem>
                  <SelectItem value="Linux">Linux</SelectItem>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
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
      </Card> */}

      {/* Screenshots Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Captured Screenshots</span>
            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="permitted">Permitted</TabsTrigger>
                  <TabsTrigger value="not-permitted">Not Permitted</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab} className="mt-6">
              {screenshots.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filters.search ||
                    filters.start_date ||
                    filters.end_date ||
                    filters.employee_id !== "all" ||
                    filters.project_id !== "all" ||
                    filters.task_id !== "all" ||
                    filters.permission !== "all" ||
                    filters.app !== "all" ||
                    filters.os !== "all"
                      ? "No screenshots found matching your filters"
                      : "No screenshots available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {screenshots.map((screenshot) => (
                    <Card key={screenshot.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={screenshot.path}
                          alt="Screenshot"
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage(screenshot)}
                        />
                        <div className="absolute top-2 right-2">
                          {getPermissionBadge(screenshot.permission)}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-sm">
                              {screenshot.employee_id || "Unknown Employee"}
                            </h3>
                            {/* <p className="text-xs text-muted-foreground">
                              {screenshot.employee_email || "No email"}
                            </p> */}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(screenshot.created_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {screenshot.geo_location || "Unknown location"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{screenshot.ip_address}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getOSIcon(screenshot.os)}
                            <span>{screenshot.os}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-muted-foreground">
                              {screenshot.project_name && (
                                <Link
                                  to={`/admin/projects/${screenshot.project_id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {screenshot.project_name}
                                </Link>
                              )}
                              {screenshot.task_name && (
                                <span className="ml-1">
                                  •{" "}
                                  <Link
                                    to={`/admin/tasks/${screenshot.task_id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {screenshot.task_name}
                                  </Link>
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedImage(screenshot)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Full Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screenshot Details</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.path}
                  alt="Screenshot"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Employee Information</h4>
                  <p>Name: {selectedImage.employee_name || "Unknown"}</p>
                  <p>Email: {selectedImage.employee_email || "Unknown"}</p>
                  <p>ID: {selectedImage.employee_id}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">System Information</h4>
                  <p>OS: {selectedImage.os}</p>
                  <p>App: {selectedImage.app}</p>
                  <p>IP: {selectedImage.ip_address}</p>
                  <p>Location: {selectedImage.geo_location || "Unknown"}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Project & Task</h4>
                  <p>Project: {selectedImage.project_name || "Unknown"}</p>
                  <p>Task: {selectedImage.task_name || "Unknown"}</p>
                  <p>Tracking ID: {selectedImage.tracking_id}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Timestamps</h4>
                  <p>
                    Created:{" "}
                    {format(
                      new Date(selectedImage.created_at),
                      "MMM dd, yyyy HH:mm:ss"
                    )}
                  </p>
                  <p>
                    Updated:{" "}
                    {format(
                      new Date(selectedImage.updated_at),
                      "MMM dd, yyyy HH:mm:ss"
                    )}
                  </p>
                  <p>
                    Permission:{" "}
                    {selectedImage.permission ? "Granted" : "Not Granted"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
