import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ImagePanorama, Viewer } from 'panolens';
import { X } from 'lucide-react';

const annotations = [
  "Press Microphone to talk with Sia AI Assistant",
  "Press and Navigate to see the rooms of the apartment",
  "Scroll to see the list of rooms",
  "Drop down to choose your language",
  "Press play button to watch the video of the site and Property location"
];

const PanoramaViewer = ({ imagePath }) => {
  const viewerContainer = useRef(null);
  const panorama = useRef(null);
  const viewer = useRef(null);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    if (panorama.current) {
      if (viewer.current) {
        viewer.current.remove(panorama.current);
      }
      panorama.current.dispose();
      panorama.current = null;
    }

    panorama.current = new ImagePanorama(imagePath);

    if (!viewer.current) {
      viewer.current = new Viewer({
        container: viewerContainer.current,
        autoHideInfospot: false,
        controlBar: false,
        cameraFov: 75,
        output: 'console',
      });
    }

    viewer.current.add(panorama.current);

    return () => {
      if (panorama.current) {
        viewer.current.remove(panorama.current);
        panorama.current.dispose();
        panorama.current = null;
      }
    };
  }, [imagePath]);

  const popupStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '20px',
    borderRadius: '12px',
    fontFamily: 'Clash Display Medium, sans-serif',
    color: '#000',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    opacity: showPopup ? 1 : 0,
    visibility: showPopup ? 'visible' : 'hidden',
    transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out',
    zIndex: 1000
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    opacity: 0.7,
    transition: 'opacity 0.2s ease-in-out'
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        ref={viewerContainer}
        style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }}
        className='canvas-360'
      />
      {showPopup && (
        <div style={popupStyle}>
          <button 
            style={closeButtonStyle} 
            onClick={() => setShowPopup(false)}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.7}
          >
            <X size={24} />
          </button>
          <div style={{ marginTop: '20px' }}>
            {annotations.map((annotation, index) => (
              <div 
                key={index} 
                style={{
                  marginBottom: '15px',
                  padding: '10px',
                  borderBottom: index !== annotations.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {annotation}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PanoramaViewer;