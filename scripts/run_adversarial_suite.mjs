import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { privateKeyToAccount } from "viem/accounts";
import { mkdirSync, writeFileSync } from "node:fs";

for (const name of ["TEST_WALLET_A_PRIVATE_KEY", "TEST_WALLET_B_PRIVATE_KEY", "CONTRACT_ADDRESS"])
  if (!process.env[name]) throw new Error(`Missing ${name}`);
const [sponsor, adversary] = [process.env.TEST_WALLET_A_PRIVATE_KEY, process.env.TEST_WALLET_B_PRIVATE_KEY]
  .map((key) => privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`));
const contract = process.env.CONTRACT_ADDRESS;
const USDC_PROXY = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const EURC_PROXY = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const fixture = { owner: "Azariavibecode", repo: "ImplGuard-Relay", commit: "9283e9f5797abb8ac72cade7b17496f89b412bfd", path: "/fixtures/upgrade-evidence.md", digest: "96f84a7d4702aa46388664071d846330758b5944d70bf59db3aa57232caf1bdf" };
const descriptor = (marker) => JSON.stringify({ ...fixture, marker });
const reader = createClient({ chain: studionet });
const writer = (account) => createClient({ chain: studionet, account });
const parse = async (name, args = []) => JSON.parse(await reader.readContract({ address: contract, functionName: name, args }));
const allTransactions = [];

async function submit(account, functionName, args, label) {
  let hash;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try { hash = await writer(account).writeContract({ address: contract, functionName, args }); break; }
    catch (error) { if (attempt === 5) throw error; await new Promise((resolve) => setTimeout(resolve, 5000)); }
  }
  console.log(`${label}_submitted: ${hash}`);
  const receipt = await reader.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 3000, retries: 180 });
  const tx = await reader.getTransaction({ hash });
  const leader = tx?.consensus_data?.leader_receipt?.find((item) => item.mode === "leader");
  const item = { label, hash, actor: account.address, status: receipt.status_name || receipt.status, result_name: tx?.result_name || "FINALIZED", execution_result: leader?.execution_result, returned_value: leader?.result?.payload?.readable, explorer_url: `https://explorer-studio.genlayer.com/transactions/${hash}` };
  allTransactions.push(item);
  return item;
}

async function reviewUntilSettled(proposalId, label, attempts = 6) {
  const transactions = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    transactions.push(await submit(adversary, "review_upgrade", [proposalId], `${label}_${attempt}`));
    const proposal = await parse("get_proposal", [proposalId]);
    if (proposal.state !== "GROUNDED") return { proposal, transactions };
  }
  return { proposal: await parse("get_proposal", [proposalId]), transactions };
}

const suiteBefore = await parse("get_counts");
const cases = {};

// Hidden privilege expansion: proxy surface to a full token/admin implementation.
{
  const before = await parse("get_counts");
  const protocolId = BigInt(before.protocol_count), proposalId = BigInt(before.proposal_count);
  await submit(sponsor, "register_protocol", ["hidden-privilege-control", USDC_PROXY, descriptor("## POLICY")], "blocked_register");
  await submit(sponsor, "propose_upgrade", [protocolId, USDT, descriptor("## DISCLOSURE HIDDEN")], "blocked_propose");
  await submit(adversary, "ground_sources", [proposalId], "blocked_ground");
  const reviewed = await reviewUntilSettled(proposalId, "blocked_review");
  const after = { protocol: await parse("get_protocol", [protocolId]), proposal: reviewed.proposal, counts: await parse("get_counts") };
  if (after.proposal.state !== "BLOCKED" || after.proposal.verdict !== "BLOCKED" || after.counts.blocked_count !== before.blocked_count + 1) throw new Error(`Blocked path mismatch: ${after.proposal.state}/${after.proposal.verdict}`);
  cases.hidden_privilege = { expected: "BLOCKED with no permit", before, after, transactions: allTransactions.filter((tx) => tx.label.startsWith("blocked_")) };
}

// Permission checks, exact pre/post equality, stale sibling permit, and terminal replay.
{
  const before = await parse("get_counts");
  const protocolId = BigInt(before.protocol_count);
  await submit(sponsor, "register_protocol", ["stale-base-control", USDC_PROXY, descriptor("## POLICY")], "stale_register");
  const unauthorizedBefore = { protocol: await parse("get_protocol", [protocolId]), counts: await parse("get_counts") };
  await submit(adversary, "propose_upgrade", [protocolId, EURC_PROXY, descriptor("## DISCLOSURE SAFE")], "wrong_actor_propose");
  const unauthorizedAfter = { protocol: await parse("get_protocol", [protocolId]), counts: await parse("get_counts") };
  if (JSON.stringify(unauthorizedBefore) !== JSON.stringify(unauthorizedAfter)) throw new Error("Wrong-actor proposal mutated state");

  const firstId = BigInt(unauthorizedAfter.counts.proposal_count);
  await submit(sponsor, "propose_upgrade", [protocolId, EURC_PROXY, descriptor("## DISCLOSURE SAFE")], "stale_propose_first");
  const secondId = firstId + 1n;
  await submit(sponsor, "propose_upgrade", [protocolId, EURC_PROXY, descriptor("## DISCLOSURE SAFE")], "stale_propose_second");
  await submit(adversary, "ground_sources", [firstId], "stale_ground_first");
  await submit(adversary, "ground_sources", [secondId], "stale_ground_second");
  const firstReview = await reviewUntilSettled(firstId, "stale_review_first");
  const secondReview = await reviewUntilSettled(secondId, "stale_review_second");
  if (firstReview.proposal.state !== "PERMIT_READY" || secondReview.proposal.state !== "PERMIT_READY") throw new Error("Safe sibling proposals did not both reach PERMIT_READY");

  const wrongConsumeBefore = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [firstId]), counts: await parse("get_counts") };
  await submit(adversary, "consume_activation", [firstId], "wrong_actor_consume");
  const wrongConsumeAfter = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [firstId]), counts: await parse("get_counts") };
  if (JSON.stringify(wrongConsumeBefore) !== JSON.stringify(wrongConsumeAfter)) throw new Error("Wrong-actor consume mutated state");

  await submit(sponsor, "consume_activation", [firstId], "stale_consume_first");
  const staleBefore = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [secondId]), counts: await parse("get_counts") };
  await submit(sponsor, "consume_activation", [secondId], "stale_consume_second");
  const staleAfter = { protocol: await parse("get_protocol", [protocolId]), proposal: await parse("get_proposal", [secondId]), counts: await parse("get_counts") };
  if (JSON.stringify(staleBefore) !== JSON.stringify(staleAfter) || staleAfter.proposal.state !== "PERMIT_READY") throw new Error("Stale sibling mutation or unexpected state");

  const replayBefore = { proposal: await parse("get_proposal", [firstId]), counts: await parse("get_counts") };
  await submit(adversary, "review_upgrade", [firstId], "terminal_review_replay");
  const replayAfter = { proposal: await parse("get_proposal", [firstId]), counts: await parse("get_counts") };
  if (JSON.stringify(replayBefore) !== JSON.stringify(replayAfter)) throw new Error("Terminal review replay mutated state");

  cases.authorization_and_stale_base = { expected: "wrong actors and stale/replayed operations finalize without mutation", before, unauthorized: { before: unauthorizedBefore, after: unauthorizedAfter }, wrong_consume: { before: wrongConsumeBefore, after: wrongConsumeAfter }, stale_sibling: { before: staleBefore, after: staleAfter }, terminal_review_replay: { before: replayBefore, after: replayAfter }, transactions: allTransactions.filter((tx) => ["wrong_actor_propose", "wrong_actor_consume", "terminal_review_replay"].includes(tx.label) || tx.label.startsWith("stale_")) };
}

// Ambiguous disclosure: preserve either a fail-closed terminal result or conflict-safe GROUNDED state.
{
  const before = await parse("get_counts");
  const protocolId = BigInt(before.protocol_count), proposalId = BigInt(before.proposal_count);
  await submit(sponsor, "register_protocol", ["ambiguous-control", USDC_PROXY, descriptor("## POLICY")], "ambiguous_register");
  await submit(sponsor, "propose_upgrade", [protocolId, USDT, descriptor("## DISCLOSURE AMBIGUOUS")], "ambiguous_propose");
  await submit(adversary, "ground_sources", [proposalId], "ambiguous_ground");
  const reviewed = await reviewUntilSettled(proposalId, "ambiguous_review", 6);
  const after = { proposal: reviewed.proposal, counts: await parse("get_counts") };
  const safeFailure = ["BLOCKED", "INCONCLUSIVE"].includes(after.proposal.state) || (after.proposal.state === "GROUNDED" && after.proposal.verdict === "PENDING");
  if (!safeFailure || after.proposal.state === "PERMIT_READY") throw new Error(`Ambiguous evidence produced unsafe state ${after.proposal.state}`);
  cases.ambiguous_or_conflict = { expected: "BLOCKED/INCONCLUSIVE, or GROUNDED/PENDING after validator disagreement; never PERMIT_READY", before, after, conflict_observed: reviewed.transactions.some((tx) => tx.result_name === "MAJORITY_DISAGREE"), transactions: allTransactions.filter((tx) => tx.label.startsWith("ambiguous_")) };
}

const report = { generated_at: new Date().toISOString(), network: "StudioNet", chain_id: 61999, contract, wallets: { sponsor: sponsor.address, adversary: adversary.address }, fixture, suite_before: suiteBefore, suite_after: await parse("get_counts"), cases };
mkdirSync("verification/live", { recursive: true });
writeFileSync("verification/live/adversarial-suite.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
