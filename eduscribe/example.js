const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');


async function get_video_title(id) {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`;

  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return data.items[0].snippet.title;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// USAGE: has to be inside an aysnc function
// const title = await get_video_title("mVKAyw0xqxw")

// async function example(){
//     const title = await get_video_title("mVKAyw0xqxw")
//     console.log(title);
// }

// example();
// Need to define get_video_title(id) if not done so already

async function uploadToVectara(id, summary){
    // Create a temporary file and write the string to it
    const tempFilePath = path.join(os.tmpdir(), id + ".txt")
    fs.writeFileSync(tempFilePath, summary);
    let data = new FormData();
    const url = `https://www.youtube.com/watch?v=${id}`
    const title = await get_video_title(id)
    data.append('doc_metadata', `{"title": "${title}", "url": "${url}"}`)
    data.append('file', fs.createReadStream(tempFilePath)) // read the temporary file
    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.vectara.io/v1/upload?c=${process.env.VECTARA_ID}&o=3`,
    headers: {
        'Content-Type': 'multipart/form-data', 
        'Accept': 'application/json', 
        'x-api-key': process.env.VECTARA_API_KEY, 
        ...data.getHeaders()
    },
    data : data
    };

    axios(config)
    .then((response) => {
    console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
    console.log(error);
    });
}

// USAGE: has to be inside an aysnc function
// uploadToVectara("mVKAyw0xqxw", "The video is about Tails OS, a free operating system designed to protect users against malware, censorship, and surveillance. It was first released in 2009 and gained popularity when Edward Snowden used it to expose the government's mass surveillance programs.  The speaker explains that most personal computers track users' movements and collect biometric data for advertising purposes. Tails OS, however, is a Debian-based Linux distro that boots from a USB stick, turning any computer into a temporarily secure machine.  The speaker emphasizes the feature of \"Amnesia\" in Tails OS, which ensures that everything done on the operating system disappears automatically when it shuts down. This is because Tails never writes anything to the hard disk and only runs from the computer's memory.  The speaker also mentions that Tails OS includes privacy-focused software like the Tor browser, which conceals the user's location, IP address, and usage. Any application that tries to access the internet without the Tor network is automatically blocked on Tails.  The video then provides a step-by-step guide on how to install and run Tails OS from a USB stick. The speaker stresses the importance of having a good connection to the Tor network for the best privacy and security.  Key takeaways from the video include the importance of privacy and security in today's digital age, the benefits of using Tails OS, and how to install and use it. The speaker also emphasizes that everything done on Tails OS is stored in random access memory and not on disk, adding an extra layer of security.");