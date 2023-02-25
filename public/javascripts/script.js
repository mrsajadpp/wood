let mainBody = document.getElementById('main');
function hideLoader() {
    setTimeout(() => {
        let loader = document.getElementById('loader');
        loader.style.display = 'none';
        mainBody.classList.remove('hide');
    }, 1000);
}

window.onload = hideLoader