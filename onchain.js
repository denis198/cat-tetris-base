// Onchain actions for Cat Tetris: Tip jar + Daily tournament
// Requires ethers v5 (loaded from CDN) and a wallet provider (Base App / MetaMask).

// Deployed CatTetrisTournament contract on Base
const TOURNAMENT_ADDRESS = "0x077BE7ACb28996705d5aC7BCCE54005D3861cdB2";

// Defaults (ETH amounts)
const TIP_ETH = "0.0005";
const ENTRY_FEE_ETH = "0.0001";

const ABI = [
  "function entryFee() view returns (uint256)",
  "function currentDay() view returns (uint256)",
  "function dayInfo(uint256) view returns (address leader, uint256 bestScore, uint256 prizePool)",
  "function tip() payable",
  "function enterTournament(uint256 score) payable",
];

function el(id) { return document.getElementById(id); }

function formatEth(wei) {
  try { return window.ethers.utils.formatEther(wei); } catch { return "0"; }
}

async function getProvider() {
  if (!window.ethereum) throw new Error("No wallet provider found");
  const provider = new window.ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  return provider;
}

async function getContract(readOnly = false) {
  if (!window.ethers) throw new Error("ethers not loaded");
  if (!TOURNAMENT_ADDRESS || /^0x0{40}$/i.test(TOURNAMENT_ADDRESS)) {
    throw new Error("Set TOURNAMENT_ADDRESS in onchain.js after deploying contract");
  }
  const provider = await getProvider();
  const signerOrProvider = readOnly ? provider : provider.getSigner();
  return new window.ethers.Contract(TOURNAMENT_ADDRESS, ABI, signerOrProvider);
}

async function refreshTournamentUI() {
  try {
    const contract = await getContract(true);
    const dayId = await contract.currentDay();
    const info = await contract.dayInfo(dayId);
    const fee = await contract.entryFee();

    el("t-day") && (el("t-day").textContent = dayId.toString());
    el("t-fee") && (el("t-fee").textContent = `${formatEth(fee)} ETH`);
    el("t-pool") && (el("t-pool").textContent = `${formatEth(info.prizePool)} ETH`);
    el("t-best") && (el("t-best").textContent = info.bestScore.toString());
    el("t-leader") && (el("t-leader").textContent = info.leader && info.leader !== window.ethers.constants.AddressZero ? info.leader : "—");
  } catch (e) {
    // If not configured yet, keep UI quiet.
    console.log("[onchain] refresh skipped:", e.message || e);
  }
}

async function doTip() {
  const contract = await getContract(false);
  const value = window.ethers.utils.parseEther(TIP_ETH);
  const tx = await contract.tip({ value });
  el("tx-status") && (el("tx-status").textContent = `Tip tx: ${tx.hash}`);
  await tx.wait();
  el("tx-status") && (el("tx-status").textContent = "Tip confirmed ✅");
  await refreshTournamentUI();
}

async function doEnterTournament() {
  const score = window.game ? window.game.score : 0;
  if (!score || score <= 0) {
    alert("Сначала набери очки (score), потом входи в турнир.");
    return;
  }
  const contract = await getContract(false);
  const value = window.ethers.utils.parseEther(ENTRY_FEE_ETH);
  const tx = await contract.enterTournament(score, { value });
  el("tx-status") && (el("tx-status").textContent = `Enter tx: ${tx.hash}`);
  await tx.wait();
  el("tx-status") && (el("tx-status").textContent = "Tournament entry confirmed ✅");
  await refreshTournamentUI();
}

function bindOnchainButtons() {
  el("btn-tip")?.addEventListener("click", () => doTip().catch((e) => alert(e.message || e)));
  el("btn-enter-tournament")?.addEventListener("click", () => doEnterTournament().catch((e) => alert(e.message || e)));
  refreshTournamentUI();
  setInterval(refreshTournamentUI, 10_000);
}

window.addEventListener("load", () => {
  bindOnchainButtons();
});

