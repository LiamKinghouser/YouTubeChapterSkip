chrome.commands.onCommand.addListener((command) => {
    if (command.toString() === "next-youtube-chapter") triggered()
})

function skipToNextChapter() {
    let videoURL = document.URL
    let searchString = 'watch?v='
    let searchStringIndex = videoURL.indexOf(searchString)
    let videoID = videoURL.slice(searchStringIndex + searchString.length, videoURL.indexOf('&t'))

    let elements = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer")
    let chapters = []
    let hrefs = []
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        if (!element.hasAttribute('hidden href') && element.hasAttribute("href") && element.getAttribute("href").toString().includes(videoID) && element.getAttribute('href').toString().includes('&t=') && !hrefs.includes(element.getAttribute("href"))) {
            chapters.push(element)
            hrefs.push(element.getAttribute("href"))
        }
    }
    if (chapters.length === 0) return
    let currentTimeSeconds = parseInt(document.getElementById('movie_player').getCurrentTime().toString().split('.')[0].replaceAll('.', ''))

    let nextChapterSeconds

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
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].url.includes("www.youtube.com/watch")) {
                chrome.scripting.executeScript(
                    {
                        target: {tabId: tabs[i].id},
                        func: skipToNextChapter,
                        world: "MAIN"
                    },() => {})
            }
        }
    })
}