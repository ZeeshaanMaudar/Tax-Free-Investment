let yearObject = {};

const financialYearArray = [
  { month: 'March', value: 3 },
  { month: 'April', value: 4 },
  { month: 'May', value: 5 },
  { month: 'June', value: 6 },
  { month: 'July', value: 7 },
  { month: 'August', value: 8 },
  { month: 'September', value: 9 },
  { month: 'October', value: 10 },
  { month: 'November', value: 11 },
  { month: 'December', value: 12 },
  { month: 'January', value: 1 },
  { month: 'February', value: 2 },
];

financialYearArray.forEach(({ month, value }) => {
  yearObject[value] = month;
});

populateLumpSumMonths = () => {
  financialYearArray.forEach(({ month, value }) => {
    let monthOption = document.createElement('option');
    monthOption.value = value;
    let monthNode = document.createTextNode(month);

    monthOption.appendChild(monthNode);

    document.getElementById('lump-sum-month').appendChild(monthOption);
  })
}

populateDebitOrderMonths = () => {
  financialYearArray.forEach(({ month, value }) => {
    let monthOption = document.createElement('option');
    monthOption.value = value;
    let monthNode = document.createTextNode(month);

    monthOption.appendChild(monthNode);

    document.getElementById('order-debit-month').appendChild(monthOption);
  })
}

populateLumpSumMonths();
populateDebitOrderMonths();


addResultToDom = ({ result, applicationStatus, year, addDebitOrder }) => {
  let resultTitleElement = document.createElement('h4');
  let resultTitleNode = document.createTextNode('Results Output:');
  resultTitleElement.appendChild(resultTitleNode);


  let applicationStatusElement = document.createElement('p');
  
  let resultClass = 'text-success';
  let successState = 'Successful';

  if(!applicationStatus) {
    resultClass = 'text-danger';
    successState = 'Rejected';
  }

  applicationStatusElement.innerHTML=`<strong>Application:</strong> <strong class=${resultClass}>${successState}</strong>`

  let totalContributionsElement = document.createElement('p');
  totalContributionsElement.id = 'totalContributions';
  totalContributionsElement.innerHTML=`<strong>Total Contributions:</strong> <strong class=${resultClass}>R${result.totalContributions}</strong>`;


  let earliestElement = document.createElement('p');
  earliestElement.id = 'earliestPermissibleDebitOrderStartMonth';

  earliestElement.innerHTML=`<strong>Earliest permissible debit order start month: <span class="text-info">${result.earliestPermissibleDebitOrderStartMonth}, i.e: ${yearObject[result.earliestPermissibleDebitOrderStartMonth]} ${year}${addDebitOrder}</span></strong>`;

  document.getElementById('results').appendChild(resultTitleElement);
  document.getElementById('results').appendChild(applicationStatusElement);
  document.getElementById('results').appendChild(totalContributionsElement);
  document.getElementById('results').appendChild(earliestElement);
}


numberOfMonthsUntilEndOfYearFromLumpSumMonth = lumpSumInvestmentMonth => {
  let numberOfMonths = 11;

  financialYearArray.forEach((financialYear, index) => {
    if(financialYear.value === lumpSumInvestmentMonth) {
      numberOfMonths = numberOfMonths - index;
    }
  });

  return numberOfMonths;
}


numberOfMonthsUntilEndOfYear = debitOrderStartMonth => {
  let numberOfMonths = 12;

  financialYearArray.forEach((financialYear, index) => {
    if(financialYear.value === debitOrderStartMonth) {
      numberOfMonths = numberOfMonths - index;
    }
  });

  return numberOfMonths;
}



isDebitOrderMonthValid = (lumpSumInvestmentAmount, lumpSumInvestmentMonth, debitOrderStartMonth, debitOrderAmount) => {

  if (debitOrderAmount > 0) {

    if (lumpSumInvestmentAmount === 0) {
      return true;
    } else {
      let indexForLumpSum;
      let indexForDebitOrder;

      financialYearArray.forEach((financialYear, index) => {

        if(financialYear.value=== lumpSumInvestmentMonth) {
          indexForLumpSum = index;
        }

        if(financialYear.value === debitOrderStartMonth) {
          indexForDebitOrder = index;
        }

      });

      // assuming that lumpsum and debit order cannot be on the same month
      // and that lumpsum deposit has to occur before any debit orders made if any.
      if(indexForLumpSum < indexForDebitOrder) {
        return true;
      } else {
        return false;
      }
    }


  } else {
    return true;
  }

};


const resultOutput = (lumpSumInvestmentMonth, lumpSumInvestmentAmount, debitOrderStartMonth, debitOrderAmount) => {

  const totalValidInvestmentPerYearlimit = 30000;


  const remaindingMonthsFromChosenDate = numberOfMonthsUntilEndOfYear(debitOrderStartMonth);
  const totalDebitOrderUntilEndOfYear = debitOrderAmount * remaindingMonthsFromChosenDate;

  const totalContributions = lumpSumInvestmentAmount + totalDebitOrderUntilEndOfYear;

  let result;
  let earliestPermissibleDebitOrderStartMonth = 3;

  let applicationStatus = true;
  let year = '2020';
  let addDebitOrder = '';

  const differenceAfterLumpSum = Math.abs(totalValidInvestmentPerYearlimit - lumpSumInvestmentAmount);
  const remaindingMonthsFromLumpSumMonth = numberOfMonthsUntilEndOfYearFromLumpSumMonth(lumpSumInvestmentMonth);


  let numberOfMonthsForDebitToBeValid = Math.floor(differenceAfterLumpSum / debitOrderAmount);

  if (debitOrderAmount === 0) {
    numberOfMonthsForDebitToBeValid = remaindingMonthsFromLumpSumMonth;
  }

  if (totalContributions > totalValidInvestmentPerYearlimit) {
    applicationStatus = false;
    year = '2021';


    if (numberOfMonthsForDebitToBeValid === 0) {

      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };

    } else if(numberOfMonthsForDebitToBeValid < remaindingMonthsFromLumpSumMonth) {

      const monthToBeValid = financialYearArray[12 - numberOfMonthsForDebitToBeValid];

      if (monthToBeValid.value === 1 || monthToBeValid.value === 2) {
        year = '2021';
      } else {
        year = '2020';
      }


      earliestPermissibleDebitOrderStartMonth = monthToBeValid.value;

      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };
    } else {

      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };

    }


  } else if (totalContributions ===  totalValidInvestmentPerYearlimit) {

    if (lumpSumInvestmentAmount === totalValidInvestmentPerYearlimit) {
      year = '2021';
      addDebitOrder = ' (at any amount up to R2500 per month)';
      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };
    } else {

      if (debitOrderStartMonth === 1 || debitOrderStartMonth === 2) {
        year = '2021';
      }
      result = { totalContributions, earliestPermissibleDebitOrderStartMonth: debitOrderStartMonth };
    }

  } else {


    if (lumpSumInvestmentAmount === 0) {

      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };

    } else {


      numberOfMonthsForDebitToBeValid = remaindingMonthsFromLumpSumMonth;

      let suggestedAmount = Math.floor((differenceAfterLumpSum / numberOfMonthsForDebitToBeValid) * 100) / 100;

      if (debitOrderAmount === 0) {
        addDebitOrder = ` (at a max amount of R${suggestedAmount} per month)`;
      }

      let monthToBeValid;

      if (numberOfMonthsForDebitToBeValid === 0) {
        addDebitOrder = ' (at any amount up to R2500 per month)';
        year = '2021';
        earliestPermissibleDebitOrderStartMonth = 3;
      } else {
        monthToBeValid = financialYearArray[12 - numberOfMonthsForDebitToBeValid];

        if (monthToBeValid.value === 1 || monthToBeValid.value === 2) {
          year = '2021';
        } else {
          year = '2020';
        }
  
  
        earliestPermissibleDebitOrderStartMonth = monthToBeValid.value;
      }


      result = { totalContributions, earliestPermissibleDebitOrderStartMonth };

    }

  }

  console.log('result: ', result);

  addResultToDom({ result, applicationStatus, year, addDebitOrder });
}


submitForm = () => {

  let resultsNode = document.getElementById('results')
  while (resultsNode.firstChild) {
    resultsNode.removeChild(resultsNode.firstChild);
  }

  const lumpsumLimit = 30000;
  const debitOrderLimitPerMonth = 2500;

  const selectLumpSumMonth = document.getElementById('lump-sum-month');
  const selectOrderDebitMonth = document.getElementById('order-debit-month');
  
  const lumpSumInvestmentMonth = parseInt(selectLumpSumMonth.options[selectLumpSumMonth.selectedIndex].value);
  const debitOrderStartMonth = parseInt(selectOrderDebitMonth.options[selectOrderDebitMonth.selectedIndex].value);
  const lumpSumInvestmentAmount = document.getElementById('lump-sum-amount').value ? Number(document.getElementById('lump-sum-amount').value) : 0;
  const debitOrderAmount = document.getElementById('debit-order-amount').value ? Number(document.getElementById('debit-order-amount').value) : 0;

  if (lumpSumInvestmentAmount <= 0 && debitOrderAmount <= 0) {
    return alert(`Please choose an amount for the Lump Sum Amount and/or Debit Order Amount`);
  }

  if (lumpSumInvestmentAmount < 0 || lumpSumInvestmentAmount > lumpsumLimit) {
    return alert(`Lump Sum Amount must be greater than or equal to R0 and less than or equal to R${lumpsumLimit}`);
  }

  if (!isDebitOrderMonthValid(lumpSumInvestmentAmount, lumpSumInvestmentMonth, debitOrderStartMonth, debitOrderAmount)) {
    return alert('Debit order month must start at least one month after the Lump Sum month');
  }

  if(lumpSumInvestmentAmount === lumpsumLimit && !!debitOrderAmount) {
    return alert('Total contributions for this tax year is already at limit. Debit orders can only be made as from the next tax year, i.e March 2021');
  }

  if (debitOrderAmount < 0 || debitOrderAmount > debitOrderLimitPerMonth) {
    return alert(`Debit Order Amount cannot be a negative value or greater than R${debitOrderLimitPerMonth}`);
  }

  resultOutput(lumpSumInvestmentMonth, lumpSumInvestmentAmount, debitOrderStartMonth, debitOrderAmount);

  return false;
}
