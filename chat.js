const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

const DEEPSEEK_API_KEY = 'sk-5eaad634d9694a6d9569d0d45e440fad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'الرسالة غير صالحة أو مفقودة' });
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
                    { role: 'system', content: 'أنت مساعد مفيد متخصص في برمجة Arduino، لكن يمكنك الإجابة على أسئلة عامة أيضًا.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 200,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`خطأ DeepSeek API: ${response.status} - ${errorText}`);
            throw new Error(`خطأ DeepSeek API: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error('استجابة API غير متوقعة:', JSON.stringify(data, null, 2));
            throw new Error('استجابة غير صالحة من DeepSeek API');
        }

        let botResponse = data.choices[0].message.content;
        botResponse = customizeArduinoResponse(message, botResponse);

        res.json({ response: botResponse });
    } catch (error) {
        console.error('الخطأ:', error.message, error.stack);
        res.status(500).json({ error: 'فشل في معالجة الطلب: ' + error.message });
    }
});

function customizeArduinoResponse(message, response) {
    message = message.toLowerCase().trim();
    if (message.includes('led') || message.includes('ضوء')) {
        return `إليك كود Arduino بسيط لتشغيل LED:
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
    } else if (message.includes('مستشعر') && message.includes('ضوء')) {
        return `لقراءة مستشعر ضوء (LDR):
\`\`\`c
void setup() {
  Serial.begin(9600);
}
void loop() {
  int lightValue = analogRead(A0);
  Serial.print("قيمة الضوء: ");
  Serial.println(lightValue);
  delay(500);
}
\`\`\``;
    } else if (message.includes('سيرفو')) {
        return `للتحكم بمحرك سيرفو:
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
    } else if (message.includes('زر')) {
        return `لقراءة زر والتحكم بـ LED:
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
    } else if (message.includes('شاشة') && message.includes('lcd')) {
        return `لعرض نص على شاشة LCD 16x2:
\`\`\`c
#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
void setup() {
  lcd.begin(16, 2);
  lcd.print("مرحباً بالعالم!");
}
void loop() {
  lcd.setCursor(0, 1);
  lcd.print(millis() / 1000);
  delay(1000);
}
\`\`\``;
    } else if (message.includes('درجة الحرارة')) {
        return `لقراءة درجة الحرارة باستخدام مستشعر LM35:
\`\`\`c
void setup() {
  Serial.begin(9600);
}
void loop() {
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1023.0);
  float temperature = voltage * 100;
  Serial.print("درجة الحرارة: ");
  Serial.print(temperature);
  Serial.println(" مئوية");
  delay(1000);
}
\`\`\``;
    } else if (message.includes('مشروع') || message.includes('فكرة')) {
        return `فكرة مشروع: إنذار كشف الحركة باستخدام مستشعر PIR:
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
    } else if (message.includes('مرحبا') || message.includes('اهلا')) {
        return 'مرحبا! كيف يمكنني مساعدتك في برمجة Arduino أو أي أسئلة أخرى؟';
    } else if (message.includes('كيف حالك')) {
        return 'أنا مجرد كود، لكنني جاهز للمساعدة! 😄 اسألني عن Arduino أو أي شيء آخر!';
    } else if (message.includes('الوقت')) {
        return `الوقت الحالي هو ${new Date().toLocaleTimeString('ar-EG')}. لساعة Arduino، جرب مكتبة RTClib!`;
    } else {
        return response || 'لم أفهم ذلك تمامًا. هل يمكنك التوضيح أو السؤال عن برمجة Arduino؟';
    }
}

module.exports = app;
