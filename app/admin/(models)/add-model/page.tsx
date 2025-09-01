"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

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

// Zod schema for form validation
const modelCodeSchema = z.string().regex(/^[a-zA-Z0-9\s\-_\/]+$/, "Model code can only contain letters, numbers, spaces, hyphens, underscores, and slashes");

const optionalModelCodeSchema = z.string().optional().or(z.literal(""));
const formSchema = z.object({
  brand: z.string({
    error: "Please select a brand",
  }).min(1, "Please select a brand"),
  model: z.string({
    error: "Please enter a model name",
  })
  .min(1, "Model name is required")
  .regex(/^[a-zA-Z0-9\s\-_\/]+$/, "Model name can only contain letters, numbers, spaces, hyphens, underscores, and slashes"),
  modelCode1: modelCodeSchema.min(1, "Model Code 1 is required"),
  modelCode2: optionalModelCodeSchema,
  modelCode3: optionalModelCodeSchema,
  modelCode4: optionalModelCodeSchema,
  modelCode5: optionalModelCodeSchema,
  modelCode6: optionalModelCodeSchema,
  modelCode7: optionalModelCodeSchema,
  modelCode8: optionalModelCodeSchema,
  modelCode9: optionalModelCodeSchema,
  modelCode10: optionalModelCodeSchema,
});

type FormData = z.infer<typeof formSchema>;

const AddModel = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      modelCode1: "",
      modelCode2: "",
      modelCode3: "",
      modelCode4: "",
      modelCode5: "",
      modelCode6: "",
      modelCode7: "",
      modelCode8: "",
      modelCode9: "",
      modelCode10: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Collect all non-empty model codes (ignore empty or whitespace-only fields)
      const modelCodes = [
        data.modelCode1,
        data.modelCode2,
        data.modelCode3,
        data.modelCode4,
        data.modelCode5,
        data.modelCode6,
        data.modelCode7,
        data.modelCode8,
        data.modelCode9,
        data.modelCode10,
      ].filter((code) => code && code.trim().length > 0);

      const payload = {
        brand: data.brand,
        model: data.model,
        modelCodes,
      };

      const response = await fetch('/api/custom-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.result === "error") {
        toast.error(result.message);
        return;
      }

      toast.success("Model added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding model:", error);
      toast.error("Failed to add model. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[--background] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Model</h1>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Model Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Brand Selection */}
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Brand</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='bg-white w-full'>
                            <SelectValue placeholder="Choose a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mobileBrands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Model Name */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Model</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter model name (alphanumeric)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Model Codes 1-10 */}
                {[...Array(10)].map((_, idx) => (
                  <FormField
                    key={idx}
                    control={form.control}
                    name={`modelCode${idx + 1}` as keyof FormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Model Code {idx + 1}
                          {idx === 0 ? (
                            <span className="text-red-600 ml-1">*</span>
                          ) : (
                            <span className="text-xs text-muted-foreground ml-2">(optional)</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter model code ${idx + 1} `}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Adding..." : "Add Model"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                    disabled={form.formState.isSubmitting}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddModel;