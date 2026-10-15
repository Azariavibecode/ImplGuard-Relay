import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { privateKeyToAccount } from "viem/accounts";
import { mkdirSync, writeFileSync } from "node:fs";

for (const name of ["TEST_WALLET_A_PRIVATE_KEY", "TEST_WALLET_B_PRIVATE_KEY", "CONTRACT_ADDRESS"])
  if (!process.env[name]) throw new Error(`Missing ${name}`);

const accounts = [process.env.TEST_WALLET_A_PRIVATE_KEY, process.env.TEST_WALLET_B_PRIVATE_KEY]
  .map((key) => privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`));
if (accounts[0].address.toLowerCase() === accounts[1].address.toLowerCase()) throw new Error("Auxiliary wallets must differ");

const contract = process.env.CONTRACT_ADDRESS;
const currentImplementation = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const candidateImplementation = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
const fixture = { owner: "Azariavibecode", repo: "ImplGuard-Relay", commit: "9283e9f5797abb8ac72cade7b17496f89b412bfd", path: "/fixtures/upgrade-evidence.md", digest: "96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf" };
const reader = createClient({ chain: studionet });
const writer = (account) => createClient({ chain: studionet, account });
const parse = async (name, args = []) => JSON.parse(await reader.readContract({ address: contract, functionName: name, args }));
const transactions = [];

async function submit(account, functionName, args, label, allowDisagree = false) {
  let hash;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try { hash = await writer(account).writeContract({ address: contract, functionName, args }); break; }
    catch (error) { if (attempt === 5) throw error; await new Promise((resolve) => setTimeout(resolve, 5000)); }
  }
  console.log(`${label}_submitted: ${hash}`);
  const receipt = await reader.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 3000, retries: 160 });
  const tx = await reader.getTransaction({ hash });
  const result = tx?.result_name || "FINALIZED";
  if (!allowDisagree && !["MAJORITY_AGREE", "FINALIZED"].includes(result)) throw new Error(`${label}: ${result}`);
  transactions.push({ label, hash, actor: account.address, status: receipt.status_name || receipt.status, result_name: result, explorer_url: `https://explorer-studio.genlayer.com/transactions/${hash}` });
  return result;
}

const before = await parse("get_counts");
const protocolId = BigInt(before.protocol_count);
const proposalId = BigInt(before.proposal_count);
const policy = JSON.stringify({ ...fixture, marker: "## POLICY" });
const disclosure = JSON.stringify({ ...fixture, marker: "## DISCLOSURE SAFE" });

await submit(accounts[0], "register_protocol", ["circle-proxy-migration", currentImplementation, policy], "register_protocol");
await submit(accounts[0], "propose_upgrade", [protocolId, candidateImplementation, disclosure], "propose_upgrade");
await submit(accounts[1], "ground_sources", [proposalId], "ground_sources");
const grounded = await parse("get_ground", [proposalId]);
if (grounded.status !== "GROUNDED") throw new Error("Ground readback failed");

let proposal;
for (let attempt = 1; attempt <= 6; attempt += 1) {
  const result = await submit(accounts[1], "review_upgrade", [proposalId], `review_upgrade_${attempt}`, true);
  proposal = await parse("get_proposal", [proposalId]);
  if (result === "MAJORITY_AGREE" && proposal.state !== "GROUNDED") break;
  if (proposal.state !== "GROUNDED") throw new Error(`Unsafe review state after ${result}`);
}
if (!proposal || !["SAFE", "RISK_DISCLOSED"].includes(proposal.verdict) || proposal.state !== "PERMIT_READY")
  throw new Error(`Expected activation permit, got ${proposal?.state}/${proposal?.verdict}`);

await submit(accounts[0], "consume_activation", [proposalId], "consume_activation");
const terminalBefore = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [proposalId]), counts: await parse("get_counts") };
await submit(accounts[0], "consume_activation", [proposalId], "replay_activation");
const terminalAfter = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [proposalId]), counts: await parse("get_counts") };
if (JSON.stringify(terminalBefore) !== JSON.stringify(terminalAfter)) throw new Error("Replay mutated terminal state");
if (terminalAfter.protocol.current_implementation.toLowerCase() !== candidateImplementation.toLowerCase() || terminalAfter.protocol.revision !== 1 || terminalAfter.proposal.state !== "ACTIVATED") throw new Error("Activation readback mismatch");

const report = { generated_at: new Date().toISOString(), network: "StudioNet", chain_id: 61999, contract, wallets: { auxiliary_a: accounts[0].address, auxiliary_b: accounts[1].address }, immutable_fixture: fixture, public_contract_pair: { current: currentImplementation, candidate: candidateImplementation }, expected_before_execution: "SAFE or RISK_DISCLOSED, then single-use ACTIVATED", before, grounded, after: terminalAfter, transactions };
mkdirSync("verification/live", { recursive: true });
writeFileSync(`verification/live/proposal-${proposalId}.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
