import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { pollsAPI, votesAPI, likesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchPoll();
    fetchResults();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const response = await pollsAPI.getById(id);
      setPoll(response.data);
    } catch (error) {
      toast.error('Poll not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await votesAPI.getResults(id);
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const handleVote = async (optionId) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }

    try {
      setVoting(true);
      await votesAPI.vote(id, optionId);
      toast.success('Vote recorded!');
      // Refresh poll and results
      await fetchPoll();
      await fetchResults();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to vote';
      toast.error(message);
    } finally {
      setVoting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like polls');
      navigate('/login');
      return;
    }

    try {
      setLiking(true);
      if (poll.user_liked) {
        await likesAPI.unlike(id);
        toast.success('Poll unliked!');
      } else {
        await likesAPI.like(id);
        toast.success('Poll liked!');
      }
      // Refresh poll
      await fetchPoll();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to like poll';
      toast.error(message);
    } finally {
      setLiking(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await pollsAPI.delete(id);
      toast.success('Poll deleted successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete poll';
      toast.error(message);
    }
  };

  const getTotalVotes = () => {
    if (!results) return 0;
    return results.reduce((total, result) => total + result.vote_count, 0);
  };

  const getVotePercentage = (voteCount) => {
    const total = getTotalVotes();
    return total > 0 ? ((voteCount / total) * 100).toFixed(1) : 0;
  };

  const getOptionResult = (optionId) => {
    return results?.find(result => result.option_id === optionId) || { vote_count: 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading poll details..." />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll not found</h2>
          <p className="text-gray-600 mb-4">The poll you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === poll.owner?.id;
  const hasVoted = poll.user_voted;
  const totalVotes = getTotalVotes();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Poll Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Poll Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {poll.title}
                </h1>
                {poll.description && (
                  <p className="text-gray-600 text-lg">{poll.description}</p>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={handleDeletePoll}
                  className="ml-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Delete poll"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Poll Meta */}
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span>by {poll.owner?.username || 'Unknown'}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(poll.created_at))} ago</span>
              <span>•</span>
              <span>{totalVotes} votes</span>
            </div>
          </div>

          {/* Poll Options */}
          <div className="p-6">
            <div className="space-y-4">
              {poll.options?.map((option) => {
                const result = getOptionResult(option.id);
                const percentage = getVotePercentage(result.vote_count);
                
                return (
                  <div key={option.id} className="relative">
                    <button
                      onClick={() => handleVote(option.id)}
                      disabled={voting || hasVoted}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                        hasVoted
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md'
                      } ${voting ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-lg">
                          {option.text}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {result.vote_count} votes ({percentage}%)
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Voting Status */}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Sign in to vote</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      <Link to="/login" className="underline hover:no-underline">
                        Login
                      </Link>{' '}
                      or{' '}
                      <Link to="/register" className="underline hover:no-underline">
                        register
                      </Link>{' '}
                      to participate in this poll.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasVoted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">You've already voted!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Thank you for participating. Results are updated in real-time.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Poll Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Share this poll with others
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Copy Link
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{totalVotes} total votes</span>
                <button
                  onClick={handleLike}
                  disabled={liking || !isAuthenticated}
                  className={`flex items-center space-x-1 transition-colors ${
                    poll.user_liked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-500 hover:text-red-500'
                  } ${liking || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg
                    className={`w-5 h-5 ${poll.user_liked ? 'fill-current' : ''}`}
                    fill={poll.user_liked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{poll.likes_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetail;