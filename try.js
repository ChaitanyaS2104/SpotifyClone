

// Main function
async function main() {


    //Creating an audio element
    const currentSong = new Audio();
    let pause;
    let nextSong;
    let prevSong;
    let songUL;
    let currentFolder;
    let cardContainer= document.querySelector(".cardContainer");

    //Display albums on the page
    async function displayAlbums() {
        let songsFolder = await fetch("songs/");
        let FolderData = await songsFolder.text();
        let div = document.createElement("div");
        div.innerHTML = FolderData;
        let folderNames = div.getElementsByTagName('a');
        console.log(folderNames);
        for (let i = 0; i < folderNames.length; i++) {
            if (folderNames[i].getAttribute("href").includes("/songs/")) {
                let folder = (folderNames[i].getAttribute("href"));
                //Get metadata of folder
                let songsFolder = await fetch(`${folder}/file.json`);
                let FolderData = await songsFolder.json();
                console.log(FolderData);
                
                cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${FolderData.title}">
                                <img alt="${FolderData.title}" src="${FolderData.cover}">
                                 <h4>${FolderData.title}</h4>
                                <div class="description">${FolderData.description}</div>
                            </div>`
            }
        }
    }

    await displayAlbums();

    async function loadFirstFolder() {
        //Load the first Folder
        await getSongNames("songs/" + Array.from(document.querySelectorAll(".card"))[0].dataset.folder.replaceAll(" ", "%20"));

        currentFolder = Array.from(document.querySelectorAll(".card"))[0].dataset.folder.replaceAll(" ", "%20")

        //Attach event listener to songs
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                console.log(e);
                console.log("i have been attached")
                playSong(e);
            })
        })

        //load the first song
        playSong(document.querySelector(".songList").getElementsByTagName("li")[0], pause = true);
        document.querySelector(".songTime").innerHTML = '0:00 / 0:00';

    }
    await loadFirstFolder();


    //Get the name of folder user clicked
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            currentFolder = item.currentTarget.dataset.folder.replaceAll(" ", "%20");
            document.querySelector('.songList').getElementsByTagName('ul')[0].innerHTML = "";
            songs = await getSongNames("songs/" + currentFolder);

            //load the first song
            playSong(document.querySelector(".songList").getElementsByTagName("li")[0], pause = true);
            document.querySelector(".songTime").innerHTML = '0:00 / 0:00';

            //Attach event listener to songs
            Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", () => {
                    playSong(e);
                });
            });

            document.querySelector(".left").style.left = 0 + "%";

        });
    });



    //Function to get the list of songs in the library section 
    async function getSongNames(folderName) {
        let link = await fetch(folderName);
        let linkData = await link.text();
        let div = document.createElement("div");
        div.innerHTML = linkData;
        let as = div.getElementsByTagName('a');
        var titleValues = [];
        for (let i = 0; i < as.length; i++) {
            if (as[i].getAttribute("href").endsWith(".mp3")) {
                titleValues.push(as[i].getAttribute("href"));
            }
        }
        songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
        titleValues.forEach(elements => {
            elements = elements.split('/')[3];
            elements = elements.replace(".mp3", "")
            songUL.innerHTML = songUL.innerHTML + `<li> 
       <img class="musicIcon cover"src="icons/musicIcon.svg" >
       <div class="songInfo"> 
       ${elements.replaceAll("%20", ' ')} 
       </div>
       <img class="songCardPlay"src="icons/play.svg">
       </li>`;

        });
    }


    // PLaying the clicked song
    async function playSong(e, pause = false) {
        let songSrc = e.querySelector(".songInfo").innerHTML.trim() + '.mp3'
        currentSong.src = "/songs/" + currentFolder + '/' + songSrc;
        if (!pause) {
            currentSong.play();
            document.getElementById("play").setAttribute("src", "icons/pause.svg");
        }
        document.querySelector(".playbarSongInfo").innerHTML = songSrc.replace(".mp3", "");

        prevSong = e.previousElementSibling;
        if (prevSong == null) {
            let index = document.querySelector(".songList").getElementsByTagName("li").length;
            prevSong = document.querySelector(".songList").getElementsByTagName("li")[index - 1];
        }
        nextSong = e.nextElementSibling;
        if (nextSong == null) {
            nextSong = (document.querySelector(".songList").getElementsByTagName("li")[0]);
        }
        document.querySelector(".left").style.left = -100 + "%";

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

    //Next Song
    let next = document.getElementById("next");
    next.addEventListener("click", () => {
        playSong(nextSong);
    })

    //Previous Song
    let previous = document.getElementById("previous");
    previous.addEventListener("click", () => {
        playSong(prevSong);
    })

    //Playbar time update
    currentSong.addEventListener("timeupdate", () => {
        if (formatTime(currentSong.duration) == 'NaN:NaN') {
            document.querySelector(".songTime").innerHTML = '0:00 / 0:00';
        }
        else {
            document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime.toFixed(2))} / ${formatTime(currentSong.duration)}`;
        }
        document.querySelector(".circle").style.left = (currentSong.currentTime.toFixed(2) / currentSong.duration) * 100 + '%';
        document.querySelector(".seekBarProgress").style.width = (currentSong.currentTime.toFixed(2) / currentSong.duration) * 100 + '%';
        if (currentSong.ended) {
            document.getElementById("play").setAttribute("src", "icons/play.svg");
        }
    })

    //Adding event listener to Seekbar
    let seekBar = document.querySelector(".seekBar");
    seekBar.addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width).toFixed(2) * 100 + "%";
        document.querySelector(".seekBarProgress").style.width = (e.offsetX / e.target.getBoundingClientRect().width).toFixed(2) * 100 + "%";
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })

    //Adding event listener to hamburger menu
    let menu = document.querySelector(".menu");
    menu.addEventListener("click", () => {
        document.querySelector(".left").style.left = 0 + "%";
    })

    //Adding event listener to cross to close menu
    let cross = document.querySelector(".cross");
    cross.addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%";
    })



}
main();
