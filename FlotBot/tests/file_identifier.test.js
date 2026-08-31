const FileIdentifier = require("../core/fileengine/FileIdentifier");

describe("FileIdentifier", () => {

    test("Identifies Windows PE executable magic bytes", () => {
        const peBuf = Buffer.alloc(128);
        peBuf[0] = 0x4D; // M
        peBuf[1] = 0x5A; // Z
        const res = FileIdentifier.identify(peBuf, "invoice.exe");
        expect(res.format).toBe("PE_EXECUTABLE");
        expect(res.isExecutable).toBe(true);
        expect(res.isMasquerading).toBe(false);
    });

    test("Identifies Linux ELF binary magic bytes", () => {
        const elfBuf = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00]);
        const res = FileIdentifier.identify(elfBuf, "daemon");
        expect(res.format).toBe("ELF_BINARY");
        expect(res.isExecutable).toBe(true);
    });

    test("Identifies macOS Mach-O 64-bit binary magic bytes", () => {
        const machBuf = Buffer.from([0xFE, 0xED, 0xFA, 0xCF, 0x01, 0x00, 0x00, 0x07]);
        const res = FileIdentifier.identify(machBuf, "binary_mac");
        expect(res.format).toBe("MACHO_64");
        expect(res.isExecutable).toBe(true);
    });

    test("Detects double-extension masquerading (invoice.pdf.exe)", () => {
        const peBuf = Buffer.alloc(128);
        peBuf[0] = 0x4D;
        peBuf[1] = 0x5A;
        const res = FileIdentifier.identify(peBuf, "/tmp/invoice.pdf.exe");
        expect(res.hasDoubleExtension).toBe(true);
        expect(res.isMasquerading).toBe(true);
        expect(res.masqueradeReason).toContain("Double file extension");
    });

    test("Detects executable binary disguised as a normal PDF document", () => {
        const peBuf = Buffer.alloc(128);
        peBuf[0] = 0x4D;
        peBuf[1] = 0x5A;
        const res = FileIdentifier.identify(peBuf, "/home/user/Downloads/report.pdf");
        expect(res.format).toBe("PE_EXECUTABLE");
        expect(res.isMasquerading).toBe(true);
        expect(res.masqueradeReason).toContain("Executable binary content disguised with document extension");
    });

    test("Identifies standard PDF document", () => {
        const pdfBuf = Buffer.from("%PDF-1.7\n%raw content");
        const res = FileIdentifier.identify(pdfBuf, "document.pdf");
        expect(res.format).toBe("PDF_DOCUMENT");
        expect(res.isExecutable).toBe(false);
        expect(res.isMasquerading).toBe(false);
    });

});
