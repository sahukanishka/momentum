import { useState, useEffect } from "react";
import { EmployeeForm } from "../../components/AddEmployeeForm";
import { EmployeeList } from "../../components/EmployeeList";
import { Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getOrganizationEmployees } from "@/api/endpoints/employee";
import { toast } from "sonner";
import { utils } from "@/utils/const";

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

export function EmployeesPage() {
  const { state } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employees from API
  useEffect(() => {
    if (state.organizationId) {
      fetchEmployees();
    }
  }, [state.organizationId]);

  const fetchEmployees = () => {
    setIsLoading(true);
    utils.fetchData(
      getOrganizationEmployees,
      (data) => {
        // Transform API response to match our Employee interface
        const transformedEmployees =
          data.employees?.map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department || "General",
            status: emp.is_active ? "active" : "deactivated",
            joinDate: emp.created_at || new Date().toISOString(),
            phone: emp.phone,
            role: emp.role || "Employee",
          })) || [];

        setEmployees(transformedEmployees);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch employees:", err);
        toast.error(err?.message || "Failed to fetch employees");
        setIsLoading(false);
      },
      state.organizationId,
      1, // page
      50 // size
    );
  };

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const handleEmployeeUpdate = (
    employeeId: string,
    updates: Partial<Employee>
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, ...updates } : emp))
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8" />
              Employees
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and their access
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employees...</p>
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
            <Users className="h-8 w-8" />
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their access
          </p>
        </div>
        <EmployeeForm onEmployeeAdded={handleEmployeeAdded} />
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold text-foreground">
                {employees.length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter((emp) => emp.status === "active").length}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {employees.filter((emp) => emp.status === "pending").length}
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Deactivated</p>
              <p className="text-2xl font-bold text-red-600">
                {employees.filter((emp) => emp.status === "deactivated").length}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div> */}

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        onEmployeeUpdate={handleEmployeeUpdate}
      />
    </div>
  );
}
