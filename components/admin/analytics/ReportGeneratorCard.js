import React, { useState } from 'react';
import Button from '../../Button.js';

const ReportGeneratorCard = ({ reportTypes, dateRanges, onGenerateReport }) => {
  const reportTypeList = reportTypes && reportTypes.length > 0 ? reportTypes : ['Select report'];
  const dateRangeList = dateRanges && dateRanges.length > 0 ? dateRanges : ['Select range'];
  const [selectedReportType, setSelectedReportType] = useState(reportTypeList[0]);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRangeList[0]);

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-2" }, "Report Generator"),
      React.createElement("p", { className: "text-gray-600 text-sm mb-6" }, "Export comprehensive system analytics for offline review."),

      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" },
        /* Select Report Type */
        React.createElement("div", null,
          React.createElement("label", { htmlFor: "report-type", className: "block text-sm font-medium text-gray-700 mb-2" }, "Select Report Type"),
          React.createElement("div", { className: "relative" },
            React.createElement("select", {
              id: "report-type",
              value: selectedReportType,
              onChange: (e) => setSelectedReportType(e.target.value),
              className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500",
              "aria-label": "Select Report Type"
            },
              reportTypeList.map((type) => (
                React.createElement("option", { key: type, value: type }, type)
              ))
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
                React.createElement("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.043 6.871 4.636 8.278z" })
              )
            )
          )
        ),

        /* Date Range */
        React.createElement("div", null,
          React.createElement("label", { htmlFor: "date-range", className: "block text-sm font-medium text-gray-700 mb-2" }, "Date Range"),
          React.createElement("div", { className: "relative" },
            React.createElement("select", {
              id: "date-range",
              value: selectedDateRange,
              onChange: (e) => setSelectedDateRange(e.target.value),
              className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500",
              "aria-label": "Select Date Range"
            },
              dateRangeList.map((range) => (
                React.createElement("option", { key: range, value: range }, range)
              ))
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" })
              )
            )
          )
        )
      ),

      React.createElement("div", { className: "flex items-center justify-between border-t border-gray-100 pt-6" },
        React.createElement("p", { className: "text-sm text-gray-500 flex items-center" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 mr-2 text-blue-500" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.02M10.5 18.75H9a2.25 2.25 0 00-2.25 2.25V21h4.5v-2.25A2.25 2.25 0 0010.5 18.75zm6.75-10.5H18a2.25 2.25 0 012.25 2.25V21h-4.5v-2.25m-1.5 0a.75.75 0 00-1.5 0V21h3v-2.25z" })
          ),
          "Reports are generated in PDF and CSV formats by default."
        ),
        React.createElement(Button, { variant: "primary", onClick: () => onGenerateReport(selectedReportType, selectedDateRange) },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 mr-2" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" })
          ),
          "Download Report"
        )
      )
    )
  );
};

export default ReportGeneratorCard;
