"use client";

import jsPDF from "jspdf";
import Button from "@/components/ui/Button";

interface CertificateProps {
    registryId: string;
    assetCode: string;
    issuer: string;
    ownerName: string;
    ownerAddress: string;
    txHash: string;
    issueDate: string;
    verifyUrl: string;
}

export default function CertificateGenerator({ data }: { data: CertificateProps }) {

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Background / Border
        doc.setLineWidth(2);
        doc.setDrawColor(200, 200, 200);
        doc.rect(10, 10, 277, 190);

        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 51, 102);
        doc.rect(15, 15, 267, 180);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(0, 51, 102);
        doc.text("CERTIFICATE OF OWNERSHIP", 148.5, 40, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("STELLAR ASSET REGISTRY", 148.5, 50, { align: "center" });

        // Content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("This certifies that", 148.5, 70, { align: "center" });

        // Owner Name
        doc.setFont("times", "italic");
        doc.setFontSize(24);
        doc.text(data.ownerName, 148.5, 85, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("is the registered owner of the digital asset:", 148.5, 95, { align: "center" });

        // Asset Details Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(60, 105, 177, 40, 3, 3, "F");

        doc.setFontSize(12);
        doc.text(`Asset Code: ${data.assetCode}`, 70, 115);
        doc.text(`Registry ID: ${data.registryId}`, 160, 115);
        doc.text(`Issuer: ${data.issuer}`, 70, 125);
        doc.text(`Owner: ${data.ownerAddress}`, 70, 135);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Start Verification at: " + data.verifyUrl, 148.5, 160, { align: "center" });
        doc.text("Recorded on Stellar Blockchain", 148.5, 170, { align: "center" });
        doc.text(`TX: ${data.txHash}`, 148.5, 175, { align: "center" });

        doc.setFontSize(8);
        doc.text("This certificate represents ownership verified on the Stellar network at the time of issuance.", 148.5, 185, { align: "center" });
        doc.text(new Date().toISOString(), 148.5, 190, { align: "center" });

        // QR Code Placeholder (rendering actual QR in jsPDF needs an image, skipping for simplicity or using a lib)
        // doc.rect(230, 150, 30, 30); // QR placeholder

        doc.save(`Certificate-${data.registryId}.pdf`);
    };

    return (
        <Button onClick={generatePDF} variant="primary">
            Download Certificate
        </Button>
    );
}
