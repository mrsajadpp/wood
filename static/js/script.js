let mainBody = document.getElementById('main');
function hideLoader() {
    setTimeout(() => {
        let loader = document.getElementById('loader');
        loader.style.display = 'none';
        mainBody.classList.remove('hide');
    }, 1000);
}

//window.onload = hideLoader
setTimeout(() => {
    hideLoader();
}, 1000);

let aiButton = document.getElementById('aibutton');
let aiChat = document.getElementById('aichat');
let resultBody = document.getElementById('searchresultsarea');

let chat = () => {
    aiButton.classList.toggle('hide');
    aiChat.classList.toggle('hide');
    resultBody.classList.toggle('hide');
};