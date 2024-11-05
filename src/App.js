import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';

import axios from 'axios'

import './App.css';

import UserAuth from './components/Auth/UserAuth';
import AgentAuth from './components/Auth/AgentAuth';

function App() {
  // const url = "http://localhost:5000"
  const url = "https://api.aadhya.xrvizion.com"
  const secretKey = 'LeapintotheOnline';

  const decodeId = (encoded) => {
    // Adjust encoded string to replace URL-safe characters with original characters
    let urlUnsafeEncoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  
    // Add back the padding '=' if needed
    const paddingNeeded = 4 - (urlUnsafeEncoded.length % 4);
    if (paddingNeeded && paddingNeeded !== 4) {
      urlUnsafeEncoded += '='.repeat(paddingNeeded);
    }
  
    const bytes = CryptoJS.AES.decrypt(urlUnsafeEncoded, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
    return decrypted;
  };

  useEffect(() => {
    const handleResize = () => {
      document.body.style.height = `${window.innerHeight}px`;
      document.body.style.width = `${window.innerWidth}px`;
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const UserRoute = () => {
    const { agentName } = useParams();
    const [agentId, setAgentId] = useState()
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
      const checkAgentIdExists = async () => {
        // const decryptedKey = decodeId(agentId);
        // if (!decryptedKey) {
          // setIsValid(false);
          // return;
        // }

        try {
          const response = await axios.post(
            url + '/agent/isvalidagent',
            { url: window.location.href.endsWith('/') ? window.location.href.slice(0, -1) : window.location.href },
            { withCredentials: true }
          );
          setIsValid(response.data.isValid);
          setAgentId(response.data.agentId)
        } catch (error) {
          setIsValid(false);
        }
      };

      checkAgentIdExists();
    }, [agentName]);

    if (isValid === null) {
      // Show a loading indicator or nothing while checking
      return <div>Loading...</div>;
    }

    if (!isValid) {
      return <Navigate to="/" />;
    }

    return <UserAuth agentId={agentId} />;
  };

  return (
    <Router>
      <Routes>

        {/* USER */}
        <Route path="/" element={<UserAuth agentId={"a1"} />} />
        <Route path="/:agentId" element={<UserRoute />} />

        {/* AGENT */}
        {/* <Route path="/agent" element={<AgentAuth />} /> */}

      </Routes>
    </Router>
  );
}

export default App;
