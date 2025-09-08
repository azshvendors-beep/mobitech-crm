"use client";

import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TypographyH4 } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ArrowLeft, Pencil, Eye, EyeOff, Search, X, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
import { SyncLoader } from "react-spinners";
import { toast } from "sonner";
import z from "zod";

interface Brand {
  id: string;
  name: string;
  logo: string;
  apiEndpoint: string;
}

const mobileBrands: Brand[] = [
  {
    id: "apple",
    name: "Apple",
    logo: "/apple.webp",
    apiEndpoint: "apple-phones-48",
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/samsung.webp",
    apiEndpoint: "samsung-phones-9",
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    logo: "/xiomi.webp",
    apiEndpoint: "xiaomi-phones-80",
  },
  {
    id: "vivo",
    name: "Vivo",
    logo: "/vivo.webp",
    apiEndpoint: "vivo-phones-98",
  },
  {
    id: "oneplus",
    name: "OnePlus",
    logo: "/one plus.webp",
    apiEndpoint: "oneplus-phones-95",
  },
  {
    id: "oppo",
    name: "Oppo",
    logo: "/oppo.webp",
    apiEndpoint: "oppo-phones-82",
  },
  {
    id: "realme",
    name: "Realme",
    logo: "/realme.webp",
    apiEndpoint: "realme-phones-118",
  },
  {
    id: "motorola",
    name: "Motorola",
    logo: "/motorola.webp",
    apiEndpoint: "motorola-phones-4",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    logo: "/lenovo.webp",
    apiEndpoint: "lenovo-phones-73",
  },
  {
    id: "nokia",
    name: "Nokia",
    logo: "/nokia.webp",
    apiEndpoint: "nokia-phones-1",
  },
  {
    id: "honor",
    name: "Honor",
    logo: "/honor.webp",
    apiEndpoint: "honor-phones-121",
  },
  {
    id: "google",
    name: "Google",
    logo: "/google.webp",
    apiEndpoint: "google-phones-107",
  },
  {
    id: "poco",
    name: "Poco",
    logo: "/poco.webp",
    apiEndpoint: "poco-phones-generic",
  },
  {
    id: "infinix",
    name: "Infinix",
    logo: "/infinix.webp",
    apiEndpoint: "infinix-phones-119",
  },
  {
    id: "techno",
    name: "Tecno",
    logo: "/techno.webp",
    apiEndpoint: "tecno-phones-120",
  },
  {
    id: "iqoo",
    name: "iQOO",
    logo: "/iqoo.webp",
    apiEndpoint: "vivo-phones-98",
  },
  {
    id: "nothing",
    name: "Nothing",
    logo: "/nothing.webp",
    apiEndpoint: "nothing-phones-128",
  },
];

interface Model {
  id: string;
  name: string;
  codes: string[];
  createdAt: string;
}

// For viewing codes in card
interface CodeViewState {
  [modelId: string]: boolean;
}


interface FetchedBrand {
  id: string;
  name: string;
  logo: string | null;
  apiEndpoint: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  models: Model[];
}

interface ApiResponse {
  result: string;
  data: FetchedBrand[];
}

const ViewModels = () => {
  const [codeViewOpen, setCodeViewOpen] = useState<CodeViewState>({});
  const [loading, setLoading] = useState(false);
  const [fetchedBrands, setFetchedBrands] = useState<FetchedBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedBrandModels, setSelectedBrandModels] = useState<Model[]>([]);
  const [showModels, setShowModels] = useState(false);
  const [modelEditDialogOpen, setModelEditDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [editDataSubmitting, setEditDataSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [addCodesDialogOpen, setAddCodesDialogOpen] = useState(false);
  const [addingCodesModel, setAddingCodesModel] = useState<Model | null>(null);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [addCodesSubmitting, setAddCodesSubmitting] = useState(false);
  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/custom-model", {
        method: "GET",
      });
      if (response.ok) {
        const data: ApiResponse = await response.json();
        console.log("Fetched Models:", data);
        setFetchedBrands(data.data);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleBrandSelect = (brandId: string) => {
    const brand = mobileBrands.find((b) => b.id === brandId);
    if (!brand) return;

    const fetchedBrand = fetchedBrands.find(
      (fb) => fb.name.toLowerCase() === brand.name.toLowerCase()
    );

    setSelectedBrand(brand);
    setSelectedBrandModels(fetchedBrand?.models || []);
    setFilteredModels(fetchedBrand?.models || []);
    setShowModels(true);
    setSearchQuery(""); // Clear search when selecting a brand
  };

  const handleBackToBrands = () => {
    setShowModels(false);
    setSelectedBrand(null);
    setSelectedBrandModels([]);
    setFilteredModels([]);
    setSearchQuery("");
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredModels(selectedBrandModels);
      return;
    }

    const filtered = selectedBrandModels.filter((model) => {
      const matchesName = model.name.toLowerCase().includes(query.toLowerCase());
      const matchesCodes = model.codes.some((code) =>
        code.toLowerCase().includes(query.toLowerCase())
      );
      return matchesName || matchesCodes;
    });

    setFilteredModels(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredModels(selectedBrandModels);
  };

  // Function to get model count for a brand
  const getModelCount = (brandName: string): number => {
    const brand = fetchedBrands.find(
      (fetchedBrand) =>
        fetchedBrand.name.toLowerCase() === brandName.toLowerCase()
    );
    return brand ? brand.models.length : 0;
  };

  const editModelForm = z.object({
  selectedCode: z.string().min(1, "Select a code to edit"),
  newCode: z.string().optional(),
  name: z.string().min(2, "Name is required"),
    // brand: z.string().min(2, "Brand is required"),
  });

  type EditModelForm = z.infer<typeof editModelForm>;

  const form = useForm<EditModelForm>({
    resolver: zodResolver(editModelForm),
    defaultValues: {
      selectedCode: "",
      newCode: "",
      name: "",
    },
  });

  // Update form values when editingModel changes
  useEffect(() => {
    if (editingModel) {
      form.reset({
        selectedCode: "NO_CHANGE",
        newCode: "",
        name: editingModel.name,
      });
    }
  }, [editingModel, form]);

  const handleClickModelEdit = (model: Model) => {
    setEditingModel(model);
    setModelEditDialogOpen(true);
  };

  const handleClickAddCodes = (model: Model) => {
    setAddingCodesModel(model);
    const availableSlots = 10 - model.codes.length;
    const emptyCodes = new Array(availableSlots).fill("");
    setNewCodes(emptyCodes);
    setAddCodesDialogOpen(true);
  };

  const handleNewCodeChange = (index: number, value: string) => {
    const updated = [...newCodes];
    updated[index] = value;
    setNewCodes(updated);
  };

  const onSubmitNewCodes = async () => {
    if (!addingCodesModel) return;
    
    // Filter out empty codes
    const validCodes = newCodes.filter(code => code.trim().length > 0);
    
    if (validCodes.length === 0) {
      toast.error("At least one model code is required");
      return;
    }

    try {
      setAddCodesSubmitting(true);
      
      const response = await fetch(`/api/custom-model/add-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: addingCodesModel.id,
          newCodes: validCodes,
        }),
      });
      
      if (response.ok) {
        toast.success(`${validCodes.length} code${validCodes.length > 1 ? 's' : ''} added successfully`);
        setAddingCodesModel(null);
        setAddCodesDialogOpen(false);
        setNewCodes([]);
        window.location.reload(); // Refresh to show updated data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add codes");
      }
    } catch (error) {
      toast.error("Failed to add codes");
      console.error("Error adding codes:", error);
    } finally {
      setAddCodesSubmitting(false);
    }
  };

  const onSubmit = async (data: EditModelForm) => {

    try {
      setEditDataSubmitting(true);
      if (!editingModel) return;

      // If name changed, update all codes for that name
      if (data.name !== editingModel.name) {
        const response = await fetch(`/api/custom-model/edit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingModel.id,
            name: data.name,
            codes: editingModel.codes, // all codes to update
            type: "bulkRename"
          }),
        });
        if (response.ok) {
          toast("Model name and all codes updated successfully");
          setEditingModel(null);
          setModelEditDialogOpen(false);
          window.location.reload();
        }
      } else if (data.selectedCode !== "NO_CHANGE") {
        // Only code update for selected code
        const response = await fetch(`/api/custom-model/edit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingModel.id,
            name: editingModel.name,
            oldCode: data.selectedCode,
            newCode: data.newCode,
            type: "codeUpdate"
          }),
        });
        if (response.ok) {
          toast("Model code updated successfully");
          setEditingModel(null);
          setModelEditDialogOpen(false);
          window.location.reload();
        }
      } else {
        // No change to code
        toast("No changes made to code.");
        setEditingModel(null);
        setModelEditDialogOpen(false);
      }
    } catch (error) {
      toast("Failed to update model");
      console.error("Error updating model:", error);
    } finally {
      setEditDataSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <SyncLoader color="#3b82f6" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {showModels ? (
            <Button variant="ghost" size="icon" onClick={handleBackToBrands}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold">
            {showModels ? `${selectedBrand?.name} Models` : "View Models"}
          </h1>
        </div>

        {/* Content with transition */}
        <div className="relative overflow-hidden">
          {/* Brands Grid */}
          <div
            className={`transition-transform duration-300 ease-in-out ${
              showModels
                ? "-translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            <p className="text-sm text-muted-foreground pl-1 mt-4 mb-6">
              Select Brand :
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4 gap-2">
              {mobileBrands.map((brand) => {
                const modelCount = getModelCount(brand.name);

                return (
                  <div
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center hover:border-blue-500 hover:ring-1 hover:ring-blue-200 border-gray-400/40 sm:border-gray-400/70 relative"
                  >
                    <div className="relative h-16 sm:h-20 w-16 sm:w-20 mb-2">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    </div>

                    <span className="text-sm font-medium text-center text-gray-600">
                      ({modelCount} {modelCount === 1 ? "model" : "models"})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Models Grid */}
          <div
            className={`absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out ${
              showModels
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            {selectedBrand && (
              <>
                {/* Brand Info Header with Search */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="relative h-12 w-12">
                    <Image
                      src={selectedBrand.logo}
                      alt={selectedBrand.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                      {selectedBrand.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {searchQuery ? `${filteredModels.length} of ${selectedBrandModels.length}` : selectedBrandModels.length}{" "}
                      {(searchQuery ? filteredModels.length : selectedBrandModels.length) === 1 ? "model" : "models"}{" "}
                      {searchQuery ? "found" : "available"}
                    </p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search models or codes..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      {filteredModels.length === 0 
                        ? "No models found matching your search"
                        : `Found ${filteredModels.length} ${filteredModels.length === 1 ? "model" : "models"} matching "${searchQuery}"`
                      }
                    </p>
                  </div>
                )}

                {/* Models List */}
                {filteredModels.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredModels.map((model) => (
                      <div
                        key={model.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-500 hover:ring-1 hover:ring-blue-200 bg-white relative"
                      >
                        <div className="space-y-2">
                          <div className="flex w-full justify-between items-center">
                            <h3 className="font-semibold text-lg">
                              {searchQuery ? (
                                <span 
                                  dangerouslySetInnerHTML={{
                                    __html: model.name.replace(
                                      new RegExp(`(${searchQuery})`, 'gi'),
                                      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                    )
                                  }}
                                />
                              ) : (
                                model.name
                              )}
                            </h3>
                            <div className="flex gap-2">
                              <div
                                className="bg-blue-600/80 cursor-pointer rounded-full text-white h-10 w-10 flex justify-center items-center"
                                onClick={() => handleClickModelEdit(model)}
                              >
                                <Pencil size={20} />
                              </div>
                              {model.codes.length < 10 && (
                                <div
                                  className="bg-green-600/80 cursor-pointer rounded-full text-white h-10 w-10 flex justify-center items-center"
                                  onClick={() => handleClickAddCodes(model)}
                                >
                                  <Plus size={20} />
                                </div>
                              )}
                            </div>
                          </div>
                      <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                            <span className="font-medium">Codes:</span> {model.codes.length}
                          </p>

                           <Button
                                // variant="secondary"
                                size="sm"
                                onClick={() => setCodeViewOpen((prev) => ({ ...prev, [model.id]: !prev[model.id] }))}
                                className="hover:cursor-pointer"
                              >
                               {!codeViewOpen[model.id]? ( <>View
                                <Eye className="ml-2 h-4 w-4" /></>) :(<>
                                Hide
                                <EyeOff className="ml-2 h-4 w-4" />
                                </>)}
                              </Button>
                      </div>
                          {codeViewOpen[model.id] && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-700">
                              <div className="font-semibold mb-1">Available Codes:</div>
                              <ul className="list-disc pl-4">
                                {model.codes.map((code) => (
                                  <li key={code}>
                                    {searchQuery ? (
                                      <span 
                                        dangerouslySetInnerHTML={{
                                          __html: code.replace(
                                            new RegExp(`(${searchQuery})`, 'gi'),
                                            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                          )
                                        }}
                                      />
                                    ) : (
                                      code
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Added: {new Date(model.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="mx-auto h-12 w-12" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No models found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      No models or codes match your search "{searchQuery}"
                    </p>
                    <Button variant="outline" onClick={clearSearch}>
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No models found
                    </h3>
                    <p className="text-gray-500">
                      No models have been added for {selectedBrand.name} yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Dialog
        open={modelEditDialogOpen}
        onOpenChange={(open) => {
          setModelEditDialogOpen(open);
          if (!open) setEditingModel(null);
        }}
      >
        <DialogContent>
          <AlertDialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
          </AlertDialogHeader>
          {editingModel && (
            <div className="mb-4">
              <div className="text-xs text-gray-500">ID: {editingModel.id}</div>
            </div>
          )}
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter model name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectedCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Existing Code</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded px-2 py-2">
                      <option value="NO_CHANGE">No change</option>
                      {editingModel?.codes.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("selectedCode") !== "NO_CHANGE" && (
              <FormField
                control={form.control}
                name="newCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </Form>
          <DialogFooter>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={editDataSubmitting}>
              {editDataSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Codes Dialog */}
      <Dialog
        open={addCodesDialogOpen}
        onOpenChange={(open) => {
          setAddCodesDialogOpen(open);
          if (!open) {
            setAddingCodesModel(null);
            setNewCodes([]);
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <DialogTitle>Add Model Codes</DialogTitle>
          </AlertDialogHeader>
          
          {addingCodesModel && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Model: {addingCodesModel.name}
              </div>
              <div className="text-xs text-gray-500">
                Current codes: {addingCodesModel.codes.length}/10
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Available slots: {10 - addingCodesModel.codes.length}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Add up to {addingCodesModel ? 10 - addingCodesModel.codes.length : 0} new model codes. At least one is required.
            </p>
            
            {newCodes.map((code, index) => (
              <div key={index} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Model Code {addingCodesModel ? addingCodesModel.codes.length + index + 1 : index + 1}
                  {index === 0 && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Input
                  type="text"
                  placeholder={`Enter model code ${addingCodesModel ? addingCodesModel.codes.length + index + 1 : index + 1}`}
                  value={code}
                  onChange={(e) => handleNewCodeChange(index, e.target.value)}
                  className={`${index === 0 && !code.trim() ? 'border-red-300' : ''}`}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setAddCodesDialogOpen(false);
                setAddingCodesModel(null);
                setNewCodes([]);
              }}
              disabled={addCodesSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmitNewCodes}
              disabled={addCodesSubmitting || !newCodes[0]?.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {addCodesSubmitting ? "Adding..." : "Add Codes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewModels;
