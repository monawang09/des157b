const calendar = document.getElementById("eightAM"); 
const foodCard = document.getElementsByClassName("food-container");
let Foodarr = []; 

// window.onload = function() {
//     const foodCard = document.getElementsByClassName("food-container");
//     foodCard.style.display = 'none';
// };

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

        // Create the time Slot 
        const timeSlot = document.createElement("div");
        timeSlot.style.width = "80%";
        timeSlot.style.height = `${final_time}px`;
        timeSlot.style.backgroundColor = `rgb(180, 209, 193)`;
        timeSlot.style.borderRadius = `3px`;

        calendarTime.appendChild(timeSlot);

        // Hover 
        timeSlot.addEventListener('mouseover', function() {
            timeSlot.style.backgroundColor = 'rgb(225, 232, 228)';
        });

        timeSlot.addEventListener('mouseout', function() {
            timeSlot.style.backgroundColor = 'rgb(180, 209, 193)';
        });
    }
}
getData();

// // Create new food card when click on time,
// calendar.addEventListener("click",function(){
//     // foodCard.style.display = 'relative'; 
//     calendar.style.backgroundColor ='aqua'; //When click it change 
// })



//Write to Json file with form 