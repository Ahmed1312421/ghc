var power = true;
var switche = document.getElementById('open');
var ball = document.getElementById('ball');
var ws = new WebSocket('wss://realtime.ably.io/?key=<NIbXFg.xtupNA:J4pZ-oZHiZZri6N2kJkCTHYvj6mozR6lOqFkYig6NMI>&clientId=web-client');

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
    // Convert MQ135 reading (0-1023) to percentage (0-100%)
    // This is an approximate example; calibrate based on your sensor
    return (value / 1023) * 100;
}