import React, { useEffect, useState } from 'react'
import { PiMicrophone } from "react-icons/pi";

const Welcome = ({ startGame }) => {

  const [fontClassName, setFontClassName] = useState(window.innerWidth > 850 ? "ff-r fs-sm" : "ff-r fs-xs")
  const [isMobileDevice, setIsMobileDevice] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !/Windows/i.test(navigator.userAgent))

  // Call the function on page load
  useEffect(() => {
    const updateHelpContSize = () => {
      const loadingScreen = document.querySelector('.help-cont');
      if (loadingScreen) {
        loadingScreen.style.height = window.innerHeight + 'px';
        loadingScreen.style.width = window.innerWidth + 'px';
        setIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !/Windows/i.test(navigator.userAgent))
      }

      if (window.innerWidth > 850) {
        setFontClassName("ff-r fs-sm")
      }
      else {
        setFontClassName("ff-r fs-xs")
      }
    };

    window.addEventListener('resize', updateHelpContSize);

    return () => {
      window.removeEventListener('resize', updateHelpContSize);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        top: "0",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "3"
      }}
    >
      <div
        className='help-cont'
        style={{
          background: "rgb(0 0 0 / 90%)",
          color: "white",
          margin: "auto",
          position: "relative",
          width: window.innerWidth,
          height: window.innerHeight,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <div className='logo-cont'>
          <img src='https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/image.pn' alt=''></img>
        </div>
        <div className={`ff-m ${window.innerWidth < 768 ? "fs-m" : "fs-lg"} title-line`} style={{ textAlign: "center" }}>Virtual AI tour of Jain's Aadhya</div>
        <button
          onClick={startGame}
          className={`ff-m fs-sm play-btn`}
          style={{
            position: "relative",
            zIndex: "100000000000000000",
            // left: "50%",
            // transform: "translateX(-50%)",
            background: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "0.5rem 1.5rem",
            borderRadius: "5rem",
            marginTop: "0.5rem",
            cursor: "pointer",
          }}>
          Enter
        </button>

        <div className="xrv-logo-new">
          <div className='xrv-logo-text-new ff-l fs-xs'>powered by</div>
          <img className="xrv-logo-img-new" src="https://xrv-xrc.s3.ap-south-1.amazonaws.com/XRVizion/xrv.png" alt=""></img>
        </div>
      </div>
    </div >
  )
}

export default Welcome
