from pathlib import Path

ROOT=Path(__file__).parents[1]

def test_runner_and_no_privileged_constructor():
    source=(ROOT/"contracts/ImplGuardRelay.py").read_text()
    assert source.startswith("# v0.2.16")
    assert "gl.message.sender_address" in source
    assert "self.owner" not in source and "admin" not in source.lower()

def test_frontend_uses_genlayer_and_authoritative_readback():
    source=(ROOT/"frontend/src/main.jsx").read_text(encoding="utf-8")
    assert 'from"genlayer-js"' in source
    assert "waitForTransactionReceipt" in source and 'status:"FINALIZED"' in source
    assert "await refresh({...ids,required:true})" in source
    assert 'transaction.result_name!=="MAJORITY_AGREE"' in source
    assert 'leader?.execution_result!=="SUCCESS"' in source
    assert "VITE_CONTRACT_ADDRESS" in source

def test_logo_is_present():
    assert (ROOT/"frontend/public/implguard-logo.png").stat().st_size>1000
