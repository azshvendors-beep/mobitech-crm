import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Plus,
  Users,
  ArrowLeft,
  ChevronRight,
  X,
  Calendar,
  Camera,
  Upload,
  Loader2,
  Trash,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  CustomSheet,
  CustomSheetContent,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/mobitech/custom-shadcn-sheet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/components/mobitech/image-upload-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createRandomId, PART_OPTIONS } from "@/constants/const";
import DesktopAadharSheet from "@/components/sheets/DesktopAadharSheet";
import MobileAadharSheet from "@/components/sheets/MobileAadharSheet";
import DesktopVoterIdSheet from "@/components/sheets/DesktopVoterSheet";
import MobileVoterIdSheet from "@/components/sheets/MobileVoterSheet";
import { toast } from "sonner";

interface Errors {
  [key: string]: string | null;
}

const formSchema = z.object({
  deviceBC: z.string().min(1, { message: "Device BC is required" }),
  // user: z.string().email({ message: "Invalid email address" }),
  entryDate: z.string().min(1, { message: "Entry Date is required" }),
  selectPartner: z.string().min(1, { message: "Select Partner is required" }),
  deviceSKU: z.string().optional(),
  deviceQc: z.string().min(1, { message: "Device QC is required" }),
  selectModel: z.string().min(1, { message: "Select Model is required" }),
  imei: z.string().min(1, { message: "IMEI is required" }),
  imei2: z.string().min(1, { message: "IMEI2 is required" }),
  variant: z.string().min(1, { message: "Variant is required" }),
  accesories: z.string().min(1, { message: "Accesories is required" }),
  warrantyType: z.string().min(1, { message: "Warranty Type is required" }),
  certificateId: z.string().optional(),
  availableIn: z.string().min(1, { message: "Available In is required" }),
  deviceFrontImage: z
    .string()
    .min(1, { message: "Device Front Image is required" }),
  deviceBackImage: z
    .string()
    .min(1, { message: "Device Back Image is required" }),
  orderId: z.string().min(1, { message: "Order ID is required" }),
  documentType: z.string().min(1, { message: "Document Type is required" }),
  customerImage: z.string().optional(),
  addressProofType: z.enum(["aadhar", "voter_id"], {
    error: "Please select an address proof type",
  }),
  aadharNumber: z
    .string()
    .regex(/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number")
    .optional(),
  aadharFrontImage: z.string().optional(),
  aadharBackImage: z.string().optional(),
  voterIdFrontImage: z.string().optional(),
  voterIdBackImage: z.string().optional(),
  isAadharVerified: z.boolean().optional(),
  voterIdVerified: z.boolean().optional(),
  gstInvoice: z.string().optional(),
  boxandimeisame: z
    .string()
    .min(1, { message: "Box and IMEI Same Field is required" }),
  purchaseAmount: z.string().min(1, { message: "Purchase Amount is required" }),
  deviceIssue: z.string().min(1, { message: "Device Issue is required" }),
  repairRequired: z
    .string()
    .min(1, { message: "Is Phone Need Repair is required" }),
  repairingAmount: z
    .string()
    .min(1, { message: "Repairing Amount is required" }),
  sellingPrice: z.string().min(1, { message: "Selling Price is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  repairStatus: z.enum(["pending", "completed"]).optional(),
  repairParts: z
    .array(
      z.object({
        name: z.string(),
        price: z.string(),
      })
    )
    .optional(),
  repairDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Partner Purchase Form Component
const PartnerPurchaseForm = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceBC: createRandomId(),
      // user: "",
      entryDate: "",
      selectPartner: "",
      deviceSKU: "",
      deviceQc: "",
      selectModel: "",
      imei: "",
      imei2: "",
      variant: "",
      accesories: "",
      warrantyType: "",
      certificateId: "",
      availableIn: "",
      deviceFrontImage: "",
      deviceBackImage: "",
      orderId: "",
      documentType: "",
      customerImage: undefined,
      addressProofType: undefined,
      aadharNumber: undefined,
      aadharFrontImage: undefined,
      aadharBackImage: undefined,
      voterIdFrontImage: undefined,
      voterIdBackImage: undefined,
      gstInvoice: undefined,
      boxandimeisame: "",
      purchaseAmount: "",
      deviceIssue: "",
      repairRequired: "",
      repairStatus: undefined,
      repairingAmount: "",
      sellingPrice: "",
      quantity: "",
      isAadharVerified: false,
      voterIdVerified: false,
      repairParts: [],
      repairDate: "",
    },
  });

  const [errors, setErrors] = useState<Errors>({});
  const [qcReports, setQcReports] = useState<any[]>([]);
  const [filteredQcReports, setFilteredQcReports] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [filteredVariants, setFilteredVariants] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageField, setCurrentImageField] = useState<null | string>(
    null
  );
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isVoterVerified, setIsVoterVerified] = useState(false);
  const [aadharVerificationData, setAadharVerificationData] =
    useState<any>(null);
  const [voterVerificationData, setVoterVerificationData] = useState<any>(null);

  const fecthSheetReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/qc-reports");
      const data = await response.json();
      setQcReports(data);
      setFilteredQcReports(data);

      const modelOptions = [
        { value: "iphone-14", label: "iPhone 14" },
        { value: "iphone-13", label: "iPhone 13" },
        { value: "iphone-12", label: "iPhone 12" },
        { value: "iphone-11", label: "iPhone 11" },
        { value: "iphone-10", label: "iPhone 10" },
        { value: "iphone-9", label: "iPhone 9" },
        { value: "iphone-8", label: "iPhone 8" },
        { value: "samsung-s23", label: "Samsung S23" },
        { value: "samsung-s22", label: "Samsung S22" },
        { value: "samsung-s21", label: "Samsung S21" },
        { value: "oneplus-11", label: "OnePlus 11" },
        { value: "oneplus-10", label: "OnePlus 10" },
        { value: "google-pixel-7", label: "Google Pixel 7" },
        { value: "google-pixel-6", label: "Google Pixel 6" },
      ];
      setFilteredModels(modelOptions);

      const variantOptions = [
        { value: "1GB - 8GB", label: "1GB - 8GB" },
        { value: "1.5GB - 16GB", label: "1.5GB - 16GB" },
        { value: "2GB - 16GB", label: "2GB - 16GB" },
        { value: "2GB - 32GB", label: "2GB - 32GB" },
        { value: "2.5GB - 64GB", label: "2.5GB - 64GB" },
        { value: "3GB - 16GB", label: "3GB - 16GB" },
        { value: "3GB - 32GB", label: "3GB - 32GB" },
        { value: "3GB - 64GB", label: "3GB - 64GB" },
        { value: "3GB - 128GB", label: "3GB - 128GB" },
        { value: "4GB - 32GB", label: "4GB - 32GB" },
        { value: "4GB - 64GB", label: "4GB - 64GB" },
        { value: "4GB - 128GB", label: "4GB - 128GB" },
        { value: "6GB - 64GB", label: "6GB - 64GB" },
        { value: "6GB - 128GB", label: "6GB - 128GB" },
        { value: "8GB - 128GB", label: "8GB - 128GB" },
        { value: "8GB - 256GB", label: "8GB - 256GB" },
        { value: "12GB - 256GB", label: "12GB - 256GB" },
        { value: "12GB - 512GB", label: "12GB - 512GB" },
      ];
      setFilteredVariants(variantOptions);
    } catch (error) {
      console.error("Error fetching QC reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fecthSheetReports();
  }, []);

  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  const handleCancel = () => {
    form.reset({
      deviceBC: createRandomId(),
      // user: "",
      entryDate: "",
      selectPartner: "",
      deviceSKU: "",
      selectModel: "",
      imei: "",
      imei2: "",
      variant: "",
      accesories: "",
      warrantyType: "",
      certificateId: "",
      availableIn: "",
      deviceFrontImage: "",
      deviceBackImage: "",
      orderId: "",
      documentType: "",
      customerImage: undefined,
      addressProofType: undefined,
      aadharNumber: undefined,
      aadharFrontImage: undefined,
      aadharBackImage: undefined,
      voterIdFrontImage: undefined,
      voterIdBackImage: undefined,
      isAadharVerified: false,
      voterIdVerified: false,
      gstInvoice: undefined,
      boxandimeisame: "",
      purchaseAmount: "",
      deviceIssue: "",
      repairRequired: "",
      repairStatus: undefined,
      repairingAmount: "",
      sellingPrice: "",
      quantity: "",
      repairParts: [],
      repairDate: "",
    });
    setErrors({});
    onClose();
  };

  const handleAadharSuccess = (aadharData: any) => {
    form.setValue("isAadharVerified", true);
    setAadharVerificationData(aadharData);
    setIsAadharVerified(true);
    toast.success("Aadhar verification completed successfully!");
  };

  const handleAadharFailure = () => {
    form.setValue("isAadharVerified", false);
    setIsAadharVerified(false);
    setAadharVerificationData(null);
    toast.error("Aadhar verification failed. Please try again.");
  };

  const handleVoterSuccess = (voterdata: any) => {
    setIsVoterVerified(true);
    setVoterVerificationData(voterdata);
    form.setValue("voterIdVerified", true);
    toast.success("Voter ID verification completed successfully!");
  };

  const handleVoterFailure = () => {
    setIsVoterVerified(false);
    setVoterVerificationData(null);
    form.setValue("voterIdVerified", false);
    toast.error("Voter ID verification failed. Please try again.");
  };

  if (!isOpen) return null;

  function RepairCompletedFields({ form }: { form: any }) {
    const [parts, setParts] = React.useState([{ name: "", price: "" }]);
    // Date/time state (integrate with form if needed)
    const [repairDate, setRepairDate] = React.useState("");

    // Save to form on change
    React.useEffect(() => {
      form.setValue("repairParts", parts);
      form.setValue("repairDate", repairDate);
    }, [parts, repairDate]);

    return (
      <div className="space-y-4 mt-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Repairing Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={repairDate}
            onChange={(e) => setRepairDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-3">
            Parts Used <sup className="text-red-600">*</sup>
          </label>
          {parts.map((part, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-2 mb-4 items-center "
            >
              <label className="text-xs font-semibold text-gray-600 mb-1 w-full md:w-auto">
                Part {idx + 1}
              </label>
              <Select
                value={part.name}
                onValueChange={(val) => {
                  const newParts = [...parts];
                  newParts[idx].name = val;
                  setParts(newParts);
                }}
              >
                <SelectTrigger className="flex-1 border border-gray-300 rounded px-2 py-2 w-full">
                  <SelectValue placeholder="Select Part Name" />
                </SelectTrigger>
                <SelectContent className="max-h-[240px] overflow-y-auto">
                  {PART_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded px-2 py-2 w-full"
                placeholder="Part Price"
                value={part.price}
                onChange={(e) => {
                  const newParts = [...parts];
                  newParts[idx].price = e.target.value;
                  setParts(newParts);
                }}
              />
              {parts.length > 1 && (
                <Button
                  variant="destructive"
                  type="button"
                  className=" px-2 py-1"
                  onClick={() => setParts(parts.filter((_, i) => i !== idx))}
                >
                  Remove <Trash />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full h-12"
            onClick={() => setParts([...parts, { name: "", price: "" }])}
          >
            Add More Parts <Plus />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col ">
          <CustomSheet open={isOpen} onOpenChange={onClose}>
            <CustomSheetContent
              className="w-full max-w-2xl "
              showConfirmation={true}
              onConfirmClose={handleCancel}
            >
              <CustomSheetHeader>
                <CustomSheetTitle className="text-xl font-semibold">
                  Partner Purchase
                </CustomSheetTitle>
              </CustomSheetHeader>
              <div className="flex flex-col gap-4 px-4 sm:px-10 overflow-y-auto flex-1 pb-5">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4 "
                  >
                    <FormField
                      control={form.control}
                      name="deviceBC"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Device BC <span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Device BC"
                            className="w-full"
                            readOnly
                          />
                        </FormItem>
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name="user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            User <span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="User"
                            className="w-full"
                            readOnly
                          />
                        </FormItem>
                      )}
                    /> */}
                    <FormField
                      control={form.control}
                      name="entryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Entry Date <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <Input
                              {...field}
                              type="date"
                              placeholder="dd-mm-yyyy"
                              className="w-full cursor-pointer"
                              onClick={(e) => {
                                e.currentTarget.showPicker?.();
                              }}
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="selectPartner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Select Partner{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Partner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cashify">Cashify</SelectItem>
                              <SelectItem value="recycle-device">
                                Recycle Device
                              </SelectItem>
                              <SelectItem value="flipkart-reset">
                                Flipkart Reset
                              </SelectItem>
                              <SelectItem value="deals-dray">
                                Deals Dray
                              </SelectItem>
                              <SelectItem value="hansh-technology">
                                Hansh Technology
                              </SelectItem>
                              <SelectItem value="xtra-cover">
                                Xtra Cover
                              </SelectItem>
                              <SelectItem value="local-store">
                                Local Store
                              </SelectItem>
                              <SelectItem value="mobi-trade">
                                Mobi Trade
                              </SelectItem>
                              <SelectItem value="mobitech-llp">
                                MOBITECHLLP
                              </SelectItem>
                              <SelectItem value="cashmen">Cashmen</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {form.watch("selectPartner") === "cashmen" && (
                      <div className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="deviceSKU"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                               Enter Device SKU{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Input
                                {...field}
                                placeholder="Device SKU"
                                className="w-full"
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="deviceQc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Device QC <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Device QC" />
                                {field.value && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange("");
                                    }}
                                    className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                  </button>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="p-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search QC reports..."
                                    className="pl-8 h-8 text-sm"
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const searchTerm =
                                        e.target.value.toLowerCase();
                                      if (searchTerm === "") {
                                        setFilteredQcReports(qcReports);
                                      } else {
                                        const filteredReports =
                                          qcReports.filter((report) =>
                                            report.testId
                                              .toLowerCase()
                                              .includes(searchTerm)
                                          );
                                        setFilteredQcReports(filteredReports);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {filteredQcReports.length > 0 ? (
                                  filteredQcReports.map((report) => (
                                    <SelectItem
                                      key={report.id}
                                      value={report.id}
                                    >
                                      {report.testId}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-sm text-gray-500 text-center">
                                    No QC reports found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="selectModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Select Model <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Model" />
                                {field.value && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange("");
                                    }}
                                    className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                  </button>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="p-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search models..."
                                    className="pl-8 h-8 text-sm"
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const searchTerm =
                                        e.target.value.toLowerCase();
                                      const modelOptions = [
                                        {
                                          value: "iphone-14",
                                          label: "iPhone 14",
                                        },
                                        {
                                          value: "iphone-13",
                                          label: "iPhone 13",
                                        },
                                        {
                                          value: "iphone-12",
                                          label: "iPhone 12",
                                        },
                                        {
                                          value: "iphone-11",
                                          label: "iPhone 11",
                                        },
                                        {
                                          value: "iphone-10",
                                          label: "iPhone 10",
                                        },
                                        {
                                          value: "iphone-9",
                                          label: "iPhone 9",
                                        },
                                        {
                                          value: "iphone-8",
                                          label: "iPhone 8",
                                        },
                                        {
                                          value: "samsung-s23",
                                          label: "Samsung S23",
                                        },
                                        {
                                          value: "samsung-s22",
                                          label: "Samsung S22",
                                        },
                                        {
                                          value: "samsung-s21",
                                          label: "Samsung S21",
                                        },
                                        {
                                          value: "oneplus-11",
                                          label: "OnePlus 11",
                                        },
                                        {
                                          value: "oneplus-10",
                                          label: "OnePlus 10",
                                        },
                                        {
                                          value: "google-pixel-7",
                                          label: "Google Pixel 7",
                                        },
                                        {
                                          value: "google-pixel-6",
                                          label: "Google Pixel 6",
                                        },
                                      ];

                                      if (searchTerm === "") {
                                        setFilteredModels(modelOptions);
                                      } else {
                                        const filteredModels =
                                          modelOptions.filter((model) =>
                                            model.label
                                              .toLowerCase()
                                              .includes(searchTerm)
                                          );
                                        setFilteredModels(filteredModels);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {filteredModels.length > 0 ? (
                                  filteredModels.map((model) => (
                                    <SelectItem
                                      key={model.value}
                                      value={model.value}
                                    >
                                      {model.label}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-sm text-gray-500 text-center">
                                    No models found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            IMEI 1<span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="IMEI"
                            className="w-full"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imei2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            IMEI 2<sup className="text-red-500">*</sup>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="IMEI"
                            className="w-full"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="variant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Variant <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Variant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="p-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search variants..."
                                    className="pl-8 h-8 text-sm"
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const searchTerm =
                                        e.target.value.toLowerCase();
                                      if (searchTerm === "") {
                                        setFilteredVariants(filteredVariants);
                                      } else {
                                        const filteredVariantsdropdown =
                                          filteredVariants.filter((variant) =>
                                            variant.label
                                              .toLowerCase()
                                              .includes(searchTerm)
                                          );
                                        setFilteredVariants(
                                          filteredVariantsdropdown
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {filteredVariants.length > 0 ? (
                                  filteredVariants.map((variant) => (
                                    <SelectItem
                                      key={variant.value}
                                      value={variant.value}
                                    >
                                      {variant.label}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-sm text-gray-500 text-center">
                                    No variants found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accesories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Accesories <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Accesories" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="only-charger">
                                Only Charger (Original)
                              </SelectItem>
                              <SelectItem value="only-box">Only Box</SelectItem>
                              <SelectItem value="box-and-charger">
                                Box and Charger Both
                              </SelectItem>
                              <SelectItem value="not-available">
                                Not Available
                              </SelectItem>
                              <SelectItem value="phonepro-box">
                                Phonepro Box
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="warrantyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Warranty Type{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Warranty Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5-days-checking-warranty">
                                5 Days Checking Warranty
                              </SelectItem>
                              <SelectItem value="3-months-xtracover-warranty">
                                3 Months XtraCover Warranty
                              </SelectItem>
                              <SelectItem value="brand-warranty">
                                Brand Warranty
                              </SelectItem>
                              <SelectItem value="not-applicable">
                                Not Applicable
                              </SelectItem>
                              <SelectItem value="phonepro-warranty-6-months">
                                Phonepro Warranty (6 Months)
                              </SelectItem>
                              <SelectItem value="yaantra-warranty-6-months">
                                Yaantra Warranty (6 Months)
                              </SelectItem>
                              <SelectItem value="yaantra-warranty-1-month">
                                Yaantra Warranty (1 Month)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availableIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Available In <span className="text-red-500">*</span>
                          </FormLabel>
                          <Tabs
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <TabsList className="w-full gap-4">
                              <TabsTrigger
                                value="branch-1"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                              >
                                Branch 1
                              </TabsTrigger>
                              <TabsTrigger
                                value="branch-2"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                              >
                                Branch 2
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormItem>
                      )}
                    />

                    {form.watch("warrantyType") ===
                      "3-months-xtracover-warranty" && (
                      <div className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="certificateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                                Certificate ID{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Input
                                {...field}
                                placeholder="Certificate ID"
                                className="w-full"
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="deviceFrontImage"
                      render={({ field }) => (
                        <FormItem className="">
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Device Front Image{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <ImageUploadField
                            {...field}
                            label=""
                            name="deviceFrontImage"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onRemove={() => field.onChange("")}
                            onCamera={() => {
                              setCurrentImageField("deviceFrontImage");
                              setCameraOpen(true);
                            }}
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deviceBackImage"
                      render={({ field }) => (
                        <FormItem className="">
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Device Back Image{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <ImageUploadField
                            {...field}
                            label=""
                            name="deviceBackImage"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onRemove={() => field.onChange("")}
                            onCamera={() => {
                              setCurrentImageField("deviceFrontImage");
                              setCameraOpen(true);
                            }}
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Order ID <span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Order ID"
                            className="w-full"
                          />
                        </FormItem>
                      )}
                    />
                    <div className="my-3 flex flex-col md:gap-1 gap-4 mb-20 md:mb-8">
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem className="mb-10">
                            <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                              Document Type{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Tabs
                              {...field}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <TabsList className="w-full gap-4 grid sm:grid-cols-3 grid-cols-2 ">
                                <TabsTrigger
                                  value="id-proof"
                                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                >
                                  ID Proof
                                </TabsTrigger>
                                <TabsTrigger
                                  value="invoice"
                                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                >
                                  Invoice
                                </TabsTrigger>
                                <TabsTrigger
                                  value="not-available"
                                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                >
                                  Not Available
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </FormItem>
                        )}
                      />

                      {form.watch("documentType") === "id-proof" && (
                        <>
                          <div className="flex flex-col gap-4">
                            <FormField
                              control={form.control}
                              name="customerImage"
                              render={({ field }) => (
                                <FormItem>
                                  <ImageUploadField
                                    label={
                                      <>
                                        Customer Image{" "}
                                        <span className="text-red-500">*</span>
                                      </>
                                    }
                                    name="customerImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField("customerImage");
                                      setCameraOpen(true);
                                    }}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="addressProofType"
                              render={({ field }) => (
                                <FormItem className="my-8 sm:mt-0">
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Select Address Proof*{" "}
                                    <span className="text-red-500">*</span>
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
                          </div>
                        </>
                      )}

                      {form.watch("documentType") === "id-proof" &&
                        form.watch("addressProofType") === "aadhar" && (
                          <>
                            <FormField
                              control={form.control}
                              name="aadharFrontImage"
                              render={({ field }) => (
                                <FormItem>
                                  <ImageUploadField
                                    label={
                                      <>
                                        Aadhar Front Image{" "}
                                        <span className="text-red-500">*</span>
                                      </>
                                    }
                                    name="aadharFrontImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField("aadharFrontImage");
                                      setCameraOpen(true);
                                    }}
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
                                    label={
                                      <>
                                        Aadhar Back Image{" "}
                                        <span className="text-red-500">*</span>
                                      </>
                                    }
                                    name="aadharBackImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField("aadharBackImage");
                                      setCameraOpen(true);
                                    }}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {form.watch("aadharFrontImage") &&
                              form.watch("aadharBackImage") && (
                                <>
                                  {isAadharVerified ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                      <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                        <div>
                                          <p className="text-sm font-medium text-green-800">
                                            Aadhar verified successfully!
                                          </p>
                                        </div>
                                      </div>
                                      {/* <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-3"
                                      onClick={() => {
                                        setIsAadharVerified(false);
                                        setAadharVerificationData(null);
                                      }}
                                    >
                                      Reverify Aadhar
                                    </Button> */}
                                    </div>
                                  ) : (
                                    <div className="">
                                      <Label>
                                        Aadhar verification{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      {/* Desktop and Mobile Aadhar Sheets */}
                                      <div className="space-y-2">
                                        <DesktopAadharSheet
                                          onFormSubmit={handleAadharSuccess}
                                          onFormFail={handleAadharFailure}
                                          triggerText="Verify Aadhar"
                                        />
                                        <MobileAadharSheet
                                          onFormSubmit={handleAadharSuccess}
                                          onFormFail={handleAadharFailure}
                                          triggerText="Verify Aadhar"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                          </>
                        )}

                      {form.watch("documentType") === "id-proof" &&
                        form.watch("addressProofType") === "voter_id" && (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="voterIdFrontImage"
                              render={({ field }) => (
                                <FormItem>
                                  <ImageUploadField
                                    label={
                                      <>
                                        Voter ID Front Image{" "}
                                        <span className="text-red-500">*</span>
                                      </>
                                    }
                                    name="voterIdFrontImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField("voterIdFrontImage");
                                      setCameraOpen(true);
                                    }}
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
                                    label={
                                      <>
                                        Voter ID Back Image{" "}
                                        <span className="text-red-500">*</span>
                                      </>
                                    }
                                    name="voterIdBackImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField("voterIdBackImage");
                                      setCameraOpen(true);
                                    }}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {form.watch("voterIdFrontImage") &&
                              form.watch("voterIdBackImage") && (
                                <>
                                  {isVoterVerified ? (
                                    <>
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                          <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                          <div>
                                            <p className="text-sm font-medium text-green-800">
                                              Voter verified successfully!
                                            </p>
                                          </div>
                                        </div>
                                        {/* <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                          setIsVoterVerified(false);
                                          // setVoterIdDetails(null);
                                          setVoterVerificationData(null);
                                        }}
                                      >
                                        Reverify Voter ID
                                      </Button> */}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                                          <p className="text-sm text-yellow-800">
                                            Please complete Aadhar verification
                                            to continue.
                                          </p>
                                        </div>

                                        {/* Desktop and Mobile Aadhar Sheets */}
                                        <div className="space-y-2">
                                          <DesktopVoterIdSheet
                                            onFormSubmit={handleVoterSuccess}
                                            onFormFail={handleVoterFailure}
                                            triggerText="Verify Voter ID (Desktop)"
                                          />
                                          <MobileVoterIdSheet
                                            onFormSubmit={handleVoterSuccess}
                                            onFormFail={handleVoterFailure}
                                            triggerText="Verify Voter ID (Mobile)"
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                          </div>
                        )}

                      {form.watch("documentType") === "invoice" && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="gstInvoice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  GST Invoice (Original){" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <ImageUploadField
                                  name="gstInvoice"
                                  label=""
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("gstInvoice");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="my-3 md:my-0">
                        <FormField
                          control={form.control}
                          name="boxandimeisame"
                          render={({ field }) => (
                            <FormItem className="mt-7 md:mt-0">
                              <FormLabel className="text-sm font-medium text-gray-700 ">
                                IS Box IMEI and Device IMEI Same ?{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Tabs
                                {...field}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <TabsList className="w-full gap-4 grid sm:grid-cols-3 grid-cols-2">
                                  <TabsTrigger
                                    value="yes"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                  >
                                    Yes
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="no"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                  >
                                    No
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="not-available"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow border-black/20 bg-white rounded-md h-11 "
                                  >
                                    Not Available
                                  </TabsTrigger>
                                </TabsList>
                              </Tabs>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="purchaseAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Purchase Amount{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Purchase Amount"
                            className="w-full"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deviceIssue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                            Device Issue orr BH(iPhone){" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Device Issue"
                            className="w-full"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repairRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Is this Phone need Repair?{" "}
                            <span className="text-red-500">*</span>
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
                                  <span className="font-medium">Yes</span>
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
                                  <span className="font-medium">No</span>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("repairRequired") === "yes" && (
                      <>
                        <FormField
                          control={form.control}
                          name="repairStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Repair Status{" "}
                                <span className="text-red-500">*</span>
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
                                        value="pending"
                                        className="peer sr-only"
                                      />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                      <span className="font-medium">
                                        Pending
                                      </span>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="completed"
                                        className="peer sr-only"
                                      />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                      <span className="font-medium">
                                        Completed
                                      </span>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Additional fields when repairStatus is completed */}
                        {form.watch("repairStatus") === "completed" && (
                          <RepairCompletedFields form={form} />
                        )}
                      </>
                    )}
                  </form>
                </Form>
              </div>
            </CustomSheetContent>
          </CustomSheet>
        </div>
      )}
    </div>
  );
};

export default PartnerPurchaseForm;
