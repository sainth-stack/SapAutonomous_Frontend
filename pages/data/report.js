import React from "react";
import ReportViewer from "./filter/main";

const Report = () => {
  return (
    <div className="mx-auto p-0 bg-white rounded-lg">
      {/* ReportViewer now handles its own data loading from backend */}
      <ReportViewer />
    </div>
  );
};

export default Report;