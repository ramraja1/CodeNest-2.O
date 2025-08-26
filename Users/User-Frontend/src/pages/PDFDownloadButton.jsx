import { jsPDF } from "jspdf";

export default function PDFDownloadButton({ data }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(18);
    doc.text("Contest Rankings", 14, 22);

    // Define columns
    const columns = ["Contest", "Rank", "Trophy", "Score"];

    // Prepare rows from data
    const rows = data.map((c) => [
      c.title || "",
      c.rank ?? "",
      c.trophy || "",
      String(c.totalScore ?? ""),
    ]);

    // Starting position for table
    let startY = 30;

    // Simple table rendering
    doc.setFontSize(12);
    doc.text(columns, 14, startY);

    startY += 6;
    rows.forEach((row, idx) => {
      doc.text(row, 14, startY + idx * 7);
    });

    doc.save("contest-rankings.pdf");
  };

  return (
    <button
      onClick={generatePDF}
      className="px-4 py-1 border border-green-600 rounded text-green-700 hover:bg-green-50"
      disabled={!data || data.length === 0}
      title={data && data.length === 0 ? "No data to download" : ""}
    >
      Download PDF
    </button>
  );
}
