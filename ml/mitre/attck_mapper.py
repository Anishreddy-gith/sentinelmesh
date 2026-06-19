"""
MITRE ATT&CK Technique Mapper.
Maps alert text/type to ATT&CK technique IDs.
Extend with PyATTACK library for full 400+ technique coverage.
"""
TECHNIQUE_LOOKUP = {
    'pass-the-hash':      {'id': 'T1550.002', 'tactic': 'Lateral Movement',    'name': 'Pass the Hash'},
    'smb':                {'id': 'T1021.002', 'tactic': 'Lateral Movement',    'name': 'SMB/Windows Admin Shares'},
    'beacon':             {'id': 'T1071.001', 'tactic': 'Command and Control', 'name': 'Web Protocols'},
    'credential dump':    {'id': 'T1003',     'tactic': 'Credential Access',   'name': 'OS Credential Dumping'},
    'powershell':         {'id': 'T1059.001', 'tactic': 'Execution',           'name': 'PowerShell'},
    'dns tunnel':         {'id': 'T1071.004', 'tactic': 'Command and Control', 'name': 'DNS'},
    'wmi':                {'id': 'T1047',     'tactic': 'Execution',           'name': 'Windows Management Instrumentation'},
    'rdp':                {'id': 'T1021.001', 'tactic': 'Lateral Movement',    'name': 'Remote Desktop Protocol'},
    'port scan':          {'id': 'T1046',     'tactic': 'Discovery',           'name': 'Network Service Discovery'},
    'data exfiltration':  {'id': 'T1041',     'tactic': 'Exfiltration',        'name': 'Exfiltration Over C2 Channel'},
    'privilege escalation':{'id':'T1068',     'tactic': 'Privilege Escalation','name': 'Exploitation for Privilege Escalation'},
}

def map_alert_to_technique(alert_text: str) -> dict:
    alert_lower = alert_text.lower()
    for keyword, technique in TECHNIQUE_LOOKUP.items():
        if keyword in alert_lower:
            return technique
    return {'id': 'T0000', 'tactic': 'Unknown', 'name': 'Unmapped — manual review required'}

def enrich_alert(alert: dict) -> dict:
    technique = map_alert_to_technique(
        alert.get('suricata_category', '') + ' ' + alert.get('alert_type', '')
    )
    alert['mitre_technique_id'] = technique['id']
    alert['mitre_tactic'] = technique['tactic']
    alert['mitre_technique_name'] = technique['name']
    return alert
