import { useState } from 'react'
import axios from 'axios'
import './App.css'
import { AiOutlineMinusCircle } from "react-icons/ai";
import { Pie } from 'react-chartjs-2';
import { v4 as uuidv4 } from 'uuid'; 
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [alloc, setAlloc] = useState(0);
  const [investors, setInvestors] = useState([{
      id: uuidv4(),
      name: '',
      requestedAmount: '',
      averageAmount: '',
      allocatedAmount: '',
  }]);
  const [showOutput, setShowOutput] = useState(false); 

  //When the user clicks the + Add Investor button, a new investor is added to the list of investors
  const addInvestor = () => {
    setShowOutput(false); 
    const newInvestor = {
      id: uuidv4(),
      name: '',
      requestedAmount: '',
      averageAmount: '',
      allocatedAmount: '',
    }
    setInvestors([...investors, newInvestor]);
  }

  //When the user types in the Allocation input box, the value is stored in the state
  const handleInputChange = (event) => {
    setAlloc(event.target.value);
  }

  //When the user clicks the - button, the investor is removed from the list of investors and then resubmits the form
  const removeInvestor = (id) => {
    setInvestors(investors.filter((investor) => investor.id !== id));
    if (investors.length > 0) {
      handleSubmit;
    }
  }

  //When the user types in the input boxes for the investor, the value is stored in the state
  const handleInvestorChange = (id, field, value) => {
    setInvestors(
      investors.map(investor => 
        investor.id === id ? { ...investor, [field]: value } : investor));
  }
  
  //When the user clicks the Calculate button, the form data is sent to the API and the response is displayed
  const handleSubmit = async () => {
    const data = {
      allocationAmount: alloc,
      investors: investors.map(investor => ({
        name: investor.name,
        requestedAmount: investor.requestedAmount,
        averageAmount: investor.averageAmount,
      })),
    }
    console.log('Send', data)

    //Send the data to the API
    try {
      const response = await axios.post('https://proration-api-ccbe1a010de1.herokuapp.com/api/prorate', data);
      console.log('Response', response.data);
      const updatedInvestors = response.data.map((investorData, index) => ({
        ...investors[index], 
        allocatedAmount: investorData.allocatedAmount 
      }));
      setInvestors(updatedInvestors);
      setShowOutput(true); 
    } catch (error) {
      console.error('Error', error);
    }
  }

  
  const pieChartData = {
    labels: investors.map(investor => investor.name),
    datasets: [
      {
        label: 'Allocated Amount',
        data: investors.map(investor => investor.allocatedAmount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="container">
      <div className="leftDiv card">
        <h2>Welcome to Angellist Prorate!</h2>
        <h3>Total available allocation</h3>
        <input
          type="text"
          placeholder="Allocation ($)"
          value={alloc}
          onChange={handleInputChange}
          className="inputBox"
        />
        <h3>Investors</h3>

        {investors.map((investor) => (
          <div className="Investor" key={investor.id}>
            <div className="Fields">
              <input
                type="text"
                placeholder="Name"
                value={investor.name}
                onChange={(e) => handleInvestorChange(investor.id, 'name', e.target.value)}
                className="inputBox"
              />
              <input
                type="text"
                placeholder="Requested Amount ($)"
                value={investor.requestedAmount}
                onChange={(e) => handleInvestorChange(investor.id, 'requestedAmount', e.target.value)}
                className="inputBox"
              />
              <input
                type="text"
                placeholder="Average Amount ($)"
                value={investor.averageAmount}
                onChange={(e) => handleInvestorChange(investor.id, 'averageAmount', e.target.value)}
                className="inputBox"
              />
              <AiOutlineMinusCircle className="remove" onClick={() => removeInvestor(investor.id)} />
            </div>
          </div>
        ))}

        <button className="add button" onClick={addInvestor}>
          + Add Investor
        </button> 
        <button className="button" onClick={handleSubmit}>
          Calculate
        </button> 
      </div>

      
        <div className="rightDiv card">
        <h2>Output</h2>
        {/* Display the list of investors and their allocated amounts if there's more than one investor and our logic for show ouptut is true */}
        {showOutput && investors.length >0 && (
          <>
            {investors.map((investor) => (
              <h3 key={investor.id}> {investor.name} - ${investor.allocatedAmount} </h3>
            ))}
            <div className="chart-container">
            <h3>Allocation Distribution</h3>
            <Pie data={pieChartData} />
          </div>
          </>

          
        )}
        </div>

    </div>
  )
}

export default App;
