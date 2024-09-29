//Creating an audio element
const currentSong = new Audio();
let nextSong='';


//Get the list of songs in array titles
async function getSongNames() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    var titleValues = [];
    for (let i = 0; i < as.length; i++) {
        if (as[i].getAttribute("href").endsWith(".mp3")) {
            let titleValue = as[i].getAttribute("href");
            titleValues.push(titleValue);
        }
    }
    return titleValues
}


//PLaying the clicked song
async function playSong(songSrc) {
    document.getElementById("play").setAttribute("src", "icons/pause.svg");
    currentSong.src = "/songs/" + songSrc;
    currentSong.play();
    document.querySelector(".playbarSongInfo").innerHTML= songSrc.replace(".mp3", "");
    
}

//Format time 
function formatTime(seconds) {
    // Calculate the number of minutes
    var minutes = Math.floor(seconds / 60);
    
    // Calculate the remaining seconds
    var remainingSeconds = Math.floor(seconds % 60);

    // Pad the seconds with a leading zero if necessary
    var paddedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted time string
    return `${minutes}:${paddedSeconds}`;
}


//Main function
async function main() {

    let titles = await getSongNames();
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    titles.forEach(elements => {
        elements = elements.split('songs/')[1];
        elements = elements.replace(".mp3", "")
        songUL.innerHTML = songUL.innerHTML + `<li> 
        <img class="musicIcon cover"src="icons/musicIcon.svg" >
        <div class="songInfo"> 
        ${elements.replaceAll("%20", ' ')} 
        </div>
        <img class="songCardPlay"src="icons/play.svg">
        </li>`;

    });

    //Attach event listener to songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e)
            console.log(e.querySelector(".songInfo").innerHTML.trim() + '.mp3');
            console.log(e.nextElementSibling);
            nextSong = e.nextElementSibling.querySelector(".songInfo").innerHTML.trim() + '.mp3';
            playSong(e.querySelector(".songInfo").innerHTML.trim() + '.mp3');
        })
    })

    //Attach event listener to buttons
    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").setAttribute("src", "icons/pause.svg");
        }
        else {
            currentSong.pause();
            document.getElementById("play").setAttribute("src", "icons/play.svg");
        }
    })

    let next = document.getElementById("next");
    next.addEventListener("click", () => {
        console.log(nextSong);
        playSong(nextSong);
        currentSong
    })

    //Playbar time update
    currentSong.addEventListener("timeupdate", () =>{
        document.querySelector(".songTime").innerHTML= `${formatTime(currentSong.currentTime.toFixed(2))} / ${formatTime(currentSong.duration)}` ;
    })


    
}
main();
