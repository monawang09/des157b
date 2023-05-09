// JS here
const newBtn = document.getElementById("newbtn");
const editBtns = document.querySelectorAll(".fa-edit");
const addFriendForm = document.getElementById("add-friend");
const editFriendForm = document.getElementById("edit-friend"); 
const friendsList = document.querySelector("main ol"); 


Parse.initialize("rPY2xpZWfYjmv7C8n64RXLKhzTR6MMqDmk1NGX8u","pRymVL4LNhtX6q7gFa0VlMGxTtLR3SvzHPVYSyYo"); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
Parse.serverURL = 'https://parseapi.back4app.com/'

async function displayFriends() {
    const friends = Parse.Object.extend('Friends');
    const query = new Parse.Query(friends);
    const results = await query.ascending('lname').find();
    results.forEach(eachFriend => {
        const id = eachFriend.id; 
        const lname = eachFriend.get('lname');
        const fname = eachFriend.get('fname');
        const email = eachFriend.get('email');
        const facebook = eachFriend.get('facebook');
        const twitter = eachFriend.get('twitter');
        const instagram = eachFriend.get('instagram');
        const linkedin = eachFriend.get('linkedin');
        const thelistItem = document.createElement("li"); 
        thelistItem.setAttribute("id", `r-${id}`);
        thelistItem.innerHTML = `
            <div class="name"> ${fname} ${lname}</div>
            <div class="email">
                <i class="fas fa-envelope-square"></i> ${email}
            </div>
            <div class="social">
                <a href=${facebook}"><i class="fab fa-facebook-square"></i></a>
                <a href=${twitter}><i class="fab fa-twitter-square"></i></a>
                <a href=${instagram}><i class="fab fa-instagram"></i></a>
                <a href=${linkedin}><i class="fab fa-linkedin"></i></a>
            </div>
            <i class="fas fa-edit" id="e-${id}"></i>
            <i class="fas fa-times-circle" id="d-${id}></i>`; 
        friendsList.append(thelistItem); 
    });

    console.log(results);
}

displayFriends();

for(let i=0; i < editBtns.length; i++){
    editBtns[i].addEventListener("click", function(event){
        event.preventDefault();
        editFriendForm.className = "edit-friend-onscreen"; 
    })
}


editFriendForm.addEventListener("submit", function(event){
    event.preventDefault();
    editFriendForm.className = "edit-friend-onscreen"; 
})
