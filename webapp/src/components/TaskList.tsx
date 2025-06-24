import { useState } from "react";
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
import { Eye, Search, Users, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

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

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && task.is_active;
    if (activeTab === "default") return matchesSearch && task.is_default;
    if (activeTab === "assigned")
      return matchesSearch && task.employees.length > 0;
    if (activeTab === "unassigned")
      return matchesSearch && task.employees.length === 0;

    return matchesSearch;
  });

  const getStatusBadge = (task: Task) => {
    if (task.is_default) {
      return <Badge variant="secondary">Default</Badge>;
    }
    if (!task.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getEmployeeCount = (task: Task) => {
    const activeEmployees = task.employees.filter((emp) => emp.is_active);
    return activeEmployees.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Task Overview</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? "No tasks found matching your search"
                              : "No tasks available"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.name}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {task.code}
                          </code>
                        </TableCell>
                        <TableCell>{task.project_name || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(task)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{getEmployeeCount(task)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(
                                new Date(task.created_at),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/tasks/${task.id}`}>
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
  );
}
