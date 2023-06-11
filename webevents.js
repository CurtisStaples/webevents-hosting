
const BASEURL = "https://trackerbackend-personalization.herokuapp.com/"
const IPURL = BASEURL + "track/ip"
const EVENTURL = BASEURL + "track/event"
var currentPageName = document.location.href;
  let id = getCookie("id");
  let ip = null;
  postData(IPURL,{id:id}).then(function(response){
    ip = response.ip
    if(!id){
      generateCookie(response.id,90)
    }
    detectEvent(currentPageName)
    window.Tracker = new TrackEvent()
  })


async function postData(url = "", data = {}) {

  try{

      // Default options are marked with *
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects

  } catch(e){
    console.log("error posting:",e)
  }
  
  }


function generateCookie(id,expDays){

  try{

    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = "id=" + id + "; " + expires + "; path=/" + "; SameSite=Lax;"

  } catch(e){
    console.log("cookie gen error:",e)
  }
    
}

function getCookie(cname) {

  try{

    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";

  } catch(e){
    console.log("cookie get error:",e)
  }
  }

   
async function detectEvent(currentPageName){

    let referrer = document.referrer;

    let screenWidth = window.screen.width;
    let screenHeight = window.screen.height;
    
    
    let browser = navigator.userAgent;
    
    
    let language = navigator.language;
    
    let timezoneOffset = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    let id = getCookie("id")
    
  
    let result = {
        currentPageName: currentPageName,
        referrer: referrer,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        browser: browser,
        language: language,
        timezoneOffset: timezoneOffset,
        timestamp: Date.now(),
        anonymousID:id,
        ip:ip
    }
    await postData(EVENTURL,{event:result})
  

}


window.onload = function() {
    var bodyList = document.querySelector("body")


    var observer = new MutationObserver( function(mutations) {
        mutations.forEach( function(mutation) {
            if (currentPageName != document.location.href) {
                currentPageName = document.location.href;
                detectEvent(currentPageName)
            }
        });
    });
    
    var config = {
        childList: true,
        subtree: true
    };
    
    observer.observe(bodyList, config);
};



 

function TrackEvent(){
  const self = this;
  this.track = function(eventName,eventDetails) {
      console.log("Custom Tracker",eventName,eventDetails);
  }

  this.identify = async function(userID,userInfo){
      self.track("Identify" + String(userID),userInfo)
      if(userInfo.hasOwnProperty('email')){
          console.log(userInfo)
      }
  }
}




