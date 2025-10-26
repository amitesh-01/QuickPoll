import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PollCard from '../components/PollCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { pollsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    fetchUserPolls();
  }, []);

  const fetchUserPolls = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getAll();
      // Filter polls created by current user
      const userPolls = response.data.filter(poll => poll.owner?.id === user?.id);
      setPolls(userPolls);
      
      // Calculate stats
      const totalVotes = userPolls.reduce((sum, poll) => {
        return sum + (poll.options?.reduce((optSum, option) => optSum + (option.vote_count || 0), 0) || 0);
      }, 0);
      
      const totalLikes = userPolls.reduce((sum, poll) => sum + (poll.likes_count || 0), 0);
      
      setStats({
        totalPolls: userPolls.length,
        totalVotes,
        totalLikes,
      });
    } catch (error) {
      toast.error('Failed to fetch your polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await pollsAPI.delete(pollId);
      toast.success('Poll deleted successfully!');
      // Remove poll from local state
      setPolls(polls.filter(poll => poll.id !== pollId));
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPolls: prev.totalPolls - 1,
      }));
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete poll';
      toast.error(message);
    }
  };

  const handleVote = () => {
    // Refresh polls to get updated vote counts
    fetchUserPolls();
  };

  const handleLike = () => {
    // Refresh polls to get updated like counts
    fetchUserPolls();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your polls and track their performance
              </p>
            </div>
            <Link
              to="/create"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create New Poll
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Polls
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalPolls}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Votes
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalVotes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Likes
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalLikes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Your Polls */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Polls</h2>
          
          {polls.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No polls created yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first poll to start engaging with your audience!
              </p>
              <Link
                to="/create"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Poll
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {polls.map((poll) => (
                <div key={poll.id} className="relative">
                  <PollCard
                    poll={poll}
                    onVote={handleVote}
                    onLike={handleLike}
                  />
                  {/* Delete button for own polls */}
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete poll"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;