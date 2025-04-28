const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing message' });
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant specialized in Arduino programming but can answer general questions too.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 200,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }

        const data = await response.json();
        let botResponse = data.choices[0]?.message.content || 'Sorry, I didn’t understand. Can you clarify?';

        botResponse = customizeArduinoResponse(message, botResponse);

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

function customizeArduinoResponse(message, response) {
    message = message.toLowerCase().trim();
    if (message.includes('led') || message.includes('light')) {
        return `Here’s a simple Arduino code to blink an LED:
\`\`\`c
#define LED_PIN 13
void setup() {
  pinMode(LED_PIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}
\`\`\``;
    } else if (message.includes('sensor') && message.includes('light')) {
        return `To read a light sensor (LDR):
\`\`\`c
void setup() {
  Serial.begin(9600);
}
void loop() {
  int lightValue = analogRead(A0);
  Serial.print("Light Value: ");
  Serial.println(lightValue);
  delay(500);
}
\`\`\``;
    } else if (message.includes('servo')) {
        return `To control a servo motor:
\`\`\`c
#include <Servo.h>
Servo myServo;
void setup() {
  myServo.attach(9);
}
void loop() {
  for (int angle = 0; angle <= 180; angle += 1) {
    myServo.write(angle);
    delay(15);
  }
  for (int angle = 180; angle >= 0; angle -= 1) {
    myServo.write(angle);
    delay(15);
  }
}
\`\`\``;
    } else if (message.includes('button')) {
        return `To read a button and control an LED:
\`\`\`c
#define BUTTON_PIN 2
#define LED_PIN 13
void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}
void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}
\`\`\``;
    } else if (message.includes('lcd') && message.includes('screen')) {
        return `To display text on a 16x2 LCD:
\`\`\`c
#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
void setup() {
  lcd.begin(16, 2);
  lcd.print("Hello, World!");
}
void loop() {
  lcd.setCursor(0, 1);
  lcd.print(millis() / 1000);
  delay(1000);
}
\`\`\``;
    } else if (message.includes('temperature')) {
        return `To read temperature using an LM35 sensor:
\`\`\`c
void setup() {
  Serial.begin(9600);
}
void loop() {
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1023.0);
  float temperature = voltage * 100;
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" C");
  delay(1000);
}
\`\`\``;
    } else if (message.includes('project') || message.includes('idea')) {
        return `Project idea: Motion detector alarm using a PIR sensor:
\`\`\`c
#define PIR_PIN 2
#define BUZZER_PIN 8
void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}
void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
}
\`\`\``;
    } else if (message.includes('hello') || message.includes('hi')) {
        return 'Hi! How can I assist you with Arduino programming or other questions?';
    } else if (message.includes('how are you')) {
        return 'I’m just a bunch of code, but I’m ready to help! 😄 Ask me about Arduino or anything else!';
    } else if (message.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString('en-US')}. For an Arduino clock, try the RTClib library!`;
    } else {
        return response || 'I didn’t quite get that. Could you clarify or ask about Arduino programming?';
    }
}

module.exports = app;