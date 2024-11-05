import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import ReactPlayer from "react-player";
import Navigation from "./Assets/Navigation";
import { IoCloseSharp } from "react-icons/io5";
import { MdInfo } from "react-icons/md";

import { CgMoreVerticalO } from "react-icons/cg";

import TextToSpeech from "./Assets/TextToSpeech";
import mediaDictionary from "./Assets/KeywordMediaMap";
import SiteBooking from "./Assets/SiteBooking";
import DayDatePicker from "./Assets/DayDatePicker";

import io from "socket.io-client";
import { BeatLoader } from "react-spinners";

import BotHandler from "./BotHandler";

import { VscSend } from "react-icons/vsc";
import { PiMicrophoneFill } from "react-icons/pi";
import { PiMicrophone } from "react-icons/pi";
// import { GrFormNext } from "react-icons/gr";

// import EntryintroData from './Assets/VisemeData/EntryintroData'
import LivingAreaData from "./Assets/VisemeData/LivingAreaData";
// import KitchenData from './Assets/VisemeData/KitchenData'
// import MasterbedroomData from './Assets/VisemeData/MasterbedroomData'
// import SecondbedroomData from "./Assets/VisemeData/SecondbedroomData";
// import ExitintroData from './Assets/VisemeData/ExitintroData'
import ServerErrorData from "./Assets/VisemeData/ServerErrorData";
import { FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

import Welcome from "./Assets/Welcome";

import PanoramaViewer from "./Assets/PanoramaViewer";
import { Link, MenuIcon } from "lucide-react";

// import { BiSolidVolumeFull } from "react-icons/bi";
// import { BiSolidVolumeMute } from "react-icons/bi"
// import { TbCircleLetterMFilled } from "react-icons/tb";
// import { TbCircleLetterAFilled } from "react-icons/tb";

// import { Tooltip } from 'react-tooltip';

const sampleRate = 16000;
let stream;
const getMediaStream = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: "default",
        sampleRate: sampleRate,
        sampleSize: 16,
        channelCount: 1,
      },
      video: false,
    });
    return stream;
  } catch (error) {
    console.error("Error accessing media stream:", error);
  }
};

const AudioToText = (props) => {
  const {
    userMobileNumber,
    setUserMobileNumber,
    isListening,
    setIsListening,
    isTalking,
    setIsTalking,
    setTalkAnimation,
    startClicked,
    setIsThinking,
    isThinking,
    setAudioSrc,
    isMuted,
    setIsMuted,
    setIsPlaying,
    setStartClicked,
    navigationProp,
    isAgent,
    userName,
  } = props;

  const [visemeData, setVisemeData] = useState();
  const [language, setLanguage] = useState("EN");

  const [showSiteBooking, setShowSiteBooking] = useState(false);
  const [showSiteBookingForm, setShowSiteBookingForm] = useState(false);

  const showSiteBookingTrigger = useRef(false);

  const datePickerRef = useRef();
  const [shouldOpenCalendar, setShouldOpenCalendar] = useState(false);
  const [shouldCloseCalendar, setShouldCloseCalendar] = useState(false);

  const [isTooltipOpen, setIsTooltipOpen] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [textToSpeechResponse, setTextToSpeechResponse] = useState();

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  function checkFileType(url) {
    console.log(url);
    if (!url) return;
    const imageExtensions = ["jpg", "png"];
    const videoExtensions = ["mp4"];

    // Extract the file extension from the URL
    const fileExtension = url.substring(url.lastIndexOf(".") + 1).toLowerCase();

    if (imageExtensions.includes(fileExtension)) {
      return "image";
    } else if (videoExtensions.includes(fileExtension)) {
      return "video";
    } else {
      return "unknown";
    }
  }

  // Communication
  // useEffect(() => {
  //   const handleMessageFromParent = (event) => {
  //     // console.warn('Message received from parent:', event.data);

  //     // Check if the message contains userMobileNumber
  //     if (event.data !== undefined && event.data !== null && event.data.type === 'mobileNumber') {
  //       console.warn("mobile number received", event.data);
  //       // userMobileNumber.current = event.data.value;
  //       setUserMobileNumber(event.data.value)
  //     }

  //     // Check if the message contains userMobileNumber
  //     if (event.data !== undefined && event.data !== null && event.data.type === 'language') {
  //       console.warn("language received", event.data);
  //       // userMobileNumber.current = event.data.value;
  //       setUserLanguage(event.data.value)
  //     }

  //     if (event.data !== undefined && event.data !== null && event.data.type === 'useElevenLabs') {
  //       console.warn("eleven labs value received", event.data);
  //       // userMobileNumber.current = event.data.value;
  //       useElevenLabs.current = event.data.value
  //     }
  //   };

  //   window.addEventListener('message', handleMessageFromParent);

  //   return () => {
  //     window.removeEventListener('message', handleMessageFromParent);
  //   };
  // }, []);

  const shouldPlayResponse = useRef(false);
  const [textToSpeak, setTextToSpeak] = useState("");

  const [connection, setConnection] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState("");

  const processorRef = useRef();
  const audioContextRef = useRef();
  const audioInputRef = useRef();

  const [buttonText, setButtonText] = useState("Ask me");

  const [startingToRecord, setStartingToRecord] = useState(false);
  const [responseReady, setResponseReady] = useState(true);

  const recordingStoppedByTimerRef = useRef(false);

  const [chatMessages, setChatMessages] = useState([]);

  const createMessage = (content, from) => ({ content, from });

  const appendMessage = (messages, content, from) => {
    const newMessage = createMessage(content, from);
    return [...messages, newMessage];
  };

  const session = useRef(0);

  const url = "https://api.aadhya.xrvizion.com";
  // const url = "https://api.antareeksh.demo.xrvizion.com/"
  // const url = "http://localhost:5000"

  const menuItemsToDisplay = useRef([]);

  //AUDIO
  const audioRef = useRef(new Audio());
  const audioRefAlt = useRef(new Audio());
  const audioRefAlt2 = useRef(new Audio());

  // const gainNodeRef = useRef(null);

  // useEffect(() => {
  //   // Initialize the AudioContext and GainNode
  //   audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  //   gainNodeRef.current = audioContextRef.current.createGain();
  //   gainNodeRef.current.gain.value = isMuted ? 0 : 1; // Set volume to maximum

  //   // Connect the audio element to the GainNode
  //   const source = audioContextRef.current.createMediaElementSource(audioRef.current);
  //   source.connect(gainNodeRef.current);
  //   gainNodeRef.current.connect(audioContextRef.current.destination);

  //   console.warn("isMuted", isMuted)

  //   return () => {
  //     // Clean up the AudioContext when the component unmounts
  //     audioContextRef.current.close();
  //   };
  // }, []);

  const handleVolume = () => {
    // console.log(isMuted)
    setIsMuted((prev) => !prev);
  };

  // const sendManualModeData = useRef(false)

  // const handleMode = async () => {
  //   pixelStreamingConfig.setIsAutomaticMode((prev) => !prev)
  //   sendManualModeData.current = true
  // }

  // useEffect(() => {
  //   const sendManualModeDataFun = async () => {
  //     try {
  //       console.warn("Mode data sent to backend", userMobileNumber, pixelStreamingConfig.isAutomaticMode ? "auto" : "manual")

  //       const response = await axios.post(url + '/user/updatemode', {
  //         mobileNumber: userMobileNumber,
  //         newMode: pixelStreamingConfig.isAutomaticMode ? "auto" : "manual"
  //       });

  //       console.log('Response:', response.data);
  //     }
  //     catch (error) {
  //       console.error('Error:', error);
  //     }
  //   }

  //   if (sendManualModeData.current) {
  //     sendManualModeDataFun()
  //   }
  // }, [pixelStreamingConfig.isAutomaticMode])

  // useEffect(() => {
  //   // console.log("isMuted Changed", isMuted)
  //   // gainNodeRef.current.gain.value = isMuted ? 0 : 1
  // }, [isMuted])

  const shouldErrorMsgPlay = useRef(true);
  const shouldRecordAgain = useRef(false);

  let playPromise;
  const stopAudio = () => {
    // if (startClicked) {
    // playPromise = audioRef.current.play();
    // }
    // if (playPromise !== undefined) {
    // try {
    // await playPromise; // Wait for the play() Promise to settle
    // audioRef.current.pause();
    // console.warn(playPromise)
    setIsTalking(false);
    setIsThinking(false);

    // if (shouldRecordAgain.current) {
    // startRecordingAgain()
    // }
    // } catch (error) {
    // console.log('An error occurred:', error);
    // }
    // }
  };

  useEffect(() => {
    if (isRecording) {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  }, [isRecording]);

  useEffect(() => {
    if (startClicked) {
      playPromise = audioRef.current.play();
    }
  }, [startClicked]);

  // const startRecordingAgain = () => {
  //   setTimeout(() => {
  //     const recButton = document.getElementsByClassName('ui-rec-btn-cont')[0]
  //     if (recButton) recButton.click()
  //   }, 1000);
  // }

  // ANIMATIONS
  useEffect(() => {
    const handlePlay = () => {
      if (isTalking) {
        // Start playing a random talking animation
        const animations = ["Talking_1", "Talking_2", "Talking_3"];
        const animation =
          animations[Math.floor(Math.random() * animations.length)];

        // console.log("PLAYING", animation)
        // Use your method for playing the animation here
        // playAnimation(animation);
        setTalkAnimation(animation);
      }
    };
    audioRef.current.addEventListener("play", handlePlay);

    // Add event listener for the ended event
    const handleEnded = () => {
      setIsTalking(false);
      // console.log("should to record", shouldRecordAgain.current)
      if (shouldRecordAgain.current) {
        // startRecordingAgain()
      }
    };
    audioRef.current.addEventListener("ended", handleEnded);

    // Remove event listeners when component is unmounted
    return () => {
      audioRef.current.removeEventListener("play", handlePlay);
      audioRef.current.removeEventListener("ended", handleEnded);
    };
  }, [isTalking, setIsTalking, setTalkAnimation]);

  const newResponseMsg = useRef("");

  const playAudio = (audioUrl, lipsyncData) => {
    // await stopMediaStream();

    console.warn("PLAYING here", audioUrl, lipsyncData);
    // audioRef.current.src = audioUrl;

    // audioContextRef.current.resume().then(() => {
    // console.warn("Resuming audio context");
    // audioRef.current.play().catch(error => {
    // console.error('Error playing audio:', error);
    // });
    // setVisemeData(lipsyncData)
    setCurrentRecognition(newResponseMsg.current);
    setChatMessages((prevMessages) =>
      appendMessage(prevMessages, newResponseMsg.current, "bot")
    );

    if (showSiteBookingTrigger.current) {
      setShowSiteBooking(true);
      showSiteBookingTrigger.current = false;
    }

    if (menuItemsToDisplay.current.length) {
      navigationProp.setShowSubItems(true);
      navigationProp.setMenuItems(menuItemsToDisplay.current);

      navigationProp.setCurrentSubItem(menuItemsToDisplay.current[0]);
      navigationProp.setPlayIndex(0);

      const newMediaList = [];

      // Add images to the media list if they exist
      if (mediaDictionary[menuItemsToDisplay.current[0]].images.length) {
        newMediaList.push(
          ...mediaDictionary[menuItemsToDisplay.current[0]].images
        );
      }

      // Add videos to the media list if they exist
      if (mediaDictionary[menuItemsToDisplay.current[0]].videos.length) {
        newMediaList.push(
          ...mediaDictionary[menuItemsToDisplay.current[0]].videos
        );
      }

      // Set the media list to the state
      navigationProp.setMediaList(newMediaList);
    }

    setIsTalking(true);
    setIsThinking(false);
    setResponseReady(true);
    setButtonText("Ask me");

    shouldErrorMsgPlay.current = false;
    // }).catch(error => {
    // console.error('Error resuming audio context:', error);
    // });

    // audioRef.current.play();
  };

  // SOCKET IO CONNECTION AND MESSAGES
  useEffect(() => {
    // console.log("Connecting to web socket...")
    const socket = io.connect(url);
    let pingInterval;

    socket.on("connect", () => {
      // console.log("connected", socket.id);
      setConnection(socket);
      pingInterval = setInterval(sendPingMessage, 5000);
    });

    const sendPingMessage = () => {
      socket.emit("ping", userMobileNumber.current, userName.current);
      // console.log("ping sent to the server", userMobileNumber.current, isAgent)
    };

    socket.on("completedResponse", (data) => {
      // console.log(data)
      // setIsTalking(true)
      // setIsThinking(false)
      // setResponseReady(true)
      // setButtonText("Ask me");
      // shouldErrorMsgPlay.current = false
      // // Check if the audio context is already closed
      // if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      //   // Close the audio context before starting a new playback
      //   audioContextRef.current.close();
      // }
      // // Create a new audio context for the next playback
      // audioContextRef.current = new window.AudioContext();
      // // Set the audio session type to 'playback' if supported
      // if (navigator.audioSession) {
      //   // setPlaybackConsent("PLAYBACK")
      //   navigator.audioSession.type = 'playback';
      // }
      // // Set the current recognition text
      // setCurrentRecognition(data.completedText);
      // setChatMessages((prevMessages) => appendMessage(prevMessages, data.completedText, 'bot'));
      // // Set the audio element src attribute and start playback
      // audioRef.current.src = url + `/${data.url}`;
      // audioRef.current.crossOrigin = "anonymous";
      // audioRef.current.play();
      // Store the session ID if it's a new session
      // if (data.newSession) {
      //   // localStorage.setItem('sessionId', data.sessionId);
      //   session.current = data.sessionId
      // }
    });

    socket.on("chatresponse", (data) => {
      console.log("data", data);

      menuItemsToDisplay.current = [];

      if (data.keywords) {
        // console.log(data.keywords)
        menuItemsToDisplay.current = data.keywords;
      }

      newResponseMsg.current = data.completedText;

      // setCurrentRecognition(data.completedText);
      // setChatMessages((prevMessages) => appendMessage(prevMessages, data.completedText, 'bot'));

      // setIsTalking(true)
      // setIsThinking(false)
      // setResponseReady(true)
      // setButtonText("Ask me");

      // shouldErrorMsgPlay.current = false

      // Check if the audio context is already closed
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        // Close the audio context before starting a new playback
        audioContextRef.current.close();
      }

      // Create a new audio context for the next playback
      // audioContextRef.current = new window.AudioContext();

      // Set the audio session type to 'playback' if supported
      // if (navigator.audioSession) {
      //   // setPlaybackConsent("PLAYBACK")
      //   navigator.audioSession.type = 'playback';
      // }

      shouldPlayResponse.current = true;
      if (data.ttsResponse.audioContent)
        setTextToSpeechResponse(data.ttsResponse.audioContent);
      if (data.completedText) setTextToSpeak(data.completedText);
      if (data.visemes) setVisemeData(data.visemes);

      if (data.newSession) {
        // localStorage.setItem('sessionId', data.sessionId);
        session.current = data.sessionId;
      }
    });

    socket.on("serverError", async () => {
      if (shouldErrorMsgPlay.current) {
        console.log("");

        setIsTalking(true);
        setIsThinking(false);
        // console.log("Server Error")
        setVisemeData(ServerErrorData);
        // audioRef.current.src =
        //   userLanguage === "EN" ?
        //     `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/${useElevenLabs.current ? "ElevenLabsAudio/" : "GoogleCloudAudio/"}sorryEN.wav` :
        //     userLanguage === "MA" ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/${useElevenLabs.current ? "ElevenLabsAudio/" : "GoogleCloudAudio/"}sorryMA.wav`
        //       :
        //       `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/${useElevenLabs.current ? "ElevenLabsAudio/" : "GoogleCloudAudio/"}sorryHI.wav`

        let serverErrorAudio =
          language === "हिं"
            ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/GoogleCloudAudio/sorryHI.wav`
            : language === "MA"
            ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/GoogleCloudAudio/sorryMA.wav`
            : `https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/GoogleCloudAudio/sorryEN.wav`;

        await revokeMicrophoneAccess();
        setAudioSrc(serverErrorAudio);
        setIsPlaying(true);
        // audioRef.current.src = "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Antareeksh/Resources/play_ht_error.wav"
        // audioRef.current.crossOrigin = "anonymous"
        // audioContextRef.current.resume().then(() => {
        //   audioRef.current.play().catch(error => {
        //     console.error('Error playing audio:', error);
        //   });
        // });
        // audioRef.current.play();
        // setCurrentRecognition("Sorry, I didn't get that. Can you say it again?")
        let botMsg =
          language === "हिं"
            ? "क्षमा करें मैं आपको समझ नहीं पाई, क्या आप इसे दोबारा कह सकते हैं?"
            : language === "MA"
            ? "माफ करा मला ते समजले नाही, तुम्ही ते पुन्हा सांगू शकता का?"
            : "Sorry, I didn't get that. Can you say it again?";
        // let botMsg = true ? "Sorry, I didn't get that. Can you say it again?" : true === "MA" ? "माफ करा मला ते समजले नाही, तुम्ही ते पुन्हा सांगू शकता का?" : "क्षमा करें मैं आपको समझ नहीं पाई, क्या आप इसे दोबारा कह सकते हैं?"
        setChatMessages((prevMessages) =>
          appendMessage(prevMessages, botMsg, "bot")
        );
      }

      console.log("isThinking setting to false");

      setResponseReady(true);
      setButtonText("Ask me");
      setIsThinking(false);
      shouldRecordAgain.current = false;
      shouldErrorMsgPlay.current = true;
    });

    socket.on("disconnect", () => {
      // console.log("disconnected", socket.id);
    });

    socket.on("final", async () => {
      if (recordingStoppedByTimerRef.current === false) {
        // console.log("FINAL", recordingStoppedByTimerRef.current);
        clearTimeout(timeoutRef.current);

        if (connection) {
          connection.emit("endStream");
          console.warn("Seding END STREAM from Final");
        }

        // setIsThinking(true)
        processorRef.current?.disconnect();
        audioInputRef.current?.disconnect();
        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          audioContextRef.current.close();
        }

        // audioContextRef.current = new window.AudioContext();

        // if (navigator.audioSession) {
        //   // setplaybaclIOSText("PLAYBACK")
        //   navigator.audioSession.type = 'playback';
        // }

        // audioRefAlt.current.src = "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
        // audioRefAlt.current.crossOrigin = "anonymous"
        // audioRefAlt.current.play();

        await revokeMicrophoneAccess();
        setAudioSrc(
          "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
        );
        setIsPlaying(true);

        setIsRecording(false);
        setResponseReady(false);
        console.log("running fifnal");
        setIsThinking(true);
      }
    });

    socket.on("invokeBookingDate", () => {
      // console.log("Site booking triggered from backend")
      // setShowSiteBooking(true)
      showSiteBookingTrigger.current = true;
    });

    socket.on("audio_to_text", async (res) => {
      // console.log(res)
      // console.log("FINAL", recordingStoppedByTimerRef.current);
      clearTimeout(timeoutRef.current);

      if (connection) {
        console.warn("Seding END STREAM from AUdio-to-text");
        connection.emit("endStream");
      }
      // setIsThinking(true)
      processorRef.current?.disconnect();
      audioInputRef.current?.disconnect();
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      // audioContextRef.current = new window.AudioContext();

      // if (navigator.audioSession) {
      //   // setplaybaclIOSText("PLAYBACK")
      //   navigator.audioSession.type = 'playback';
      // }

      if (recordingStoppedByTimerRef.current === false) {
        await revokeMicrophoneAccess();
        setAudioSrc(
          "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
        );
        setIsPlaying(true);

        // audioRefAlt.current.src = "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
        // audioRefAlt.current.crossOrigin = "anonymous"
        // audioRefAlt.current.play();
      }

      setChatMessages((prevMessages) =>
        appendMessage(prevMessages, res.text, "user")
      );

      setIsRecording(false);
      setResponseReady(false);
      console.log("runnning");
      setIsThinking(true);
      // }
    });

    return () => {
      socket.disconnect();
      clearInterval(pingInterval);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!responseReady) {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Start a new timer
      timerRef.current = setTimeout(() => {
        // console.warn("RESPONSE LOST")
        setResponseReady(true);
        setButtonText("Ask me");
        setCurrentRecognition("");
        timerRef.current = null;
      }, 10000); // Set the time here. 10000ms = 10s
    }
    // Cleanup function
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [responseReady]);

  useEffect(() => {
    console.log(isRecording, responseReady, isThinking, startingToRecord);
  }, [isRecording, responseReady, isThinking, startingToRecord]);

  // RECORDING BUTTON UI
  useEffect(() => {
    const recButton = document.querySelector(".ui-rec-btn");
    if (isRecording) {
      // console.log("Recording started")
      recButton.classList.add("active");
      setButtonText("Listening...");
      setStartingToRecord(false);
    } else {
      // console.log("Recording stopped")
      recButton.classList.remove("active");
      setButtonText("Ask me");
    }
  }, [isRecording]);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!responseReady) {
      setButtonText("Thinking...");
    } else {
      setButtonText("Ask me");
    }
  }, [responseReady]);

  const stoppedForcefully = async () => {
    console.warn("STOPPER FORCEFULLY");
    recordingStoppedByTimerRef.current = true;
    // console.warn(recordingStoppedByTimerRef.current)
    if (connection) connection.emit("endStream");
    // setIsThinking(true)
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    // if (navigator.audioSession) {
    //   // setplaybaclIOSText("PLAYBACK")
    //   navigator.audioSession.type = 'playback';
    // }

    await revokeMicrophoneAccess();
    setAudioSrc(
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
    );
    setIsPlaying(true);

    // audioRefAlt.current.src = "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/stop-13692.mp3"
    // audioRefAlt.current.crossOrigin = "anonymous"
    // audioRefAlt.current.play();

    setIsRecording(false);
    setResponseReady(false);
    setIsThinking(true);
    clearTimeout(timeoutRef.current);
  };

  // START RECORDING METHOD
  const startRecording = async () => {
    if (showSiteBooking || showSiteBookingForm) {
      setShowSiteBooking(false);
      setShowSiteBookingForm(false);
    }

    if (inputMsg.length) {
      // console.log(inputMsg)

      if (!connection) return;
      shouldRecordAgain.current = false;
      stopAudio();
      // setCurrentRecognition("...")
      // handleShowDefaultItems()
      setButtonText("Thinking...");
      setChatMessages((prevMessages) =>
        appendMessage(prevMessages, inputMsg, "user")
      );

      let newSession = session.current === 0;
      let sessionId = newSession ? 0 : session.current;
      connection.emit(
        "startTextInput",
        language === "EN" ? "en-IN" : language === "MR" ? "mr-IN" : "hi-IN",
        sessionId,
        inputMsg,
        userName.current,
        userMobileNumber.current,
        newSession
      );
      console.log(
        "startTextInput",
        language === "EN" ? "en-IN" : language === "MR" ? "mr-IN" : "hi-IN",
        sessionId,
        inputMsg,
        userName.current,
        userMobileNumber.current,
        newSession
      );
      setInputMsg("");
      setIsThinking(true);
      setIsPlaying(false);
      return;
    }

    if (isRecording) {
      shouldRecordAgain.current = false;
      stoppedForcefully();
      // setResponseReady(false)
      // stopRecording()
      // clearTimeout(timeoutRef.current);
      return;
    }

    setStartingToRecord(true);
    shouldRecordAgain.current = true;
    recordingStoppedByTimerRef.current = false;

    stopAudio();
    // setButtonText("Release to stop")
    setCurrentRecognition("...");

    if (!connection || isRecording) return;

    // if (!playbackConsent) {
    // setPlaybackConsent(true);
    // audioRefAlt2.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    // audioRefAlt2.current.play();
    // }

    // if (navigator.audioSession) {
    //   // setplaybaclIOSText("PLAY AND RECORD")
    //   // The Audio Session API is supported
    //   navigator.audioSession.type = 'play-and-record';
    // }

    // handleShowDefaultItems()

    // let newSession = localStorage.getItem('sessionId') === null
    let newSession = session.current === 0;
    let sessionId = newSession ? 0 : session.current;

    // console.log(props.language === "EN" ? "en-IN" : "hi-IN", sessionId, newSession)

    connection.emit(
      "startStream",
      language === "EN" ? "en-IN" : language === "MR" ? "mr-IN" : "hi-IN",
      sessionId,
      userName.current,
      userMobileNumber.current,
      newSession
    );
    console.log(
      "startStream",
      language === "EN" ? "en-IN" : language === "MR" ? "mr-IN" : "hi-IN",
      sessionId,
      userName.current,
      userMobileNumber.current,
      newSession
    );

    // const stream = micStream || await getMediaStream();

    // let stream;
    // if (stream) {
    //   // stream = micStream;
    //   console.log("stream", stream)
    // } else {
    // console.log("getting stream")
    try {
      stream = await getMediaStream();
      // console.log("Mic stream obtained successfully:", stream);
    } catch (error) {
      // console.error("Error accessing media stream:", error);
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        // Permission was denied previously, inform the user and provide instructions
        alert(
          "Microphone access is necessary for the application to function. Please enable microphone access in your browser settings."
        );
      } else {
        // Handle other errors
        alert(
          "An error occurred while accessing the microphone. Please try again later."
        );
      }
      return;
    }
    // }

    audioContextRef.current = new window.AudioContext();

    await audioContextRef.current.audioWorklet.addModule(
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/recorderWorkletProcessor.js"
    );

    audioContextRef.current.resume();
    audioInputRef.current =
      audioContextRef.current.createMediaStreamSource(stream);

    processorRef.current = new AudioWorkletNode(
      audioContextRef.current,
      "recorder.worklet"
    );

    processorRef.current.connect(audioContextRef.current.destination);
    audioContextRef.current.resume();
    audioInputRef.current.connect(processorRef.current);

    processorRef.current.port.onmessage = (event) => {
      const audioData = event.data;
      connection.emit("send_audio_data", { audio: audioData });
    };

    // audioRefAlt.current.src = "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/start-13691.mp3"
    // audioRefAlt.current.crossOrigin = "anonymous"
    // audioRefAlt.current.play();

    setIsPlaying(false);
    setAudioSrc(
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Butati/Resources/start-13691.mp3"
    );
    setIsPlaying(true);

    setIsRecording(true);

    timeoutRef.current = setTimeout(() => {
      stoppedForcefully();
      // console.log("Stopped by timer")

      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, 6000);
  };

  const handleShowDefaultItems = () => {
    navigationProp.setShowSubItems(false);
    navigationProp.setMenuItems(navigationProp.defaultMenu);
    playSubItem("Default");
  };

  const playSubItem = (data) => {
    // Set the current sub-item
    navigationProp.setCurrentSubItem(data);
    navigationProp.setPlayIndex(0);

    // Initialize an empty array to hold the media list
    const newMediaList = [];

    // Add images to the media list if they exist
    if (mediaDictionary[data].images.length) {
      newMediaList.push(...mediaDictionary[data].images);
    }

    // Add videos to the media list if they exist
    if (mediaDictionary[data].videos.length) {
      newMediaList.push(...mediaDictionary[data].videos);
    }

    // Set the media list to the state
    navigationProp.setMediaList(newMediaList);
  };

  const [inputMsg, setInputMsg] = useState("");
  const inputRef = useRef(null);

  const handleDivClick = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  useEffect(() => {
    const streamingVideoDiv = document.getElementById("streamingVideo");
    if (streamingVideoDiv && inputMsg.length) {
      streamingVideoDiv.addEventListener("click", handleDivClick);
    }

    // Cleanup: remove the event listener from the div
    return () => {
      if (streamingVideoDiv) {
        streamingVideoDiv.removeEventListener("click", handleDivClick);
      }
    };
  }, [inputMsg]);

  const handleKeyPress = (event) => {
    if (inputMsg.length && event.key === "Enter") {
      startRecording();
    }
  };

  useEffect(() => {
    if (startingToRecord) {
      setButtonText("Starting...");
    }
  }, [startingToRecord]);

  const chatContainerRef = useRef(null);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    // Scroll to the bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }

    // Check if overflow has occurred and update justify-content
    const handleOverflowChange = () => {
      const isOverflowing =
        chatContainerRef.current.scrollHeight >
        chatContainerRef.current.clientHeight;
      chatContainerRef.current.style.justifyContent = isOverflowing
        ? "flex-start"
        : "center";
    };

    handleOverflowChange(); // Call it initially

    // Attach the listener to detect overflow changes
    chatContainerRef.current.addEventListener("scroll", handleOverflowChange);

    // Clean up the listener when the component unmounts
    return () => {
      chatContainerRef.current.removeEventListener(
        "scroll",
        handleOverflowChange
      );
    };
  }, [chatMessages, chatContainerRef]);

  const [customClassName, setCustomClassName] = useState("fs-sm");

  useEffect(() => {
    const handleResize = () => {
      const newClassName = window.innerWidth >= 950 ? "fs-xs" : "fs-sm";
      setCustomClassName(newClassName);
    };

    // Initial call to set the initial class
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures that the effect runs only once on mount

  const audioUrls = {
    Entryintro: "",
    LivingArea:
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/Livingroom.wav",
    Kitchen:
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/Kitchen.wav",
    Masterbedroom:
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/Masterbedroom.wav",
    Secondbedroom:
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/Secondbedroom.wav",
    Exitintro:
      "https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/End.wav",
  };

  const messages = {
    Entryintro: "",
    LivingArea:
      "Step inside our spacious living room, bathed in natural light, it is designed for both relaxation and entertainment.",
    Kitchen:
      "The kitchen adjoins a dining area, ensuring maximum circulation and ample ventilation throughout. with dedicated space for fridge and washing machine.",
    Masterbedroom:
      "Welcome to the serene master bedroom, thoughtfully designed with an attached toilet and excellent ventilation, ensuring a tranquil and airy ambiance.",
    Secondbedroom:
      "Our second bedroom, complete with an attached toilet. Containing a sofa cum bed, and a wardrobe, creating a comfortable and functional space.",
    Exitintro:
      "I'm sure you've experienced the comfort and convenience of your potential new home. What specific questions or preferences would you like to explore further?",
  };

  const visemes = {
    // Entryintro: EntryintroData,
    LivingArea: LivingAreaData,
    // Kitchen: KitchenData,
    // Masterbedroom: MasterbedroomData,
    // Secondbedroom: SecondbedroomData,
    // Exitintro: ExitintroData
  };

  // const handleNext = async (scene) => {
  //   stopAudio();
  //   const steps = Object.keys(messages);

  //   // const currentIndex = steps.indexOf(pixelStreamingConfig.currentStep);
  //   const nextIndex = (scene + 1) % steps.length;
  //   const movingInterval = setInterval(() => {
  //     // if (!pixelStreamingConfig.isCameraMoving.current) {
  //     pixelStreamingConfig.setCurrentStep(steps[nextIndex]);
  //     clearInterval(movingInterval)
  //     // }
  //   }, 500);
  // };

  // useEffect(() => {
  //   if (pixelStreamingConfig.sceneIndex > -1) {
  //     // console.warn("Playing", pixelStreamingConfig.sceneIndex)
  //     handleNext(pixelStreamingConfig.sceneIndex)
  //   }
  // }, [pixelStreamingConfig.sceneIndex])

  const revokeMicrophoneAccess = () => {
    return new Promise((resolve, reject) => {
      if (stream) {
        const trackStopPromises = stream
          .getTracks()
          .map((track) => track.stop());
        Promise.all(trackStopPromises)
          .then(() => {
            // console.log('Microphone access revoked');
            setTimeout(() => {
              resolve();
            }, 500);
          })
          .catch((error) => {
            console.error("Error stopping tracks:", error);
            reject(error);
          });
      } else {
        // console.log('No active microphone stream to revoke');
        setTimeout(() => {
          resolve();
        }, 500);
      }
    });
  };

  const isFirstAudioFinished = useRef(false);

  // First msg played here
  useEffect(() => {
    const handleAudioStop = async () => {
      if (startClicked && !isFirstAudioFinished.current) {
        // console.warn("play Intro");
        isFirstAudioFinished.current = true;

        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          // Close the audio context before starting a new playback
          audioContextRef.current.close();
        }

        await revokeMicrophoneAccess();

        // Create a new audio context for the next playback
        // audioContextRef.current = new window.AudioContext();

        // Set the audio session type to 'playback' if supported
        // if (navigator.audioSession) {
        //   // setPlaybackConsent("PLAYBACK")
        //   navigator.audioSession.type = 'playback';
        // }

        // Set the current recognition text
        // setChatMessages((prevMessages) => appendMessage(prevMessages, messages['LivingArea'], 'bot'));
        setChatMessages((prevMessages) =>
          appendMessage(
            prevMessages,
            "Hey! I'm Sia, your AI guide to Jain's Aadhya. How can I assist you?",
            "bot"
          )
        );

        // Set the audio element src attribute and start playback
        setIsTalking(true);
        // audioRef.current.pause();
        // audioRef.current.currentTime = 0;

        // audioRef.current.src = 'https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/audio+(3).mp3'
        // audioRef.current.crossOrigin = "anonymous";

        // audioRef.current.play();

        // console.log(audioContextRef.current)
        topLoadingRef.current.complete();
        // setIsTooltipOpen(false)

        // shouldPlayResponse.current = true
        // setTextToSpeak("Hey! I'm Disha, your AI guide to Mahalaxmi Nagar 41. How can I assist you?")
        // newResponseMsg.current = "Hey! I'm Disha, your AI guide to Mahalaxmi Nagar 41. How can I assist you?"

        setAudioSrc(
          "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Aadhya/Resources/JainsAdhya_welcome_English.wav"
        );
        setIsPlaying(true);

        // audioRef.current.oncanplaythrough = () => {
        // audioContextRef.current.resume().then(() => {
        // console.warn("Resuming audio context");
        // audioRef.current.play().catch(error => {
        //   console.error('Error playing audio:', error);
        // });
        // }).catch(error => {
        // console.error('Error resuming audio context:', error);
        // });
        // }

        // setTimeout(() => {
        //   // Set the flag to true once the first audio finishes playing
        //   // console.log("Three seconds after first audio clip has finished playing");
        //   // pixelStreamingConfig.startCinematic()
        // }, 10000);
      }
      // else if (pixelStreamingConfig.sceneIndex > -1) {
      //   // // console.warn("playing Scenes")

      //   if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      //     // Close the audio context before starting a new playback
      //     audioContextRef.current.close();
      //   }

      //   // Create a new audio context for the next playback
      //   // audioContextRef.current = new window.AudioContext();

      //   // Set the audio session type to 'playback' if supported
      //   // if (navigator.audioSession) {
      //   //   // setPlaybackConsent("PLAYBACK")
      //   //   navigator.audioSession.type = 'playback';
      //   // }

      //   // Set the current recognition text
      //   setChatMessages((prevMessages) => appendMessage(prevMessages, messages[pixelStreamingConfig.currentStep], 'bot'));

      //   // Set the audio element src attribute and start playback
      //   setIsTalking(true)
      //   // audioRef.current.pause();
      //   // audioRef.current.currentTime = 0;

      //   // audioRef.current.src = audioUrls[pixelStreamingConfig.currentStep];
      //   // audioRef.current.crossOrigin = "anonymous";

      //   // audioRef.current.play();

      //   // audioRef.current.oncanplaythrough = () => {
      //   // audioContextRef.current.resume().then(() => {
      //   // audioRef.current.play().catch(error => {
      //   //   console.error('Error playing audio:', error);
      //   // });
      //   // });
      //   // }
      // }

      // console.log(pixelStreamingConfig.currentStep, visemes[pixelStreamingConfig.currentStep], pixelStreamingConfig.currentStep)
      // console.warn("Setting visemes to ", visemes[pixelStreamingConfig.currentStep])
      setVisemeData(visemes["LivingArea"]);
    };

    handleAudioStop(); // Call the async function
  }, [startClicked]);

  const [siteBookingDate, setSiteBookingDate] = useState(new Date());

  const handleSiteBooking = async () => {
    if (siteBookingDate === undefined) return;

    // console.log("siteBookingDate", siteBookingDate)
    topLoadingRef.current.continuousStart();

    try {
      // const url = "https://api.urbanedge.chat.xrvizion.com"

      console.warn("site booking date sent for", userMobileNumber);

      // console.log(siteBookingDate?.toDate?.().toString())

      const response = await axios.post(url + "/user/setbookingdate", {
        mobileNumber: userMobileNumber.current,
        name: userName.current,
        date: siteBookingDate?.toDate?.().toString(),
        sessionId: session.current,
      });
      // console.log('response site booking api:', response.data);

      let siteVisitSuccessAudio =
        language === "हिं"
          ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitSuccess-HI.mp3`
          : language === "MA"
          ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitSuccess-MA.mp3`
          : `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitSuccess-EN.mp3`;

      await revokeMicrophoneAccess();

      setAudioSrc(siteVisitSuccessAudio);
      setIsPlaying(true);

      newResponseMsg.current =
        language === "हिं"
          ? "आपकी साइट का दौरा निर्धारित है. हमारी बिक्री टीम शीघ्र ही आपसे संपर्क करेगी."
          : language === "MA"
          ? "तुमची साइट भेट शेड्यूल केली आहे. आमची विक्री टीम लवकरच तुमच्याशी संपर्क साधेल."
          : "Your site visit is scheduled. Our sales team will contact you shortly.";
      // shouldPlayResponse.current = true
      // setTextToSpeak(language === "हिं" ? "आपकी साइट का दौरा निर्धारित है. हमारी बिक्री टीम शीघ्र ही आपसे संपर्क करेगी." : language === "MA" ? "तुमची साइट भेट शेड्यूल केली आहे. आमची विक्री टीम लवकरच तुमच्याशी संपर्क साधेल." : "Your site visit is scheduled. Our sales team will contact you shortly.")
      setShouldCloseCalendar(true);
      setTimeout(() => {
        topLoadingRef.current.complete();
        setShowSiteBookingForm(false);
        setChatMessages((prevMessages) =>
          appendMessage(prevMessages, newResponseMsg.current, "bot")
        );
      }, 1000);
    } catch (error) {
      console.error("error sending site booking data:", error);

      let siteVisitFailureAudio =
        language === "हिं"
          ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitFailure-HI.mp3`
          : language === "MA"
          ? `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitFailure-MA.mp3`
          : `https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/SiteVisitFailure-EN.mp3`;

      await revokeMicrophoneAccess();

      setAudioSrc(siteVisitFailureAudio);
      setIsPlaying(true);

      newResponseMsg.current =
        language === "हिं"
          ? "अपनी साइट यात्रा शेड्यूल करने में असमर्थ। कृपया फिर कोशिश करें।"
          : language === "MA"
          ? "तुमची साइट भेट शेड्यूल करण्यात अक्षम. कृपया पुन्हा प्रयत्न करा."
          : "Unable to schedule your site visit. Please try again.";

      // shouldPlayResponse.current = true
      // setTextToSpeak(language === "हिं" ? "अपनी साइट यात्रा शेड्यूल करने में असमर्थ। कृपया फिर कोशिश करें।" : language === "MA" ? " तुमची साइट भेट शेड्यूल करण्यात अक्षम. कृपया पुन्हा प्रयत्न करा." : "Unable to schedule your site visit. Please try again.")

      // ElevenLabs API
      setShouldCloseCalendar(true);
      setTimeout(() => {
        topLoadingRef.current.complete();
        setShowSiteBookingForm(false);
        setChatMessages((prevMessages) =>
          appendMessage(prevMessages, newResponseMsg.current, "bot")
        );
      }, 1000);
    }
  };

  useEffect(() => {
    if (shouldCloseCalendar) {
      // console.log(datePickerRef.current)
      // datePickerRef.current.closeCalendar()
    }
  }, [shouldCloseCalendar]);

  const startButtonClicked = useRef(false);

  const startGame = async () => {
    if (startButtonClicked.current === false) {
      topLoadingRef.current.continuousStart();

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // console.log('Mic permission granted');
        // setShowLoadingScreen(true)
        setTimeout(() => {
          setStartClicked(true);
          // endCinematics()
        }, 2000);
      } catch (error) {
        console.error("Error accessing media stream:", error);
        // window.location.reload()
        setTimeout(() => {
          setStartClicked(true);
          // endCinematics()
        }, 2000);
      }

      try {
        console.warn("login time sent for", userMobileNumber.current);

        const endpoint = isAgent ? "/agent/login" : "/user/login";
        const response = await axios.post(url + endpoint, {
          mobileNumber: userMobileNumber.current,
          name: userName.current,
        });
        // console.log('response for login time:', response.data);
        // toast.dismiss()
        // setIsFormSubmitted(true)
        setTimeout(() => {
          topLoadingRef.current.complete();
        }, 1000);
      } catch (error) {
        console.error("error for login time:", error);
        setTimeout(() => {
          topLoadingRef.current.complete();
        }, 1000);
      }

      setIsMuted(false);
      // pixelStreamingConfig.resumePSGame()
      startButtonClicked.current = true;
    }
  };

  const topLoadingRef = useRef(null);

  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowDropdown(false);
  };

  useEffect(() => {
    startGame();
    setStartClicked(true);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Navigation navigationProp={navigationProp} />

      <div
        id="dropdown-cont"
        className={`dropdown-cont ${showDropdown ? "active" : ""}`}
        onClick={() => setShowDropdown(!showDropdown)}
        ref={dropdownRef}
      >
        {!showDropdown && (
          <>
            <MdInfo size={30} />
          </>
        )}
        {showDropdown && (
          <>
            <div
              style={{
                background: "beige",
                width: "2rem",
                height: "2rem",
                borderRadius: "30rem",
                display: "flex",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "center",
                color: "black",

                marginLeft: "10rem",
                marginTop: ".7rem",
              }}
            >
              <IoCloseSharp />
            </div>

            <ul>
              <h2 className="ff-xl" style={{ fontSize: "1.1rem" }}>
                Change Language
              </h2>

              <div className="flex mt-2">
                <button
                  className="lang-btn py-4"
                  style={{
                    borderRadius: "30rem 0rem 0rem 30rem",
                    padding: ".5rem",
                    paddingBottom: '.5rem',
                    textAlign: 'center',
                    backgroundColor: "beige",
                    color: "black",
                    fontFamily: "Clash Display Light",
                    border: "1px solid beige",
                    width: "5rem",
                    height: "2.5rem",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleLanguageChange('HI')}                >
                  English
                </button>
                <button
                  className="lang-btn"
                  style={{
                    borderRadius: "0rem 30rem 30rem 0rem",
                    padding: ".5rem",
                    paddingBottom: '.5rem',
                    textAlign: 'center',
                    backgroundColor: "transparent",
                    color: "beige",
                    fontFamily: "Clash Display Light",
                    border: "1px solid beige",
                    width: "5rem",
                    height: "2.5rem",
                    fontWeight: "bold",
                    
                  }}
                  onClick={() => handleLanguageChange('HI')}
                >
                  Hindi
                </button>
              </div>

              <div>
                <h4
                  style={{
                    fontFamily: "Clash Display Light",
                    fontSize: "1rem",
                    fontWeight: "lighter",
                  }}
                  className="w-full text-left py-2"
                >
                  Download Brochure
                </h4>
                <h4
                  style={{
                    fontFamily: "Clash Display Light",
                    fontSize: "1rem",
                    fontWeight: "lighter",
                  }}
                  className="w-full text-left py-2"
                >
                  About Jain's Aadhya
                </h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-start",
                    width: "3/4",
                    marginRight: "1rem",
                  }}
                >
                  <a
                    href="https://www.instagram.com/xrvizion/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram
                      color="beige"
                      style={{ marginRight: "0.6rem" }}
                    />
                  </a>
                  <a
                    href="https://x.com/XR_Vizion"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter
                      color="beige"
                      style={{ marginRight: "0.6rem" }}
                    />
                  </a>

                  <a
                    href="https://www.linkedin.com/company/xr-vizion"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedinIn color="beige" />
                  </a>
                </div>
              </div>

              <div
                style={{
                  fontFamily: "Clash Display Light",
                  marginTop: "1rem",
                }}
              >
                powered by xrvizion
              </div>
              {/* <li className="lang-option ff-sb" onClick={() => handleLanguageChange('EN')}>EN</li>
            <li className="lang-option ff-sb" onClick={() => handleLanguageChange('HI')}>HI</li> */}

              {/* <li className="lang-option ff-sb" style={{ marginTop: "0.4rem" }} onClick={() => handleLanguageChange('MR')}>MR</li> */}
            </ul>
          </>
        )}
      </div>

      <div
        style={{
          width: window.innerWidth,
          height: window.innerHeight,
        }}
      >
        {checkFileType(navigationProp.mediaList[navigationProp.playIndex]) ===
        "image" ? (
          <img
            style={{
              width: "100%",
              height: "100%",
            }}
            src={`https://xrv-xrc.s3.ap-south-1.amazonaws.com/Aadhya/Resources/${
              navigationProp.mediaList[navigationProp.playIndex]
            }`}
            alt=""
          />
        ) : checkFileType(
            navigationProp.mediaList[navigationProp.playIndex]
          ) === "video" ? (
          <ReactPlayer
            url={`https://xrv-xrc.s3.ap-south-1.amazonaws.com/Aadhya/Resources/${
              navigationProp.mediaList[navigationProp.playIndex]
            }`}
            loop={true}
            controls={false}
            volume={1}
            muted={true}
            playing={startClicked}
            playsinline={true}
            width={"unset"}
            height={"unset"}
            style={{
              width: "100%",
              height: "100%",
              position: window.innerWidth < 768 ? "absolute" : "",
              top: window.innerWidth < 768 ? "50%" : "",
              transform: window.innerWidth < 768 ? "translateY(-50%)" : "",
            }}
          />
        ) : (
          <PanoramaViewer
            imagePath={`https://xrv-xrc.s3.ap-south-1.amazonaws.com/Aadhya/Resources/${
              navigationProp.mediaList[navigationProp.playIndex]
            }`}
          />
        )}
      </div>

      <LoadingBar color="#edd795" ref={topLoadingRef} shadow={true} />

      <TextToSpeech
        shouldPlayResponse={shouldPlayResponse}
        textToSpeak={textToSpeak}
        playAudio={playAudio}
        language={props.language}
        revokeMicrophoneAccess={revokeMicrophoneAccess}
        setAudioSrc={setAudioSrc}
        setIsPlaying={setIsPlaying}
        textToSpeechResponse={textToSpeechResponse}
      />

      <div className="ui-container">
        {showSiteBooking && (
          <SiteBooking
            setShowSiteBooking={setShowSiteBooking}
            setShowSiteBookingForm={setShowSiteBookingForm}
            datePickerRef={datePickerRef}
          />
        )}

        {showSiteBookingForm && (
          <DayDatePicker
            handleSiteBooking={handleSiteBooking}
            siteBookingDate={siteBookingDate}
            setSiteBookingDate={setSiteBookingDate}
            shouldOpenCalendar={shouldOpenCalendar}
            shouldCloseCalendar={shouldCloseCalendar}
            setShouldOpenCalendar={setShouldOpenCalendar}
            setShouldCloseCalendar={setShouldCloseCalendar}
            datePickerRef={datePickerRef}
          />
        )}

        <div className="input-handler-cont">
          <div className="ai-bot">
            <BotHandler
              isTalking={isTalking}
              isThinking={isThinking}
              isListening={isListening}
              visemeData={visemeData}
            />
          </div>
          <div className="ai-bot-section">
            <div className="bot-response" ref={chatContainerRef}>
              {chatMessages.map((message) => (
                <div
                  className={`bot-response-text ff-r ${customClassName} ${
                    message.from === "bot" ? "bot-msg" : "user-msg"
                  }`}
                >
                  {message.content === "..." ? (
                    <BeatLoader
                      color="#c4c4c4"
                      margin={2.25}
                      size={7.5}
                      speedMultiplier={0.8}
                    />
                  ) : (
                    message.content
                  )}
                </div>
              ))}
            </div>
            <div className={`input-section noselect`}>
              <div className="bg-cover"></div>
              <div
                className="text-input-section"
                style={{ width: inputMsg.length ? "85%" : "85%" }}
              >
                <input
                  ref={inputRef}
                  disabled={
                    isRecording ||
                    responseReady === false ||
                    isThinking ||
                    startingToRecord
                  }
                  onKeyPress={handleKeyPress}
                  onChange={(event) => setInputMsg(event.target.value)}
                  value={inputMsg}
                  placeholder={buttonText}
                  className={`text-input ff-m ${customClassName} `}
                  type="text"
                ></input>
              </div>
              <div
                className="controls-section"
                style={{ width: inputMsg.length ? "15%" : "15%" }}
              >
                <div
                  className="btn-wrapper"
                  style={{ justifyContent: inputMsg.length ? "left" : "left" }}
                >
                  {inputMsg.length ? (
                    <VscSend
                      disabled={startingToRecord || responseReady === false}
                      className="ui-rec-btn active ff-m"
                      onClick={startRecording}
                      color="rgba(255, 255, 255, 0.7)"
                      size={19}
                    />
                  ) : (
                    <>
                      <a data-tooltip-id="mic">
                        <button
                          className="ui-rec-btn-cont"
                          disabled={startingToRecord || responseReady === false}
                          onClick={
                            startingToRecord || responseReady === false
                              ? null
                              : startRecording
                          }
                          // onMouseDown={startingToRecord || responseReady === false || pixelStreamingConfig.disableInput ? null : startRecording}
                          // onMouseUp={isRecording ? startRecording : null}
                          // onMouseLeave={isRecording ? startRecording : null}

                          // onTouchStart={startingToRecord || responseReady === false || pixelStreamingConfig.disableInput ? null : startRecording}
                          // onTouchEnd={isRecording ? startRecording : null}
                          // onTouchCancel={isRecording ? startRecording : null}

                          style={{
                            background: "transparent",
                            padding: "0",
                            border: "none",
                          }}
                        >
                          {isRecording ? (
                            <PiMicrophoneFill
                              // disabled={startingToRecord || responseReady === false}
                              className="ui-rec-btn active ff-m animate-opacity"
                              // onClick={startingToRecord || responseReady === false ? null : startRecording}
                              color={"#fc3d39"}
                              size={23}
                            />
                          ) : (
                            <PiMicrophone
                              // disabled={pixelStreamingConfig.disableInput || startingToRecord || responseReady === false}
                              className={`ui-rec-btn active ff-m ${
                                startingToRecord || responseReady === false
                                  ? "disabled"
                                  : ""
                              }`}
                              // onClick={startingToRecord || responseReady === false || pixelStreamingConfig.disableInput ? null : startRecording}
                              color={"rgb(255, 255, 255, 0.7)"}
                              size={23}
                            />
                          )}
                        </button>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioToText;
