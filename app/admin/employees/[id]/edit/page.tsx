"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BANK_NAMES, ROLE_TYPES } from "@/constants/const";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, CreditCard, Loader2, XCircle } from "lucide-react";
import { notFound } from "next/navigation";
import React, { use, useEffect, useRef, useState, useCallback } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const editEmployeeSchema = z.object({
  type: z.literal("Employee"),
  roleType: z.enum(ROLE_TYPES),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  phoneVerified: z.boolean(),
  salary: z.number().min(0, "Salary must be a positive number"),
  payoutDate: z.number().min(1).max(30),
  bankDetails: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("bank"),
      bankName: z.enum(BANK_NAMES),
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
      accountNumber: z.string().min(9).max(18, "Invalid account number"),
    }),
    z.object({
      type: z.literal("upi"),
      upiId: z.string().regex(/^[\w\.\-]{3,}@[\w\.\-]{3,}$/, "Invalid UPI ID"),
    }),
  ]),
});

type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>;
type Timer = ReturnType<typeof setInterval> | null;

const EditEmployees = ({ params }: { params: Promise<{ id: string }> }) => {
  // Get id from params using React's use hook
  const { id } = use(params);

  // All useState hooks must be called in the same order every render
  const [employee, setEmployee] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOTPSheetOpen, setOTPSheetOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [paymentType, setPaymentType] = useState<"bank" | "upi">("bank");
  const [isBankVerifyDialogOpen, setIsBankVerifyDialogOpen] = useState(false);
  const [isUpiVerifyDialogOpen, setIsUpiVerifyDialogOpen] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false);
  const [bankData, setBankData] = useState<any>(null);
  const [upiData, setUpiData] = useState<any>(null);

  // All useRef hooks must be called in the same order every render
  const resendTimerRef = useRef<Timer>(null);

  // useForm hook must be called in the same order every render
  const form = useForm<EditEmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      type: "Employee",
      roleType: undefined,
      phone: "",
      phoneVerified: false,
      salary: 0,
      payoutDate: 1,
      bankDetails: {
        type: "bank",
        bankName: "AXIS BANK",
        ifscCode: "",
        accountNumber: "",
      },
    },
  });

  // Fetch employee data effect
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/employees/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: id,
          }),
        });

        if (!response.ok) {
          throw new Error("Employee not found");
        }

        const data = await response.json();
       

        setEmployee(data.employee);
        setUser(data.user);
        setRole(data.role);
        setPaymentType(
          data.employee.bankDetails.accountNumber ? "bank" : "upi"
        );

        // Update form with fetched data
        form.reset({
          roleType:
            data.role === "MANAGER"
              ? "Store Manager"
              : data.role === "TECHNICIAN"
              ? "Technician"
              : data.role === "FIELD_EXECUTIVE"
              ? "Field Executive"
              : data.role === "MARKETING_EXECUTIVE"
              ? "Sales Executive"
              : undefined,
          phone: data.user.phone,
          salary: Number(data.employee.user.salary) || 0,
          payoutDate: data.employee.user.payoutDate,
          bankDetails:
            data.employee.bankDetails.accountNumber !== null
              ? {
                  type: "bank",
                  bankName: BANK_NAMES[0],
                  ifscCode: data.employee.bankDetails.ifscCode || "",
                  accountNumber: data.employee.bankDetails.accountNumber || "",
                }
              : {
                  type: "upi",
                  upiId: data.employee.bankDetails.upiId || "",
                },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, form]);
  // Helper function for countdown - use useCallback to prevent recreation
  const startResendCountdown = useCallback(() => {
    setResendCountdown(30);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePaymentTypeChange = (type: "bank" | "upi") => {
    setPaymentType(type);
    if (form.getValues().type === "Employee") {
      const currentValues = form.getValues() as EditEmployeeFormData;
      form.setValue(
        "bankDetails",
        type === "bank"
          ? {
              type: "bank",
              bankName: BANK_NAMES[0],
              ifscCode: "",
              accountNumber: "",
            }
          : {
              type: "upi",
              upiId: "",
            }
      );
    }
  };

  const verifyBankAccount = async () => {
    const bankDetails = form.getValues("bankDetails");
    if (bankDetails?.type !== "bank") return;

    const { accountNumber, ifscCode } = bankDetails;
    if (!accountNumber || !ifscCode) {
      toast.error("Please enter both account number and IFSC code");
      return;
    }

    setIsVerifyingBank(true);
    try {
      const response = await fetch("/api/bank/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_number: accountNumber,
          ifsc: ifscCode,
        }),
      });

      const data = await response.json();

      if (data.status === "success" && data.data.account_exists) {
        setBankData(data.data);

        setIsBankVerified(true);
        toast.success("Bank account verified successfully");
      } else {
        toast.error(data.message || "Failed to verify bank account");
        setIsBankVerifyDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to verify bank account");
      setIsBankVerifyDialogOpen(false);
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const verifyUpi = async () => {
    const bankDetails = form.getValues("bankDetails");
    if (bankDetails?.type !== "upi") return;

    const { upiId } = bankDetails;
    if (!upiId) {
      toast.error("Please enter UPI ID");
      return;
    }

    setIsVerifyingUpi(true);
    try {
      const response = await fetch("/api/bank/verify-upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upi_id: upiId,
        }),
      });

      const data = await response.json();



      if (data.status === "success" && data.data.account_exists) {
        setIsUpiVerified(true);
        setUpiData(data.data);
        toast.success("UPI ID verified successfully");
      } else {
        toast.error(data.message || "Failed to verify UPI ID");
        setIsUpiVerifyDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to verify UPI ID");
      setIsUpiVerifyDialogOpen(false);
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  // OTP countdown effect
  useEffect(() => {
    if (isOTPSheetOpen) {
      startResendCountdown();
    } else {
      setResendCountdown(0);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    }

    // Cleanup function
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [isOTPSheetOpen, startResendCountdown]);

  // Submit handler
  const onSubmit = async (data: EditEmployeeFormData) => {
    toast.loading("Updating employee details...");
    console.log("Form Data:", data);
    try {
      const response = await fetch(`/api/employees/details`, {
        method: "PUT", // Changed to PUT for updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: id,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      const result = await response.json();
      console.log("Update Result:", result);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error updating employee:", error);
      // Handle error (e.g., show an error message)
    }
  };

  // Early returns should happen after all hooks are called
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-2 space-y-6 max-sm:px-2">
        {/* Heading */}
        <div className="text-start space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-gray-600 max-sm:text-sm">Edit employee details</p>
        </div>
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={
                  form.control as unknown as Control<EditEmployeeFormData>
                }
                name="roleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Role Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_TYPES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          className="h-12"
                          placeholder="Enter 10-digit phone number"
                          disabled={isPhoneVerified}
                        />
                        {isPhoneVerified ? (
                          <CheckCircle className="text-green-500 w-6 h-6" />
                        ) : (
                          <Button
                            type="button"
                            variant="default"
                            onClick={async () => {
                              setOTPSheetOpen(true);
                              setOtp("");
                              setOtpError(null);
                              // Real API call
                              try {
                                const res = await fetch("/api/otp/send", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    identifier: field.value,
                                    message:
                                      "Your MOBITECH Registration verification code is : ",
                                  }),
                                });
                                const data = await res.json();
                                if (!data.success) {
                                  setOtpError(
                                    data.error || "Failed to send OTP"
                                  );
                                  setOTPSheetOpen(false);
                                }
                              } catch (err) {
                                setOtpError("Failed to send OTP");
                                setOTPSheetOpen(false);
                              }
                            }}
                            disabled={!field.value || field.value.length !== 10}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="h-12 pr-14" // add right padding for the suffix
                          placeholder="Enter salary"
                          min={0}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">
                          / day
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payout Date */}
              <FormField
                control={form.control}
                name="payoutDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Date</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-12 border rounded px-3"
                      >
                        {Array.from({ length: 30 }, (_, i) => (
                          <option key={i + 1} value={i + 1} className="px-2">
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank Details - This needs proper handling based on your schema */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bank Details</h3>
                {/* Add proper bank details form fields here */}
                {/* Payment Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      paymentType === "bank"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentTypeChange("bank")}
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="font-semibold text-lg">Bank Account</h4>
                        <p className="text-gray-600 text-sm">
                          Add bank account details
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      paymentType === "upi"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentTypeChange("upi")}
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-8 h-8 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-lg">UPI</h4>
                        <p className="text-gray-600 text-sm">
                          Add UPI payment details
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details */}
                {paymentType === "bank" && (
                  <div className="space-y-4">
                    <FormField
                      control={
                        form.control as unknown as Control<EditEmployeeFormData>
                      }
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 w-full">
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BANK_NAMES.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={
                        form.control as unknown as Control<EditEmployeeFormData>
                      }
                      name="bankDetails.ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter IFSC code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={
                        form.control as unknown as Control<EditEmployeeFormData>
                      }
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                {...field}
                                className="h-12"
                                placeholder="Enter account number"
                              />
                            </FormControl>
                            {isBankVerified ? (
                              <>
                                <div className="flex items-center mt-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                </div>
                              </>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => {
                                  setIsBankVerifyDialogOpen(true);
                                  verifyBankAccount();
                                }}
                                disabled={!field.value || isVerifyingBank}
                                className="h-12"
                              >
                                {isVerifyingBank ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  "Verify"
                                )}
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                          {isBankVerified && (
                            <div className="flex items-center mt-2 text-sm text-blue-500 bg-blue-500/20 px-2 py-2 rounded-md ">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-black">
                                Beneficiary Name:{" "}
                                <strong className="text-blue-500">
                                  {bankData.full_name}
                                </strong>
                              </span>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* UPI Details */}
                {paymentType === "upi" && (
                  <FormField
                    control={
                      form.control as unknown as Control<EditEmployeeFormData>
                    }
                    name="bankDetails.upiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter UPI ID"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={() => {
                              setIsUpiVerifyDialogOpen(true);
                              verifyUpi();
                            }}
                            disabled={!field.value || isVerifyingUpi}
                            className="h-12"
                          >
                            {isVerifyingUpi ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                        {isUpiVerified && (
                          <div className="flex items-center mt-2 text-sm text-blue-500 bg-blue-500/20 px-2 py-2 rounded-md ">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-black">
                              Beneficiary Name:{" "}
                              <strong className="text-blue-500">
                                {upiData?.name_at_bank}
                              </strong>
                            </span>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button type="submit" className="w-full">
                Update Employee
              </Button>
            </form>
          </Form>
        </Card>
      </div>
      <Sheet open={isOTPSheetOpen} onOpenChange={setOTPSheetOpen}>
        <SheetContent side="right" className="max-w-xs w-full px-4">
          <SheetHeader>
            <SheetTitle>Verify Phone Number</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 text-lg tracking-widest text-center"
              autoFocus
            />
            {otpError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle className="w-4 h-4" /> {otpError}
              </div>
            )}
            <Button
              className="w-full"
              onClick={async () => {
                setIsVerifyingOtp(true);
                setOtpError(null);
                try {
                  const res = await fetch("/api/otp/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      identifier: form.getValues("phone"),
                      otp,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setIsPhoneVerified(true);
                    form.setValue("phoneVerified", true);
                    setOTPSheetOpen(false);
                    setOtpError(null);
                  } else {
                    setOtpError(data.error || "Invalid OTP. Please try again.");
                  }
                } catch (err) {
                  setOtpError("Failed to verify OTP. Please try again.");
                }
                setIsVerifyingOtp(false);
              }}
              disabled={otp.length !== 6 || isVerifyingOtp}
            >
              {isVerifyingOtp ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Submit"
              )}
            </Button>
            <Button
              className="w-full mt-2 cursor-pointer"
              variant="default"
              disabled={resendCountdown > 0}
              onClick={async () => {
                setOtpError(null);
                try {
                  const res = await fetch("/api/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      identifier: form.getValues("phone"),
                      message:
                        "Your MOBITECH Registration verification code is : ",
                    }),
                  });
                  const data = await res.json();
                  if (!data.success) {
                    setOtpError(data.error || "Failed to resend OTP");
                  } else {
                    startResendCountdown();
                    // Optionally show a toast
                    // toast.success("OTP resent to your phone");
                  }
                } catch (err) {
                  setOtpError("Failed to resend OTP");
                }
              }}
            >
              {resendCountdown > 0
                ? `Resend OTP (${resendCountdown}s)`
                : "Resend OTP"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EditEmployees;
