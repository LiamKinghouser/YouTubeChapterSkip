// Add chrome command listener to skip to next YouTube chapter
chrome.commands.onCommand.addListener((command) => {
    if (command.toString() === "next-youtube-chapter") triggered()
})

function skipToNextChapter() {
    let videoURL = document.URL
    let searchString = 'watch?v='
    let searchStringIndex = videoURL.indexOf(searchString)
    // Get the video id by slicing the video url
    let videoID = videoURL.slice(searchStringIndex + searchString.length, videoURL.indexOf('&t'))

    // Get elements that include chapter elements
    let elements = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-macro-markers-list-item-renderer")
    let chapters = []
    let hrefs = []
    // Find chapter elements
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        if (!element.hasAttribute('hidden href') && element.hasAttribute("href") && element.getAttribute("href").toString().includes(videoID) && element.getAttribute('href').toString().includes('&t=') && !hrefs.includes(element.getAttribute("href"))) {
            chapters.push(element)
            hrefs.push(element.getAttribute("href"))
        }
    }
    // If video has no chapters, stop executing
    if (chapters.length === 0) return
    // Get current time of video in seconds
    let currentTimeSeconds = parseInt(document.getElementById('movie_player').getCurrentTime().toString().split('.')[0].replaceAll('.', ''))

    let nextChapterSeconds

    /*
       Iterate through chapters, and if the chapters timestamp in seconds
       is greater than the current time in seconds, update next chapter
       timestamp and break loop
    */
    for (let i = 0; i < chapters.length; i++) {
        let split = chapters[i].getAttribute('href').split('&t=')
        let chapterSeconds =  parseInt(split[split.length - 1].replaceAll(/\D/g,''))

        if (chapterSeconds > currentTimeSeconds) {
            nextChapterSeconds = chapterSeconds
            break
        }
    }
    // If next chapter timestamp exists, seek to that timestamp
    if (!isNaN(nextChapterSeconds)) document.dispatchEvent(new CustomEvent(document.getElementById('movie_player').seekTo(parseInt(nextChapterSeconds), true)));
}

function triggered() {
    // Query tabs in current window
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        let youtubeTabs = []
        // Iterate through tabs
        console.log(tabs.length)
        for (let i = 0; i < tabs.length; i++) {
            // If tab url is in YouTube video format add to YouTube tabs array
            if (tabs[i].url.includes("www.youtube.com/watch")) youtubeTabs.push(tabs[i])
        }
        // If there is not exactly 1 YouTube tab, stop executing
        if (youtubeTabs.length !== 1) return

        // Execute function that skips to next chapter
        chrome.scripting.executeScript(
            {
                target: { tabId: youtubeTabs[0].id },
                func: skipToNextChapter,
                world: "MAIN"
            },() => {})
    })
}