chrome.commands.onCommand.addListener((command) => {
    if (command.toString() === "next-youtube-chapter") triggered()
})

function skipToNextChapter() {
    let videoURL = document.URL // get video id from doc url
    console.log(videoURL)
    let searchString = 'watch?v='
    let searchStringIndex = videoURL.indexOf(searchString)
    let videoID = ''
    for (let i = searchStringIndex; i < searchStringIndex + 50; i++) {
        let char = videoURL.charAt(i)
        if (char !== '&') videoID.concat(char)
        else break
    }
    console.log(videoID)

    let elements = document.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string")
    console.log("Elements size: " + elements.length)
    let chapters = []
    let hrefs = []
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        if (element.getAttribute("href") != null && element.getAttribute("href").toString().includes(videoID) && (element.innerText.includes(':') && /^[0-9]*$/.test(element.innerText.replaceAll(':', ''))) && !hrefs.includes(element.getAttribute("href"))) {
            chapters.push(element)
            hrefs.push(element.getAttribute("href"))
        }
    }
    console.log("Chapters size: " + chapters.length)

    let currentTime = document.getElementsByClassName("ytp-time-current")[0].innerText
    console.log(currentTime)

    let parts = currentTime.split(':')
    let colons = parts.length - 1
    if (colons === 1) currentTime = '00:' + currentTime

    let currentTimeSeconds = new Date('January 1, 1970 ' + currentTime).getSeconds()

    // if (colons === 2) currentTimeSeconds = ((parts[0] * 60) * 60) + (parts[1] * 60) + parts[2]
    // else currentTimeSeconds = (parts[0] * 60) + parts[1]

    let nextChapterSeconds

    for (let i = 0; i < chapters.length; i++) {
        let split = chapters[i].getAttribute('href').split('&t=')
        let chapterSeconds =  parseInt(split[split.length - 1].replaceAll(/\D/g,''))

        console.log(chapterSeconds + " " + currentTimeSeconds)

        if (chapterSeconds > currentTimeSeconds) {
            nextChapterSeconds = chapterSeconds
            break
        }
    }
    console.log('Next chapter index: ' + nextChapterSeconds)
    document.dispatchEvent(new CustomEvent(document.getElementById('movie_player').seekTo(parseInt(nextChapterSeconds), true)));
}

function triggered() {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        const youtubeTabs = []

        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].audible && tabs[i].url.includes("youtube.com/watch")) {
                youtubeTabs.push(tabs[i])
            }
        }

        youtubeTabs.forEach((tab) =>  {
            chrome.scripting.executeScript(
                {
                    target: {tabId: tab.id},
                    func: skipToNextChapter,
                    world: "MAIN"
                },() => {})
        })
    })
}