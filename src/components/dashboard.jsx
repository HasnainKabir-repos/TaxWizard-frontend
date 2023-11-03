import React, { useState } from 'react';
import Header from './Header';
import axios from 'axios';
import jsPDF from 'jspdf';
// const gridContainerStyle = {
//   display: 'grid',
//   gridTemplateColumns: '1fr 1fr',
//   gap: '20px',
//   maxWidth: '1200px',
//   margin: 'auto',
//   padding: '15px',
// };
  
const gridContainerStyle = {
  display: 'grid',
  gap: '20px',
  maxWidth: '600px',
  maxHeight: '1000px',
  width: '100%',
  height: '60%',
  margin: 'auto',
  padding: '15px',
  background: '#e9edeb',
  // Dark green shadow
};


const pageWrapperStyle = {
  display: 'grid',
  width: '100vw',
  height: '100vh',
  margin: '0',
  background: '#7CABA1',
  boxShadow: '0px 4px 6px rgba(0, 128, 0, 0.2)', 
};

  

const columnStyle = {
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '20px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  background: '#7CABA1', // Background colo

};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  width: '100%',
  marginBottom: '15px',
};

const selectStyle = {
  ...inputStyle,
  height: '40px',
};

const incomeInputStyle = {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '96%',
    marginBottom: '15px',
  };
  const h1Style = {
    color: 'white', // Text color
    transition: 'color 0.3s ease-in-out', // Add a color transition
  };

const buttonStyle = {
    padding: '8px 16px', // Adjusted padding
    fontSize: '1.1rem', // Slightly larger font size
    color: 'white',
    backgroundColor: '#0A7B79', // Button color
    border: '2px solid white', // White border
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  };

const taxListStyle = {
  ...columnStyle,
  maxHeight: '300px',
  overflowY: 'auto',
};

const TaxDashboard = () => {
  const [income, setIncome] = useState('');
  const [gender, setGender] = useState('');
  const [calculatedTax, setCalculatedTax] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  let logMessages = []; // Moved outside to maintain state across renders

  // Override console.log and capture messages
  const originalConsoleLog = console.log;
console.log = (...messages) => {
  logMessages.push(messages.map(msg => typeof msg === 'object' ? JSON.stringify(msg) : msg).join(' '));
  originalConsoleLog.apply(console, messages);
};
  // Function to generate PDF with captured logs
  const generatePDF = () => {
    const pdf = new jsPDF();
  
    // Add console log messages line by line
    pdf.setFontSize(12);
    logMessages.forEach((message, index) => {
      pdf.text(message, 10, 10 + (10 * index));
    });
  
    // Add page numbers as footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Page ${i} of ${pageCount}`, 190, pdf.internal.pageSize.height - 10);
    }
  
    pdf.save('console_log.pdf');
  };
  
  
  const calculateTax = async (event) => {
    event.preventDefault();
  
    try {
      const data = {
        token: JSON.parse(localStorage.getItem("token")),
        income: Number(income),
        gender: gender,
        location: selectedLocation
      };
  
      const response = await axios.post("http://localhost:9000/api/calculatetax", data);
      console.log(response.data); // This will be captured for the PDF
  
      setCalculatedTax(response.data.data.tax);
      generatePDF(); // Generate the PDF
      
      
    } catch (error) {
      console.error("Error calculating tax", error);
    }
  };
  const handleButtonClick = async (event) => {
    await calculateTax(event); // Wait for calculateTax to finish
    generatePDF(); // Generate the PDF containing console log messages
  };
  
  



  return (
    <div>
        <Header/>
    <div style={pageWrapperStyle}>
    <div style={gridContainerStyle}>
      <div style={columnStyle}>
        {/* <h1>Tax Calculation Dashboard</h1> */}
        <h1 style={h1Style}>Tax Calculation Dashboard</h1>
        <form onSubmit={calculateTax}>
          <div>
            <label htmlFor="income">Income:</label>
            <input
              type="number"
              id="income"
              placeholder="Enter your income"
              style={incomeInputStyle}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              style={selectStyle}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>

            </select>
          </div>
          <div>
            <label htmlFor="location">Location:</label>
            <select
              id="location"
              style={selectStyle}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
             
              
              {/* <option value="Sylhet">Other</option> */}
            </select>
          </div>
          <button type="submit" style={buttonStyle} onClick={handleButtonClick}>
            Calculate Tax
          </button>
        
        </form>
        {calculatedTax !== null && (
         <h2>Calculated Tax: BDT {calculatedTax}</h2>
        )}
      </div>
      {/* <div style={taxListStyle}>
        <h3 style={h1Style}>Calculated Taxes by Year</h3>
        <ul>
          {((record, index) => (
            <li key={index}>
              Year: {record.year}, Tax: ${record.tax.toFixed(2)}, Location: {record.location}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
</div>
</div>
  );
};

export default TaxDashboard;
