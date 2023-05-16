
(function(){
    AOS.init()
})()

let video = document.getElementById("myface");
var overlay = document.getElementById('overlay');
let again = document.getElementById("again");
var overlayCC = overlay.getContext('2d');
let emotion =  null; 
let prev = null;
let tracker = true;
let testCtr = 0;
function startVideo(video){
    document.addEventListener("DOMContentLoaded", () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            var video = document.querySelector('video');
            video.srcObject = stream;
            video.play();
        })
    });
    initializeFacial();
}

function initializeFacial(){
   
    let videoInput = document.getElementById('myface');
    if (videoInput){
        var ctracker = new clm.tracker();
        ctracker.init();
        ctracker.start(videoInput);
        var ec = new emotionClassifier();
        ec.init(emotionModel);
        var emotionData = ec.getBlank();

        // Get Current Element 
        function drawLoop() {
            requestAnimationFrame(drawLoop);
            overlayCC.clearRect(0, 0, 720, 560)
            ctracker.draw(overlay); 
            if(tracker){
                trackData();
            }
        }

        function trackData() {
            var cp = ctracker.getCurrentParameters();
            var er = ec.meanPredict(cp);
            console.log(er);
            let maxCtr = 0; 
            let max = `none`; 

            if (testCtr > 0){
                setTimeout(updateEmotion(emotion),100); 
            }
            if(er){
                for (var i = 0;i < er.length;i++) {
                    if(er[i].emotion ==  'fear'){
                        continue
                    }
                    if (er[i].value > maxCtr) {
                        maxCtr = er[i].value; 
                        console.log(er[i].value);
                        max = er[i].emotion; 
                    } 
                }
                console.log(max);
                emotion = document.getElementById(`${max}`); 
                
                if (emotion){
                    console.log(`testCtr:${testCtr}`);
                    if (testCtr == 0){
                        prev = emotion.id; 
                    }
                    console.log("Success");
                    console.log(prev);
                   
                    displayData(emotion, prev);
                    tracker = false;
                    testCtr += 1; 
                    prev = emotion.id; 
                    
                    
                } else {
                    console.log("ID not retrieved");
                }
               
            } else{
                console.log("Fail to retrieve data");
            }
        
        }
        drawLoop(); 
    
        
    }
        
}

function updateEmotion(emotion){
    emotion.style.display = 'none'; 
    var response = document.getElementById(`response`);
    if (response){
        response.innerHTML = `Testing ...`;
        console.log("Success In changing"); 
    } else {
        console.log("Did not change feedback");
    }
    
}

again.addEventListener('click', () =>{
    console.log("Testing");
    tracker = true; 
})

function displayData(emotion, prev){
    emotion.style.display = 'block'; 
    // Create a new h2 element
    let response = document.getElementById(`response`); 
    if (response){
        response.innerHTML = `You are feeling ${emotion.id} today`;
        if (prev == emotion.id){
            response.innerHTML = `You are still feeling ${emotion.id} today`;
        }
    } else {
        const newHeading = document.createElement('h2');
        newHeading.id = `response`; 
        newHeading.textContent = `You are feeling ${emotion.id} today`;
        document.getElementById(`img-container`).appendChild(newHeading);
    }
}




var screenshotButton = document.getElementById('screenshot');
var screenshotContainer = document.getElementById('screenshotContainer');

function captureScreenshot() {
  var video = document.getElementById('myface');
  html2canvas(video).then(function(canvas) {
    screenshotContainer.innerHTML = ''; // Clear previous screenshots
    screenshotContainer.appendChild(canvas);
  });
}

screenshotButton.addEventListener('click', captureScreenshot);

startVideo();
initializeFacial();