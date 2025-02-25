

function startProgress() {

  const progress = document.getElementById('progress');
  const data = document.getElementById('data');

  let interval = null;
  let index = 0;

  interval = setInterval(() => {
    if(index >= 83) {
      clearInterval(interval);
    } else {
      index++;
      data.innerText = `${index}%`;
      progress.style.background = `conic-gradient(
          #a411ff ${index * 3.6}deg,
           #ccc ${index * 3.6}deg
      )`
    }
  }, 40);
}

startProgress();