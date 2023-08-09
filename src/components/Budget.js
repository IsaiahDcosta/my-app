import React, { useState,useEffect } from 'react';
import { Input, Button, List, InputNumber, Modal, Progress } from 'antd';
import Header from './Header';
import Footer from './Footer';
import './App.css';
import SummaryPage from '../SummaryPage';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Budget = () => {

    const [expenses, setExpenses] = useState([]);
  // const [monthlySalary, setMonthlySalary] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  // const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlySummary, setMonthlySummary] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { monthlySalary: initialMonthlySalary, selectedMonth: initialSelectedMonth } = location.state || {};
  const [monthlySalary, setMonthlySalary] = useState(initialMonthlySalary || 0);
  const [selectedMonth, setSelectedMonth] = useState(initialSelectedMonth || '');

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('budgetData'));
  
    if (savedData) {
      setExpenses(savedData.expenses);
      setMonthlySalary(savedData.monthlySalary);
      setSelectedMonth(savedData.selectedMonth);
    } else if (location.state) {
      const { expenseToEdit, monthlySummary, selectedMonth, monthlySalary } = location.state;
      setExpenses([expenseToEdit]);
      setMonthlySalary(monthlySalary);
      setSelectedMonth(selectedMonth);
      setMonthlySummary(monthlySummary);
    }
  }, [location.state]);

  useEffect(() => {
    const dataToSave = {
      expenses,
      monthlySalary,
      selectedMonth,
    };
    localStorage.setItem('budgetData', JSON.stringify(dataToSave));
  }, [expenses, monthlySalary, selectedMonth])


  const handleSaveExpense = () => {
    if (!expenseDescription || isNaN(expenseAmount) || !selectedMonth) return;

    const newExpense = { description: expenseDescription, amount: expenseAmount, month: selectedMonth };
    setExpenses([...expenses, newExpense]);

    const year = new Date().getFullYear();

    // Update monthly summary
    const updatedSummary = {
      budget: monthlySalary,
      totalExpenses: (monthlySummary[year]?.[selectedMonth]?.totalExpenses || 0) + newExpense.amount,
      // Add any other fields you need in the summary
    };
    updateMonthlySummary(year, selectedMonth, updatedSummary);

    setExpenseDescription('');
    setExpenseAmount(0);
    setModalVisible(false);
  };


  
  const handleDeleteExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const calculateRemainingBudget = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return monthlySalary - totalExpenses;
  };

  const handleAddSalary = () => {
    if (!monthlySalary || isNaN(monthlySalary)) return;

    setMonthlySalary(monthlySalary);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSetMonth = () => {
    setSelectedMonth(selectedMonth);
  };
  const updateMonthlySummary = (year, month, summary) => {
    setMonthlySummary((prevSummary) => ({
      ...prevSummary,
      [year]: {
        ...(prevSummary[year] || {}),
        [month]: summary,
      },
    }));
  };

  const calculateMonthlySummary = () => {
    const summaryData = {}; // Object to store summary data

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!summaryData[year]) {
        summaryData[year] = {};
      }

      if (!summaryData[year][month]) {
        summaryData[year][month] = {
          budget: monthlySalary, // You can use the monthly salary as the budget
          totalExpenses: 0,
        };
      }

      summaryData[year][month].totalExpenses += expense.amount;
    });

    return summaryData;
  };

  const handleClick = () => {
    
    navigate('/', { state: { monthlySummary } });
  };

  
    return (  
        <div className="App">
    
      <Header />
      <div className="input-container">
      <Input
          placeholder="Enter the month (e.g., January)"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ marginRight: '10px', marginTop: '10px' }}
          size="large"
        />
      </div>
      <div className="selected-month">
        {selectedMonth && <h2>Selected Month: {selectedMonth}</h2>}
      </div>
      <div className="input-container">
        <InputNumber
          placeholder="Enter your salary for the month"
          value={monthlySalary}
          onChange={(value) => setMonthlySalary(value)}
          type="number"
          style={{ marginRight: '10px', marginTop: '10px' }}
          size="large"
        />
        <Button type="primary" onClick={handleAddSalary} style={{ marginTop: '10px' }}>
          Monthly Salary
        </Button>
      </div>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginTop: '15px' }}>
        Add Expense
      </Button>
      <div className="search-container">
        <Input.Search
          size="large"
          placeholder="Search expenses"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: '10px', marginTop: '10px' }}
        />
      </div>
      <div className="input-container">
      
      </div>
      <div className="selected-month">
        {selectedMonth && <h2>Selected Month: {selectedMonth}</h2>}
      </div>
      <div className="expenses-list">
        <List
          header={<h3>Expenses List</h3>}
          bordered
          dataSource={filteredExpenses}
          renderItem={(item, index) => (
            <List.Item>
              {item.description} - ₹ {item.amount}
              <Button type="primary" danger onClick={() => handleDeleteExpense(index)}>
                Delete
              </Button>
            </List.Item>
          )}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: expenses.length,
            onChange: handlePageChange,
          }}
        />
      </div>
      <div className="remaining-budget">
        <h2>Remaining Budget: ₹ {calculateRemainingBudget().toFixed(2)}</h2>
        <Progress
          size={[300, 20]}
          percent={((calculateRemainingBudget() / monthlySalary) * 100).toFixed(2)}
          status="active"
          style={{ width: '70%', marginTop: '10px' }}
          strokeColor={{
            '0%': '#4681f4',
            '100%': '#4681f4',
          }}
        />
      </div>
      <Modal
        title="Add Expense"
        visible={modalVisible}
        onOk={handleSaveExpense}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          placeholder="Expense Description"
          value={expenseDescription}
          onChange={(e) => setExpenseDescription(e.target.value)}
        />
        <InputNumber
          placeholder="Expense Amount (in rupees)"
          value={expenseAmount}
          onChange={(value) => setExpenseAmount(value)}
          type="number"
          style={{ marginTop: '10px' }}
        />
      </Modal>
      <Button
        type="primary"
        onClick={() => {
          const dataToSave = {
            expenses,
            monthlySalary,
            selectedMonth,
          };
          localStorage.setItem('budgetData', JSON.stringify(dataToSave));
        }}
        style={{ marginTop: '15px' }}
      >
        Save Data
      </Button>
      
      <Footer />
      
        <Button onClick={handleClick}>Summary

        </Button>
      
      
    </div>
    );
}
 
export default Budget;