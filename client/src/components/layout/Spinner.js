import React, { Fragment } from "react";
import PropTypes from "prop-types";
import spinner from "../spinner.gif";
const Spinner = (props) => {
  return (
    <Fragment>
      <img
        src={spinner}
        style={{ width: "200px", margin: "auto", display: "block" }}
        alt=""
      />
    </Fragment>
  );
};

export default Spinner;
