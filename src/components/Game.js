import { useEffect, useRef, useState } from 'react';
import ReactHowler from 'react-howler'

import '../App.css';

import AudioToText from '../components/AudioToText';
import mediaDictionary from '../components/Assets/KeywordMediaMap';
import { IoLinkOutline } from "react-icons/io5";


const Game = ({ agentIdFromServer, userMobileNumber, isAgent, userName }) => {

  // console.log("agentIdFromServer", agentIdFromServer)

  // Game
  const [startClicked, setStartClicked] = useState(false)


  // User preferences
  // const [userMobileNumber, setUserMobileNumber] = useState(8390796812)


  // Audio
  const [audioSrc, setAudioSrc] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true);

  const handleEnd = () => {
    console.warn("audio finished playing")
    setIsPlaying(false)
  }


  // Animations
  const [isTalking, setIsTalking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)


  // Navigation
  const defaultMenu = [
    "Apartment",
    "Location",
    "Amenities",
    "Walkthrough",
  ];
  const defaultMenuIcon = [
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu1.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu4.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu3.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu1.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu3.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu1.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu4.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu3.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu1.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu3.png",
    "https://xrv-xrc.s3.ap-south-1.amazonaws.com/Mahalaxmi/Resources/defaultMenu3.png",
  ]

  //media index state
  const [playIndex, setPlayIndex] = useState(0)

  //items on the navigation
  const [menuItems, setMenuItems] = useState(defaultMenu)

  //item icons on the navigation
  const [menuItemsIcon, setMenuItemsIcon] = useState(defaultMenuIcon)

  // state to show / hide sub menu
  const [showSubItems, setShowSubItems] = useState(false)

  // 
  const [currentSubItem, setCurrentSubItem] = useState("")

  // media files of the current sub item
  const [mediaList, setMediaList] = useState([mediaDictionary.Default.panoramic[0]])

  useEffect(() => {
    console.log(mediaList, playIndex)
  }, [mediaList, playIndex])


  const navigationProp = {
    defaultMenu: defaultMenu,
    menuItems: menuItems,
    setMenuItems: setMenuItems,
    showSubItems: showSubItems,
    setShowSubItems: setShowSubItems,
    defaultMenuIcon: defaultMenuIcon,
    menuItemsIcon: menuItemsIcon,
    setMenuItemsIcon: setMenuItemsIcon,
    mediaList: mediaList,
    setMediaList: setMediaList,
    currentSubItem: currentSubItem,
    setCurrentSubItem: setCurrentSubItem,
    playIndex: playIndex,
    setPlayIndex: setPlayIndex
  }

  const [copyText, setCopyText] = useState("Copy")
  let copyTextTimeout = useRef()

  return (
    <>
      {
        true
        &&
        <>
          {
            audioSrc
            &&
            <ReactHowler
              playing={isPlaying}
              src={audioSrc}
              format={['mp3', 'wav']}
              loop={false}
              volume={1}
              mute={isMuted}
              onEnd={handleEnd}
            />
          }
        </>
      }

      {
        agentIdFromServer
        &&
        <div
          style={{
            position: "absolute",
            top: window.innerWidth < 600 ? "5rem" : "1.3rem",
            color: "white",
            background: "black",
            zIndex: "1000",
            margin: "auto",
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #c4c4c4",
            cursor: "pointer"
          }}
          onClick={() => {
            clearTimeout(copyTextTimeout)
            navigator.clipboard.writeText(`https://mahalaxmi.xrvizion.com/${agentIdFromServer}`).then(() => {
              // console.log('Text copied to clipboard!');
              setCopyText("Copied!")
              copyTextTimeout.current = setTimeout(() => {
                setCopyText("Copy")
                clearTimeout(copyTextTimeout)
              }, 3000);
            })
          }}
        >
          <IoLinkOutline size={20} color='white' style={{ marginRight: "0.5rem" }} />
          <div className='ff-r fs-sm'>https://mahalaxmi.xrvizion.com/{agentIdFromServer.replace(/.*\//, '').substring(0, window.innerWidth < 768 ? 3 : 6) + '...'}</div>
          <button
            className='ff-sb fs-xs'
            style={{
              background: "#ffffff",
              borderRadius: "0.3rem",
              border: "none",
              padding: "0.3rem 0.75rem",
              marginLeft: "1rem",
              color: "black",
              cursor: "pointer",
              pointerEvents: "none"
            }}
          >{copyText}</button>
        </div>
      }

      <AudioToText
        userMobileNumber={userMobileNumber}
        userName={userName}
        // setUserMobileNumber={setUserMobileNumber}
        isListening={isListening}
        setIsListening={setIsListening}
        isTalking={isTalking}
        setIsTalking={setIsTalking}
        startClicked={startClicked}
        setStartClicked={setStartClicked}
        setIsThinking={setIsThinking}
        isThinking={isThinking}
        setAudioSrc={setAudioSrc}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        setIsPlaying={setIsPlaying}
        navigationProp={navigationProp}
        isAgent={isAgent}
      />
    </>
  )
}

export default Game