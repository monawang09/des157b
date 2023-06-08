// Animation before loading the monument

document.getElementById("loadscene").addEventListener("click", function () {
  var elementsToHide = document.querySelectorAll("#start, #loadscene");
  
  elementsToHide.forEach( (element)=>{
    document.getElementById('start').classList.remove('animate__zoomIn');
    setTimeout(()=>{
      element.classList.add("hide-animation");
      element.addEventListener("animationend", ()=>{
        element.remove();
      });
    }, 500);
  });

  var dedication = document.createElement('h1');
  var script = document.createElement('script');
  script.src = 'main.js';
  script.type = 'module';
  console.log(script.type);


  setTimeout(()=>{
      dedication.id = 'second';
      dedication.textContent = 'Dedicated to diverse community at Davis that makes this city a better place';
      dedication.classList.add('fade-in-animation');
  }, 1000);
  // Append the new element to the desired parent element
  var parentElement = document.getElementById('startingPage');
  parentElement.appendChild(script);
  parentElement.appendChild(dedication);


  //document.head.appendChild(script);
  var secondHide = document.querySelectorAll("#second, #startingPage");

  secondHide.forEach(function(element) {
    setTimeout(function() {
      element.classList.add('hide-animation');
      element.addEventListener('animationend', function() {
        element.remove();
        console.log(element);

      });
    }, 3000);
  });

  setTimeout(()=>{
    let content = document.getElementById("content"); 
    content.id = 'curate'; 
    var scrollElement = document.createElement("div");
    var scrollIcon = document.createElement("div");

    // Set the inner HTML of the new element
    scrollElement.innerHTML = "Scroll to explore <br> Hover over glowing cube to view information";
    scrollElement.id = 'instruction';
    scrollIcon.className = 'icon-scroll';
    content.appendChild(scrollElement);
    content.appendChild(scrollIcon);

  }, 3001);

});

   