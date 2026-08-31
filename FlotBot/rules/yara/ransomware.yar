rule Ransomware_Note_And_Extension
{
    meta:
        description = "Detects generic ransomware ransom notes, encryption markers, and shadow copy deletion"
        author = "FloatBot Security Research"
        severity = "CRITICAL"
        mitre = "T1486"
        version = "1.0"

    strings:
        $s1 = "your files have been encrypted" nocase
        $s2 = "your personal files are encrypted" nocase
        $s3 = "pay bitcoin to the following address" nocase
        $s4 = "vssadmin.exe delete shadows /all /quiet" nocase
        $s5 = "wmic shadowcopy delete" nocase
        $s6 = "bcdedit /set {default} bootstatuspolicy ignoreallfailures" nocase
        $s7 = "bcdedit /set {default} recoveryenabled no" nocase
        $s8 = ".locked" nocase
        $s9 = ".crypted" nocase

    condition:
        2 of them
}
