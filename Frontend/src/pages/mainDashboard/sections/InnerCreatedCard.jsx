import React, { useEffect, useState, useRef } from "react";
import CreatedHackathonOverview from "./CreatedHackathonOverview";
import CreatedHackathonViews from "./CreatedHackathonViews";
import CreatedHackathonModals from "./CreatedHackathonModals";
import { useNavigate } from "react-router-dom";
import { useToast } from '../../../hooks/use-toast';
import { fetchHackathonParticipants } from "../../../lib/api";
import ChatModal from '../components/ChatModal';
import BaseModal from "./components/Hackathon/TeamModals/BaseModal";
import CustomSubmissionForm from "./CustomSubmissionForm";

export default function InnerCreatedCard({ hackathon: hackathonProp, onBack }) {
  // All hooks at the top!
  const [hackathon, setHackathon] = useState(hackathonProp || null);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionHackathon, setSubmissionHackathon] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const hackathonToDelete = useRef(null);
  const navigate = useNavigate();
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorProposals, setSponsorProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [reviewModal, setReviewModal] = useState({ open: false, proposalId: null, action: '', loading: false, message: '', price: '' });
  const [messageModal, setMessageModal] = useState({ open: false, proposal: null, message: '' });
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProposalId, setChatProposalId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsModalLoading, setParticipantsModalLoading] = useState(false);
  const [participantsModalError, setParticipantsModalError] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [showTeamsView, setShowTeamsView] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [showSubmissionsView, setShowSubmissionsView] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedType, setSelectedType] = useState('All');

  // Define these before your return
  const totalParticipants = participants.length;
  const totalTeams = teams.length;
  const totalSubmissions = submissions.length;

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setFetchError(null);
      const token = localStorage.getItem("token");
      const id = hackathonProp?._id;
      if (!id) return;
      try {
        const fetchJson = async (url) => {
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error(await res.text());
          return await res.json();
        };
        const [h, t, s, p] = await Promise.all([
          fetchJson(`http://localhost:3000/api/hackathons/${id}`),
          fetchJson(`http://localhost:3000/api/teams/hackathon/${id}/all`),
          fetchJson(`http://localhost:3000/api/projects/hackathon/${id}`),
          fetchJson(`http://localhost:3000/api/registration/hackathon/${id}/participants`),
        ]);
        setTeams(t);
        setParticipants(p.participants || []);

        // Fetch all submissions for this hackathon (admin endpoint)
        const submissionsRes = await fetchJson(`http://localhost:3000/api/submission-form/admin/hackathon/${id}`);
        const allSubs = submissionsRes.submissions || [];
        // Separate project and PPT submissions (match judge panel logic)
        const pptSubs = allSubs
          .filter((s) => s.pptFile && !s.projectId)
          .map((s) => ({
            ...s,
            type: 'ppt',
            title: s.originalName || 'PPT Submission',
          }));
        const projectSubs = allSubs.filter((s) => s.projectId);
        setSubmissions([...projectSubs, ...pptSubs]);
        setHackathon(h);
      } catch (err) {
        setFetchError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    if (hackathonProp?._id) fetchAll();
  }, [hackathonProp]);

  // All handlers and logic for modals, delete, etc. (move from InnerCreatedCard.jsx)
  // ...

  // Quick Actions handlers
  const handleExportParticipants = async () => {
    if (!hackathon || !hackathon._id) return toast({ title: 'Error', description: 'No hackathon selected.' });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/registration/hackathon/${hackathon._id}/participants/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export participants');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'participants.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Exported', description: 'Participants CSV downloaded.' });
    } catch (err) {
      toast({ title: 'Export Failed', description: err.message });
    }
  };
  const handleExportSubmissions = async () => {
    if (!hackathon || !hackathon._id) return toast({ title: 'Error', description: 'No hackathon selected.' });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/submission-form/admin/hackathon/${hackathon._id}/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export submissions');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'submissions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Exported', description: 'Submissions CSV downloaded.' });
    } catch (err) {
      toast({ title: 'Export Failed', description: err.message });
    }
  };
  const handleSubmissionForm = () => setShowSubmissionForm(true);
  const handleSendCertificates = () => toast({ title: 'Send Certificates', description: 'Sending certificates is not implemented yet.' });
  const handleViewLeaderboard = () => toast({ title: 'View Leaderboard', description: 'Leaderboard is not implemented yet.' });
  const handleSendAnnouncements = () => toast({ title: 'Send Announcements', description: 'Announcements is not implemented yet.' });
  const handleDeleteHackathon = () => setShowDeleteDialog(true);
  const handleReviewSponsoredPS = () => setShowSponsorModal(true);

  if (loading) return <div>Loading...</div>;
  if (fetchError) return <div className="text-red-600 font-bold">Error: {fetchError}</div>;
  if (!hackathon) return <div>No data found.</div>;

  const isDetailView = showParticipantsView || showTeamsView || showSubmissionsView;

  const cancelDelete = () => setShowDeleteDialog(false);

  const confirmDelete = async () => {
    if (!hackathon) return;
    setDeletingId(hackathon._id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/hackathons/${hackathon._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete hackathon");
      setShowDeleteDialog(false);
      if (typeof onBack === 'function') onBack();
    } catch (err) {
      toast({ title: 'Error deleting hackathon', description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {!isDetailView && (
        <>
          <CreatedHackathonOverview
            hackathon={hackathon}
            totalParticipants={totalParticipants}
            totalTeams={totalTeams}
            totalSubmissions={totalSubmissions}
            onBack={onBack}
            onShowParticipantsView={() => setShowParticipantsView(true)}
            onShowTeamsView={() => setShowTeamsView(true)}
            onShowSubmissionsView={() => setShowSubmissionsView(true)}
            onEditHackathon={() => navigate(`/dashboard/edit-hackathon/${hackathon._id}`)}
            onExportParticipants={handleExportParticipants}
            onExportSubmissions={handleExportSubmissions}
            onSubmissionForm={handleSubmissionForm}
            onSendCertificates={handleSendCertificates}
            onViewLeaderboard={handleViewLeaderboard}
            onSendAnnouncements={handleSendAnnouncements}
            onDeleteHackathon={handleDeleteHackathon}
            onReviewSponsoredPS={handleReviewSponsoredPS}
          />
          {showSubmissionForm && (
            <CustomSubmissionForm
              hackathon={hackathon}
              onCancel={() => setShowSubmissionForm(false)}
            />
          )}
        </>
      )}
      {isDetailView && (
        <CreatedHackathonViews
          showSubmissionsView={showSubmissionsView}
          showParticipantsView={showParticipantsView}
          showTeamsView={showTeamsView}
          submissions={submissions}
          participants={participants}
          teams={teams}
          selectedSubmissionId={selectedSubmissionId}
          setSelectedSubmissionId={setSelectedSubmissionId}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          setShowSubmissionsView={setShowSubmissionsView}
          setShowParticipantsView={setShowParticipantsView}
          setShowTeamsView={setShowTeamsView}
          user={user}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      )}
      <CreatedHackathonModals
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        showSponsorModal={showSponsorModal}
        setShowSponsorModal={setShowSponsorModal}
        reviewModal={reviewModal}
        setReviewModal={setReviewModal}
        messageModal={messageModal}
        setMessageModal={setMessageModal}
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatProposalId={chatProposalId || ''}
        setChatProposalId={setChatProposalId}
        showParticipantsModal={showParticipantsModal}
        setShowParticipantsModal={setShowParticipantsModal}
        participantsList={participantsList}
        participantsModalLoading={participantsModalLoading}
        participantsModalError={participantsModalError}
        deletingId={deletingId}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
        sponsorProposals={sponsorProposals}
        loadingProposals={loadingProposals}
        handleReviewProposal={() => {/* implement review logic here */}}
        handleSendMessageToSponsor={() => {/* implement send message logic here */}}
        user={user || {}}
      />
    </>
  );
}
