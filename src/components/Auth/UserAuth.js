import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

import PuffLoader from 'react-spinners/PuffLoader';
import toast, { Toaster } from 'react-hot-toast';
import Game from '../Game';
import UserLogin from './UserLogin';


const UserAuth = ({ agentId }) => {

  // console.log(agentId)

  // const url = "http://localhost:5000";
  const url = "https://api.aadhya.xrvizion.com"


  const [isAuth, setIsAuth] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const userMobileNumber = useRef(0)
  const userName = useRef("")
  const userSelectedLanguage = useRef(0)
  const [formSubmitted, setIsFormSubmitted] = useState(false)
  const [invokeAuth, setInvokeAuth] = useState(false)


  const checkStatus = async (mobileNumber, name) => {
    console.warn("checking status")
    const endpoint = "/user/authorize"
    const apiURL = url + endpoint
    // console.log(apiURL)
    try {
      const response = await axios.post(
        apiURL,
        { mobileNumber: mobileNumber, name: name }
        , {
          withCredentials: true
        }
      );
      if (response.data.isUserAuthorized) {
        // if (localStorage.getItem('agentIdFromServer') !== null) {
        //   setIsAuth(false)
        //   setInvokeAuth(true)
        //   setCheckingStatus(false)
        //   return;
        // }
        setIsAuth(true)
        userMobileNumber.current = localStorage.getItem('mobile')
        userName.current = localStorage.getItem('name')
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
    const nameLS = localStorage.getItem('name')
    // console.log("Agent ID:", agentId)

    setCheckingStatus(true)

    if (mobileNumberLS && nameLS) {
      checkStatus(mobileNumberLS, nameLS)
    }

    if (!mobileNumberLS || !nameLS) {
      setCheckingStatus(false)
      setInvokeAuth(true)
    }
  }

  // useEffect(() => {
  //   initiateAuthorization()
  // }, [])


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
                  <Game userMobileNumber={userMobileNumber} userName={userName} isAgent={false} />
                  :
                  <UserLogin setIsFormSubmitted={setIsFormSubmitted} userMobileNumber={userMobileNumber} userSelectedLanguage={userSelectedLanguage} agentId={agentId} userName={userName}/>
              }
            </div>
          </>
      }
    </>
  )
}

export default UserAuth