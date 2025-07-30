import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/CommonUI/card";
import { Users, Globe, Building, Shield, Target, FileText, Gavel, Trophy, RefreshCw, TrendingUp, Plus } from "lucide-react";
import { Button } from "../../../../components/CommonUI/button";
import { Badge } from "../../../../components/CommonUI/badge";
import JudgedSubmissionsView from "./JudgedSubmissionsView";
import AddEvaluatorModal from "./AddEvaluatorModal";
import { useToast } from "../../../../hooks/use-toast";

export default function JudgeManagementOverview({ 
  summary, 
  hackathon, 
  judgedSubmissions, 
  fetchJudged,
  selectedJudgedRound = 'All',
  setSelectedJudgedRound = () => {},
  selectedJudgedProblemStatement = 'All',
  setSelectedJudgedProblemStatement = () => {},
}) {
  const { toast } = useToast();
  const [showAddEvaluatorModal, setShowAddEvaluatorModal] = useState(false);

  const handleEvaluatorAdded = (newEvaluator) => {
    toast({
      title: 'Evaluator Added Successfully',
      description: `${newEvaluator.firstName} ${newEvaluator.lastName} has been invited as an evaluator.`,
      variant: 'default',
    });
    setShowAddEvaluatorModal(false);
    // Refresh the page to show updated data
    if (window.location.reload) {
      window.location.reload();
    }
  };
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Judge Management Overview</h2>
        <p className="text-gray-600">
          Comprehensive view of judge assignments, problem statements, and evaluation progress
        </p>
          </div>
          <Button 
            onClick={() => setShowAddEvaluatorModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Evaluator
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">
                    {summary.total}
                  </p>
                  <p className="text-sm font-medium text-blue-700">Total Judges</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {summary.active} active, {summary.pending} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-900">
                    {summary.platform}
                  </p>
                  <p className="text-sm font-medium text-green-700">Platform Judges</p>
                  <p className="text-xs text-green-600 mt-1">Can judge general PS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-900">
                    {summary.sponsor}
                  </p>
                  <p className="text-sm font-medium text-orange-700">Sponsor Judges</p>
                  <p className="text-xs text-orange-600 mt-1">Company-specific PS only</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-900">
                    {summary.hybrid}
                  </p>
                  <p className="text-sm font-medium text-purple-700">Hybrid Judges</p>
                  <p className="text-xs text-purple-600 mt-1">Can judge all PS types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problem Statements Overview */}
      <section>
        <Card className="shadow-none hover:shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
            
              Problem Statements Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {hackathon?.problemStatements && hackathon.problemStatements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathon.problemStatements.map((ps, index) => (
                  <div key={index} className="p-6 border-0 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant={ps.type === "sponsored" ? "default" : "secondary"}
                        className={ps.type === "sponsored" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}
                      >
                        {ps.type === "sponsored" ? "Sponsored" : "General"}
                      </Badge>
                      {ps.type === "sponsored" && ps.sponsorCompany && (
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                          {ps.sponsorCompany}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {typeof ps === "object" ? ps.statement : ps}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full mb-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No problem statements added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Judged Submissions */}
      <section>
        <Card className="shadow-none hover:shadow-none">
          <CardContent className="pt-4">
            <JudgedSubmissionsView
              judgedSubmissions={judgedSubmissions}
              hackathon={hackathon}
              fetchJudged={fetchJudged}
              selectedRound={selectedJudgedRound}
              setSelectedRound={setSelectedJudgedRound}
              selectedProblemStatement={selectedJudgedProblemStatement}
              setSelectedProblemStatement={setSelectedJudgedProblemStatement}
            />
          </CardContent>
        </Card>
      </section>

      {/* Add Evaluator Modal */}
      <AddEvaluatorModal
        open={showAddEvaluatorModal}
        onClose={() => setShowAddEvaluatorModal(false)}
        hackathonId={hackathon?._id || hackathon?.id}
        onEvaluatorAdded={handleEvaluatorAdded}
        defaultJudgeType="platform"
        hideJudgeTypeSelection={false}
        editingJudge={null}
      />
    </div>
  );
}
