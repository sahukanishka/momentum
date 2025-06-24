import { useState, useEffect } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Plus,
  Calendar,
  Globe,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getUserOrganizations,
  createOrganization,
  deleteOrganization,
} from "@/api/endpoints/organization";
import { useAuth } from "@/context/auth-context";
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

interface CreateOrganizationForm {
  name: string;
  description: string;
  domain: string;
}

export function OrganizationPage() {
  const { state } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateOrganizationForm>({
    name: "",
    description: "",
    domain: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = () => {
    setIsLoading(true);

    utils.fetchData(
      getUserOrganizations,
      (data) => {
        const transformedOrgs =
          data.organizations?.map((org: any) => ({
            id: org.id,
            name: org.name,
            description: org.description,
            domain: org.domain,
            created_by: org.created_by,
            created_at: org.created_at,
            updated_at: org.updated_at,
            is_active: org.is_active,
          })) || [];

        setOrganizations(transformedOrgs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch organizations:", err);
        toast.error(err?.message || "Failed to fetch organizations");
        setIsLoading(false);
      },
      1, // page
      50 // size
    );
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim() || !createForm.domain.trim()) {
      toast.error("Name and domain are required");
      return;
    }

    setIsCreating(true);

    utils.fetchData(
      createOrganization,
      (data) => {
        const newOrg: Organization = {
          id: data.id,
          name: data.name,
          description: data.description,
          domain: data.domain,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          is_active: data.is_active,
        };

        setOrganizations((prev) => [...prev, newOrg]);
        toast.success("Organization created successfully");
        setShowCreateDialog(false);
        resetCreateForm();
      },
      (err) => {
        console.error("Failed to create organization:", err);
        toast.error(err?.message || "Failed to create organization");
      },
      createForm
    );

    setIsCreating(false);
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone."
      )
    ) {
      return;
    }

    utils.fetchData(
      deleteOrganization,
      () => {
        setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
        toast.success("Organization deleted successfully");
      },
      (err) => {
        console.error("Failed to delete organization:", err);
        toast.error(err?.message || "Failed to delete organization");
      },
      orgId
    );
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      description: "",
      domain: "",
    });
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && org.is_active;
    if (activeTab === "inactive") return matchesSearch && !org.is_active;

    return matchesSearch;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              Organizations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organizations and their settings
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading organizations...</p>
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
            <Building2 className="h-8 w-8" />
            Organizations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organizations and their settings
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Organization Overview</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Organizations</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {searchTerm
                                ? "No organizations found matching your search"
                                : "No organizations available"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrganizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{org.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {org.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">
                                {org.domain}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {org.description || "No description"}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(org.is_active)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(
                                  new Date(org.created_at),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/organizations/${org.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Handle edit - could open edit dialog
                                  toast.info("Edit functionality coming soon");
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrganization(org.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your account. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name *</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Domain *</label>
              <Input
                value={createForm.domain}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, domain: e.target.value }))
                }
                placeholder="e.g., example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter organization description"
                className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
