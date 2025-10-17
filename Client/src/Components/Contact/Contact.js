import React from "react";
import developerPng from "./images/developer-png.png";

const Contact = () => {
  return (
    <div className="contactUs-main-container">
      <div className="contactUs-left-para">
        <h3>Let's get in touch</h3>
        <i class="fa fa-envelope"></i>
        <a class="mail-links" href="mailto:ananyarachamalla1205@gmail.com">
          ananyarachamalla1205@gmail.com
        </a>

        <i class="fa fa-linkedin"></i>
        <a class="mail-links" href="https://www.linkedin.com/in/kashiekzmi/">
          User Name: Ananya & Ajith
        </a>

        <i class="fa fa-github"></i>
        <a class="mail-links" href="https://github.com/KaShiekzmi">
          ananyarachamalla1205
        </a>

        <i class="fa fa-instagram"></i>
        <a class="mail-links" href="https://www.instagram.com/kaxhie_x/">
          @Anu_12
        </a>

        <i class="fa fa-phone"></i>
        <a class="mail-links" href="tel:+923019583959">
          +91 8886530305
        </a>
      </div>
      <div className="contactUs-pic">
        <img src={developerPng} alt="Profile"/>
      </div>
    </div>
  );
};

export default Contact;
