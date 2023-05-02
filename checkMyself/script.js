const foodCard = document.getElementsByClassName("food-container");
let calendarColor = [`#B4D1C1`,`#855B58`,`#D1B6B4`,`#F5FFF9`,`#658573`]; 

// LocalStorage 

// Load and read Json file and color the calendar according to the brick 
async function getData(){
    const fetchPromise = await fetch('./data.json');
    const data = await fetchPromise.json();
    const eating = data['Food']; 
    console.log(eating);

    for (const meal of eating){
        const time = meal["time"];
        const eatingtime = time.slice(0,3)+"00"; 
        const other = time.slice(3,5);
        // console.log(other);
        // console.log(eatingtime);
        const calendarTime = document.getElementById(eatingtime);
        // Calculate 100% porportion 
        let final_time = (other / 60) * 50;

        // Create the extra Slot ? How to fix the slot problem 
        // Haven't considered Calendar either  

        // Create the time Slot 
        const timeSlot = document.createElement("div");
        timeSlot.setAttribute("class", "food-Object");
        timeSlot.dataset.time = meal.time;
        timeSlot.dataset.type = meal.type;
        timeSlot.dataset.food = meal.item;
        timeSlot.style.width = "80%";
        timeSlot.style.paddingLeft = `5px`;
        // timeSlot.style.marginLeft = `5px`;
        timeSlot.innerHTML = `<p class = "calendar-log">${meal.item}</p>`;

        timeSlot.style.height = `${final_time}px`;
     //   timeSlot.style.backgroundColor = `rgba(180, 209, 193)`; //Set the opacity too 
     
     //  timeSlot.style.backgroundColor = calendarColor[Math.floor(Math.random() * 5)]; //Set the opacity too   

        timeSlot.style.borderRadius = `3px`;
    
        calendarTime.appendChild(timeSlot);

        // Hover 
        timeSlot.addEventListener('mouseover', function() {
            timeSlot.style.backgroundColor = 'rgb(225, 232, 228)';
        });

        timeSlot.addEventListener('mouseout', function() {
            timeSlot.style.backgroundColor = 'rgb(215, 228, 196)';
        });
    }
    loadCard();

}

function loadCard(){
    const individualData = document.querySelectorAll('.food-Object'); 
    for(const individual of individualData) {
        individual.addEventListener("click",function() {
            // Inisitalize data 
            addCard(individual);
            
        })
    }
    // Add Event Listener to individual data 
}

function addCard(element){
    // Create Card 
    const foodSlot = document.createElement("div");
    const foodSelector = document.getElementById("card-container");
    foodSlot.setAttribute("class", "food-container");
    let img = ``
    let text = '<p class="font-styler">';
    // Style for the card 
    //foodSlot.style.backgroundColor = `rgba(255, 255, 255)`;
    foodSlot.style.borderRadius = `10px`;
    foodSlot.style.marginLeft  = `100px`;
    foodSlot.style.marginBottom  = `30px`;
   
    text += ` ${element.dataset.time}</p>`;
    text += `<p class = "subfont-styler"> Food: ${element.dataset.food} <br>`;
    text += `Type: ${element.dataset.type} </p>`;
    if (element.dataset.type == `fiber`){
        text += `<i class="fa-solid fa-carrot"></i>`; 
        foodSlot.style.backgroundColor = `#eabba9`;

    } else if (element.dataset.type == `protein`){
        text += `<i class="fa-solid fa-drumstick-bite"></i>`; 
        foodSlot.style.backgroundColor = `#f8b3c6`;
    } else if (element.dataset.type == `carbonhydrate`){
        text += `<i class="fa-solid fa-bread-slice"></i>`; 
        foodSlot.style.backgroundColor = `#d6d1c5`; 
    } else {
        text += `<i class="fa-solid fa-mug-hot"></i>`;
        foodSlot.style.backgroundColor = `#cdc3db`; 
    }
    foodSlot.innerHTML = text;

    foodSelector.appendChild(foodSlot);
    setTimeout(() => {
        foodSlot.classList.add('show');
      }, 0); // Add CSS animation after class 

    let clickCount = 0;

  //  const listenChange = document.getElementsByClassName("food-container");
   // console.log("HIHI")




}

function listenChange(){

}

function writeJson(){
    // Pop Up form 
    var myButton = document.getElementById("fill-in");

    myButton.addEventListener("click", function() {
        myForm.style.display = "block";
    });

    //

}


getData();



