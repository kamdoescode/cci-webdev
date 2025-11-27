// create a variable for the div
const box = document.querySelector(".myDiv")
// create variable for the button
const btn = document.querySelector("#btn");

//using the activate button to move the box 50px to the right
btn.addEventListener("click", function() {
  const currentLeft = parseInt (getComputedStyle(box).left);
  box.style.left = currentLeft + 50 + "px";
});

