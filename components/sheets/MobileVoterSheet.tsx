import {
  Sheet,
  SheetContent,
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

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, CircleX } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

// Zod schema for the Voter ID verification form
const voterIdFormSchema = z.object({
  epicNumber: z
    .string()
    .min(10, "EPIC number must be at least 10 characters")
    .max(10, "EPIC number must be exactly 10 characters")
    .regex(
      /^[A-Z]{3}[0-9]{7}$/,
      "EPIC number format: ABC1234567 (3 letters + 7 numbers)"
    ),
});

type VoterIdFormData = z.infer<typeof voterIdFormSchema>;
type VoterIdDataType = {
  name?: string;
  gender?: string;
  age?: string;
  epic_no?: string;
  state?: string;
  district?: string;
  assembly_constituency?: string;
  polling_station?: string;
  relation_name?: string;
  relation_type?: string;
  area?: string;
  part_number?: string;
  parliamentary_constituency?: string;
  section_no?: string;
  part_name?: string;
  slno_inpart?: string;
};

interface MobileVoterIdSheetProps {
  onFormSubmit?: (data: {
    formData: VoterIdFormData;
    voterIdDetails: VoterIdDataType | null;
  }) => void;
  onFormFail?: () => void;
  triggerText?: string;
  initialData?: Partial<VoterIdFormData>;
}

const MobileVoterIdSheet = ({
  onFormSubmit,
  onFormFail,
  triggerText = "Open Voter ID Verification",
  initialData = {},
}: MobileVoterIdSheetProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const totalSteps = 2;
  const [voterIdDetails, setVoterIdDetails] = useState<VoterIdDataType | null>(
    null
  );
  const [voterIdDataLoading, setVoterIdDataLoading] = useState(false);
  const [voterIdVerificationPassed, setVoterIdVerificationPassed] =
    useState(false);

  const isFormDirty = () => {
    const values = form.getValues();
    return values.epicNumber !== "" || currentStep > 1;
  };

  // Initialize form with Zod schema
  const form = useForm<VoterIdFormData>({
    resolver: zodResolver(voterIdFormSchema),
    defaultValues: {
      epicNumber: "",
      ...initialData,
    },
    mode: "onChange",
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form to initial values
      form.reset({
        epicNumber: "",
        ...initialData, // Restore any initial data if provided
      });

      // Reset all component state
      setCurrentStep(1);
      setVoterIdDetails(null);
      setVoterIdDataLoading(false);
      setVoterIdVerificationPassed(false);

      // Clear any form errors
      form.clearErrors();
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    const formData = form.getValues();
    onFormSubmit?.({
      formData,
      voterIdDetails,
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
          <FormField
            control={form.control}
            name="epicNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-500">
                  EPIC Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your EPIC number (e.g., ABC1234567)"
                    className="font-sans mt-3 border-gray-500/60 focus-visible:border-blue-500 focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:ring-0 h-12 uppercase"
                    {...field}
                    maxLength={10}
                    onChange={(e) => {
                      let value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");
                      // Format: 3 letters + 7 numbers
                      if (value.length <= 3) {
                        value = value.replace(/[^A-Z]/g, "");
                      } else {
                        const letters = value
                          .substring(0, 3)
                          .replace(/[^A-Z]/g, "");
                        const numbers = value
                          .substring(3, 10)
                          .replace(/[^0-9]/g, "");
                        value = letters + numbers;
                      }
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 3 letters followed by 7 numbers (ABC1234567)
                </p>
              </FormItem>
            )}
          />
        );

      case 2:
        return voterIdDataLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading voter data...</span>
          </div>
        ) : (
          <>
            {voterIdDetails ? (
              <div className="space-y-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 text-sm rounded mb-4 font-semibold text-center">
                  Please match voter ID details with physical copy
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
                 
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base md:text-lg">
                      Personal Information
                    </h4>
                    <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Full Name
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.name}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            EPIC Number
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.epic_no}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Gender
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.gender === "M"
                              ? "Male"
                              : voterIdDetails.gender === "F"
                              ? "Female"
                              : voterIdDetails.gender}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Age
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.age || "-"}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            State
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.state}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            District
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.district}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Assembly Constituency
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.assembly_constituency}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Polling Station
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.polling_station}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Relation Name
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.relation_name}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Relation Type
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.relation_type}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Area
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.area}
                          </p>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-lg border">
                          <p className="text-xs md:text-sm text-gray-500">
                            Part Number
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {voterIdDetails.part_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  {/* <div className="space-y-2">
                    <h4 className="font-semibold text-base md:text-lg">
                      Other Details
                    </h4>
                    <div className="bg-white rounded-lg p-3 md:p-4 border grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">
                          Parliamentary Constituency
                        </span>
                        <div className="font-medium text-sm">
                          {voterIdDetails.parliamentary_constituency}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          Section No
                        </span>
                        <div className="font-medium text-sm">
                          {voterIdDetails.section_no}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Part Name</span>
                        <div className="font-medium text-sm">
                          {voterIdDetails.part_name}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          Serial No in Part
                        </span>
                        <div className="font-medium text-sm">
                          {voterIdDetails.slno_inpart}
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No voter ID data available. Please try again later.
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  // ...existing code...

  const handleProceed = async () => {
    switch (currentStep) {
      case 1:
        const isEpicValid = await form.trigger("epicNumber");
        if (!isEpicValid) return;

    

        if (voterIdVerificationPassed && voterIdDetails) {
     
          setCurrentStep(2);
        
          return;
        }

        // Fetch Voter ID data
        try {
          setVoterIdDataLoading(true);
          const res = await fetch("/api/voterId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_number: form.getValues("epicNumber"),
            }),
          });
          const data = await res.json();
       

          if (res.ok && data.status === 200 && data.data) {
        
            setVoterIdDetails(data.data);
            setVoterIdVerificationPassed(true);


            toast.success("Voter ID data fetched successfully!");
            setCurrentStep(2);

           
          } else {
            toast.error(
              "Failed to fetch voter ID data. Please check the EPIC number."
            );
          }
        } catch (error) {
          toast.error("Failed to fetch voter ID data. Please try again.");
          console.error("API Error:", error);
        } finally {
          setVoterIdDataLoading(false);
        }
        break;

      default:
        break;
    }
  };

  // Also add useEffect to monitor state changes
  useEffect(() => {

  }, [currentStep, voterIdVerificationPassed, voterIdDetails]);

  // ...existing code...

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button className="mt-4 max-md:w-full">{triggerText}</Button>
        </SheetTrigger>
        <SheetContent
          className="w-full rounded-t-lg max-sm:h-[80vh] font-sans flex flex-col"
          side="bottom"
        >
          <SheetHeader>
            <SheetTitle className="text-xl">
              Step {currentStep} of {totalSteps}
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form className="flex-1 flex flex-col">
              {/* Step Content */}
              <div className="mt-1 px-4 flex-1 overflow-y-auto">
                {renderStepContent()}
              </div>

              {/* Bottom Navigation */}
              {currentStep <= totalSteps - 1 && (
                <div className="bg-white p-4 border-t flex justify-between items-center">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-1 h-12 w-1/3 border-blue-500 border text-blue-500 bg-white hover:bg-blue-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProceed}
                    disabled={voterIdDataLoading}
                    className="flex items-center gap-1 w-1/3 h-12 bg-blue-500 hover:bg-blue-600"
                  >
                    {voterIdDataLoading ? "Loading..." : "Proceed"}
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {currentStep === totalSteps && (
                <div className="bg-white px-4 pt-4 pb-7 border-t flex w-full justify-between items-center">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleFormFailure}
                    className="flex items-center gap-1 h-12 w-1/4"
                  >
                    <CircleX size={16} />
                    Fail
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFormSuccess}
                    className="flex items-center gap-1 h-12 w-1/4 bg-blue-600 hover:bg-blue-600"
                  >
                    Pass
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

export default MobileVoterIdSheet;
