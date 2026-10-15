# Source bundle audit and required redeployment

Update: the corrected source has been redeployed at `0xF0271b6665c436638274229A6768b1dA4c950a33`. Its source was fetched through `gen_getContractCode` and exactly matches the local file. Fresh v2 evidence is stored in `verification/live/v2/`; historical findings and v1 results below remain preserved.

## Finding

The deployed v1 contract at `0x11aA1f375b2765Bf7757Ca3eB554c6dEF0F127f7` acquired only Blockscout's primary `source_code`. A verified contract can import inherited code from `additional_sources`. The v1 semantic review therefore did not always receive a complete implementation artifact.

The candidate fixture `0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c` has a 1,568-character primary source that imports `AdminUpgradeabilityProxy.sol`. The explorer also supplies four additional verified files: `AdminUpgradeabilityProxy.sol`, `Proxy.sol`, `UpgradeabilityProxy.sol`, and `@openzeppelin/contracts/utils/Address.sol`. This is direct evidence of the gap; source verification and matching ABI do not establish semantic completeness.

Severity: release blocking. Earlier v1 happy-path evidence establishes the registry transitions, but cannot establish a complete-source semantic safety conclusion.

## Fix prepared in contracts/ImplGuardRelay.py

- Collect primary plus all explorer-provided additional sources.
- Reject duplicate paths, malformed entries, oversized bundles, and unresolved imports.
- Canonically order the complete bundle and bind its aggregate SHA-256.
- Preserve per-file path/digest inventory in public ground readback.
- Supply the complete bundle, including inherited functions, to the semantic review.

Regression tests call the real public registration/proposal/ground/review methods. They prove missing imports, duplicate paths and excessive source size leave protocol/proposal/counters unchanged, and inherited withdrawal code reaches the semantic prompt and can yield `BLOCKED`.

## Deployment boundary

The current source file contains this fix and **requires a fresh deployment**. The old deployed source is preserved at Git commit `88d38a19f876d35a2832a73ebe7a90b724be7c1d` and earlier commits. Existing v1 transaction evidence must not be described as live testing of the corrected bundle acquisition.

After deploying the corrected contract, update the frontend address, rerun the live suite against the new address, and preserve fresh source-bundle inventories and transaction readbacks before submission.
