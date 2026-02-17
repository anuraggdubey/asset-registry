"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Button from "@/components/ui/Button";
import { OwnershipCertificate } from "./OwnershipCertificate";
import { createPortal } from "react-dom";

interface DownloadCertificateButtonProps {
    data: {
        certificateId: string;
        assetHash: string;
        fullFingerprint: string;
        ownerAddress: string;
        previousOwner?: string;
        txHash: string;
        timestamp: string;
    };
}

export default function DownloadCertificateButton({ data }: DownloadCertificateButtonProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        setGenerating(true);
        try {
            // Wait a moment for rendering if needed
            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");

            // A4 dimensions in mm: 210 x 297
            // We want it to fill the page mostly
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // If image is taller than page, scale to fit height
            // But usually for A4 style component it should fit width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
            pdf.save(`Certificate-${data.assetHash.slice(0, 8)}.pdf`);

        } catch (err) {
            console.error("Certificate generation failed", err);
            alert("Failed to generate certificate.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleDownload}
                variant="outline"
                loading={generating}
                className="w-full flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {generating ? "Generating PDF..." : "Download as PDF"}
            </Button>

            {/* Render the certificate off-screen/hidden but mounted so html2canvas can capture it */}
            {/* We use a portal or just a hidden absolute div. 
                Using 'hidden' display often breaks html2canvas. 
                Move it far off sreen instead. */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <OwnershipCertificate ref={certificateRef} {...data} />
            </div>
        </>
    );
}
