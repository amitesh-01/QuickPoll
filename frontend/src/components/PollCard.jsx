import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { votesAPI, likesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PollCard = ({ poll, onVote, onLike }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleVote = async (optionId) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }

    try {
      setVoting(true);
      await votesAPI.vote(poll.id, optionId);
      toast.success('Vote recorded!');
      if (onVote) onVote(poll.id, optionId);
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
        await likesAPI.unlike(poll.id);
        toast.success('Poll unliked!');
      } else {
        await likesAPI.like(poll.id);
        toast.success('Poll liked!');
      }
      if (onLike) onLike(poll.id);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to like poll';
      toast.error(message);
    } finally {
      setLiking(false);
    }
  };

  const getTotalVotes = () => {
    return poll.options?.reduce((total, option) => total + (option.vote_count || 0), 0) || 0;
  };

  const getVotePercentage = (voteCount) => {
    const total = getTotalVotes();
    return total > 0 ? ((voteCount / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/poll/${poll.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {poll.title}
          </Link>
          {poll.description && (
            <p className="text-gray-600 mt-2">{poll.description}</p>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-3 mb-4">
        {poll.options?.map((option) => {
          const percentage = getVotePercentage(option.vote_count || 0);
          const hasVoted = poll.user_voted;
          
          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => handleVote(option.id)}
                disabled={voting || hasVoted}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  hasVoted
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                } ${voting ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{option.text}</span>
                  <span className="text-sm text-gray-500">
                    {option.vote_count || 0} votes ({percentage}%)
                  </span>
                </div>
                {hasVoted && (
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center space-x-4">
          <span>by {poll.owner?.username || 'Unknown'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(poll.created_at))} ago</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>{getTotalVotes()} votes</span>
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center space-x-1 transition-colors ${
              poll.user_liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            } ${liking ? 'opacity-50' : ''}`}
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
  );
};

export default PollCard;