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
import { Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "active" | "pending" | "deactivated";
  joinDate: string;
  phone?: string;
  role?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  onEmployeeUpdate: (employeeId: string, updates: Partial<Employee>) => void;
}

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Design",
  "Product",
];

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  deactivated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function EmployeeList({
  employees,
  onEmployeeUpdate,
}: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;
      const matchesStatus = employee.status === activeTab;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, activeTab]);

  const getStatusCount = (status: string) => {
    return employees.filter((emp) => emp.status === status).length;
  };

  const handleStatusChange = (
    employeeId: string,
    newStatus: "active" | "pending" | "deactivated"
  ) => {
    onEmployeeUpdate(employeeId, { status: newStatus });
  };

  const handleEmployeeClick = (employeeId: string) => {
    // Navigate to employee detail page
    window.location.href = `/admin/employees/${employeeId}`;
  };

  const EmployeeTable = ({ employees }: { employees: Employee[] }) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="cursor-pointer hover:bg-muted/80"
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <TableCell>
                  <div className="font-medium">{employee.name}</div>
                  {employee.role && (
                    <div className="text-sm text-muted-foreground">
                      {employee.role}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {employee.phone}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  {new Date(employee.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[employee.status]}>
                    {employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1)}
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
                      {employee.status !== "active" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(employee.id, "active");
                          }}
                        >
                          Activate
                        </DropdownMenuItem>
                      )}
                      {employee.status !== "deactivated" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(employee.id, "deactivated");
                          }}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      {employee.status !== "pending" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(employee.id, "pending");
                          }}
                        >
                          Set Pending
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for Employee Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="relative">
            Active
            <Badge variant="secondary" className="ml-2 text-xs">
              {getStatusCount("active")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            <Badge variant="secondary" className="ml-2 text-xs">
              {getStatusCount("pending")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="deactivated" className="relative">
            Deactivated
            <Badge variant="secondary" className="ml-2 text-xs">
              {getStatusCount("deactivated")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="relative">
            All
            <Badge variant="secondary" className="ml-2 text-xs">
              {employees.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <EmployeeTable employees={filteredEmployees} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <EmployeeTable employees={filteredEmployees} />
        </TabsContent>

        <TabsContent value="deactivated" className="mt-6">
          <EmployeeTable employees={filteredEmployees} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <EmployeeTable
            employees={employees.filter((emp) => {
              const matchesSearch =
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesDepartment =
                departmentFilter === "all" ||
                emp.department === departmentFilter;
              return matchesSearch && matchesDepartment;
            })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
