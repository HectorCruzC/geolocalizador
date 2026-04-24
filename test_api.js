const fs = require('fs');

async function testApi() {
    const formData = new FormData();
    formData.append("name", "Test Diagram");
    formData.append("zone", "PTI");
    
    // Create a dummy PDF blob
    const pdfBlob = new Blob(["dummy pdf content"], { type: "application/pdf" });
    formData.append("pdf", pdfBlob, "test.pdf");

    const components = [
        {
            nombre: "R-9999",
            alias: "Test",
            latitud: "18.123",
            longitud: "-99.123",
            marca: "NOJA",
            tipo: "RESTAURADOR"
        }
    ];
    formData.append("componentsData", JSON.stringify(components));

    try {
        const res = await fetch("http://localhost:3000/api/diagramas", {
            method: "POST",
            body: formData
        });
        
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch (e) {
        console.error("FETCH ERROR:", e);
    }
}

testApi();
