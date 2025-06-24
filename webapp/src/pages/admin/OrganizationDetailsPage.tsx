import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Globe,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  FolderOpen,
  CheckSquare,
  Monitor,
} from "lucide-react";
import {
  getOrganizationById,
  deleteOrganization,
} from "@/api/endpoints/organization";
import { toast } from "sonner";
import { utils } from "@/utils/const";
import { format } from "date-fns";

interface Organization {
  id: string;
  name: string;
  description: string;
  domain: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export function OrganizationDetailsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails();
    }
  }, [organizationId]);

  const fetchOrganizationDetails = () => {
    setIsLoading(true);
    setError(null);

    utils.fetchData(
      getOrganizationById,
      (data) => {
        const orgData: Organization = {
          id: data.id,
          name: data.name,
          description: data.description,
          domain: data.domain,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          is_active: data.is_active,
        };

        setOrganization(orgData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch organization details:", err);
        setError(err?.message || "Failed to fetch organization details");
        setIsLoading(false);
      },
      organizationId!
    );
  };

  const handleDelete = async () => {
    if (!organization) return;

    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    utils.fetchData(
      deleteOrganization,
      () => {
        toast.success("Organization deleted successfully");
        // Redirect to organizations page
        window.location.href = "/admin/organizations";
      },
      (err) => {
        console.error("Failed to delete organization:", err);
        toast.error(err?.message || "Failed to delete organization");
        setIsDeleting(false);
      },
      organization.id
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      );
    }
    return <Badge variant="destructive">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/organizations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading organization details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/organizations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Organization
            </h3>
            <p className="text-muted-foreground">
              {error || "Organization not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/organizations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              {organization.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Organization ID: {organization.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(organization.is_active)}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Edit functionality coming soon");
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {organization.description || "No description provided"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Domain</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {organization.domain}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Created By</h3>
                  <p className="text-muted-foreground">
                    {organization.created_by}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/employees">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Employees</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/projects">
                    <FolderOpen className="h-6 w-6" />
                    <span className="text-sm">Projects</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/tasks">
                    <CheckSquare className="h-6 w-6" />
                    <span className="text-sm">Tasks</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/activity">
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm">Screenshots</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(organization.created_at),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(organization.updated_at),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                {getStatusBadge(organization.is_active)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Domain</span>
                <span className="text-sm font-mono">{organization.domain}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Created By</span>
                <span className="text-sm text-muted-foreground">
                  {organization.created_by.substring(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Domain Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
