function showLoader(){
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader(){
  document.getElementById("loader").classList.add("hidden");
}


// SAVE HISTORY
function saveToHistory(name, url){
  let history = JSON.parse(localStorage.getItem("pdfHistory")) || [];

  history.push({
    name: name,
    url: url,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("pdfHistory", JSON.stringify(history));
}


// LOAD HISTORY
function loadHistory(){
  let history = JSON.parse(localStorage.getItem("pdfHistory")) || [];

  let container = document.getElementById("historyList");
  if (!container) return;

  container.innerHTML = "";

  history.slice().reverse().forEach(item => {
    let div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        <small>${item.date}</small>
      </div>
      <button onclick="window.open('${item.url}')">Open</button>
    `;

    container.appendChild(div);
  });
}


// AUTO LOAD
window.onload = function(){
  loadHistory();
}


// TEXT → PDF
function generatePDF(){
  showLoader();

  setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let text = document.getElementById("text").value;

    let lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);

    const blob = new Blob([doc.output("blob")], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    saveToHistory("Text PDF", url);

    doc.save("file.pdf");

    hideLoader();
  }, 800);
}


// MERGE PDF
async function mergePDF(){
  showLoader();

  setTimeout(async () => {

    const { PDFDocument } = PDFLib;

    const files = document.getElementById("pdfFiles").files;

    const mergedPdf = await PDFDocument.create();

    for(let i = 0; i < files.length; i++){
      const fileBytes = await files[i].arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);

      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    saveToHistory("Merged PDF", url);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();

    hideLoader();

  }, 1000);
}


// COMPRESS PDF
async function compressPDF(){
  showLoader();

  setTimeout(async () => {

    const file = document.getElementById("file").files[0];

    const buffer = await file.arrayBuffer();

    const { PDFDocument } = PDFLib;

    const pdfDoc = await PDFDocument.load(buffer);

    const output = await pdfDoc.save({
      useObjectStreams: true
    });

    const blob = new Blob([output], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    saveToHistory("Compressed PDF", url);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.pdf";
    a.click();

    hideLoader();

  }, 1000);
}