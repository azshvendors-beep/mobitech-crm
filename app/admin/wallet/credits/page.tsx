'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Wallet, Loader2 } from "lucide-react"

interface WalletBalance {
  return: boolean;
  wallet: string;
}

const Credits = () => {
  const [fast2smsBalance, setFast2smsBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFast2SMSBalance()
  }, [])

  const fetchFast2SMSBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/wallet/fast2sms-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }

      const data: WalletBalance = await response.json()
      
      if (data.return) {
        setFast2smsBalance(data.wallet)
      } else {
        throw new Error('Invalid response from FAST2SMS')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Wallet Credits</h1>
        <Badge variant="outline" className="text-sm">
          <Wallet className="w-4 h-4 mr-2" />
          Manage Balances
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FAST2SMS Wallet Card */}
        <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">FAST2SMS</CardTitle>
                  <p className="text-sm text-gray-500">SMS Gateway</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                SMS
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading balance...</span>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-600 text-sm mb-2">{error}</p>
                  <button 
                    onClick={fetchFast2SMSBalance}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ₹{fast2smsBalance || '0.00'}
                    </div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    <button 
                      onClick={fetchFast2SMSBalance}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Refresh
                    </button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for additional wallet cards */}
        <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wallet className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-500">Add New Wallet</CardTitle>
                <p className="text-sm text-gray-400">Connect another service</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-gray-400">+</span>
              </div>
              <p className="text-sm text-gray-500">Add another wallet service</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Credits
