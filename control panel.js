var power = true;
var ball = document.getElementById('ball');
var ws = new WebSocket('wss://realtime.ably.io/?key=YOUR_ABLY_API_KEY&clientId=web-client'); // Replace with valid key

ws.onopen = function() {
    console.log('WebSocket connected');
    ws.send(JSON.stringify({ channel: 'control', action: 'subscribe' }));
};

ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.channel === 'mq135') {
        var percentage = mapMQ135ToPercentage(data.value);
        document.getElementById('pollutionDisplay').value = percentage.toFixed(1) + '%';
    }
};

ws.onclose = function() {
    console.log('WebSocket closed');
};

function control() {
    console.log('Control function called');
    if (power) {
        power = false;
        ball.style.right = '65px';
        ball.style.backgroundColor = 'white';
        ball.style.boxShadow = '0 0 0';
        ws.send(JSON.stringify({ channel: 'led', value: 'off' }));
    } else {
        power = true;
        ball.style.right = '3px';
        ball.style.backgroundColor = 'greenyellow';
        ball.style.boxShadow = '0 0 25px greenyellow, 0 0 50px greenyellow, 0 0 75px greenyellow';
        ws.send(JSON.stringify({ channel: 'led', value: 'on' }));
    }
}

function setServoAngle() {
    const degreeInput = document.getElementById('degreeInput');
    let degree = parseInt(degreeInput.value);
    if (isNaN(degree) || degree < 0) degree = 0;
    if (degree > 180) degree = 180;
    degreeInput.value = degree;
    ws.send(JSON.stringify({ channel: 'servo', value: degree }));
}

function mapMQ135ToPercentage(value) {
    return (value / 1023) * 100;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('open').addEventListener('click', control);
    document.getElementById('setAngle').addEventListener('click', setServoAngle);
});
