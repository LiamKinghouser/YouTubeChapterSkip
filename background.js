chrome.commands.onCommand.addListener((command) => {
    if (command.toString() === "next-youtube-chapter") triggered()
})

function skipToNextChapter() {
    let videoURL = document.URL
    let searchString = 'watch?v='
    let searchStringIndex = videoURL.indexOf(searchString)
    let videoID = videoURL.slice(searchStringIndex + searchString.length, videoURL.indexOf('&t'))

    let elements = document.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string")
    let chapters = []
    let hrefs = []
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        if (element.getAttribute("href") != null && element.getAttribute("href").toString().includes(videoID) && (element.innerText.includes(':') && /^[0-9]*$/.test(element.innerText.replaceAll(':', ''))) && !hrefs.includes(element.getAttribute("href"))) {
            chapters.push(element)
            hrefs.push(element.getAttribute("href"))
        }
    }
    let currentTimeSeconds = parseInt(document.getElementById('movie_player').getCurrentTime().toString().split('.')[0].replaceAll('.', ''))

    let nextChapterSeconds

    console.log(currentTimeSeconds)

    for (let i = 0; i < chapters.length; i++) {
        let split = chapters[i].getAttribute('href').split('&t=')
        let chapterSeconds =  parseInt(split[split.length - 1].replaceAll(/\D/g,''))

        if (chapterSeconds > currentTimeSeconds) {
            nextChapterSeconds = chapterSeconds
            break
        }
    }
    if (!isNaN(nextChapterSeconds)) document.dispatchEvent(new CustomEvent(document.getElementById('movie_player').seekTo(parseInt(nextChapterSeconds), true)));
}

function triggered() {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        let youtubeTabs = []
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].audible && tabs[i].url.includes("youtube.com/watch")) youtubeTabs.push(tabs[i])
        }
        if (youtubeTabs.length === 1) {
            chrome.scripting.executeScript(
                {
                    target: {tabId: youtubeTabs[0].id},
                    func: skipToNextChapter,
                    world: "MAIN"
                },() => {})
        }
    })
}