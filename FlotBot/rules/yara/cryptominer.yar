rule CryptoMiner_Mining_Config
{
    meta:
        description = "Detects cryptocurrency miners, stratum mining protocols, and known miner configurations"
        author = "FloatBot Security Research"
        severity = "HIGH"
        mitre = "T1496"
        version = "1.0"

    strings:
        $s1 = "stratum+tcp://" nocase
        $s2 = "stratum+ssl://" nocase
        $s3 = "stratum2+tcp://" nocase
        $m1 = "xmrig" nocase
        $m2 = "minerd" nocase
        $m3 = "cryptonight" nocase
        $m4 = "randomx" nocase

    condition:
        ($s1 or $s2 or $s3) or ($m1 and ($m3 or $m4))
}
