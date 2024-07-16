import { Contract, parseUnits } from "ethers";

export const checkApprove = async (
  tokenContract: Contract,
  owner: string,
  spender: string,
  amount: string,
  decimals?: number
) => {
  try {
    const amt = parseUnits(amount, decimals);
    const allowance: bigint = await tokenContract.allowance(owner, spender);

    if (amt <= allowance) {
      return;
    }
    if (amt > allowance && allowance !== 0n) {
      const resetTX = await tokenContract.approve(spender, 0);
      await resetTX.wait();
    }
    const tx = await tokenContract.approve(spender, amt);
    await tx.wait();
  } catch (error) {
    console.log(error);
  }

  const newAllowance: bigint = await tokenContract.allowance(owner, spender);

  return newAllowance;
};
