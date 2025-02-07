Deepfake API
Overview
The Deepfake API provides a suite of endpoints to generate interactive videos and images by swapping faces in various configurations.

caution
Only Standard and Premium accounts have access to this endpoint.

specific-face-swap
multiple-face-swap
single-video-swap
specific-video-swap
fetch
Available Endpoints
Specific Face Swap
Allows swapping faces in a single image.

Multiple Face Swap
Swaps faces for all detected faces within a single image.

Single Video Swap
Swaps faces for all detected faces within a single video.

Specific Video Swap
Swaps specific faces in a video based on a reference face.

Fetch Request
Retrieve progress for queued or processing requests.

Specific Face Swap Endpoint
Overview
The Specific Face Swap endpoint allows you to swap faces in a single image by providing the initial image and the target image.

Open in Playground 🚀
Request
--request POST 'https://modelslab.com/api/v6/deepfake/single_face_swap' \

Make a POST request to https://modelslab.com/api/v6/deepfake/single_face_swap endpoint and pass the required parameters in the request body.

Body Attributes
Parameter	Description	Values
key	Your API Key used for request authorization.	String
init_image	The initial image containing the face to replace.	URL
target_image	The target image containing the face to be swapped.	URL
reference_image	A reference image containing the specific face to swap from the initial image.	URL
watermark	Indicates if the generated result should include a watermark. Defaults to true.	TRUE or FALSE
webhook	A URL to receive a POST API call once the image generation is complete.	URL
track_id	An ID included in the webhook response to identify the request.	Integral value
Open in Playground 🚀
Example
Body
Body
{
    "key":"",
    "init_image":" https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/DTs2zg3HELltVoQElpO3ec0f9BsAtS-metaNzExMTY5My1zYWxtYW4ta2hhbi1zaGFocnVraC1raGFuLTJbMV0ucG5n-.png",
    "target_image":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/jznUIJy6FoM1nUkXZBCvhyrlbetau1-metabGljZW5zZWQtaW1hZ2UuanBn-.jpg",
    "reference_image":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/9Mhbi9i0r9ADMfTpwTOqmyEQQyb6AK-metaSEQtd2FsbHBhcGVyLXNoYWhydWtoLWtoYW4tc3JrLWFjdG9yLWhlcm9bMV0uanBn-.jpg",
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
    "init_image":" https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/DTs2zg3HELltVoQElpO3ec0f9BsAtS-metaNzExMTY5My1zYWxtYW4ta2hhbi1zaGFocnVraC1raGFuLTJbMV0ucG5n-.png",
    "target_image":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/jznUIJy6FoM1nUkXZBCvhyrlbetau1-metabGljZW5zZWQtaW1hZ2UuanBn-.jpg",
    "reference_image":"https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/9Mhbi9i0r9ADMfTpwTOqmyEQQyb6AK-metaSEQtd2FsbHBhcGVyLXNoYWhydWtoLWtoYW4tc3JrLWFjdG9yLWhlcm9bMV0uanBn-.jpg",
    "webhook": null,
    "track_id": null
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://modelslab.com/api/v6/deepfake/single_face_swap", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


Response
Example Response

{
    "status": "success",
    "generationTime": 2.71,
    "id": 118409305,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/964bd881-f141-4e8f-b240-b7f48132a998.jpg"
    ],
    "proxy_links": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/964bd881-f141-4e8f-b240-b7f48132a998.jpg"
    ],
    "meta": {
        "init_image": "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/DTs2zg3HELltVoQElpO3ec0f9BsAtS-metaNzExMTY5My1zYWxtYW4ta2hhbi1zaGFocnVraC1raGFuLTJbMV0ucG5n-.png",
        "target_image": "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/jznUIJy6FoM1nUkXZBCvhyrlbetau1-metabGljZW5zZWQtaW1hZ2UuanBn-.jpg",
        "reference_image": "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/livewire-tmp/9Mhbi9i0r9ADMfTpwTOqmyEQQyb6AK-metaSEQtd2FsbHBhcGVyLXNoYWhydWtoLWtoYW4tc3JrLWFjdG9yLWhlcm9bMV0uanBn-.jpg",
        "seed": 2154158797,
        "temp": "no",
        "file_prefix": "964bd881-f141-4e8f-b240-b7f48132a998",
        "model_save_format": "jpg",
        "watermark": "yes",
        "watermark_image": null
    }
}

Multiple Face Swap Endpoint
Overview
The Multiple Face Swap endpoint allows swapping all detected faces in a single image with faces from a target image.

Open in Playground 🚀
Request
--request POST 'https://modelslab.com/api/v6/deepfake/multiple_face_swap' \

Make a POST request to https://modelslab.com/api/v6/deepfake/multiple_face_swap endpoint and pass the required parameters in the request body.

Body Attributes
Parameter	Description	Values
key	Your API Key used for request authorization.	API key
init_image	The initial image that contains the faces to be swapped.	URL to image
target_image	The target image that contains the faces to replace those in the initial image.	URL to image
webhook	A URL to receive a POST API call once the image generation is complete.	URL
watermark	Indicates if the generated result should include a watermark. Defaults to true.	TRUE or FALSE
track_id	An ID included in the webhook response to identify the request.	Integral value
Open in Playground 🚀
Example
Body
Body
{
  "key": "",
  "init_image":"https://i.pinimg.com/564x/4c/6a/d0/4c6ad0f74a3a251344cb115699a9a7c9.jpg",
  "target_image":"https://i.pinimg.com/564x/11/ac/0d/11ac0ddaf6962e395f30abc61043393e.jpg",
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
  "key": "",
  "init_image":"https://i.pinimg.com/564x/4c/6a/d0/4c6ad0f74a3a251344cb115699a9a7c9.jpg",
  "target_image":"https://i.pinimg.com/564x/11/ac/0d/11ac0ddaf6962e395f30abc61043393e.jpg",
  "webhook": null,
  "track_id": null
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://modelslab.com/api/v6/deepfake/multiple_face_swap", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

Response
Example Response
{
    "status": "success",
    "generationTime": 1.05,
    "id": 117356534,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/3c17fd3b-22e9-45f0-ab4b-7788c1af89a2.jpg"
    ],
    "proxy_links": [
        "https://cdn2.stablediffusionapi.com/generations/3c17fd3b-22e9-45f0-ab4b-7788c1af89a2.jpg"
    ],
    "meta": {
        "file_prefix": "3c17fd3b-22e9-45f0-ab4b-7788c1af89a2",
        "init_image": "https://i.pinimg.com/564x/4c/6a/d0/4c6ad0f74a3a251344cb115699a9a7c9.jpg",
        "model_save_format": "jpg",
        "seed": 909604405,
        "target_image": "https://i.pinimg.com/564x/11/ac/0d/11ac0ddaf6962e395f30abc61043393e.jpg",
        "temp": "no",
        "watermark": "yes",
        "watermark_image": null
    }
}


Single Video Swap Endpoint
Overview
The Single Video Swap endpoint allows swapping all detected faces in a single video with faces from an input image.

Open in Playground 🚀
Request
--request POST 'https://modelslab.com/api/v6/deepfake/single_video_swap' \

Make a POST request to https://modelslab.com/api/v6/deepfake/single_video_swap endpoint and pass the required parameters in the request body.

Body Attributes
Parameter	Description	Values
key	Your API Key used for request authorization.	ExampleKey123
init_image	The image containing multiple faces to be swapped.	[Image URL]
init_video	The video containing the face(s) to replace the faces in the image. Only videos less than 1 minute are accepted. If using YouTube, ensure the video is not made for kids or classified as adult content.	[Video URL]
output_format	The output format of the video (e.g., mp4).	String (e.g., mp4)
watermark	Indicates if the generated result should include a watermark. Defaults to true.	TRUE or FALSE
webhook	A URL to receive a POST API call once the image generation is complete.	[Webhook URL]
track_id	An ID included in the webhook response to identify the request.	Integer
Open in Playground 🚀
Example
Body
Body
{
     "key": "",
    "init_image":"https://plus.unsplash.com/premium_photo-1661508557554-e3d96f2fdde5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmVhdXRpZnVsJTIwZ2lybHxlbnwwfHwwfHx8MA%3D%3D",
    "init_video":"https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
    "output_format":"mp4",
    "webhook":null,
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
    "key": "",
    "init_image":"https://plus.unsplash.com/premium_photo-1661508557554-e3d96f2fdde5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmVhdXRpZnVsJTIwZ2lybHxlbnwwfHwwfHx8MA%3D%3D",
    "init_video":"https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
    "output_format":"mp4",
    "webhook":null,
    "track_id": null
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://modelslab.com/api/v6/deepfake/single_video_swap", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


Response
Example Response

{
    "status": "success",
    "generationTime": 10.1,
    "id": 278,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/e9b7ee18-2c7d-4268-ac40-fe1d1d4e503a.mp4"
    ],
    "proxy_links": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/e9b7ee18-2c7d-4268-ac40-fe1d1d4e503a.mp4"
    ],
    "meta": {
        "seed": 286642771,
        "source_image": "https://plus.unsplash.com/premium_photo-1661508557554-e3d96f2fdde5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmVhdXRpZnVsJTIwZ2lybHxlbnwwfHwwfHx8MA%3D%3D",
        "target_video_url": "https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
        "output_format": "mp4",
        "outdir": "out/",
        "file_prefix": "e9b7ee18-2c7d-4268-ac40-fe1d1d4e503a",
        "watermark": "yes",
        "watermark_image": null
    },
    "future_links": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/e9b7ee18-2c7d-4268-ac40-fe1d1d4e503a.mp4"
    ]
}

Specific Video Swap Endpoint
Overview
The Specific Video Swap endpoint allows swapping specific faces in a video based on a reference image.

Open in Playground 🚀
Request
--request POST 'https://modelslab.com/api/v6/deepfake/specific_video_swap' \

Make a POST request to https://modelslab.com/api/v6/deepfake/specific_video_swap endpoint and pass the required parameters in the request body.

Body Attributes
Parameter	Description	Values
key	Your unique API key used for authorization.	String
init_image	The image containing multiple faces to be swapped.	URL
init_video	The video containing the face(s) to replace the faces in the image.	URL
reference_image	A reference image containing the specific face to swap from the initial image.	URL
output_format	The desired output format of the video (e.g., mp4).	String (e.g., mp4)
watermark	Indicates if the generated result should include a watermark. Defaults to true.	TRUE or FALSE
webhook	A URL to receive a POST API call once the video generation is complete.	URL
track_id	An ID included in the webhook response to identify the request.	Integer
Open in Playground 🚀
Example
Body
Body
{
    "key": "",
    "init_video": "https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
    "init_image" :"https://images-ext-1.discordapp.net/external/rJOvGZHIWsIijkfvCn5dByZNh_RfZZxUIiyyo7yOFIY/https/images.hindustantimes.com/rf/image_size_630x354/HT/p2/2017/12/27/Pictures/_1e5bc084-ead1-11e7-ad70-11504944e689.jpg?format=webp&width=984&height=553",
    "reference_image": "https://images-ext-1.discordapp.net/external/Z8sBOyxEy9tsqkd9gsNK2dHZh-Em6LDqrmyjcDeMXII/https/i.ibb.co/2PGZ3p7/lmao.png?format=webp&quality=lossless&width=412&height=662",
    "output_format": "mp4",
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

var raw = JSON.stringify(
{
    "key": "",
    "init_video": "https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
    "init_image" :"https://images-ext-1.discordapp.net/external/rJOvGZHIWsIijkfvCn5dByZNh_RfZZxUIiyyo7yOFIY/https/images.hindustantimes.com/rf/image_size_630x354/HT/p2/2017/12/27/Pictures/_1e5bc084-ead1-11e7-ad70-11504944e689.jpg?format=webp&width=984&height=553",
    "reference_image": "https://images-ext-1.discordapp.net/external/Z8sBOyxEy9tsqkd9gsNK2dHZh-Em6LDqrmyjcDeMXII/https/i.ibb.co/2PGZ3p7/lmao.png?format=webp&quality=lossless&width=412&height=662",
    "output_format": "mp4",
    "webhook": null,
    "track_id": null
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://modelslab.com/api/v6/deepfake/specific_video_swap", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


Response
Example Response

{
    "status": "success",
    "generationTime": 10.1,
    "id": 298,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/ef3c52e9-fc99-473b-932d-d6ee3d064a88.mp4"
    ],
    "proxy_links": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/ef3c52e9-fc99-473b-932d-d6ee3d064a88.mp4"
    ],
     "meta": {
        "file_prefix": "ef3c52e9-fc99-473b-932d-d6ee3d064a88",
        "outdir": "out/",
        "output_format": "mp4",
        "reference_image": "https://images-ext-1.discordapp.net/external/Z8sBOyxEy9tsqkd9gsNK2dHZh-Em6LDqrmyjcDeMXII/https/i.ibb.co/2PGZ3p7/lmao.png?format=webp&quality=lossless&width=412&height=662",
        "seed": 3230606555,
        "source_image": "https://images-ext-1.discordapp.net/external/rJOvGZHIWsIijkfvCn5dByZNh_RfZZxUIiyyo7yOFIY/https/images.hindustantimes.com/rf/image_size_630x354/HT/p2/2017/12/27/Pictures/_1e5bc084-ead1-11e7-ad70-11504944e689.jpg?format=webp&width=984&height=553",
        "target_video_url": "https://tawk.link/6332cd5154f06e12d8971855/vc/66d997a6a2bc5fe2b627a250/v/4239c555189b772d5ca1bd5aa4bf872c4c12a07e/sdfsdfsdf.mp4",
        "watermark": "yes",
        "watermark_image": null
    },
    
}

Fetch Queued Request Endpoint
Overview
The Fetch Queued Request API retrieves videos that are queued or already generated.
Complex video generation requests often require additional processing time and are queued. These videos can be fetched using this endpoint.

Request
--request POST 'https://modelslab.com/api/v6/deepfake/fetch/{id}' \

Send a POST request to https://modelslab.com/api/v6/deepfake/fetch/{id} endpoint to return the corresponding queued videos. Where {id} is the ID returned together with the URL in the response upon its generation. This endpoint does not generate new video, it returns already generated/queued videos.

Body Attributes
Parameter	Description	Values
key	Your API Key used for request authorization.	String
Example
Body
Body Raw
{
 "key": ""
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
 "key": ""
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch(https://modelslab.com/api/v6/deepfake/fetch/{id}", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

Response
Example Response
{
    "status": "success",
    "id": 263,
    "output": [
        "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/6351a2b3-82ce-4d27-8c3d-2f7fa1e19e30.mp4"
    ],
    "tip": "Get 20x faster image generation using enterprise plan. Click here : http://sdapi_backend.test/enterprise",
    "proxy_links": null
}
