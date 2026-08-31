rule Generic_Webshell_PHP_JSP
{
    meta:
        description = "Detects web shells executing system commands via HTTP requests"
        author = "FloatBot Security Research"
        severity = "HIGH"
        mitre = "T1505.003"
        version = "1.0"

    strings:
        $php1 = "passthru($_POST" nocase
        $php2 = "shell_exec($_GET" nocase
        $php3 = "eval(base64_decode($_POST" nocase
        $jsp1 = "Runtime.getRuntime().exec(request.getParameter"
        $jsp2 = "ProcessBuilder" nocase

    condition:
        any of them
}
