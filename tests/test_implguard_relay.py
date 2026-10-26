import hashlib
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]
OWNER, REPO = "FixtureOrg", "ImplGuardRelay"
COMMIT, TREE = "1" * 40, "a" * 40
PATH = "/fixtures/upgrade-evidence.md"
BODY = (ROOT / PATH[1:]).read_bytes()
CURRENT = "0x" + "2" * 40
CANDIDATE = "0x" + "3" * 40
CURRENT_SOURCE = "contract V1 { function deposit(uint256 amount) external {} }"
CANDIDATE_SOURCE = "contract V2 { function deposit(uint256 amount) external {} function withdraw(uint256 amount) external {} }"

def sha(body): return hashlib.sha256(body).hexdigest()
def blob(body): return hashlib.sha1((f"blob {len(body)}\0").encode() + body).hexdigest()
def descriptor(marker): return json.dumps({"owner":OWNER,"repo":REPO,"commit":COMMIT,"path":PATH,"digest":sha(BODY),"marker":marker})

def mock_github(vm):
    api=f"https://api.github.com/repos/{OWNER}/{REPO}"
    vm.mock_web((api+"/git/commits/"+COMMIT).replace(".",r"\.")+"$",{"status":200,"body":json.dumps({"sha":COMMIT,"tree":{"sha":TREE}}).encode()})
    vm.mock_web((api+"/git/trees/"+TREE+r"\?recursive=1$").replace(".",r"\."),{"status":200,"body":json.dumps({"truncated":False,"tree":[{"path":PATH[1:],"type":"blob","mode":"100644","size":len(BODY),"sha":blob(BODY)}]}).encode()})
    raw=f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{COMMIT}{PATH}"
    vm.mock_web(raw.replace(".",r"\.")+"$",{"status":200,"body":BODY})

def mock_contract(vm,address,source,verified=True,additional_sources=None,file_path="main.sol",metadata=None):
    identity={"hash":address,"is_contract":True,**({"proxy_type":None,"implementations":[]} if metadata is None else metadata)}
    vm.mock_web(("https://eth.blockscout.com/api/v2/addresses/"+address).replace(".",r"\.")+"$",{"status":200,"body":json.dumps(identity).encode()})
    abi=[{"type":"function","name":"deposit","inputs":[{"name":"amount","type":"uint256"}],"stateMutability":"nonpayable"}]
    if address==CANDIDATE: abi.append({"type":"function","name":"withdraw","inputs":[{"name":"amount","type":"uint256"}],"stateMutability":"nonpayable"})
    vm.mock_web(("https://eth.blockscout.com/api/v2/smart-contracts/"+address).replace(".",r"\.")+"$",{"status":200,"body":json.dumps({"is_verified":verified,"source_code":source,"file_path":file_path,"additional_sources":additional_sources or [],"abi":abi}).encode()})

def analysis(verdict="SAFE",reason="NO_PRIVILEGE_EXPANSION",**changes):
    item={"proposal_id":0,"storage_write_expansion":False,"role_change":False,"fund_movement":False,"mint_or_burn":False,"pause_or_freeze":False,"upgrade_authority":False,"delegatecall":False,"external_call_expansion":False,"disclosure_complete":True,"unknown_effect":False,"verdict":verdict,"reason_code":reason}
    item.update(changes)
    def ref(category,side,path,body):
        return {"category":category,"ref":side+":0"}
    policy=BODY.decode().split("## POLICY",1)[1].split("\n## ",1)[0]
    policy="## POLICY"+policy.rstrip()
    marker="## DISCLOSURE RISK" if item["disclosure_complete"] and verdict=="RISK_DISCLOSED" else "## DISCLOSURE SAFE"
    disclosure=marker+BODY.decode().split(marker,1)[1].split("\n## ",1)[0].rstrip()
    item["evidence"]=[ref("comparison","current","main.sol",CURRENT_SOURCE),ref("comparison","candidate","main.sol",CANDIDATE_SOURCE)]
    for flag in ["storage_write_expansion","role_change","fund_movement","mint_or_burn","pause_or_freeze","upgrade_authority","delegatecall","external_call_expansion"]:
        if item[flag]:
            item["evidence"] += [ref(flag,"candidate","main.sol",CANDIDATE_SOURCE),ref(flag,"policy","policy",policy)]
            if item["disclosure_complete"]: item["evidence"].append(ref(flag,"disclosure","disclosure",disclosure))
    return json.dumps(item)

@pytest.fixture
def setup(direct_vm,direct_deploy,direct_alice,direct_bob):
    direct_vm.strict_mocks=True;direct_vm.check_pickling=True
    with direct_vm.prank(direct_alice): contract=direct_deploy("contracts/ImplGuardRelay.py")
    return direct_vm,contract,direct_alice,direct_bob

def prepare(vm,contract,sponsor,marker="## DISCLOSURE SAFE"):
    with vm.prank(sponsor):
        assert contract.register_protocol("vault",CURRENT,descriptor("## POLICY"))==0
        assert contract.propose_upgrade(0,CANDIDATE,descriptor(marker))==0
    mock_github(vm);mock_contract(vm,CURRENT,CURRENT_SOURCE);mock_contract(vm,CANDIDATE,CANDIDATE_SOURCE)
    assert contract.ground_sources(0)=="GROUNDED"

def test_safe_review_and_single_use_activation(setup):
    vm,contract,deployer,sponsor=setup;prepare(vm,contract,sponsor)
    vm.mock_llm(r"Compare the exact verified current.*",analysis())
    assert contract.review_upgrade(0)=="SAFE"
    with vm.prank(sponsor): assert contract.consume_activation(0)=="ACTIVATED"
    state=(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())
    with vm.prank(sponsor): assert contract.consume_activation(0)=="PERMIT_NOT_READY"
    assert state==(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())
    assert json.loads(contract.get_protocol(0))["current_implementation"]==CANDIDATE
    assert json.loads(contract.get_counts())["activated_count"]==1

def test_disclosed_risk_can_create_permit(setup):
    vm,contract,_,sponsor=setup;prepare(vm,contract,sponsor,"## DISCLOSURE RISK")
    vm.mock_llm(r"Compare the exact verified current.*",analysis("RISK_DISCLOSED","DISCLOSED_POLICY_ALLOWED",pause_or_freeze=True))
    assert contract.review_upgrade(0)=="RISK_DISCLOSED"
    assert json.loads(contract.get_proposal(0))["state"]=="PERMIT_READY"

def test_hidden_privilege_is_blocked(setup):
    vm,contract,_,sponsor=setup;prepare(vm,contract,sponsor,"## DISCLOSURE HIDDEN")
    vm.mock_llm(r"Compare the exact verified current.*",analysis("BLOCKED","UNDISCLOSED_PRIVILEGE_EXPANSION",fund_movement=True,disclosure_complete=False))
    assert contract.review_upgrade(0)=="BLOCKED"
    proposal=json.loads(contract.get_proposal(0));assert proposal["state"]=="BLOCKED"
    with vm.prank(sponsor): assert contract.consume_activation(0)=="PERMIT_NOT_READY"
    assert json.loads(contract.get_counts())["blocked_count"]==1

def test_malformed_positive_fails_closed(setup):
    vm,contract,_,sponsor=setup;prepare(vm,contract,sponsor)
    vm.mock_llm(r"Compare the exact verified current.*",analysis("SAFE","NO_PRIVILEGE_EXPANSION",delegatecall=True))
    assert contract.review_upgrade(0)=="INCONCLUSIVE"
    assert json.loads(contract.get_proposal(0))["state"]=="INCONCLUSIVE"

def test_wrong_actor_cannot_propose_or_consume(setup,direct_charlie):
    vm,contract,_,sponsor=setup
    with vm.prank(sponsor): assert contract.register_protocol("vault",CURRENT,descriptor("## POLICY"))==0
    before=(contract.get_protocol(0),contract.get_counts())
    with vm.prank(direct_charlie): assert contract.propose_upgrade(0,CANDIDATE,descriptor("## DISCLOSURE SAFE"))=="SPONSOR_ONLY"
    assert before==(contract.get_protocol(0),contract.get_counts())

@pytest.mark.parametrize("failure",["digest","unverified"])
def test_grounding_failure_does_not_advance(setup,failure):
    vm,contract,_,sponsor=setup
    bad=json.dumps({"owner":OWNER,"repo":REPO,"commit":COMMIT,"path":PATH,"digest":"0"*64,"marker":"## DISCLOSURE SAFE"}) if failure=="digest" else descriptor("## DISCLOSURE SAFE")
    with vm.prank(sponsor):
        contract.register_protocol("vault",CURRENT,descriptor("## POLICY"));contract.propose_upgrade(0,CANDIDATE,bad)
    mock_github(vm);mock_contract(vm,CURRENT,CURRENT_SOURCE);mock_contract(vm,CANDIDATE,CANDIDATE_SOURCE,verified=False)
    assert contract.ground_sources(0)=="SOURCE_UNVERIFIED"
    assert json.loads(contract.get_proposal(0))["state"]=="PROPOSED"
    assert json.loads(contract.get_ground(0))["error"]=="GROUND_NOT_FOUND"

def test_deployer_has_no_admin_power_and_reviewer_can_create_namespace(setup):
    vm,contract,deployer,reviewer=setup
    with vm.prank(reviewer): assert contract.register_protocol("reviewer-vault",CURRENT,descriptor("## POLICY"))==0
    protocol=json.loads(contract.get_protocol(0))
    assert protocol["sponsor"] == "0x" + reviewer.hex()
    assert protocol["sponsor"] != "0x" + deployer.hex()

def test_stale_sibling_cannot_activate(setup):
    vm,contract,_,sponsor=setup
    prepare(vm,contract,sponsor)
    with vm.prank(sponsor):
        assert contract.propose_upgrade(0,CANDIDATE,descriptor("## DISCLOSURE SAFE"))==1
    assert contract.ground_sources(1)=="GROUNDED"
    vm.mock_llm(r"Compare the exact verified current.*proposal_id must be 0\..*",analysis())
    assert contract.review_upgrade(0)=="SAFE"
    vm.mock_llm(r"Compare the exact verified current.*proposal_id must be 1\..*",analysis(proposal_id=1))
    assert contract.review_upgrade(1)=="SAFE"
    with vm.prank(sponsor):
        assert contract.consume_activation(0)=="ACTIVATED"
        before=(contract.get_protocol(0),contract.get_proposal(1),contract.get_counts())
        assert contract.consume_activation(1)=="STALE_BASE"
        assert before==(contract.get_protocol(0),contract.get_proposal(1),contract.get_counts())

def test_wrong_actor_cannot_consume_ready_permit(setup):
    vm,contract,deployer,sponsor=setup
    prepare(vm,contract,sponsor)
    vm.mock_llm(r"Compare the exact verified current.*",analysis())
    assert contract.review_upgrade(0)=="SAFE"
    before=(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())
    with vm.prank(deployer):
        assert contract.consume_activation(0)=="SPONSOR_ONLY"
    assert before==(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())

def test_invalid_inputs_and_unknown_ids(setup):
    vm,contract,_,sponsor=setup
    with vm.prank(sponsor):
        assert contract.register_protocol("x","0x1234",descriptor("## POLICY"))=="INVALID_PROTOCOL"
        assert contract.propose_upgrade(99,CANDIDATE,descriptor("## DISCLOSURE SAFE"))=="PROTOCOL_NOT_FOUND"
    assert contract.ground_sources(99)=="PROPOSAL_NOT_FOUND"

@pytest.mark.parametrize("mode",["missing_import","duplicate_path","oversize_bundle"])
def test_incomplete_or_ambiguous_bundle_fails_closed(setup,mode):
    vm,contract,_,sponsor=setup
    with vm.prank(sponsor):
        contract.register_protocol("bundle-check",CURRENT,descriptor("## POLICY"))
        contract.propose_upgrade(0,CANDIDATE,descriptor("## DISCLOSURE SAFE"))
    mock_github(vm)
    mock_contract(vm,CURRENT,CURRENT_SOURCE)
    source='import "./Admin.sol"; contract V2 is Admin {}'
    extras=[]
    if mode=="duplicate_path": extras=[{"file_path":"main.sol","source_code":"contract Fake {}"}]
    if mode=="oversize_bundle": extras=[{"file_path":"Admin.sol","source_code":"x"*33000},{"file_path":"Extra.sol","source_code":"x"*33000}]
    mock_contract(vm,CANDIDATE,source,additional_sources=extras)
    before=(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())
    assert contract.ground_sources(0)=="SOURCE_UNVERIFIED"
    assert before==(contract.get_protocol(0),contract.get_proposal(0),contract.get_counts())
    assert json.loads(contract.get_ground(0))["error"]=="GROUND_NOT_FOUND"

def test_inherited_privilege_is_included_in_grounded_digest(setup):
    vm,contract,_,sponsor=setup
    with vm.prank(sponsor):
        contract.register_protocol("bundle-check",CURRENT,descriptor("## POLICY"))
        contract.propose_upgrade(0,CANDIDATE,descriptor("## DISCLOSURE HIDDEN"))
    mock_github(vm)
    mock_contract(vm,CURRENT,CURRENT_SOURCE)
    admin='contract Admin { function emergencyWithdraw() external {} }'
    mock_contract(vm,CANDIDATE,'import "./Admin.sol"; contract V2 is Admin {}',additional_sources=[{"file_path":"Admin.sol","source_code":admin}])
    assert contract.ground_sources(0)=="GROUNDED"
    ground=json.loads(contract.get_ground(0))
    inventory=ground["candidate"]["source_files"]
    assert len(inventory)==2
    assert inventory[0]=={"path":"Admin.sol","sha256":sha(admin.encode())}
    result=json.loads(analysis("BLOCKED","UNDISCLOSED_PRIVILEGE_EXPANSION",fund_movement=True,disclosure_complete=False))
    vm.mock_llm(r"(?s)Compare the exact verified current.*emergencyWithdraw.*",json.dumps(result))
    assert contract.review_upgrade(0)=="BLOCKED"
