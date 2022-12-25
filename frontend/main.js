import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
});

// Speech Recognition

var SpeechRecognition = window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();

var textbox = $('#textbox');
var instructions = $('#instructions');

var content = '';

recognition.continuous = true;

recognition.onstart = function () {
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function () {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function () {
    instructions.text('There was a problem with voice recognition.');
}

recognition.onresult = function (event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;

    content += transcript;

    textbox.val(content);
}

$('#start-btn').on('click', function (e) {
    if (content.length) {
        content += ' ';
    }
    recognition.start();
})

document.querySelector("#stop").onclick = () => {
          speechRecognition.stop();
        };

// if ("webkitSpeechRecognition" in window) {
//     let speechRecognition = new webkitSpeechRecognition();
//     let final_transcript = "";
  
//     speechRecognition.continuous = true;
//     speechRecognition.interimResults = true;
  
//     speechRecognition.onstart = () => {
//       document.querySelector("#status").style.display = "block";
//     };
//     speechRecognition.onerror = () => {
//       document.querySelector("#status").style.display = "none";
//       console.log("Speech Recognition Error");
//     };
//     speechRecognition.onend = () => {
//       document.querySelector("#status").style.display = "none";
//       console.log("Speech Recognition Ended");
//     };
  
//     speechRecognition.onresult = (event) => {
//       let interim_transcript = "";
  
//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           final_transcript += event.results[i][0].transcript;
//         } else {
//           interim_transcript += event.results[i][0].transcript;
//         }
//       }
//       document.querySelector("#final").innerHTML = final_transcript;
//       document.querySelector("#interim").innerHTML = interim_transcript;
//     };
  
//     document.querySelector("#start").onclick = () => {
//       speechRecognition.start();
//     };
//     document.querySelector("#stop").onclick = () => {
//       speechRecognition.stop();
//     };
//   } else {
//     console.log("Speech Recognition Not Available");
//   }