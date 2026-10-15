import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { privateKeyToAccount } from "viem/accounts";
import { mkdirSync, writeFileSync } from "node:fs";

for (const name of ["TEST_WALLET_A_PRIVATE_KEY", "TEST_WALLET_B_PRIVATE_KEY", "CONTRACT_ADDRESS"])
  if (!process.env[name]) throw new Error(`Missing ${name}`);
const accounts = [process.env.TEST_WALLET_A_PRIVATE_KEY, process.env.TEST_WALLET_B_PRIVATE_KEY].map((key) => privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`));
const contract = process.env.CONTRACT_ADDRESS;
const client = createClient({ chain: studionet });
const writer = (account) => createClient({ chain: studionet, account });
const parse = async (name, args = []) => JSON.parse(await client.readContract({ address: contract, functionName: name, args }));
const transactions = [];
async function submit(account, functionName, args, label) {
  const hash = await writer(account).writeContract({ address: contract, functionName, args });
  console.log(`${label}_submitted: ${hash}`);
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 3000, retries: 160 });
  const tx = await client.getTransaction({ hash });
  transactions.push({ label, hash, actor: account.address, status: receipt.status_name || receipt.status, result_name: tx?.result_name || "FINALIZED", explorer_url: `https://explorer-studio.genlayer.com/transactions/${hash}` });
}
const fixture = { owner: "Azariavibecode", repo: "ImplGuard-Relay", commit: "9283e9f5797abb8ac72cade7b17496f89b412bfd", path: "/fixtures/upgrade-evidence.md", digest: "96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf" };
const before = await parse("get_counts");
const protocolId = BigInt(before.protocol_count), proposalId = BigInt(before.proposal_count);
await submit(accounts[0], "register_protocol", ["invalid-source-control", "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", JSON.stringify({ ...fixture, marker: "## POLICY" })], "register_protocol");
await submit(accounts[0], "propose_upgrade", [protocolId, "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c", JSON.stringify({ ...fixture, marker: "## DISCLOSURE SAFE", digest: "0".repeat(64) })], "propose_invalid_source");
await submit(accounts[1], "ground_sources", [proposalId], "ground_invalid_source");
const after = { proposal: await parse("get_proposal", [proposalId]), ground: await parse("get_ground", [proposalId]), counts: await parse("get_counts") };
if (after.proposal.state !== "PROPOSED" || after.proposal.verdict !== "PENDING" || after.ground.error !== "GROUND_NOT_FOUND") throw new Error("Invalid source advanced state");
if (after.counts.activated_count !== before.activated_count || after.counts.blocked_count !== before.blocked_count) throw new Error("Failure path changed consequential counters");
const report = { generated_at: new Date().toISOString(), network: "StudioNet", chain_id: 61999, contract, expected_before_execution: "SOURCE_UNVERIFIED; proposal remains PROPOSED/PENDING", before, after, transactions };
mkdirSync("verification/live", { recursive: true });
writeFileSync(`verification/live/proposal-${proposalId}-source-failure.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
