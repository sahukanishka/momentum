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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Plus, Loader2, Search } from "lucide-react";
import { assignEmployeesToTask } from "@/api/endpoints/task";
import { getOrganizationEmployees } from "@/api/endpoints/employee";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface Employee {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface AssignTaskFormProps {
  taskId: string;
  onEmployeesAssigned: (
    employees: Array<{
      id: string;
      name: string;
      email: string;
      assigned_at: string;
      is_active: boolean;
    }>
  ) => void;
}

export function AssignTaskForm({
  taskId,
  onEmployeesAssigned,
}: AssignTaskFormProps) {
  const { state } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && state.organizationId) {
      fetchEmployees();
    }
  }, [open, state.organizationId]);

  const fetchEmployees = () => {
    utils.fetchData(
      getOrganizationEmployees,
      (data) => {
        const transformedEmployees =
          data.employees?.map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            is_active: emp.is_active,
          })) || [];
        setEmployees(transformedEmployees);
      },
      (err) => {
        console.error("Failed to fetch employees:", err);
        toast.error(err?.message || "Failed to fetch employees");
      },
      state.organizationId,
      1,
      100
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setIsLoading(true);

    utils.fetchData(
      assignEmployeesToTask,
      (data) => {
        // Transform the assigned employees data
        const assignedEmployees = selectedEmployees.map((empId) => {
          const employee = employees.find((emp) => emp.id === empId);
          return {
            id: empId,
            name: employee?.name || "",
            email: employee?.email || "",
            assigned_at: new Date().toISOString(),
            is_active: employee?.is_active || false,
          };
        });

        onEmployeesAssigned(assignedEmployees);
        toast.success(
          `${selectedEmployees.length} employee(s) assigned successfully`
        );
        setOpen(false);
        setSelectedEmployees([]);
      },
      (err) => {
        console.error("Failed to assign employees:", err);
        toast.error(err?.message || "Failed to assign employees");
      },
      taskId,
      { employee_ids: selectedEmployees }
    );

    setIsLoading(false);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assign Employees
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Employees to Task</DialogTitle>
          <DialogDescription>
            Select employees to assign to this task. You can search and select
            multiple employees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Employees</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Select Employees ({selectedEmployees.length} selected)
            </Label>
            <ScrollArea className="h-64 border rounded-md p-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "No employees found"
                      : "No employees available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                    >
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() =>
                          handleEmployeeToggle(employee.id)
                        }
                        disabled={!employee.is_active}
                      />
                      <Label
                        htmlFor={employee.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                          {!employee.is_active && (
                            <span className="text-xs text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
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
            <Button
              type="submit"
              disabled={isLoading || selectedEmployees.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${selectedEmployees.length} Employee${
                  selectedEmployees.length !== 1 ? "s" : ""
                }`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
