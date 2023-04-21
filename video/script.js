const element = document.getElementById("myVideo");

document.addEventListener("mousemove", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  const halfwidth = 0.5*window.innerWidth;
  const halfheight = 0.5*window.innerHeight;
  const blurAmount = ((x - halfwidth)*(x - halfwidth) + (y - halfheight)*(y - halfheight))/ (halfwidth * halfwidth) * 10; 
  element.style.filter = `blur(${blurAmount}px)`;
});

const loading = document.querySelector('.fa-dove');

myVideo.addEventListener('playing',function(){
  loading.style.display = 'none'; 
})