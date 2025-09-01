'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, Plus, Users, University } from 'lucide-react';
import FilterSidebar from '../components/FilterTab';
import PartnerPurchaseForm from '../components/PartnerPurchaseForm';

const PartnersPurchaseEntry = () => {
  const [searchText, setSearchText] = useState('');
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <University className="font-bold" />  Education Details
          </h1>
         
          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Search Input */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search Partners..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-12 text-sm sm:text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setIsFilterOpen(true)} 
                variant="outline" 
                size="icon"
                className="h-12 w-12 sm:h-10 sm:w-10"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                className='bg-blue-600 hover:bg-blue-700 h-12 px-4 sm:px-6' 
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Partner</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

         <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
         <PartnerPurchaseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        {/* Content Area */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-blue-600 font-medium">Total Partners</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-green-600 font-medium">Active Partners</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-purple-600 font-medium">Total Purchases</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900">0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-orange-600 font-medium">This Month</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-900">0</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Card */}
          <Card className="min-h-[400px] sm:min-h-96">
            <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">
              <div className="mb-4 sm:mb-6">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">
                No partners found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                Add your first partner to get started with purchase entries
              </p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-4 sm:px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Partner
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnersPurchaseEntry;