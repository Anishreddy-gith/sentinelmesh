import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from graph_builder import build_graph, serialise_graph

def test_build_empty():
    G = build_graph([])
    assert G.number_of_nodes() == 0

def test_build_single_edge():
    events = [{'src_ip': '192.168.1.1', 'dst_ip': '10.0.0.5', 'bytes_sent': 1024, 'alert_flag': False}]
    G = build_graph(events)
    assert G.number_of_nodes() == 2
    assert G.number_of_edges() == 1

def test_serialise():
    events = [{'src_ip': '10.0.0.1', 'dst_ip': '10.0.0.2', 'bytes_sent': 512, 'alert_flag': True}]
    G = build_graph(events)
    snap = serialise_graph(G)
    assert 'nodes' in snap
    assert 'edges' in snap
    assert snap['edges'][0]['alerts'] == 1
