import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { FaCheck } from "react-icons/fa6";

import '../Styles/bg-darkDD.css'
import '../Styles/mobileDD.css'

const DayDatePicker = ({ siteBookingDate, handleSiteBooking, setSiteBookingDate, shouldOpenCalendar, shouldCloseCalendar, setShouldOpenCalendar, setShouldCloseCalendar, datePickerRef }) => {

  useEffect(() => {
    setSiteBookingDate(new Date())
  }, [])

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="site-booking-cont">
      <div className="site-booking-title ff-r fs-sm">
        Select date and time
      </div>
      <div className="site-booking-action">
        <DatePicker
          ref={datePickerRef}
          onClose={setShouldCloseCalendar}
          className={`bg-dark ff-r fs-sm ${window.innerWidth < 768 ? 'rmdp-mobile' : ''}`}
          format="DD/MM/YY hh:mm A"
          type="input"
          minDate={new Date()}
          value={siteBookingDate}
          highlightToday={false}
          showOtherDays={true}
          onChange={setSiteBookingDate}
          plugins={[
            <TimePicker hideSeconds />
          ]}
          {...(isMobileDevice ? {} : { onClose: setShouldCloseCalendar })} 
        />
        <div style={{ marginLeft: window.innerWidth < 768 ? "0.5rem" : "1rem" }}>
          <button className="ff-r fs-sm site-booking-btn" onClick={handleSiteBooking}>
            <FaCheck />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayDatePicker