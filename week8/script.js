//using the activate button to change the bckgrnd to blue
document.getElementById("onBtn").addEventListener("click", function() {
  document.body.style.backgroundColor = "lightblue";
});

//using the deactivate to change the bckgrnd back to pink
document.getElementById("offBtn").addEventListener("click", function() {
  document.body.style.backgroundColor = "lightpink";
});

document.getElementById("myTxt").addEventListener("input", function() {
  document.getElementById("emptyP").textContent = this.value;
});

document.addEventListener("keydown", function() {
    console.log("down")
    // document.getElementById("cat").style.margin-left = 60px;
});