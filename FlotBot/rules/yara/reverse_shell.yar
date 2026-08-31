rule Reverse_Shell_Payload
{
    meta:
        description = "Detects interactive reverse shell commands and socket redirects in scripts or memory"
        author = "FloatBot Security Research"
        severity = "CRITICAL"
        mitre = "T1059"
        version = "1.0"

    strings:
        $sh1 = "/bin/sh -i >& /dev/tcp/"
        $sh2 = "/bin/bash -i >& /dev/tcp/"
        $nc1 = "nc -e /bin/sh" nocase
        $nc2 = "nc -e /bin/bash" nocase
        $nc3 = "nc.exe -e cmd.exe" nocase
        $ncat = "ncat -e /bin/sh" nocase
        $py1 = "socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect"
        $ps1 = "New-Object System.Net.Sockets.TCPClient" nocase
        $ps2 = "Invoke-Expression -Command (New-Object Net.WebClient).DownloadString" nocase

    condition:
        any of them
}
