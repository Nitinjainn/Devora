import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext"; // ⚠️ Adjust path to your AuthContext file
import { Button } from "../../../../components/CommonUI/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/CommonUI/card";
import { Separator } from "../../../../components/CommonUI/separator";
import {
  X,
  TrendingUp,
  Layout,
  Flag,
  Layers,
  Calendar,
  Eye,
  CreditCard,
  Activity,
  DollarSign,
  BarChart3,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// Pricing and placement constants remain unchanged
const BASE = {
  banner: 40,
  listing: 25,
  both: 60,
};

const CPI = {
  banner: 0.018,
  listing: 0.012,
  both: 0.022,
};

const PLACEMENT_OPTIONS = [
    {
    id: "banner",
    label: "Banner Promotion",
    icon: Layout,
    description: "Feature in explore hackathon banners",
    color: "indigo",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-200",
    ringColor: "ring-indigo-500",
  },
  {
    id: "listing",
    label: "Listing Priority",
    icon: Flag,
    description: "Boost in search results and listings",
    color: "blue",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    ringColor: "ring-blue-500",
  },
  {
    id: "both",
    label: "Complete Package",
    icon: Layers,
    description: "Maximum visibility with both placements",
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
    ringColor: "ring-purple-500",
    popular: true,
  },
];

const PromoteModal = ({ hackathon, onClose, onSuccess }) => {
  const [type, setType] = useState("banner");
  const [days, setDays] = useState(7);
  const [imps, setImps] = useState(10000);
  const [price, setPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { token: authToken } = useAuth();

  // ✅ 1. Check if a promotion is active and set the initial view
  const isPromotionActive = hackathon.isFeatured && new Date(hackathon.featuredEndDate) > new Date();
  const [view, setView] = useState(isPromotionActive ? 'status' : 'promote');

  useEffect(() => {
    const dailyCost = BASE[type] * days;
    const impCost = (imps / 1000) * CPI[type];
    setPrice((dailyCost + impCost).toFixed(2));
  }, [type, days, imps]);

  const launchCampaign = async () => {
    setProcessing(true);
    setError(null);
    if (!authToken) {
      setError("Authentication token not found. Please log in again.");
      setProcessing(false);
      return;
    }
    const promotionTypeForAPI = type === "listing" ? "card" : type;
    try {
      const response = await fetch(`/api/hackathons/${hackathon._id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ promotionType: promotionTypeForAPI, days: days, impressions: imps }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to launch promotion.");
      toast.success("Promotion campaign launched successfully!");
      if (onSuccess) onSuccess(result.hackathon);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };
  
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getPromotionTypeLabel = (type) => {
    if (type === 'card') return 'Listing Priority';
    if (type === 'banner') return 'Banner Promotion';
    if (type === 'both') return 'Complete Package';
    return 'N/A';
  };
  const daysRemaining = Math.max(0, Math.ceil((new Date(hackathon.featuredEndDate) - new Date()) / (1000 * 60 * 60 * 24)));
  
  const selectedOption = PLACEMENT_OPTIONS.find((opt) => opt.id === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4">
        <Card className="bg-white shadow-2xl border border-gray-200 scrollbar-hide overflow-y-auto max-h-[95vh]">
          {view === 'promote' ? (
            // --- RENDER PROMOTION FORM (Existing View) ---
            <>
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-3 ">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-full">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Promote Your Hackathon
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        Boost visibility and increase participation
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className=" text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white space-y-8 pt-8">
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Choose Promotion Type
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLACEMENT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const selected = type === option.id;
                      return (
                        <Card
                          key={option.id}
                          className={`bg-white cursor-pointer transition-all duration-200 relative shadow-none hover:shadow-none ${
                            selected
                              ? `ring-2 ${option.ringColor} shadow-none hover:shadow-none border-transparent`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setType(option.id)}
                        >
                          <CardContent className="pt-6 pb-6 bg-white">
                            <div className="text-center">
                              <div
                                className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                              >
                                <Icon
                                  className={`h-6 w-6 ${option.iconColor}`}
                                />
                              </div>
                              <h5 className="font-semibold text-gray-900 mb-2">
                                {option.label}
                              </h5>
                              <p className="text-sm text-gray-600 mb-4">
                                {option.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
                <Separator />
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Campaign Settings
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white border-gray-200 shadow-none hover:shadow-none">
                      <CardContent className="p-6 bg-white pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="h-5 w-5 text-indigo-500" />
                          <label className="text-sm font-semibold text-gray-700">
                            Campaign Duration
                          </label>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={days}
                          onChange={(e) =>
                            setDays(Math.max(1, Math.min(30, +e.target.value)))
                          }
                          className="w-full text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        <p className="text-sm text-gray-500 mt-2">Days (1-30)</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 shadow-none hover:shadow-none">
                      <CardContent className="p-6 bg-white pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="h-5 w-5 text-indigo-500" />
                          <label className="text-sm font-semibold text-gray-700">
                            Target Impressions
                          </label>
                        </div>
                        <input
                          type="number"
                          step={1000}
                          min={1000}
                          max={500000}
                          value={imps}
                          onChange={(e) =>
                            setImps(Math.max(1000, +e.target.value))
                          }
                          className="w-full text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Impressions (min. 1,000)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                <Separator />
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Campaign Summary
                    </h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div
                            className={`w-10 h-10 ${selectedOption?.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}
                          >
                            {selectedOption && (
                              <selectedOption.icon
                                className={`h-5 w-5 ${selectedOption.iconColor}`}
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Placement</p>
                          <p className="font-semibold text-gray-900">
                            {selectedOption?.label}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className="font-semibold text-gray-900">{days} days</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Eye className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Impressions</p>
                          <p className="font-semibold text-gray-900">
                            {imps.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="h-5 w-5 text-indigo-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                          <p className="font-bold text-xl text-gray-900">
                            ${price}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
                {error && (
                  <div
                    className="bg-red-50 text-red-700 border-l-4 border-red-500 p-4 rounded-md"
                    role="alert"
                  >
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={processing}
                    className="order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={launchCampaign}
                    disabled={processing}
                    className="order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px]"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Launch Promotion
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // --- ✅ 3. RENDER PROMOTION STATUS (New View) ---
            <>
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Promotion Status
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        Your promotion is currently active
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white space-y-8 pt-8">
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="h-5 w-5 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Current Campaign Details
                    </h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Flag className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Promotion Type</p>
                          <p className="font-semibold text-gray-900">
                            {getPromotionTypeLabel(hackathon.featuredType)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-5 w-5 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
                          <p className="font-semibold text-green-600">
                            {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}` : 'Expires today'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="h-5 w-5 text-purple-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Active Period</p>
                          <p className="font-semibold text-gray-900 text-xs">
                            {formatDate(hackathon.featuredStartDate)} - {formatDate(hackathon.featuredEndDate)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-none hover:shadow-none border-gray-100">
                        <CardContent className="pt-6 pb-6 text-center bg-white">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Eye className="h-5 w-5 text-indigo-500" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Target Impressions</p>
                          <p className="font-semibold text-gray-900">
                            {hackathon.featuredImpressions.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setView('promote')}
                    className="order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px]"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Extend Promotion
                    </div>
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PromoteModal;