import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import { z } from 'zod';

// Filter form schema
const filterSchema = z.object({
  deviceBC: z.string().optional(),
  user: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  vendor: z.string().optional(),
  deviceSKU: z.string().optional(),
  model: z.string().optional(),
  imei: z.string().optional(),
  imei2: z.string().optional(),
  variant: z.string().optional(),
  availableIn: z.string().optional(),
  vendorId: z.string().optional(),
  orderId: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

const FilterSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<FilterFormData>({});

  const filterOptions = [
    { key: 'deviceBC', label: 'Device BC' },
    { key: 'user', label: 'User' },
    { key: 'date', label: 'DATE' },
    { key: 'vendor', label: 'VENDOR' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'deviceSKU', label: 'Device SKU' },
    { key: 'model', label: 'Model' },
    { key: 'imei', label: 'IMEI' },
    { key: 'imei2', label: 'IMEI 2' },
    { key: 'variant', label: 'Variant' },
    { key: 'availableIn', label: 'Available in' },
    { key: 'vendorId', label: 'Vendor ID' },
    { key: 'orderId', label: 'Order ID' },
    { key: 'serviceNo', label: 'Service No' },
    { key: 'aadhaarFront', label: 'Aadhaar Front' },
    { key: 'aadhaarBack', label: 'Aadhaar Back' },
    { key: 'voterId', label: 'Voter ID Front' },
    { key: 'voterIdBack', label: 'Voter ID Back' },
    { key: 'rrn', label: 'RRN No' },
    { key: 'serviceRequired', label: 'Service Required' },
    { key: 'repairStatus', label: 'Repair Status' },
    { key: 'price', label: 'Price' },
    { key: 'quantity', label: 'Quantity' },
  ];

  const handleInputChange = (key: string, value: string) => {
    setFilterData(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilterData({});
    setSelectedOption(null);
  };

  const handleDone = () => {
    console.log('Filter data:', filterData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-transparent bg-opacity-50">
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-x-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Filter</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!selectedOption ? (
           
            <div className="p-4 overflow-auto">
              {filterOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b"
                  onClick={() => setSelectedOption(option.key)}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            // Input form for selected option
            <div className="p-4">
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedOption(null)}
                  className="mr-2 bg-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-medium ">
                  {filterOptions.find(opt => opt.key === selectedOption)?.label}
                </h3>
              </div>

              {selectedOption === 'date' ? (
                // Date range inputs
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From Date</label>
                    <Input
                      type="date"
                      value={filterData.dateFrom || ''}
                      onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">To Date</label>
                    <Input
                      type="date"
                      value={filterData.dateTo || ''}
                      onChange={(e) => handleInputChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                // Regular text input
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter {filterOptions.find(opt => opt.key === selectedOption)?.label}
                  </label>
                  <Input
                    type="text"
                    placeholder={`Enter ${filterOptions.find(opt => opt.key === selectedOption)?.label}`}
                    value={filterData[selectedOption as keyof FilterFormData] || ''}
                    onChange={(e) => handleInputChange(selectedOption, e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <Button onClick={handleDone} className="flex-1 bg-blue-600">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;