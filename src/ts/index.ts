const $overlay = document.querySelector("#overlay") as HTMLDivElement;
const $modal = document.querySelector("#modal") as HTMLDivElement;

const $incomeBtn = document.querySelector("#incomeBtn") as HTMLButtonElement;
const $expenseBtn = document.querySelector("#expenseBtn") as HTMLButtonElement;
const $closeBtn = document.querySelector("#closeBtn") as HTMLButtonElement;
const $transactionForm = document.querySelector("#transactionForm") as HTMLFormElement;
const $displayIncome = document.querySelector("#displayIncome") as HTMLElement;
const $displayExpense = document.querySelector("#displayExpense") as HTMLElement;


type TIncome ={
    transactionName:string,
    transactionType:string | undefined,
    transactionAmount:number,
    type:string,
    date:number
}

const url = new URL(location.href)

const INCOMES = JSON.parse(localStorage.getItem("transaction") as string) || []
const EXPENSES = JSON.parse(localStorage.getItem("transaction") as string) || []



const getCurrentQuery = ()=>{
    return new URLSearchParams(location.search).get('modal') || "" as string
}

const checkModalOpen = ()=>{
    let openModal = getCurrentQuery()
    let $select =$transactionForm.querySelector("select") as HTMLSelectElement;
    if(openModal === "income" ){
        $overlay.classList.remove("hidden")
        $select.classList.add("hidden")
    }
    else if(openModal === "expense" ){
        $overlay.classList.remove("hidden")
        $select.classList.add("hidden")
    }
    
    else{
        $overlay.classList.add("hidden") 
    }
}

class Transaction {
    transactionName:string
    transactionType:string | undefined
    transactionAmount:number
    type:string
    date:number

    constructor(transactionName:string, transactionAmount:number, transactionType:string | undefined, type:string){
           this.transactionName = transactionName
           this.transactionAmount= transactionAmount
           this.transactionType = transactionType
           this.type = type
           this.date = new Date().getTime()
    }
}

const renderChart = ()=>{
    
    (document.querySelector("#chartWrapper") as HTMLDivElement).innerHTML='<canvas id="tranzactionChart"></canvas>';
    const $tranzactionChart = document.querySelector("#tranzactionChart") as HTMLDivElement;

    let delayed: boolean=false;

   // @ts-ignore
    new Chart(ctx,{
        type:'pie', 
        data:{
            labels:["INCOME", "EXPENSE"],
            datasets:[{
               label:"Data for income and expense" ,
               data:[400,200],
               borderWidht:3,
               backgroundColor: "red"

            }]
        },
        options:{
            animation:{
                onComplete :()=>{
    
                    delayed=true;
                },
                // @ts-ignore
                delay:(context)=>{
                    let delay=0;
                    if(context.type === 'data' && context.mode === 'default' && !delayed){
                        delay=context.dataIndex*300+context.datsetIndex*100;
                    }
                    return delay;
                },
            },
            scales:{
                x:{
                    grid:{
                        display:false
                    },
                    ticks:{
                        font:{
                            size: 16,
                            
                        }
                    }
                   
                },
                y:{
                    beginAtZero:false
                }
            }
        }
    });
}
renderChart();

const createNewTransaction = (e: Event)=>{
     e.preventDefault();

     const inputs = Array.from($transactionForm.querySelectorAll("input, select")) as HTMLInputElement[]
     const values: (string | number | undefined)[] = inputs.map((input)=>{
        if(input.type === "number"){
            return +input.value
        }
        return input.value ? input.value : undefined
     });

     if(values.slice(0, getCurrentQuery() === "income" ? -1 : undefined ).every((value) => typeof value === "string" ? value?.trim().length>0 : value && value>0)){
        const newTransaction = new Transaction(...values as [string, number, string | undefined],getCurrentQuery())

        if(getCurrentQuery() === "income"){
            INCOMES.push(newTransaction);
            localStorage.setItem("incomes", JSON.stringify(INCOMES));
        }else{
            EXPENSES.push(newTransaction); 
            localStorage.setItem("expenses", JSON.stringify(EXPENSES));
        }
     
     
     window.history.pushState({path: location.href.split("?")[0]}, "", location.href.split("?")[0] );
     checkModalOpen()
     

     inputs.forEach((input: HTMLInputElement) =>input.value="")
     checkBalance()
     renderChart();
     }
     
}

const checkBalance = ()=>{
    
    const totalIncome = INCOMES.reduce((acc:number, nextIncome:TIncome) => acc+ nextIncome.transactionAmount, 0)
    const totalExpense = EXPENSES.reduce((acc: number, nextIncome:TIncome) => acc+ nextIncome.transactionAmount, 0)
    $displayExpense.innerHTML = `${totalExpense} UZS`
     $displayIncome.innerHTML = `${totalIncome} UZS`
    
}

checkBalance()

$incomeBtn.addEventListener("click", ()=>{
      url.searchParams.set("modal","income")
      window.history.pushState({path: location.href + "?" + url.searchParams}, "", location.href + "?"+url.searchParams );
      checkModalOpen()
})

$expenseBtn.addEventListener("click", ()=>{
    url.searchParams.set("modal","expense")
      window.history.pushState({path: location.href + "?" + url.searchParams}, "", location.href + "?"+url.searchParams );
      checkModalOpen()
})

$closeBtn.addEventListener("click", ()=>{
    window.history.pushState({path: location.href.split("?")[0]}, "", location.href.split("?")[0] );
    checkModalOpen()
    
})

checkModalOpen()

$transactionForm.addEventListener("submit",createNewTransaction);