import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

import toast, { Toaster } from 'react-hot-toast';
import PuffLoader from 'react-spinners/PuffLoader';

import Game from '../Game';
import AgentLogin from './AgentLogin';

const AgentAuth = () => {

  const [agentIdFromServer, setAgentIdFromServer] = useState()

  const url = "http://localhost:5000";
  // const url = "https://api.mahalaxmi.xrvizion.com"


  const [isAuth, setIsAuth] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const userMobileNumber = useRef(0)
  const userSelectedLanguage = useRef(0)
  const [formSubmitted, setIsFormSubmitted] = useState(false)
  const [invokeAuth, setInvokeAuth] = useState(false)


  const checkStatus = async (mobileNumber) => {
    const endpoint = "/agent/authorize"
    const apiURL = url + endpoint
    console.warn("checking AGENT status", apiURL)

    try {
      const response = await axios.post(
        apiURL,
        { mobileNumber: mobileNumber }
        , {
          withCredentials: true
        }
      );
      if (response.data.isAgentAuthorized) {
        if (!localStorage.getItem('agentIdFromServer')) {
          setIsAuth(false)
          setInvokeAuth(true)
          setCheckingStatus(false)
          return;
        }
        setIsAuth(true)
        userMobileNumber.current = localStorage.getItem('mobile')
        setAgentIdFromServer(localStorage.getItem('agentIdFromServer'))
        setIsFormSubmitted(true)
        // const lsLangauge = localStorage.getItem("userSelectedLanguage")
        // console.warn("lsLanguage", lsLangauge)
        // userSelectedLanguage.current = lsLangauge || "EN"
      }
      else {
        setIsAuth(false)
        setInvokeAuth(true)
      }
      setCheckingStatus(false)
      console.warn("user authorized")
    } catch (error) {
      // console.error(error);
      setIsAuth(false)
      setCheckingStatus(false)
      setInvokeAuth(true)
      console.warn("user not authorized")
    }
  }

  const initiateAuthorization = () => {
    const mobileNumberLS = localStorage.getItem('mobile')

    setCheckingStatus(true)

    if (mobileNumberLS) {
      checkStatus(mobileNumberLS)
    }

    if (!mobileNumberLS) {
      setCheckingStatus(false)
      setInvokeAuth(true)
    }
  }

  useEffect(() => {
    initiateAuthorization()
  }, [])


  return (
    <>
      {
        checkingStatus
          ?
          <div className='loading-screen' style={{ position: "relative", display: 'flex', justifyContent: "center", zIndex: "10000" }}>

            <div style={{ zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: "-3rem", width: "100%", height: "100%" }}>
              <PuffLoader
                color="white"
                size={window.innerWidth > 768 ? 100 : 70}
              />
              {/* <div className='ff-m fs-m exp-loading-text' style={{ color: "white", marginLeft: "0.75rem" }}>Please wait&nbsp;...</div> */}
            </div>
          </div>
          :
          <>
            <div><Toaster /></div>
            <div className='container'>
              {
                formSubmitted ?
                  <Game agentIdFromServer={agentIdFromServer} userMobileNumber={userMobileNumber} isAgent={true} />
                  :
                  invokeAuth
                  &&
                  <AgentLogin setIsFormSubmitted={setIsFormSubmitted} userMobileNumber={userMobileNumber} userSelectedLanguage={userSelectedLanguage} setAgentIdFromServer={setAgentIdFromServer} />
              }
            </div>
          </>
      }
    </>
  )
}

export default AgentAuth