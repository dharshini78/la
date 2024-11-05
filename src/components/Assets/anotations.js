import React, { useState } from 'react';
import { MdOutlineNavigateNext } from 'react-icons/md';

const GlassmorphismDialog = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Press to talk with Sia AI Assistant",
    "Sia is your virtual assistant",
    "Press and Navigate to see the rooms of the apartment",
    "Scroll here to see the list of rooms",
    "Drop down to choose your language",
    "Chat with Sia here in the text box.",
    "Click this to play the video of the site and eagle views"
  ];

  const handleNext = () => {
    setStepIndex((prevIndex) => Math.min(prevIndex + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setStepIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-[400px] h-[400px] p-6 rounded-lg shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.35)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <div className="text-center text-white">
          <p className="text-lg font-semibold">Step {stepIndex + 1}/{steps.length}</p>
          <p className="mt-4">{steps[stepIndex]}</p>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handlePrevious}
            disabled={stepIndex === 0}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
            onClick={handleNext}
            disabled={stepIndex === steps.length - 1}
          >
            Next <MdOutlineNavigateNext className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismDialog;
