import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import CryptoJS from 'crypto-js';


import toast, { Toaster } from 'react-hot-toast';
import LoadingBar from 'react-top-loading-bar'

import '../Styles/loadingPage.css'

import ReactPlayer from 'react-player'

const AgentLogin = (props) => {

  const secretKey = 'LeapintotheOnline';

  const encodeId = (id) => {
    const encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    const urlSafeEncoded = encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Remove trailing '=' to ensure URL safety

    return urlSafeEncoded;
  };

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const initialOrientation = isMobile && window.matchMedia("(orientation: landscape)").matches
    ? 'landscape'
    : 'other';

  const [orientation, setOrientation] = useState(initialOrientation);

  useEffect(() => {
    const handleOrientationChange = () => {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile && window.matchMedia("(orientation: landscape)").matches) {
        setOrientation('landscape');
        // console.log("update to landscape mode");
      } else {
        setOrientation('other');
        // console.log("this is not landscape mode");
      }
    };

    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const topLoadingRef = useRef(null)
  const url = "http://localhost:5000"
  // const url = "https://api.mahalaxmi.xrvizion.com"


  const { setIsFormSubmitted, mobileScreenHeight, userMobileNumber, userSelectedLanguage, setAgentIdFromServer } = props

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState()
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  const [isVerifying, setIsVerifying] = useState(false)
  const [showOtp, setShowOtp] = useState(false)

  const [canResendOtp, setCanResendOtp] = useState(false)
  const resendOtpTimer = useRef()
  const [resendTimerCount, setResendTimerCount] = useState(59)
  const [otpSent, setOtpSent] = useState(false)

  const resendOtp = async () => {
    // console.log("otp sent")
    setCanResendOtp(false)
    setOtpSent(true)
    setResendTimerCount(59)
    clearInterval(resendOtpTimer.current)

    topLoadingRef.current.continuousStart()

    try {
      const response = await axios.post(url + '/agent/resendotp', {
        mobileNumber: mobile,
      });
      console.log('resend OTP: ', response.data);
      toast.dismiss()
      // setIsFormSubmitted(true)
      // localStorage.setItem('mobile', mobile)
      topLoadingRef.current.complete()
    }
    catch (error) {
      console.error('error submitting resend OTP:', error);
      setTimeout(() => {
        topLoadingRef.current.complete()
        toast.dismiss();
        setOtpSent(true)
        toast.error('Request failed', {
          position: window.innerWidth > 768 ? "top-right" : "bottom-center",
          className: window.innerWidth < 768 && "fs-sm",
          style: {
            background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
          },
        })
      }, 1000);
    }
  }

  const validateMobile = (input) => {
    // Regular expression to validate mobile number (assuming 10-digit numbers)
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(input);
  };

  // const sendLoginTime = async () => {
  //   try {
  //     console.warn("login time sent", mobile)

  //     const response = await axios.post(url + '/user/logintime', {
  //       mobileNumber: mobile,
  //     });
  //     console.log('Response:', response.data);
  //   }
  //   catch (error) {
  //     console.error('Error:', error);
  //   }
  // }

  useEffect(() => {
    // console.log(resendOtpTimer)
  }, [resendOtpTimer])



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMobile(mobile)) {
      toast.dismiss();
      toast.error('Please enter a valid mobile number', {
        position: window.innerWidth > 768 ? "top-right" : "bottom-center",
        className: window.innerWidth < 768 && "fs-sm",
        style: {
          background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
        },
      })
      return;
    }

    setIsVerifying(true)
    topLoadingRef.current.continuousStart()

    try {
      const response = await axios.post(url + '/agent/setagent', {
        mobileNumber: mobile,
        name: name,
        email: email
      });
      // console.log('received user details for verification: ', response.data);
      toast.dismiss()
      // setIsFormSubmitted(true)
      setShowOtp(true)
      setAgentIdFromServer(encodeId(response.data.id))
      localStorage.setItem('agentIdFromServer', encodeId(response.data.id))
      setIsVerifying(false)
      topLoadingRef.current.complete()

      resendOtpTimer.current = setInterval(() => {
        setResendTimerCount((prev) => prev - 1)
      }, 1000);
    }
    catch (error) {
      console.error('error submitting user details:', error);
      setTimeout(() => {
        setIsVerifying(false)
        topLoadingRef.current.complete()
        toast.dismiss();
        toast.error('Request failed', {
          position: window.innerWidth > 768 ? "top-right" : "bottom-center",
          className: window.innerWidth < 768 && "fs-sm",
          style: {
            background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
          },
        })
      }, 1000);
    }
  };

  useEffect(() => {
    if (resendTimerCount === 0) {
      setCanResendOtp(true)
      // console.log("It is", resendTimerCount)
    }
  }, [resendTimerCount])


  const verifyOtp = async (e) => {
    e.preventDefault()
    // console.log("form submitted")
    setIsVerifying(true)
    topLoadingRef.current.continuousStart()


    try {
      const response = await axios.post(url + '/agent/verifyotp', {
        mobileNumber: mobile,
        verificationToken: otp,
      }, { withCredentials: true });
      // console.log('otp verification successful:', response.data);
      toast.dismiss()
      topLoadingRef.current.complete()
      setIsFormSubmitted(true)
      localStorage.setItem('mobile', mobile)
      userMobileNumber.current = mobile
      setIsVerifying(false)
      userSelectedLanguage.current = selectedLanguage
      localStorage.setItem("userSelectedLanguage", selectedLanguage)
      // await sendLoginTime()
    }
    catch (error) {
      console.error('error verifying otp:', error);
      setTimeout(() => {
        setIsVerifying(false)
        topLoadingRef.current.complete()

        toast.dismiss();
        toast.error('Verification failed', {
          position: window.innerWidth > 768 ? "top-right" : "bottom-center",
          className: window.innerWidth < 768 && "fs-sm",
          style: {
            background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
          },
        })
      }, 1000);
    }

  }

  // const updateLoadingScreenHeight = () => {
  //   const loadingScreen = document.querySelector('.loading-screen');
  //   if (loadingScreen) {
  //     loadingScreen.style.height = `${mobileScreenHeight.current}px`;
  //     window.scrollTo(0, 0);
  //   }
  // };

  // Call the function on page load
  // useEffect(() => {
  //   updateLoadingScreenHeight();
  //   window.addEventListener('resize', updateLoadingScreenHeight);

  //   return () => {
  //     window.removeEventListener('resize', updateLoadingScreenHeight);
  //   };
  // }, []);

  const handleInputBlur = () => {
    // updateLoadingScreenHeight(); // Adjust loading screen height when input loses focus
  };

  const inputRef = useRef()
  const divRef = useRef()

  // useEffect(() => {
  //   const updateDivWidth = () => {
  //     setTimeout(() => {
  //       if (inputRef.current && divRef.current) {
  //         const inputWidth = inputRef.current.offsetWidth;
  //         // divRef.current.style.width = `${inputWidth}px`;
  //         document.getElementsByClassName('css-13cymwt-control')[0].style.setProperty('width', `${inputWidth}px`, 'important');
  //         console.log(inputWidth)
  //       }
  //     }, 1000);
  //   };

  //   // Update the div width initially
  //   updateDivWidth();

  //   // Update the div width on window resize
  //   window.addEventListener('resize', updateDivWidth);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('resize', updateDivWidth);
  //   };
  // }, []);


  const handleChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <>
      <div className='overlay'></div>

      <LoadingBar color="#edd795" ref={topLoadingRef} shadow={true} />

      <ReactPlayer
        url={`https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/Mahalaxmi-Bg-Video.mp4`}
        loop={true}
        controls={false}
        volume={1}
        muted={true}
        playing={false}
        playsinline={true}
        width={"unset"}
        height={"unset"}
        className="loading-video"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: window.innerWidth < 768 ? "50%" : "",
          transform: window.innerWidth < 768 ? "translateY(-50%)" : "",
        }}
      />

      <div className='loading-screen' style={{ overflow: orientation === "landscape" ? "scroll" : "hidden" }}>
        <div><Toaster /></div>
        {
          !showOtp
            ?
            <form onSubmit={handleSubmit} className="load-start-cont-new" style={{ justifyContent: orientation === "landscape" ? "normal" : "center", height: orientation === "landscape" ? "100%" : "65%", top: orientation === "landscape" ? "10%" : "", paddingBottom: orientation === "landscape" ? "15%" : "" }}>
              <div className='ff-m fs-xl title-text'>Welcome to Mahalaxmi</div>
              <div className='ff-r fs-sm subtitle-text'>Unlock the experience: Enter your name and email to begin!</div>
              <div className='note-cont-new form-cont'>
                <input required onBlur={handleInputBlur} type='text' className='text-input-new ff-m fs-sm' value={name} onChange={(event) => setName(event.target.value)} placeholder='Name'></input>
                <div className='input-cont'>
                  <input
                    ref={inputRef}
                    required
                    type='tel'
                    className='text-input-new ff-m fs-sm second-input'
                    value={mobile}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                      setMobile(onlyNumbers);
                    }}
                    placeholder='Mobile'
                  />
                  <input required onBlur={handleInputBlur} type='email' className='text-input-new ff-m fs-sm first-input' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email'></input>
                </div>
                {/* <div className='input-cont'> */}
                <select
                  className='text-input-new ff-m fs-sm custom-select'
                  required
                  value={selectedLanguage}
                  onChange={handleChange}
                >
                  <option selected value="EN">English</option>
                  <option value="हिं">Hindi</option>
                  <option value="MA">Marathi</option>
                </select>
                {/* <Select isSearchable={false} ref={divRef} placeholder={"Language"} className='ff-m fs-sm language-dropdown' options={options} /> */}
                {/* </div> */}
              </div>
              <button className='start-button ff-sb fs-sm' disabled={isVerifying}>
                {
                  !isVerifying
                    ?
                    "Submit"
                    :
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      Submitting...
                    </div>
                }
              </button>
            </form>
            :
            <form onSubmit={verifyOtp} className="load-start-cont-new" style={{ justifyContent: orientation === "landscape" ? "normal" : "center", height: orientation === "landscape" ? "100%" : "65%", top: orientation === "landscape" ? "10%" : "", paddingBottom: orientation === "landscape" ? "15%" : "" }}>
              <div className='ff-m fs-xl title-text'>Verification</div>
              <div className='ff-r fs-sm subtitle-text'>{`We have sent an OTP to this number: ${mobile}`}</div>
              <div className='note-cont-new form-cont'>
                <input required type='number' className='text-input-new ff-m fs-sm' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Code'></input>
              </div>
              <button className='start-button ff-sb fs-sm' disabled={isVerifying}>
                {
                  !isVerifying
                    ?
                    "Verify"
                    :
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      Verifying...
                    </div>
                }
              </button>
              {
                !otpSent
                &&
                <div className='ff-r fs-sm subtitle-text'
                  onClick={() => {
                    if (canResendOtp) {
                      resendOtp()
                    }
                  }}
                  style={{
                    marginTop: "1.5rem",
                    cursor: canResendOtp ? "pointer" : "not-allowed"
                  }}>{`Resend OTP ${canResendOtp ? `?` : `in ${resendTimerCount} secs`}`}</div>
              }
            </form>
        }

        <div className="xrv-logo-new" style={{ display: orientation === "landscape" ? "none" : "block" }}>
          <div className='xrv-logo-text-new ff-l fs-xs'>powered by</div>
          <img className="xrv-logo-img-new" src="https://xrv-xrc.s3.ap-south-1.amazonaws.com/XRVizion/xrv.png" alt=""></img>
        </div>
      </div>
    </>
  )
}

export default AgentLogin