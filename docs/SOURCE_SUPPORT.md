# Supported evidence scope

The replacement revision reviews direct Solidity source artifacts associated by Ethereum Blockscout with the exact requested addresses. It does not resolve proxy implementations or attest execution at a historical block. Both identity fields `proxy_type=null` and `implementations=[]` must be explicitly present. Nonempty or unknown proxy metadata fails grounding. Proxy-named contracts, delegation/callcode, fallback dispatch and assembly are rejected conservatively in every source file, including matching words in comments or literals. This intentional over-rejection avoids treating a regular-expression comment stripper as a Solidity parser.

Source acquisition limits:

| Boundary | Maximum |
|---|---|
| Explorer identity response | 24,000 bytes |
| Explorer source response | 100,000 bytes |
| Files including primary | 32 |
| Individual Solidity source | 42,000 characters |
| Aggregate Solidity source | 64,000 characters |
| ABI entries | 180 |
| Additional-source path | 500 characters |
| GitHub raw policy/disclosure file | 30,000 bytes |
| Extracted policy/disclosure section | 6,000 characters |
| Finding references | 24 |
| Exact quote per reference | 12–600 characters |

Relative imports resolve against the importing file with POSIX normalization. Package imports must already match an exact path in the explorer bundle. Duplicate paths, missing imports, oversized responses/bundles and unsupported metadata fail closed. Compiler remappings, external import fetching, Yul/assembly and proxy runtime resolution are outside this release's supported evidence scope. Large projects are not partially reviewed and are never labeled complete after truncation.

The normative policy is exactly one `implguard-policy` fenced JSON object with all eight known categories and values DENY or ALLOW_DISCLOSED. ALLOW_DISCLOSED requires complete disclosure and no unknown effects. Code checks DENY after semantic consensus. Authenticated prose remains part of the validator evidence, but cannot override a machine DENY rule.

References preserve exact category, side, path, file/section SHA-256 and source quote. The deterministic checks establish membership and integrity; independent comparative validators must establish relevance and complete coverage of material privilege changes. This is semantic source review, not a proof that a source contains no possible vulnerability, a storage-layout certification or an Ethereum execution authorization.
