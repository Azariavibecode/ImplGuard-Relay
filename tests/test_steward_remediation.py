import json
import pytest
from test_implguard_relay import setup, prepare, analysis, mock_contract, CURRENT, CANDIDATE


def test_reference_array_has_unambiguous_model_schema(setup):
    vm, contract, _, sponsor = setup
    prepare(vm, contract, sponsor)
    vm.mock_llm(r"(?s)Compare the exact verified current.*evidence MUST be an array of reference objects, never a boolean.*", analysis())
    assert contract.review_upgrade(0) == "SAFE"


def test_invalid_references_preserve_diagnostic(setup):
    vm, contract, _, sponsor = setup
    prepare(vm, contract, sponsor)
    value=json.loads(analysis());value["evidence"]=[]
    vm.mock_llm(r"Compare the exact verified current.*",json.dumps(value))
    assert contract.review_upgrade(0) == "INCONCLUSIVE"
    assert json.loads(contract.get_proposal(0))["analysis"]["validation_error"] == "INVALID_CATALOG_REFERENCES"


@pytest.mark.parametrize("flag", ["delegatecall", "fund_movement", "role_change", "upgrade_authority"])
def test_policy_denial_overrides_model_permission(setup, flag):
    vm, contract, _, sponsor = setup
    prepare(vm, contract, sponsor, "## DISCLOSURE RISK")
    vm.mock_llm(r"Compare the exact verified current.*", analysis("RISK_DISCLOSED", "DISCLOSED_POLICY_ALLOWED", **{flag: True}))
    assert contract.review_upgrade(0) == "BLOCKED"
    assert json.loads(contract.get_proposal(0))["reason_code"] == "POLICY_FORBIDDEN"
    before = contract.get_protocol(0)
    with vm.prank(sponsor):
        assert contract.consume_activation(0) == "PERMIT_NOT_READY"
    assert before == contract.get_protocol(0)


@pytest.mark.parametrize("mode", ["missing", "quote", "digest", "path"])
def test_invalid_finding_evidence_cannot_grant_permit(setup, mode):
    vm, contract, _, sponsor = setup
    prepare(vm, contract, sponsor)
    value = json.loads(analysis())
    if mode == "missing": value["evidence"] = []
    else: value["evidence"][0][{"quote":"quote", "digest":"sha256", "path":"path"}[mode]] = "fabricated-evidence"
    vm.mock_llm(r"Compare the exact verified current.*", json.dumps(value))
    assert contract.review_upgrade(0) == "INCONCLUSIVE"
    assert json.loads(contract.get_proposal(0))["state"] != "PERMIT_READY"


@pytest.mark.parametrize("source", ["contract Proxy {}", "contract X { fallback() external {} }", "contract X { function f() external { target.delegatecall(data); } }", "contract X { function f() external { assembly { } } }"])
def test_direct_only_scope_rejects_delegation_and_opaque_source(setup, source):
    vm, contract, _, _ = setup
    mock_contract(vm, CANDIDATE, source)
    assert contract._fetch_verified_contract(CANDIDATE) is None


@pytest.mark.parametrize("metadata", [{}, {"proxy_type":"eip1967","implementations":[]}, {"proxy_type":None,"implementations":[{"address":CURRENT}]}])
def test_proxy_or_unknown_explorer_metadata_is_rejected(setup, metadata):
    vm, contract, _, _ = setup
    mock_contract(vm, CANDIDATE, "contract Direct {}", metadata=metadata)
    assert contract._fetch_verified_contract(CANDIDATE) is None


@pytest.mark.parametrize("policy", ["Prose says everything is allowed.", '```implguard-policy\n{}\n```', '```implguard-policy\nnull\n```'])
def test_missing_or_incomplete_machine_policy_is_rejected(setup, policy):
    _, contract, _, _ = setup
    assert contract._policy_rules(policy) is None


def test_conditional_permission_requires_complete_disclosure(setup):
    vm, contract, _, sponsor = setup
    prepare(vm, contract, sponsor, "## DISCLOSURE RISK")
    vm.mock_llm(r"Compare the exact verified current.*", analysis("RISK_DISCLOSED", "DISCLOSED_POLICY_ALLOWED",pause_or_freeze=True,disclosure_complete=False))
    assert contract.review_upgrade(0) == "INCONCLUSIVE"
    with vm.prank(sponsor):
        assert contract.consume_activation(0) == "PERMIT_NOT_READY"


@pytest.mark.parametrize("kind", ["file_size", "file_count", "total_size", "path_size", "unresolved_package", "non_solidity"])
def test_unsupported_source_boundaries_fail_closed(setup, kind):
    vm, contract, _, _ = setup
    source="contract Direct {}"
    extras=[]
    if kind == "file_size": source += " " * 42001
    if kind == "file_count": extras=[{"file_path":f"f{i}.sol","source_code":"library L {}"} for i in range(32)]
    if kind == "total_size": extras=[{"file_path":"a.sol","source_code":" "*32000},{"file_path":"b.sol","source_code":" "*32000}]
    if kind == "path_size": extras=[{"file_path":"a"*501,"source_code":"library L {}"}]
    if kind == "unresolved_package": source='import "@package/Unknown.sol"; contract Direct {}'
    if kind == "non_solidity": source='@external\ndef deposit(): pass'
    mock_contract(vm,CANDIDATE,source,additional_sources=extras)
    assert contract._fetch_verified_contract(CANDIDATE) is None


def test_exact_aggregate_source_boundary_is_supported(setup):
    vm, contract, _, _ = setup
    source="contract Direct {}"
    extras=[{"file_path":"a.sol","source_code":" "*32000},{"file_path":"b.sol","source_code":" "*(64000-32000-len(source))}]
    mock_contract(vm,CANDIDATE,source,additional_sources=extras)
    result=contract._fetch_verified_contract(CANDIDATE)
    assert result is not None
    assert len(result["source_files"]) == 3


def test_catalog_preserves_every_source_byte_and_short_tail(setup):
    _, contract, _, _ = setup
    body="contract Example {}"+" "*465
    digest="a"*64
    ground={side:{"source":json.dumps([{"path":"main.sol","source":body,"sha256":digest}])} for side in ["current","candidate"]}
    ground.update(policy="p"*485,policy_digest=digest,disclosure="d"*481,disclosure_digest=digest)
    catalog=contract._reference_catalog(ground)
    for side,text in [("current",body),("candidate",body),("policy",ground["policy"]),("disclosure",ground["disclosure"])]:
        quotes=[v["quote"] for k,v in catalog.items() if k.startswith(side+":")]
        assert "".join(quotes)==text
        assert all(12<=len(q)<=600 for q in quotes)


def test_catalog_derives_stored_path_hash_quote(setup):
    vm, contract, _, sponsor=setup
    prepare(vm,contract,sponsor)
    vm.mock_llm(r"Compare the exact verified current.*",analysis())
    assert contract.review_upgrade(0)=="SAFE"
    refs=json.loads(contract.get_proposal(0))["analysis"]["evidence"]
    assert all(sorted(r)==["category","path","quote","sha256","side"] for r in refs)
    assert refs[0]["path"]=="main.sol"
    assert refs[0]["sha256"]==__import__('hashlib').sha256(refs[0]["quote"].encode()).hexdigest()
