import React from 'react';
import { Card, Row, Col, Progress, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import './SummaryPage.css';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';

const SummaryPage = () => {
  const location = useLocation();
  const { monthlySummary: initialMonthlySummary } = location.state || {};
  const [monthlySummary, setMonthlySummary] = useState(initialMonthlySummary || {});

  useEffect(() => {
    const savedMonthlySummary = JSON.parse(localStorage.getItem('monthlySummary'));
    if (savedMonthlySummary) {
      const summaryObject = {};

      savedMonthlySummary.forEach((item) => {
        if (!summaryObject[item.year]) {
          summaryObject[item.year] = {};
        }
        summaryObject[item.year][item.month] = {
          budget: item.budget,
          totalExpenses: item.totalExpenses,
        };
      });

      setMonthlySummary(summaryObject);
    }
  }, []);

  const navigate = useNavigate();

  const handleSaveSummary = () => {
    const summaryArray = [];
    Object.keys(monthlySummary).forEach((year) => {
      Object.keys(monthlySummary[year]).forEach((month) => {
        const summaryItem = {
          year,
          month,
          budget: monthlySummary[year][month].budget,
          totalExpenses: monthlySummary[year][month].totalExpenses,
        };
        summaryArray.push(summaryItem);
      });
    });
    localStorage.setItem('monthlySummary', JSON.stringify(summaryArray));
  };



  // const handleSaveSummary = () => {
  //   const summaryArray = [];
  //   Object.keys(monthlySummary).forEach((year) => {
  //     Object.keys(monthlySummary[year]).forEach((month) => {
  //       const summaryItem = {
  //         year,
  //         month,
  //         budget: monthlySummary[year][month].budget,
  //         totalExpenses: monthlySummary[year][month].totalExpenses,
  //       };
  //       summaryArray.push(summaryItem);
  //     });
  //   });
  //   localStorage.setItem('monthlySummary', JSON.stringify(summaryArray));
  // };
  
  
  
  
  const calculateAverage = (data) => {
    
    
    const total = Object.keys(data).reduce(
      (sum, year) => sum + Object.keys(data[year]).length,
      0
    );
    const totalBudget = Object.keys(data).reduce(
      (sum, year) =>
        sum +
        Object.keys(data[year]).reduce(
          (monthSum, month) => monthSum + data[year][month].budget,
          0
        ),
      0
    );
    const totalExpenses = Object.keys(data).reduce(
      (sum, year) =>
        sum +
        Object.keys(data[year]).reduce(
          (monthSum, month) => monthSum + data[year][month].totalExpenses,
          0
        ),
      0
    );
    return {
      averageSalary: totalBudget / total,
      averageBudget: totalBudget / total,
      averageExpenses: totalExpenses / total,
    };
  };

  const averageData = calculateAverage(monthlySummary);

  const graphData = Object.keys(monthlySummary).reduce((data, year) => {
    Object.keys(monthlySummary[year]).forEach((month) => {
      const percentageUsed = (monthlySummary[year][month].totalExpenses / monthlySummary[year][month].budget) * 100;
      data.push({
        month: `${year}-${month}`,
        percentageUsed,
      });
    });
    return data;
  }, []);


  return (
    
    <div className="summary-page">
    <Link to="/budget">
    <button>
      Create Budget
    </button>
  </Link>
      <div className="remaining-budget">
        <h2>Average Salary/Budget: ₹ {averageData.averageSalary.toFixed(2)}</h2>
        
        <h2>Average Expenses: ₹ {averageData.averageExpenses.toFixed(2)}</h2>
      </div>
      <h1>Summary Page</h1>
      {Object.keys(monthlySummary).map((year) => (
        <div key={year}>
          <h2>{year}</h2>
          <Row gutter={[16, 16]}>
            {monthlySummary[year] &&
              Object.keys(monthlySummary[year]).map((month) => (
                <Col key={month} xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card title={`${year} - ${month}`} style={{ marginBottom: '10px' }}>
                    <p>Budget: ₹ {monthlySummary[year][month].budget}</p>
                    <p>Total Expenses: ₹ {monthlySummary[year][month].totalExpenses}</p>
                    {/* Display any other summary data you have */}
                    <Progress
                      percent={
                        (((monthlySummary[year][month].budget - monthlySummary[year][month].totalExpenses) /
                          monthlySummary[year][month].budget) *
                        100).toFixed(2)
                      }
                    />
                    <Button
                        type="primary"
                        onClick={() => {
                          const selectedExpense = {
                            description: `${year} - ${month}`,
                            amount: monthlySummary[year][month].budget,
                          };
                          navigate('/budget', {
                            state: {
                              expenseToEdit: selectedExpense,
                              monthlySummary,
                              selectedMonth: `${year} - ${month}`,
                              monthlySalary: monthlySummary[year][month].budget,
                            },
                          });
                        }}
                      >
                        Edit
                      </Button>
                  </Card>
                </Col>
              ))}
          </Row>
          <Button type="primary" onClick={handleSaveSummary} style={{ marginTop: '15px' }}>
        Save Summary
      </Button>
        </div>
      ))}
      {/* <div className="graph-container">
        <ResponsiveContainer width="80%" height={400}>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentageUsed" fill="#fff" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}
    </div>
    
    
  );
};

export default SummaryPage;
