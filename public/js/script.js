let left = document.querySelector(".left");
let right = document.querySelector(".right");
let l = ["../images/pic1.jpg", "../images/pic2.jpg", "../images/pic3.jpg", "../images/pic4.jpg"];
let img = document.querySelector(".home-img");
let i = 0;

// Function to update the image source
function updateImage(index) {
    if (img && l[index]) {
        img.setAttribute("src", l[index]);
    }
}

// Left button click event
left.addEventListener("click", () => {
    i = (i - 1 + l.length) % l.length; // Wrap around using modulo
    updateImage(i);
});

// Right button click event
right.addEventListener("click", () => {
    i = (i + 1) % l.length; // Wrap around using modulo
    updateImage(i);
});

// Initial load
updateImage(i);

// let id=setInterval(()=>{img.setAttribute('src',l[(++i)%l.length]);},4000);
