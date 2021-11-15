//author= Mücahit Sahin
//github=https://github.com/mucahit-sahin


async function openBilingual () {
  
  let tracks = document.getElementsByTagName('track')
  let en
  let tr
  if (tracks.length) {
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].srclang === 'en') {
        en = tracks[i]
      }
      else if (tracks[i].srclang === 'tr') {
        tr = tracks[i]
      }
    }

    if (en) {
    en.track.mode = 'showing'

      if (tr) {
        tr.track.mode = 'showing'
      } 
      else {
        
        await sleep(500)
        let cues = en.track.cues
        
        //İngilizce yazıdaki cümle bitiş anlarının tespiti.
        // .....cümle bitti. Yeni cümle 
        //Burada sadece nokta karakterinden sonra boşluk olan durumlarda cümlenin bittiği varsayılmıştır.
        // 75.3 , model.fit gibi özel ifade belirten durumlarda noktayı cümle bitişi olarak algılamaması için.
        var endSentence = []
        for(let i=0;i<cues.length;i++)
        {
          for(let j=0;j<cues[i].text.length;j++)
          {
            if(cues[i].text[j] == '.' && cues[i].text[j+1] == undefined)
            {
              endSentence.push(i)
            }
          }
        }
        ///////////////////////


        var cuesTextList = getTexts(cues)
        var newCuestTextList = ""
        for(let i=0;i<cuesTextList.length;i++)
        {
          
          if(cuesTextList[i] == '.' && cuesTextList[i+1] == ' ')
            newCuestTextList += ". z~~~z"
          else
            newCuestTextList += cuesTextList[i]
          }

        getTranslation(newCuestTextList, translatedText => {

          var translatedList = translatedText.split(' z~~~z')
          translatedList.splice(-1,1)

          for(let i=0;i<endSentence.length;i++)
          {
            if(i!=0)
            {
              for(let j=endSentence[i-1]+1;j<=endSentence[i];j++)
              {
                cues[j].text = translatedList[i]
                
              }
            }
            else
            {
              for(let j=0;j<=endSentence[i];j++)
              {
                cues[j].text = translatedList[i]
              }
            }
          }
        })
      }
    }
  }
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getTexts(cues)
{
  let cuesTextList = ""
  for(let i=0;i < cues.length;i++)
  {
    for(let j=0;j<cues[i].text.length;j++)
    {
      if(cues[i].text[j] == '.' && cues[i].text[j+1] == ' ')
      {
        cues[i].text = cues[i].text.replaceAt(j, ",")
      }
    }
        cuesTextList+= cues[i].text.replace(/\n/g, ' ') + " "
  }
  return cuesTextList
}

function getTranslation (words, callback) {

 const xhr = new XMLHttpRequest()
 let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURI(words)}`
  xhr.open('GET', url, true)
  xhr.responseType = 'text'
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 304) {
      
        const translatedList = JSON.parse(xhr.responseText)[0]
        let translatedText = ''
        for (let i = 0; i < translatedList.length; i++) {
          translatedText += translatedList[i][0]
        }
        callback(translatedText)
      }
    }
  }
  xhr.send()
}

chrome.runtime.onMessage.addListener
(
  function (request, sender) {
    openBilingual()
  }
)
