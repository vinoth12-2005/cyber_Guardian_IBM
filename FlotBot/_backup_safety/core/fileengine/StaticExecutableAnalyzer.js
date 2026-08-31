const EntropyCalculator = require("./EntropyCalculator");

/**
 * StaticExecutableAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Cross-platform static binary analyzer for Windows PE, macOS Mach-O,
 * and Linux ELF executables.
 *
 * Rules:
 *   - NEVER execute the binary.
 *   - Parse headers, sections, segments, imports, exports, and metadata.
 *   - Calculate section-level entropy to spot packed or encrypted payloads.
 *   - Detect dangerous attributes (e.g. Writable + Executable sections,
 *     executable stacks, suspicious packers, missing ASLR/DEP).
 */
class StaticExecutableAnalyzer {

    /**
     * Analyze an executable buffer based on its detected format.
     * @param {Buffer} buffer
     * @param {string} [formatHint] - "PE_EXECUTABLE" | "ELF_BINARY" | "MACHO_64" | etc.
     * @returns {object} Static binary analysis results
     */
    static analyze(buffer, formatHint = "") {
        if (!buffer || buffer.length < 16) {
            return { isBinary: false, format: "UNKNOWN", error: "Buffer too small" };
        }

        // 1. Check PE (Windows)
        if (buffer.length >= 64 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
            return StaticExecutableAnalyzer.analyzePE(buffer);
        }

        // 2. Check ELF (Linux)
        if (buffer.length >= 52 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
            return StaticExecutableAnalyzer.analyzeELF(buffer);
        }

        // 3. Check Mach-O (macOS)
        if (buffer.length >= 32 && (
            (buffer[0] === 0xFE && buffer[1] === 0xED && buffer[2] === 0xFA && (buffer[3] === 0xCF || buffer[3] === 0xCE)) ||
            (buffer[0] === 0xCF && buffer[1] === 0xFA && buffer[2] === 0xED && buffer[3] === 0xFE) ||
            (buffer[0] === 0xCE && buffer[1] === 0xFA && buffer[2] === 0xED && buffer[3] === 0xFE) ||
            (buffer[0] === 0xCA && buffer[1] === 0xFE && buffer[2] === 0xBA && buffer[3] === 0xBE)
        )) {
            return StaticExecutableAnalyzer.analyzeMachO(buffer);
        }

        return {
            isBinary: false,
            format: "NON_EXECUTABLE_BINARY",
            entropy: EntropyCalculator.calculate(buffer)
        };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 1. WINDOWS PE ANALYZER
    // ═════════════════════════════════════════════════════════════════════════

    static analyzePE(buffer) {
        try {
            if (buffer.length < 64) return { isBinary: true, format: "PE", valid: false };

            const peOffset = buffer.readUInt32LE(0x3C);
            if (peOffset + 24 > buffer.length) {
                return { isBinary: true, format: "PE", valid: false, error: "Corrupted PE offset" };
            }

            // Verify PE Signature "PE\0\0"
            const peSig = buffer.readUInt32LE(peOffset);
            if (peSig !== 0x00004550) {
                return { isBinary: true, format: "PE_DOS_ONLY", valid: false };
            }

            const coffOffset = peOffset + 4;
            const machine = buffer.readUInt16LE(coffOffset);
            const numberOfSections = buffer.readUInt16LE(coffOffset + 2);
            const timeDateStamp = buffer.readUInt32LE(coffOffset + 4);
            const sizeOfOptionalHeader = buffer.readUInt16LE(coffOffset + 16);
            const characteristics = buffer.readUInt16LE(coffOffset + 18);

            const is64Bit = machine === 0x8664 || machine === 0xAA64;
            const machineName = machine === 0x8664 ? "AMD64 (x64)" : machine === 0x014c ? "i386 (x86)" : machine === 0xAA64 ? "ARM64" : `0x${machine.toString(16)}`;

            // Optional Header
            const optOffset = coffOffset + 20;
            let entryPoint = 0;
            let imageBase = 0;
            let subsystem = 0;
            let dllCharacteristics = 0;
            let hasSecurityDirectory = false;
            let importTableRVA = 0;
            let importTableSize = 0;
            let exportTableRVA = 0;

            if (sizeOfOptionalHeader > 0 && optOffset + sizeOfOptionalHeader <= buffer.length) {
                const optMagic = buffer.readUInt16LE(optOffset);
                entryPoint = buffer.readUInt32LE(optOffset + 16);
                
                if (optMagic === 0x20B) { // PE32+ (64-bit)
                    imageBase = Number(buffer.readBigUInt64LE(optOffset + 24));
                    subsystem = buffer.readUInt16LE(optOffset + 68);
                    dllCharacteristics = buffer.readUInt16LE(optOffset + 70);
                    // Data Directories (offset 112 from optional header)
                    if (optOffset + 120 <= buffer.length) {
                        exportTableRVA = buffer.readUInt32LE(optOffset + 112);
                        importTableRVA = buffer.readUInt32LE(optOffset + 120);
                        importTableSize = buffer.readUInt32LE(optOffset + 124);
                    }
                    if (optOffset + 152 <= buffer.length) {
                        const secDirRVA = buffer.readUInt32LE(optOffset + 144);
                        const secDirSize = buffer.readUInt32LE(optOffset + 148);
                        hasSecurityDirectory = secDirRVA > 0 && secDirSize > 0;
                    }
                } else { // PE32 (32-bit)
                    imageBase = buffer.readUInt32LE(optOffset + 28);
                    subsystem = buffer.readUInt16LE(optOffset + 68);
                    dllCharacteristics = buffer.readUInt16LE(optOffset + 70);
                    if (optOffset + 104 <= buffer.length) {
                        exportTableRVA = buffer.readUInt32LE(optOffset + 96);
                        importTableRVA = buffer.readUInt32LE(optOffset + 104);
                        importTableSize = buffer.readUInt32LE(optOffset + 108);
                    }
                    if (optOffset + 136 <= buffer.length) {
                        const secDirRVA = buffer.readUInt32LE(optOffset + 128);
                        const secDirSize = buffer.readUInt32LE(optOffset + 132);
                        hasSecurityDirectory = secDirRVA > 0 && secDirSize > 0;
                    }
                }
            }

            // Security Mitigations
            const hasASLR = !!(dllCharacteristics & 0x0040);
            const hasDEP = !!(dllCharacteristics & 0x0100);
            const hasCFG = !!(dllCharacteristics & 0x4000);
            const hasNoSEH = !!(dllCharacteristics & 0x0400);

            // Parse Section Table
            const sectionTableOffset = optOffset + sizeOfOptionalHeader;
            const sections = [];
            const suspiciousPackers = [];
            let hasWritableAndExecutableSection = false;

            const KNOWN_PACKER_SECTIONS = [
                "UPX0", "UPX1", "UPX2", ".upx", ".vmp", ".themida", ".aspack",
                ".petite", ".pack", ".mpress", ".enigma", ".fsg", ".mew", ".pecompact"
            ];

            for (let i = 0; i < Math.min(numberOfSections, 64); i++) {
                const sOffset = sectionTableOffset + (i * 40);
                if (sOffset + 40 > buffer.length) break;

                const nameRaw = buffer.slice(sOffset, sOffset + 8);
                const nullIdx = nameRaw.indexOf(0);
                const name = (nullIdx !== -1 ? nameRaw.slice(0, nullIdx) : nameRaw).toString("ascii").trim();

                const virtualSize = buffer.readUInt32LE(sOffset + 8);
                const virtualAddress = buffer.readUInt32LE(sOffset + 12);
                const sizeOfRawData = buffer.readUInt32LE(sOffset + 16);
                const pointerToRawData = buffer.readUInt32LE(sOffset + 20);
                const secCharacteristics = buffer.readUInt32LE(sOffset + 36);

                const isExecutable = !!(secCharacteristics & 0x20000000);
                const isReadable = !!(secCharacteristics & 0x40000000);
                const isWritable = !!(secCharacteristics & 0x80000000);

                if (isWritable && isExecutable) {
                    hasWritableAndExecutableSection = true;
                }

                // Section Entropy
                let secEntropy = 0;
                if (pointerToRawData + sizeOfRawData <= buffer.length && sizeOfRawData > 0) {
                    secEntropy = EntropyCalculator.calculate(buffer.slice(pointerToRawData, pointerToRawData + sizeOfRawData));
                }

                // Check known packer section names
                for (const pName of KNOWN_PACKER_SECTIONS) {
                    if (name.toLowerCase().includes(pName.toLowerCase())) {
                        if (!suspiciousPackers.includes(pName.toUpperCase())) {
                            suspiciousPackers.push(pName.toUpperCase());
                        }
                    }
                }

                sections.push({
                    name,
                    virtualSize,
                    virtualAddress,
                    sizeOfRawData,
                    pointerToRawData,
                    entropy: secEntropy,
                    isExecutable,
                    isReadable,
                    isWritable,
                    isHighEntropy: secEntropy > 7.3
                });
            }

            // Extract Imported Libraries (Helper RVA to Raw)
            const rvaToOffset = (rva) => {
                for (const s of sections) {
                    if (rva >= s.virtualAddress && rva < s.virtualAddress + Math.max(s.virtualSize, s.sizeOfRawData)) {
                        return s.pointerToRawData + (rva - s.virtualAddress);
                    }
                }
                return null;
            };

            const imports = [];
            if (importTableRVA > 0) {
                let descOffset = rvaToOffset(importTableRVA);
                if (descOffset && descOffset + 20 <= buffer.length) {
                    for (let i = 0; i < 64; i++) {
                        if (descOffset + 20 > buffer.length) break;
                        const originalFirstThunk = buffer.readUInt32LE(descOffset);
                        const nameRVA = buffer.readUInt32LE(descOffset + 12);
                        const firstThunk = buffer.readUInt32LE(descOffset + 16);

                        if (originalFirstThunk === 0 && nameRVA === 0 && firstThunk === 0) break; // End of descriptor table

                        const nameFileOffset = rvaToOffset(nameRVA);
                        if (nameFileOffset && nameFileOffset < buffer.length) {
                            let dllName = "";
                            for (let c = nameFileOffset; c < Math.min(buffer.length, nameFileOffset + 128); c++) {
                                if (buffer[c] === 0) break;
                                dllName += String.fromCharCode(buffer[c]);
                            }
                            if (dllName) imports.push(dllName);
                        }

                        descOffset += 20;
                    }
                }
            }

            return {
                isBinary: true,
                format: "PE_EXECUTABLE",
                architecture: machineName,
                is64Bit,
                timestamp: timeDateStamp ? new Date(timeDateStamp * 1000).toISOString() : null,
                entryPoint: `0x${entryPoint.toString(16)}`,
                imageBase: `0x${imageBase.toString(16)}`,
                subsystem: subsystem === 2 ? "GUI (Windows)" : subsystem === 3 ? "Console (CUI)" : subsystem === 1 ? "Driver (Native)" : `Unknown (${subsystem})`,
                mitigations: {
                    aslr: hasASLR,
                    dep_nx: hasDEP,
                    cfg: hasCFG,
                    no_seh: hasNoSEH
                },
                hasDigitalSignatureDirectory: hasSecurityDirectory,
                hasWritableAndExecutableSection,
                suspiciousPackers,
                sectionCount: sections.length,
                sections,
                importedLibraries: imports,
                overallEntropy: EntropyCalculator.calculate(buffer)
            };

        } catch (err) {
            return {
                isBinary: true,
                format: "PE_EXECUTABLE",
                valid: false,
                error: `PE parse error: ${err.message}`
            };
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. LINUX ELF ANALYZER
    // ═════════════════════════════════════════════════════════════════════════

    static analyzeELF(buffer) {
        try {
            if (buffer.length < 52) return { isBinary: true, format: "ELF", valid: false };

            const is64Bit = buffer[4] === 2; // ELFCLASS64
            const isLittleEndian = buffer[5] === 1; // ELFDATA2LSB

            const read16 = (off) => isLittleEndian ? buffer.readUInt16LE(off) : buffer.readUInt16BE(off);
            const read32 = (off) => isLittleEndian ? buffer.readUInt32LE(off) : buffer.readUInt32BE(off);
            const read64 = (off) => {
                if (isLittleEndian) return Number(buffer.readBigUInt64LE(off));
                return Number(buffer.readBigUInt64BE(off));
            };

            const elfType = read16(16);
            const machine = read16(18);

            const machineMap = {
                0x03: "i386 (x86)",
                0x3E: "AMD64 (x86_64)",
                0x28: "ARM",
                0xB7: "AArch64 (ARM64)",
                0xF3: "RISC-V"
            };
            const machineName = machineMap[machine] || `0x${machine.toString(16)}`;

            const typeMap = {
                1: "REL (Relocatable object)",
                2: "EXEC (Executable binary)",
                3: "DYN (Shared object / PIE Executable)",
                4: "CORE (Core dump)"
            };
            const typeName = typeMap[elfType] || `Type ${elfType}`;

            const entryPoint = is64Bit ? read64(24) : read32(24);
            const phOff = is64Bit ? read64(32) : read32(28);
            const shOff = is64Bit ? read64(40) : read32(32);
            const phNum = read16(is64Bit ? 56 : 44);
            const shNum = read16(is64Bit ? 60 : 48);
            const shStrNdx = read16(is64Bit ? 62 : 50);

            // Parse Program Headers (Segments)
            const segments = [];
            let hasExecutableStack = false;
            const phEntSize = is64Bit ? 56 : 32;

            for (let i = 0; i < Math.min(phNum, 64); i++) {
                const pOffset = phOff + (i * phEntSize);
                if (pOffset + phEntSize > buffer.length) break;

                const pType = read32(pOffset);
                const pFlags = is64Bit ? read32(pOffset + 4) : read32(pOffset + 24);

                // PT_GNU_STACK = 0x6474e551
                if (pType === 0x6474E551) {
                    if (pFlags & 0x1) { // PF_X (Executable Stack)
                        hasExecutableStack = true;
                    }
                }

                segments.push({
                    type: pType === 1 ? "PT_LOAD" : pType === 2 ? "PT_DYNAMIC" : pType === 3 ? "PT_INTERP" : `0x${pType.toString(16)}`,
                    flags: `${pFlags & 4 ? 'R' : '-'}${pFlags & 2 ? 'W' : '-'}${pFlags & 1 ? 'X' : '-'}`
                });
            }

            // Parse Section Headers
            const sections = [];
            const shEntSize = is64Bit ? 64 : 40;
            let shStrTabBuffer = null;

            // First locate .shstrtab section
            if (shStrNdx < shNum) {
                const strSecOffset = shOff + (shStrNdx * shEntSize);
                if (strSecOffset + shEntSize <= buffer.length) {
                    const strOffset = is64Bit ? read64(strSecOffset + 24) : read32(strSecOffset + 16);
                    const strSize = is64Bit ? read64(strSecOffset + 32) : read32(strSecOffset + 20);
                    if (strOffset + strSize <= buffer.length) {
                        shStrTabBuffer = buffer.slice(strOffset, strOffset + strSize);
                    }
                }
            }

            const getString = (idx) => {
                if (!shStrTabBuffer || idx >= shStrTabBuffer.length) return "";
                let s = "";
                for (let i = idx; i < shStrTabBuffer.length; i++) {
                    if (shStrTabBuffer[i] === 0) break;
                    s += String.fromCharCode(shStrTabBuffer[i]);
                }
                return s;
            };

            for (let i = 0; i < Math.min(shNum, 64); i++) {
                const sOffset = shOff + (i * shEntSize);
                if (sOffset + shEntSize > buffer.length) break;

                const nameIdx = read32(sOffset);
                const sType = read32(sOffset + 4);
                const sFlags = is64Bit ? read64(sOffset + 8) : read32(sOffset + 8);
                const sAddr = is64Bit ? read64(sOffset + 16) : read32(sOffset + 12);
                const sFileOff = is64Bit ? read64(sOffset + 24) : read32(sOffset + 16);
                const sSize = is64Bit ? read64(sOffset + 32) : read32(sOffset + 20);

                const name = getString(nameIdx);
                let secEntropy = 0;
                if (sFileOff + sSize <= buffer.length && sSize > 0) {
                    secEntropy = EntropyCalculator.calculate(buffer.slice(sFileOff, sFileOff + sSize));
                }

                sections.push({
                    name: name || `sec_${i}`,
                    type: sType === 1 ? "PROGBITS" : sType === 2 ? "SYMTAB" : sType === 3 ? "STRTAB" : sType === 11 ? "DYNSYM" : `0x${sType.toString(16)}`,
                    size: sSize,
                    address: `0x${sAddr.toString(16)}`,
                    entropy: secEntropy,
                    isExecutable: !!(sFlags & 0x4),
                    isWritable: !!(sFlags & 0x1)
                });
            }

            // Extract strings for linked library names (DT_NEEDED)
            const linkedLibraries = [];
            const strContent = buffer.toString("ascii");
            const libMatches = strContent.match(/lib[a-zA-Z0-9_\-]+\.so(\.[0-9]+)*/g);
            if (libMatches) {
                for (const lib of libMatches) {
                    if (!linkedLibraries.includes(lib) && linkedLibraries.length < 32) {
                        linkedLibraries.push(lib);
                    }
                }
            }

            return {
                isBinary: true,
                format: "ELF_BINARY",
                architecture: machineName,
                is64Bit,
                elfType: typeName,
                isPIE: elfType === 3,
                entryPoint: `0x${entryPoint.toString(16)}`,
                hasExecutableStack,
                sectionCount: sections.length,
                sections,
                segments,
                linkedLibraries,
                overallEntropy: EntropyCalculator.calculate(buffer)
            };

        } catch (err) {
            return {
                isBinary: true,
                format: "ELF_BINARY",
                valid: false,
                error: `ELF parse error: ${err.message}`
            };
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. macOS MACH-O ANALYZER
    // ═════════════════════════════════════════════════════════════════════════

    static analyzeMachO(buffer) {
        try {
            if (buffer.length < 32) return { isBinary: true, format: "MACHO", valid: false };

            const magic = buffer.readUInt32BE(0);
            const is64Bit = magic === 0xFEEDFACF || magic === 0xCFFAEDFE;
            const isFat = magic === 0xCAFEBABE || magic === 0xBEBAFECA;
            const isLittleEndian = magic === 0xCFFAEDFE || magic === 0xCEFAEDFE;

            const read32 = (off) => isLittleEndian ? buffer.readUInt32LE(off) : buffer.readUInt32BE(off);

            if (isFat) {
                const numArchs = buffer.readUInt32BE(4);
                return {
                    isBinary: true,
                    format: "MACHO_FAT_UNIVERSAL",
                    architecturesCount: numArchs,
                    isUniversalBinary: true,
                    overallEntropy: EntropyCalculator.calculate(buffer)
                };
            }

            const cpuType = read32(4);
            const fileType = read32(12);
            const numCmds = read32(16);

            const cpuMap = {
                7: "x86 (32-bit)",
                0x01000007: "x86_64",
                12: "ARM (32-bit)",
                0x0100000C: "ARM64 (Apple Silicon)"
            };
            const architecture = cpuMap[cpuType] || `CPU 0x${cpuType.toString(16)}`;

            const fileTypeMap = {
                1: "OBJECT",
                2: "EXECUTE (Executable)",
                6: "DYLIB (Dynamic Library)",
                8: "BUNDLE"
            };
            const machOType = fileTypeMap[fileType] || `Type ${fileType}`;

            // Parse Load Commands
            let cmdOffset = is64Bit ? 32 : 28;
            const loadCommands = [];
            const linkedDylibs = [];
            let hasCodeSignature = false;

            for (let i = 0; i < Math.min(numCmds, 64); i++) {
                if (cmdOffset + 8 > buffer.length) break;

                const cmd = read32(cmdOffset);
                const cmdSize = read32(cmdOffset + 4);
                if (cmdSize === 0 || cmdOffset + cmdSize > buffer.length) break;

                // LC_CODE_SIGNATURE = 0x1D
                if (cmd === 0x1D) {
                    hasCodeSignature = true;
                    loadCommands.push({ cmd: "LC_CODE_SIGNATURE", size: cmdSize });
                } else if (cmd === 0x0C || cmd === 0x18) { // LC_LOAD_DYLIB / LC_LOAD_WEAK_DYLIB
                    const strOff = read32(cmdOffset + 8);
                    if (strOff < cmdSize) {
                        let dylibPath = "";
                        for (let c = cmdOffset + strOff; c < cmdOffset + cmdSize; c++) {
                            if (buffer[c] === 0) break;
                            dylibPath += String.fromCharCode(buffer[c]);
                        }
                        if (dylibPath) linkedDylibs.push(dylibPath);
                    }
                    loadCommands.push({ cmd: "LC_LOAD_DYLIB", size: cmdSize });
                } else if (cmd === 0x19) { // LC_SEGMENT_64
                    const segName = buffer.slice(cmdOffset + 8, cmdOffset + 24).toString("ascii").replace(/\0/g, "").trim();
                    loadCommands.push({ cmd: "LC_SEGMENT_64", name: segName, size: cmdSize });
                } else {
                    loadCommands.push({ cmd: `0x${cmd.toString(16)}`, size: cmdSize });
                }

                cmdOffset += cmdSize;
            }

            return {
                isBinary: true,
                format: is64Bit ? "MACHO_64" : "MACHO_32",
                architecture,
                is64Bit,
                machOType,
                hasCodeSignature,
                loadCommandsCount: numCmds,
                loadCommands,
                linkedDylibs,
                overallEntropy: EntropyCalculator.calculate(buffer)
            };

        } catch (err) {
            return {
                isBinary: true,
                format: "MACHO",
                valid: false,
                error: `Mach-O parse error: ${err.message}`
            };
        }
    }
}

module.exports = StaticExecutableAnalyzer;
