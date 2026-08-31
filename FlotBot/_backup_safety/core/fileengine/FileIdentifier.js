const fs = require("fs");
const path = require("path");

/**
 * FileIdentifier
 * ─────────────────────────────────────────────────────────────
 * Cross-platform file format and magic byte identification engine.
 *
 * Rules:
 *   - NEVER trust file extension alone.
 *   - Inspect magic bytes / headers to determine true file type.
 *   - Detect file extension vs actual format mismatches (Masquerading).
 *   - Identify archives, executables, scripts, documents, media.
 */
class FileIdentifier {

    static MAGIC_SIGNATURES = [
        // Windows Executables & DLLs
        { format: "PE_EXECUTABLE", mime: "application/vnd.microsoft.portable-executable", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 2 && buf[0] === 0x4D && buf[1] === 0x5A }, // MZ
        // Linux ELF Binaries
        { format: "ELF_BINARY", mime: "application/x-executable", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 4 && buf[0] === 0x7F && buf[1] === 0x45 && buf[2] === 0x4C && buf[3] === 0x46 }, // \x7fELF
        // macOS Mach-O Binaries (32-bit, 64-bit, and Universal/Fat)
        { format: "MACHO_64", mime: "application/x-mach-binary", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 4 && ((buf[0] === 0xFE && buf[1] === 0xED && buf[2] === 0xFA && buf[3] === 0xCF) || (buf[0] === 0xCF && buf[1] === 0xFA && buf[2] === 0xED && buf[3] === 0xFE)) }, // 0xFEEDFACF
        { format: "MACHO_32", mime: "application/x-mach-binary", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 4 && ((buf[0] === 0xFE && buf[1] === 0xED && buf[2] === 0xFA && buf[3] === 0xCE) || (buf[0] === 0xCE && buf[1] === 0xFA && buf[2] === 0xED && buf[3] === 0xFE)) }, // 0xFEEDFACE
        { format: "MACHO_FAT", mime: "application/x-mach-binary", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 4 && ((buf[0] === 0xCA && buf[1] === 0xFE && buf[2] === 0xBA && buf[3] === 0xBE) || (buf[0] === 0xBE && buf[1] === 0xBA && buf[2] === 0xFE && buf[3] === 0xCA)) }, // 0xCAFEBABE
        // Shell Scripts & Interpreters
        { format: "SHELL_SCRIPT", mime: "text/x-shellscript", category: "SCRIPT", isExecutable: true, check: (buf) => buf.length >= 2 && buf[0] === 0x23 && buf[1] === 0x21 }, // #!
        // Archives & Containers
        { format: "ZIP_ARCHIVE", mime: "application/zip", category: "ARCHIVE", isExecutable: false, check: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4B && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07) && (buf[3] === 0x04 || buf[3] === 0x06 || buf[3] === 0x08) }, // PK..
        { format: "7Z_ARCHIVE", mime: "application/x-7z-compressed", category: "ARCHIVE", isExecutable: false, check: (buf) => buf.length >= 6 && buf[0] === 0x37 && buf[1] === 0x7A && buf[2] === 0xBC && buf[3] === 0xAF && buf[4] === 0x27 && buf[5] === 0x1C }, // 7z\xBC\xAF\x27\x1C
        { format: "RAR_ARCHIVE", mime: "application/x-rar-compressed", category: "ARCHIVE", isExecutable: false, check: (buf) => buf.length >= 4 && buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72 && buf[3] === 0x21 }, // Rar!
        { format: "GZIP_ARCHIVE", mime: "application/gzip", category: "ARCHIVE", isExecutable: false, check: (buf) => buf.length >= 2 && buf[0] === 0x1F && buf[1] === 0x8B },
        // Documents
        { format: "PDF_DOCUMENT", mime: "application/pdf", category: "DOCUMENT", isExecutable: false, check: (buf) => buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 }, // %PDF
        { format: "RTF_DOCUMENT", mime: "application/rtf", category: "DOCUMENT", isExecutable: false, check: (buf) => buf.length >= 5 && buf.slice(0, 5).toString("ascii") === "{\\rtf" },
        // Images
        { format: "PNG_IMAGE", mime: "image/png", category: "IMAGE", isExecutable: false, check: (buf) => buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 && buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A },
        { format: "JPEG_IMAGE", mime: "image/jpeg", category: "IMAGE", isExecutable: false, check: (buf) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF },
        { format: "GIF_IMAGE", mime: "image/gif", category: "IMAGE", isExecutable: false, check: (buf) => buf.length >= 4 && buf.slice(0, 4).toString("ascii") === "GIF8" },
        // Java Class & Jar
        { format: "JAVA_CLASS", mime: "application/java-vm", category: "EXECUTABLE", isExecutable: true, check: (buf) => buf.length >= 4 && buf[0] === 0xCA && buf[1] === 0xFE && buf[2] === 0xBA && buf[3] === 0xBE && buf.length > 8 && buf.readUInt16BE(4) === 0 }
    ];

    /**
     * Identify a file from buffer and optional filePath.
     * @param {Buffer} buffer
     * @param {string} [filePath]
     * @returns {object} Identification result
     */
    static identify(buffer, filePath = "") {
        const ext = filePath ? path.extname(filePath).toLowerCase() : "";
        const filename = filePath ? path.basename(filePath) : "";
        
        let detected = null;
        if (buffer && buffer.length > 0) {
            for (const sig of FileIdentifier.MAGIC_SIGNATURES) {
                try {
                    if (sig.check(buffer)) {
                        detected = sig;
                        break;
                    }
                } catch { /* continue */ }
            }
        }

        // Script content inspection if not identified by binary magic
        if (!detected && buffer && buffer.length > 0) {
            const headStr = buffer.slice(0, 1024).toString("utf8");
            if (headStr.includes("<script") || headStr.includes("<?php") || headStr.includes("function") || headStr.includes("import ") || headStr.includes("const ") || headStr.includes("var ") || headStr.includes("let ")) {
                detected = { format: "TEXT_SCRIPT", mime: "text/plain", category: "SCRIPT", isExecutable: true };
            } else if (headStr.includes("powershell") || headStr.includes("cmd.exe") || headStr.includes("@echo off") || headStr.includes("Set-ExecutionPolicy")) {
                detected = { format: "WINDOWS_SCRIPT", mime: "text/x-powershell", category: "SCRIPT", isExecutable: true };
            } else if (/^[\x20-\x7E\r\n\t]+$/.test(headStr.slice(0, 256))) {
                detected = { format: "TEXT_PLAIN", mime: "text/plain", category: "TEXT", isExecutable: false };
            }
        }

        if (!detected) {
            detected = {
                format: "UNKNOWN_DATA",
                mime: "application/octet-stream",
                category: "UNKNOWN",
                isExecutable: [".exe", ".dll", ".so", ".dylib", ".bin", ".elf", ".sh", ".bat", ".ps1", ".vbs"].includes(ext)
            };
        }

        // Check for double extension masquerading (e.g. invoice.pdf.exe or report.docx.vbs)
        const doubleExtMatch = /\.(pdf|docx?|xlsx?|pptx?|txt|png|jpg|jpeg|gif|csv|zip|rar|tar|7z)\.(exe|scr|vbs|bat|cmd|ps1|sh|pif|hta|jar|msi|cpl|com)$/i.exec(filename);
        const hasDoubleExtension = !!doubleExtMatch;

        // Check for extension vs magic bytes mismatch
        const isDocumentExt = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf", ".csv"].includes(ext);
        const isImageExt = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".ico"].includes(ext);
        const isArchiveExt = [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"].includes(ext);
        const isExecExt = [".exe", ".dll", ".sys", ".scr", ".elf", ".so", ".dylib", ".bin"].includes(ext);

        const isMasquerading = (
            hasDoubleExtension ||
            (isDocumentExt && (detected.category === "EXECUTABLE" || detected.isExecutable)) ||
            (isImageExt && (detected.category === "EXECUTABLE" || detected.isExecutable)) ||
            (isArchiveExt && detected.category === "EXECUTABLE") ||
            (isExecExt && detected.category === "IMAGE") ||
            (isExecExt && detected.category === "DOCUMENT")
        );

        let masqueradeReason = null;
        if (hasDoubleExtension) {
            masqueradeReason = `Double file extension detected: hidden executable '.${doubleExtMatch[2]}' masked as document '.${doubleExtMatch[1]}'`;
        } else if (isDocumentExt && detected.category === "EXECUTABLE") {
            masqueradeReason = `Executable binary content disguised with document extension '${ext}'`;
        } else if (isImageExt && detected.category === "EXECUTABLE") {
            masqueradeReason = `Executable binary content disguised with image extension '${ext}'`;
        } else if (isMasquerading) {
            masqueradeReason = `File extension '${ext}' contradicts actual header format '${detected.format}'`;
        }

        return {
            format: detected.format,
            mime: detected.mime,
            category: detected.category,
            isExecutable: detected.isExecutable,
            extension: ext,
            filename,
            hasDoubleExtension,
            isMasquerading,
            masqueradeReason,
            magicHex: buffer && buffer.length >= 8 ? buffer.slice(0, 8).toString("hex").toUpperCase() : ""
        };
    }

    /**
     * Identify file directly from disk path.
     */
    static identifyFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return {
                format: "FILE_NOT_FOUND",
                mime: "application/octet-stream",
                category: "UNKNOWN",
                isExecutable: false,
                extension: path.extname(filePath).toLowerCase(),
                filename: path.basename(filePath),
                hasDoubleExtension: false,
                isMasquerading: false,
                masqueradeReason: null,
                magicHex: ""
            };
        }

        try {
            const fd = fs.openSync(filePath, "r");
            const buffer = Buffer.alloc(4096);
            const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
            fs.closeSync(fd);
            return FileIdentifier.identify(buffer.slice(0, bytesRead), filePath);
        } catch {
            return FileIdentifier.identify(Buffer.alloc(0), filePath);
        }
    }
}

module.exports = FileIdentifier;
