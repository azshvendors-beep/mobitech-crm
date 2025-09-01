"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserPlus,
  UserCheck,
  DollarSign,
  ChevronDown,
  MoreHorizontal,
  UserX,
  Trash2,
  Store,
  Search,
  Building2,
  UserRoundMinus,
  Lock,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { set } from "date-fns";
import { UpdatePassword } from "./add-store/fx/updatePassword";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  dbId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  aadharId: string;
}

interface Store {
  storeId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"employee" | "store">("employee");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [data, setData] = useState<Employee[] | Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    inactiveUsers: 0,
    totalEmployees: 0,
    totalStores: 0,
  });
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const employeeColumns = [
    {id: "view", label: "View"},
    { id: "id", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "role", label: "Role" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Actions" },
  ];

  const storeColumns = [
    { id: "view", label: "View" },
    { id: "storeId", label: "Store ID" },
    { id: "storeName", label: "Store Name" },
    { id: "ownerName", label: "Owner Name" },
    { id: "ownerEmail", label: "Owner Email" },
    { id: "ownerPhone", label: "Owner Phone" },
    { id: "address", label: "Address" },
    { id: "actions", label: "Actions" },
  ];

  const roles = [
    { name: "All", value: null },
    { name: "Manager", value: "MANAGER" },
    { name: "Sales Executive", value: "MARKETING_EXECUTIVE" },
    { name: "Field Executive", value: "FIELD_EXECUTIVE" },
    { name: "Technician", value: "TECHNICIAN" },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm, selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: activeTab,
        search: searchTerm,
        ...(selectedRole && { role: selectedRole }),
      });

      const response = await fetch(`/api/list?${params}`);
      const result = await response.json();
      console.log(result);
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result.data);
      

      // Update stats
      if (activeTab === "employee") {
        setStats((prev) => ({
          ...prev,
          totalEmployees: result.total,
          activeUsers: result.data.filter(
            (emp: Employee) => emp.status === "ACTIVE"
          ).length,
          inactiveUsers: result.data.filter(
            (emp: Employee) => emp.status !== "ACTIVE"
          ).length,
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          totalStores: result.total,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/${activeTab}s/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success(
        `${
          activeTab === "employee" ? "Employee" : "Store"
        } deleted successfully`
      );
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const statsCards = [
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      description: "Currently active employees",
      icon: UserCheck,
      color: "from-green-500/50 to-green-500",
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers.toString(),
      description: "Currently inactive employees",
      icon: Users,
      color: "from-yellow-500/50 to-yellow-500",
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      description: "Total workforce",
      icon: UserPlus,
      color: "from-blue-500/50 to-blue-500",
    },
    {
      title: "Total Stores",
      value: stats.totalStores.toString(),
      description: "Registered stores",
      icon: Store,
      color: "from-purple-500/50 to-purple-500",
    },
  ];

  const router = useRouter();

  return (
    <div className="space-y-6 p-1 lg:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${stat.color} shadow-sm`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs and Table Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-300/80 shadow-lg">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            // Only allow "employee" or "store" as valid values
            if (value === "employee" || value === "store") {
              setActiveTab(value);
            }
          }}
        >
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="employee">Employees</TabsTrigger>
                <TabsTrigger value="store">Stores</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 h-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-wrap max-sm:justify">
                  {activeTab === "employee" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white/60 text-xs sm:text-sm px-2 sm:px-3">
                          Role <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {roles.map((role) => (
                          <DropdownMenuCheckboxItem
                            key={role.name}
                            checked={selectedRole === role.value}
                            onCheckedChange={() => setSelectedRole(role.value)}
                          >
                            {role.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/60 text-xs sm:text-sm px-2 sm:px-3">
                        Columns <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(activeTab === "employee"
                        ? employeeColumns
                        : storeColumns
                      ).map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={!hiddenColumns.includes(column.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setHiddenColumns(
                                hiddenColumns.filter((id) => id !== column.id)
                              );
                            } else {
                              setHiddenColumns([...hiddenColumns, column.id]);
                            }
                          }}
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                    onClick={() => {
                      activeTab === "employee"
                        ? (window.location.href = "/admin/employees/add-employee")
                        : (window.location.href = "/admin/employees/add-store");
                    }}
                  >
                    <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add {activeTab === "employee" ? "Employee" : "Store"}</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="employee" className="p-0">
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {employeeColumns.map(
                      (column) =>
                        !hiddenColumns.includes(column.id) && (
                          <TableHead key={column.id}>{column.label}</TableHead>
                        )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={employeeColumns.length}
                        className="text-center py-8 "
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data as Employee[]).map((employee) => (
                      <TableRow
                        key={employee.id}
                        className="cursor-pointer hover:bg-blue-50 transition"
                       
                      >
                        {!hiddenColumns.includes("view") && (
                          <TableCell>
                            <Link
                              href={`/admin/employees/${employee.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        )}
                        {!hiddenColumns.includes("id") && (
                          <TableCell>{employee.id}</TableCell>
                        )}
                        {!hiddenColumns.includes("name") && (
                          <TableCell>{employee.name}</TableCell>
                        )}
                        {!hiddenColumns.includes("email") && (
                          <TableCell>{employee.email}</TableCell>
                        )}
                        {!hiddenColumns.includes("phone") && (
                          <TableCell>{employee.phone}</TableCell>
                        )}
                        {!hiddenColumns.includes("role") && (
                          <TableCell>
                            <span className="bg-blue-100/80 text-blue-700 px-2 py-1 rounded-full text-xs">
                              {employee.role === "MARKETING_EXECUTIVE" ? "SALES_EXECUTIVE" : employee.role}
                            </span>
                          </TableCell>
                        )}
                        {!hiddenColumns.includes("status") && (
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                employee.status === "ACTIVE"
                                  ? "bg-green-100/80 text-green-700"
                                  : "bg-red-100/80 text-red-700"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </TableCell>
                        )}
                        {!hiddenColumns.includes("actions") && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-yellow-600 cusrsor-pointer" onClick={() => {router.push(`/admin/employees/${employee.id}/edit`)}}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Employee
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-yellow-600 cusrsor-pointer" onClick={() => {setSelectedEmployeeId(employee.dbId); setChangePasswordDialogOpen(true);}}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Change Password
                                </DropdownMenuItem>
                                {employee.status === "ACTIVE" && (
                                  <>
                                    <DropdownMenuItem
                                      className="text-yellow-600 cusrsor-pointer"
                                      onClick={() => {
                                        // Handle status change
                                      }}
                                    >
                                      <UserRoundMinus className="mr-2 h-4 w-4" />
                                      Change Status
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-500 cusrsor-pointer"
                                      onClick={() => {
                                        setSelectedEmployeeId(employee.id);
                                        setTerminateDialogOpen(true);
                                      }}
                                    >
                                      <UserX className="mr-2 h-4 w-4" />
                                      Terminate User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600 cusrsor-pointer"
                                      onClick={() => handleDelete(employee.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {employee.status !== "ACTIVE" && (
                                  <DropdownMenuItem disabled className="text-gray-400">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Inactive
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="store" className="p-0">
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {storeColumns.map(
                      (column) =>
                        !hiddenColumns.includes(column.id) && (
                          <TableHead key={column.id}>{column.label}</TableHead>
                        )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={storeColumns.length}
                        className="text-center py-8"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data as Store[]).map((store) => (
                      <TableRow key={store.storeId}>
                        {!hiddenColumns.includes("storeId") && (
                          <TableCell>{store.storeId}</TableCell>
                        )}
                        {!hiddenColumns.includes("storeName") && (
                          <TableCell>{store.storeName}</TableCell>
                        )}
                        {!hiddenColumns.includes("ownerName") && (
                          <TableCell>{store.ownerName}</TableCell>
                        )}
                        {!hiddenColumns.includes("ownerEmail") && (
                          <TableCell>{store.ownerEmail}</TableCell>
                        )}
                        {!hiddenColumns.includes("ownerPhone") && (
                          <TableCell>{store.ownerPhone}</TableCell>
                        )}
                        {!hiddenColumns.includes("address") &&
                          store.address && (
                            <TableCell>
                              <span className="text-sm">
                                {store.address.streetAddress ?? ""},{" "}
                                {store.address.city}, {store.address.state}{" "}
                                {store.address.pinCode}
                              </span>
                            </TableCell>
                          )}
                        {!hiddenColumns.includes("actions") && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(store.storeId)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate User?</DialogTitle>
            <DialogDescription>
              This action will make the user inoperable. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedEmployeeId) return;
                try {
                  const response = await fetch("/api/employees", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employeeId: selectedEmployeeId }),
                  });
                  if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || "Failed to terminate user");
                  }
                  toast.success("User terminated successfully");
                  setTerminateDialogOpen(false);
                  setSelectedEmployeeId(null);
                  fetchData();
                } catch (error: any) {
                  toast.error(error.message || "Failed to terminate user");
                }
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription className="mt-3">
              Enter a new password for the user.
            </DialogDescription>
         <div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    placeholder="New password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="pr-10"
  />
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
      <EyeOff className="h-4 w-4 text-gray-500" />
    ) : (
      <Eye className="h-4 w-4 text-gray-500" />
    )}
  </Button>
</div>
          </DialogHeader>
          {/* <DialogContent>
          </DialogContent> */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="success"
              onClick={async () => {
                if (!selectedEmployeeId) return;
                try {
                  const response = await UpdatePassword({
                    id: selectedEmployeeId,
                    newPassword,
                  })
                  if (!response.success) {
                    throw new Error(response.message || "Failed to change password");
                  }
                  toast.success("Password changed successfully");
                  setChangePasswordDialogOpen(false);
                  setSelectedEmployeeId(null);
                  window.location.reload();
                } catch (error: any) {
                  toast.error(error.message || "Failed to change password");
                }
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
