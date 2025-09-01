import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, CircleX, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const aadharFormSchema = z.object({
  aadharNumber: z
    .string()
    .min(12, "Aadhar number must be 12 digits")
    .max(12, "Aadhar number must be 12 digits")
    .regex(/^\d{12}$/, "Aadhar number must contain only digits"),
  captcha: z.string().min(1, "Captcha is required"),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type AadharFormData = z.infer<typeof aadharFormSchema>;
type AadharDataType = {
  profile_image?: string;
  full_name: string;
  gender: string;
  dob: string;
  aadhaar_number?: string;
  address: {
    house?: string;
    street?: string;
    loc?: string;
    vtc?: string;
    dist?: string;
    state?: string;
    country?: string;
  };
};

interface DesktopAadharSheetProps {
  onFormSubmit?: (data: {
    formData: AadharFormData;
    aadharDetails: AadharDataType | null;
  }) => void;
  onFormFail?: () => void;
  triggerText?: string;
  initialData?: Partial<AadharFormData>;
}

const DesktopAadharSheet = ({
  onFormSubmit,
  onFormFail,
  triggerText = "Verify Aadhar",
  initialData = {},
}: DesktopAadharSheetProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const totalSteps = 4;
  const [captchaText, setCaptchaText] = useState<string>("");
  const [aadharRequestId, setAadharRequestId] = useState("");
  const [aadharOtpSent, setIsAadharOtpSent] = useState(false);
  const [aadharOTPSending, setAadharOTPSending] = useState(false);
  const [aadharDetails, setAadharDetails] = useState<any>(null);
  const [aadharOTPVerificationPassed, setAadharOTPVerificationPassed] =
    useState(false);
  const [aadharDataLoading, setAadharDataLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const isFormDirty = () => {
    const values = form.getValues();
    return (
      values.aadharNumber !== "" ||
      values.captcha !== "" ||
      values.fullName !== "" ||
      values.phoneNumber !== "" ||
      values.otp !== "" ||
      currentStep > 1
    );
  };

  // Initialize form with Zod schema
  const form = useForm<AadharFormData>({
    resolver: zodResolver(aadharFormSchema),
    defaultValues: {
      aadharNumber: "",
      captcha: "",
      fullName: "",
      phoneNumber: "",
      otp: "",
      ...initialData,
    },
    mode: "onChange",
  });

  // Generate a random 5-character captcha
  const generateCaptcha = () => {
    let uniqueChar = "";
    const randomchar =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 5; i++) {
      uniqueChar += randomchar.charAt(
        Math.floor(Math.random() * randomchar.length)
      );
    }
    setCaptchaText(uniqueChar);
  };

  useEffect(() => {
    if (currentStep === 2) {
      generateCaptcha();
    }
  }, [currentStep]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form to initial values
      form.reset({
        aadharNumber: "",
        captcha: "",
        fullName: "",
        phoneNumber: "",
        otp: "",
        ...initialData, // Restore any initial data if provided
      });
      
      // Reset all component state
      setCurrentStep(1);
      setCaptchaText("");
      setAadharRequestId("");
      setIsAadharOtpSent(false);
      setAadharOTPSending(false);
      setAadharDetails(null);
      setAadharOTPVerificationPassed(false);
      setAadharDataLoading(false);
      
      // Clear any form errors
      form.clearErrors();
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    const formData = form.getValues();
    onFormSubmit?.({
      formData,
      aadharDetails 
    });
    setIsOpen(false);
  };

  // Handle form submission failure
  const handleFormFailure = () => {
    onFormFail?.();
    setIsOpen(false);
  };

  // Render step-specific form fields
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Enter Aadhar Number</h3>
              <p className="text-gray-600">Please enter your 12-digit Aadhar number</p>
            </div>
            <FormField
              control={form.control}
              name="aadharNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    Aadhar Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your 12-digit Aadhar number"
                      className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      {...field}
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Captcha Verification</h3>
              <p className="text-gray-600">Please enter the captcha below</p>
            </div>
            
            {/* Captcha Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="font-medium text-gray-700 mb-4">Captcha Verification</p>
              <div
                className="mx-auto my-4 py-3 px-6 rounded border border-gray-400 select-none font-mono text-2xl bg-white shadow-sm"
                style={{ width: "fit-content" }}
              >
                {captchaText}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateCaptcha}
                className="mt-2"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Captcha
              </Button>
            </div>
            
            {/* Captcha Input Field */}
            <FormField
              control={form.control}
              name="captcha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    Enter Captcha
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter captcha text"
                      className="h-12 text-base text-center border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Verified Message */}
            {form.watch("captcha") === captchaText && form.watch("captcha") !== "" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm font-medium text-center">
                  ✅ Captcha Verified!
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">OTP Verification</h3>
              <p className="text-gray-600">An otp has been sent to your mobile number registered with your Aadhar number</p>
            </div>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    Enter OTP
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the 6-digit OTP"
                      className="h-12 text-base text-center border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 tracking-widest"
                      {...field}
                      maxLength={6}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center">
              <Button type="button" variant="link" className="text-sm">
                Didn't receive OTP? Resend
              </Button>
            </div>
          </div>
        );

      case 4:
        return aadharDataLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Aadhar details...</p>
            </div>
          </div>
        ) : (
          <>
            {aadharDetails ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Verify Aadhar Details</h3>
                  <p className="text-gray-600">Please verify the details match your physical Aadhar card</p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 text-sm rounded">
                  <p className="font-semibold text-center">
                    ⚠️ Please match aadhar details with physical copy
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                  {aadharDetails.profile_image && (
                    <div className="flex justify-center">
                      <div className="w-32 h-40 border border-gray-400 rounded">
                        <img
                          src={`data:image/jpeg;base64,${aadharDetails.profile_image}`}
                          alt="Aadhar Profile"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Full Name</p>
                        <p className="text-base font-semibold text-gray-900">
                          {aadharDetails.full_name}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Gender</p>
                        <p className="text-base font-semibold text-gray-900">
                          {aadharDetails.gender === "M" ? "Male" : "Female"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                        <p className="text-base font-semibold text-gray-900">
                          {aadharDetails.dob}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Address</p>
                        <p className="text-base text-gray-900 leading-relaxed">
                          {[
                            aadharDetails.address.house,
                            aadharDetails.address.street,
                            aadharDetails.address.loc,
                            aadharDetails.address.vtc,
                            aadharDetails.address.dist,
                            aadharDetails.address.state,
                            aadharDetails.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">No Aadhar data available.</p>
                <p className="text-sm">Please try again later.</p>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

const handleProceed = async () => {
  switch (currentStep) {
    case 1:
      const isAadharValid = await form.trigger("aadharNumber");
      if (isAadharValid) {
        setCurrentStep(2);
      }
      break;
      
    case 2:
      const captchaValid = form.watch("captcha") === captchaText && form.watch("captcha") !== "";
      if (!captchaValid) {
        form.setError("captcha", { type: "manual", message: "Please enter the correct captcha" });
        return;
      }

      if (aadharOtpSent) {
        // OTP already sent, just move to next step
        setCurrentStep(3);
        return;
      }

      // Send OTP
      try {
        setAadharOTPSending(true);
        const res = await fetch(`/api/aadhar/generate-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_number: form.getValues("aadharNumber") }),
        });
        const data = await res.json();
        
        if (res.ok && data.status_code === 200 && data.request_id) {
          setAadharRequestId(data.request_id);
          setIsAadharOtpSent(true);
          toast.success("OTP sent successfully!");
          setCurrentStep(3);
        } else {
          toast.error("Failed to generate OTP. Please try again.");
        }
      } catch (error) {
        toast.error("Failed to generate OTP. Please try again.");
      } finally {
        setAadharOTPSending(false);
      }
      break;
      
    case 3:
      const isOtpValid = await form.trigger("otp");
      if (!isOtpValid) return;

      if (aadharOTPVerificationPassed && aadharDetails) {
        // Already verified, just move to next step
        setCurrentStep(4);
        return;
      }

      // Verify OTP
      try {
        setAadharDataLoading(true);
        const res = await fetch("/api/aadhar/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: aadharRequestId,
            otp: form.getValues("otp"),
          }),
        });
        const data = await res.json();
        
        if (res.ok && data.status_code === 200 && data.data) {
          setAadharDetails(data.data);
          setAadharOTPVerificationPassed(true);
          toast.success("OTP verified successfully!");
          setCurrentStep(4);
        } else {
          toast.error("Invalid OTP. Please try again.");
        }
      } catch (error) {
        toast.error("Failed to verify OTP. Please try again.");
      } finally {
        setAadharDataLoading(false);
      }
      break;
      
    default:
      break;
  }
};
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="hidden lg:block">
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to close?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost if you close this form. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCloseDialog(false);
                handleOpenChange(false);
              }}
            >
              Yes, Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button className="w-full">{triggerText}</Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-2xl p-4" side="left">
          <SheetHeader className="space-y-3">
            <SheetTitle className="text-2xl font-bold">
              Aadhar Verification - Step {currentStep} of {totalSteps}
            </SheetTitle>
            <SheetDescription>
              Complete the verification process to authenticate your Aadhar details
            </SheetDescription>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form className="flex-1 flex flex-col h-full">
              {/* Step Content */}
              <div className="flex-1 py-6 overflow-y-auto">
                {renderStepContent()}
              </div>

              {/* Bottom Navigation */}
              {currentStep <= totalSteps - 1 && (
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProceed}
                    disabled={aadharOTPSending}
                    className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {aadharOTPSending ? "Sending..." : "Proceed"}
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {currentStep === totalSteps && (
                <div className="flex justify-between items-center pt-6 border-t gap-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleFormFailure}
                    className="flex items-center gap-2 flex-1"
                  >
                    <CircleX size={16} />
                    Reject & Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFormSuccess}
                    className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✅ Verify & Continue
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DesktopAadharSheet;