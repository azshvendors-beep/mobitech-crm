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
import { Progress } from "@/components/ui/progress";
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
import {
  BANK_NAMES,
  employeeSchema,
  ROLE_TYPES,
  storeSchema,
} from "@/constants/const";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  MessageCircle,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AadharSheet } from "@/components/common-components/AadharSheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { file } from "googleapis/build/src/apis/file";

const AddEmployee = () => {
  // Remove employeeType state and all logic for Exchange Store
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentType, setPaymentType] = useState<"bank" | "upi">("bank");
  const [isSubmittingEmployeeData, setIsSubmittingEmployeeData] =
    useState(false);
  // debug mode
  const [aadharVerified, setAadharVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  const [imagePreview, setImagePreview] = useState<{
    profilePicture?: string;
    aadharFront?: string;
    aadharBack?: string;
    qualification?: string;
    vehicleFront?: string;
    vehicleBack?: string;
  }>({});
  const [stores, setStores] = useState<
    Array<{ userId: string; storeName: string; storeId: string }>
  >([]);
  const [isOTPSheetOpen, setOTPSheetOpen] = useState(false);
  // debug mode
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isVerifyingAadhar, setIsVerifyingAadhar] = useState(false);
  const [aadharData, setAadharData] = useState<any>(null);
  const [isLoadingAadharData, setIsLoadingAadharData] = useState(false);
  const [isAadharSheetOpen, setIsAadharSheetOpen] = useState(false);
  const [aadharOtpInput, setAadharOtpInput] = useState("");
  const [isBankVerifyDialogOpen, setIsBankVerifyDialogOpen] = useState(false);
  const [isUpiVerifyDialogOpen, setIsUpiVerifyDialogOpen] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false);
  const [bankData, setBankData] = useState<any>(null);
  const [upiData, setUpiData] = useState<any>(null);
  const [requestId, setRequestId] = useState<string | null>(null); // For real API integration

  // Add state for resend countdown
  type Timer = ReturnType<typeof setInterval> | null;
  const [resendCountdown, setResendCountdown] = useState(0);
  const resendTimerRef = useRef<Timer>(null);

  // Helper to start countdown
  const startResendCountdown = () => {
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
  };

  // Start countdown when OTP sheet opens
  useEffect(() => {
    if (isOTPSheetOpen) {
      startResendCountdown();
    } else {
      setResendCountdown(0);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    }
    // eslint-disable-next-line
  }, [isOTPSheetOpen]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/stores");
        if (response.ok) {
          const data = await response.json();
          setStores(data);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        toast.error("Failed to load stores");
      }
    };
    fetchStores();
  }, []);

  const getStepIcon = (step: number) => {
    if (step < currentStep)
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (step === currentStep)
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
          {step}
        </div>
      );
    return (
      <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
        {step}
      </div>
    );
  };

  const getStepTitle = (step: number) => {
    const employeeSteps = [
      "Personal Details",
      "Role & Password",
      "KYC Verification",
      "Bank & Documents",
    ];
    return employeeSteps[step - 1];
  };

  const formSchema = employeeSchema;
  type EmployeeFormData = z.infer<typeof employeeSchema>;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Employee",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneVerified: false,
      storeId: "",
      profilePicture: undefined,
      roleType: ROLE_TYPES[0],
      aadharNumber: "",
      bankDetails:
        paymentType === "bank"
          ? {
              type: "bank",
              bankName: BANK_NAMES[0],
              ifscCode: "",
              accountNumber: "",
            }
          : {
              type: "upi",
              upiId: "",
            },
      documents: {
        aadharBack: undefined,
        aadharFront: undefined,
        qualification: undefined,
        vehicleBack: undefined,
        vehicleFront: undefined,
      },
      dateOfJoining: "",
      salary: 0,
      payoutDate: 1,
    },
  });

  useEffect(() => {
    form.setValue(
      "bankDetails",
      paymentType === "bank"
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
    // eslint-disable-next-line
  }, [paymentType]);

  const canProceedToNextStep = () => {
    const values = form.getValues();
    const formState = form.formState;
    const hasErrors = Object.keys(formState.errors).length > 0;
    if (hasErrors) {
      console.log(hasErrors);
      return false;
    }
    switch (currentStep) {
      case 1:
        return (
          values.firstName?.length > 0 &&
          values.lastName?.length > 0 &&
          values.email?.length > 0 &&
          values.phone?.length > 0 &&
          values.phoneVerified == true
        );
      case 2:
        return form.watch("password")?.length >= 8 && form.watch("roleType");
      case 3:
        return (
          values.aadharNumber?.length === 12 &&
          aadharVerified &&
          values.documents.aadharFront != null &&
          values.documents.aadharBack != null
        );
      case 4:
        if (values.bankDetails?.type === "bank") {
          return (
            values.bankDetails.bankName &&
            values.bankDetails.ifscCode?.length > 0 &&
            values.bankDetails.accountNumber?.length > 0 &&
            isBankVerified
          );
        }
        return (
          values.bankDetails?.type === "upi" &&
          values.bankDetails.upiId?.length > 0 &&
          isUpiVerified
        );
      default:
        return false;
    }
  };

  const handleImageUpload = (file: File | undefined, field: string) => {
    if (!file) {
      setImagePreview((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload only image files");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview((prev) => ({
        ...prev,
        [field]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const password = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    form.setValue("password", password, { shouldValidate: true });
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard!");
  };

  const verifyAadhar = async () => {
    const aadharNumber = form.getValues("aadharNumber" as any);
    if (!aadharNumber || aadharNumber.length !== 12) {
      toast.error("Please enter a valid Aadhar number");
      return;
    }

    setIsVerifyingAadhar(true);
    try {
      const response = await fetch("/api/aadhar/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_number: aadharNumber,
        }),
      });

      const data = await response.json();

      if (data.status_code === 200) {
        setRequestId(data.request_id);
        setIsAadharSheetOpen(true);
        setIsVerifyingAadhar(false);
      } else {
        toast.error(data.message || "Invalid Aadhar Number");
        setIsVerifyingAadhar(false);
      }
    } catch (error) {
      toast.error("Failed to verify Aadhar. Please try again.");
      setIsVerifyingAadhar(false);
    }
  };

  const verifyAadharOTP = async () => {
    if (!aadharOtpInput || aadharOtpInput.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setIsLoadingAadharData(true);
    try {
      const response = await fetch("/api/aadhar/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          otp: aadharOtpInput,
        }),
      });

      const data = await response.json();

      if (data.status_code === 200) {
        setAadharData(data.data);
        setIsLoadingAadharData(false);
      } else {
        toast.error(data.message || "Invalid OTP");
        setIsLoadingAadharData(false);
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
      setIsLoadingAadharData(false);
    }
  };

  const handleAadharVerification = (status: "pass" | "fail") => {
    if (status === "pass") {
      setAadharVerified(true);
      toast.success("Aadhar verified successfully");
    } else {
      setAadharVerified(false);
      toast.error("Aadhar verification failed");
    }
    setIsAadharSheetOpen(false);
    setAadharOtpInput("");
    setAadharData(null);
    setRequestId("");
  };

  const handlePaymentTypeChange = (type: "bank" | "upi") => {
    setPaymentType(type);
    if (form.getValues().type === "Employee") {
      const currentValues = form.getValues() as EmployeeFormData;
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

      // console.log("UPI DATA", data);

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

  const onSubmit = async (values: EmployeeFormData) => {
    try {
      console.log("Values:", values);
      const isValid = await form.trigger();
      // if (!isValid) {
      //   console.error("Form validation failed");
      //   return;
      // }
      setIsSubmittingEmployeeData(true);
      let filesArray: any = [
        values.profilePicture,
        values.documents.aadharBack,
        values.documents.aadharFront,
        values.documents.qualification,
        values.documents.vehicleFront,
        values.documents.vehicleBack,
      ];
      const fileNameArray = [
        "profilePicture",
        "aadharBack",
        "aadharFront",
        "qualification",
        "vehicleFront",
        "vehicleBack",
      ];

      // Only request presigned URLs for defined files, but keep order
      const filesToPresign = filesArray
        .map((f: any, index: number) =>
          f !== undefined ? { name: fileNameArray[index], type: f.type } : null
        )
        .filter(Boolean);

      console.log("Files to presign:", filesToPresign);

      const presignRes = await fetch("/api/get-presigned-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToPresign,
        }),
      });
      const { urls } = await presignRes.json();

      // console.log("Presigned URLs:", urls);

      // const { finalUrls } = await finalSignedRes.json();

      // console.log(finalUrls)

      // Upload files and collect their URLs
      await Promise.all(
        urls.map((u: any) => {
          // Find the file index by matching the name at the end of the key
          const fileIndex = fileNameArray.findIndex((name) =>
            u.key.endsWith(name)
          );
          const file = filesArray[fileIndex];
          if (file) {
            return fetch(u.uploadUrl, { method: "PUT", body: file });
          }
          return Promise.resolve();
        })
      );

      // console.log(
      //   "Keys:",
      //   urls.map((u: any) => u.key)
      // );

      const finalSignedRes = await fetch("/api/get-final-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKeys: urls.map((u: any) => u.key),
        }),
      });
      const { finalUrls } = await finalSignedRes.json();
      // console.log("Final URLs:", finalUrls);
      // Map S3 keys to document fields
      const keyToFieldMap: Record<string, string> = {
        profilePicture: "profilePicture",
        aadharBack: "aadharBack",
        aadharFront: "aadharFront",
        qualification: "qualification",
        vehicleFront: "vehicleFront",
        vehicleBack: "vehicleBack",
      };
      const documents: Record<string, string | undefined> = {};
      // Set all fields to undefined by default
      Object.values(keyToFieldMap).forEach((field) => {
        documents[field] = undefined;
      });
      finalUrls.forEach((u: any) => {
        // console.log("URL:", u);
        // Extract the document name from the S3 key
        const keyParts = u.split("-");
        // console.log("Key Parts:", keyParts);
        const docName = keyParts[keyParts.length - 1];
        // console.log("Document Name:", docName);
        const field = keyToFieldMap[docName];
        if (field) {
          documents[field] = u;
        }
      });

      const employeeData = values as EmployeeFormData;
      const apiData = {
        ...employeeData,
        documents,
      };
      // console.log(apiData);
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      const result = await response.json();

      if (response.status === 201) {
        const response = await fetch("/api/welcome-employee-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: result.employeeId,
            phone: result.phone,
            name: result.name,
          }),
        });

        if (response.ok) {
          toast.success("Welcome message sent successfully!");
        } else {
          toast.error("Failed to send welcome message.");
        }
        toast.success(
          `Employee registered successfully! Employee ID: ${result.employeeId}`
        );
        form.reset();
        setCurrentStep(1);
        setIsPhoneVerified(false);
        setAadharVerified(false);
        setBankVerified(false);
        setUpiVerified(false);
        setBankData(null);
        setUpiData(null);
        setImagePreview({});
      } else if (response.status === 409) {
        console.error(result);
        toast.error(
          result.message || "Employee with this phone or email already exists"
        );
      }

      // Reset form and state
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to register"
      );
    } finally {
      setIsSubmittingEmployeeData(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-4xl space-y-6 max-sm:px-2">
        {/* Heading */}
        <div className="text-start space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 max-sm:text-sm">
            Complete the form to register a new employee
          </p>
        </div>
        {/* Progress Steps */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-white shadow-lg  overflow-auto">
          <div className="flex items-center justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  {getStepIcon(step)}
                  <span
                    className={`text-xs font-medium ${
                      step <= currentStep ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {getStepTitle(step)}
                  </span>
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      step < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 w-full" />
        </Card>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white shadow-lg">
          {/* <pre style={{ color: "red", fontSize: 12 }}>
            {JSON.stringify(form.getValues(), null, 2)}
            {JSON.stringify(form.formState.errors, null, 2)}
          </pre> */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Personal Details
                    </h3>
                  </div>

                  <FormField
                    control={
                      form.control as unknown as Control<EmployeeFormData>
                    }
                    name="storeId"
                    render={({ field }) => (
                      <FormItem className="max-w-full">
                        <FormLabel className="text-base font-medium">
                          Assigned Store (Optional)
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 w-full">
                              <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem
                                key={store.userId}
                                value={store.storeId}
                              >
                                {store.storeName}
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
                    name="profilePicture"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Profile Picture
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                              {imagePreview.profilePicture ? (
                                <img
                                  src={imagePreview.profilePicture}
                                  alt="Profile Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Upload className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  onChange(file ?? null); // Store File object or null in form
                                  // For preview only, convert to base64
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setImagePreview((prev) => ({
                                        ...prev,
                                        profilePicture: reader.result as string,
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  } else {
                                    setImagePreview((prev) => ({
                                      ...prev,
                                      profilePicture: undefined,
                                    }));
                                  }
                                }}
                                className="flex-1"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Max size: 5MB. Supported formats: JPG, PNG
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={
                        form.control as unknown as Control<EmployeeFormData>
                      }
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter first name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={
                        form.control as unknown as Control<EmployeeFormData>
                      }
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter last name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={
                        form.control as unknown as Control<EmployeeFormData>
                      }
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="h-12"
                              placeholder="Enter email address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={
                        form.control as unknown as Control<EmployeeFormData>
                      }
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
                                  size="sm"
                                  variant="default"
                                  onClick={async () => {
                                    setOTPSheetOpen(true);
                                    setOtp("");
                                    setOtpError(null);
                                    // Real API call
                                    try {
                                      const res = await fetch(
                                        "/api/registration-otp/send",
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            identifier: field.value,
                                            message:
                                              "Your MOBITECH Registration verification code is : ",
                                          }),
                                        }
                                      );
                                      const data = await res.json();
                                      if (!data.success) {
                                        setOtpError(
                                          data.error || "Failed to send OTP"
                                        );
                                        setOTPSheetOpen(false);
                                      } else {
                                        toast.success(data.message);
                                      }
                                    } catch (err) {
                                      setOtpError("Failed to send OTP");
                                      setOTPSheetOpen(false);
                                    }
                                  }}
                                  disabled={
                                    !field.value || field.value.length !== 10
                                  }
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
                  </div>
                </div>
              )}

              {/* Step 2: Role & Password */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Role & Password
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Password
                          </FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                className="h-12"
                                placeholder="Enter or generate password"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={
                        form.control as unknown as Control<EmployeeFormData>
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
                            <SelectContent className="w-full">
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
                  </div>
                </div>
              )}
              {/* Step 3: KYC Verification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900">
                      KYC Verification
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={
                          form.control as unknown as Control<EmployeeFormData>
                        }
                        name="documents.aadharFront"
                        render={({ field: { onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Aadhar Front</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                  {imagePreview.aadharFront ? (
                                    <img
                                      src={imagePreview.aadharFront}
                                      alt="Aadhar Front Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Upload className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      onChange(file);
                                      handleImageUpload(file, "aadharFront");
                                    }}
                                    className="flex-1"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Max size: 5MB. Supported formats: JPG, PNG
                                  </p>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={
                          form.control as unknown as Control<EmployeeFormData>
                        }
                        name="documents.aadharBack"
                        render={({ field: { onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Aadhar Back</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                  {imagePreview.aadharBack ? (
                                    <img
                                      src={imagePreview.aadharBack}
                                      alt="Aadhar Back Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Upload className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      onChange(file);
                                      handleImageUpload(file, "aadharBack");
                                    }}
                                    className="flex-1"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Max size: 5MB. Supported formats: JPG, PNG
                                  </p>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex space-x-2 justify-end">
                      {aadharVerified ? (
                        <div className="flex items-center mt-2 text-sm text-green-600 bg-green-300/20 px-20 py-5 border border-green-600 rounded-md ">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Aadhar verified</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setIsAadharSheetOpen(true)}
                          className="h-12"
                        >
                          {isVerifyingAadhar ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify Aadhar"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <AadharSheet
                open={isAadharSheetOpen}
                onOpenChange={setIsAadharSheetOpen}
                form={form}
                aadharVerified={aadharVerified}
                isVerifyingAadhar={isVerifyingAadhar}
                aadharData={aadharData}
                isLoadingAadharData={isLoadingAadharData}
                aadharOtpInput={aadharOtpInput}
                setAadharOtpInput={setAadharOtpInput}
                verifyAadhar={verifyAadhar}
                verifyAadharOTP={verifyAadharOTP}
                handleAadharVerification={handleAadharVerification}
              />
              {/* Step 4: Bank Details & Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Bank Details & Documents
                    </h3>
                  </div>

                  <div className="space-y-6">
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
                            <h4 className="font-semibold text-lg">
                              Bank Account
                            </h4>
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
                            form.control as unknown as Control<EmployeeFormData>
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
                                  <SelectTrigger className="h-12">
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
                            form.control as unknown as Control<EmployeeFormData>
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
                            form.control as unknown as Control<EmployeeFormData>
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
                          form.control as unknown as Control<EmployeeFormData>
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

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        Qualification Document
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={
                            form.control as unknown as Control<EmployeeFormData>
                          }
                          name="documents.qualification"
                          render={({ field: { onChange, ...field } }) => (
                            <FormItem>
                              <FormLabel>Qualification Document</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-4">
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                    {imagePreview.qualification ? (
                                      <img
                                        src={imagePreview.qualification}
                                        alt="Qualification Document Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Upload className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                        handleImageUpload(
                                          file,
                                          "qualification"
                                        );
                                      }}
                                      className="flex-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Max size: 5MB. Supported formats: JPG, PNG
                                    </p>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Vehicle Documents (for Field Executive) */}
                    {form.getValues("roleType") === "Field Executive" && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          Vehicle Documents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={
                              form.control as unknown as Control<EmployeeFormData>
                            }
                            name="documents.vehicleFront"
                            render={({ field: { onChange, ...field } }) => (
                              <FormItem>
                                <FormLabel>Vehicle Front</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                      {imagePreview.vehicleFront ? (
                                        <img
                                          src={imagePreview.vehicleFront}
                                          alt="Vehicle Front Preview"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Upload className="w-6 h-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          onChange(file);
                                          handleImageUpload(
                                            file,
                                            "vehicleFront"
                                          );
                                        }}
                                        className="flex-1"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Max size: 5MB. Supported formats: JPG,
                                        PNG
                                      </p>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={
                              form.control as unknown as Control<EmployeeFormData>
                            }
                            name="documents.vehicleBack"
                            render={({ field: { onChange, ...field } }) => (
                              <FormItem>
                                <FormLabel>Vehicle Back</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                      {imagePreview.vehicleBack ? (
                                        <img
                                          src={imagePreview.vehicleBack}
                                          alt="Vehicle Back Preview"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Upload className="w-6 h-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          onChange(file);
                                          handleImageUpload(
                                            file,
                                            "vehicleBack"
                                          );
                                        }}
                                        className="flex-1"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Max size: 5MB. Supported formats: JPG,
                                        PNG
                                      </p>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Details Section */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Other Details
                  </h3>
                  {/* Date of Joining */}
                  <FormField
                    control={form.control}
                    name="dateOfJoining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="w-full h-12 px-3 border rounded flex items-center justify-between text-left bg-white"
                              >
                                {field.value
                                  ? format(new Date(field.value), "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="w-4 h-4 ml-2 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}-${String(
                                          date.getDate()
                                        ).padStart(2, "0")}`
                                      : ""
                                  );
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Salary Amount */}
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="h-12 border rounded px-3"
                          >
                            {Array.from({ length: 30 }, (_, i) => (
                              <option
                                key={i + 1}
                                value={i + 1}
                                className="px-2"
                              >
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Section */}
              <div className="flex justify-between pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 h-10 px-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    type="submit"
                    onClick={() => {
                      onSubmit(form.getValues());
                    }}
                    className="h-10 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    // disabled={!canProceedToNextStep()}
                  >
                    {isSubmittingEmployeeData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToNextStep()}
                    className="flex items-center space-x-2 h-10 px-6"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>
      {/* Aadhar Verification Sheet */}

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

export default AddEmployee;
