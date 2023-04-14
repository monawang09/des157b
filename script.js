(function() {
    'use strict';

    const button = document.querySelector('button');
    const body = document.querySelector('body');
    const banner = document.querySelector('#banner');
    const sections = document.querySelectorAll('section');
    let croc = document.getElementById("croc");
    let mode = 'dark';

    button.addEventListener('click', function() {
        if (mode == 'dark') { 
            // Switch to light
            croc.src = "images/artist.svg"; 
            croc.className = 'switch'
            body.className = 'switch';
            button.className = 'switch';
            course.className = 'switch';
            mona.className = 'switch';
            grad.className = 'switch'; 
           
            for (const section of sections) {
                section.className = 'switch';
            }
            mode = 'light';
        } else {
            console.log(mode);
            croc.src = "images/croc.gif"; 
            body.removeAttribute('class');
            croc.removeAttribute('class'); 
            grad.removeAttribute('class');
         //   banner.removeAttribute('class');
            button.removeAttribute('class');
            course.removeAttribute('class');
            mona.removeAttribute('class');
            for (const section of sections) {
                section.removeAttribute('class');
            }
            mode = 'dark'
        }
    })
})()