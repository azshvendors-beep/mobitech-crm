import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Building,
  CreditCard,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { getSignedGetUrl } from "@/lib/s3-get";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id: employeeId } = await params;

  if (!employeeId) {
    return notFound();
  }

  // Try to find the employee from all possible tables
  let employee: any = null;
  let user: any = null;
  let role: string | null = null;

  try {
    // Check all employee types
    const manager = await prisma.manager.findUnique({
      where: { employeeId },
      include: { user: true, bankDetails: true },
    });

    if (manager) {
      employee = manager;
      user = manager.user;
      role = "MANAGER";
    } else {
      const technician = await prisma.technician.findUnique({
        where: { employeeId },
        include: { user: true, bankDetails: true },
      });

      if (technician) {
        employee = technician;
        user = technician.user;
        role = "TECHNICIAN";
      } else {
        const fieldExecutive = await prisma.fieldExecutive.findUnique({
          where: { employeeId },
          include: { user: true, bankDetails: true },
        });

        if (fieldExecutive) {
          employee = fieldExecutive;
          user = fieldExecutive.user;
          role = "FIELD_EXECUTIVE";
        } else {
          const salesExecutive = await prisma.salesExecutive.findUnique({
            where: { employeeId },
            include: { user: true, bankDetails: true },
          });

          if (salesExecutive) {
            employee = salesExecutive;
            user = salesExecutive.user;
            role = "MARKETING_EXECUTIVE";
          }
        }
      }
    }

    if (!employee || !user) {
      return notFound();
    }


  } catch (error) {
    console.error("Error fetching employee:", error);
    return notFound();
  }

  const keys = {
    profile: user.profileImage,
    aadharFront: user.aadharFrontImage,
    aadharBack: user.aadharBackImage,
    qualification: user.qualificationImage,
    vehicleFront: user.VehicleFrontImage, // may be null
    vehicleBack: user.VehicleBackImage, // may be null
  };

  console.log("Keys:", keys);

  const [
    profileUrl,
    aadharFrontUrl,
    aadharBackUrl,
    qualificationUrl,
    vehicleFrontUrl,
    vehicleBackUrl,
  ] = await Promise.all([
    getSignedGetUrl(keys.profile),
    getSignedGetUrl(keys.aadharFront),
    getSignedGetUrl(keys.aadharBack),
    getSignedGetUrl(keys.qualification),
    getSignedGetUrl(keys.vehicleFront),
    getSignedGetUrl(keys.vehicleBack),
  ]);

  console.log("Signed URLs:", {
    profileUrl,
    aadharFrontUrl,
    aadharBackUrl,
    qualificationUrl,
    vehicleFrontUrl,
    vehicleBackUrl,
  });
  // Use a profile image if available, fallback to a placeholder
  const profileImage = user.profileImage || "/icon.png";

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  console.log("Employee Data:", employee);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/admin/employees">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
        </div>

        {/* Employee Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <Image
                    src={profileUrl || "/placeholder.svg"}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <Badge
                    variant={
                      user.status === "ACTIVE" ? "default" : "destructive"
                    }
                    className="px-3 py-1"
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-blue-100 text-lg mb-3">
                  {role?.replace("_", " ")}
                </p>
                <div className="flex flex-wrap gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-mono">ID: {employee.employeeId}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Phone</span>
                  <span className="font-mono text-gray-900">{user.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Email</span>
                  <span className="font-mono text-gray-900">
                    {user.email || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Aadhar ID</span>
                  <span className="font-mono text-gray-900">
                    {employee.aadharId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">
                    Date of Joining
                  </span>
                  <span className="font-mono text-gray-900">
                    {formatDate(user.dateOfJoining)}
                  </span>
                </div>
                {user.dateOfTermination && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      Date of Termination
                    </span>
                    <span className="font-mono text-gray-900">
                      {formatDate(user.dateOfTermination)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Salary</span>
                  <span className="font-mono text-gray-900">
                    {user.salary ? `₹${user.salary.toLocaleString()}` : "-"}{" "}
                    /day
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Payout Date</span>
                  <span className="font-mono text-gray-900">
                    {user.payoutDate || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Store ID</span>
                  <span className="font-mono text-gray-900">
                    {user.storeId || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Created By</span>
                  <span className="font-mono text-gray-900">
                    {user.createdBy || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Created At</span>
                  <span className="font-mono text-gray-900">
                    {formatDateTime(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Updated At</span>
                  <span className="font-mono text-gray-900">
                    {formatDateTime(user.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-600" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {employee.bankDetails ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      Account Number
                    </span>
                    <span className="font-mono text-gray-900">
                      {employee.bankDetails.accountNumber || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">IFSC Code</span>
                    <span className="font-mono text-gray-900">
                      {employee.bankDetails.ifsc || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Bank Name</span>
                    <span className="font-mono text-gray-900">
                      {employee.bankDetails.bankName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">UPI ID</span>
                    <span className="font-mono text-gray-900">
                      {employee.bankDetails.upiId || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">
                      Beneficiary Name
                    </span>
                    <span className="font-mono text-gray-900">
                      {employee.bankDetails.beneficiaryName || "-"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bank details available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">
                    Aadhar Front
                  </span>
                  {aadharFrontUrl ? (
                    <a
                      href={aadharFrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-400">Not uploaded</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Aadhar Back</span>
                  {aadharBackUrl ? (
                    <a
                      href={aadharBackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-400">Not uploaded</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">
                    Qualification
                  </span>
                  {qualificationUrl ? (
                    <a
                      href={qualificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-400">Not uploaded</span>
                  )}
                </div>
                {role === "FIELD_EXECUTIVE" && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">
                        Vehicle Front
                      </span>
                      {vehicleFrontUrl ? (
                        <a
                          href={vehicleFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">
                        Vehicle Back
                      </span>
                      {vehicleBackUrl ? (
                        <a
                          href={vehicleBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
