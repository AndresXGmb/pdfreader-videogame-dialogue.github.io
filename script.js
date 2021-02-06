var page = 1;
var totalPages = 0;
var ichar = 0;
var jsentence = 0;
var txt = "";
var arr;
var delay = 15;
var writing = false;
var pdffile = null;
var pdfurl = null;
var pdfname = null;
var panelIsActive = false;

document.querySelector("#inputpdf").addEventListener('change',(e)=>{
  var file = e.target.files[0];
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = function() {
    pdfurl = reader.result;
    document.querySelector(".pdfloader").style.visibility = "hidden";
    pdfname = file.name;
    if (localStorage.getItem(pdfname) != null) {
      page = parseInt(localStorage.getItem(pdfname));
    }
    else {
      localStorage.setItem(pdfname, 1);
    }
    //localStorage.setItem(pdfname, 1);
    document.querySelector('.book-title h1').innerHTML = file.name.slice(0,-4);
    loadFile();
  }
});

document.querySelector("#inputimg").addEventListener('change',(e)=>{
  let reader = new FileReader()
  reader.readAsDataURL(e.target.files[0]);
  reader.onloadend = function() {
    imgurl = reader.result;
    document.querySelector("body").style.backgroundImage = "url("+imgurl+")";
  }
});

document.querySelector("#inputpage").addEventListener("keyup",(e)=>{
  if(e.keyCode === 13) {
    document.getElementById("typingtext").innerHTML = '';
    if(e.target.value < 1) {
      e.target.value = 1;
    }
    if(e.target.value > totalPages) {
      e.target.value = totalPages;
    }
    page = parseInt(e.target.value);
    localStorage.setItem(pdfname, page);
    document.querySelector('#page').innerHTML = page;
    writing = false;
    getPageText(page , pdffile).then(function(textPage){
      txt = textPage;
      arr = txt.split(".");
      ichar = 0;
      jsentence = 0;
      typeWriter();
    });
  }
});

function loadFile() {
  //load the pdf and get the first page
  var loadingTask = pdfjsLib.getDocument(pdfurl);
  loadingTask.promise.then(function(pdf) {
    totalPages = pdf.numPages;
    document.querySelector('#page').innerHTML = page;
    pdffile = pdf;
    getPageText(page , pdf).then(function(textPage){
      txt = textPage;
      arr = txt.split(".");
      document.querySelector("#inputpage").style.visibility = "visible";
    });
  });
}

function buttonClick() {
  if(pdffile != null) {
    if (writing) {
      ichar = arr[jsentence].length;
      document.getElementById("typingtext").innerHTML = arr[jsentence];
    }
    else {
      document.getElementById("typingtext").innerHTML = '';
      typeWriter();
    }
  }
}

async function typeWriter() {
  //type char by char of the actual sentence.
  for (ichar; ichar < arr[jsentence].length; ichar++) {
      writing = true;
      document.getElementById("typingtext").innerHTML += arr[jsentence].charAt(ichar);
      await sleep(delay);
  }
  document.getElementById("typingtext").innerHTML += ".";
  ichar = 0;
  jsentence++;

  //if it has finished all the sentences load next page.
  if(jsentence == arr.length) {
    console.log("end of the page");
    jsentence = 0;
    page++;
    localStorage.setItem(pdfname, page);
    document.querySelector('#page').innerHTML = page;
    if (page <= totalPages) {
      getPageText(page , pdffile).then(function(textPage){
        //document.getElementById("pageNum").innerHTML = page;
        txt = textPage;
        arr = txt.split(".");
      });
    }
  }
  writing = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.onkeydown = (e) => {
  console.log(e.key)
    if(e.key == 'x' || e.key == 'ArrowRight') {
        buttonClick();
    }
}

function getPageText(pageNum, PDFDocumentInstance) {
  if(pageNum <= totalPages) {
    return new Promise(function (resolve, reject) {
      PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
          // The main trick to obtain the text of the PDF page, use the getTextContent method
          pdfPage.getTextContent().then(function (textContent) {
              var textItems = textContent.items;
              var finalString = "";

              // Concatenate the string of the item to the final string
              for (var i = 0; i < textItems.length; i++) {
                  var item = textItems[i];

                  finalString += item.str + " ";
              }

              // Solve promise with the text retrieven from the page
              resolve(finalString);
          });
      });
  });
  }
}

function showPanel() {
  if(!panelIsActive) {
    document.querySelector('.panel').style.left = "0";
    document.querySelector('.showPanel').style.left = "395px";
    panelIsActive = true;
  }
  else {
    document.querySelector('.panel').style.left = "-395px";
    document.querySelector('.showPanel').style.left = "0";
    panelIsActive = false;
  }
}