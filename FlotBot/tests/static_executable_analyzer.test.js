const StaticExecutableAnalyzer = require("../core/fileengine/StaticExecutableAnalyzer");

describe("StaticExecutableAnalyzer", () => {

    test("Safely parses synthetic Windows PE header structure", () => {
        const peBuf = Buffer.alloc(1024);
        // DOS Header
        peBuf[0] = 0x4D; peBuf[1] = 0x5A; // MZ
        peBuf.writeUInt32LE(0x80, 0x3C);  // e_lfanew = 0x80

        // PE Signature
        peBuf.writeUInt32LE(0x00004550, 0x80); // PE\0\0

        // COFF Header (offset 0x84)
        peBuf.writeUInt16LE(0x8664, 0x84); // Machine = AMD64
        peBuf.writeUInt16LE(2, 0x86);      // NumberOfSections = 2
        peBuf.writeUInt32LE(1700000000, 0x88); // TimeDateStamp
        peBuf.writeUInt16LE(240, 0x94);    // SizeOfOptionalHeader = 240
        peBuf.writeUInt16LE(0x0022, 0x96); // Characteristics = EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE

        // Optional Header (offset 0x98)
        peBuf.writeUInt16LE(0x020B, 0x98); // Magic = PE32+ (64-bit)
        peBuf.writeUInt32LE(0x1000, 0x98 + 16); // EntryPoint = 0x1000
        peBuf.writeUInt16LE(3, 0x98 + 68);      // Subsystem = Console
        peBuf.writeUInt16LE(0x0140, 0x98 + 70); // DllCharacteristics = ASLR | DEP

        // Section 1 (.text) offset = 0x98 + 240 = 0x188
        const sec1Off = 0x188;
        Buffer.from(".text\0\0\0").copy(peBuf, sec1Off);
        peBuf.writeUInt32LE(0x500, sec1Off + 8);   // VirtualSize
        peBuf.writeUInt32LE(0x1000, sec1Off + 12); // VirtualAddress
        peBuf.writeUInt32LE(0x400, sec1Off + 16);  // SizeOfRawData
        peBuf.writeUInt32LE(0x200, sec1Off + 20);  // PointerToRawData
        peBuf.writeUInt32LE(0x60000020, sec1Off + 36); // Characteristics = CODE | EXECUTE | READ

        const result = StaticExecutableAnalyzer.analyze(peBuf);
        expect(result.isBinary).toBe(true);
        expect(result.format).toBe("PE_EXECUTABLE");
        expect(result.architecture).toContain("AMD64");
        expect(result.is64Bit).toBe(true);
        expect(result.mitigations.aslr).toBe(true);
        expect(result.mitigations.dep_nx).toBe(true);
        expect(result.sectionCount).toBe(2);
        expect(result.sections[0].name).toBe(".text");
        expect(result.sections[0].isExecutable).toBe(true);
    });

    test("Safely parses synthetic Linux ELF 64-bit header", () => {
        const elfBuf = Buffer.alloc(512);
        // \x7fELF
        elfBuf[0] = 0x7F; elfBuf[1] = 0x45; elfBuf[2] = 0x4C; elfBuf[3] = 0x46;
        elfBuf[4] = 2; // ELFCLASS64
        elfBuf[5] = 1; // ELFDATA2LSB (Little Endian)
        elfBuf[6] = 1; // EV_CURRENT

        elfBuf.writeUInt16LE(2, 16);    // e_type = ET_EXEC
        elfBuf.writeUInt16LE(0x3E, 18); // e_machine = AMD64 (x86_64)
        elfBuf.writeBigUInt64LE(0x401000n, 24); // e_entry = 0x401000

        const result = StaticExecutableAnalyzer.analyze(elfBuf);
        expect(result.isBinary).toBe(true);
        expect(result.format).toBe("ELF_BINARY");
        expect(result.architecture).toContain("AMD64");
        expect(result.is64Bit).toBe(true);
        expect(result.elfType).toContain("EXEC");
        expect(result.entryPoint).toBe("0x401000");
    });

    test("Safely parses synthetic macOS Mach-O 64-bit header", () => {
        const machBuf = Buffer.alloc(512);
        // Magic 0xFEEDFACF (64-bit Mach-O BE)
        machBuf.writeUInt32BE(0xFEEDFACF, 0);
        machBuf.writeUInt32BE(0x0100000C, 4); // CPU Type = ARM64
        machBuf.writeUInt32BE(2, 12);          // FileType = EXECUTE
        machBuf.writeUInt32BE(1, 16);          // ncmds = 1

        const result = StaticExecutableAnalyzer.analyze(machBuf);
        expect(result.isBinary).toBe(true);
        expect(result.format).toBe("MACHO_64");
        expect(result.architecture).toContain("ARM64");
        expect(result.machOType).toBe("EXECUTE (Executable)");
    });

});
