import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { getOrganizationEmployees } from "@/api/endpoints/employee";
import {
  assignEmployeesToProject,
  removeEmployeesFromProject,
} from "@/api/endpoints/project";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { UserPlus, Search, Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface AssignProjectFormProps {
  projectId: string;
  projectName: string;
  currentEmployees: Array<{ id: string; name: string; email: string }>;
  onEmployeesUpdated: () => void;
}

export function AssignProjectForm({
  projectId,
  projectName,
  currentEmployees,
  onEmployeesUpdated,
}: AssignProjectFormProps) {
  const { state } = useAuth();
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all employees when dialog opens
  useEffect(() => {
    if (open && state.organizationId) {
      fetchEmployees();
    }
  }, [open, state.organizationId]);

  const fetchEmployees = () => {
    setIsLoading(true);
    utils.fetchData(
      getOrganizationEmployees,
      (data) => {
        const allEmployees =
          data.employees?.map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            is_active: emp.is_active,
          })) || [];

        // Filter out employees already assigned to this project
        const availableEmployees = allEmployees.filter(
          (emp: Employee) =>
            !currentEmployees.some((current) => current.id === emp.id)
        );

        setEmployees(availableEmployees);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch employees:", err);
        toast.error(err?.message || "Failed to fetch employees");
        setIsLoading(false);
      },
      state.organizationId,
      1, // page
      100 // size to get all employees
    );
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to assign");
      return;
    }

    setIsSubmitting(true);

    try {
      utils.postData(
        assignEmployeesToProject,
        (data) => {
          toast.success(
            `${selectedEmployees.length} employee(s) assigned to project successfully!`
          );
          setSelectedEmployees([]);
          setOpen(false);
          onEmployeesUpdated(); // Refresh the project details
        },
        (err) => {
          console.error("Failed to assign employees:", err);
          toast.error(err?.message || "Failed to assign employees to project");
        },
        projectId,
        {
          employee_ids: selectedEmployees,
        }
      );
    } catch (error) {
      console.error("Assign employees error:", error);
      toast.error("Failed to assign employees to project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEmployees = filteredEmployees.filter((emp) => emp.is_active);
  const inactiveEmployees = filteredEmployees.filter((emp) => !emp.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Employees to {projectName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Employees</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Employee List */}
          <div className="space-y-4">
            <Label>Select Employees to Assign</Label>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No employees found matching your search"
                    : "No available employees to assign"}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border border-border rounded-md p-4">
                <div className="space-y-4">
                  {/* Active Employees */}
                  {activeEmployees.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Active Employees
                      </h4>
                      <div className="space-y-2">
                        {activeEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                          >
                            <Checkbox
                              id={employee.id}
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={() =>
                                handleEmployeeToggle(employee.id)
                              }
                            />
                            <Label
                              htmlFor={employee.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inactive Employees */}
                  {inactiveEmployees.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Inactive Employees
                      </h4>
                      <div className="space-y-2">
                        {inactiveEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 opacity-60"
                          >
                            <Checkbox
                              id={employee.id}
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={() =>
                                handleEmployeeToggle(employee.id)
                              }
                              disabled
                            />
                            <Label
                              htmlFor={employee.id}
                              className="flex-1 cursor-not-allowed"
                            >
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Selected Count */}
          {selectedEmployees.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedEmployees.length} employee(s) selected
            </div>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || selectedEmployees.length === 0}
              className="btn-primary"
            >
              {isSubmitting
                ? "Assigning..."
                : `Assign ${selectedEmployees.length} Employee(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
