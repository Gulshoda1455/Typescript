"use strict";
const $overlay = document.querySelector("#overlay");
const $modal = document.querySelector("#modal");
const $incomeBtn = document.querySelector("#incomeBtn");
const $expenseBtn = document.querySelector("#expenseBtn");
const $closeBtn = document.querySelector("#closeBtn");
const $transactionForm = document.querySelector("#transactionForm");
const $displayIncome = document.querySelector("#displayIncome");
const $displayExpense = document.querySelector("#displayExpense");
const url = new URL(location.href);
const INCOMES = JSON.parse(localStorage.getItem("transaction")) || [];
const EXPENSES = JSON.parse(localStorage.getItem("transaction")) || [];
const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get('modal') || "";
};
const checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm.querySelector("select");
    if (openModal === "income") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else if (openModal === "expense") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else {
        $overlay.classList.add("hidden");
    }
};
class Transaction {
    transactionName;
    transactionType;
    transactionAmount;
    type;
    date;
    constructor(transactionName, transactionAmount, transactionType, type) {
        this.transactionName = transactionName;
        this.transactionAmount = transactionAmount;
        this.transactionType = transactionType;
        this.type = type;
        this.date = new Date().getTime();
    }
}
const renderChart = () => {
    document.querySelector("#chartWrapper").innerHTML = '<canvas id="tranzactionChart"></canvas>';
    const $tranzactionChart = document.querySelector("#tranzactionChart");
    let delayed = false;
    // @ts-ignore
    new Chart($tranzactionChart, {
        type: 'pie',
        data: {
            labels: ["INCOME", "EXPENSE"],
            datasets: [{
                    label: "Data for income and expense",
                    data: [400, 200],
                    borderWidht: 3,
                    backgroundColor: "red"
                }]
        },
        options: {
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                // @ts-ignore
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 300 + context.datsetIndex * 100;
                    }
                    return delay;
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 16,
                        }
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
renderChart()

const createNewTransaction = (e) => {
    e.preventDefault();
    const inputs = Array.from($transactionForm.querySelectorAll("input, select"));
    const values = inputs.map((input) => {
        if (input.type === "number") {
            return +input.value;
        }
        return input.value ? input.value : undefined;
    });
    if (values.slice(0, getCurrentQuery() === "income" ? -1 : undefined).every((value) => typeof value === "string" ? value?.trim().length > 0 : value && value > 0)) {
        const newTransaction = new Transaction(...values, getCurrentQuery());
        if (getCurrentQuery() === "income") {
            INCOMES.push(newTransaction);
            localStorage.setItem("incomes", JSON.stringify(INCOMES));
        }
        else {
            EXPENSES.push(newTransaction);
            localStorage.setItem("expenses", JSON.stringify(EXPENSES));
        }
        window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
        checkModalOpen();
        inputs.forEach((input) => input.value = "");
        checkBalance()
        renderChart()
    }
};
const checkBalance = () => {
    const totalIncome = INCOMES.reduce((acc, nextIncome) => acc + nextIncome.transactionAmount, 0);
    const totalExpense = EXPENSES.reduce((acc, nextIncome) => acc + nextIncome.transactionAmount, 0);
    $displayExpense.innerHTML = `${totalExpense} UZS`;
    $displayIncome.innerHTML = `${totalIncome} UZS`;
};
checkBalance();
$incomeBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "income");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$expenseBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "expense");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$closeBtn.addEventListener("click", () => {
    window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
    checkModalOpen();
});
checkModalOpen();
$transactionForm.addEventListener("submit", createNewTransaction);
