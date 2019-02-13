const rsschool = JSON.parse(JSON.stringify(rsschoolJson));
const rsschoolDemo = JSON.parse(JSON.stringify(rsschoolJsonDemo));
const table = document.querySelector('table');
const chartContainter = document.querySelector('.chart-container');

let createUsersData = (session, users) => {
    let data = [];
    let puzzles = [];
        session.puzzles.forEach((element) => {
            puzzles.push(element.name);
        })
    users.forEach((element, index, array) => {        
        let userId = array[index].uid;
        let user = {
            id: index,
            name: array[index].displayName,
            solutions: [],
            score: 0          
        };
        for (let i = 0; i < puzzles.length; i++) {
            user.solutions[i] = session.rounds[i].solutions[userId];
            if ((user.solutions[i]) && (user.solutions[i].correct === 'Correct')) {
                user.score += +user.solutions[i].time.$numberLong;
            } else {
                user.solutions[i] = {};
                user.solutions[i].code = 'Incorrect';
                user.solutions[i].time = {};
                user.solutions[i].time.$numberLong = 150;
                user.score += +user.solutions[i].time.$numberLong;                
            }
        }
        data.push(user);
    });
    return {
        users: data,
        puzzles: puzzles
    };
}

const sessionData = createUsersData(rsschool, users);
const sessionDataDemo = createUsersData(rsschoolDemo, users);
let currentData = sessionData;

const createTable = (data) => {
    table.innerHTML = "";
    let tableHeader = document.createElement('tr');
    let headerName = document.createElement('th');
    headerName.textContent = 'Name';
    tableHeader.appendChild(headerName);
    data.puzzles.forEach((element) => {
        let puzzleName = document.createElement('th');
        puzzleName.textContent = element;
        tableHeader.appendChild(puzzleName);
    });
    let score = document.createElement('th');
    score.textContent = "Score";
    let comparison = document.createElement('th');
    comparison.textContent = "Comparison";    
    tableHeader.appendChild(score);
    tableHeader.appendChild(comparison);
    table.appendChild(tableHeader);
    console.log(data);
    data.users.forEach((element, index) => {
        let row = document.createElement('tr');        
        let name = document.createElement('td');
        name.textContent = element.name;
        row.appendChild(name);
        element.solutions.forEach((element) => {
            let cell = document.createElement('td');
            cell.textContent = element.time.$numberLong;
            if (element.correct === 'Correct')  {
                cell.setAttribute('data-value', element.code);
                cell.setAttribute('class', 'correct-cell');
            } else {
                cell.setAttribute('class', 'incorrect-cell')
            }           
            row.appendChild(cell);
        })
        let scoreCell = document.createElement('td');
        scoreCell.textContent = element.score;
        row.appendChild(scoreCell);
        let comparisonCell = document.createElement('td');
        let comparisonCheck = document.createElement('input');
        comparisonCheck.setAttribute('id', data.users[index].id);
        comparisonCheck.setAttribute('type', 'checkbox');
        comparisonCell.appendChild(comparisonCheck);
        row.appendChild(comparisonCell);
        table.appendChild(row);       
    });
}

createTable(currentData);

const setData = (data) => {
    currentData = data;
}

const showTable = (e) => {
    if (e.target.value == 0) {
        chartContainter.innerHTML = '';
        chartData.datasets = [];
        setData(sessionData)
        createTable(currentData);
    } else if (e.target.value == 1) {
        chartContainter.innerHTML = '';
        chartData.datasets = [];
        setData(sessionDataDemo)
        createTable(currentData);
    }
}

document.addEventListener('click', (e) => {showTable(e)});

let chartData = {
    labels: [],
    datasets: []
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

const generateRandomColor = () => {
    const r = getRandomInt(0, 255);
    const g = getRandomInt(0, 255);
    const b = getRandomInt(0, 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

const addChartData = (currentData, chartData, id) => {
    chartData.labels = currentData.puzzles;
    let data = [];
    for (let i = 0; i < chartData.labels.length; i++) {
        data.push(+currentData.users[id].solutions[i].time.$numberLong)
    }
    let item = {
        id: id,
        data: data,
        label: currentData.users[id].name,
        borderColor: generateRandomColor(),
        fill: false
    }    
    if (chartData.datasets.find((element, index) => {return element.id == id})) {
        let elem = chartData.datasets.find((element, index) => {
            return element.id == id
        });
        chartData.datasets.splice(chartData.datasets.indexOf(elem), 1);
        
    } else {
        chartData.datasets.push(item);
    }    
    console.log(chartData);
}

const createChart = (chartData) => {
    if (!chartData.datasets.length) {
        chartContainter.innerHTML = '';
    } else {
        let newChart = document.createElement('canvas');
        chartContainter.appendChild(newChart);
        return new Chart(newChart, {
            type: 'line',
            data: chartData,
            options: {
              animation: false,
              responsive: true,
              maintainAspectRatio: true,
              title: {
                display: true,
                text: 'CSS QD line chart'
              }
            }
          });
    }    
}

table.addEventListener('click', (e) => {
    if (e.target.matches('input') && chartData.datasets.length < 10) {
        chartContainter.innerHTML = '';
        addChartData(currentData, chartData, e.target.id);        
        createChart(chartData);        
    } else if (e.target.matches('input') && chartData.datasets.length >= 10 && !e.target.checked) {
        chartContainter.innerHTML = '';
        addChartData(currentData, chartData, e.target.id);        
        createChart(chartData); 
    } else if (e.target.matches('input') && chartData.datasets.length >= 10) {
        e.preventDefault();
    } 
});