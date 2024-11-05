import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import '../Styles/loadingPage.css';
import CryptoJS from 'crypto-js';

const UserLogin = (props) => {
  const secretKey = 'LeapintotheOnline';

  const decodeId = (encoded) => {
    let urlUnsafeEncoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const paddingNeeded = 4 - (urlUnsafeEncoded.length % 4);
    if (paddingNeeded && paddingNeeded !== 4) {
      urlUnsafeEncoded += '='.repeat(paddingNeeded);
    }

    const bytes = CryptoJS.AES.decrypt(urlUnsafeEncoded, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted;
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
      } else {
        setOrientation('other');
      }
    };

    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const topLoadingRef = useRef(null);
  const url = "https://api.aadhya.xrvizion.com";

  const { setIsFormSubmitted, mobileScreenHeight, userMobileNumber, userSelectedLanguage, agentId, userName } = props;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState();
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [wasAutoFilled, setWasAutoFilled] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const [canResendOtp, setCanResendOtp] = useState(false);
  const resendOtpTimer = useRef();
  const [resendTimerCount, setResendTimerCount] = useState(59);
  const [otpSent, setOtpSent] = useState(false);

  const resendOtp = async () => {
    setCanResendOtp(false);
    setOtpSent(true);
    setResendTimerCount(59);
    clearInterval(resendOtpTimer.current);

    topLoadingRef.current.continuousStart();

    try {
      const response = await axios.post(url + '/user/resendotp', {
        mobileNumber: countryCode + mobile,
      });
      toast.dismiss();
      topLoadingRef.current.complete();
    } catch (error) {
      console.error('error submitting resend OTP:', error);
      setTimeout(() => {
        topLoadingRef.current.complete();
        toast.dismiss();
        setOtpSent(true);
        toast.error('Request failed', {
          position: window.innerWidth > 768 ? "top-right" : "bottom-center",
          className: window.innerWidth < 768 && "fs-sm",
          style: {
            background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
          },
        });
      }, 1000);
    }
  };

  const validateMobile = (input) => {
    // If the number was autofilled, skip validation entirely
    if (wasAutoFilled) {
      return true;
    }
    // Only validate manually entered numbers for length > 10
    return input.length <= 10;
  };

  useEffect(() => {
    if (resendTimerCount === 0) {
      setCanResendOtp(true);
    }
  }, [resendTimerCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMobile(mobile)) {
      toast.dismiss();
      toast.error('Mobile number cannot exceed 10 digits', {
        position: window.innerWidth > 768 ? "top-right" : "bottom-center",
        className: window.innerWidth < 768 && "fs-sm",
        style: {
          background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
        },
      });
      return;
    }

    setIsVerifying(true);
    topLoadingRef.current.continuousStart();

    // Directly set the form as submitted and store data in localStorage
    setIsFormSubmitted(true);
    localStorage.setItem('mobile', countryCode + mobile);
    setIsVerifying(false);
    topLoadingRef.current.complete();

    userMobileNumber.current = countryCode + mobile;
    userName.current = name;
    userSelectedLanguage.current = selectedLanguage;
    localStorage.setItem("userSelectedLanguage", selectedLanguage);
    localStorage.setItem("name", name);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    topLoadingRef.current.continuousStart();

    try {
      const response = await axios.post(url + '/user/verifyotp', {
        mobileNumber: countryCode + mobile,
        verificationToken: otp,
      }, { withCredentials: true });
      toast.dismiss();
      topLoadingRef.current.complete();
      setIsFormSubmitted(true);
      localStorage.setItem('mobile', countryCode + mobile);
      userMobileNumber.current = countryCode + mobile;
      setIsVerifying(false);
      userSelectedLanguage.current = selectedLanguage;
      localStorage.setItem("userSelectedLanguage", selectedLanguage);
    } catch (error) {
      console.error('error verifying otp:', error);
      setTimeout(() => {
        setIsVerifying(false);
        topLoadingRef.current.complete();
        toast.dismiss();
        toast.error('Verification failed', {
          position: window.innerWidth > 768 ? "top-right" : "bottom-center",
          className: window.innerWidth < 768 && "fs-sm",
          style: {
            background: 'radial-gradient(218.89% 191.66% at 50.15% 0.00%, rgba(248, 246, 227, 0.8) 0%, #ffffff 100%)',
          },
        });
      }, 1000);
    }
  };

  const inputRef = useRef();

  const handleChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  // Handle input changes and detect autofill
  const handleInputChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    setMobile(onlyNumbers);

    // Check if the change was due to autofill
    if (e.target.matches(':-webkit-autofill') || e.isTrusted === false) {
      setWasAutoFilled(true);
    }
  };

  return (
    <>
      <div className='overlay'></div>
      <LoadingBar color="#edd795" ref={topLoadingRef} shadow={true} />

      <div className='loading-screen' style={{ overflow: orientation === "landscape" ? "scroll" : "hidden" }}>
        <div><Toaster /></div>
        {
          !showOtp
            ?
            <form onSubmit={handleSubmit} className="load-start-cont-new" style={{ justifyContent: orientation === "landscape" ? "normal" : "center", height: orientation === "landscape" ? "100%" : "65%", top: orientation === "landscape" ? "10%" : "", paddingBottom: orientation === "landscape" ? "15%" : "" }}>
              <div className='ff-m fs-xl title-text'>Welcome to Jain's Aadhya</div>
              <div className='ff-r fs-sm subtitle-text'>Unlock the experience: Enter your name and email to begin!</div>
              <div className='note-cont-new form-cont'>
                <input
                  required
                  type="text"
                  className="text-input-new ff-m fs-sm"
                  value={name}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    if (/^[a-zA-Z0-9\s]*$/.test(newValue)) {
                      setName(newValue);
                    }
                  }}
                  placeholder="Name"
                />
                <div className='input-cont'>
                  <input
                    ref={inputRef}
                    required
                    type='tel'
                    className='text-input-new ff-m fs-sm second-input'
                    value={mobile}
                    onChange={handleInputChange}
                    onAnimationStart={(e) => {
                      // Chrome adds a special animation for autofill
                      if (e.animationName === 'onAutoFillStart') {
                        setWasAutoFilled(true);
                      }
                    }}
                    placeholder='Mobile'
                  />
                  <input
                    type='email'
                    className='text-input-new ff-m fs-sm first-input'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email'
                  />
                </div>
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
              <div className='ff-r fs-sm subtitle-text'>{`We have sent an OTP to this number: ${countryCode + mobile}`}</div>
              <div className='note-cont-new form-cont'>
                <input
                  required
                  type='number'
                  className='text-input-new ff-m fs-sm'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder='Code'
                />
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
  );
};

export default UserLogin;
