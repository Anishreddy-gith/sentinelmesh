import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from zeek_producer import parse_conn_log_line

def test_skip_comment():
    assert parse_conn_log_line('#separator \\x09') is None

def test_skip_short_line():
    assert parse_conn_log_line('1700000000\tConn') is None

def test_parse_valid_line():
    line = '1700000000.000\tConn\t192.168.1.10\t12345\t10.0.0.5\t445\ttcp\t-\t3.5\t1024\t2048\n'
    result = parse_conn_log_line(line)
    assert result is not None
    assert result['src_ip'] == '192.168.1.10'
    assert result['dst_ip'] == '10.0.0.5'
    assert result['protocol'] == 'tcp'
    assert result['source'] == 'zeek'
