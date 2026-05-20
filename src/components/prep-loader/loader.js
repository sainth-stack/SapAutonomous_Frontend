import React from "react";
import Lottie from "lottie-react";

// Import the JSON data
import animationData from "./preploader.json"; // Make sure to replace with the correct path to your JSON file

const PrepLoader = ({
  height = "80px",
  minHeight = "80px",
  width = "200px",
}) => {
  return (
    <div
      style={{
        marginTop:"3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: minHeight,
      }}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: width, height: height }}
      />
      <p
        style={{
          marginTop: "10px",
          fontSize: "16px",
          fontWeight: "500",
          color: "#555",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        Loading, please wait...
      </p>
    </div>
  );
};

export default PrepLoader;
