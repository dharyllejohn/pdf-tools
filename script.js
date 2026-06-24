function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hidden");
}

// SAVE HISTORY
function saveToHistory(name, url) {
    let history = JSON.parse(localStorage.getItem("pdfHistory")) || [];

    history.push({
        name,
        url,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("pdfHistory", JSON.stringify(history));
}

// LOAD HISTORY
function loadHistory() {
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
window.onload = function () {
    loadHistory();
};

// TEXT TO PDF
function generatePDF() {

    showLoader();

    setTimeout(() => {

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        const text = document.getElementById("text").value;

        const lines = doc.splitTextToSize(text, 180);

        doc.text(lines, 10, 10);

        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);

        saveToHistory("Text PDF", url);

        doc.save("file.pdf");

        hideLoader();

    }, 800);
}

// MERGE PDF
async function mergePDF() {

    const files = document.getElementById("pdfFiles").files;

    if (!files.length) {
        alert("Please select PDF files first.");
        return;
    }

    showLoader();

    try {

        const { PDFDocument } = PDFLib;

        const mergedPdf = await PDFDocument.create();

        for (let i = 0; i < files.length; i++) {

            const bytes = await files[i].arrayBuffer();

            const pdf = await PDFDocument.load(bytes);

            const pages = await mergedPdf.copyPages(
                pdf,
                pdf.getPageIndices()
            );

            pages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedBytes = await mergedPdf.save();

        const blob = new Blob(
            [mergedBytes],
            { type: "application/pdf" }
        );

        const url = URL.createObjectURL(blob);

        saveToHistory("Merged PDF", url);

        const a = document.createElement("a");
        a.href = url;
        a.download = "merged.pdf";
        a.click();

    } catch (error) {

        console.error(error);
        alert("Error merging PDF.");

    } finally {

        hideLoader();
    }
}

// COMPRESS PDF
async function compressPDF() {

    const file = document.getElementById("file").files[0];

    if (!file) {
        alert("Please select a PDF file first.");
        return;
    }

    showLoader();

    try {

        const { PDFDocument } = PDFLib;

        const buffer = await file.arrayBuffer();

        const pdfDoc = await PDFDocument.load(buffer);

        const output = await pdfDoc.save({
            useObjectStreams: true
        });

        const blob = new Blob(
            [output],
            { type: "application/pdf" }
        );

        const url = URL.createObjectURL(blob);

        saveToHistory("Compressed PDF", url);

        const a = document.createElement("a");
        a.href = url;
        a.download = "compressed.pdf";
        a.click();

    } catch (error) {

        console.error(error);
        alert("Error compressing PDF.");

    } finally {

        hideLoader();
    }
}
async function imageToPDF() {

    const file = document.getElementById("imageFile").files[0];

    if (!file) {
        alert("Select an image first.");
        return;
    }

    showLoader();

    const { jsPDF } = window.jspdf;

    const reader = new FileReader();

    reader.onload = function(e) {

        const pdf = new jsPDF();

        pdf.addImage(e.target.result, "JPEG", 10, 10, 180, 120);

        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);

        saveToHistory("Image to PDF", url);

        pdf.save("image.pdf");

        hideLoader();
    };

    reader.readAsDataURL(file);
}

async function jpgToPDF() {

    const file = document.getElementById("jpgFile").files[0];

    if (!file) {
        alert("Select a JPG file first.");
        return;
    }

    showLoader();

    const { jsPDF } = window.jspdf;

    const reader = new FileReader();

    reader.onload = function(e) {

        const pdf = new jsPDF();

        pdf.addImage(e.target.result, "JPEG", 10, 10, 180, 120);

        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);

        saveToHistory("JPG to PDF", url);

        pdf.save("jpg.pdf");

        hideLoader();
    };

    reader.readAsDataURL(file);
}
