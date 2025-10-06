import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingData } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    gender: '',
    goal_reason: '',
    daily_water_goal: 8,
    daily_exercise_goal: 30,
  });
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuth();

  const handleChange = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await completeOnboarding(formData);
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="auth-title gradient-text mb-8">What's your name?</h2>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-400 to-blue-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <input
              type="text"
              className="form-input text-center text-lg"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <h2 className="auth-title gradient-text mb-8">What's your gender?</h2>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-400 to-blue-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    formData.gender === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  onClick={() => handleChange('gender', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <h2 className="auth-title gradient-text mb-8">Why do you want to reset your life?</h2>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-400 to-blue-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { value: 'fix_habits', label: 'Fix bad habits & gain discipline' },
                { value: 'improve_body_mind', label: 'Improve body & mind' },
                { value: 'grow_career', label: 'Grow in study & career' },
                { value: 'recover_setbacks', label: 'Recover from life setbacks' },
                { value: 'restart_purpose', label: 'Restart life with purpose' }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    formData.goal_reason === option.value
                      ? 'bg-orange-500 text-white border-2 border-blue-400'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  onClick={() => handleChange('goal_reason', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <h2 className="auth-title gradient-text mb-8">How many glasses of water do you want to drink daily?</h2>
            <p className="text-gray-400 mb-8">We'll remind you every 1.5 hours to stay hydrated</p>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-400 to-blue-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
                onClick={() => handleChange('daily_water_goal', Math.max(4, formData.daily_water_goal - 1))}
              >
                -
              </button>
              <div className="bg-gray-700 rounded-lg px-8 py-4">
                <div className="text-3xl font-bold text-white">{formData.daily_water_goal}</div>
                <div className="text-gray-400">glasses</div>
              </div>
              <button
                className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600"
                onClick={() => handleChange('daily_water_goal', Math.min(16, formData.daily_water_goal + 1))}
              >
                +
              </button>
            </div>
            <p className="text-gray-400 text-sm">4 - 16 glasses</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-gray-400">{Math.round((step / 4) * 100)}%</div>
        </div>

        {renderStep()}

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.name) || (step === 2 && !formData.gender) || (step === 3 && !formData.goal_reason)}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loading-spinner mr-2"></span>
                Setting up...
              </span>
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
