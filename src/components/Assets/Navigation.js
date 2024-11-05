import React, { useEffect, useRef, useState } from "react";

import mediaDictionary from "./KeywordMediaMap";

import ScrollContainer from "react-indiana-drag-scroll";

import { BsArrowRightCircle } from "react-icons/bs";
import { BsArrowLeftCircle } from "react-icons/bs";
import GlassmorphismDialog from "./anotations";

import { IoArrowBackCircleOutline } from "react-icons/io5";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { IoPlayOutline } from "react-icons/io5";
import { IoPauseOutline } from "react-icons/io5";

import "../Styles/navigationStyle.css";

const Navigation = ({ navigationProp }) => {
  const itemInterval = useRef();
  const [slideShowPlaying, setSlideShowPlaying] = useState(false);

  useEffect(() => {
    if (navigationProp.showSubItems) {
      // console.log("Interval started")
      // itemInterval.current = setInterval(() => {
      //   console.warn("Auto next")
      //   const nextBtn = document.getElementById("next-btn")
      //   nextBtn.click()
      // }, 5000);
    } else {
      // clearInterval(itemInterval.current)
      // console.log("Interval cleared")
    }
  }, [navigationProp.showSubItems, navigationProp.menuItems]);

  const startSlideShow = () => {
    if (slideShowPlaying) {
      clearInterval(itemInterval.current);
      setSlideShowPlaying(false);
    } else {
      if (navigationProp.showSubItems) {
        setSlideShowPlaying(true);
        console.log("Interval started");
        itemInterval.current = setInterval(() => {
          console.warn("Auto next");
          const nextBtn = document.getElementById("next-btn");
          nextBtn.click();
        }, 5000);
      }
    }
  };

  const handleSubItems = (data) => {
    console.log(data);
    navigationProp.setShowSubItems(true);

    if (data === "Walkthrough") {
      navigationProp.setMenuItems(["Walkthrough"]);
      playSubItem("Walkthrough");
    } else if (data === "Apartment") {
      navigationProp.setMenuItems([
        "Living room",
        "Kitchen",
        "Bedroom",
        "Dinning room",
        "Bathroom",
      ]);
      playSubItem("Living room");
    } else if (data === "Amenities") {
      navigationProp.setMenuItems([
        "Yoga deck",
        "Party lawn",
        "Cricket net",
        "Car charging point",
        "Clubhouse",
        "Tennis",
        "Billiards",
        "Gym",
        "Multipurpose hall",
        "Lobby",
        "Lift",
      ]);
      playSubItem("Yoga deck");
    } else if (data === "Location") {
      navigationProp.setMenuItems(["Location", "Top view", "Side view"]);
      playSubItem("Location");
    } else if (data === "Miscellaneous") {
      navigationProp.setMenuItems(["Elevation"]);
      playSubItem("Elevation");
    }
  };

  const handleShowDefaultItems = () => {
    clearInterval(itemInterval.current);
    setSlideShowPlaying(false);
    navigationProp.setShowSubItems(false);
    navigationProp.setMenuItems(navigationProp.defaultMenu);
    playSubItem("Default");
  };

  const playSubItem = (data) => {
    // Set the current sub-item
    console.log(data);

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

    if (mediaDictionary[data].panoramic.length) {
      newMediaList.push(...mediaDictionary[data].panoramic);
    }

    // Set the media list to the state
    navigationProp.setMediaList(newMediaList);
  };

  const playNextMedia = () => {
    // console.log(navigationProp.mediaList, navigationProp.playIndex)
    if (navigationProp.mediaList[navigationProp.playIndex + 1]) {
      console.warn("There is next");
      navigationProp.setPlayIndex((prev) => prev + 1);
    } else {
      // console.log(navigationProp.menuItems.indexOf(navigationProp.currentSubItem))
      let index = navigationProp.menuItems.indexOf(
        navigationProp.currentSubItem
      );

      if (navigationProp.menuItems.length > index + 1) {
        console.warn(
          "Playing the next sub item",
          navigationProp.menuItems[index + 1]
        );
        playSubItem(navigationProp.menuItems[index + 1]);
      } else {
        // console.log("There is nothing")
        clearInterval(itemInterval.current);
        setSlideShowPlaying(false);
        // console.log("Interval cleared")
      }
    }
  };

  const playPrevMedia = () => {
    if (navigationProp.mediaList[navigationProp.playIndex - 1]) {
      console.warn("There is prev");
      navigationProp.setPlayIndex((prev) => prev - 1);
    } else {
      // console.log(navigationProp.menuItems.indexOf(navigationProp.currentSubItem))
      let index = navigationProp.menuItems.indexOf(
        navigationProp.currentSubItem
      );

      if (index - 1 >= 0) {
        console.warn(
          "Playing the last sub item",
          navigationProp.menuItems[index - 1]
        );
        playSubItem(navigationProp.menuItems[index - 1]);
      } else {
        // console.log("There is nothing")
      }
    }
  };

  const handleUserInteraction = (event) => {
    const targetId = event.target.id;
    // console.log("Interacted", event.target.id)
    if (
      targetId === "next-btn" ||
      targetId === "prev-btn" ||
      targetId.includes("item-") === true
    ) {
      clearInterval(itemInterval.current);
      setSlideShowPlaying(false);
      // console.log("interval cleared")
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Cleanup interval and event listeners on component unmount
    return () => {
      clearInterval(itemInterval.current);
      setSlideShowPlaying(false);
      document.removeEventListener("mousedown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  return (
    <>
      <div className="overlay" style={{ zIndex: "0" }}></div>

      {navigationProp.showSubItems && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            transform: "translateY(-50%)",
            width: "100%",
            zIndex: 10,
          }}
        >
          <button
            onClick={playPrevMedia}
            id="prev-btn"
            style={{
              position: "absolute",
              zIndex: "5",
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
          >
            <BsArrowLeftCircle
              size={35}
              color="#ffffff95"
              style={{
                pointerEvents: "none",
              }}
            />
          </button>

          <button
            onClick={playNextMedia}
            id="next-btn"
            style={{
              position: "absolute",
              zIndex: "3",
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
          >
            <BsArrowRightCircle
              size={35}
              color="#ffffff95"
              style={{
                pointerEvents: "none",
              }}
            />
          </button>
        </div>
      )}

      {navigationProp.showSubItems && (
        <>
          <div
            className="ff-m fs-xs"
            style={{
              position: "absolute",
              zIndex: "3",
              top: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              background: "#00000050",
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #fff",
            }}
          >
            {navigationProp.currentSubItem}
          </div>
        </>
      )}

      <ScrollContainer
        className="scroll-container"
        horizontal={true}
        style={{
          position: "absolute",
          zIndex: "2",
          transition: "transform2 1s ease-out",
          // maskImage: "linear-gradient(to left, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        <div className="nav-menu">
          {navigationProp.showSubItems ? (
            <>
              <div
                className="nav-menu-item-cont nav-sub-menu-item-cont"
                style={{ margin: "0 -0.5rem 0 0" }}
              >
                <div
                  className="nav-menu-item-overlay nav-sub-menu-item-overlay"
                  style={{ width: "1rem", minWidth: "1rem" }}
                  onClick={handleShowDefaultItems}
                ></div>
                <div
                  className="nav-menu-item"
                  style={{ width: "1rem", minWidth: "1rem" }}
                >
                  <div className="nav-menu-item-info nav-sub-menu-item-info">
                    <MdKeyboardArrowLeft
                      size={28}
                      style={{
                        // position: "absolute",
                        // zIndex: "3",
                        color: "#ffffff",
                      }}
                    />
                    {/* <div className={`nav-menu-item-title ff-m ${window.innerWidth > 768 ? "fs-xxs" : "fs-xs"}`}>show all</div> */}
                  </div>
                </div>
              </div>

              <div className="nav-menu-item-cont nav-sub-menu-item-cont">
                <div
                  className="nav-menu-item-overlay"
                  style={{ width: "1rem", minWidth: "1rem" }}
                  onClick={startSlideShow}
                ></div>
                <div
                  className="nav-menu-item"
                  style={{ width: "1rem", minWidth: "1rem" }}
                >
                  <div className="nav-menu-item-info nav-sub-menu-item-info">
                    {slideShowPlaying ? (
                      <IoPauseOutline
                        size={24}
                        style={{
                          // position: "absolute",
                          // zIndex: "3",
                          color: "#ffffff",
                        }}
                      />
                    ) : (
                      <IoPlayOutline
                        size={24}
                        style={{
                          // position: "absolute",
                          // zIndex: "3",
                          color: "#ffffff",
                        }}
                      />
                    )}
                    {/* <div className={`nav-menu-item-title ff-m ${window.innerWidth > 768 ? "fs-xxs" : "fs-xs"}`}>show all</div> */}
                  </div>
                </div>
              </div>

              {navigationProp.menuItems.map((data, index) => {
                return (
                  <div className="nav-menu-item-cont">
                    <div
                      className="nav-menu-item-overlay"
                      id={`item-${index}`}
                      onClick={() => playSubItem(data)}
                    ></div>
                    <div key={index} className="nav-menu-item">
                      <div className="nav-menu-item-info">
                        {/* <FaPlay size={17} style={{
                            // position: "absolute",
                            // zIndex: "3",
                            color: "rgb(255 255 255 / 80%)",
                            marginBottom: "0.65rem"
                          }} /> */}
                        <div
                          className={`nav-menu-item-title ff-m ${
                            window.innerWidth > 768 ? "fs-xxs" : "fs-xs"
                          }`}
                        >
                          {data}
                        </div>
                      </div>
                      {/* <img key={index} src={navigationProp.defaultMenuIcon[index]} alt={navigationProp.defaultMenu[index]}></img> */}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            navigationProp.menuItems.map((data, index) => {
              return (
                <div className="nav-menu-item-cont">
                  <div
                    className="nav-menu-item-overlay"
                    onClick={() => handleSubItems(data)}
                  ></div>
                  <div key={index} className="nav-menu-item">
                    <div className="nav-menu-item-info">
                      <div
                        className={`nav-menu-item-title ff-m ${
                          window.innerWidth > 768 ? "fs-xxs" : "fs-xs"
                        }`}
                      >
                        {data}
                      </div>
                    </div>
                    {/* <img key={index} src={navigationProp.defaultMenuIcon[index]} alt={navigationProp.defaultMenu[index]}></img> */}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollContainer>
    </>
  );
};

export default Navigation;
