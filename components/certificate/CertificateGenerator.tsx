"use client";

import jsPDF from "jspdf";
import Button from "@/components/ui/Button";

interface CertificateProps {
    type: "OWNERSHIP" | "TRANSFER" | "REGISTRATION";
    registryId: string;
    assetCode: string;
    issuer: string;
    ownerName: string;
    ownerAddress: string;
    txHash: string;
    issueDate: string;
    verifyUrl: string;
    senderAddress?: string; // For transfers
}

export default function CertificateGenerator({ data }: { data: CertificateProps }) {

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Colors
        const primaryColor: [number, number, number] = [0, 51, 102]; // Navy Blue
        const secondaryColor: [number, number, number] = [200, 200, 200]; // Grey

        // Background / Border
        doc.setLineWidth(2);
        doc.setDrawColor(...secondaryColor);
        doc.rect(10, 10, 277, 190);

        doc.setLineWidth(1);
        doc.setDrawColor(...primaryColor);
        doc.rect(15, 15, 267, 180);

        // Header Titles based on Type
        let title = "CERTIFICATE OF OWNERSHIP";
        let subtitle = "STELLAR ASSET REGISTRY";
        let bodyText = "This certifies that";
        let actionText = "is the registered owner of the digital asset:";

        if (data.type === "TRANSFER") {
            title = "TRANSFER RECEIPT";
            bodyText = "This receipt confirms that";
            actionText = "has successfully transferred ownership of:";
        } else if (data.type === "REGISTRATION") {
            title = "REGISTRATION CERTIFICATE";
            bodyText = "This certifies that";
            actionText = "has successfully registered the digital asset:";
        }

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(...primaryColor);
        doc.text(title, 148.5, 40, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 148.5, 50, { align: "center" });

        // Content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(bodyText, 148.5, 70, { align: "center" });

        // Owner/Actor Name
        doc.setFont("times", "italic");
        doc.setFontSize(22);
        doc.text(data.ownerName || "Unknown Identity", 148.5, 85, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text(actionText, 148.5, 95, { align: "center" });

        // Asset Details Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(50, 105, 197, 45, 3, 3, "F");

        doc.setFontSize(12);
        doc.text(`Asset Code: ${data.assetCode}`, 60, 115);
        doc.text(`Registry ID: ${data.registryId}`, 150, 115);

        doc.setFontSize(10);
        doc.text(`Issuer ID: ${data.issuer}`, 60, 125);

        if (data.type === "TRANSFER" && data.senderAddress) {
            doc.text(`From: ${data.senderAddress}`, 60, 135);
            doc.text(`To:   ${data.ownerAddress}`, 60, 140);
        } else {
            doc.text(`Owner Address: ${data.ownerAddress}`, 60, 135);
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Verify at: " + data.verifyUrl, 148.5, 165, { align: "center" });
        doc.text("Confirmed on Stellar Network", 148.5, 175, { align: "center" });

        doc.setFontSize(8);
        doc.text(`Transaction: ${data.txHash}`, 148.5, 180, { align: "center" });
        doc.text(data.issueDate, 148.5, 185, { align: "center" });

        // Download
        doc.save(`${title.replace(/ /g, "_")}-${data.registryId}.pdf`);
    };

    const label = data.type === "TRANSFER" ? "Download Receipt" : "Download Certificate";

    return (
        <Button onClick={generatePDF} variant="secondary" className="w-full">
            {label}
        </Button>
    );
}
