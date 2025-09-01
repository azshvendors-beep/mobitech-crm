"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  X,
  Smartphone,
  Calendar,
  Cpu,
  HardDrive,
  Battery,
  Monitor,
  Camera,
  Wifi,
  Shield,
  Star,
  Info,
  Upload,
  Crop,
  RefreshCw,
  CheckCircle,
  MessageCircle,
  Loader2,
  FileText,
  CircleCheck,
} from "lucide-react";
import {
  CustomSheet,
  CustomSheetContent,
} from "./mobitech/custom-shadcn-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactCrop, { Crop as CropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";
import type { SignatureCanvas as SignatureCanvasType } from "react-signature-canvas";
import Webcam from "react-webcam";
import useResizeObserver from "@react-hook/resize-observer";
import dynamic from "next/dynamic";

const WebcamComponent = () => <Webcam />;

interface DeviceDetailsSheetProps {
  device: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Add new interface for manual QC sheet
interface ManualQCSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const imeiRegex = /^[0-9]{15}$/;

const variantSchema = z.object({
  variant: z.string().min(1, "Please select a variant"),
  imei1: z.string().regex(imeiRegex, "IMEI 1 must be a 15-digit number"),
  imei2: z
    .string()
    .optional()
    .refine((val) => !val || imeiRegex.test(val), {
      message: "IMEI 2 must be a 15-digit number",
    }),
  deviceFrontImage: z.string().optional(),
  deviceBackImage: z.string().optional(),
  diagnosticsProcess: z.enum(["app", "manual"]),
  qcReport: z
    .string()
    .optional()
    .refine(
      (val) => {
        return true;
      },
      {
        message: "Please select a QC report",
      }
    ),
  // New QC report fields
  repairRequired: z.enum(["yes", "no"]),
  accessories: z.enum(["only_charger", "only_box", "box_and_charger", "not_available"]),
  deviceAge: z.enum(["below_3_months", "3_to_6_months", "6_to_11_months", "above_11_months"]),
  warrantyType: z.enum([
    "brand_warranty",
    "3_month_xtracover",
    "not_applicable",
    "5_days_checking",
  ]).optional(),
  hasGstBill: z.enum(["available", "not_available"]),
  gstInvoice: z.string().optional(),
  boxImeiMatch: z.enum(["yes", "not_available"]),
  // Customer details fields
  customerName: z.string().min(1, "Customer name is required"),
  mobileNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
  addressProofType: z.enum(["aadhar", "voter_id"]),
  aadharNumber: z
    .string()
    .regex(/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number")
    .optional(),
  aadharFrontImage: z.string().optional(),
  aadharBackImage: z.string().optional(),
  epicNumber: z.string().optional(),
  voterIdFrontImage: z.string().optional(),
  voterIdBackImage: z.string().optional(),
  customerSignature: z.string().min(1, "Customer signature is required"),
  deviceReset: z.enum(["done", "not_done"]),
});

type VariantForm = z.infer<typeof variantSchema>;

// Add new component for Manual QC Sheet
const ManualQCSheet: React.FC<ManualQCSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <CustomSheet open={isOpen} onOpenChange={onOpenChange}>
      <CustomSheetContent
        side="right"
        className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] p-0 bg-gradient-to-br from-slate-50 to-gray-100"
      >
        <div className="flex flex-col h-full max-h-screen">
          <SheetHeader className="px-6 py-6 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold text-gray-900 truncate">
                      Manual QC Process
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Manual Quality Check
                      </Badge>
                    </div>
                  </div>
                </div>
                <SheetDescription className="text-sm text-gray-600">
                  Complete the manual quality check process
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Add your manual QC form here */}
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        QC Checklist
                      </h3>
                    </div>

                    {/* QC form fields will go here */}
                    <p className="text-sm text-gray-500">
                      QC form fields will go here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 shadow-sm"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Complete QC
              </Button>
            </div>
          </div>
        </div>
      </CustomSheetContent>
    </CustomSheet>
  );
};

// Utility to detect mobile device
function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
}

const ImageUploadField = ({
  label,
  name,
  value,
  onChange,
  onRemove,
  onCamera,
  onGallery,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onCamera: () => void;
  onGallery: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click();
    } else {
      onCamera();
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel className="text-sm font-medium text-gray-700">
        {label}
      </FormLabel>
      <div className="relative aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {value ? (
          <div className="relative h-full">
            <Image src={value} alt={label} fill className="object-cover" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
            <Camera className="h-8 w-8 text-gray-400" />
            <div className="flex gap-2 flex-col">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCameraClick}
                className="w-[150px] md:hidden"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onGallery(e, name)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onGallery(e, name)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Gallery
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DeviceDetailsSheet: React.FC<DeviceDetailsSheetProps> = ({
  device,
  isOpen,
  onOpenChange,
}) => {
  // All hooks at the top
  const [signatureRef, setSignatureRef] =
    React.useState<SignatureCanvasType | null>(null);
  const [isSignatureLocked, setIsSignatureLocked] = React.useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const [devices, setDevices] = React.useState<MediaDevice[]>([]);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [imageType, setImageType] = React.useState<"front" | "back">("front");
  const [crop, setCrop] = React.useState<CropType>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);
  const [cropMode, setCropMode] = React.useState(false);
  const [tempImage, setTempImage] = React.useState<string | null>(null);
  const [qcReports, setQcReports] = React.useState<
    Array<{ id: string; testId: string; createdAt: string }>
  >([]);
  const [isLoadingQcReports, setIsLoadingQcReports] = React.useState(false);
  const [manualQCSheetOpen, setManualQCSheetOpen] = React.useState(false);
  const [isAadharSheetOpen, setIsAadharSheetOpen] = React.useState(false);
  const [isVoterIdSheetOpen, setIsVoterIdSheetOpen] = React.useState(false);
  const [aadharData, setAadharData] = React.useState<any>(null);
  const [isLoadingAadharData, setIsLoadingAadharData] = React.useState(false);
  const [aadharVerified, setAadharVerified] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [requestId, setRequestId] = React.useState<string>("");
  const [otpInput, setOtpInput] = React.useState("");
  const [currentImageField, setCurrentImageField] = React.useState<
    null | string
  >(null);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] =
    React.useState(false);
  const [canvasSize, setCanvasSize] = React.useState({ width: 0, height: 0 });
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = React.useState(false);
  const [qrScanResult, setQrScanResult] = React.useState<string | null>(null);
  const [qrLoading, setQrLoading] = React.useState(false);
  const [qrError, setQrError] = React.useState<string | null>(null);
  const [manualEntry, setManualEntry] = React.useState(false);
  const [manualTestId, setManualTestId] = React.useState("");
  const [manualLoading, setManualLoading] = React.useState(false);
  const [qcReportData, setQcReportData] = React.useState<any>(null);

  const form = useForm<VariantForm>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      variant: "",
      imei1: "",
      imei2: "",
      deviceFrontImage: "",
      deviceBackImage: "",
      diagnosticsProcess: undefined,
      qcReport: undefined,
    },
  });

  // MediaDevice interface
  interface MediaDevice {
    deviceId: string;
    kind: string;
    label: string;
    groupId: string;
  }

  // Device enumeration
  const handleDevices = React.useCallback(
    (mediaDevices: MediaDevice[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );
  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);
  const backcamera = devices.find((device) =>
    device.label.toLowerCase().includes("back")
  );

  // Effects
  React.useEffect(() => {
    const fetchQcReports = async () => {
      if (form.watch("diagnosticsProcess") === "app") {
        setIsLoadingQcReports(true);
        try {
          const response = await fetch("/api/qc-reports");
          const data = await response.json();
          setQcReports(data);
        } catch (error) {
          console.error("Error fetching QC reports:", error);
          toast.error("Failed to load QC reports");
        } finally {
          setIsLoadingQcReports(false);
        }
      }
    };
    fetchQcReports();
  }, [form.watch("diagnosticsProcess")]);

  const captureImage = React.useCallback(() => {
    if (webcamRef.current && currentImageField) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        form.setValue(currentImageField as any, imageSrc);
        setCameraOpen(false);
        setCurrentImageField(null);
      } else {
        toast.error("Failed to capture image");
      }
    }
  }, [webcamRef, currentImageField, form]);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        form.setValue(
          fieldName as keyof VariantForm,
          e.target?.result as string
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (formValue: VariantForm) => {
    if (tempImage) {
      const croppedImage = tempImage;
      form.setValue(formValue as any, croppedImage);
      setCropMode(false);
      setTempImage(null);
    }
  };

  const getCleanImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder-device.png";
    if (imageUrl.includes("gsmarena.com")) {
      return imageUrl.replace(
        "https://www.gsmarena.com/https://fdn2.gsmarena.com/",
        "https://fdn2.gsmarena.com/"
      );
    }
    return imageUrl;
  };

  React.useLayoutEffect(() => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, [isSignatureDialogOpen]);

  useResizeObserver(canvasContainerRef, (entry) => {
    setCanvasSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });

  if (!device) return null;

  const verifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) {
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
          otp: otpInput,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.status_code === 200) {
        setAadharData(data.data);
        setIsLoadingAadharData(false);
      } else {
        toast.error(data.message || "Invalid OTP");
        setIsLoadingAadharData(false);
      }
    } catch (error) {
      console.log("Error verifying OTP:", error);
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
    setOtpInput("");
    setAadharData(null);
    setRequestId("");
  };

  const onSubmit = (values: VariantForm) => {
    console.log("Submit Values:", values);
   
  };

  const videoConstraints = {
    width: 1280,
    // height: 720,
  };

  const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
    ssr: false,
  });

  // Handler to fetch QC report by testId
  const fetchQcReportByTestId = async (testId: string) => {
    setQrLoading(true);
    setQrError(null);
    setQcReportData(null);
    try {
      const res = await fetch("/api/qc-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      if (!res.ok) throw new Error("No report found");
      const data = await res.json();
      if (!data || data === false) {
        setQrError("No report found");
        setQcReportData(null);
      } else {
        setQcReportData(data);
        form.setValue("qcReport", testId);
        setTimeout(() => {
          setIsQRDialogOpen(false);
          setTimeout(() => {
            setQrScanResult(null);
            setQrError(null);
            setQcReportData(null);
            setManualEntry(false);
            setManualTestId("");
          }, 300);
        }, 500);
      }
    } catch (err: any) {
      setQrError("No report found");
      setQcReportData(null);
    } finally {
      setQrLoading(false);
      setManualLoading(false);
    }
  };

  // Handler for QR scan
  const handleQRUpdate = (err: any, result: any) => {
    if (result && result.text) {
      setQrScanResult(result.text);
      fetchQcReportByTestId(result.text);
    }
  };

  // Handler for manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTestId.trim()) {
      setManualLoading(true);
      fetchQcReportByTestId(manualTestId.trim());
    }
  };

  return (
    <>
      <Sheet open={isAadharSheetOpen} onOpenChange={setIsAadharSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] md:h-full w-full p-0 md:max-w-md overflow-y-auto"
        >
          <SheetHeader className="sticky top-0 bg-white z-10 p-6 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center space-x-2 text-xl">
                <FileText className="w-5 h-5" />
                <span>Aadhar Verification</span>
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAadharSheetOpen(false)}
                className="rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100%-80px)]">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoadingAadharData ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>Verifying OTP...</p>
                </div>
              ) : aadharData ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
                    {aadharData.profile_image && (
                      <div className="flex justify-center">
                        <div className="w-28 h-36 md:w-32 md:h-36   border-4 border-blue-200">
                          <img
                            src={`data:image/jpeg;base64,${aadharData.profile_image}`}
                            alt="Aadhar Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base md:text-lg">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Full Name
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharData.full_name}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Gender
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharData.gender === "M" ? "Male" : "Female"}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Date of Birth
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharData.dob}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Aadhar Number
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharData.aadhaar_number}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-base md:text-lg">
                        Address Details
                      </h4>
                      <div className="bg-white rounded-lg p-3 md:p-4 border">
                        <p className="text-sm md:text-base whitespace-pre-wrap">
                          {[
                            aadharData.address.house,
                            aadharData.address.street,
                            aadharData.address.loc,
                            aadharData.address.vtc,
                            aadharData.address.dist,
                            aadharData.address.state,
                            aadharData.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg md:text-xl">
                        Enter OTP
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base mt-2">
                        Please enter the OTP sent to your registered mobile
                        number
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="text-center text-xl md:text-2xl tracking-wider h-14 font-mono"
                    />

                    <Button
                      onClick={verifyOTP}
                      className="w-full h-12 text-base md:text-lg"
                      disabled={!otpInput || otpInput.length !== 6}
                    >
                      Verify OTP
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {aadharData && (
              <div className="border-t bg-white p-4 md:p-6">
                <div className="flex gap-4 max-w-md mx-auto">
                  <Button
                    variant="destructive"
                    onClick={() => handleAadharVerification("fail")}
                    className="flex-1 h-11 md:h-12 text-sm md:text-base"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAadharVerification("pass")}
                    className="flex-1 h-11 md:h-12 text-sm md:text-base bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CustomSheet open={isOpen} onOpenChange={onOpenChange}>
        <CustomSheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] p-0 bg-gradient-to-br from-slate-50 to-gray-100"
        >
          <div className="flex flex-col h-full max-h-screen">
            <SheetHeader className="px-6 py-6 bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 ">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <SheetTitle className="text-xl font-bold text-gray-900 truncate max-w-[200px]">
                        {device.model}
                      </SheetTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {device.brand && (
                          <Badge variant="secondary" className="text-xs">
                            {device.brand}
                          </Badge>
                        )}
                        {/* <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {device.detailedSpec?.chipset || ""}{" "}
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  <SheetDescription className="text-sm text-gray-600">
                    Complete device specifications and registration
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="px-2 py-6 space-y-6">
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="relative h-72 w-52 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
                        <Image
                          src={getCleanImageUrl(device.imageUrl || "")}
                          alt={device.model}
                          fill
                          className="object-contain p-6 z-20 relative"
                          sizes="(max-width: 640px) 208px, 208px"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-device.png";
                          }}
                        />
                      </div>
                    </div>

                    {device.releaseDate && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Released {device.releaseDate}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-3 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        Device Registration
                      </h3>
                    </div>

                    <Form {...form}>
                      <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                      >
                        {device.detailedSpec?.variants?.length > 0 && (
                          <FormField
                            control={form.control}
                            name="variant"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Select Variant
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-1 gap-3"
                                  >
                                    {device.detailedSpec.variants.map(
                                      (variant: any, idx: number) => (
                                        <FormItem
                                          key={variant.name}
                                          className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                                        >
                                          <FormControl>
                                            <RadioGroupItem
                                              value={variant.name}
                                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                            />
                                          </FormControl>
                                          <FormLabel className="font-medium text-gray-800 cursor-pointer flex-1">
                                            {variant.name}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    )}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="imei1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  IMEI 1
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter 15-digit IMEI"
                                    maxLength={15}
                                    className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="imei2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  IMEI 2
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter 15-digit IMEI"
                                    maxLength={15}
                                    className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">
                            Device Images
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm text-gray-600">
                                Device Front Image
                              </label>
                              <ImageUploadField
                                label="Front"
                                name="deviceFrontImage"
                                value={form.watch("deviceFrontImage") || ""}
                                onChange={(value) => {
                                  form.setValue("deviceFrontImage", value);
                                }}
                                onRemove={() => {
                                  form.setValue("deviceFrontImage", "");
                                }}
                                onCamera={() => {
                                  setCurrentImageField("deviceFrontImage");
                                  setCameraOpen(true);
                                }}
                                onGallery={handleFileSelect}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm text-gray-600">
                                Device Back Image
                              </label>
                              <ImageUploadField
                                label="Back"
                                name="deviceBackImage"
                                value={form.watch("deviceBackImage") || ""}
                                onChange={(value) => {
                                  form.setValue("deviceBackImage", value);
                                }}
                                onRemove={() => {
                                  form.setValue("deviceBackImage", "");
                                }}
                                onCamera={() => {
                                  setCurrentImageField("deviceBackImage");
                                  setCameraOpen(true);
                                }}
                                onGallery={handleFileSelect}
                              />
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="diagnosticsProcess"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Diagnostics Process
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // Clear QC report when switching processes
                                    if (value !== "app") {
                                      form.setValue("qcReport", undefined);
                                    }
                                  }}
                                  value={field.value}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="app"
                                        className="peer sr-only"
                                      />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50  bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <Smartphone className="h-5 w-5" />
                                        <span className="font-medium">App</span>
                                      </div>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="manual"
                                        className="peer sr-only"
                                      />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        <span className="font-medium">
                                          Manual
                                        </span>
                                      </div>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("diagnosticsProcess") === "app" && (
                          <FormField
                            control={form.control}
                            name="qcReport"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  QC Report
                                </FormLabel>
                                <div className="flex items-center gap-2 mb-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsQRDialogOpen(true)}
                                  >
                                    Scan QR for QC Report
                                  </Button>
                                </div>
                                <Select
                                  onValueChange={(val) => {
                                    console.log("QC Report changed:", val);
                                    field.onChange(val);
                                  }}
                                  value={field.value}
                                  disabled={isLoadingQcReports}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                      <SelectValue
                                        placeholder={
                                          isLoadingQcReports
                                            ? "Loading reports..."
                                            : "Select QC report"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="w-full max-h-[300px]">
                                    {qcReports.map((report) => (
                                      <SelectItem
                                        key={report.id}
                                        value={report.testId}
                                        className="flex flex-col items-start py-2"
                                      >
                                        <div className="flex items-center justify-between w-full space-x-4">
                                          <span className="font-medium">
                                            Test ID: {report.testId}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {report.createdAt}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {form.watch("diagnosticsProcess") === "app" &&
                          form.watch("qcReport") && (
                            <div className="space-y-6">
                              <FormField
                                control={form.control}
                                name="repairRequired"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Repair Required
                                    </FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-2 gap-4"
                                      >
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="yes"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              Yes
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="no"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              No
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="accessories"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Accessories
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select accessories" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="only_charger">
                                          Only Charger (Original)
                                        </SelectItem>
                                        <SelectItem value="only_box">
                                          Only Box
                                        </SelectItem>
                                        <SelectItem value="box_and_charger">
                                          Box and Charger Both
                                        </SelectItem>
                                        <SelectItem value="not_available">
                                          Not Available
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="deviceAge"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Device Age
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                          <SelectValue placeholder="Select device age" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="below_3_months">
                                          Below 3 months
                                        </SelectItem>
                                        <SelectItem value="3_to_6_months">
                                          3 months - 6 months
                                        </SelectItem>
                                        <SelectItem value="6_to_11_months">
                                          6 months - 11 months
                                        </SelectItem>
                                        <SelectItem value="above_11_months">
                                          Above 11 months
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {form.watch("deviceAge") ===
                                "above_11_months" && (
                                <FormField
                                  control={form.control}
                                  name="warrantyType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Warranty Type
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select additional warranty" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="brand_warranty">
                                            Brand Warranty
                                          </SelectItem>
                                          <SelectItem value="3_month_xtracover">
                                            3 Month XtraCover Warranty
                                          </SelectItem>
                                          <SelectItem value="not_applicable">
                                            Not Applicable
                                          </SelectItem>
                                          <SelectItem value="5_days_checking">
                                            5 Days checking warranty
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <FormField
                                control={form.control}
                                name="hasGstBill"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Do you have GST valid bill with the same
                                      IMEI?
                                    </FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-2 gap-4"
                                      >
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="available"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              Available
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="not_available"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              Not Available
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {form.watch("hasGstBill") === "available" && (
                                <FormField
                                  control={form.control}
                                  name="gstInvoice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Upload Invoice
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="file"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (e) => {
                                                field.onChange(
                                                  e.target?.result
                                                );
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <FormField
                                control={form.control}
                                name="boxImeiMatch"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                      Is Box IMEI and Device IMEI same?
                                    </FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-2 gap-4"
                                      >
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="yes"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              Yes
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                          <FormControl>
                                            <RadioGroupItem
                                              value="not_available"
                                              className="peer sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-medium">
                                              Not Available
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Customer Details
                                </h3>

                                <FormField
                                  control={form.control}
                                  name="customerName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Customer Name (Same as ID Proof) <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Enter customer name"
                                          className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="mobileNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Enter Mobile No <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Enter 10-digit mobile number"
                                          maxLength={10}
                                          className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="addressProofType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Select Address Proof*
                                      </FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          className="grid grid-cols-2 gap-4"
                                        >
                                          <FormItem>
                                            <FormControl>
                                              <RadioGroupItem
                                                value="aadhar"
                                                className="peer sr-only"
                                              />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                              <span className="font-medium">
                                                Aadhar Card
                                              </span>
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem>
                                            <FormControl>
                                              <RadioGroupItem
                                                value="voter_id"
                                                className="peer sr-only"
                                              />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                              <span className="font-medium">
                                                Voter ID
                                              </span>
                                            </FormLabel>
                                          </FormItem>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {form.watch("addressProofType") ===
                                  "aadhar" && (
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="aadharNumber"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-sm font-medium text-gray-700">
                                            Enter Aadhar Number
                                          </FormLabel>
                                          <div className="flex gap-2">
                                            <FormControl>
                                              <Input
                                                {...field}
                                                placeholder="Enter 12-digit Aadhar number"
                                                maxLength={12}
                                                className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                              />
                                            </FormControl>
                                            <Button
                                              type="button"
                                              onClick={async () => {
                                                if (
                                                  !field.value ||
                                                  field.value.length !== 12
                                                ) {
                                                  toast.error(
                                                    "Please enter a valid 12-digit Aadhar number"
                                                  );
                                                  return;
                                                }
                                                setIsVerifying(true);
                                                try {
                                                  const response = await fetch(
                                                    "/api/aadhar/generate-otp",
                                                    {
                                                      method: "POST",
                                                      headers: {
                                                        "Content-Type":
                                                          "application/json",
                                                      },
                                                      body: JSON.stringify({
                                                        id_number: field.value,
                                                      }),
                                                    }
                                                  );
                                                  const data =
                                                    await response.json();
                                                  if (
                                                    response.ok &&
                                                    data?.request_id
                                                  ) {
                                                    setRequestId(
                                                      data.request_id
                                                    );
                                                    setIsAadharSheetOpen(true);
                                                    toast.success(
                                                      "OTP sent successfully"
                                                    );
                                                  } else {
                                                    toast.error(
                                                      data?.message ||
                                                        "Failed to send OTP"
                                                    );
                                                  }
                                                } catch (error) {
                                                  toast.error(
                                                    "Error sending OTP. Please try again."
                                                  );
                                                } finally {
                                                  setIsVerifying(false);
                                                }
                                              }}
                                              disabled={isVerifying}
                                            >
                                              {isVerifying ? (
                                                <>
                                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                  Verifying...
                                                </>
                                              ) : (
                                                "Verify Aadhar"
                                              )}
                                            </Button>
                                          </div>
                                          <FormMessage />
                                          {aadharVerified && (
                                            <div className="flex items-center mt-2 text-sm text-green-600">
                                              <CheckCircle className="w-4 h-4 mr-1" />
                                              <span>
                                                Aadhar verified successfully
                                              </span>
                                            </div>
                                          )}
                                        </FormItem>
                                      )}
                                    />

                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name="aadharFrontImage"
                                        render={({ field }) => (
                                          <FormItem>
                                            <ImageUploadField
                                              label="Aadhar Front Image"
                                              name="aadharFrontImage"
                                              value={field.value || ""}
                                              onChange={field.onChange}
                                              onRemove={() =>
                                                field.onChange("")
                                              }
                                              onCamera={() => {
                                                setCurrentImageField(
                                                  "aadharFrontImage"
                                                );
                                                setCameraOpen(true);
                                              }}
                                              onGallery={handleFileSelect}
                                            />
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name="aadharBackImage"
                                        render={({ field }) => (
                                          <FormItem>
                                            <ImageUploadField
                                              label="Aadhar Back Image"
                                              name="aadharBackImage"
                                              value={field.value || ""}
                                              onChange={field.onChange}
                                              onRemove={() =>
                                                field.onChange("")
                                              }
                                              onCamera={() => {
                                                setCurrentImageField(
                                                  "aadharBackImage"
                                                );
                                                setCameraOpen(true);
                                              }}
                                              onGallery={handleFileSelect}
                                            />
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                )}

                                {form.watch("addressProofType") ===
                                  "voter_id" && (
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="epicNumber"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-sm font-medium text-gray-700">
                                            Enter EPIC Number
                                          </FormLabel>
                                          <div className="flex gap-2">
                                            <FormControl>
                                              <Input
                                                {...field}
                                                placeholder="Enter EPIC number"
                                                className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                              />
                                            </FormControl>
                                            <Button
                                              type="button"
                                              onClick={async () => {
                                                if (
                                                  !field.value ||
                                                  field.value.length !== 10
                                                ) {
                                                  toast.error(
                                                    "Please enter a valid 10-digit EPIC number"
                                                  );
                                                  return;
                                                }
                                                setIsVerifying(true);
                                                try {
                                                  const response = await fetch(
                                                    "/api/voterId",
                                                    {
                                                      method: "POST",
                                                      headers: {
                                                        "Content-Type":
                                                          "application/json",
                                                      },
                                                      body: JSON.stringify({
                                                        id_number: field.value,
                                                      }),
                                                    }
                                                  );
                                                  const data =
                                                    await response.json();
                                                  console.log(data);
                                                  if (
                                                    response.ok &&
                                                    console.log(data)
                                                  ) {
                                                    setIsVoterIdSheetOpen(true);
                                                  } else {
                                                    toast.error(
                                                      data?.message ||
                                                        "Failed to verify EPYC number"
                                                    );
                                                  }
                                                } catch (error) {
                                                  toast.error(
                                                    "Error checking EPYC number. Please try again."
                                                  );
                                                } finally {
                                                  setIsVerifying(false);
                                                }
                                              }}
                                              disabled={isVerifying}
                                            >
                                              {" "}
                                              {isVerifying ? (
                                                <>
                                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                  Verifying...
                                                </>
                                              ) : (
                                                "Verify Voter ID"
                                              )}
                                            </Button>
                                          </div>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name="voterIdFrontImage"
                                        render={({ field }) => (
                                          <FormItem>
                                            <ImageUploadField
                                              label="Voter ID Front Image"
                                              name="voterIdFrontImage"
                                              value={field.value || ""}
                                              onChange={field.onChange}
                                              onRemove={() =>
                                                field.onChange("")
                                              }
                                              onCamera={() => {
                                                setCurrentImageField(
                                                  "voterIdFrontImage"
                                                );
                                                setCameraOpen(true);
                                              }}
                                              onGallery={handleFileSelect}
                                            />
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name="voterIdBackImage"
                                        render={({ field }) => (
                                          <FormItem>
                                            <ImageUploadField
                                              label="Voter ID Back Image"
                                              name="voterIdBackImage"
                                              value={field.value || ""}
                                              onChange={field.onChange}
                                              onRemove={() =>
                                                field.onChange("")
                                              }
                                              onCamera={() => {
                                                setCurrentImageField(
                                                  "voterIdBackImage"
                                                );
                                                setCameraOpen(true);
                                              }}
                                              onGallery={handleFileSelect}
                                            />
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                )}

                                <FormField
                                  control={form.control}
                                  name="customerSignature"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Customer Signature
                                      </FormLabel>
                                      <div className="space-y-2">
                                        {/* Show preview if signature exists */}
                                        {field.value ? (
                                          <div className="flex flex-col gap-2 items-start">
                                            <div className="border border-gray-300 rounded-lg overflow-hidden w-40 h-24 bg-white">
                                              <img
                                                src={field.value}
                                                alt="Signature Preview"
                                                className="object-contain w-full h-full"
                                              />
                                            </div>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() =>
                                                setIsSignatureDialogOpen(true)
                                              }
                                            >
                                              E-sign
                                            </Button>
                                          </div>
                                        ) : (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              setIsSignatureDialogOpen(true)
                                            }
                                          >
                                            E-sign
                                          </Button>
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="deviceReset"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-gray-700">
                                        Have you reset the device?
                                      </FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          className="grid grid-cols-2 gap-4"
                                        >
                                          <FormItem>
                                            <FormControl>
                                              <RadioGroupItem
                                                value="done"
                                                className="peer sr-only"
                                              />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                              <span className="font-medium">
                                                Done
                                              </span>
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem>
                                            <FormControl>
                                              <RadioGroupItem
                                                value="not_done"
                                                className="peer sr-only"
                                              />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                              <span className="font-medium">
                                                Not Done
                                              </span>
                                            </FormLabel>
                                          </FormItem>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (form.watch("diagnosticsProcess") === "manual") {
                      // Validate all required fields
                      const values = form.getValues();
                      const errors = form.formState.errors;

                      // Check if any required field is empty or has errors
                      const hasErrors = Object.keys(errors).length > 0;
                      const isVariantEmpty = !values.variant;
                      const isImei1Empty = !values.imei1;
                      const isFrontImageEmpty = !values.deviceFrontImage;
                      const isBackImageEmpty = !values.deviceBackImage;

                      if (
                        hasErrors ||
                        isVariantEmpty ||
                        isImei1Empty ||
                        isFrontImageEmpty ||
                        isBackImageEmpty
                      ) {
                        // Trigger form validation to show error messages
                        form.trigger();
                        toast.error(
                          "Please fill in all required fields before proceeding to QC"
                        );
                        return;
                      }

                      // If all validations pass, open QC sheet
                      setManualQCSheetOpen(true);
                    } else {
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 shadow-sm"
                  size="sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {form.watch("diagnosticsProcess") === "manual"
                    ? "Proceed to QC"
                    : "Register Device"}
                </Button>
              </div>
            </div>
          </div>
        </CustomSheetContent>

        {/* Camera Dialog */}
        <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent className="sm:max-w-[425px] max-md:-max-h-screen">
            <DialogHeader>
              <DialogTitle>Take Photo</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden h-full">
              {/* <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              /> */}

              <Webcam
                audio={false}
                height={1920}
                ref={webcamRef}
                onUserMediaError={(error) => {
                  console.error(
                    "Error accessing webcam. Please check permissions.",
                    error
                  );
                }}
                className="w-full h-full object-cover"
                screenshotFormat="image/png"
                width={1280}
                videoConstraints={{
                  ...videoConstraints,
                  deviceId: backcamera ? backcamera.deviceId : undefined,
                }}
              />
              <span className="hidden">{backcamera?.label}</span>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCameraOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={captureImage}>
                  Capture
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Signature Fullscreen Dialog */}
        <Dialog
          open={isSignatureDialogOpen}
          onOpenChange={setIsSignatureDialogOpen}
        >
          <DialogContent className="max-w-full w-full h-[90vh] flex flex-col justify-center items-center p-0">
            <DialogHeader className="w-full px-4 pt-4">
              <DialogTitle>Sign Below</DialogTitle>
            </DialogHeader>
            <div
              ref={canvasContainerRef}
              className="relative w-full max-w-md mx-auto h-full flex-1 flex flex-col items-center justify-center"
              style={{ minHeight: 300, maxHeight: "calc(90vh - 60px)" }}
            >
              {canvasSize.width > 0 && canvasSize.height > 0 ? (
                <SignatureCanvas
                  ref={setSignatureRef}
                  canvasProps={{
                    className:
                      "w-full h-full border border-gray-300 rounded-lg bg-white",
                    width: canvasSize.width || 400,
                    height: canvasSize.height || 300,
                    style: {
                      width: "100%",
                      height: "100%",
                      minHeight: "300px",
                      maxHeight: "calc(90vh - 60px)",
                      pointerEvents: isSignatureLocked ? "none" : "auto",
                      touchAction: "none",
                    },
                  }}
                  onEnd={() => {
                    if (signatureRef) {
                      // Do not update field here, only on Done
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
              {/* Overlayed button group */}
              <div className="absolute bottom-4 left-0 w-full flex justify-center z-10">
                <div className="flex gap-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur border border-gray-200 shadow-md">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (signatureRef) {
                        signatureRef.clear();
                        setIsSignatureLocked(false);
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (signatureRef) {
                        setIsSignatureLocked(!isSignatureLocked);
                      }
                    }}
                  >
                    {isSignatureLocked ? "Unlock Signature" : "Lock Signature"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (signatureRef) {
                        const dataUrl = signatureRef.toDataURL();
                        form.setValue("customerSignature", dataUrl);
                        setIsSignatureDialogOpen(false);
                        setIsSignatureLocked(false);
                      }
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Scanner Dialog */}
        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Scan QC Report QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {!manualEntry && (
                <>
                  <div className="w-full flex justify-center">
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                      <BarcodeScanner
                        width={300}
                        height={300}
                        onUpdate={handleQRUpdate}
                        facingMode="environment"
                      />
                    </div>
                  </div>
                  {qrLoading && <p className="text-blue-500">Loading...</p>}
                  {qrError && <p className="text-red-500">{qrError}</p>}
                  {qcReportData && (
                    <div className="w-full bg-gray-50 rounded p-2 text-sm text-gray-700 flex items-center gap-2">
                      Fetched Report <CircleCheck className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-400">Closing...</span>
                    </div>
                  )}
                </>
              )}
              {/* Manual Entry Section */}
              {manualEntry && (
                <form
                  onSubmit={handleManualSubmit}
                  className="w-full flex flex-col gap-4"
                >
                  <Input
                    type="text"
                    placeholder="Enter Test ID manually"
                    value={manualTestId}
                    onChange={(e) => setManualTestId(e.target.value)}
                    className="w-full border-blue-500"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={manualLoading}
                  >
                    {manualLoading ? "Fetching..." : "Submit"}
                  </Button>
                  {qrError && <p className="text-red-500">{qrError}</p>}
                  {qcReportData && (
                    <div className="w-full bg-gray-50 rounded p-2 text-sm text-gray-700">
                      Fetched Report  <CircleCheck className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </form>
              )}
              {/* Toggle Manual Entry */}
              <div className="w-full flex flex-col items-center mt-4">
                {!manualEntry ? (
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => setManualEntry(true)}
                  >
                    Unable to scan? Enter Manually
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => setManualEntry(false)}
                  >
                    Back to QR Scan
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CustomSheet>

      {/* Manual QC Sheet */}
      <ManualQCSheet
        isOpen={manualQCSheetOpen}
        onOpenChange={setManualQCSheetOpen}
      />
    </>
  );
};

export default DeviceDetailsSheet;
