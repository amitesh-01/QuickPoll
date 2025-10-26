import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsAPI } from '../api';
import toast from 'react-hot-toast';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''], // Start with 2 empty options
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Poll title is required');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    try {
      setLoading(true);
      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        options: validOptions.map(option => ({ text: option.trim() })),
      };

      const response = await pollsAPI.create(pollData);
      toast.success('Poll created successfully!');
      navigate(`/poll/${response.data.id}`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create poll';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Poll</h1>
          <p className="text-gray-600 mt-2">
            Ask your audience what they think about any topic
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Poll Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Poll Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What's your poll question?"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Poll Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add more context to your poll..."
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Poll Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Options *
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      maxLength={100}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              {formData.options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Option
                </button>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                Minimum 2 options, maximum 10 options
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Poll'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {formData.title || 'Your poll title will appear here'}
            </h4>
            {formData.description && (
              <p className="text-gray-600 mb-4">{formData.description}</p>
            )}
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                option.trim() && (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    {option}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;