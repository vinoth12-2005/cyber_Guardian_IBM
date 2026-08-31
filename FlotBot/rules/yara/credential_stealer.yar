rule InfoStealer_Credential_Exfiltration
{
    meta:
        description = "Detects credential harvesters, webhook exfiltration endpoints, and browser token stealers"
        author = "FloatBot Security Research"
        severity = "CRITICAL"
        mitre = "T1555"
        version = "1.0"

    strings:
        $dc1 = "discord.com/api/webhooks/" nocase
        $dc2 = "discordapp.com/api/webhooks/" nocase
        $tg1 = "api.telegram.org/bot" nocase
        $pass1 = "Login Data" nocase
        $pass2 = "Web Data" nocase
        $pass3 = "Cookies" nocase
        $api1 = "CryptUnprotectData" nocase

    condition:
        ($dc1 or $dc2 or $tg1) and ($pass1 or $pass2 or $pass3 or $api1)
}
