import { Contract, parseUnits } from "ethers";

export const PUFETH_ADDRESS = process.env.NEXT_PUBLIC_PUFETH as string;
export const WPUFETH_ADDRESS = process.env.NEXT_PUBLIC_WPUFETH as string;
export const TOKEN_LOCKER_ADDRESS = process.env
  .NEXT_PUBLIC_TOKEN_LOCKER as string;
export const DEPOSITER_ADDRESS = process.env.NEXT_PUBLIC_DEPOSITER as string;
export const LP_LOCKER_ADDRESS = process.env.NEXT_PUBLIC_LP_LOCKER as string;

export const checkApprove = async (
  tokenContract: Contract,
  owner: string,
  spender: string,
  amount: string,
  nonce: number,
  decimals?: number
) => {
  try {
    const amt = parseUnits(amount, decimals);
    const allowance: bigint = await tokenContract.allowance(owner, spender);

    if (amt <= allowance) {
      return;
    }
    // const gas = await tokenContract.approve.estimateGas(spender, amt);

    const needReset = amt > allowance && allowance !== 0n;
    if (needReset) {
      const resetTX = await tokenContract.approve(spender, 0, {
        // gasLimit: gas,
        nonce,
      });
      await resetTX.wait();
    }
    const tx = await tokenContract.approve(spender, amt, {
      // gasLimit: gas,
      nonce: needReset ? nonce + 1 : nonce,
    });
    await tx.wait();
  } catch (error) {
    console.log(error);
  }

  const newAllowance: bigint = await tokenContract.allowance(owner, spender);

  return newAllowance;
};

export const convertApi = async (
  contract: Contract,
  amount: string,
  decimals?: number
) => {
  const amt = parseUnits(amount, decimals);

  const gasLimit = await contract.deposit.estimateGas(amt);

  const tx = await contract.deposit(amt, { gasLimit });

  return tx;
};

export const convertBackApi = async (
  contract: Contract,
  amount: string,
  decimals?: number
) => {
  const amt = parseUnits(amount, decimals);

  const gasLimit = await contract.withdraw.estimateGas(amt);

  const tx = await contract.withdraw(amt, { gasLimit });

  return tx;
};

export const stakeApi = async (
  contract: Contract,
  userAccount: string,
  amount: string,
  time: number,
  decimals?: number
) => {
  const gasLimit = await contract.lockToken.estimateGas(
    userAccount,
    parseUnits(amount, decimals),
    time * 30 * 24 * 3600
  );

  const tx = await contract.lockToken(
    userAccount,
    parseUnits(amount, decimals),
    time * 30 * 24 * 3600,
    { gasLimit }
  );

  return tx;
};

export const convertAndStakeApi = async (
  contract: Contract,
  amount: string,
  time: number,
  decimals?: number
) => {
  const gasLimit = await contract.depositWithLock.estimateGas(
    parseUnits(amount, decimals),
    true,
    time * 30 * 24 * 3600
  );

  const tx = await contract.depositWithLock(
    parseUnits(amount, decimals),
    true,
    time * 30 * 24 * 3600,
    {
      gasLimit,
    }
  );

  return tx;
};

export const stakeLPApi = async (
  contract: Contract,
  userAccount: string,
  amount: string,
  decimals?: number
) => {
  const params = [userAccount, parseUnits(amount, decimals)];
  const gasLimit = await contract.stake.estimateGas(...params);
  const res = await contract.stake(...params, {
    gasLimit,
  });

  return res;
};

export const unstakeLPApi = async (
  contract: Contract,
  amount: string,
  claim: boolean,
  decimals?: number
) => {
  const params = [parseUnits(amount, decimals), claim];
  const gasLimit = await contract.withdraw.estimateGas(...params);
  const res = await contract.withdraw(...params, {
    gasLimit,
  });

  return res;
};
