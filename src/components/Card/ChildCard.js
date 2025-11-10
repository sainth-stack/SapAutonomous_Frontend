import React, { useEffect, useState } from "react";

import { FaFreeCodeCamp, FaIndustry, FaMoneyBillAlt, FaThumbsUp } from "react-icons/fa";
// import PropTypes from 'prop-types';

const ChildCard = ({ agent, navigate, logo }) => {
  const [likes, setLikes] = useState(0);

  // This should be inside the component
  useEffect(() => {
    // Effect logic here
    console.log("Effect ran when component mounted or likes changed");
  }, [likes]); // Add the necessary dependencies

  const handleLike = (e) => {
    e.stopPropagation();
    setLikes(likes + 1); // Example logic for incrementing likes
  };
  //   console.log("Agent Data:", agentData);
  //   <ChildCard agent={agentData} navigate={navigateFunction} logo={logoImage} />

  return (
    <div
      className="agent-card"
      key={agent.id}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/agnets-hub/details/${agent.id}`)}
    >
      <div className="agent-info">
        <img src={agent?.logo} alt={""} className="agent-image" />
        <div className="tag-line">
          <h3 className="name">{agent.name}</h3>
          <p className="">{agent.tagline}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="tag free" >
          <FaFreeCodeCamp /> {agent?.pricing_model}
        </span>
        <span className="turn">
          <FaMoneyBillAlt /> {agent?.category}
        </span>
        <span className="turn" style={{background:'lightblue'}}>
          <FaIndustry /> {agent?.industry}
        </span>
        <span
          className="hello"
          onClick={handleLike}
          style={{ cursor: "pointer", marginLeft: "7px", marginLeft: "17px",display:'flex',gap:'4px',alignItems:'center' }}
        >
          <FaThumbsUp /> {likes}
        </span>
      </div>
    </div>
  );
};

export default ChildCard;
