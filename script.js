console.log("Let's write JavaScript");

let currentSong = new Audio()
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]))
        }
    }

    // Show all the songs
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML +
            `<li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                            <div>
                            ${song.replace(/%20/g, " ").replace(".mp3", "").replace(/128Kbps/g, "").replace(/128-/g, "")}
                            </div>
                            </div>
                            <div class="playnow">
                                <span><img class="invert" src="play.svg" alt=""></span>
                            </div>
                        </li>`
    }

    // // Play the first song 
    // var audio = new Audio(songs[0])
    // // audio.play()

    // audio.addEventListener("loadeddata", () => {
    //     // let duration = audio.duration
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    // })

    // Attach an EventListener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim()
            let fullSong = songs.find(song => song.includes(songName))
            playMusic(fullSong)
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + encodeURIComponent(track))
    // audio.play()
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track)
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = track
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

// const albums = [
//     {
//         title: "Aashiqui 2",
//         artists: "Mithoon, Ankit Tiwari, Jeet Gannguli",
//         imgSrc: "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg",
//         folder: "Aashiqui2"
//     },
//     {
//         title: "Rockstar",
//         artists: "A.R.Rahman, Irshad Kamil",
//         imgSrc: "https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b",
//         folder: "Rockstar"
//     },
//     {
//         title: "Sanju",
//         artists: "2018 . Rohan Rohan, Vikram Mantrose, A.R.Rahman",
//         imgSrc: "https://i.scdn.co/image/ab67616d0000b2734a21d8868fd66679fba8cc72",
//         folder: "Sanju"
//     },
//     {
//         title: "Aam Jahe Munde",
//         artists: "http://127.0.0.1:5500/songs/AamJaheMunde",
//         imgSrc: "https://i.scdn.co/image/ab67616d0000b2734a21d8868fd66679fba8cc72",
//         folder: "Sanju"
//     }
// ]


// async function displayAlbums() {
//     const cardContainer = document.querySelector(".cardContainer");

//     albums.forEach(album => {
//         const card = document.createElement("div");
//         card.classList.add("card");
//         card.setAttribute("data-folder", album.folder);

//         card.innerHTML = `
//             <div class="play">
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
//                 </svg>
//             </div>
//             <img src="${album.imgSrc}" alt="card">
//             <h2>${album.title}</h2>
//             <p>${album.artists}</p>
//         `;

//         cardContainer.appendChild(card);

//         // Add event listener to load songs of the clicked album
//         Array.from(document.getElementsByClassName("card")).forEach(e => { 
//             e.addEventListener("click", async item => {
//                 console.log("Fetching Songs")
//                 songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
//                 playMusic(songs[0])
    
//             })
//         })
//     });
// }

async function main() {
    // Get the list of all songs
    await getSongs("songs/Sanju")
    // console.log(songs);
    playMusic(songs[0], true)

    // Display all the albums on the page
    // await displayAlbums()

    // Attach event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // Listen for Time Update Event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        const currentTime = currentSong.currentTime
        const duration = currentSong.duration
        const percentage = (currentTime / duration) * 100

        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`
        document.querySelector(".circle").style.left = percentage + "%"

        // Update the background of the seekbar
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, red ${percentage}%, white ${percentage}%)`
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100

        // Update the background of the seekbar
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, red ${percent}%, white ${percent}%)`
    })

    // Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".spotifyPlaylists h1").style.opacity = "0";
    })

    // Add event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
        document.querySelector(".spotifyPlaylists h1").style.opacity = "10";
    })

    // Add Event Listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        // console.log('Previous Clicked')
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0].replace(/%20/g, " ");
        let index = songs.indexOf(currentSongSrc);
        // console.log(songs, index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    // Add Event Listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log('Next Clicked')
        let currentSongSrc = currentSong.src.split("/").slice(-1)[0].replace(/%20/g, " ");
        let index = songs.indexOf(currentSongSrc);
        // console.log(songs, index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add event listener to load songs of the clicked album
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })

    
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()
