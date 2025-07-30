"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/CommonUI/card";
import { Badge } from "../../../../../../components/CommonUI/badge";
import { Building, MapPin, Target, Award, Users, AlertCircle, Globe, MessageSquare, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../../components/DashboardUI/avatar";
import { Button } from "../../../../../../components/CommonUI/button";
import { SiMoneygram } from "react-icons/si";

export default function HackathonOverview({ hackathon, sectionRef, user, onShowParticipants }) {
  // Defensive: check if arrays exist and have meaningful content
  const requirements = Array.isArray(hackathon.requirements) ? hackathon.requirements : [];
  const perks = Array.isArray(hackathon.perks) ? hackathon.perks : [];
  
  // Check if arrays have meaningful content (not just empty strings)
  const hasRequirements = requirements.length > 0 && requirements.some(req => req && req.trim() !== '');
  const hasPerks = perks.length > 0 && perks.some(perk => perk && perk.trim() !== '');
  
  // Filter out empty strings for display
  const validRequirements = requirements.filter(req => req && req.trim() !== '');
  const validPerks = perks.filter(perk => perk && perk.trim() !== '');

  const organizer = hackathon.organizer || '';
  const tags = Array.isArray(hackathon.tags) ? hackathon.tags : [];
  const teamSize = hackathon.teamSize || {};
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <section ref={sectionRef} className="space-y-6 max-w-5xl mx-auto">
      {/* Main Container Card */}
      <Card className="shadow-none hover:shadow-none">
        {/* Section Header */}
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            Overview & Requirements
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 my-4">
              <h3 className="text-xl font-semibold text-gray-900">Details</h3>
            </div>
            <div className="">
              <p className="text-gray-700 leading-relaxed text-lg">
                {hackathon.description || 'Join us for an exciting hackathon experience!'}
              </p>
            </div>
          </div>
            <hr />
          {/* Organizer Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
           
              <h3 className="text-xl font-semibold text-gray-900">Organizer</h3>
            </div>
            <div className="">
              <div className="flex items-center gap-6">
                <Avatar className="w-10 h-10 border-2 border-indigo-200">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="text-lg font-semibold bg-indigo-100 text-indigo-700">
                    {typeof organizer === 'string' && organizer.length > 0 ? organizer[0] : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-xl text-gray-900">{organizer}</h4>
                  <p className="text-gray-600 text-sm">Event Organizer</p>
                </div>
                
                {/* Modern Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    aria-label="More options"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-600" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div 
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                    >
                      <button
                        onClick={() => {
                          // Handle website click
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                      >
                        <Globe className="w-4 h-4 text-gray-500" />
                        Website
                      </button>
                      <button
                        onClick={() => {
                          // Handle contact click
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr />
          {/* Requirements and What You'll Need Grid */}
          <div className="grid grid-cols-1  gap-8">
            {/* Requirements Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Requirements</h3>
              </div>
              <div className="">
                {hasRequirements ? (
                  <ul className="space-y-4">
                    {validRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-3">                        
                        <ArrowRight className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-700 leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-600">Requirements Not Yet Defined</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        The organizer will update the requirements soon. Stay tuned for more details!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            
            <hr />
            {/* Perks Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Perks</h3>
              </div>
              <div className="">
                {hasPerks ? (
                  <ul className="space-y-4">
                    {validPerks.map((perk, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <ArrowRight className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-700 leading-relaxed">{perk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-200">
                    <div className="flex-shrink-0">
                      <Award className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-indigo-700">Exciting Perks Coming Soon!</h4>
                      <p className="text-sm text-indigo-600 mt-1">
                        The organizer is preparing amazing perks and benefits for participants. Check back later!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
} 