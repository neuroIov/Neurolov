Music Gen Endpoint
Overview
The Music Generation API allows you to generate music based on textual prompts and optional conditioning melodies. This API is ideal for applications in music composition, sound design, and creative audio projects.

Open in Playground 🚀
Sample Generation
Example 1: Without Conditioning
Prompt:
sitar, tabla, flute, Indian classical, fusion, meditative, G# minor, 96 bpm

Generated Music:
Example 2: With Conditioning
Prompt:
marimba, percussion, bass, tropical house, melodic riff, G# minor, 96 bpm

Conditioning Melody:
Note: The conditioning melody link should be to a downloadable music file, not a YouTube Video/Music link.

Generated Music:
Request
--request POST 'https://modelslab.com/api/v6/voice/music_gen' 

Make a POST request to https://modelslab.com/api/v6/voice/music_gen endpoint and pass the required parameters as a request body.

Body Attributes
Parameter	Description	Values
key	Your API Key for request authorization.	string
prompt	The input text for music generation.	string
init_audio (optional)	Conditioning melody for music generation (upload URL, up to 30 seconds).	URL
sampling_rate (optional)	Sampling rate of the generated music. Default: 32000, Minimum: 10000.	integer
max_new_token (optional)	Maximum number of new tokens for music generation. Range: 256 to 1024.	integer
base64	Whether the input sound clip is in base64 format. Default: false.	TRUE or FALSE
temp	Temporary links for regions blocking storage site access.	TRUE or FALSE
webhook	URL to receive a POST callback upon completion.	URL
track_id	Unique ID for identifying webhook responses.	integer
Open in Playground 🚀
Example
Body
Body
{
    "key":"",
    "prompt":"marimba, percussion, bass, tropical house, melodic riff, G# minor, 96 bpm",
    "init_audio":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/IxizU51vL2IwiEjy6XtvbDECa9f16E-metaU2hhcGUgb2YgeW91IFJpbmd0b25lIO+9nO+9nCBJbnN0cnVtZW50YWwgQkdNIO+9nO+9nCBMSUdIVCBHT0pPLndhdg==-.wav",
    "sampling_rate":32000,
    "base64":false,
    "temp": false,
    "webhook": null,
    "track_id": null
}


Request
JS
PHP
NODE
PYTHON
JAVA
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "key":"",
    "prompt":"marimba, percussion, bass, tropical house, melodic riff, G# minor, 96 bpm",
    "init_audio":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/IxizU51vL2IwiEjy6XtvbDECa9f16E-metaU2hhcGUgb2YgeW91IFJpbmd0b25lIO+9nO+9nCBJbnN0cnVtZW50YWwgQkdNIO+9nO+9nCBMSUdIVCBHT0pPLndhdg==-.wav",
    "sampling_rate":32000,
    "base64":false,
    "temp": false,
    "webhook": null,
    "track_id": null
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://modelslab.com/api/v6/voice/music_gen", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


Response
{
   {
    "status": "success",
    "generationTime": 7.8882811069488525,
    "id": 310815,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/e143f35e-8d69-4530-80df-e0cad201b3f6.wav"
    ],
    "proxy_links": [
        "https://cdn2.stablediffusionapi.com/generations/30ea5aee-fba8-4b65-bf71-2fc2b6b197c0.wav"
    ],
    "meta": {
        "base64": "no",
        "conditioning_melody": "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/IxizU51vL2IwiEjy6XtvbDECa9f16E-metaU2hhcGUgb2YgeW91IFJpbmd0b25lIO+9nO+9nCBJbnN0cnVtZW50YWwgQkdNIO+9nO+9nCBMSUdIVCBHT0pPLndhdg==-.wav",
        "filename": "30ea5aee-fba8-4b65-bf71-2fc2b6b197c0.wav",
        "input_text": "marimba, percussion, bass, tropical house, melodic riff, G# minor, 96 bpm",
        "max_new_token": 256,
        "sampling_rate": 32000,
        "temp": "no"
    }
}
}