import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { exportTableToExcel, exportTableToPDF, printTable } from "./exportUtils";

const ExportButtons = ({ tableRef, fileName = "export" }) => {
    const handleExcel = () => {
        exportTableToExcel(tableRef?.current, fileName);
    };
    const handlePDF = () => {
        exportTableToPDF(tableRef?.current, fileName);
    };
    const handlePrint = () => {
        printTable(tableRef?.current, fileName);
    };

    return (
        <ButtonGroup size="sm">
            <Button variant="outline-success" onClick={handleExcel} title="Exportar a Excel">
                <FileSpreadsheet size={16} className="me-1" /> Excel
            </Button>
            <Button variant="outline-danger" onClick={handlePDF} title="Exportar a PDF">
                <FileText size={16} className="me-1" /> PDF
            </Button>
            <Button variant="outline-secondary" onClick={handlePrint} title="Imprimir">
                <Printer size={16} className="me-1" /> Imprimir
            </Button>
        </ButtonGroup>
    );
};

export default ExportButtons;


