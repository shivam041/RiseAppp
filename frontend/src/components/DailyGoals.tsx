import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { DailyGoal } from '../types';

interface DailyGoalsProps {
  selectedDate: string;
}

const DailyGoals: React.FC<DailyGoalsProps> = ({ selectedDate }) => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const data = await authAPI.getDailyGoals(selectedDate);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setLoading(true);
    try {
      const newGoal = await authAPI.createDailyGoal({
        title: newGoalTitle,
        description: newGoalDescription,
        priority: newGoalPriority,
        date: selectedDate,
      });
      setGoals([...goals, newGoal]);
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalPriority('medium');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
    try {
      const updatedGoal = await authAPI.completeDailyGoal(goalId);
      setGoals(goals.map(goal => 
        goal.id === goalId ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await authAPI.deleteDailyGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedCount = goals.filter(goal => goal.is_completed).length;
  const totalCount = goals.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Daily Goals ({completedCount}/{totalCount})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title
            </label>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your goal..."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={newGoalPriority}
              onChange={(e) => setNewGoalPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Goal'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No goals for this day. Add one to get started!
          </p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                goal.is_completed 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(goal.priority)}`}>
                      {goal.priority.toUpperCase()}
                    </span>
                    {goal.is_completed && (
                      <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                    )}
                  </div>
                  
                  <h4 className={`font-medium ${goal.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {goal.title}
                  </h4>
                  
                  {goal.description && (
                    <p className={`text-sm mt-1 ${goal.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {goal.description}
                    </p>
                  )}
                  
                  {goal.completed_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Completed at {new Date(goal.completed_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {!goal.is_completed && (
                    <button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Mark as completed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete goal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalCount > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;
