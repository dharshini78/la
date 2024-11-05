import React, { useRef } from 'react'
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";

import '../Styles/bg-darkDD.css'
import '../Styles/mobileDD.css'

const SiteBooking = ({ setShowSiteBooking, setShowSiteBookingForm, datePickerRef }) => {

  return (
    <div className="site-booking-cont">
      <div className="site-booking-title ff-r fs-sm">
        Do you want to schedule a site visit?
      </div>
      <div className="site-booking-action">
        <div style={{ marginRight: "1rem" }}>
          <button className="ff-r fs-sm site-booking-btn" onClick={() => setShowSiteBooking(false)}>
            <FaXmark />
          </button>
        </div>
        <div>
          <button className="ff-r fs-sm site-booking-btn" onClick={() => {
            setShowSiteBookingForm(true)
            setShowSiteBooking(false)
            const dateTimeInterval = setInterval(() => {
              // console.log(datePickerRef.current)
              if (datePickerRef.current) {
                datePickerRef.current.openCalendar()
                clearInterval(dateTimeInterval)
              }
            }, 500);
          }}>
            <FaCheck />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SiteBooking