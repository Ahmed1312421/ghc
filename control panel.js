var power = true;
var ball = document.getElementById('ball');

function control() {
    console.log('Control function called');
    const esp8266IP = 'http://YOUR_ESP8266_IP'; // استبدل بـ IP بتاع الESP8266 أو Ngrok URL
    if (power) {
        power = false;
        ball.style.right = '65px';
        ball.style.backgroundColor = 'white';
        ball.style.boxShadow = '0 0 0';
        fetch(`${esp8266IP}/led/off`, { method: 'GET' })
            .then(response => console.log('LED turned off'))
            .catch(error => console.error('Error:', error));
    } else {
        power = true;
        ball.style.right = '3px';
        ball.style.backgroundColor = 'greenyellow';
        ball.style.boxShadow = '0 0 25px greenyellow, 0 0 50px greenyellow, 0 0 75px greenyellow';
        fetch(`${esp8266IP}/led/on`, { method: 'GET' })
            .then(response => console.log('LED turned on'))
            .catch(error => console.error('Error:', error));
    }
}

// إضافة Event Listener للزرار
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('open').addEventListener('click', control);
});
