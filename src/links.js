export function createLinks() {
    const youtube = document.getElementById("youtube");
    const twitter = document.getElementById("twitter");
    const mega = document.getElementById("mega");

    youtube.addEventListener("click", () => {
        window.open("https://www.youtube.com/@opiategalore?sub_confirmation=1", "_blank");
    });

    twitter.addEventListener("click", () => {
        window.open("https://twitter.com/ctgadse", "_blank");
    });

    mega.addEventListener("click", () => {
        window.open("https://mega.nz/folder/XCx22aYZ#IZykt57yG1StXceL8XqlUQ", "_blank");
    });
}