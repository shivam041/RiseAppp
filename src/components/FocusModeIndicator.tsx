import React from 'react';
import { useFocusTracking } from '../hooks/useFocusTracking';
import { useNavigate } from 'react-router-dom';

const FocusModeIndicator: React.FC = () => {
  const { isFocusModeActive, getCurrentFocusTime } = useFocusTracking();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    if (isFocusModeActive) {
      const interval = setInterval(() => {
        try {
          setCurrentTime(getCurrentFocusTime());
        } catch (error) {
          console.error('Error getting current focus time:', error);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFocusModeActive, getCurrentFocusTime]);

  if (!isFocusModeActive) return null;

  return (
    <div
      onClick={() => navigate('/focus')}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-green-600 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">
          Focus Mode: {Math.floor(currentTime / 60)}m {currentTime % 60}s
        </span>
      </div>
    </div>
  );
};

export default FocusModeIndicator;

