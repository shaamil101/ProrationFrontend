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
  const [showOutput, setShowOutput] = useState(false); // State to control output visibility

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

  const handleInputChange = (event) => {
    setAlloc(event.target.value);
  }

  const removeInvestor = (id) => {
    setInvestors(investors.filter((investor) => investor.id !== id));
    if (investors.length > 0) {
      handleSubmit;
    }
  }

  const handleInvestorChange = (id, field, value) => {
    setInvestors(
      investors.map(investor => 
        investor.id === id ? { ...investor, [field]: value } : investor));
  }
  
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

    try {
      const response = await axios.post('https://proration-api-ccbe1a010de1.herokuapp.com/api/prorate', data);
      console.log('Response', response.data);
      const updatedInvestors = response.data.map((investorData, index) => ({
        ...investors[index], // Preserve original id and other fields
        allocatedAmount: investorData.allocatedAmount // Update with new allocated amount
      }));
      setInvestors(updatedInvestors);
      setShowOutput(true); // Show the output div after calculation
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

      {/* Output section is only displayed if showOutput is true */}
      
        <div className="rightDiv card">
        <h2>Output</h2>

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
