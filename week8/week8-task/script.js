    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");


    let yesScale = 1;

    noBtn.addEventListener("click", () => {
      noBtn.textContent = "Are you sure about that?";
      yesScale += 0.2;
      yesBtn.style.transform = `scale(${yesScale})`;
    });

    yesBtn.addEventListener("click", () => {
      alert("✨ Thanks for boosting my ego! ✨");
    });