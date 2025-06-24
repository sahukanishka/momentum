import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { getEmployeeById } from "@/api/endpoints/employee";
import { toast } from "sonner";
import { utils } from "@/utils/const";

interface Employee {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  organization_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  const fetchEmployeeDetails = () => {
    if (!employeeId) return;

    setIsLoading(true);
    utils.fetchData(
      getEmployeeById,
      (data) => {
        setEmployee(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch employee details:", err);
        toast.error(err?.message || "Failed to fetch employee details");
        setIsLoading(false);
      },
      employeeId
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Employee Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The employee you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/admin/employees")}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
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
            onClick={() => navigate("/admin/employees")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <User className="h-8 w-8" />
              Employee Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage employee information
            </p>
          </div>
        </div>
      </div>

      {/* Employee Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-foreground font-medium">
                {employee.name}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Email
              </span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{employee.email}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <Badge
                className={
                  employee.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {employee.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Email Verified
              </span>
              <div className="flex items-center gap-2">
                {employee.email_verified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-foreground">
                  {employee.email_verified ? "Verified" : "Not Verified"}
                </span>
              </div>
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
                {employee.organization_name}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Employee ID
              </span>
              <span className="text-foreground font-mono text-sm">
                {employee.id}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Organization ID
              </span>
              <span className="text-foreground font-mono text-sm">
                {employee.organization_id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Created At
              </span>
              <span className="text-foreground text-sm">
                {formatDate(employee.created_at)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Last Updated
              </span>
              <span className="text-foreground text-sm">
                {formatDate(employee.updated_at)}
              </span>
            </div>
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
              onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                navigate(`/admin/employees/${employee.id}/time-tracking`)
              }
            >
              <Clock className="h-4 w-4 mr-2" />
              View Time Tracking
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                navigate(`/admin/employees/${employee.id}/screenshots`)
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Screenshots
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
